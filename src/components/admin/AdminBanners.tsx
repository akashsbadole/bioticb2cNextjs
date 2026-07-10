'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Upload,
  ImageIcon,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { adminFetch } from '@/lib/admin-fetch';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image: string | null;
  link: string | null;
  linkText: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface BannerFormData {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  linkText: string;
  sortOrder: string;
  isActive: boolean;
}

const emptyForm: BannerFormData = {
  title: '',
  subtitle: '',
  image: '',
  link: '',
  linkText: '',
  sortOrder: '0',
  isActive: true,
};

export function AdminBanners() {
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState<BannerFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data: banners = [], isLoading: loading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: async () => {
        const res = await adminFetch('/api/banners?all=true');
        if (!res.ok) throw new Error('Failed');
        return (await res.json()).banners || [];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async ({ id, data }: { id?: string, data: any }) => {
        const url = id ? `/api/banners/${id}` : '/api/banners';
        const res = await adminFetch(url, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed');
        return res.json();
    },
    onSuccess: () => {
        toast.success(editingBanner ? 'Banner updated' : 'Banner created');
        setFormOpen(false);
        queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
        const res = await adminFetch(`/api/banners/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
        toast.success('Banner deleted');
        setDeleteId(null);
        queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string, isActive: boolean }) => {
        const res = await adminFetch(`/api/banners/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive }),
        });
        if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
        toast.success('Banner updated');
        queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
    }
  });

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const handleOpenEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image: banner.image || '',
      link: banner.link || '',
      linkText: banner.linkText || '',
      sortOrder: String(banner.sortOrder),
      isActive: banner.isActive,
    });
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      toast.error('Banner title is required');
      return;
    }
    const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || null,
        image: form.image.trim() || null,
        link: form.link.trim() || null,
        linkText: form.linkText.trim() || null,
        sortOrder: parseInt(form.sortOrder) || 0,
        isActive: form.isActive,
    };
    saveMutation.mutate({ id: editingBanner?.id, data: payload });
  };

  const handleDelete = () => {
    if (deleteId) deleteMutation.mutate(deleteId);
  };

  const handleToggleActive = (banner: Banner) => {
    toggleMutation.mutate({ id: banner.id, isActive: !banner.isActive });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await adminFetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({ ...prev, image: data.url }));
        toast.success('Image uploaded');
      } else {
        toast.error('Failed to upload image');
      }
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Banners</h2>
          <p className="text-muted-foreground mt-1">Manage homepage banners and promotions</p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Banner
        </Button>
      </div>

      {/* Banners Table */}
      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No banners yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first banner for the homepage
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Subtitle</TableHead>
                  <TableHead className="hidden md:table-cell">Link</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      {banner.image ? (
                        <img
                          src={banner.image}
                          alt={banner.title}
                          className="h-12 w-16 rounded-md object-cover bg-muted"
                        />
                      ) : (
                        <div className="flex h-12 w-16 items-center justify-center rounded-md bg-muted">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{banner.title}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">
                        {banner.subtitle || ''}
                      </p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground max-w-[200px] truncate">
                      {banner.subtitle || '—'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {banner.link ? (
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          <ExternalLink className="h-3 w-3" />
                          <span className="max-w-[120px] truncate">{banner.link}</span>
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{banner.sortOrder}</Badge>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleToggleActive(banner)}
                        className="cursor-pointer"
                      >
                        <Badge
                          variant="secondary"
                          className={
                            banner.isActive
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                          }
                        >
                          {banner.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenEdit(banner)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => setDeleteId(banner.id)}
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
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? 'Edit Banner' : 'Add Banner'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="grid gap-4 py-4 pr-4">
              <div className="space-y-2">
                <Label htmlFor="banner-title">
                  Title <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="banner-title"
                  placeholder="Banner title"
                  value={form.title}
                  onChange={(e) =>
                    setForm(prev => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner-subtitle">Subtitle</Label>
                <Textarea
                  id="banner-subtitle"
                  placeholder="Banner subtitle text"
                  value={form.subtitle}
                  onChange={(e) =>
                    setForm(prev => ({ ...prev, subtitle: e.target.value }))
                  }
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner-image">Image URL</Label>
                <Input
                  id="banner-image"
                  placeholder="https://example.com/banner.jpg"
                  value={form.image}
                  onChange={(e) =>
                    setForm(prev => ({ ...prev, image: e.target.value }))
                  }
                />
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      asChild
                    >
                      <span>
                        <Upload className="mr-2 h-3.5 w-3.5" />
                        {uploading ? 'Uploading...' : 'Upload Image'}
                      </span>
                    </Button>
                  </label>
                </div>
                {form.image && (
                  <img
                    src={form.image}
                    alt="Preview"
                    className="mt-2 h-32 w-full rounded-md object-cover bg-muted"
                  />
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="banner-link">Link URL</Label>
                  <Input
                    id="banner-link"
                    placeholder="https://example.com/page"
                    value={form.link}
                    onChange={(e) =>
                      setForm(prev => ({ ...prev, link: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="banner-link-text">Link Text</Label>
                  <Input
                    id="banner-link-text"
                    placeholder="Shop Now"
                    value={form.linkText}
                    onChange={(e) =>
                      setForm(prev => ({ ...prev, linkText: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner-sort">Sort Order</Label>
                <Input
                  id="banner-sort"
                  type="number"
                  placeholder="0"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm(prev => ({ ...prev, sortOrder: e.target.value }))
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked) =>
                    setForm(prev => ({ ...prev, isActive: checked }))
                  }
                />
                <Label
                  className="cursor-pointer"
                  onClick={() =>
                    setForm(prev => ({ ...prev, isActive: !prev.isActive }))
                  }
                >
                  Active
                </Label>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending
                ? 'Saving...'
                : editingBanner
                  ? 'Update Banner'
                  : 'Create Banner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Banner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this banner? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
