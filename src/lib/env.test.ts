import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('env validation', () => {
  const ORIGINAL = process.env;
  const REQUIRED = {
    DATABASE_URL: 'postgresql://localhost:5432/db',
    JWT_SECRET: 'a'.repeat(32),
    AUTH_SECRET: 'b'.repeat(32),
  };

  beforeEach(() => {
    process.env = { ...ORIGINAL };
    vi.resetModules();
  });

  afterEach(() => {
    process.env = ORIGINAL;
    vi.resetModules();
  });

  it('throws when required secrets are missing', async () => {
    delete process.env.DATABASE_URL;
    delete process.env.JWT_SECRET;
    delete process.env.AUTH_SECRET;
    const { getEnv } = await import('./env');
    expect(() => getEnv()).toThrow(/DATABASE_URL|JWT_SECRET|AUTH_SECRET/);
  });

  it('throws when JWT_SECRET is too short', async () => {
    process.env = { ...process.env, ...REQUIRED, JWT_SECRET: 'short' };
    const { getEnv } = await import('./env');
    expect(() => getEnv()).toThrow(/JWT_SECRET/);
  });

  it('accepts a valid configuration', async () => {
    process.env = { ...process.env, ...REQUIRED };
    const { getEnv } = await import('./env');
    const env = getEnv();
    expect(env.DATABASE_URL).toBe(REQUIRED.DATABASE_URL);
    expect(env.JWT_SECRET).toBe(REQUIRED.JWT_SECRET);
  });

  it('allows optional integration fields to be empty', async () => {
    process.env = { ...process.env, ...REQUIRED };
    delete process.env.PAYU_MERCHANT_KEY;
    const { getEnv } = await import('./env');
    expect(() => getEnv()).not.toThrow();
  });
});
