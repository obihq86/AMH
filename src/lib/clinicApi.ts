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
    if (response.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('clinic-session-expired'));
    }
    throw new Error(typeof body.error === 'string' ? body.error : 'নিরাপদ সার্ভার অনুরোধ সম্পন্ন হয়নি।');
  }
  return body as T;
}

export async function checkClinicSession() {
  const result = await requestJson<{ authenticated: boolean }>('/api/auth');
  return result.authenticated;
}

export async function verifyClinicAccess() {
  const authenticated = await checkClinicSession();
  if (!authenticated) throw new Error('লগইন সেশন শেষ হয়েছে। আবার প্রবেশ করুন।');
}

export async function authenticateClinicPin(pin: string) {
  await requestJson('/api/auth', {
    method: 'POST',
    body: JSON.stringify({ pin })
  });
}

export async function signOutClinic() {
  await requestJson('/api/auth', { method: 'DELETE' });
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
