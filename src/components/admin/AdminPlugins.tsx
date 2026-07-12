"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Puzzle,
  Power,
  PowerOff,
  Trash2,
  RotateCcw,
  ExternalLink,
} from "lucide-react";

interface PluginItem {
  key: string;
  name: string;
  description: string;
  version: string;
  id: string | null;
  enabled: boolean;
  config: Record<string, unknown>;
  installed: boolean;
  hooks?: {
    filters?: Array<{ name: string; priority?: number }>;
    actions?: Array<{ name: string; priority?: number }>;
  };
}

export function AdminPlugins() {
  const [plugins, setPlugins] = useState<PluginItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlugins = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/plugins");
      const data = await res.json();
      setPlugins(data.plugins || []);
    } catch {
      toast.error("Failed to load plugins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlugins();
  }, []);

  const togglePlugin = async (plugin: PluginItem) => {
    try {
      const res = await fetch("/api/plugins", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: plugin.id,
          key: plugin.key,
          enabled: !plugin.enabled,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to toggle plugin");
      }

      setPlugins((prev) =>
        prev.map((p) =>
          p.key === plugin.key ? { ...p, enabled: !p.enabled } : p
        )
      );
      toast.success(`${plugin.name} ${plugin.enabled ? "disabled" : "enabled"}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to toggle plugin");
    }
  };

  const installPlugin = async (plugin: PluginItem) => {
    try {
      const res = await fetch("/api/plugins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: plugin.key,
          name: plugin.name,
          description: plugin.description,
          version: plugin.version,
          config: plugin.config,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to install plugin");
      }

      toast.success(`${plugin.name} installed`);
      fetchPlugins();
    } catch (e: any) {
      toast.error(e.message || "Failed to install plugin");
    }
  };

  const uninstallPlugin = async (plugin: PluginItem) => {
    if (!plugin.id) return;
    try {
      const res = await fetch("/api/plugins", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: plugin.id }),
      });

      if (!res.ok) throw new Error("Failed to uninstall plugin");

      toast.success(`${plugin.name} uninstalled`);
      fetchPlugins();
    } catch {
      toast.error("Failed to uninstall plugin");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
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
            <Puzzle className="h-5 w-5" />
            Plugins
          </h2>
          <p className="text-sm text-muted-foreground">
            Extend functionality with plugins. Enable or disable plugins to
            control features.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPlugins}>
          <RotateCcw className="h-3.5 w-3.5 mr-1" />
          Refresh
        </Button>
      </div>

      {plugins.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Puzzle className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No plugins available.</p>
          </CardContent>
        </Card>
      )}

      {plugins.map((plugin) => (
        <Card key={plugin.key} className={!plugin.enabled ? "opacity-60" : ""}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{plugin.name}</CardTitle>
                  <Badge variant={plugin.installed ? "default" : "outline"}>
                    v{plugin.version}
                  </Badge>
                  {plugin.enabled && (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-700 border-none"
                    >
                      Active
                    </Badge>
                  )}
                </div>
                <CardDescription>{plugin.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id={`plugin-${plugin.key}`}
                    checked={plugin.enabled}
                    onCheckedChange={() => togglePlugin(plugin)}
                    disabled={!plugin.installed}
                  />
                  <Label htmlFor={`plugin-${plugin.key}`} className="text-sm cursor-pointer">
                    {plugin.enabled ? (
                      <span className="flex items-center gap-1">
                        <Power className="h-3 w-3 text-emerald-600" />
                        Enabled
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <PowerOff className="h-3 w-3 text-muted-foreground" />
                        Disabled
                      </span>
                    )}
                  </Label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {plugin.installed ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => uninstallPlugin(plugin)}
                    className="text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Uninstall
                  </Button>
                ) : (
                  <Button variant="default" size="sm" onClick={() => installPlugin(plugin)}>
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    Install
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
          {(plugin.hooks?.filters?.length || plugin.hooks?.actions?.length) && (
            <CardFooter className="pt-0 border-t text-xs text-muted-foreground">
              <div className="flex flex-wrap gap-2 pt-2 w-full">
                {plugin.hooks?.filters?.map((f) => (
                  <Badge key={f.name} variant="outline" className="text-[10px]">
                    filter: {f.name}
                  </Badge>
                ))}
                {plugin.hooks?.actions?.map((a) => (
                  <Badge key={a.name} variant="outline" className="text-[10px]">
                    action: {a.name}
                  </Badge>
                ))}
              </div>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}
