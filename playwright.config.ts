import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testIgnore: '**/unit/**',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    env: {
      DATABASE_URL: 'file:/app/prisma/dev.db',
      AUTH_SECRET: 'change-me-to-a-random-64-char-string-for-security-hardening-12345678',
      JWT_SECRET: 'change-me-to-a-random-64-char-string-for-security-hardening-12345678',
      OTP_SECRET: 'change-me-to-a-random-32-char-string',
      NEXT_PUBLIC_STORE_SLUG: 'vedika-ayurveda',
      DEFAULT_STORE_SLUG: 'vedika-ayurveda',
      DISABLE_RATE_LIMIT: 'true',
      NEXT_PUBLIC_DISABLE_POPUPS: 'true',
    }
  },
});
