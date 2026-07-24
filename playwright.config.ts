import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env first if it exists, otherwise load .env.example
const envPath = fs.existsSync(path.resolve('.env')) ? '.env' : '.env.example';
dotenv.config({ path: path.resolve(envPath) });

// Set default fallback env vars for test processes
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./prisma/dev.db';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'change-me-to-a-random-64-char-string-for-security-hardening-12345678';
process.env.AUTH_SECRET = process.env.AUTH_SECRET || 'change-me-to-a-random-64-char-string-for-security-hardening-12345678';
process.env.OTP_SECRET = process.env.OTP_SECRET || 'change-me-to-a-random-32-char-string';

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
    timeout: 120000,
    env: {
      DATABASE_URL: 'file:./prisma/dev.db',
      AUTH_SECRET: 'change-me-to-a-random-64-char-string-for-security-hardening-12345678',
      JWT_SECRET: 'change-me-to-a-random-64-char-string-for-security-hardening-12345678',
      OTP_SECRET: 'change-me-to-a-random-32-char-string',
      NEXT_PUBLIC_STORE_SLUG: 'biotic-naturals',
      DEFAULT_STORE_SLUG: 'biotic-naturals',
      DISABLE_RATE_LIMIT: 'true',
      NEXT_PUBLIC_DISABLE_POPUPS: 'true',
    }
  },
});
