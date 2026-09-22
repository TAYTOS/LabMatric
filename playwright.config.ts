import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'application.spec.ts',
  timeout: 30000,
  fullyParallel: true,
  workers: 3,
  use: { baseURL: 'http://127.0.0.1:5174', headless: true, viewport: { width: 375, height: 812 }, trace: 'retain-on-failure' },
  webServer: { command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5174', url: 'http://127.0.0.1:5174', reuseExistingServer: !process.env.CI },
});
