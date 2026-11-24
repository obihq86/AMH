// Cloudflare Pages Functions catch-all for /api/*
// Migrated from netlify/functions/api.mjs — routes to ../../api/<route>.js

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

export const onRequest = async (context) => {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const route = url.pathname.replace(/^\/api\//, '').replace(/\/+$/, '');

  // Cloudflare env → process.env shim so existing api/*.js handlers
  // (which read process.env.SUPABASE_URL etc.) keep working.
  if (typeof process === 'undefined') globalThis.process = { env: {} };
  const envMap = {
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
    CLINIC_SESSION_SECRET: env.CLINIC_SESSION_SECRET,
    CLINIC_PIN_HASH: env.CLINIC_PIN_HASH,
    CLINIC_LOGIN_RATE_LIMIT: env.CLINIC_LOGIN_RATE_LIMIT,
  };
  Object.assign(process.env, envMap);

  let handlerModule;
  try {
    handlerModule = await import(`../../api/${route}.js`);
  } catch {
    try {
      handlerModule = await import(`../../api/${route}/index.js`);
    } catch {
      return json({ error: 'API route not found' }, 404);
    }
  }

  const handler = handlerModule.default;
  if (typeof handler !== 'function') {
    return json({ error: 'API route has no default handler' }, 500);
  }

  const contentType = request.headers.get('content-type') || '';
  let bodyText = '';
  let bodyParsed = undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      bodyText = await request.text();
    } catch { bodyText = ''; }
    if (bodyText) {
      try {
        bodyParsed = JSON.parse(bodyText);
      } catch {
        bodyParsed = bodyText;
      }
    }
  }

  const headers = Object.fromEntries(request.headers.entries());

  // Node-style request shim — keeps the existing api/*.js handlers working unchanged.
  const req = {
    method: request.method,
    url: url.pathname + url.search,
    headers: { ...headers, host: url.host, origin: `${url.protocol}//${url.host}` },
    query: Object.fromEntries(url.searchParams.entries()),
    env,
    request,
    body: bodyParsed,
    text: () => Promise.resolve(bodyText),
    arrayBuffer: () => request.arrayBuffer(),
    json: () => Promise.resolve(bodyParsed),
    socket: {
      remoteAddress: request.headers.get('cf-connecting-ip')
        || request.headers.get('x-real-ip')
        || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || '',
    },
  };

  // Node-style response shim.
  let statusCode = 200;
  const resHeaders = {};
  let responded = false;

  const finish = (body, extraHeaders = {}) => {
    if (responded) return;
    responded = true;
    const finalHeaders = { ...resHeaders, ...extraHeaders };
    return new Response(body, { status: statusCode, headers: finalHeaders });
  };

  const res = {
    status(code) { statusCode = code; return res; },
    statusCode,
    setHeader(k, v) { resHeaders[String(k).toLowerCase()] = v; return res; },
    getHeader(k) { return resHeaders[String(k).toLowerCase()]; },
    set(k, v) { return res.setHeader(k, v); },
    json(data) {
      if (!resHeaders['content-type']) resHeaders['content-type'] = 'application/json; charset=utf-8';
      return finish(JSON.stringify(data));
    },
    send(data) {
      const body = data !== null && typeof data === 'object' && !Buffer.isBuffer?.(data)
        ? JSON.stringify(data)
        : String(data ?? '');
      return finish(body);
    },
    end(data) {
      return finish(data === undefined || data === null ? '' : String(data));
    },
  };

  try {
    const result = await handler(req, res);
    if (responded) return result;
    if (result instanceof Response) return result;
    return finish(JSON.stringify({ ok: true }));
  } catch (err) {
    return json({ error: err?.message || 'Server error' }, 500);
  }
};