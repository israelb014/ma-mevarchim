// Creates dist/bundle.zip (live-update bundle for Android) and dist/app-version.json
import JSZip from 'jszip';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const version = process.env.APP_VERSION || '1.0.0';
const levels = JSON.parse(readFileSync('native-levels.json', 'utf8'));
const zip = new JSZip();
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    const rel = relative('dist', p).split('\\').join('/');
    if (rel === 'bundle.zip' || rel === 'app-version.json') continue;
    if (statSync(p).isDirectory()) walk(p);
    else zip.file(rel, readFileSync(p));
  }
};
walk('dist');
const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
writeFileSync('dist/bundle.zip', buf);
writeFileSync(
  'dist/app-version.json',
  JSON.stringify({ version, bundle: 'bundle.zip', androidLevel: levels.android, desktopLevel: levels.desktop, date: new Date().toISOString() }, null, 1)
);
console.log(`bundle.zip ${(buf.length / 1024).toFixed(0)} KB, version ${version}`);
