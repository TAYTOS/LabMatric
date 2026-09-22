import { test, expect } from '@playwright/test';

test('manifest, icons, service worker and Chromium installability', async ({ page, request }) => {
  await page.goto('/login');
  const manifestUrl = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(manifestUrl).toBeTruthy();
  const manifest = await (await request.get(manifestUrl!)).json();
  expect(manifest.display).toBe('standalone');
  expect(manifest.start_url).toBe('/');
  expect(manifest.theme_color).toBe('#0F766E');
  expect(manifest.shortcuts.map((shortcut: { url: string }) => shortcut.url)).toEqual(expect.arrayContaining(['/matriculas', '/calendario']));
  expect(manifest.icons.map((icon: { sizes: string }) => icon.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']));
  expect(manifest.icons.some((icon: { purpose: string }) => icon.purpose === 'maskable')).toBe(true);
  for (const icon of manifest.icons) {
    const response = await request.get(icon.src);
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('image/png');
    const size = Number(icon.sizes.split('x')[0]);
    const bytes = await response.body();
    expect(bytes.readUInt32BE(16)).toBe(size);
    expect(bytes.readUInt32BE(20)).toBe(size);
  }
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  const cdp = await page.context().newCDPSession(page);
  const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors');
  expect(installabilityErrors).toEqual([]);
});

test('compiled app queues an offline enrollment and applies it after reconnection', async ({ page, context }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/login');
  await page.getByRole('button', { name: 'Cuenta de estudiante' }).click();
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await expect(page).toHaveURL(/\/home$/);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  await page.goto('/cursos/c1/grupos/g1a');
  await expect(page.getByText('Sin conexión. Las matrículas se encolarán hasta recuperar la conexión.')).toBeVisible();
  await expect(page.getByText('5 disponibles', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Matricularme', exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar matrícula', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Tu solicitud quedó en cola');
  await page.getByRole('button', { name: 'Ver estado de sincronización' }).click();
  await expect(page.getByLabel('Estado de sincronización')).toBeVisible();
  await context.setOffline(false);
  await expect(page.getByLabel('Estado de sincronización')).toHaveCount(0);
  const course = page.locator('article').filter({ hasText: 'Plataformas Emergentes' });
  await expect(course).toBeVisible();
  await course.getByRole('button', { name: 'Ver detalle' }).click();
  await page.getByRole('button', { name: 'Cancelar matrícula', exact: true }).click();
  await page.getByRole('button', { name: 'Sí, cancelar matrícula' }).click();
  await expect(page.getByRole('dialog')).toContainText('Tu matrícula fue cancelada');
  await page.goto('/cursos/c1/grupos/g1a');
  await expect(page.getByText('5 disponibles', { exact: true })).toBeVisible();
  await expect(page.getByText('Sin conexión. Tus cambios se guardan en este dispositivo.')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('install help and install-event lifecycle have working controls', async ({ page }) => {
  // Suppress the native event to exercise the non-supporting-browser help path deterministically.
  await page.addInitScript(() => window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); e.stopImmediatePropagation(); }, { once: true }));
  await page.goto('/login');
  await page.getByRole('button', { name: 'Instalar aplicación' }).click();
  await expect(page.getByRole('dialog', { name: 'Instalar LabMatric' })).toContainText('Añadir a pantalla de inicio');
  await page.getByRole('button', { name: 'Entendido' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')));
  await expect(page.getByText('LabMatric está instalada.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Instalar aplicación' })).toHaveCount(0);
});
