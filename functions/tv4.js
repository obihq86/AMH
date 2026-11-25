export async function onRequest(context) {
  const { request, env } = context;
  return env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
}