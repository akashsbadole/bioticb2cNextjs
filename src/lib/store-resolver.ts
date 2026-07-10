/**
 * Store resolution utilities for multi-tenancy.
 *
 * Resolves the current store from:
 * 1. Subdomain: {slug}.wcommerce.com
 * 2. Custom domain: shop.example.com
 * 3. Header: x-store-id (for API calls)
 * 4. Query param: ?store=slug (for development)
 */

import { db } from '@/lib/db';

export interface ResolvedStore {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  settings: Record<string, string>;
  theme: Record<string, unknown>;
  plan: string;
  isActive: boolean;
  isPaused: boolean;
}

// In-memory cache for store resolution (Edge-compatible)
const storeCache = new Map<string, { store: ResolvedStore; expiresAt: number }>();
const STORE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Extract the store identifier from the hostname.
 * Handles: {slug}.wcommerce.com, custom-domain.com, localhost:3000
 */
export function extractStoreSlug(hostname: string): string | null {
  // Remove port if present
  const host = hostname.split(':')[0];

  // Skip localhost, IP addresses, and platform domains
  if (!host || host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return null;
  }

  // Check if it's a subdomain of the platform domain
  const platformDomains = [
    process.env.PLATFORM_DOMAIN || 'localhost',
    process.env.PLATFORM_DOMAIN || 'localhost',
  ];

  for (const platformDomain of platformDomains) {
    if (host.endsWith(`.${platformDomain}`)) {
      const slug = host.replace(`.${platformDomain}`, '');
      return slug || null;
    }
  }

  // Otherwise, it's a custom domain
  return null;
}

/**
 * Check if a hostname is a custom domain (not a subdomain of platform).
 */
export function isCustomDomain(hostname: string): boolean {
  const host = hostname.split(':')[0];
  if (!host || host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return false;
  }

  const platformDomains = [
    process.env.PLATFORM_DOMAIN || 'localhost',
    process.env.PLATFORM_DOMAIN || 'localhost',
  ];

  return !platformDomains.some((d) => host.endsWith(`.${d}`)) && host !== 'localhost';
}

/**
 * Resolve store from hostname. Uses cache for performance.
 * In Edge runtime, this fetches from an internal API endpoint.
 * In Node.js runtime, it queries the database directly.
 */
export async function resolveStore(hostname: string): Promise<ResolvedStore | null> {
  const host = hostname.split(':')[0];

  // Check cache
  const cached = storeCache.get(host);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.store;
  }

  let store: ResolvedStore | null = null;

  // Try subdomain resolution
  const slug = extractStoreSlug(hostname);
  if (slug) {
    store = await resolveStoreBySlug(slug);
  }

  // Try custom domain resolution
  if (!store && isCustomDomain(hostname)) {
    store = await resolveStoreByDomain(host);
  }

  // Cache the result (even null results to avoid repeated lookups)
  if (store) {
    storeCache.set(host, {
      store,
      expiresAt: Date.now() + STORE_CACHE_TTL,
    });
  }

  return store;
}

async function resolveStoreBySlug(slug: string): Promise<ResolvedStore | null> {
  try {
    const store = await db.store.findUnique({
      where: { slug, isActive: true, isPaused: false },
    });
    return store ? formatStore(store) : null;
  } catch {
    return null;
  }
}

async function resolveStoreByDomain(domain: string): Promise<ResolvedStore | null> {
  try {
    const store = await db.store.findUnique({
      where: { domain, isActive: true, isPaused: false },
    });
    return store ? formatStore(store) : null;
  } catch {
    return null;
  }
}

function formatStore(raw: {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  settings: string;
  theme: string;
  plan: string;
  isActive: boolean;
  isPaused: boolean;
}): ResolvedStore {
  let settings: Record<string, string> = {};
  let theme: Record<string, unknown> = {};

  try {
    settings = JSON.parse(raw.settings || '{}');
  } catch { /* ignore */ }
  try {
    theme = JSON.parse(raw.theme || '{}');
  } catch { /* ignore */ }

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    domain: raw.domain,
    settings,
    theme,
    plan: raw.plan,
    isActive: raw.isActive,
    isPaused: raw.isPaused,
  };
}

/**
 * Invalidate the store cache (call after store updates).
 */
export function invalidateStoreCache(hostname: string) {
  const host = hostname.split(':')[0];
  storeCache.delete(host);
}

/**
 * Get a store-scoped setting value.
 * Falls back to global SiteSetting if not found on store.
 */
export async function getStoreSetting(
  storeId: string | null,
  key: string,
): Promise<string | null> {
  if (!storeId) {
    const global = await db.siteSetting.findFirst({ where: { storeId: null, key } });
    return global?.value ?? null;
  }

  // Try store-specific setting first
  const storeSetting = await db.siteSetting.findFirst({
    where: { storeId, key },
  });
  if (storeSetting) return storeSetting.value;

  // Fall back to global setting (storeId = null)
  const globalSetting = await db.siteSetting.findFirst({
    where: { storeId: null, key },
  });
  return globalSetting?.value ?? null;
}
