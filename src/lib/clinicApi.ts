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

  // যদি 404 আসে, তবে আমরা এটিকে একটি নির্দিষ্ট এরর হিসেবে থ্রো করব
  if (response.status === 404) {
    throw new Error('API_NOT_FOUND');
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof body.error === 'string' ? body.error : 'সার্ভার অনুরোধ সম্পন্ন হয়নি।');
  }
  return body as T;
}

export async function readClinicSnapshot(roomId: string, checkOnly = false): Promise<ClinicSnapshot> {
  const query = new URLSearchParams({ roomId, checkOnly: String(checkOnly) });
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
