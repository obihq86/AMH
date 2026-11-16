import { Readable } from 'node:stream';

export default async (request) => {
  const url = new URL(request.url);
  const route = url.pathname.replace(/^\/api\//, '').replace(/^\/\.netlify\/functions\/api\/?/, '');

  let handlerModule;
  try {
    handlerModule = await import(`../../api/${route}.js`);
  } catch {
    try {
      handlerModule = await import(`../../api/${route}/index.js`);
    } catch {
      return new Response(JSON.stringify({ error: 'API route not found' }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      });
    }
  }

  const handler = handlerModule.default;
  const bodyBuffer = request.body ? Buffer.from(await request.arrayBuffer()) : Buffer.alloc(0);

  const req = Readable.from(bodyBuffer.length ? [bodyBuffer] : []);
  req.method = request.method;
  req.url = url.pathname + url.search;
  req.headers = Object.fromEntries(request.headers.entries());
  req.query = Object.fromEntries(url.searchParams.entries());
  if (bodyBuffer.length) {
    try {
      req.body = JSON.parse(bodyBuffer.toString('utf8'));
    } catch {
      req.body = bodyBuffer.toString('utf8');
    }
  }

  return await new Promise((resolve) => {
    let statusCode = 200;
    const headers = {};
    const chunks = [];

    const res = {
      status(code) {
        statusCode = code;
        return res;
      },
      setHeader(k, v) {
        headers[k.toLowerCase()] = v;
        return res;
      },
      getHeader(k) {
        return headers[k.toLowerCase()];
      },
      json(data) {
        if (!headers['content-type']) headers['content-type'] = 'application/json; charset=utf-8';
        resolve(new Response(JSON.stringify(data), { status: statusCode, headers }));
      },
      send(data) {
        const body = typeof data === 'object' && !Buffer.isBuffer(data) ? JSON.stringify(data) : data;
        resolve(new Response(body, { status: statusCode, headers }));
      },
      end(data) {
        if (data) chunks.push(Buffer.isBuffer(data) ? data : Buffer.from(String(data)));
        resolve(new Response(Buffer.concat(chunks), { status: statusCode, headers }));
      },
    };

    Promise.resolve(handler(req, res)).catch((err) => {
      resolve(new Response(JSON.stringify({ error: err?.message || 'Server error' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      }));
    });
  });
};