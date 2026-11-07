import {
  callSupabase,
  getRequestBody,
  getServerConfig,
  hasValidSession,
  sendJson
} from '../server/clinic-server.js';

function validRoomId(value) {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(value);
}

export default async function handler(req, res) {
  if (!['GET', 'PUT'].includes(req.method)) {
    res.setHeader('Allow', 'GET, PUT');
    return sendJson(res, 405, { error: 'Method not allowed.' });
  }

  try {
    const config = getServerConfig();
    if (!hasValidSession(req, config.sessionSecret)) {
      return sendJson(res, 401, { error: 'লগইন সেশন শেষ হয়েছে। আবার প্রবেশ করুন।' });
    }
    if (Number(req.headers['content-length']) > 4_000_000) {
      return sendJson(res, 413, { error: 'Clinic state is too large to save.' });
    }

    const body = req.method === 'PUT' ? getRequestBody(req) : null;
    const roomId = req.method === 'GET' ? req.query?.roomId : body?.roomId;
    if (!validRoomId(roomId)) return sendJson(res, 400, { error: 'Invalid room identifier.' });

    if (req.method === 'GET') {
      const query = new URLSearchParams({
        select: 'payload,updated_at',
        room_id: `eq.${roomId}`,
        limit: '1'
      });
      const response = await callSupabase(config, `clinic_sync_state?${query}`);
      const rows = await response.json();
      const row = rows[0];
      return sendJson(res, 200, {
        payload: row?.payload ?? null,
        updatedAt: Number(row?.updated_at) || 0
      });
    }

    const payload = body.payload;
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return sendJson(res, 400, { error: 'Invalid clinic state payload.' });
    }
    if (Buffer.byteLength(JSON.stringify(payload), 'utf8') > 4_000_000) {
      return sendJson(res, 413, { error: 'Clinic state is too large to save.' });
    }
    const updatedAt = Number(payload.updatedAt) || Date.now();
    await callSupabase(config, 'clinic_sync_state?on_conflict=room_id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ room_id: roomId, payload, updated_at: updatedAt })
    });
    return sendJson(res, 200, { saved: true });
  } catch (error) {
    console.error('Clinic state API failed:', error);
    return sendJson(res, 503, { error: 'ক্লাউড ডেটাবেসে সংযোগ করা যায়নি।' });
  }
}
