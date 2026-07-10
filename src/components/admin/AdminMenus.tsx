'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  Menu as MenuIcon,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  GripVertical,
  Save,
  X,
  ArrowLeft,
  Link,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { adminFetch } from '@/lib/admin-fetch';

interface MenuItem {
  id?: string;
  parentId?: string | null;
  label: string;
  url?: string | null;
  page?: string | null;
  slug?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  openInNewTab?: boolean;
  children?: MenuItem[];
}

interface Menu {
  id: string;
  name: string;
  slug: string;
  location: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  items?: MenuItem[];
}

const MENU_LOCATIONS = [
  { value: 'primary', label: 'Primary Menu (Header)' },
  { value: 'footer_1', label: 'Footer Column 1' },
  { value: 'footer_2', label: 'Footer Column 2' },
  { value: 'footer_3', label: 'Footer Column 3' },
  { value: 'mobile', label: 'Mobile Menu' },
  { value: 'sidebar', label: 'Sidebar Menu' },
];

const INTERNAL_PAGES = [
  { label: 'Home', value: 'home' },
  { label: 'Catalogue', value: 'catalogue' },
  { label: 'All Products', value: 'products' },
  { label: 'Product Category', value: 'category' },
  { label: 'About Us', value: 'about' },
  { label: 'Manufacturing', value: 'manufacturing' },
  { label: 'Contact Us', value: 'contact' },
  { label: 'Blog', value: 'blog' },
  { label: 'Account', value: 'account' },

  { label: 'Wishlist', value: 'wishlist' },
  { label: 'Orders', value: 'orders' },
  { label: 'Buyer Portal', value: 'portal' },
  { label: 'Product Page', value: 'product-page' },
  { label: 'Custom Page (Slug)', value: 'content-page' },
  { label: 'External URL', value: 'url' },
];

