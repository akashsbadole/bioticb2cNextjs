export interface ThemeConfig {
  name: string;
  colors: Record<string, string>;
  fonts: Record<string, string>;
  radii: Record<string, string>;
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

export function buildCssVariables(config: ThemeConfig): Record<string, string> {
  return { ...config.colors, ...config.fonts, ...config.radii };
}
