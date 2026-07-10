/**
 * Helper for SiteSetting lookups with the new compound unique [storeId, key].
 *
 * Prisma's compound unique doesn't accept null in TypeScript types,
 * so we use findFirst for global (storeId=null) lookups.
 */

import { db } from '@/lib/db';

/**
 * Get a global setting (storeId = null).
 */
export async function getGlobalSetting(key: string): Promise<string | null> {
  const setting = await db.siteSetting.findFirst({
    where: { storeId: null, key },
  });
  return setting?.value ?? null;
}

/**
 * Get a store-specific setting, falling back to global.
 */
export async function getSetting(key: string, storeId?: string | null): Promise<string | null> {
  if (storeId) {
    const storeSetting = await db.siteSetting.findFirst({
      where: { storeId, key },
    });
    if (storeSetting) return storeSetting.value;
  }

  const globalSetting = await db.siteSetting.findFirst({
    where: { storeId: null, key },
  });
  return globalSetting?.value ?? null;
}

/**
 * Upsert a global setting (storeId = null).
 */
export async function upsertGlobalSetting(key: string, value: string) {
  const existing = await db.siteSetting.findFirst({
    where: { storeId: null, key },
  });

  if (existing) {
    return db.siteSetting.update({
      where: { id: existing.id },
      data: { value },
    });
  }

  return db.siteSetting.create({
    data: { key, value },
  });
}

/**
 * Upsert a store-specific setting.
 */
export async function upsertStoreSetting(storeId: string, key: string, value: string) {
  const existing = await db.siteSetting.findFirst({
    where: { storeId, key },
  });

  if (existing) {
    return db.siteSetting.update({
      where: { id: existing.id },
      data: { value },
    });
  }

  return db.siteSetting.create({
    data: { storeId, key, value },
  });
}
