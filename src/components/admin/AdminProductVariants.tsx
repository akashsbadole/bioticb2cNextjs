'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { adminFetch } from '@/lib/admin-fetch';
import { formatPrice as libFormatPrice } from '@/lib/pricing';

interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string | null;
  price: number | null;
  comparePrice: number | null;
  wholesalePrice: number | null;
  stock: number;
  images: string;
  sortOrder: number;
  isActive: boolean;
}

interface AdminProductVariantsProps {
  productId: string;
  lowStockThreshold?: number;
  onVariantsChange?: (variants: ProductVariant[]) => void;
}

interface VariantFormData {
  name: string;
  sku: string;
  price: string;
  comparePrice: string;
  wholesalePrice: string;
  stock: string;
  images: string;
  sortOrder: string;
  isActive: boolean;
}

const emptyVariantForm: VariantFormData = {
  name: '',
  sku: '',
  price: '',
  comparePrice: '',
  wholesalePrice: '',
  stock: '0',
  images: '',
  sortOrder: '0',
  isActive: true,
};

function getStockBadge(stock: number, threshold: number) {
  if (stock <= 0) {
    return (
      <Badge variant="secondary" className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
        Out of stock
      </Badge>
    );
  }
  if (stock <= threshold) {
    return (
      <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        Low ({stock})
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
      {stock}
    </Badge>
  );
}

export function AdminProductVariants({ productId, lowStockThreshold = 10, onVariantsChange }: AdminProductVariantsProps) {
  const queryClient = useQueryClient();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [form, setForm] = useState<VariantFormData>(emptyVariantForm);
  const [saving, setSaving] = useState(false);

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Inline stock edit state
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [inlineStock, setInlineStock] = useState('');

  const { data: variants = [], isLoading: loading } = useQuery({
    queryKey: ['admin-variants', productId],
    queryFn: async () => {
        const res = await adminFetch(`/api/products/${productId}/variants`);
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        onVariantsChange?.(data.variants || []);
        return data.variants || [];
    }
  });

  const { data: currency = 'INR' } = useQuery({
    queryKey: ['admin-currency-minimal'],
    queryFn: async () => {
        const res = await adminFetch('/api/store/settings');
        const data = await res.json();
        const settings = data.settings || [];
        return settings.find((s: any) => s.key === 'currency')?.value || 'INR';
    }
  });

  const saveMutation = useMutation({
    mutationFn: async ({ id, data }: { id?: string, data: any }) => {
        const url = id
            ? `/api/products/${productId}/variants/${id}`
            : `/api/products/${productId}/variants`;
        const res = await adminFetch(url, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed');
        return res.json();
    },
    onSuccess: () => {
        toast.success(editingVariant ? 'Variant updated' : 'Variant created');
        setDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ['admin-variants', productId] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
        const res = await adminFetch(`/api/products/${productId}/variants/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
        toast.success('Variant deleted');
        setDeleteId(null);
        queryClient.invalidateQueries({ queryKey: ['admin-variants', productId] });
    }
  });

  const inlineStockMutation = useMutation({
    mutationFn: async ({ id, stock }: { id: string, stock: number }) => {
        const res = await adminFetch(`/api/products/${productId}/variants/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock }),
        });
        if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
        toast.success('Stock updated');
        setEditingStockId(null);
        queryClient.invalidateQueries({ queryKey: ['admin-variants', productId] });
    }
  });

  const formatPriceValue = (price: number | null) => {
    if (price === null || price === undefined) return '—';
    return libFormatPrice(price, currency);
  };

  const handleOpenAdd = () => {
    setEditingVariant(null);
    setForm(emptyVariantForm);
    setDialogOpen(true);
  };

  const handleOpenEdit = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setForm({
      name: variant.name,
      sku: variant.sku || '',
      price: variant.price !== null ? String(variant.price) : '',
      comparePrice: variant.comparePrice ? String(variant.comparePrice) : '',
      wholesalePrice: variant.wholesalePrice ? String(variant.wholesalePrice) : '',
      stock: String(variant.stock),
      images: variant.images || '',
      sortOrder: String(variant.sortOrder),
      isActive: variant.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('Variant name is required');
      return;
    }
    const payload = {
        name: form.name.trim(),
        sku: form.sku.trim() || null,
        price: form.price || null,
        comparePrice: form.comparePrice || null,
        wholesalePrice: form.wholesalePrice || null,
        stock: parseInt(form.stock) || 0,
        images: form.images || '[]',
        sortOrder: parseInt(form.sortOrder) || 0,
        isActive: form.isActive,
    };
    saveMutation.mutate({ id: editingVariant?.id, data: payload });
  };

  const handleDelete = () => {
    if (deleteId) deleteMutation.mutate(deleteId);
  };

  const handleInlineStockSave = (variantId: string) => {
    const newStock = parseInt(inlineStock);
    if (isNaN(newStock) || newStock < 0) {
      toast.error('Enter a valid stock quantity');
      return;
    }
    inlineStockMutation.mutate({ id: variantId, stock: newStock });
  };

  const startInlineStockEdit = (variant: ProductVariant) => {
    setEditingStockId(variant.id);
    setInlineStock(String(variant.stock));
  };

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="h-10 w-full rounded bg-muted animate-pulse" />
        <div className="h-10 w-full rounded bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            Variants ({variants.length})
          </span>
        </div>
        <Button size="sm" onClick={handleOpenAdd}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Variant
        </Button>
      </div>

      {variants.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <Package className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            No variants yet. Add variants for different sizes, colors, etc.
          </p>
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="hidden sm:table-cell">Wholesale</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell className="font-medium">{variant.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {variant.sku || '—'}
                  </TableCell>
                  <TableCell>{formatPriceValue(variant.price)}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-amber-700 dark:text-amber-400">
                      {formatPriceValue(variant.wholesalePrice)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {editingStockId === variant.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min="0"
                          value={inlineStock}
                          onChange={(e) => setInlineStock(e.target.value)}
                          className="h-7 w-20 text-xs"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleInlineStockSave(variant.id);
                            if (e.key === 'Escape') setEditingStockId(null);
                          }}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => handleInlineStockSave(variant.id)}
                        >
                          <Check className="h-3 w-3 text-emerald-600" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => setEditingStockId(null)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startInlineStockEdit(variant)}
                        className="hover:opacity-80 transition-opacity"
                      >
                        {getStockBadge(variant.stock, lowStockThreshold)}
                      </button>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        variant.isActive
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                      }
                    >
                      {variant.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenEdit(variant)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        onClick={() => setDeleteId(variant.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Variant Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingVariant ? 'Edit Variant' : 'Add Variant'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="variant-name">
                Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="variant-name"
                placeholder="e.g., Red / Large"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="variant-sku">SKU</Label>
                <Input
                  id="variant-sku"
                  placeholder="SKU-RED-L"
                  value={form.sku}
                  onChange={(e) => setForm(prev => ({ ...prev, sku: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="variant-stock">Stock</Label>
                <Input
                  id="variant-stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.stock}
                  onChange={(e) => setForm(prev => ({ ...prev, stock: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="variant-price">Price</Label>
                <Input
                  id="variant-price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="variant-compare">Compare Price</Label>
                <Input
                  id="variant-compare"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.comparePrice}
                  onChange={(e) => setForm(prev => ({ ...prev, comparePrice: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="variant-wholesale">Wholesale</Label>
                <Input
                  id="variant-wholesale"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.wholesalePrice}
                  onChange={(e) => setForm(prev => ({ ...prev, wholesalePrice: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="variant-sort">Sort Order</Label>
              <Input
                id="variant-sort"
                type="number"
                placeholder="0"
                value={form.sortOrder}
                onChange={(e) => setForm(prev => ({ ...prev, sortOrder: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) =>
                  setForm(prev => ({ ...prev, isActive: checked }))
                }
              />
              <Label className="cursor-pointer" onClick={() =>
                setForm(prev => ({ ...prev, isActive: !prev.isActive }))
              }>
                Active
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingVariant ? 'Update Variant' : 'Create Variant'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Variant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this variant? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
