export async function onRequest(context) {
  const { request, env, params } = context;
  // TV-1: Serve index.html with TV mode pre-initialized for TV-1
  return env.ASSETS.fetch(new Request('https://amh-aw9.pages.dev/index.html', { headers: request.headers }));
}