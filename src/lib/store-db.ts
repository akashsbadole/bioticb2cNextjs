/**
 * Store-scoped database query helpers.
 *
 * Usage in API routes:
 *   import { scopedQuery, getStoreId } from '@/lib/store-db';
 *
 *   const storeId = getStoreId(request);
 *   const products = await scopedQuery(db.product, storeId, {
 *     where: { isActive: true },
 *     take: 10,
 *   });
 */

import { PrismaClient, Prisma } from '@prisma/client';

/**
 * Extract storeId from request headers (set by middleware).
 */
export function getStoreId(request: Request): string | null {
  return request.headers.get('x-store-id') || null;
}

/**
 * Get storeId and require it (throws if missing).
 */
export function requireStoreId(request: Request): string {
  const storeId = getStoreId(request);
  if (!storeId) {
    throw new StoreRequiredError();
  }
  return storeId;
}

/**
 * Error thrown when a store is required but not provided.
 */
export class StoreRequiredError extends Error {
  constructor() {
    super('Store context is required');
    this.name = 'StoreRequiredError';
  }
}

/**
 * Automatically add storeId filter to a Prisma query.
 * If storeId is null, returns unscoped query (for platform admin).
 */
export function scopedWhere<T extends Record<string, unknown>>(
  where: T,
  storeId: string | null,
): T {
  if (!storeId) return where;
  return { ...where, storeId } as T;
}

/**
 * Wrapper around common Prisma findMany with store scoping.
 */
export async function scopedFindMany<T>(
  model: {
    findMany: (args: { where: Record<string, unknown>; include?: Record<string, unknown>; select?: Record<string, unknown>; orderBy?: Record<string, unknown>; skip?: number; take?: number }) => Promise<T[]>;
  },
  storeId: string | null,
  args: {
    where?: Record<string, unknown>;
    include?: Record<string, unknown>;
    select?: Record<string, unknown>;
    orderBy?: Record<string, unknown>;
    skip?: number;
    take?: number;
  } = {},
): Promise<T[]> {
  const where = scopedWhere(args.where || {}, storeId);
  return model.findMany({ ...args, where }) as Promise<T[]>;
}

/**
 * Wrapper around Prisma count with store scoping.
 */
export async function scopedCount(
  model: {
    count: (args: { where: Record<string, unknown> }) => Promise<number>;
  },
  storeId: string | null,
  where: Record<string, unknown> = {},
): Promise<number> {
  return model.count({ where: scopedWhere(where, storeId) });
}

/**
 * Wrapper around Prisma findFirst with store scoping.
 */
export async function scopedFindFirst<T>(
  model: {
    findFirst: (args: { where: Record<string, unknown>; include?: Record<string, unknown> }) => Promise<T | null>;
  },
  storeId: string | null,
  where: Record<string, unknown>,
  include?: Record<string, unknown>,
): Promise<T | null> {
  return model.findFirst({
    where: scopedWhere(where, storeId),
    include,
  }) as Promise<T | null>;
}

/**
 * Create a store-scoped record.
 */
export function scopedCreateData(
  data: Record<string, unknown>,
  storeId: string | null,
): Record<string, unknown> {
  if (!storeId) return data;
  return { ...data, storeId };
}

/**
 * Get store settings as a key-value object.
 */
export async function getStoreSettings(
  db: PrismaClient,
  storeId: string | null,
): Promise<Record<string, string>> {
  const settings = await db.siteSetting.findMany({
    where: storeId
      ? { OR: [{ storeId }, { storeId: null }] }
      : { storeId: null },
  });

  // Store-specific settings override global ones
  const result: Record<string, string> = {};
  for (const s of settings) {
    if (s.storeId === null || !result[s.key]) {
      result[s.key] = s.value;
    }
  }

  // Re-apply store-specific on top
  for (const s of settings) {
    if (s.storeId === storeId) {
      result[s.key] = s.value;
    }
  }

  return result;
}
