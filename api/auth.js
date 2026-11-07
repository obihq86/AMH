import {
  checkLoginLimit,
  createSession,
  getRequestBody,
  getAuthConfig,
  hasValidSession,
  ipHash,
  recordLoginAttempt,
  sendJson,
  sessionCookie,
  verifyPin
} from '../server/clinic-server.js';

export default async function handler(req, res) {
  if (!['GET', 'POST', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST, DELETE');
    return sendJson(res, 405, { error: 'Method not allowed.' });
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', sessionCookie('', 0));
    return sendJson(res, 200, { authenticated: false });
  }

  try {
    const config = getAuthConfig();
    if (req.method === 'GET') {
      const authenticated = hasValidSession(req, config.sessionSecret);
      return sendJson(res, 200, { authenticated });
    }

    const body = getRequestBody(req);
    const pin = typeof body.pin === 'string' ? body.pin : '';
    const hashedIp = ipHash(req, config.sessionSecret);
    const limit = await checkLoginLimit(config, hashedIp);
    if (!limit.allowed) {
      res.setHeader('Retry-After', String(limit.retry_after_seconds || 900));
      return sendJson(res, 429, { error: 'অনেকবার ভুল চেষ্টা হয়েছে। ১৫ মিনিট পরে আবার চেষ্টা করুন।' });
    }

    const authenticated = verifyPin(pin, config.pinHash);
    await recordLoginAttempt(config, hashedIp, authenticated);
    if (!authenticated) return sendJson(res, 401, { error: '৮ অঙ্কের পাসওয়ার্ডটি সঠিক নয়।' });

    res.setHeader('Set-Cookie', sessionCookie(createSession(config.sessionSecret)));
    return sendJson(res, 200, { authenticated: true });
  } catch (error) {
    console.error('Clinic authentication API failed:', error);
    return sendJson(res, 503, { error: 'নিরাপদ লগইন এখন প্রস্তুত নয়। সেটআপ সম্পন্ন হলে আবার চেষ্টা করুন।' });
  }
}
