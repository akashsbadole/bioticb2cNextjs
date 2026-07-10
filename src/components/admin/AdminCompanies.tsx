'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Users as UsersIcon,
  MessageSquare,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { adminFetch } from '@/lib/admin-fetch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Company {
  id: string;
  name: string;
  taxId: string | null;
  address: string | null;
  website: string | null;
  isVerified: boolean;
  tier: string;
  createdAt: string;
  _count: {
    User: number;
    Enquiry: number;
    Quote: number;
  };
}

export function AdminCompanies() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [form, setForm] = useState({
    name: '',
    taxId: '',
    address: '',
    website: '',
    isVerified: false,
    tier: 'standard',
  });
  const [saving, setSaving] = useState(false);

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data: companies = [], isLoading: loading } = useQuery({
    queryKey: ['admin-companies', searchTerm, tierFilter],
    queryFn: async () => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (tierFilter !== 'all') params.set('tier', tierFilter);
        const res = await adminFetch(`/api/companies?${params.toString()}`);
        if (!res.ok) throw new Error('Failed');
        return (await res.json()).companies || [];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
        const res = await adminFetch(`/api/companies/${editingCompany?.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed');
        return res.json();
    },
    onSuccess: () => {
        toast.success('Company updated successfully');
        setFormOpen(false);
        queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
        const res = await adminFetch(`/api/companies/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
        toast.success('Company deleted');
        setDeleteId(null);
        queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
    }
  });

  const handleOpenEdit = (company: Company) => {
    setEditingCompany(company);
    setForm({
      name: company.name,
      taxId: company.taxId || '',
      address: company.address || '',
      website: company.website || '',
      isVerified: company.isVerified,
      tier: company.tier,
    });
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('Company name is required');
      return;
    }
    saveMutation.mutate(form);
  };

  const handleDelete = () => {
    if (deleteId) deleteMutation.mutate(deleteId);
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'platinum': return <Badge className="bg-slate-900 text-slate-100">Platinum</Badge>;
      case 'gold': return <Badge className="bg-amber-500 text-white">Gold</Badge>;
      case 'silver': return <Badge className="bg-slate-400 text-white">Silver</Badge>;
      default: return <Badge variant="secondary">Standard</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Companies</h2>
          <p className="text-muted-foreground mt-1">Manage B2B partner business profiles</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search companies by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="silver">Silver</SelectItem>
            <SelectItem value="gold">Gold</SelectItem>
            <SelectItem value="platinum">Platinum</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => { queryClient.invalidateQueries({ queryKey: ['admin-companies'] }); }}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No companies found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Businesses appear here when B2B partners register
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Enquiries</TableHead>
                  <TableHead>Quotes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{company.name}</span>
                        {company.taxId && <span className="text-xs text-muted-foreground">Tax ID: {company.taxId}</span>}
                      </div>
                    </TableCell>
                    <TableCell>{getTierBadge(company.tier)}</TableCell>
                    <TableCell>
                      {company.isVerified ? (
                        <Badge className="bg-emerald-100 text-emerald-700">Verified</Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-200">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <UsersIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        {company._count.User}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                        {company._count.Enquiry}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        {company._count.Quote}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenEdit(company)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => setDeleteId(company.id)}
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

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Company Profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tax ID</Label>
                <Input
                  value={form.taxId}
                  onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Business Tier</Label>
              <Select value={form.tier} onValueChange={(val) => setForm({ ...form, tier: val })}>
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
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isVerified}
                onCheckedChange={(checked) => setForm({ ...form, isVerified: checked })}
              />
              <Label>Verified Partner Status</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : 'Update Company'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will also affect linked users and their ability to access B2B features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700" disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Company'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
