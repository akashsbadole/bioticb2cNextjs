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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Gift,
  Plus,
  Trash2,
  Edit,
  X,
  Save,
  Package,
  Search,
} from "lucide-react";

interface BundleItem {
  id: string;
  productId: string;
  quantity: number;
  Product: { id: string; name: string; price: number; images: string };
}

interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image: string | null;
  isActive: boolean;
  items: BundleItem[];
}

export function AdminBundles() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Bundle | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [formItems, setFormItems] = useState<Array<{ productId: string; quantity: number }>>([]);
  const [searchProductId, setSearchProductId] = useState("");

  const fetchBundles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bundles?admin=true");
      const data = await res.json();
      setBundles(data.bundles || []);
    } catch {
      toast.error("Failed to load bundles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBundles();
  }, [fetchBundles]);

  const resetForm = () => {
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormPrice("");
    setFormImage("");
    setFormActive(true);
    setFormItems([]);
    setSearchProductId("");
    setEditing(null);
  };

  const openEdit = (bundle: Bundle) => {
    setEditing(bundle);
    setFormName(bundle.name);
    setFormSlug(bundle.slug);
    setFormDescription(bundle.description || "");
    setFormPrice(String(bundle.price));
    setFormImage(bundle.image || "");
    setFormActive(bundle.isActive);
    setFormItems(bundle.items.map((i) => ({ productId: i.productId, quantity: i.quantity })));
    setShowForm(true);
  };

  const addItem = () => {
    if (!searchProductId) return;
    setFormItems((prev) => [...prev, { productId: searchProductId, quantity: 1 }]);
    setSearchProductId("");
  };

  const removeItem = (idx: number) => {
    setFormItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItemQty = (idx: number, qty: number) => {
    setFormItems((prev) => prev.map((item, i) => (i === idx ? { ...item, quantity: qty } : item)));
  };

  const saveBundle = async () => {
    if (!formName || !formSlug || !formPrice) {
      toast.error("Name, slug, and price are required");
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: formName,
        slug: formSlug,
        description: formDescription || null,
        price: parseFloat(formPrice),
        image: formImage || null,
        isActive: formActive,
        productIds: formItems.map((i) => i.productId),
        quantities: formItems.map((i) => i.quantity),
      };

      if (editing) body.id = editing.id;

      const res = await fetch("/api/bundles", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save bundle");
      toast.success(editing ? "Bundle updated" : "Bundle created");
      setShowForm(false);
      resetForm();
      fetchBundles();
    } catch (e: any) {
      toast.error(e.message || "Failed to save bundle");
    } finally {
      setSaving(false);
    }
  };

  const deleteBundle = async (id: string) => {
    try {
      const res = await fetch("/api/bundles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Bundle deleted");
      setBundles((prev) => prev.filter((b) => b.id !== id));
    } catch {
      toast.error("Failed to delete bundle");
    }
  };

  const getTotalOriginalPrice = (items: BundleItem[]) => {
    return items.reduce((sum, item) => sum + item.Product.price * item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Product Bundles
          </h2>
          <p className="text-sm text-muted-foreground">
            Create product bundles that customers can purchase at a special price.
          </p>
        </div>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? <X className="h-3.5 w-3.5 mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
          {showForm ? "Cancel" : "New Bundle"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">{editing ? "Edit Bundle" : "New Bundle"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Name</Label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} className="text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Slug</Label>
                <Input value={formSlug} onChange={(e) => setFormSlug(e.target.value)} className="text-xs" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="text-xs" rows={2} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Bundle Price</Label>
                <Input type="number" step="0.01" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} className="text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Image URL (optional)</Label>
                <Input value={formImage} onChange={(e) => setFormImage(e.target.value)} className="text-xs" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="bundle-active" checked={formActive} onCheckedChange={setFormActive} />
              <Label htmlFor="bundle-active" className="text-xs">Active</Label>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Products in Bundle</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={searchProductId}
                  onChange={(e) => setSearchProductId(e.target.value)}
                  placeholder="Enter product ID..."
                  className="text-xs"
                />
                <Button size="sm" variant="outline" onClick={addItem}>
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
              {formItems.length > 0 && (
                <div className="space-y-1">
                  {formItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 border rounded text-xs">
                      <span className="flex-1 truncate font-mono">{item.productId}</span>
                      <div className="flex items-center gap-1">
                        <span>Qty:</span>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateItemQty(idx, parseInt(e.target.value) || 1)}
                          className="h-7 w-16 text-xs"
                        />
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeItem(idx)} className="h-7 w-7 p-0 text-rose-500">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button size="sm" onClick={saveBundle} disabled={saving}>
              <Save className="h-3.5 w-3.5 mr-1" />
              {saving ? "Saving..." : "Save Bundle"}
            </Button>
          </CardContent>
        </Card>
      )}

      {bundles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Gift className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No bundles created yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {bundles.map((bundle) => {
            const totalOriginal = getTotalOriginalPrice(bundle.items);
            const savings = totalOriginal - bundle.price;
            return (
              <Card key={bundle.id} className={!bundle.isActive ? "opacity-60" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm flex items-center gap-2">
                        {bundle.name}
                        {!bundle.isActive && <Badge variant="outline" className="text-[10px]">Inactive</Badge>}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {bundle.items.length} products · {bundle.slug}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold text-primary">${bundle.price.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground line-through">${totalOriginal.toFixed(2)}</span>
                    {savings > 0 && (
                      <Badge className="bg-emerald-100 text-emerald-700 border-none text-[10px]">
                        Save ${savings.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{bundle.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {bundle.items.map((item) => (
                      <Badge key={item.id} variant="secondary" className="text-[10px]">
                        {item.quantity}x {item.Product.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(bundle)}>
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteBundle(bundle.id)} className="text-rose-500">
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
