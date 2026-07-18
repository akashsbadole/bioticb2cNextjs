import { z } from 'zod';

/**
 * Centralized environment variable validation.
 * Validates required secrets and config at startup so misconfiguration
 * fails loudly instead of at runtime (see audit 11.1).
 *
 * Optional values (e.g. integrations) are allowed to be empty.
 */

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters'),
  AUTH_SECRET: z
    .string()
    .min(32, 'AUTH_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().optional(),
  OTP_SECRET: z.string().optional(),
  DEFAULT_STORE_SLUG: z.string().min(1).optional(),
  NEXT_PUBLIC_STORE_SLUG: z.string().min(1).optional(),
  NEXT_PUBLIC_PLATFORM_DOMAIN: z.string().optional(),
  STORE_CURRENCY: z.string().optional(),
  NEXT_PUBLIC_SITE_NAME: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional().or(z.literal('')),
  TURSO_DB_URL: z.string().optional(),
  TURSO_AUTH_TOKEN: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  PAYU_MERCHANT_KEY: z.string().optional(),
  PAYU_MERCHANT_SALT: z.string().optional(),
  PAYU_TEST_MODE: z
    .string()
    .optional()
    .transform((v) => v !== 'false'),
});

export type Env = z.infer<typeof envSchema>;

// Cache the parsed result so validation only runs once per process.
let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    // Throw during build/startup so the app does not boot with bad config.
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

// Safe accessor for client components / non-fatal reads.
export const env = (() => {
  try {
    return getEnv();
  } catch {
    return undefined;
  }
})();