export function AdminMenus() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    location: '',
    description: '',
    isActive: true,
    items: [] as MenuItem[],
  });
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data: menus = [], isLoading: loading } = useQuery({
    queryKey: ['admin-menus', searchTerm],
    queryFn: async () => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        const res = await adminFetch(`/api/admin/menus?${params.toString()}`);
        return (await res.json()).menus || [];
    }
  });

  const { data: contentPages = [] } = useQuery({
    queryKey: ['admin-content-pages-minimal'],
    queryFn: async () => {
        const res = await adminFetch('/api/content-pages?all=true');
        return (await res.json()).contentPages || [];
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories-minimal'],
    queryFn: async () => {
        const res = await adminFetch('/api/categories?all=true');
        return (await res.json()).categories || [];
    }
  });

  const handleOpenAdd = () => {
    setEditingMenu(null);
    setForm({
      name: '',
      slug: '',
      location: '',
      description: '',
      isActive: true,
      items: [],
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (menu: Menu) => {
    setEditingMenu(menu);
    setForm({
      name: menu.name,
      slug: menu.slug,
      location: menu.location,
      description: menu.description || '',
      isActive: menu.isActive,
      items: menu.items || [],
    });
    setFormOpen(true);
  };

  const handleTitleChange = (title: string) => {
    setForm(prev => ({
      ...prev,
      name: title,
      slug: editingMenu ? prev.slug : title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, ''),
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async ({ id, data }: { id?: string, data: any }) => {
        const url = id ? `/api/admin/menus/${id}` : '/api/admin/menus';
        const res = await adminFetch(url, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Failed');
        return res.json();
    },
    onSuccess: () => {
        toast.success(editingMenu ? 'Menu updated' : 'Menu created');
        setFormOpen(false);
        queryClient.invalidateQueries({ queryKey: ['admin-menus'] });
    },
    onError: (err: any) => toast.error(err.message)
  });

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('Menu name is required');
      return;
    }
    if (!form.slug.trim()) {
      toast.error('Slug is required');
      return;
    }
    if (!form.location) {
      toast.error('Location is required');
      return;
    }

    const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        location: form.location,
        description: form.description.trim() || null,
        isActive: form.isActive,
        items: form.items,
    };

    saveMutation.mutate({ id: editingMenu?.id, data: payload });
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
        const res = await adminFetch(`/api/admin/menus/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
        toast.success('Menu deleted');
        setDeleteId(null);
        queryClient.invalidateQueries({ queryKey: ['admin-menus'] });
    }
  });

  const handleDelete = () => {
    if (deleteId) deleteMutation.mutate(deleteId);
  };

  const addMenuItem = (parentId?: string | null) => {
    const newItem: MenuItem = {
      id: `temp-${Date.now()}`,
      parentId: parentId || null,
      label: 'New Link',
      url: null,
      page: 'home',
      slug: null,
      sortOrder: (form.items.filter(i => i.parentId === parentId).length) || 0,
      isActive: true,
      openInNewTab: false,
    };

    if (parentId) {
      const parentIndex = form.items.findIndex(i => i.id === parentId);
      if (parentIndex !== -1) {
        const newItems = [...form.items];
        newItems.splice(parentIndex + 1, 0, newItem);
        setForm(prev => ({ ...prev, items: newItems }));
      }
    } else {
      setForm(prev => ({
        ...prev,
        items: [...prev.items, newItem],
      }));
    }
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  };

  const removeMenuItem = (id: string) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
    }));
  };

  const moveMenuItem = (id: string, direction: 'up' | 'down') => {
    setForm(prev => {
      const siblings = prev.items.filter(i => i.parentId === prev.items.find(x => x.id === id)?.parentId);
      const sorted = [...siblings].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      const idx = sorted.findIndex(i => i.id === id);
      if (idx === -1) return prev;
      if (direction === 'up' && idx === 0) return prev;
      if (direction === 'down' && idx === sorted.length - 1) return prev;
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      const currentSort = sorted[idx].sortOrder ?? 0;
      const swapSort = sorted[swapIdx].sortOrder ?? 0;
      const updatedItems = prev.items.map(i => {
        if (i.id === sorted[idx].id) return { ...i, sortOrder: swapSort };
        if (i.id === sorted[swapIdx].id) return { ...i, sortOrder: currentSort };
        return i;
      });
      return { ...prev, items: updatedItems };
    });
  };

  const renderMenuItemForm = (item: MenuItem, level = 0) => {
    const indent = level * 20;
    const isUrl = item.page === 'url';
    const isContentPage = item.page === 'content-page';
    const isCategory = item.page === 'category';
    const isProductPage = item.page === 'product-page';

    return (
      <div key={item.id} style={{ marginLeft: `${indent}px` }} className="space-y-2">
        <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1 grid grid-cols-12 gap-2">
            <div className="col-span-3">
              <Input
                placeholder="Label"
                value={item.label}
                onChange={(e) => updateMenuItem(item.id!, { label: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
            <div className="col-span-3">
               <Select
                value={item.page || 'home'}
                onValueChange={(val) => updateMenuItem(item.id!, { page: val, url: val === 'url' ? item.url : null, slug: val === 'content-page' || val === 'category' || val === 'product-page' ? item.slug : null })}
               >
                 <SelectTrigger className="h-8 text-xs">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   {INTERNAL_PAGES.map(p => (
                     <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
            </div>

            <div className="col-span-6">
              {isUrl ? (
                <Input
                  placeholder="https://..."
                  value={item.url || ''}
                  onChange={(e) => updateMenuItem(item.id!, { url: e.target.value || null })}
                  className="h-8 text-xs"
                />
              ) : isCategory ? (
                <Select
                  value={item.slug || ''}
                  onValueChange={(val) => updateMenuItem(item.id!, { slug: val })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                    ))}
                    {categories.length === 0 && (
                      <SelectItem value="_none" disabled>No categories found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              ) : isProductPage ? (
                <Input
                  placeholder="Product slug (e.g. peri-peri-roasted-makhana)"
                  value={item.slug || ''}
                  onChange={(e) => updateMenuItem(item.id!, { slug: e.target.value || null })}
                  className="h-8 text-xs"
                />
              ) : isContentPage ? (
                <Select
                  value={item.slug || ''}
                  onValueChange={(val) => updateMenuItem(item.id!, { slug: val })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select page..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contentPages.map(p => (
                      <SelectItem key={p.slug} value={p.slug}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-8 flex items-center px-3 rounded bg-muted/50 text-[10px] text-muted-foreground italic">
                  Internal: /{item.page}
                </div>
              )}
            </div>

          </div>
          <div className="flex items-center gap-1">
            <div className="flex flex-col items-center gap-1">
               <Switch
                checked={item.isActive !== false}
                onCheckedChange={(checked) => updateMenuItem(item.id!, { isActive: checked })}
                className="scale-75"
              />
              <span className="text-[8px] text-muted-foreground uppercase">Live</span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => moveMenuItem(item.id!, 'up')}
              title="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => moveMenuItem(item.id!, 'down')}
              title="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => addMenuItem(item.id!)}
              title="Add sub-item"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-rose-600 hover:text-rose-700"
              onClick={() => removeMenuItem(item.id!)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {(() => {
          const children = form.items
            .filter(i => i.parentId === item.id)
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
          if (children.length === 0) return null;
          return (
            <div className="ml-4 space-y-2 border-l pl-4">
              {children.map(child => renderMenuItemForm(child, level + 1))}
            </div>
          );
        })()}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Menus</h2>
          <p className="text-muted-foreground mt-1">Manage navigation menus for different locations</p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Menu
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search menus..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={() => { queryClient.invalidateQueries({ queryKey: ['admin-menus'] }); }}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : menus.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MenuIcon className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No menus found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm
                ? 'Try adjusting your search'
                : 'Create your first menu to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="hidden sm:table-cell">Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menus.map((menu) => (
                  <TableRow key={menu.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                          <MenuIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium">{menu.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {MENU_LOCATIONS.find(l => l.value === menu.location)?.label || menu.location}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      /{menu.slug}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          menu.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                        }
                      >
                        {menu.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenEdit(menu)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => setDeleteId(menu.id)}
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

      {formOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingMenu ? 'Edit Menu' : 'Add Menu'}
              </CardTitle>
              <CardDescription>
                Create or edit a navigation menu for different locations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="menu-name">Menu Name (Column Title)</Label>
                  <Input
                    id="menu-name"
                    placeholder="Primary Menu"
                    value={form.name}
                    onChange={(e) => handleTitleChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="menu-slug">Slug</Label>
                  <Input
                    id="menu-slug"
                    placeholder="primary-menu"
                    value={form.slug}
                    onChange={(e) =>
                      setForm(prev => ({ ...prev, slug: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="menu-location">Location</Label>
                  <select
                    id="menu-location"
                    value={form.location}
                    onChange={(e) =>
                      setForm(prev => ({ ...prev, location: e.target.value }))
                    }
                    className="w-full h-10 px-3 py-2 text-sm border rounded-md"
                  >
                    <option value="">Select location</option>
                    {MENU_LOCATIONS.map(loc => (
                      <option key={loc.value} value={loc.value}>{loc.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-7">
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(checked) =>
                      setForm(prev => ({ ...prev, isActive: checked }))
                    }
                  />
                  <Label
                    className="cursor-pointer"
                    onClick={() => setForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                  >
                    Active
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="menu-description">Description (optional)</Label>
                <Textarea
                  id="menu-description"
                  placeholder="Description of this menu"
                  value={form.description}
                  onChange={(e) =>
                    setForm(prev => ({ ...prev, description: e.target.value }))
                  }
                  rows={2}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Menu Items</h3>
                <Button
                  size="sm"
                  onClick={() => addMenuItem()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {form.items
                  .filter(item => !item.parentId)
                  .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                  .map(item =>
                    renderMenuItemForm(item)
                  )}

                {form.items.filter(item => !item.parentId).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg">
                    No menu items. Click &quot;Add Item&quot; to add your first menu item.
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving...' : editingMenu ? 'Update Menu' : 'Create Menu'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Menu</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this menu? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
