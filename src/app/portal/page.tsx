'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import {
  Building2,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  FileEdit,
  User as UserIcon,
  ShieldCheck,
  DollarSign,
  Calendar,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/pricing';
import { AddressBook } from '@/components/store/AddressBook';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface QuoteItem {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  quantity: number;
  total: number;
}

interface Quote {
  id: string;
  quoteNumber: string;
  status: string;
  subtotal: number;
  totalAmount: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  validUntil: string | null;
  notes: string | null;
  createdAt: string;
  items: QuoteItem[];
}

const quoteStatusColors: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  converted: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
};

export default function BuyerPortalPage() {
  const { auth, navigate, settings } = useAppStore();
  const isB2C = settings?.store_mode === 'b2c';
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);

  useEffect(() => {
    if (!auth.user) {
      navigate('home');
      return;
    }

    async function fetchPortalData() {
      try {
        const [enqRes, quoteRes] = await Promise.all([
          fetch(`/api/enquiries?userId=${auth.user?.id}`, {
            headers: { 'Authorization': `Bearer ${auth.token}` }
          }),
          fetch(`/api/quotes?userId=${auth.user?.id}`, {
            headers: { 'Authorization': `Bearer ${auth.token}` }
          })
        ]);

        if (enqRes.ok) {
          const data = await enqRes.json();
          setEnquiries(data.enquiries || []);
        }
        if (quoteRes.ok) {
          const data = await quoteRes.json();
          setQuotes(data.quotes || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPortalData();
  }, [auth.user, auth.token, navigate]);

  const handleAcceptQuote = async (id: string) => {
    try {
      const res = await fetch(`/api/quotes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ status: 'accepted' })
      });
      if (res.ok) {
        toast.success('Quote accepted! A sales representative will contact you to confirm.');
        setQuotes(prev => prev.map(q => q.id === id ? { ...q, status: 'accepted' } : q));
        if (selectedQuote?.id === id) setSelectedQuote({ ...selectedQuote, status: 'accepted' });
      }
    } catch {
      toast.error('Failed to accept quote');
    }
  };

  if (!auth.user) return null;

  const activeQuotes = quotes.filter(q => ['draft', 'sent'].includes(q.status));
  const recentQuotes = quotes.slice(0, 5);

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{isB2C ? 'Customer Portal' : 'Buyer Portal'}</h1>
          <p className="text-muted-foreground">Welcome back, {auth.user.name}. {isB2C ? 'Manage your account and orders.' : 'Manage your business account, quotes, and enquiries.'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('catalogue')}>
            <Package className="mr-2 h-4 w-4" />
            Browse Products
          </Button>
          {isB2C ? (
             <Button className="bg-primary text-white" onClick={() => navigate('orders')}>
                <Package className="mr-2 h-4 w-4" />
                My Orders
             </Button>
          ) : (
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => navigate('catalogue')}>
                <FileText className="mr-2 h-4 w-4" />
                New Quote
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            {isB2C && <TabsTrigger value="orders" onClick={() => navigate('orders')}>Orders</TabsTrigger>}
            <TabsTrigger value="addresses">Address Book</TabsTrigger>
            {!isB2C && <TabsTrigger value="quotes">Quotes</TabsTrigger>}
        </TabsList>

        <TabsContent value="dashboard" className="space-y-8">
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{auth.user.isVerified ? 'Verified' : 'Pending'}</span>
              <Badge variant={auth.user.isVerified ? 'default' : 'secondary'} className={auth.user.isVerified ? 'bg-emerald-500' : ''}>
                {auth.user.isVerified ? 'B2B Partner' : 'Standard'}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Pricing Tier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold capitalize">{auth.user.tier || 'Standard'}</span>
              {auth.user.tier && auth.user.tier !== 'standard' && (
                <Badge className="bg-amber-500 text-white">Active Discount</Badge>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileEdit className="h-4 w-4 text-blue-500" />
              Active Quotes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeQuotes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-500" />
              Enquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enquiries.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Quotes Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Your Formal Quotes
            </CardTitle>
            <CardDescription>Review and accept formal price offers from our team.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : quotes.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-xl">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground">No formal quotes received yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Submit an RFQ to receive a formal price offer.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {quotes.map((quote) => (
                  <div key={quote.id} className="p-4 border rounded-xl hover:shadow-md transition-all bg-card">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">Quote #{quote.id.substring(quote.id.length - 6).toUpperCase()}</span>
                          <Badge className={
                            quote.status === 'accepted' ? 'bg-emerald-500' :
                            quote.status === 'sent' ? 'bg-blue-500' : 'bg-slate-500'
                          }>
                            {quote.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          Ref: {quote.Enquiry?.subject || 'Direct Quote'}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground uppercase font-semibold">Total Amount</p>
                          <p className="text-xl font-bold text-emerald-600">{formatPrice(quote.total, quote.currency)}</p>
                        </div>
                        <div className="flex gap-2">
                           <Button variant="outline" size="sm" onClick={() => setSelectedQuote(quote)}>
                            View Details
                          </Button>
                          {quote.status === 'sent' && (
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleAcceptQuote(quote.id)}>
                              Accept
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Enquiries */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Inquiry History</CardTitle>
            <CardDescription>Status of your recent requests.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : enquiries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No enquiries found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {enquiries.slice(0, 5).map((e) => (
                  <div key={e.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="space-y-1">
                      <p className="text-sm font-medium truncate max-w-[120px]">{e.subject}</p>
                      <p className="text-xs text-muted-foreground">{new Date(e.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={e.status === 'new' ? 'secondary' : 'default'} className="capitalize">
                      {e.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Profile Info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Update your company details for faster quoting.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email</span>
                  <span>{auth.user.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Verified Status</span>
                  <span className={auth.user.isVerified ? 'text-emerald-600' : 'text-amber-600'}>
                    {auth.user.isVerified ? 'Verified Partner' : 'Verification Required'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <UserIcon className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </TabsContent>

      <TabsContent value="addresses">
        <Card>
            <CardContent className="pt-6">
                <AddressBook />
            </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="quotes">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                Formal Quotes
              </CardTitle>
              <CardDescription>All formal price offers sent to your business.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : quotes.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/20 mb-4" />
                  <p className="text-muted-foreground">No formal quotes received yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quotes.map((quote) => (
                    <div key={quote.id} className="p-4 border rounded-xl hover:shadow-md transition-all bg-card">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">Quote #{quote.id.substring(quote.id.length - 6).toUpperCase()}</span>
                            <Badge className={
                              quote.status === 'accepted' ? 'bg-emerald-500' :
                              quote.status === 'sent' ? 'bg-blue-500' : 'bg-slate-500'
                            }>
                              {quote.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Created: {new Date(quote.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Total</p>
                            <p className="text-xl font-bold text-emerald-600">{formatPrice(quote.total, quote.currency)}</p>
                          </div>
                          <div className="flex gap-2">
                             <Button variant="outline" size="sm" onClick={() => setSelectedQuote(quote)}>
                              View
                            </Button>
                            {quote.status === 'sent' && (
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleAcceptQuote(quote.id)}>
                                Accept
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inquiry History</CardTitle>
              <CardDescription>All your product and bulk enquiries.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : enquiries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No enquiries found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {enquiries.map((e) => (
                    <div key={e.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{e.subject}</p>
                        <p className="text-xs text-muted-foreground">{new Date(e.createdAt).toLocaleString()}</p>
                      </div>
                      <Badge variant={e.status === 'new' ? 'secondary' : 'default'} className="capitalize">
                        {e.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      </Tabs>

      {/* Quote Detail Dialog */}
      <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quote Details</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-emerald-600">{formatPrice(selectedQuote.totalAmount, selectedQuote.currency)}</h3>
                  <p className="text-sm text-muted-foreground">Quote ID: {selectedQuote.id.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <Badge className="mb-1">{selectedQuote.status}</Badge>
                  {selectedQuote.validUntil && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                      <Calendar className="h-3 w-3" />
                      Valid until: {new Date(selectedQuote.validUntil).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Proposed Items
                </h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left">Item</th>
                        <th className="px-4 py-2 text-center">Qty</th>
                        <th className="px-4 py-2 text-right">Unit Price</th>
                        <th className="px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        try {
                          const items = JSON.parse(selectedQuote.items || '[]');
                          return items.map((item: any, idx: number) => (
                            <tr key={idx} className="border-t">
                              <td className="px-4 py-2">{item.name || 'Product'}</td>
                              <td className="px-4 py-2 text-center">{item.quantity}</td>
                              <td className="px-4 py-2 text-right">{formatPrice(item.unitPrice, selectedQuote.currency)}</td>
                              <td className="px-4 py-2 text-right font-medium">{formatPrice(item.quantity * item.unitPrice, selectedQuote.currency)}</td>
                            </tr>
                          ));
                        } catch {
                          return <tr><td colSpan={4} className="px-4 py-2 text-center">Error loading items</td></tr>;
                        }
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedQuote.notes && (
                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900 flex gap-3">
                  <Info className="h-5 w-5 text-blue-600 shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-900 dark:text-blue-300">Notes from Seller</p>
                    <p className="text-blue-800 dark:text-blue-400">{selectedQuote.notes}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setSelectedQuote(null)}>Close</Button>
                {selectedQuote.status === 'sent' && (
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleAcceptQuote(selectedQuote.id)}>
                    Accept This Quote
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
