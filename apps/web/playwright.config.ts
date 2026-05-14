import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './',
  testMatch: 'bki-demo-the-ultimate.spec.ts',
  timeout: 300_000, // 5 phút cho full ultimate tour

  use: {
    baseURL: 'http://localhost:3000',
    video: {
      mode: 'on',
      size: { width: 1920, height: 1080 },
    },
    viewport: { width: 1920, height: 1080 },
    screenshot: 'on',
    trace: 'on',
  },

  outputDir: './demo-video-output',

  reporter: [
    ['html', { outputFolder: './demo-report' }],
    ['list'],
  ],

  projects: [
    {
      name: 'BKI Demo Ultimate',
      use: {
        browserName: 'chromium',
        channel: 'chromium',
        locale: 'vi-VN',
        colorScheme: 'light',
      },
    },
  ],
});
