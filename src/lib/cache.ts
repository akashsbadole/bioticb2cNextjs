import { revalidateTag, unstable_cache } from "next/cache";

/**
 * Storefront cache tags — used with unstable_cache for ISR-style caching of
 * public storefront reads, and revalidateTag() after admin mutations.
 * Keep in sync with the tag names used in src/app/api/** write routes.
 */
export const CACHE_TAGS = {
  products: "products",
  categories: "categories",
  blog: "blog",
  pages: "pages",
  banners: "banners",
  popups: "popups",
  brands: "brands",
  settings: "settings",
  flashSales: "flash-sales",
  coupons: "coupons",
  product: (id: string) => `product:${id}`,
} as const;

/**
 * Wraps an expensive public storefront DB read in Next's data cache.
 * - `key`: stable cache key parts (query params, store id, ...)
 * - `tags`: invalidation tags (see CACHE_TAGS); admin writes call
 *   revalidateTag() to purge entries instantly.
 * - `revalidate`: fallback TTL in seconds (stale-while-revalidate).
 */
export function storefrontCache<T>(
  key: string[],
  fn: () => Promise<T>,
  tags: string[],
  revalidate = 60,
): () => Promise<T> {
  return unstable_cache(fn, key, { tags, revalidate });
}

/**
 * Hard-invalidates cached storefront entries for the given tags.
 * Must be called from Route Handlers / Server Actions (never inside a
 * function wrapped by unstable_cache).
 *
 * Note: this Next version requires the profile argument — the single-arg
 * form is deprecated. `{ expire: 0 }` immediately expires matching entries
 * (same semantics as the old `revalidateTag(tag)` hard purge).
 */
export function invalidateCache(...tags: string[]): void {
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }
}
