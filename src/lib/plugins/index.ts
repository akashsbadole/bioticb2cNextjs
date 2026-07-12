import { db } from "@/lib/db";
import { hooks } from "./hooks";

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
        registerPluginHooks(manifest);
      }
    }

    return Array.from(loadedPlugins.values());
  } catch (e) {
    console.error("Failed to load plugins:", e);
    return [];
  }
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

function registerPluginHooks(manifest: PluginManifest) {
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
