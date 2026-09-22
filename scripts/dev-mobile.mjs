import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const PIXEL_7_USER_AGENT =
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36';

// El Chromium que instala Playwright es una compilación "Chrome for Testing" y
// muestra un aviso permanente de "Descarga Chrome" en una barra de información:
// eso no ocurre en una PWA instalada real, así que se prefiere un Chrome/Edge
// del sistema cuando existe.
const REAL_BROWSER_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

const server = await createServer({ server: { open: false } });
await server.listen();
server.printUrls();
const address = server.resolvedUrls.local[0];

const profileDir = fileURLToPath(new URL('../node_modules/.cache/courselab-mobile', import.meta.url));

let executablePath = REAL_BROWSER_PATHS.find((p) => existsSync(p));
if (!executablePath) {
  try {
    executablePath = chromium.executablePath();
    console.warn('No se encontró Chrome/Edge del sistema; se usa el Chromium de pruebas de Playwright (mostrará un aviso de "Chrome for Testing").');
  } catch (error) {
    console.error('No se pudo ubicar Chromium. Ejecuta: npx playwright install chromium');
    console.error(error.message);
    await server.close();
    process.exit(1);
  }
}

// --app abre una ventana de Chrome sin barra de direcciones ni pestañas: es la
// misma apariencia "standalone" que usa una PWA instalada, no un navegador
// redimensionado. No pasa por CDP/Playwright, así que tampoco aparece el aviso
// de "Chrome is being controlled by automated software".
const child = spawn(
  executablePath,
  [
    `--app=${address}`,
    '--window-size=430,960',
    `--user-data-dir=${profileDir}`,
    `--user-agent=${PIXEL_7_USER_AGENT}`,
    '--touch-events=enabled',
    '--no-first-run',
    '--no-default-browser-check',
  ],
  { stdio: 'ignore' },
);

console.log('Ventana de app móvil abierta (sin barra de direcciones, como una PWA instalada).');
console.log('Cierra la ventana o pulsa Ctrl+C para detener el servidor.');

const stop = async () => {
  if (!child.killed) child.kill();
  await server.close();
};

child.on('exit', () => { void server.close(); });
process.once('SIGINT', stop);
process.once('SIGTERM', stop);
