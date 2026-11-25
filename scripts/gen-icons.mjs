// Generates PNG icons (PWA, favicon, Electron, Capacitor sources) from assets/logo.svg
import sharp from 'sharp';
import { mkdirSync, readFileSync, copyFileSync } from 'node:fs';

const svg = readFileSync('assets/logo.svg');
// Foreground only (no background) for adaptive icons
const fg = Buffer.from(
  svg.toString()
    .replace(/<rect[^>]*\/>/, '')
    .replace('viewBox="0 0 512 512"', 'viewBox="-128 -128 768 768"')
);
const bg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#5B6B2E"/></svg>');
const splash = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2732 2732"><rect width="2732" height="2732" fill="#FBF6EC"/><g transform="translate(1110 1110) scale(1.0)">${svg.toString().replace(/<\/?svg[^>]*>/g, '')}</g></svg>`);

mkdirSync('public/icons', { recursive: true });
mkdirSync('build', { recursive: true });
const png = (src, size, out) => sharp(src, { density: 300 }).resize(size, size).png().toFile(out);

await Promise.all([
  png(svg, 192, 'public/icons/icon-192.png'),
  png(svg, 512, 'public/icons/icon-512.png'),
  png(svg, 180, 'public/icons/apple-touch-icon.png'),
  png(Buffer.from(svg.toString().replace('rx="112"', 'rx="0"')), 512, 'public/icons/maskable-512.png'),
  png(svg, 512, 'build/icon.png'),
  png(svg, 1024, 'assets/icon-only.png'),
  png(fg, 1024, 'assets/icon-foreground.png'),
  png(bg, 1024, 'assets/icon-background.png'),
  png(splash, 2732, 'assets/splash.png'),
  png(splash, 2732, 'assets/splash-dark.png'),
]);
copyFileSync('assets/logo.svg', 'public/favicon.svg');
console.log('icons generated');
