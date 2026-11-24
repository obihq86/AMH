import { scryptSync, createHmac, timingSafeEqual } from 'node:crypto';

const SESSION_COOKIE = 'amh_clinic_session';
const SESSION_SECONDS = 12 * 60 * 60;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

function signature(value, secret) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function safeEqual(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function verifyPin(pin, encodedHash) {
  const [algorithm, salt, expected] = encodedHash.split('$');
  if (algorithm !== 'scrypt' || !salt || !expected || !/^\d{8}$/.test(pin)) return false;
  const expectedBytes = Buffer.from(expected, 'base64url');
  if (expectedBytes.length !== 64) return false;
  const actual = scryptSync(pin, Buffer.from(salt, 'base64url'), 64);
  return timingSafeEqual(actual, expectedBytes);
}

function parseCookies(header = '') {
  return Object.fromEntries(header.split(';').map((part) => {
    const index = part.indexOf('=');
    if (index < 0) return ['', ''];
    return [part.slice(0, index).trim(), part.slice(index + 1).trim()];
  }).filter(([key]) => key));
}

function hasValidSession(request, secret) {
  const token = parseCookies(request.headers.get('cookie'))[SESSION_COOKIE];
  if (!token) return false;
  const [payload, suppliedSignature] = token.split('.');
  if (!payload || !suppliedSignature || !safeEqual(signature(payload, secret), suppliedSignature)) return false;
  try {
    const value = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Number.isInteger(value.exp) && value.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export const onRequest = async (context) => {
  const { request, env, params } = context;
  const route = params.path?.[0];

  const config = {
    baseUrl: env.SUPABASE_URL.replace(/\/+$/, ''),
    serviceKey: env.SUPABASE_SERVICE_ROLE_KEY,
    sessionSecret: env.CLINIC_SESSION_SECRET,
    pinHash: env.CLINIC_PIN_HASH,
  };

  if (route === 'auth') {
    if (!['GET', 'POST', 'DELETE'].includes(request.method)) return json({ error: 'Method not allowed' }, 405);
    if (request.method === 'DELETE') {
      return json({ authenticated: false }, 200, { 'Set-Cookie': `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0` });
    }
    if (request.method === 'GET') {
      return json({ authenticated: hasValidSession(request, config.sessionSecret) });
    }
    const body = await request.json();
    if (!verifyPin(body.pin, config.pinHash)) return json({ error: 'Invalid PIN' }, 401);
    const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
    const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url');
    const token = `${payload}.${signature(payload, config.sessionSecret)}`;
    return json({ authenticated: true }, 200, { 'Set-Cookie': `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_SECONDS}` });
  }

  if (route === 'clinic-state') {
    if (!['GET', 'PUT'].includes(request.method)) return json({ error: 'Method not allowed' }, 405);
    const url = new URL(request.url);
    const roomId = request.method === 'GET' ? url.searchParams.get('roomId') : (await request.json()).roomId;
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(roomId)) return json({ error: 'Invalid room' }, 400);

    if (request.method === 'GET') {
      const isCheckOnly = url.searchParams.get('checkOnly') === 'true';
      const q = new URLSearchParams({ select: isCheckOnly ? 'updated_at' : 'payload,updated_at', room_id: `eq.${roomId}`, limit: '1' });
      const resp = await fetch(`${config.baseUrl}/rest/v1/clinic_sync_state?${q}`, {
        headers: { apikey: config.serviceKey, Authorization: `Bearer ${config.serviceKey}` }
      });
      const rows = await resp.json();
      return json({ payload: isCheckOnly ? null : (rows[0]?.payload ?? null), updatedAt: Number(rows[0]?.updated_at) || 0 });
    }

    const body = await request.json();
    const payload = body.payload;
    const updatedAt = Number(payload.updatedAt) || Date.now();
    await fetch(`${config.baseUrl}/rest/v1/clinic_sync_state?on_conflict=room_id`, {
      method: 'POST',
      headers: { apikey: config.serviceKey, Authorization: `Bearer ${config.serviceKey}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({ room_id: roomId, payload, updated_at: updatedAt })
    });
    return json({ saved: true });
  }

  return json({ error: 'Not found' }, 404);
};
