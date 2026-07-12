"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Palette, RotateCcw, Check, Eye, Save, PaintBucket } from "lucide-react";

interface ThemeConfig {
  name: string;
  colors: Record<string, string>;
  fonts: Record<string, string>;
  radii: Record<string, string>;
}

interface ThemeItem {
  id: string | null;
  slug: string;
  name: string;
  description: string | null;
  isActive: boolean;
  config: ThemeConfig;
  installed: boolean;
}

const COLOR_LABELS: Record<string, string> = {
  "--background": "Background",
  "--foreground": "Text Color",
  "--primary": "Primary",
  "--primary-foreground": "Primary Text",
  "--secondary": "Secondary",
  "--secondary-foreground": "Secondary Text",
  "--muted": "Muted Background",
  "--muted-foreground": "Muted Text",
  "--accent": "Accent",
  "--accent-foreground": "Accent Text",
  "--destructive": "Destructive",
  "--border": "Border",
  "--input": "Input Border",
  "--ring": "Focus Ring",
  "--card": "Card Background",
  "--card-foreground": "Card Text",
  "--popover": "Popover Background",
  "--popover-foreground": "Popover Text",
  "--brand-primary": "Brand Primary",
  "--brand-primary-hover": "Brand Primary Hover",
  "--brand-secondary": "Brand Secondary",
  "--brand-secondary-hover": "Brand Secondary Hover",
  "--brand-accent": "Brand Accent",
  "--brand-accent-hover": "Brand Accent Hover",
  "--brand-text": "Brand Text",
  "--brand-text-dark": "Brand Text Dark",
  "--brand-text-light": "Brand Text Light",
  "--brand-bg": "Brand Background",
  "--brand-bg-section": "Brand Section BG",
};

export function AdminThemeCustomizer() {
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("themes");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editConfig, setEditConfig] = useState<ThemeConfig | null>(null);
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);

  const fetchThemes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/themes");
      const data = await res.json();
      setThemes(data.themes || []);

      const active = data.themes?.find((t: ThemeItem) => t.isActive);
      if (active && !previewTheme) {
        applyTheme(active.config);
      }
    } catch {
      toast.error("Failed to load themes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  const applyTheme = (config: ThemeConfig) => {
    const root = document.documentElement;
    for (const [key, value] of Object.entries(config.colors)) {
      root.style.setProperty(key, value);
    }
    for (const [key, value] of Object.entries(config.radii)) {
      root.style.setProperty(key, value);
    }
  };

  const activateTheme = async (theme: ThemeItem) => {
    if (!theme.id) {
      const res = await fetch("/api/themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: theme.slug,
          name: theme.name,
          config: theme.config,
          activate: true,
        }),
      });
      if (!res.ok) {
        toast.error("Failed to activate theme");
        return;
      }
    } else {
      const res = await fetch("/api/themes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeId: theme.id, activate: true }),
      });
      if (!res.ok) {
        toast.error("Failed to activate theme");
        return;
      }
    }

    applyTheme(theme.config);
    setPreviewTheme(theme.slug);
    toast.success(`${theme.name} activated`);
    fetchThemes();
  };

  const startEditing = (theme: ThemeItem) => {
    setEditingSlug(theme.slug);
    setEditConfig(JSON.parse(JSON.stringify(theme.config)));
  };

  const saveCustomTheme = async () => {
    if (!editingSlug || !editConfig) return;

    const res = await fetch("/api/themes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: editingSlug,
        name: editConfig.name,
        config: editConfig,
        activate: false,
      }),
    });

    if (!res.ok) {
      toast.error("Failed to save theme");
      return;
    }

    applyTheme(editConfig);
    toast.success("Theme saved");
    setEditingSlug(null);
    setEditConfig(null);
    fetchThemes();
  };

  const updateColor = (key: string, value: string) => {
    if (!editConfig) return;
    setEditConfig({
      ...editConfig,
      colors: { ...editConfig.colors, [key]: value },
    });
    document.documentElement.style.setProperty(key, value);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Customizer
          </h2>
          <p className="text-sm text-muted-foreground">
            Customize the look and feel of your store. Changes apply instantly
            in preview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {previewTheme && (
            <Badge variant="outline" className="text-xs">
              <Eye className="h-3 w-3 mr-1" />
              Previewing: {previewTheme}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={fetchThemes}>
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="themes">Available Themes</TabsTrigger>
          <TabsTrigger value="customizer" disabled={!editingSlug}>
            Customizer {editingSlug && `(${editingSlug})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="themes" className="space-y-4 mt-4">
          {themes.map((theme) => (
            <Card
              key={theme.slug}
              className={
                theme.isActive ? "ring-2 ring-primary/30" : ""
              }
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{theme.name}</CardTitle>
                      {theme.isActive && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-none">
                          Active
                        </Badge>
                      )}
                      {!theme.installed && (
                        <Badge variant="outline">Not Installed</Badge>
                      )}
                    </div>
                    <CardDescription>{theme.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Color swatches */}
                  {Object.entries(theme.config.colors || {}).slice(0, 8).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center gap-1.5 text-xs"
                      title={`${COLOR_LABELS[key] || key}: ${value}`}
                    >
                      <div
                        className="h-5 w-5 rounded border border-border"
                        style={{ backgroundColor: value }}
                      />
                    </div>
                  ))}
                  {Object.keys(theme.config.colors || {}).length > 8 && (
                    <span className="text-xs text-muted-foreground">
                      +{Object.keys(theme.config.colors).length - 8} more
                    </span>
                  )}
                </div>
              </CardContent>
              <div className="px-6 pb-4 flex items-center gap-2">
                {!theme.isActive && (
                  <Button
                    size="sm"
                    onClick={() => activateTheme(theme)}
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Activate
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => startEditing(theme)}
                >
                  <PaintBucket className="h-3.5 w-3.5 mr-1" />
                  Customize
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="customizer" className="mt-4">
          {editConfig && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  Editing: {editConfig.name}
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingSlug(null);
                      setEditConfig(null);
                      fetchThemes();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={saveCustomTheme}>
                    <Save className="h-3.5 w-3.5 mr-1" />
                    Save Theme
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Theme Name</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    value={editConfig.name}
                    onChange={(e) =>
                      setEditConfig({ ...editConfig, name: e.target.value })
                    }
                    placeholder="My Custom Theme"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Colors</CardTitle>
                  <CardDescription>
                    Customize colors. Changes preview instantly.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(editConfig.colors).map(([key, value]) => (
                      <div key={key} className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          {COLOR_LABELS[key] || key.replace(/^--/, "")}
                        </Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={value}
                            onChange={(e) => updateColor(key, e.target.value)}
                            className="h-8 w-8 rounded cursor-pointer border border-input bg-transparent"
                          />
                          <Input
                            value={value}
                            onChange={(e) => updateColor(key, e.target.value)}
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Border Radius</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {Object.entries(editConfig.radii).map(([key, value]) => (
                      <div key={key} className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          {key.replace(/^--/, "")}
                        </Label>
                        <Input
                          value={value}
                          onChange={(e) => {
                            setEditConfig({
                              ...editConfig,
                              radii: { ...editConfig.radii, [key]: e.target.value },
                            });
                            document.documentElement.style.setProperty(key, e.target.value);
                          }}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
