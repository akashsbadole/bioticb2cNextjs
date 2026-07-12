"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, GripVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { adminFetch } from "@/lib/admin-fetch";

interface Addon {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isActive: boolean;
  sortOrder: number;
}

export function AdminProductAddons({ productId }: { productId: string }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Addon | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);

  const { data: addons = [], isLoading } = useQuery({
    queryKey: ["product-addons", productId],
    queryFn: async () => {
      const res = await adminFetch(`/api/products/${productId}/addons`);
      if (!res.ok) return [];
      return (await res.json()).addons || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; price: number; isActive: boolean }) => {
      const res = await adminFetch(`/api/products/${productId}/addons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Add-on created");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["product-addons", productId] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await adminFetch(`/api/product-addons/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Add-on updated");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["product-addons", productId] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`/api/product-addons/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      toast.success("Add-on deleted");
      queryClient.invalidateQueries({ queryKey: ["product-addons", productId] });
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setName("");
    setDescription("");
    setPrice("");
    setIsActive(true);
  };

  const handleEdit = (addon: Addon) => {
    setEditing(addon);
    setName(addon.name);
    setDescription(addon.description || "");
    setPrice(String(addon.price));
    setIsActive(addon.isActive);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!name || !price) { toast.error("Name and price are required"); return; }
    const data = { name, description, price: parseFloat(price), isActive };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Optional add-ons customers can purchase with this product.</p>
        <Button size="sm" variant="outline" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Add Add-on
        </Button>
      </div>

      {showForm && (
        <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Name</Label>
              <Input size={1} value={name} onChange={(e) => setName(e.target.value)} placeholder="Gift wrapping" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Price</Label>
              <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="99" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Description</Label>
            <Input size={1} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <Label className="text-xs cursor-pointer">Active</Label>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {editing ? "Update" : "Create"}
            </Button>
            <Button size="sm" variant="outline" onClick={resetForm}>Cancel</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : addons.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg">No add-ons configured.</p>
      ) : (
        <div className="space-y-2">
          {addons.map((addon: Addon) => (
            <div key={addon.id} className="flex items-center gap-3 border rounded-lg p-3">
              <GripVertical className="h-4 w-4 text-muted-foreground/50" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{addon.name}</p>
                {addon.description && <p className="text-xs text-muted-foreground truncate">{addon.description}</p>}
              </div>
              <span className="text-sm font-bold text-primary">₹{addon.price}</span>
              <span className={`text-xs ${addon.isActive ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                {addon.isActive ? 'Active' : 'Inactive'}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(addon)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600" onClick={() => deleteMutation.mutate(addon.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
