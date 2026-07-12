"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Clock, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { adminFetch } from "@/lib/admin-fetch";

interface FlashSaleProduct {
  id: string;
  productId: string;
  discountType: string;
  discountValue: number;
  Product?: { id: string; name: string; slug: string; price: number; images: string };
}

interface FlashSale {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  products: FlashSaleProduct[];
}

interface ProductOption {
  id: string;
  name: string;
}

const emptyForm = {
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  isActive: true,
  products: [] as { productId: string; discountType: string; discountValue: number }[],
};

export function AdminFlashSales() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FlashSale | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<ProductOption[]>([]);

  const { data: flashSales = [], isLoading } = useQuery({
    queryKey: ["admin-flash-sales"],
    queryFn: async () => {
      const res = await adminFetch("/api/flash-sales");
      if (!res.ok) throw new Error("Failed to load");
      return (await res.json()).flashSales || [];
    },
  });

  const { data: allProducts = [] } = useQuery({
    queryKey: ["admin-products-list"],
    queryFn: async () => {
      const res = await adminFetch("/api/products?all=true&limit=500");
      if (!res.ok) return [];
      return (await res.json()).products || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const url = editing ? `/api/flash-sales/${editing.id}` : "/api/flash-sales";
      const res = await adminFetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to save");
      return res.json();
    },
    onSuccess: () => {
      toast.success(editing ? "Flash sale updated" : "Flash sale created");
      setFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-flash-sales"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`/api/flash-sales/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      toast.success("Flash sale deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-flash-sales"] });
      setDeleteId(null);
    },
  });

  const handleOpenAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const handleOpenEdit = (fs: FlashSale) => {
    setEditing(fs);
    setForm({
      name: fs.name,
      description: fs.description || "",
      startDate: new Date(fs.startDate).toISOString().slice(0, 16),
      endDate: new Date(fs.endDate).toISOString().slice(0, 16),
      isActive: fs.isActive,
      products: fs.products.map((p) => ({
        productId: p.productId,
        discountType: p.discountType,
        discountValue: p.discountValue,
      })),
    });
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.startDate || !form.endDate) {
      toast.error("Name, start date, and end date are required");
      return;
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      toast.error("End date must be after start date");
      return;
    }
    saveMutation.mutate(form);
  };

  const addProduct = (productId: string) => {
    if (form.products.find((p) => p.productId === productId)) return;
    setForm((prev) => ({
      ...prev,
      products: [...prev.products, { productId, discountType: "percentage", discountValue: 0 }],
    }));
    setProductSearch("");
    setProductResults([]);
  };

  const removeProduct = (productId: string) => {
    setForm((prev) => ({ ...prev, products: prev.products.filter((p) => p.productId !== productId) }));
  };

  const updateProductDiscount = (productId: string, field: string, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.productId === productId ? { ...p, [field]: value } : p)),
    }));
  };

  const handleProductSearch = (query: string) => {
    setProductSearch(query);
    if (query.length < 2) {
      setProductResults([]);
      return;
    }
    const filtered = allProducts
      .filter((p: any) =>
        p.name.toLowerCase().includes(query.toLowerCase()) &&
        !form.products.find((fp) => fp.productId === p.id)
      )
      .slice(0, 8)
      .map((p: any) => ({ id: p.id, name: p.name }));
    setProductResults(filtered);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const getStatus = (fs: FlashSale) => {
    const now = new Date();
    const start = new Date(fs.startDate);
    const end = new Date(fs.endDate);
    if (!fs.isActive) return { label: "Inactive", color: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" };
    if (now < start) return { label: "Scheduled", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
    if (now > end) return { label: "Ended", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" };
    return { label: "Active", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" };
  };

  const getTimeRemaining = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return "Ended";
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${h}h ${m}m remaining`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Flash Sales</h2>
          <p className="text-muted-foreground mt-1">Create time-limited discounts</p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="mr-2 h-4 w-4" /> New Flash Sale
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : flashSales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No flash sales</h3>
            <p className="mt-1 text-sm text-muted-foreground">Create your first time-limited promotion.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Duration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flashSales.map((fs: FlashSale) => {
                  const status = getStatus(fs);
                  return (
                    <TableRow key={fs.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{fs.name}</p>
                          {fs.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{fs.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {fs.products.length === 0 ? (
                            <span className="text-xs text-muted-foreground">None</span>
                          ) : (
                            <Badge variant="secondary">{fs.products.length} product(s)</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={status.color}>
                          {status.label}
                          {status.label === "Active" && (
                            <span className="ml-1 text-[10px]">{getTimeRemaining(fs.endDate)}</span>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(fs.startDate)} → {formatDate(fs.endDate)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(fs)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600" onClick={() => setDeleteId(fs.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Flash Sale" : "New Flash Sale"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[calc(90vh-140px)] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label htmlFor="fs-name">Name <span className="text-rose-500">*</span></Label>
              <Input id="fs-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Summer Sale" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fs-desc">Description</Label>
              <Textarea id="fs-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fs-start">Start Date <span className="text-rose-500">*</span></Label>
                <Input id="fs-start" type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fs-end">End Date <span className="text-rose-500">*</span></Label>
                <Input id="fs-end" type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              <Label className="cursor-pointer">Active</Label>
            </div>

            {/* Products */}
            <div className="space-y-3">
              <Label>Discounted Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products to add..."
                  value={productSearch}
                  onChange={(e) => handleProductSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              {productResults.length > 0 && (
                <div className="rounded-md border max-h-32 overflow-y-auto">
                  {productResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors border-b last:border-b-0"
                      onClick={() => addProduct(p.id)}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
              {form.products.length === 0 ? (
                <p className="text-xs text-muted-foreground">No products added yet.</p>
              ) : (
                <div className="space-y-2">
                  {form.products.map((fp) => {
                    const product = allProducts.find((p: any) => p.id === fp.productId) as any;
                    return (
                      <div key={fp.productId} className="flex items-center gap-2 border rounded-lg p-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product?.name || fp.productId.slice(0, 8)}</p>
                        </div>
                        <Select
                          value={fp.discountType}
                          onValueChange={(v) => updateProductDiscount(fp.productId, "discountType", v)}
                        >
                          <SelectTrigger className="h-8 w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">% Off</SelectItem>
                            <SelectItem value="fixed">₹ Off</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min="0"
                          className="h-8 w-20"
                          value={fp.discountValue}
                          onChange={(e) => updateProductDiscount(fp.productId, "discountValue", parseFloat(e.target.value) || 0)}
                        />
                        <button
                          type="button"
                          onClick={() => removeProduct(fp.productId)}
                          className="text-rose-500 hover:text-rose-700 text-lg leading-none px-1"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Flash Sale</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) deleteMutation.mutate(deleteId); }} className="bg-rose-600 hover:bg-rose-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
