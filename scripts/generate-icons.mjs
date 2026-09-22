import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';

const folder = new URL('../public/icons/', import.meta.url);
const source = await readFile(new URL('icon.svg', folder), 'utf8');
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  for (const [name, size, maskable] of [
    ['icon-192.png', 192, false], ['icon-512.png', 512, false],
    ['icon-maskable-512.png', 512, true], ['apple-touch-icon.png', 180, true],
  ]) {
    const base64 = await page.evaluate(async ({ svg, size, maskable }) => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d');
      // Full background for OS masks; the flask stays within the central safe zone.
       if (maskable) { ctx.fillStyle = '#0F766E'; ctx.fillRect(0, 0, size, size); }
      const picture = new Image();
      picture.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      await picture.decode();
      ctx.drawImage(picture, 0, 0, size, size);
      return canvas.toDataURL('image/png').split(',')[1];
    }, { svg: source, size, maskable });
    await writeFile(new URL(name, folder), Buffer.from(base64, 'base64'));
  }
} finally { await browser.close(); }
