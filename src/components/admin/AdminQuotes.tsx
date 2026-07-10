'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Eye,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Send,
  DollarSign,
  User,
  Mail,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { adminFetch } from '@/lib/admin-fetch';
import { formatPrice } from '@/lib/pricing';

interface QuoteItem {
  id: string;
  productId: string;
  name: string;
  sku: string | null;
  price: number;
  quantity: number;
  total: number;
  images: string;
}

interface Quote {
  id: string;
  quoteNumber: string;
  userId: string;
  status: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  validUntil: string | null;
  notes: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  User: { id: string; name: string; email: string };
  items: QuoteItem[];
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusTabs = ['all', 'draft', 'sent', 'approved', 'rejected', 'converted'];

const statusColors: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  converted: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
};

const statusIcons: Record<string, typeof FileText> = {
  draft: FileText,
  sent: Send,
  approved: CheckCircle2,
  rejected: XCircle,
  converted: ArrowRightLeft,
};

const PAGE_SIZE = 20;

export function AdminQuotes() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const [viewQuote, setViewQuote] = useState<Quote | null>(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [discount, setDiscount] = useState('');
  const [tax, setTax] = useState('');
  const [saving, setSaving] = useState(false);

  const { data, isLoading: loading } = useQuery({
    queryKey: ['admin-quotes', activeFilter, searchTerm, page],
    queryFn: async () => {
        let url = `/api/admin/quotes?page=${page}&limit=${PAGE_SIZE}`;
        if (activeFilter !== 'all') url += `&status=${activeFilter}`;
        if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
        const res = await adminFetch(url);
        if (!res.ok) throw new Error('Failed');
        return await res.json();
    }
  });

  const quotes = data?.quotes || [];
  const pagination = data?.pagination || { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleViewQuote = (quote: Quote) => {
    setViewQuote(quote);
    setStatusUpdate(quote.status);
    setAdminNotes(quote.adminNotes || '');
    setDiscount(quote.discount?.toString() || '0');
    setTax(quote.tax?.toString() || '0');
  };

  const saveMutation = useMutation({
    mutationFn: async (body: any) => {
        const res = await adminFetch(`/api/admin/quotes/${viewQuote!.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Failed');
        return await res.json();
    },
    onSuccess: (data) => {
        setViewQuote(data.quote);
        setStatusUpdate(data.quote.status);
        setAdminNotes(data.quote.adminNotes || '');
        setDiscount(data.quote.discount?.toString() || '0');
        setTax(data.quote.tax?.toString() || '0');
        toast.success('Quote updated successfully');
        queryClient.invalidateQueries({ queryKey: ['admin-quotes'] });
    }
  });

  const handleSaveQuote = () => {
    if (!viewQuote) return;
    const body: Record<string, unknown> = {};
    if (statusUpdate !== viewQuote.status) body.status = statusUpdate;
    if (adminNotes !== (viewQuote.adminNotes || '')) body.adminNotes = adminNotes;
    if (parseFloat(discount) !== (viewQuote.discount || 0)) body.discount = parseFloat(discount);
    if (parseFloat(tax) !== (viewQuote.tax || 0)) body.tax = parseFloat(tax);

    if (Object.keys(body).length === 0) return;
    saveMutation.mutate(body);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quotes</h2>
          <p className="text-muted-foreground">Manage customer quote requests and pricing</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-quotes'] })}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => {
          const count = tab === 'all' ? pagination.total : quotes.filter(q => tab === 'all' || q.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === tab
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <span className="capitalize">{tab}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by quote number, customer name, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Quotes Table */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : quotes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="mx-auto h-12 w-12 mb-4 opacity-20" />
          <p>No quotes found</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => {
                const StatusIcon = statusIcons[quote.status] || FileText;
                return (
                  <TableRow key={quote.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {quote.quoteNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{quote.User?.name}</span>
                        <span className="text-xs text-muted-foreground">{quote.User?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{quote.items.length} item(s)</span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(quote.total, quote.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`${statusColors[quote.status]} capitalize`}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {quote.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewQuote(quote)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} quotes
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* View Quote Dialog */}
      <Dialog open={!!viewQuote} onOpenChange={(open) => !open && setViewQuote(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {viewQuote?.quoteNumber}
            </DialogTitle>
          </DialogHeader>

          {viewQuote && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Customer</Label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{viewQuote.User?.name}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{viewQuote.User?.email}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Quote Items */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Items</Label>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewQuote.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-sm font-medium">{item.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground font-mono">
                            {item.sku || '-'}
                          </TableCell>
                          <TableCell className="text-sm text-right">
                            {formatPrice(item.price, viewQuote.currency)}
                          </TableCell>
                          <TableCell className="text-sm text-right">{item.quantity}</TableCell>
                          <TableCell className="text-sm text-right font-medium">
                            {formatPrice(item.total, viewQuote.currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Separator />

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-quote-status">Status</Label>
                    <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                      <SelectTrigger id="admin-quote-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['draft', 'sent', 'approved', 'rejected', 'converted'].map((s) => (
                          <SelectItem key={s} value={s}>
                            <span className="capitalize">{s}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-quote-notes">Admin Notes</Label>
                    <textarea
                      id="admin-quote-notes"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Internal notes about this quote..."
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(viewQuote.subtotal, viewQuote.currency)}</span>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="admin-quote-discount" className="text-sm">Discount</Label>
                    <Input
                      id="admin-quote-discount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="admin-quote-tax" className="text-sm">Tax</Label>
                    <Input
                      id="admin-quote-tax"
                      type="number"
                      min="0"
                      step="0.01"
                      value={tax}
                      onChange={(e) => setTax(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm font-bold">
                    <span>Total</span>
                    <span>
                      {formatPrice(
                        viewQuote.subtotal - parseFloat(discount || '0') + parseFloat(tax || '0'),
                        viewQuote.currency
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Valid Until */}
              {viewQuote.validUntil && (
                <div className="text-sm text-muted-foreground">
                  <Clock className="inline mr-1 h-4 w-4" />
                  Valid until: {new Date(viewQuote.validUntil).toLocaleDateString()}
                </div>
              )}

              {/* Customer Notes */}
              {viewQuote.notes && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Customer Notes</Label>
                  <p className="text-sm bg-muted p-3 rounded-md">{viewQuote.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewQuote(null)}>
              Close
            </Button>
            <Button onClick={handleSaveQuote} disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
