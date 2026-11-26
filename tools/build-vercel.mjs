import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const run = (args) => execFileSync(process.execPath, [viteCli, ...args], { cwd: root, stdio: 'inherit' });
const mainDist = path.join(root, 'dist');
const tvDist = path.join(root, 'dist-tv-out');
const tvHtml = path.join(mainDist, 'tv.html');

run(['build']);
run(['build', '--config', 'vite.config.tv.ts']);
execFileSync('node', ['tools/tv-compat.mjs'], { cwd: root, stdio: 'inherit' });

// fs.cpSync(tvDist, path.join(mainDist, 'tv'), { recursive: true });
// // Do NOT emit dist/tv.html — Cloudflare Pretty URLs redirects /tv1 → /tv
const html = fs.readFileSync(path.join(tvDist, 'index.html'), 'utf8');
if (!html.includes('/tv/assets/') || !html.includes('index-legacy-')) {
  throw new Error('TV compatibility page is missing its legacy assets.');
}

// Create tv1..tv4 index.html files so Cloudflare serves them as real static files
// (prevents Cloudflare's automatic /tv.html -> /tv redirect).
for (const n of [1, 2, 3, 4]) {
  const dir = path.join(mainDist, `tv${n}`);
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(path.join(tvDist, 'index.html'), path.join(dir, 'index.html'));
}

console.log('TV build created dist/tv1-4/index.html static files.');
