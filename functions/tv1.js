export async function onRequest(context) {
  const { request, env } = context;
  // Serve index.html directly — the app detects /tv1 from pathname and initializes TV mode.
  return env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
}