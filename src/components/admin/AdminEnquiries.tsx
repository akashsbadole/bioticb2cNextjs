'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Eye,
  Trash2,
  RefreshCw,
  MessageSquare,
  Mail,
  Phone,
  Package,
  Clock,
  Building2,
  Hash,
  MapPin,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
import { adminFetch } from '@/lib/admin-fetch';

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  companyEmail: string | null;
  companyPhone: string | null;
  companyAddress: string | null;
  quantity: number | null;
  subject: string;
  message: string;
  type: string;
  status: string;
  productId: string | null;
  createdAt: string;
  updatedAt: string;
  Product?: { id: string; name: string } | null;
  User?: { id: string; name: string; email: string; companyId: string | null } | null;
  Quote?: { id: string; status: string; totalAmount: number } | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusTabs = ['all', 'new', 'read', 'replied', 'closed'];

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  read: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  replied: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  closed: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
};

const typeColors: Record<string, string> = {
  product: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  contact: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  rfq: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const typeLabels: Record<string, string> = {
  product: 'General',
  contact: 'Contact',
  rfq: 'RFQ',
};

const PAGE_SIZE = 20;

export function AdminEnquiries() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  const [viewEnquiry, setViewEnquiry] = useState<Enquiry | null>(null);
  const [statusUpdate, setStatusUpdate] = useState('');

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Quote dialog state
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quotingEnquiry, setQuotingEnquiry] = useState<Enquiry | null>(null);
  const [quoteForm, setQuoteForm] = useState({
    totalAmount: '',
    validUntil: '',
    notes: '',
  });
  const [creatingQuote, setCreatingQuote] = useState(false);

  const { data, isLoading: loading } = useQuery({
    queryKey: ['admin-enquiries', activeFilter, page],
    queryFn: async () => {
        let url = `/api/enquiries?page=${page}&limit=${PAGE_SIZE}`;
        if (activeFilter !== 'all') {
            url += `&status=${activeFilter}`;
        }
        const res = await adminFetch(url);
        if (!res.ok) throw new Error('Failed');
        return await res.json();
    }
  });

  const enquiriesRaw = data?.enquiries || [];
  const pagination = data?.pagination || { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 };

  const enquiries = searchTerm ? enquiriesRaw.filter(
    (e: Enquiry) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.companyName && e.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : enquiriesRaw;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSelectedIds(new Set());
  };

  // Selection handlers
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === enquiries.length && enquiries.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(enquiries.map(e => e.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setBulkStatus('');
  };

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
        const res = await adminFetch(`/api/enquiries/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error('Failed');
    },
    onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['admin-enquiries'] });
        if (viewEnquiry && viewEnquiry.id === variables.id) {
            setViewEnquiry({ ...viewEnquiry, status: variables.status });
        }
    }
  });

  const bulkMutation = useMutation({
    mutationFn: async ({ ids, action, status }: { ids: string[], action: string, status?: string }) => {
        const res = await adminFetch('/api/enquiries/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids, action, status }),
        });
        if (!res.ok) throw new Error('Failed');
        return res.json();
    },
    onSuccess: (data, variables) => {
        toast.success(`${data.count} enquiry(ies) processed`);
        clearSelection();
        setShowBulkDelete(false);
        queryClient.invalidateQueries({ queryKey: ['admin-enquiries'] });
    }
  });

  const quoteMutation = useMutation({
    mutationFn: async (data: any) => {
        const res = await adminFetch('/api/quotes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
        toast.success('Formal quote created and sent to buyer');
        setQuoteOpen(false);
        queryClient.invalidateQueries({ queryKey: ['admin-enquiries'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
        const res = await adminFetch(`/api/enquiries/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
        toast.success('Enquiry deleted');
        setDeleteId(null);
        queryClient.invalidateQueries({ queryKey: ['admin-enquiries'] });
    }
  });

  const handleBulkStatusUpdate = () => {
    if (!bulkStatus || selectedIds.size === 0) return;
    bulkMutation.mutate({ ids: Array.from(selectedIds), action: 'update-status', status: bulkStatus });
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    bulkMutation.mutate({ ids: Array.from(selectedIds), action: 'delete' });
  };

  const handleViewEnquiry = (enquiry: Enquiry) => {
    setViewEnquiry(enquiry);
    setStatusUpdate(enquiry.status);
    if (enquiry.status === 'new') {
        updateMutation.mutate({ id: enquiry.id, status: 'read' });
    }
  };

  const handleOpenQuote = (enquiry: Enquiry) => {
    setQuotingEnquiry(enquiry);
    setQuoteForm({
      totalAmount: '',
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
    });
    setQuoteOpen(true);
  };

  const handleCreateQuote = () => {
    if (!quotingEnquiry || !quoteForm.totalAmount) {
      toast.error('Please enter a total amount');
      return;
    }
    quoteMutation.mutate({
        enquiryId: quotingEnquiry.id,
        userId: quotingEnquiry.User?.id || quotingEnquiry.id,
        companyId: quotingEnquiry.User?.companyId,
        totalAmount: parseFloat(quoteForm.totalAmount),
        validUntil: quoteForm.validUntil,
        notes: quoteForm.notes,
        items: quotingEnquiry.productId ? [{
            productId: quotingEnquiry.productId,
            name: quotingEnquiry.Product?.name,
            quantity: quotingEnquiry.quantity || 1,
            unitPrice: parseFloat(quoteForm.totalAmount) / (quotingEnquiry.quantity || 1)
        }] : []
    });
  };

  const handleStatusChange = (newStatus: string) => {
    setStatusUpdate(newStatus);
    if (viewEnquiry) {
        updateMutation.mutate({ id: viewEnquiry.id, status: newStatus });
    }
  };

  const handleDelete = () => {
    if (deleteId) deleteMutation.mutate(deleteId);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const formatShortDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const hasB2BFields = (enq: Enquiry) =>
    enq.companyName || enq.companyEmail || enq.companyPhone ||
    enq.companyAddress || enq.quantity;

  const isAllSelected = enquiries.length > 0 && selectedIds.size === enquiries.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Enquiries</h2>
          <p className="text-muted-foreground mt-1">View and manage customer enquiries</p>
        </div>
        <Button variant="outline" onClick={() => { queryClient.invalidateQueries({ queryKey: ['admin-enquiries'] }); }}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1">
        {statusTabs.map((tab) => (
          <Button
            key={tab}
            variant={activeFilter === tab ? 'default' : 'ghost'}
            size="sm"
            className="capitalize whitespace-nowrap"
            onClick={() => setActiveFilter(tab)}
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, subject, or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedIds.size > 0 && (
        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex flex-wrap items-center gap-3 p-3">
            <span className="text-sm font-medium">
              {selectedIds.size} selected
            </span>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Select value={bulkStatus} onValueChange={setBulkStatus}>
                <SelectTrigger className="w-[160px] h-9">
                  <SelectValue placeholder="Change status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">Mark as Read</SelectItem>
                  <SelectItem value="replied">Mark as Replied</SelectItem>
                  <SelectItem value="closed">Mark as Closed</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={handleBulkStatusUpdate}
                disabled={!bulkStatus || bulkMutation.isPending}
              >
                {bulkMutation.isPending && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}
                Apply
              </Button>
            </div>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <Button
              size="sm"
              variant="outline"
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
              onClick={() => setShowBulkDelete(true)}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Delete
            </Button>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <Button
              size="sm"
              variant="ghost"
              onClick={clearSelection}
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Clear
            </Button>
          </div>
        </Card>
      )}

      {/* Enquiries Table */}
      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : enquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No enquiries found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeFilter !== 'all' || searchTerm
                ? 'Try adjusting your filters'
                : 'Enquiries from customers will appear here'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all enquiries"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Subject</TableHead>
                  <TableHead className="hidden lg:table-cell">Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enquiries.map((enq) => (
                  <TableRow key={enq.id} className={selectedIds.has(enq.id) ? 'bg-muted/50' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(enq.id)}
                        onCheckedChange={() => toggleSelect(enq.id)}
                        aria-label={`Select enquiry from ${enq.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {enq.name}
                          {enq.companyName && (
                            <span className="text-xs text-muted-foreground block">
                              {enq.companyName}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground sm:hidden">
                          {enq.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {enq.email}
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                      {enq.subject}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge
                        variant="secondary"
                        className={typeColors[enq.type] || ''}
                      >
                        {enq.type === 'rfq' && <Hash className="mr-1 h-3 w-3" />}
                        {typeLabels[enq.type] || enq.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusColors[enq.status] || ''}
                      >
                        {enq.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {formatShortDate(enq.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {!enq.Quote && enq.User?.companyId && (
                           <Button
                           variant="ghost"
                           size="icon"
                           className="h-8 w-8 text-emerald-600"
                           onClick={() => handleOpenQuote(enq)}
                           title="Create Quote"
                         >
                           <FileText className="h-4 w-4" />
                         </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleViewEnquiry(enq)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => setDeleteId(enq.id)}
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1}&ndash;{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm font-medium px-2">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* View Enquiry Dialog */}
      <Dialog open={!!viewEnquiry} onOpenChange={() => setViewEnquiry(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewEnquiry?.subject}</DialogTitle>
          </DialogHeader>
          {viewEnquiry && (
            <div className="space-y-4">
              {/* Status Selector */}
              <div className="flex items-center gap-3">
                <Label>Status</Label>
                <Select value={statusUpdate} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Type & Product Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className={typeColors[viewEnquiry.type] || ''}
                >
                  {viewEnquiry.type === 'rfq' && <Hash className="mr-1 h-3 w-3" />}
                  {typeLabels[viewEnquiry.type] || viewEnquiry.type}
                </Badge>
                {viewEnquiry.Product && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {viewEnquiry.Product.name}
                  </Badge>
                )}
                {viewEnquiry.quantity && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    Qty: {viewEnquiry.quantity}
                  </Badge>
                )}
              </div>

              <Separator />

              {/* Contact Info */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Contact Information
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{viewEnquiry.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {viewEnquiry.email}
                </div>
                {viewEnquiry.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    {viewEnquiry.phone}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(viewEnquiry.createdAt)}
                </div>
              </div>

              {/* B2B Details */}
              {hasB2BFields(viewEnquiry) && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Business Details
                    </p>
                    {viewEnquiry.companyName && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{viewEnquiry.companyName}</span>
                      </div>
                    )}
                    {viewEnquiry.companyEmail && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        {viewEnquiry.companyEmail}
                      </div>
                    )}
                    {viewEnquiry.companyPhone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        {viewEnquiry.companyPhone}
                      </div>
                    )}
                    {viewEnquiry.companyAddress && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {viewEnquiry.companyAddress}
                      </div>
                    )}
                    {viewEnquiry.quantity && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Package className="h-3.5 w-3.5" />
                        Quantity: {viewEnquiry.quantity} units
                      </div>
                    )}
                  </div>
                </>
              )}

              <Separator />

              {/* Message */}
              <div>
                <Label className="mb-2 block">Message</Label>
                <div className="rounded-lg bg-muted p-4 text-sm whitespace-pre-wrap">
                  {viewEnquiry.message}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewEnquiry(null)}>
              Close
            </Button>
            <Button
              variant="outline"
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              onClick={() => {
                if (viewEnquiry) {
                  setDeleteId(viewEnquiry.id);
                  setViewEnquiry(null);
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation (Single) */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Enquiry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this enquiry? This action cannot be undone.
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

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} Enquiries</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.size} selected enquiry(ies)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowBulkDelete(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={bulkMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {bulkMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                `Delete ${selectedIds.size} Enquiries`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quote Dialog */}
      <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Formal Quote</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Total Amount ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0.00"
                  className="pl-9"
                  value={quoteForm.totalAmount}
                  onChange={(e) => setQuoteForm({ ...quoteForm, totalAmount: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Valid Until</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  className="pl-9"
                  value={quoteForm.validUntil}
                  onChange={(e) => setQuoteForm({ ...quoteForm, validUntil: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes (Internal or for Buyer)</Label>
              <Input
                placeholder="Special terms, shipping info..."
                value={quoteForm.notes}
                onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuoteOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateQuote} disabled={quoteMutation.isPending}>
              {quoteMutation.isPending ? 'Creating...' : 'Send Quote'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
