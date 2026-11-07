type ClinicSnapshot = {
  payload: Record<string, unknown> | null;
  updatedAt: number;
};

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    credentials: 'same-origin',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers
    }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof body.error === 'string' ? body.error : 'সার্ভার অনুরোধ সম্পন্ন হয়নি।');
  }
  return body as T;
}

export async function readClinicSnapshot(roomId: string): Promise<ClinicSnapshot> {
  const query = new URLSearchParams({ roomId });
  const result = await requestJson<ClinicSnapshot>(`/api/clinic-state?${query}`);
  return {
    payload: result.payload,
    updatedAt: Number(result.updatedAt) || 0
  };
}

export async function readClinicState(roomId: string) {
  const snapshot = await readClinicSnapshot(roomId);
  return snapshot.payload;
}

export async function writeClinicState(roomId: string, payload: Record<string, unknown>) {
  await requestJson('/api/clinic-state', {
    method: 'PUT',
    body: JSON.stringify({ roomId, payload })
  });
}
