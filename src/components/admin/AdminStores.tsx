"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  ArrowRightLeft,
  Store,
  Globe,
  Package,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { adminFetch } from "@/lib/admin-fetch";

interface StoreItem {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  plan: string;
  isActive: boolean;
  isPaused: boolean;
  createdAt: string;
  description?: string | null;
  settings?: string;
  _count: {
    Product: number;
    Category: number;
  };
}

interface StoreFormData {
  name: string;
  slug: string;
  domain: string;
  description: string;
  settings: {
    currency: string;
    tax_rate: string;
  };
}

const emptyForm: StoreFormData = {
  name: "",
  slug: "",
  domain: "",
  description: "",
  settings: {
    currency: "INR",
    tax_rate: "0",
  },
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 40);
}

export function AdminStores() {
  const queryClient = useQueryClient();
  const [currentStoreId, setCurrentStoreId] = useState<string | null>(null);

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreItem | null>(null);
  const [form, setForm] = useState<StoreFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete dialog state
  const [deleteStore, setDeleteStore] = useState<StoreItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Switch loading state
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  const { data: stores = [], isLoading: loading } = useQuery({
    queryKey: ["admin-stores"],
    queryFn: async () => {
        const res = await adminFetch("/api/stores");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        const active = data.stores?.find((s: StoreItem) => s.isActive && !s.isPaused);
        if (active && !currentStoreId) setCurrentStoreId(active.id);
        return data.stores || [];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async ({ id, data }: { id?: string, data: any }) => {
        const url = id ? `/api/stores/${id}` : "/api/stores";
        const res = await adminFetch(url, {
            method: id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed");
        return res.json();
    },
    onSuccess: () => {
        toast.success(editingStore ? "Store updated" : "Store created");
        setFormOpen(false);
        queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
    }
  });

  const switchMutation = useMutation({
    mutationFn: async (id: string) => {
        const res = await adminFetch(`/api/stores/${id}/switch`, { method: "POST" });
        if (!res.ok) throw new Error("Failed");
    },
    onSuccess: (_, id) => {
        setCurrentStoreId(id);
        toast.success("Switched store");
        queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
        const res = await adminFetch(`/api/stores/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed");
    },
    onSuccess: (_, id) => {
        toast.success("Store deactivated");
        if (currentStoreId === id) setCurrentStoreId(null);
        setDeleteStore(null);
        queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
    }
  });

  const handleOpenAdd = () => {
    setEditingStore(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const handleOpenEdit = async (store: StoreItem) => {
    try {
      const res = await adminFetch(`/api/stores/${store.id}`);
      if (res.ok) {
        const data = await res.json();
        const full = data.store;
        let parsedSettings: Record<string, string> = {};
        try {
          parsedSettings = JSON.parse(full.settings || "{}");
        } catch {
          /* ignore */
        }

        setEditingStore(store);
        setForm({
          name: full.name,
          slug: full.slug,
          domain: full.domain || "",
          description: full.description || "",
          settings: {
            currency: parsedSettings.currency || "INR",
            tax_rate: parsedSettings.tax_rate || "0",
          },
        });
        setFormOpen(true);
      }
    } catch {
      toast.error("Failed to load store details");
    }
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: editingStore ? prev.slug : generateSlug(name),
    }));
  };

  const handleSave = () => {
    if (!form.name.trim() || form.name.trim().length < 2) {
      toast.error("Store name must be at least 2 characters");
      return;
    }
    const payload = {
        name: form.name.trim(),
        domain: form.domain.trim() || null,
        description: form.description.trim() || null,
        settings: {
          currency: form.settings.currency || "INR",
          tax_rate: form.settings.tax_rate || "0",
        },
    };
    saveMutation.mutate({ id: editingStore?.id, data: payload });
  };

  const handleSwitch = (store: StoreItem) => {
    switchMutation.mutate(store.id);
  };

  const handleDelete = () => {
    if (deleteStore) deleteMutation.mutate(deleteStore.id);
  };

  const activeStore = stores.find((s) => s.id === currentStoreId);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6 space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Stores</h2>
          <p className="text-muted-foreground mt-1">
            Manage your stores and switch between them
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleOpenAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Create Store
          </Button>
        </div>
      </div>

      {/* Active Store Info */}
      {activeStore && (
        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <Store className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                    Active Store
                  </p>
                  <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                    {activeStore.name}
                  </p>
                </div>
              </div>
              <div className="text-right text-sm text-emerald-700 dark:text-emerald-300">
                <p className="font-mono">
                  {activeStore.slug}.
                  {process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "wcommerce.com"}
                </p>
                {activeStore.domain && (
                  <p className="text-xs opacity-75">{activeStore.domain}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stores Grid */}
      {stores.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Store className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No stores yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first store to get started
            </p>
            <Button className="mt-4" onClick={handleOpenAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Create Store
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => {
            const isCurrent = store.id === currentStoreId;
            const isSwitching = store.id === switchingId;

            return (
              <Card
                key={store.id}
                className={`transition-all ${
                  isCurrent
                    ? "ring-2 ring-emerald-500 border-emerald-300 dark:border-emerald-700"
                    : "hover:border-muted-foreground/30"
                } ${!store.isActive ? "opacity-60" : ""}`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base">{store.name}</h3>
                      {isCurrent && (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs"
                        >
                          Active
                        </Badge>
                      )}
                      {!store.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 shrink-0" />
                      <span className="font-mono text-xs truncate">
                        {store.slug}.
                        {process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ||
                          "wcommerce.com"}
                      </span>
                    </div>
                    {store.domain && (
                      <div className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-xs truncate">{store.domain}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 pt-1">
                      <span className="flex items-center gap-1">
                        <Package className="h-3.5 w-3.5" />
                        {store._count.Product} products
                      </span>

                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    {!isCurrent && store.isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        disabled={switchMutation.isPending || !store.isActive}
                        onClick={() => handleSwitch(store)}
                      >
                        {switchMutation.isPending && switchMutation.variables === store.id ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ArrowRightLeft className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        {switchMutation.isPending && switchMutation.variables === store.id ? "Switching..." : "Switch"}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 px-0"
                      onClick={() => handleOpenEdit(store)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 px-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      onClick={() => setDeleteStore(store)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingStore ? "Edit Store" : "Create Store"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">
                Store Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="store-name"
                placeholder="Purva Bites"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-slug">Slug</Label>
              <Input
                id="store-slug"
                placeholder="my-store"
                value={form.slug}
                disabled={!!editingStore}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, slug: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                {editingStore
                  ? "Slug cannot be changed after creation"
                  : `Auto-generated from name. Your store will be at {slug}.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "wcommerce.com"}`}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-domain">Custom Domain (optional)</Label>
              <Input
                id="store-domain"
                placeholder="shop.example.com"
                value={form.domain}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, domain: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Point a custom domain to your store
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-description">Description (optional)</Label>
              <Textarea
                id="store-description"
                placeholder="A brief description of your store"
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="store-currency">Currency</Label>
                <Input
                  id="store-currency"
                  placeholder="USD"
                  value={form.settings.currency}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, currency: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-tax-rate">Tax Rate (%)</Label>
                <Input
                  id="store-tax-rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0"
                  value={form.settings.tax_rate}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, tax_rate: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {saveMutation.isPending
                ? "Saving..."
                : editingStore
                  ? "Update Store"
                  : "Create Store"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteStore}
        onOpenChange={() => setDeleteStore(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Store</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate &quot;{deleteStore?.name}
              &quot;? This store will no longer be accessible. This action can
              be reversed by contacting support.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {deleteMutation.isPending ? "Deleting..." : "Deactivate Store"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
