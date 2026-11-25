export async function onRequest(context) {
  const { request, env, params } = context;
  return env.ASSETS.fetch(new Request('https://amh-aw9.pages.dev/index.html', { headers: request.headers }));
}