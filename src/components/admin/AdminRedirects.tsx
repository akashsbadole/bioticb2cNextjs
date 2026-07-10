'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  ArrowRightLeft,
  ExternalLink,
  FileText,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { adminFetch } from '@/lib/admin-fetch';

interface Redirect {
  id: string;
  from: string;
  to: string;
  type: string;
  isActive: boolean;
  createdAt: string;
}

interface RedirectFormData {
  from: string;
  to: string;
  type: string;
  isActive: boolean;
}

const emptyForm: RedirectFormData = {
  from: '',
  to: '',
  type: '301',
  isActive: true,
};

export function AdminRedirects() {
  const queryClient = useQueryClient();

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<Redirect | null>(null);
  const [form, setForm] = useState<RedirectFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Bulk action state
  const [bulkLoading, setBulkLoading] = useState(false);

  // CSV import/export state
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { data: redirects = [], isLoading: loading } = useQuery({
    queryKey: ['admin-redirects'],
    queryFn: async () => {
        const res = await adminFetch('/api/redirects');
        if (!res.ok) throw new Error('Failed');
        return (await res.json()).redirects || [];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async ({ id, data }: { id?: string, data: any }) => {
        const url = id ? `/api/redirects/${id}` : '/api/redirects';
        const res = await adminFetch(url, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Failed');
        return res.json();
    },
    onSuccess: () => {
        toast.success(editingRedirect ? 'Redirect updated' : 'Redirect created');
        setFormOpen(false);
        queryClient.invalidateQueries({ queryKey: ['admin-redirects'] });
    },
    onError: (err: any) => toast.error(err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
        const res = await adminFetch(`/api/redirects/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
        toast.success('Redirect deleted');
        setDeleteId(null);
        queryClient.invalidateQueries({ queryKey: ['admin-redirects'] });
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
        const res = await adminFetch('/api/redirects/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids, action: 'delete' }),
        });
        if (!res.ok) throw new Error('Failed');
        return res.json();
    },
    onSuccess: (data) => {
        toast.success(data.message);
        setSelectedIds([]);
        queryClient.invalidateQueries({ queryKey: ['admin-redirects'] });
    }
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === redirects.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(redirects.map(r => r.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    bulkDeleteMutation.mutate(selectedIds);
  };

  const handleOpenAdd = () => {
    setEditingRedirect(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const handleOpenEdit = (redirect: Redirect) => {
    setEditingRedirect(redirect);
    setForm({
      from: redirect.from,
      to: redirect.to,
      type: redirect.type,
      isActive: redirect.isActive,
    });
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!form.from.trim() || !form.to.trim()) {
      toast.error('From and To paths are required');
      return;
    }

    const fromPath = form.from.trim().startsWith('/')
      ? form.from.trim()
      : `/${form.from.trim()}`;

    const payload = {
        from: fromPath,
        to: form.to.trim(),
        type: form.type,
        isActive: form.isActive,
    };

    saveMutation.mutate({ id: editingRedirect?.id, data: payload });
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await adminFetch('/api/redirects/import', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Imported ${data.imported} redirect(s)`);
        if (data.errors && data.errors.length > 0) {
          toast.warning(`${data.errors.length} error(s) during import`);
        }
        queryClient.invalidateQueries({ queryKey: ['admin-redirects'] });
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
      const res = await adminFetch('/api/redirects/export');
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `redirects-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Redirects exported');
      } else {
        toast.error('Export failed');
      }
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = () => {
    if (deleteId) deleteMutation.mutate(deleteId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">URL Redirects</h2>
          <p className="text-muted-foreground mt-1">Manage URL redirects for SEO and page migrations</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-redirects'] })}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
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
            Add Redirect
          </Button>
        </div>
      </div>

      {/* SEO Best Practices Note */}
      <Alert>
        <ArrowRightLeft className="h-4 w-4" />
        <AlertDescription>
          <strong>SEO Best Practices:</strong> Use <strong>301 redirects</strong> for permanent moves
          (passes link equity to the new URL). Use <strong>302 redirects</strong> only for temporary
          changes. Always redirect to the most relevant page. Avoid redirect chains (A→B→C).
        </AlertDescription>
      </Alert>

      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <Card className="p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="text-sm font-medium">
            {selectedIds.length} redirect(s) selected
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={bulkDeleteMutation.isPending}
              className="text-rose-600 hover:text-rose-700"
              onClick={handleBulkDelete}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Delete Selected
            </Button>
          </div>
        </Card>
      )}

      {/* Redirects Table */}
      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : redirects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ArrowRightLeft className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No redirects configured</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add redirects to handle URL changes and maintain SEO rankings
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedIds.length === redirects.length && redirects.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redirects.map((redirect) => (
                  <TableRow key={redirect.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(redirect.id)}
                        onCheckedChange={() => toggleSelect(redirect.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {redirect.from}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-0">
                        <code className="text-sm bg-muted px-2 py-1 rounded truncate max-w-[200px] sm:max-w-none">
                          {redirect.to}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          title="Test redirect"
                          onClick={() => window.open(redirect.from, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline">
                        {redirect.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          redirect.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                        }
                      >
                        {redirect.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenEdit(redirect)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => setDeleteId(redirect.id)}
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
              {editingRedirect ? 'Edit Redirect' : 'Add Redirect'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="redirect-from">
                From Path <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="redirect-from"
                placeholder="/old-page"
                value={form.from}
                onChange={(e) =>
                  setForm(prev => ({ ...prev, from: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                The source URL path (e.g., /old-page). A leading / will be added automatically.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="redirect-to">
                Destination URL <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="redirect-to"
                placeholder="/new-page or https://example.com"
                value={form.to}
                onChange={(e) =>
                  setForm(prev => ({ ...prev, to: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                The destination URL — can be a relative path or absolute URL
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="redirect-type">Redirect Type</Label>
              <Select
                value={form.type}
                onValueChange={(val) =>
                  setForm(prev => ({ ...prev, type: val }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="301">
                    301 — Permanent Redirect (recommended)
                  </SelectItem>
                  <SelectItem value="302">
                    302 — Temporary Redirect
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                301 passes SEO link equity. Use 302 only for temporary changes.
              </p>
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
              {saveMutation.isPending ? 'Saving...' : editingRedirect ? 'Update Redirect' : 'Create Redirect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Redirect</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this redirect? This action cannot be undone.
              Visitors will no longer be redirected from this path.
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
