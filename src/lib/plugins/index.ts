import { db } from "@/lib/db";
import { hooks } from "./hooks";

export { hooks };

export interface PluginDefinition {
  id: string;
  key: string;
  name: string;
  description: string | null;
  version: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface PluginManifest {
  key: string;
  name: string;
  description: string;
  version: string;
  hooks?: {
    filters?: Array<{ name: string; priority?: number }>;
    actions?: Array<{ name: string; priority?: number }>;
  };
  defaultConfig?: Record<string, unknown>;
}

const loadedPlugins = new Map<string, PluginDefinition>();
let loadPromise: Promise<PluginDefinition[]> | null = null;
let loadedAt = 0;
const LOAD_TTL_MS = 60_000;

const BUILTIN_PLUGINS: PluginManifest[] = [
  {
    key: "stock-notifications",
    name: "Stock Notifications",
    description: "Notifies customers when out-of-stock products become available.",
    version: "1.0.0",
    hooks: {
      actions: [{ name: "product:stock-updated" }],
    },
    defaultConfig: {
      notifyEmailTemplate: "Your product {product} is back in stock!",
    },
  },
  {
    key: "flash-sales",
    name: "Flash Sales",
    description: "Time-limited discounts with countdown timers on products.",
    version: "1.0.0",
    hooks: {
      filters: [{ name: "product:price" }, { name: "product:badge" }],
    },
  },
  {
    key: "product-addons",
    name: "Product Add-ons",
    description: "Allows customers to add optional extras to products.",
    version: "1.0.0",
    defaultConfig: {
      maxAddonsPerProduct: 10,
    },
  },
];

export function getBuiltinPlugins(): PluginManifest[] {
  return BUILTIN_PLUGINS;
}

export function getBuiltinPlugin(key: string): PluginManifest | undefined {
  return BUILTIN_PLUGINS.find((p) => p.key === key);
}

export async function loadPlugins(): Promise<PluginDefinition[]> {
  try {
    const plugins = await db.plugin.findMany({
      where: { storeId: null },
      orderBy: { name: "asc" },
    });

    hooks.reset();
    loadedPlugins.clear();
    for (const plugin of plugins) {
      const def: PluginDefinition = {
        id: plugin.id,
        key: plugin.key,
        name: plugin.name,
        description: plugin.description,
        version: plugin.version,
        enabled: plugin.enabled,
        config: parseConfig(plugin.config),
      };
      loadedPlugins.set(plugin.key, def);

      const manifest = getBuiltinPlugin(plugin.key);
      if (manifest?.hooks && plugin.enabled) {
        registerPluginHooks(manifest, def);
      }
    }

    return Array.from(loadedPlugins.values());
  } catch (e) {
    console.error("Failed to load plugins:", e);
    return [];
  }
}

/**
 * Lazily loads plugins at most once per LOAD_TTL_MS window so call sites can
 * rely on `isPluginEnabled` / `doAction` / `applyFilters` without bootstrapping.
 */
export function ensurePluginsLoaded(): Promise<PluginDefinition[]> {
  if (loadPromise && Date.now() - loadedAt < LOAD_TTL_MS) {
    return loadPromise;
  }
  loadPromise = loadPlugins().then((plugins) => {
    loadedAt = Date.now();
    return plugins;
  });
  return loadPromise;
}

export async function loadEnabledPlugins(): Promise<PluginDefinition[]> {
  try {
    const plugins = await db.plugin.findMany({
      where: { storeId: null, enabled: true },
    });
    return plugins.map((p) => ({
      id: p.id,
      key: p.key,
      name: p.name,
      description: p.description,
      version: p.version,
      enabled: p.enabled,
      config: parseConfig(p.config),
    }));
  } catch {
    return [];
  }
}

export function getLoadedPlugin(key: string): PluginDefinition | undefined {
  return loadedPlugins.get(key);
}

export function isPluginEnabled(key: string): boolean {
  return loadedPlugins.get(key)?.enabled ?? false;
}

function parseConfig(config: string): Record<string, unknown> {
  try {
    return JSON.parse(config);
  } catch {
    return {};
  }
}

let flashSalesCache: Array<{
  id: string;
  discounts: Array<{
    productId: string;
    discountType: string;
    discountValue: number;
  }>;
  endsAt: Date | null;
}> | null = null;
let flashSalesCachedAt = 0;
const FLASH_CACHE_TTL_MS = 60_000;

async function getActiveFlashSales() {
  if (flashSalesCache && Date.now() - flashSalesCachedAt < FLASH_CACHE_TTL_MS) {
    return flashSalesCache;
  }
  const now = new Date();
  const sales = await db.flashSale.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: {
      products: {
        select: { productId: true, discountType: true, discountValue: true },
      },
    },
  });
  flashSalesCache = sales.map((s) => ({
    id: s.id,
    discounts: s.products.map((p) => ({
      productId: p.productId,
      discountType: p.discountType,
      discountValue: p.discountValue,
    })),
    endsAt: s.endDate,
  }));
  flashSalesCachedAt = Date.now();
  return flashSalesCache;
}

function registerPluginHooks(manifest: PluginManifest, def: PluginDefinition) {
  if (manifest.key === "stock-notifications") {
    hooks.addAction("product:stock-updated", async (payload: unknown) => {
      const { productId, stock } = (payload || {}) as {
        productId?: string;
        stock?: number;
      };
      if (!productId || typeof stock !== "number" || stock <= 0) return;
      try {
        const [notifications, product] = await Promise.all([
          db.stockNotification.findMany({
            where: { productId, notified: false },
          }),
          db.product.findUnique({ where: { id: productId } }),
        ]);
        if (!product || notifications.length === 0) return;
        const { sendBackInStockNotification } = await import("@/lib/email");
        for (const n of notifications) {
          try {
            await sendBackInStockNotification({
              email: n.email,
              productName: product.name,
              productSlug: product.slug,
            });
          } catch {
            // continue notifying remaining subscribers
          }
        }
        await db.stockNotification.updateMany({
          where: { id: { in: notifications.map((n) => n.id) } },
          data: { notified: true, notifiedAt: new Date() },
        });
      } catch (e) {
        console.error("Stock notification plugin error:", e);
      }
    });
    return;
  }

  if (manifest.key === "flash-sales") {
    hooks.addFilter(
      "product:price",
      async (value: number, product: { id: string } | null) => {
        if (!product?.id || typeof value !== "number") return value;
        try {
          const sales = await getActiveFlashSales();
          const sale = sales.find((s) =>
            s.discounts.some((d) => d.productId === product.id),
          );
          if (!sale) return value;
          const discount = sale.discounts.find(
            (d) => d.productId === product.id,
          )!;
          if (discount.discountType === "fixed") {
            return Math.max(0, value - discount.discountValue);
          }
          return Math.max(0, value * (1 - discount.discountValue / 100));
        } catch {
          return value;
        }
      },
      10,
    );
    hooks.addFilter(
      "product:badge",
      (value: unknown) => value,
      10,
    );
    return;
  }

  if (manifest.hooks?.filters) {
    for (const filter of manifest.hooks.filters) {
      hooks.addFilter(
        filter.name,
        (value: any) => value,
        filter.priority ?? 10
      );
    }
  }
  if (manifest.hooks?.actions) {
    for (const action of manifest.hooks.actions) {
      hooks.addAction(action.name, () => {}, action.priority ?? 10);
    }
  }
}
