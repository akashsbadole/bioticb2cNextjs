/**
 * Build-time / server-side storefront data loaders.
 *
 * These mirror the exact queries the client SPA would fetch from the public
 * API routes, and run them through the same storefrontCache (unstable_cache)
 * with the same invalidation tags. Static pages call them at build time so
 * the first-load content ships embedded in the HTML — no client fetch and
 * no database hit at runtime for cached pages. Admin writes purge the tags
 * (see CACHE_TAGS), which refreshes the static pages via ISR.
 *
 * Static pages cannot read the `x-store-id` request header, so the store is
 * resolved from `DEFAULT_STORE_ID` (set in the build environment). This is
 * correct for single-store deployments; multi-store installs keep using the
 * dynamic catch-all shell.
 */

import { db } from "@/lib/db";
import { CACHE_TAGS, storefrontCache } from "@/lib/cache";

export type StorefrontInitialData = {
  home?: {
    categories: unknown[];
    featuredProducts: unknown[];
    allProducts: unknown[];
  };
  shop?: {
    categories: unknown[];
    brands: unknown[];
    products: unknown[];
  };
  category?: {
    category: unknown;
    products: unknown[];
    allCategories: unknown[];
  };
  blog?: {
    posts: unknown[];
  };
  blogPost?: {
    blogPost: unknown;
  };
};

const storeId = process.env.DEFAULT_STORE_ID || null;

async function loadCategories(
  limit?: number,
  slug?: string,
): Promise<unknown[]> {
  const load = storefrontCache(
    [`home-categories:${storeId ?? "default"}:${slug ?? ""}:${String(limit ?? "")}`],
    async () => {
      const categories = await db.category.findMany({
        where: {
          deletedAt: null,
          isActive: true,
          ...(slug ? { slug } : {}),
          ...(storeId ? { storeId } : {}),
        },
        orderBy: { sortOrder: "asc" },
        take: limit,
      });

      const categoryIds = categories.map((c: any) => c.id);
      let customFieldMap = new Map<string, any[]>();
      if (categoryIds.length > 0) {
        const values = await db.customFieldValue.findMany({
          where: {
            entityId: { in: categoryIds },
            entityType: "category",
            ...(storeId ? { storeId } : {}),
          },
          include: { Definition: true },
        });
        for (const v of values) {
          const arr = customFieldMap.get(v.entityId) || [];
          arr.push({
            id: v.id,
            definitionId: v.definitionId,
            entityId: v.entityId,
            entityType: v.entityType,
            value: v.value,
            definition: {
              id: v.Definition.id,
              name: v.Definition.name,
              type: v.Definition.type,
              isVisible: v.Definition.isVisible,
              options: v.Definition.options,
            },
          });
          customFieldMap.set(v.entityId, arr);
        }
      }

      return categories.map((c: any) => ({
        ...c,
        customFieldValues: customFieldMap.get(c.id) || [],
      }));
    },
    [CACHE_TAGS.categories],
    600,
  );
  return load();
}

async function loadProducts(options: {
  featured?: boolean;
  inStock?: boolean;
  categoryId?: string;
  limit: number;
}): Promise<unknown[]> {
  const { featured, inStock, categoryId, limit } = options;
  const load = storefrontCache(
    [
      `home-products:${storeId ?? "default"}:${featured ? "f" : "nf"}:${inStock ? "s" : "ns"}:${categoryId ?? ""}:${limit}`,
    ],
    async () => {
      const where: Record<string, unknown> = {
        deletedAt: null,
        isActive: true,
        ...(storeId ? { storeId } : {}),
      };
      if (featured) where.isFeatured = true;
      if (categoryId) where.categoryId = categoryId;
      if (inStock) where.stock = { gt: 0 };

      const products = await db.product.findMany({
        where,
        include: { Category: true, ProductVariant: true },
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        take: limit,
      });

      if (!products.length) return [];
      const productIds = products.map((p: any) => p.id);
      const values = await db.customFieldValue.findMany({
        where: {
          entityId: { in: productIds },
          entityType: "product",
          ...(storeId ? { storeId } : {}),
        },
        include: { Definition: true },
      });
      const grouped = new Map<string, any[]>();
      for (const v of values) {
        const arr = grouped.get(v.entityId) || [];
        arr.push({
          id: v.id,
          definitionId: v.definitionId,
          entityId: v.entityId,
          entityType: v.entityType,
          value: v.value,
          definition: {
            id: v.Definition.id,
            name: v.Definition.name,
            type: v.Definition.type,
            isVisible: v.Definition.isVisible,
            options: v.Definition.options,
          },
        });
        grouped.set(v.entityId, arr);
      }
      return products.map((p: any) => ({
        ...p,
        customFieldValues: grouped.get(p.id) || [],
      }));
    },
    [CACHE_TAGS.products],
    300,
  );
  return load();
}

