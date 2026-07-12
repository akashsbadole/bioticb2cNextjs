import { db } from "@/lib/db";

export interface ThemeConfig {
  name: string;
  colors: Record<string, string>;
  fonts: Record<string, string>;
  radii: Record<string, string>;
}

export interface ThemeDefinition {
  id: string;
  storeId: string | null;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  config: ThemeConfig;
}

export const DEFAULT_THEME: ThemeConfig = {
  name: "Default",
  colors: {
    "--background": "#FFFFFF",
    "--foreground": "#333333",
    "--primary": "#3d6f08",
    "--primary-foreground": "#FFFFFF",
    "--secondary": "#8bc34a",
    "--secondary-foreground": "#FFFFFF",
    "--muted": "#f8f6f3",
    "--muted-foreground": "#666666",
    "--accent": "#fa881e",
    "--accent-foreground": "#FFFFFF",
    "--destructive": "#FF6B6B",
    "--border": "#dddddd",
    "--input": "#dddddd",
    "--ring": "#3d6f08",
    "--card": "#FFFFFF",
    "--card-foreground": "#333333",
    "--popover": "#FFFFFF",
    "--popover-foreground": "#333333",
    "--brand-primary": "#3d6f08",
    "--brand-primary-hover": "#20340b",
    "--brand-secondary": "#8bc34a",
    "--brand-secondary-hover": "#6a9739",
    "--brand-accent": "#fa881e",
    "--brand-accent-hover": "#e67600",
    "--brand-text": "#333333",
    "--brand-text-dark": "#111111",
    "--brand-text-light": "#666666",
    "--brand-bg": "#FFFFFF",
    "--brand-bg-section": "#f8f6f3",
  },
  fonts: {
    "--font-body": "var(--font-poppins), sans-serif",
    "--font-heading": "var(--font-poppins), sans-serif",
  },
  radii: {
    "--radius": "0.5rem",
  },
};

