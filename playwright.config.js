import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  workers: 1,
  use: {
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:' + (process.env.WEB_PORT || '5173'),
    viewport: { width: 1440, height: 1024 },
    locale: 'ru-RU',
  },
});