async function loadBrands(): Promise<unknown[]> {
  const load = storefrontCache(
    [`home-brands:${storeId ?? "default"}`],
    async () =>
      db.brand.findMany({
        where: storeId ? { storeId } : {},
        orderBy: { name: "asc" },
      }),
    [CACHE_TAGS.brands],
    600,
  );
  return load();
}

async function loadBlogPosts(limit = 20): Promise<unknown[]> {
  const load = storefrontCache(
    [`home-blog:${storeId ?? "default"}:${limit}`],
    async () => {
      const where: Record<string, unknown> = {
        isPublished: true,
        ...(storeId ? { storeId } : {}),
      };
      const posts = await db.blogPost.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          content: true,
          coverImage: true,
          authorId: true,
          metaTitle: true,
          metaDescription: true,
          ogImage: true,
          tags: true,
          isPublished: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
          User: {
            select: { id: true, name: true, email: true, avatar: true, bio: true },
          },
        },
        orderBy: { publishedAt: "desc" },
        take: limit,
      });
      return posts;
    },
    [CACHE_TAGS.blog],
    600,
  );
  return load();
}

async function loadBlogPost(idOrSlug: string): Promise<unknown> {
  const load = storefrontCache(
    [`home-blog-post:${storeId ?? "default"}:${idOrSlug}`],
    async () =>
      db.blogPost.findFirst({
        where: {
          OR: [{ id: idOrSlug }, { slug: idOrSlug }],
          ...(storeId ? { storeId } : {}),
        },
        include: {
          User: { select: { id: true, name: true, email: true, avatar: true, bio: true } },
        },
      }),
    [CACHE_TAGS.blog],
    600,
  );
  return load();
}

/** Home page: categories + featured + full in-stock product list. */
export async function getHomeInitialData(): Promise<
  StorefrontInitialData["home"] | null
> {
  try {
    const [categories, featuredProducts, allProducts] = await Promise.all([
      loadCategories(),
      loadProducts({ featured: true, inStock: true, limit: 8 }),
      loadProducts({ inStock: true, limit: 100 }),
    ]);
    return { categories, featuredProducts, allProducts };
  } catch (error) {
    console.error("getHomeInitialData failed (falling back to runtime):", error);
    return null;
  }
}

/** Shop page: categories + brands + default product grid. */
export async function getShopInitialData(): Promise<
  StorefrontInitialData["shop"] | null
> {
  try {
    const [categories, brands, products] = await Promise.all([
      loadCategories(),
      loadBrands(),
      loadProducts({ inStock: true, limit: 50 }),
    ]);
    return { categories, brands, products };
  } catch (error) {
    console.error("getShopInitialData failed (falling back to runtime):", error);
    return null;
  }
}

/** Category page: category + its products + sibling categories. */
export async function getCategoryInitialData(
  slug: string,
): Promise<StorefrontInitialData["category"] | null> {
  try {
    const found = await loadCategories(undefined, slug);
    const category = found[0] || null;
    if (!category) return null;
    const [products, categories] = await Promise.all([
      loadProducts({ categoryId: (category as any).id, inStock: true, limit: 50 }),
      loadCategories(),
    ]);
    return { category, products, allCategories: categories.slice(0, 6) };
  } catch (error) {
    console.error(`getCategoryInitialData(${slug}) failed (falling back to runtime):`, error);
    return null;
  }
}

/** Blog list page. */
export async function getBlogInitialData(): Promise<
  StorefrontInitialData["blog"] | null
> {
  try {
    const posts = await loadBlogPosts(20);
    return { posts };
  } catch (error) {
    console.error("getBlogInitialData failed (falling back to runtime):", error);
    return null;
  }
}

/** Blog post page. */
export async function getBlogPostInitialData(
  slug: string,
): Promise<StorefrontInitialData["blogPost"] | null> {
  try {
    const blogPost = await loadBlogPost(slug);
    return blogPost ? { blogPost } : null;
  } catch (error) {
    console.error(`getBlogPostInitialData(${slug}) failed (falling back to runtime):`, error);
    return null;
  }
}

/** All active category slugs — for generateStaticParams. */
export async function getCategorySlugs(): Promise<string[]> {
  try {
    const categories = await db.category.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        ...(storeId ? { storeId } : {}),
      },
      select: { slug: true },
    });
    return categories.map((c) => c.slug);
  } catch (error) {
    console.error("getCategorySlugs failed:", error);
    return [];
  }
}

/** All published blog slugs — for generateStaticParams. */
export async function getBlogSlugs(): Promise<string[]> {
  try {
    const posts = await db.blogPost.findMany({
      where: {
        isPublished: true,
        ...(storeId ? { storeId } : {}),
      },
      select: { slug: true },
    });
    return posts.map((p) => p.slug);
  } catch (error) {
    console.error("getBlogSlugs failed:", error);
    return [];
  }
}
