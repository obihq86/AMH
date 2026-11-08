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

fs.cpSync(tvDist, path.join(mainDist, 'tv'), { recursive: true });
fs.copyFileSync(path.join(tvDist, 'index.html'), tvHtml);

const html = fs.readFileSync(tvHtml, 'utf8');
if (!html.includes('/tv/assets/') || !html.includes('index-legacy-')) {
  throw new Error('TV compatibility page is missing its legacy assets.');
}

console.log('Vercel output includes the app and legacy-browser TV page at /tv.html.');