const PRESET_THEMES: Record<string, ThemeConfig> = {
  default: DEFAULT_THEME,
  dark: {
    name: "Dark",
    colors: {
      "--background": "#0f0f0f",
      "--foreground": "#e5e5e5",
      "--primary": "#4ade80",
      "--primary-foreground": "#0f0f0f",
      "--secondary": "#2dd4bf",
      "--secondary-foreground": "#0f0f0f",
      "--muted": "#1a1a2e",
      "--muted-foreground": "#a0a0a0",
      "--accent": "#fb923c",
      "--accent-foreground": "#0f0f0f",
      "--destructive": "#f87171",
      "--border": "#262626",
      "--input": "#262626",
      "--ring": "#4ade80",
      "--card": "#1a1a1a",
      "--card-foreground": "#e5e5e5",
      "--popover": "#1a1a1a",
      "--popover-foreground": "#e5e5e5",
      "--brand-primary": "#4ade80",
      "--brand-primary-hover": "#22c55e",
      "--brand-secondary": "#2dd4bf",
      "--brand-secondary-hover": "#14b8a6",
      "--brand-accent": "#fb923c",
      "--brand-accent-hover": "#f97316",
      "--brand-text": "#e5e5e5",
      "--brand-text-dark": "#ffffff",
      "--brand-text-light": "#a0a0a0",
      "--brand-bg": "#0f0f0f",
      "--brand-bg-section": "#1a1a2e",
    },
    fonts: {
      "--font-body": "var(--font-poppins), sans-serif",
      "--font-heading": "var(--font-poppins), sans-serif",
    },
    radii: {
      "--radius": "0.5rem",
    },
  },
  forest: {
    name: "Forest",
    colors: {
      "--background": "#f5f0eb",
      "--foreground": "#1a3c2a",
      "--primary": "#2d6a4f",
      "--primary-foreground": "#FFFFFF",
      "--secondary": "#95d5b2",
      "--secondary-foreground": "#1a3c2a",
      "--muted": "#e9f0e5",
      "--muted-foreground": "#5a7a6a",
      "--accent": "#d4a373",
      "--accent-foreground": "#FFFFFF",
      "--destructive": "#c1121f",
      "--border": "#cfe0d3",
      "--input": "#cfe0d3",
      "--ring": "#2d6a4f",
      "--card": "#FFFFFF",
      "--card-foreground": "#1a3c2a",
      "--popover": "#FFFFFF",
      "--popover-foreground": "#1a3c2a",
      "--brand-primary": "#2d6a4f",
      "--brand-primary-hover": "#1b4332",
      "--brand-secondary": "#95d5b2",
      "--brand-secondary-hover": "#74c69d",
      "--brand-accent": "#d4a373",
      "--brand-accent-hover": "#c48c5f",
      "--brand-text": "#1a3c2a",
      "--brand-text-dark": "#0d1f15",
      "--brand-text-light": "#5a7a6a",
      "--brand-bg": "#FFFFFF",
      "--brand-bg-section": "#e9f0e5",
    },
    fonts: {
      "--font-body": "var(--font-poppins), sans-serif",
      "--font-heading": "var(--font-poppins), sans-serif",
    },
    radii: {
      "--radius": "0.75rem",
    },
  },
  ocean: {
    name: "Ocean",
    colors: {
      "--background": "#f0f8ff",
      "--foreground": "#0c2340",
      "--primary": "#1e6f9f",
      "--primary-foreground": "#FFFFFF",
      "--secondary": "#7ec8e3",
      "--secondary-foreground": "#0c2340",
      "--muted": "#e6f2f8",
      "--muted-foreground": "#5a7a94",
      "--accent": "#f6a623",
      "--accent-foreground": "#FFFFFF",
      "--destructive": "#d62828",
      "--border": "#c8dce8",
      "--input": "#c8dce8",
      "--ring": "#1e6f9f",
      "--card": "#FFFFFF",
      "--card-foreground": "#0c2340",
      "--popover": "#FFFFFF",
      "--popover-foreground": "#0c2340",
      "--brand-primary": "#1e6f9f",
      "--brand-primary-hover": "#14537a",
      "--brand-secondary": "#7ec8e3",
      "--brand-secondary-hover": "#5ab8d9",
      "--brand-accent": "#f6a623",
      "--brand-accent-hover": "#e0961a",
      "--brand-text": "#0c2340",
      "--brand-text-dark": "#08162b",
      "--brand-text-light": "#5a7a94",
      "--brand-bg": "#FFFFFF",
      "--brand-bg-section": "#e6f2f8",
    },
    fonts: {
      "--font-body": "var(--font-poppins), sans-serif",
      "--font-heading": "var(--font-poppins), sans-serif",
    },
    radii: {
      "--radius": "0.375rem",
    },
  },
};

export function getPresetThemes(): Record<string, ThemeConfig> {
  return PRESET_THEMES;
}

export function getPresetTheme(slug: string): ThemeConfig | undefined {
  return PRESET_THEMES[slug];
}

export function cssVariablesFromTheme(config: ThemeConfig): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(config.colors)) {
    parts.push(`${key}: ${value};`);
  }
  for (const [key, value] of Object.entries(config.fonts)) {
    parts.push(`${key}: ${value};`);
  }
  for (const [key, value] of Object.entries(config.radii)) {
    parts.push(`${key}: ${value};`);
  }
  return `:root {\n${parts.map((p) => `  ${p}`).join("\n")}\n}`;
}

export async function getActiveTheme(storeId: string | null = null): Promise<ThemeConfig> {
  try {
    const active = await db.theme.findFirst({
      where: { storeId, isActive: true },
    });
    if (active) {
      const config = JSON.parse(active.config) as ThemeConfig;
      return config;
    }
  } catch {
    // Fall through to default
  }
  return DEFAULT_THEME;
}

export function buildCssVariables(config: ThemeConfig): Record<string, string> {
  return { ...config.colors, ...config.fonts, ...config.radii };
}
