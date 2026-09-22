import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'pwa.spec.ts',
  timeout: 45000,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:5180',
    viewport: { width: 393, height: 852 },
    serviceWorkers: 'allow',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 5180 --strictPort',
    url: 'http://127.0.0.1:5180',
    reuseExistingServer: !process.env.CI,
  },
});
