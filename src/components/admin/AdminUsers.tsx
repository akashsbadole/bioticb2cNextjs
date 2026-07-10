'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  Users,
  ShieldCheck,
  UserCog,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  Building2,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminFetch } from '@/lib/admin-fetch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  tier: string;
  companyId: string | null;
  avatar?: string | null;
  bio?: string | null;
  Company?: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  tier: string;
  companyId: string;
  avatar: string;
  bio: string;
}

const emptyForm: UserFormData = {
  name: '',
  email: '',
  password: '',
  role: 'clerk',
  isActive: true,
  isVerified: false,
  tier: 'standard',
  companyId: '',
  avatar: '',
  bio: '',
};

function RoleBadge({ role }: { role: string }) {
  if (role === 'admin') {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
        <ShieldCheck className="mr-1 h-3 w-3" />
        Admin
      </Badge>
    );
  }
  if (role === 'clerk') {
    return (
      <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
        <UserCog className="mr-1 h-3 w-3" />
        Clerk
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
      <Building2 className="mr-1 h-3 w-3" />
      Buyer
    </Badge>
  );
}

export function AdminUsers() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Bulk action state
  const [bulkLoading, setBulkLoading] = useState(false);

  // CSV import/export state
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { data: users = [], isLoading: loading } = useQuery({
    queryKey: ['admin-users', searchTerm],
    queryFn: async () => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        const res = await adminFetch(`/api/users?${params.toString()}`);
        if (!res.ok) throw new Error('Failed');
        return (await res.json()).users || [];
    }
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['admin-companies'],
    queryFn: async () => {
        const res = await adminFetch('/api/companies');
        return (await res.json()).companies || [];
    }
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map(u => u.id));
    }
  };

  const bulkMutation = useMutation({
    mutationFn: async ({ ids, action }: { ids: string[], action: string }) => {
        const res = await adminFetch('/api/users/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids, action }),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Failed');
        return res.json();
    },
    onSuccess: (data) => {
        toast.success(data.message);
        setSelectedIds([]);
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => toast.error(err.message)
  });

  const handleBulkAction = (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedIds.length === 0) return;
    bulkMutation.mutate({ ids: selectedIds, action });
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified || false,
      tier: user.tier || 'standard',
      companyId: user.companyId || '',
      avatar: user.avatar || '',
      bio: user.bio || '',
    });
    setFormOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async ({ id, data }: { id?: string, data: any }) => {
        const url = id ? `/api/users/${id}` : '/api/users';
        const res = await adminFetch(url, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Failed');
        return res.json();
    },
    onSuccess: () => {
        toast.success(editingUser ? 'User updated' : 'User created');
        setFormOpen(false);
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => toast.error(err.message)
  });

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('User name is required');
      return;
    }
    if (!form.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!editingUser && !form.password.trim()) {
      toast.error('Password is required for new users');
      return;
    }

    const payload: Record<string, unknown> = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        isActive: form.isActive,
        isVerified: form.isVerified,
        tier: form.tier,
        companyId: form.companyId || null,
        avatar: form.avatar || null,
        bio: form.bio.trim() || null,
    };

    if (!editingUser) {
        payload.password = form.password;
    } else if (form.password.trim()) {
        payload.password = form.password;
    }

    saveMutation.mutate({ id: editingUser?.id, data: payload });
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await adminFetch('/api/users/import', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Imported ${data.imported} user(s)`);
        if (data.errors && data.errors.length > 0) {
          toast.warning(`${data.errors.length} error(s) during import`);
        }
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      } else {
        const err = await res.json();
        toast.error(err.error || 'Import failed');
      }
    } catch {
      toast.error('Import failed');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleCSVExport = async () => {
    setExporting(true);
    try {
      const res = await adminFetch('/api/users/export');
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Users exported');
      } else {
        toast.error('Export failed');
      }
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
        const res = await adminFetch(`/api/users/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
        toast.success('User deleted');
        setDeleteId(null);
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });

  const handleDelete = () => {
    if (deleteId) deleteMutation.mutate(deleteId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground mt-1">Manage admin and clerk accounts</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="cursor-pointer">
            <input type="file" accept=".csv" className="hidden" onChange={handleCSVImport} disabled={importing} />
            <Button variant="outline" size="sm" disabled={importing} asChild>
              <span>
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                {importing ? 'Importing...' : 'Import CSV'}
              </span>
            </Button>
          </label>
          <Button variant="outline" size="sm" disabled={exporting} onClick={handleCSVExport}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
          <Button onClick={handleOpenAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={() => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); }}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <Card className="p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="text-sm font-medium">
            {selectedIds.length} user(s) selected
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={bulkMutation.isPending}
              onClick={() => handleBulkAction('activate')}
            >
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              Activate
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={bulkMutation.isPending}
              onClick={() => handleBulkAction('deactivate')}
            >
              <XCircle className="mr-1 h-3.5 w-3.5" />
              Deactivate
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={bulkMutation.isPending}
              className="text-rose-600 hover:text-rose-700"
              onClick={() => handleBulkAction('delete')}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No users found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm
                ? 'Try adjusting your search'
                : 'Create your first user to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedIds.length === users.length && users.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(user.id)}
                        onCheckedChange={() => toggleSelect(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          <span className="text-sm font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {user.Company?.name || '—'}
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          user.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                        }
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenEdit(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => setDeleteId(user.id)}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Edit User' : 'Add User'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="user-name">
                Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="user-name"
                placeholder="User name"
                value={form.name}
                onChange={(e) =>
                  setForm(prev => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="user-email">
                Email <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="user-email"
                type="email"
                placeholder="user@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm(prev => ({ ...prev, email: e.target.value }))
                }
              />
            </div>

            {/* Avatar */}
            <div className="space-y-2">
              <Label>Avatar</Label>
              <div className="flex items-center gap-3">
                {form.avatar ? (
                  <img
                    src={form.avatar}
                    alt="Avatar"
                    className="h-12 w-12 rounded-full object-cover border"
                  />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold border">
                    {form.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const fd = new FormData();
                      fd.append('file', file);
                      const res = await adminFetch('/api/upload', { method: 'POST', body: fd });
                      if (res.ok) {
                        const data = await res.json();
                        setForm(prev => ({ ...prev, avatar: data.url }));
                        toast.success('Avatar uploaded');
                      } else {
                        toast.error('Upload failed');
                      }
                      e.target.value = '';
                    }}
                  />
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="mr-1.5 h-3.5 w-3.5" />
                      Upload
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="user-bio">Bio</Label>
              <Textarea
                id="user-bio"
                placeholder="Short bio for blog posts..."
                value={form.bio}
                onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Displayed on blog posts authored by this user.
              </p>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="user-password">
                Password
                {!editingUser && <span className="text-rose-500"> *</span>}
              </Label>
              <Input
                id="user-password"
                type="password"
                placeholder={editingUser ? 'Leave blank to keep current' : 'Password'}
                value={form.password}
                onChange={(e) =>
                  setForm(prev => ({ ...prev, password: e.target.value }))
                }
              />
              {editingUser && (
                <p className="text-xs text-muted-foreground">
                  Leave blank to keep the existing password unchanged
                </p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="user-role">Role</Label>
              <Select
                value={form.role}
                onValueChange={(val) =>
                  setForm(prev => ({ ...prev, role: val }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Admin
                    </span>
                  </SelectItem>
                  <SelectItem value="clerk">
                    <span className="flex items-center gap-2">
                      <UserCog className="h-3.5 w-3.5 text-sky-600" />
                      Clerk
                    </span>
                  </SelectItem>
                  <SelectItem value="buyer">
                    <span className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-amber-600" />
                      Buyer
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Company Selection */}
            {form.role === 'buyer' && (
              <div className="space-y-2">
                <Label>Company</Label>
                <Select
                  value={form.companyId || '__none__'}
                  onValueChange={(val) => setForm(prev => ({ ...prev, companyId: val === '__none__' ? '' : val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No Company</SelectItem>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* B2B Tier */}
            {form.role === 'buyer' && (
              <div className="space-y-2">
                <Label>B2B Pricing Tier</Label>
                <Select
                  value={form.tier}
                  onValueChange={(val) => setForm(prev => ({ ...prev, tier: val }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Verified Status */}
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isVerified}
                onCheckedChange={(checked) =>
                  setForm(prev => ({ ...prev, isVerified: checked }))
                }
              />
              <Label>Verified Business Partner</Label>
            </div>

            {/* Active */}
            <div className="flex items-center gap-2">
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
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
