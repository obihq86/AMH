import { createHmac, scryptSync, timingSafeEqual } from 'node:crypto';

const SESSION_COOKIE = 'amh_clinic_session';
const SESSION_SECONDS = 12 * 60 * 60;

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing server environment variable: ${name}`);
  return value;
}

export function getServerConfig() {
  const baseUrl = requiredEnv('SUPABASE_URL').replace(/\/+$/, '');
  const serviceKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
  const sessionSecret = requiredEnv('CLINIC_SESSION_SECRET');
  const pinHash = requiredEnv('CLINIC_PIN_HASH');
  if (!/^https:\/\/[^/]+$/i.test(baseUrl)) throw new Error('SUPABASE_URL must be an HTTPS project URL.');
  if (Buffer.byteLength(sessionSecret) < 32) throw new Error('CLINIC_SESSION_SECRET must be at least 32 bytes.');
  return { baseUrl, serviceKey, sessionSecret, pinHash };
}

function signature(value, secret) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function safeEqual(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function verifyPin(pin, encodedHash) {
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

export function createSession(secret) {
  const payload = Buffer.from(JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS
  })).toString('base64url');
  return `${payload}.${signature(payload, secret)}`;
}

export function hasValidSession(req, secret) {
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
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

export function sessionCookie(token, maxAge = SESSION_SECONDS) {
  return `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}

export function ipHash(req, secret) {
  const realIp = req.headers['x-real-ip'];
  const forwarded = req.headers['x-forwarded-for'];
  const address = (typeof realIp === 'string' ? realIp : '')
    .trim()
    || (typeof forwarded === 'string' ? forwarded.split(',')[0] : '').trim()
    || req.socket?.remoteAddress
    || '';
  if (!address) throw new Error('Could not determine request address for login rate limiting.');
  return createHmac('sha256', secret).update(address).digest('hex');
}

export async function callSupabase(config, path, init = {}) {
  const response = await fetch(`${config.baseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.serviceKey,
      Authorization: `Bearer ${config.serviceKey}`,
      'Content-Type': 'application/json',
      ...init.headers
    }
  });
  if (!response.ok) {
    const detail = await response.text();
    console.error(`Supabase server request failed (${response.status}):`, detail);
    throw new Error('Supabase server request failed.');
  }
  return response;
}

export async function checkLoginLimit(config, hashedIp) {
  const response = await callSupabase(config, 'rpc/check_clinic_login_limit', {
    method: 'POST',
    body: JSON.stringify({ p_ip_hash: hashedIp })
  });
  const result = await response.json();
  const row = Array.isArray(result) ? result[0] : result;
  return row || { allowed: false, retry_after_seconds: 900 };
}

export async function recordLoginAttempt(config, hashedIp, success) {
  await callSupabase(config, 'rpc/record_clinic_login_attempt', {
    method: 'POST',
    body: JSON.stringify({ p_ip_hash: hashedIp, p_success: success })
  });
}

export function sendJson(res, status, value) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(value));
}

export function getRequestBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const raw = typeof req.body === 'string' ? req.body : '';
  return raw ? JSON.parse(raw) : {};
}
