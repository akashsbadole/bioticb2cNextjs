'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User,
  Package,
  MapPin,
  Settings,
  LogOut,
  Shield,
  CreditCard,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Mail,
  Phone,
  Headphones,
  LayoutDashboard,
  Heart,
  Search,
  ShoppingCart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';
import { formatPrice } from '@/lib/pricing';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { OrdersPage } from './OrdersPage';

type AccountTab = 'dashboard' | 'profile' | 'orders' | 'addresses' | 'wishlist' | 'tracking' | 'support' | 'security';

export function AccountPage() {
  const [activeTab, setActiveTab] = useState<AccountTab>('dashboard');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { auth, logout, navigate, settings, addToCart } = useAppStore();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    enabled: !!auth.user,
    queryFn: async () => {
        const res = await fetch('/api/account');
        return (await res.json()).user;
    }
  });

  const { data: addresses = [], isLoading: addressesLoading } = useQuery({
    queryKey: ['addresses'],
    enabled: !!auth.user,
    queryFn: async () => {
        const res = await fetch('/api/account/addresses');
        return (await res.json()).addresses || [];
    }
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    enabled: !!auth.user,
    queryFn: async () => {
        const res = await fetch('/api/orders');
        return (await res.json()).orders || [];
    }
  });

  const { data: wishlistItems = [], isLoading: wishlistLoading } = useQuery({
    queryKey: ['wishlist'],
    enabled: !!auth.user,
    queryFn: async () => {
        const res = await fetch('/api/wishlist');
        return (await res.json()).items || [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
        const res = await fetch(`/api/wishlist?productId=${productId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
        toast.success("Removed from wishlist");
        queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
        const res = await fetch('/api/account', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error("Failed to update");
        return res.json();
    },
    onSuccess: () => {
        toast.success("Profile updated");
        queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (err: any) => toast.error(err.message)
  });

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match');
      }
      const res = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to change password');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const sendVerification = async () => {
    try {
      await fetch('/api/account/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: auth.user?.email }),
      });
      toast.success('Verification email sent');
    } catch {
      toast.error('Could not send verification email');
    }
  };

  if (!auth.user) {
    return (
        <div className="container mx-auto px-4 py-32 text-center">
            <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-black mb-4">Account Access</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">Please sign in to your account to manage your orders, addresses and profile settings.</p>
            <Button size="lg" className="rounded-full px-12" onClick={() => navigate("login")}>Sign In</Button>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-2">
                <div className="p-6 rounded-3xl bg-muted/30 border mb-6">
                    <div className="h-16 w-16 bg-primary text-white rounded-2xl flex items-center justify-center text-2xl font-black mb-4">
                        {profile?.name?.charAt(0) || auth.user?.name?.charAt(0)}
                    </div>
                    <p className="font-black text-xl truncate">{profile?.name || auth.user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{auth.user?.email}</p>
                </div>

                {[
                    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                    { id: 'profile', label: 'My Profile', icon: User },
                    { id: 'orders', label: 'Order History', icon: Package },
                    { id: 'wishlist', label: 'My Wishlist', icon: Heart },
                    { id: 'addresses', label: 'Addresses', icon: MapPin },
                    { id: 'tracking', label: 'Track Order', icon: Search },
                    { id: 'support', label: 'Support', icon: Headphones },
                    { id: 'security', label: 'Security', icon: Shield },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as AccountTab)}
                        className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20 font-bold' : 'hover:bg-muted text-muted-foreground'}`}
                    >
                        <div className="flex items-center gap-3">
                            <tab.icon className="h-5 w-5" />
                            <span>{tab.label}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 opacity-50" />
                    </button>
                ))}

                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all mt-8 font-bold"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3 min-h-[600px]">
                {activeTab === 'dashboard' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        {/* Welcome Banner */}
                        <div className="p-8 rounded-[2.5rem] bg-gradient-to-r from-emerald-800 to-emerald-600 text-white shadow-xl">
                            <h2 className="text-3xl font-black mb-2">Welcome back, {profile?.name || auth.user?.name || 'Valued Customer'}!</h2>
                            <p className="opacity-90 max-w-xl text-sm">
                                From your dashboard you can easily check your recent orders, manage shipping addresses, track active shipments, and edit your profile.
                            </p>
                        </div>

                        {/* KPI Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="p-6 border-none shadow-lg rounded-3xl bg-card flex items-center justify-between group cursor-pointer hover:shadow-xl transition-all" onClick={() => setActiveTab('orders')}>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Orders</p>
                                    <p className="text-3xl font-black">{orders.length}</p>
                                </div>
                                <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Package className="h-6 w-6" />
                                </div>
                            </Card>

                            <Card className="p-6 border-none shadow-lg rounded-3xl bg-card flex items-center justify-between group cursor-pointer hover:shadow-xl transition-all" onClick={() => setActiveTab('wishlist')}>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Wishlist</p>
                                    <p className="text-3xl font-black">{wishlistItems.length}</p>
                                </div>
                                <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Heart className="h-6 w-6" />
                                </div>
                            </Card>

                            <Card className="p-6 border-none shadow-lg rounded-3xl bg-card flex items-center justify-between group cursor-pointer hover:shadow-xl transition-all" onClick={() => setActiveTab('addresses')}>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Addresses</p>
                                    <p className="text-3xl font-black">{addresses.length}</p>
                                </div>
                                <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <MapPin className="h-6 w-6" />
                                </div>
                            </Card>
                        </div>

                        {/* Recent Order Status Tracking */}
                        <Card className="p-8 border-none shadow-xl rounded-[2.5rem]">
                            <h3 className="font-black text-xl mb-4">Latest Order Status</h3>
                            {ordersLoading ? (
                                <div className="h-20 bg-muted animate-pulse rounded-2xl" />
                            ) : orders.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground">
                                    <p className="text-sm">You have not placed any orders yet.</p>
                                    <Button size="sm" variant="outline" className="mt-4 rounded-full" onClick={() => navigate('shop')}>Shop Our Products</Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div>
                                            <p className="font-bold text-base">Order #{orders[0].orderNumber || orders[0].id.slice(0, 8).toUpperCase()}</p>
                                            <p className="text-xs text-muted-foreground">Placed on {format(new Date(orders[0].createdAt), 'PPP')}</p>
                                        </div>
                                        <Badge className={`uppercase text-[10px] font-black px-3 py-1 rounded-full ${orders[0].status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                            {orders[0].status}
                                        </Badge>
                                    </div>

                                    {/* Mini tracking timeline */}
                                    <div className="pt-4">
                                        <div className="relative">
                                            <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted/50 -translate-y-1/2 rounded-full" />
                                            <div className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full transition-all duration-500" style={{ width: orders[0].status === 'delivered' ? '100%' : orders[0].status === 'shipped' ? '66%' : '33%' }} />

                                            <div className="relative flex justify-between">
                                                <div className="flex flex-col items-center bg-background p-1 rounded-full ring-2 ring-primary">
                                                    <span className="h-3 w-3 rounded-full bg-primary" />
                                                    <span className="text-[10px] font-bold mt-2">Ordered</span>
                                                </div>
                                                <div className={`flex flex-col items-center bg-background p-1 rounded-full ${['shipped', 'delivered'].includes(orders[0].status) ? 'ring-2 ring-primary' : 'ring-2 ring-muted'}`}>
                                                    <span className={`h-3 w-3 rounded-full ${['shipped', 'delivered'].includes(orders[0].status) ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                                                    <span className="text-[10px] font-bold mt-2">Shipped</span>
                                                </div>
                                                <div className={`flex flex-col items-center bg-background p-1 rounded-full ${orders[0].status === 'delivered' ? 'ring-2 ring-primary' : 'ring-2 ring-muted'}`}>
                                                    <span className={`h-3 w-3 rounded-full ${orders[0].status === 'delivered' ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                                                    <span className="text-[10px] font-bold mt-2">Delivered</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div>
                            <h2 className="text-3xl font-black">Profile Details</h2>
                            <p className="text-muted-foreground">Manage your personal information</p>
                        </div>

                        <Card className="border-none shadow-xl rounded-[2.5rem] p-8 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        defaultValue={profile?.name}
                                        className="h-12 rounded-xl bg-muted/30 border-transparent focus:bg-background"
                                        onChange={(e) => updateProfileMutation.mutate({ name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        value={profile?.email}
                                        disabled
                                        className="h-12 rounded-xl bg-muted/10 border-transparent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        defaultValue={profile?.phone}
                                        className="h-12 rounded-xl bg-muted/30 border-transparent focus:bg-background"
                                        placeholder="+1 234 567 890"
                                        onChange={(e) => updateProfileMutation.mutate({ phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {profile?.isVerified ? (
                                    <div className="flex items-center gap-3 text-emerald-600">
                                      <CheckCircle2 className="h-5 w-5" />
                                      <span className="text-sm font-bold">Email Verified</span>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={sendVerification}
                                      className="flex items-center gap-3 text-amber-600 hover:underline"
                                    >
                                      <XCircle className="h-5 w-5" />
                                      <span className="text-sm font-bold">Verify your email</span>
                                    </button>
                                  )}
                                </div>
                                <Button size="lg" className="rounded-full px-8 h-12 font-bold shadow-lg" onClick={() => toast.success("Changes saved")}>
                                    Save Changes
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'orders' && <OrdersPage />}

                {activeTab === 'wishlist' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div>
                            <h2 className="text-3xl font-black">My Wishlist</h2>
                            <p className="text-muted-foreground">Manage your saved favorite products</p>
                        </div>

                        {wishlistLoading ? (
                            <div className="grid md:grid-cols-2 gap-6">
                                {[1, 2].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-[2.5rem]" />)}
                            </div>
                        ) : wishlistItems.length === 0 ? (
                            <div className="text-center py-20 border-2 border-dashed rounded-[2.5rem] bg-muted/10">
                                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground font-medium">Your wishlist is empty</p>
                                <Button className="mt-4 rounded-full px-6 font-bold" onClick={() => navigate('products')}>Browse Products</Button>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-6">
                                {wishlistItems.map((item: any) => {
                                    const product = item.Product;
                                    const imgUrl = product.images ? JSON.parse(product.images)[0] : '';
                                    return (
                                        <Card key={item.id} className="p-6 border-none shadow-xl rounded-[2rem] flex gap-4 items-center bg-card">
                                            {imgUrl ? (
                                                <img src={imgUrl} alt={product.name} className="h-20 w-20 object-cover rounded-xl bg-muted" />
                                            ) : (
                                                <div className="h-20 w-20 bg-muted rounded-xl flex items-center justify-center">
                                                    <Heart className="h-8 w-8 text-muted-foreground/30" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-base truncate">{product.name}</p>
                                                <p className="text-primary font-bold text-sm mb-3">{formatPrice(product.price, settings?.currency || 'INR')}</p>
                                                <div className="flex gap-2">
                                                    <Button size="sm" className="rounded-full h-9 px-4 font-bold gap-2 text-xs" onClick={() => {
                                                        addToCart({
                                                            productId: product.id,
                                                            name: product.name,
                                                            price: product.price,
                                                            quantity: 1,
                                                            image: imgUrl || undefined,
                                                        });
                                                        deleteMutation.mutate(product.id);
                                                    }}>
                                                        <ShoppingCart className="h-3 w-3" /> Move to Cart
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="rounded-full h-9 px-3 text-rose-500 hover:bg-rose-50" onClick={() => deleteMutation.mutate(product.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'addresses' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-black">Saved Addresses</h2>
                                <p className="text-muted-foreground">Manage your delivery locations</p>
                            </div>
                            <Button className="rounded-full h-12 px-6 font-bold gap-2">
                                <Plus className="h-5 w-5" /> Add New
                            </Button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {addressesLoading ? (
                                [1, 2].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-[2.5rem]" />)
                            ) : addresses.length === 0 ? (
                                <div className="col-span-2 text-center py-20 border-2 border-dashed rounded-[2.5rem] bg-muted/10">
                                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground font-medium">No addresses saved yet</p>
                                </div>
                            ) : (
                                addresses.map((addr: any) => (
                                    <Card key={addr.id} className="p-8 border-none shadow-xl rounded-[2.5rem] relative group overflow-hidden">
                                        <div className="flex items-center justify-between mb-4">
                                            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none font-bold uppercase tracking-wider text-[10px]">
                                                {addr.label || 'Home'}
                                            </Badge>
                                            {addr.isDefault && (
                                                <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Default</span>
                                            )}
                                        </div>
                                        <p className="font-bold text-lg mb-1">{addr.name}</p>
                                        <p className="text-muted-foreground text-sm leading-relaxed mb-6">{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</p>
                                        <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {addr.phone}</span>
                                        </div>

                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 bg-white shadow-md rounded-full hover:text-primary transition-colors"><Settings className="h-4 w-4" /></button>
                                            <button className="p-2 bg-white shadow-md rounded-full hover:text-rose-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'tracking' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div>
                            <h2 className="text-3xl font-black">Order Tracking</h2>
                            <p className="text-muted-foreground">Check the real-time status of your shipments</p>
                        </div>

                        <Card className="p-8 border-none shadow-xl rounded-[2.5rem] space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="trackId">Enter Order ID or Number</Label>
                                <div className="flex gap-2">
                                    <Input id="trackId" placeholder="e.g. cmr..." className="h-12 rounded-xl bg-muted/30 border-transparent focus:bg-background" />
                                    <Button className="rounded-full px-8 font-bold h-12" onClick={() => {
                                        const val = (document.getElementById('trackId') as HTMLInputElement)?.value;
                                        if (!val) {
                                            toast.error('Please enter an Order ID');
                                            return;
                                        }
                                        const match = orders.find((o: any) => o.id === val || o.orderNumber === val);
                                        if (match) {
                                            toast.success(`Order found! Status is: ${match.status.toUpperCase()}`);
                                        } else {
                                            toast.error('Order not found under this account');
                                        }
                                    }}>
                                        Search
                                    </Button>
                                </div>
                            </div>

                            {orders.length > 0 && (
                                <div className="space-y-4">
                                    <p className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Your Active Shipments</p>
                                    <div className="space-y-3">
                                        {orders.map((o: any) => (
                                            <div key={o.id} className="p-4 rounded-2xl bg-muted/30 border flex items-center justify-between flex-wrap gap-2">
                                                <div>
                                                    <p className="font-bold text-sm">Order #{o.orderNumber || o.id.slice(0, 8).toUpperCase()}</p>
                                                    <p className="text-xs text-muted-foreground">Estimated Delivery: {o.status === 'delivered' ? 'Completed' : '3-5 Business Days'}</p>
                                                </div>
                                                <Button size="sm" variant="outline" className="rounded-full" onClick={() => {
                                                    const input = document.getElementById('trackId') as HTMLInputElement;
                                                    if (input) {
                                                        input.value = o.orderNumber || o.id;
                                                    }
                                                    toast.success(`Track query pre-filled for Order #${o.orderNumber || o.id.slice(0, 8).toUpperCase()}`);
                                                }}>
                                                    Track Shipment
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div>
                            <h2 className="text-3xl font-black">Security Settings</h2>
                            <p className="text-muted-foreground">Manage your password and account protection</p>
                        </div>

                        <Card className="border-none shadow-xl rounded-[2.5rem] p-8 space-y-8">
                                <div className="space-y-6">
                                    <h3 className="font-black text-xl">Change Password</h3>
                                    <div className="grid gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="curr">Current Password</Label>
                                            <Input id="curr" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="h-12 rounded-xl bg-muted/30 border-transparent focus:bg-background" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new">New Password</Label>
                                            <Input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-12 rounded-xl bg-muted/30 border-transparent focus:bg-background" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="conf">Confirm New Password</Label>
                                            <Input id="conf" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-12 rounded-xl bg-muted/30 border-transparent focus:bg-background" />
                                        </div>
                                    </div>
                                    <Button size="lg" className="rounded-full px-10 h-12 font-bold shadow-lg mt-4" onClick={() => changePasswordMutation.mutate()} disabled={changePasswordMutation.isPending}>
                                        {changePasswordMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Password'}
                                    </Button>
                                </div>

                            <Separator className="bg-muted/50" />

                            <div className="p-6 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-500">
                                        <XCircle className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-rose-900">Delete Account</p>
                                        <p className="text-sm text-rose-600">This action is permanent and cannot be undone.</p>
                                    </div>
                                </div>
                                <Button variant="ghost" className="text-rose-500 hover:bg-rose-100 font-bold rounded-full h-12 px-6">Request Deletion</Button>
                            </div>
                        </Card>
                    </div>
                )}
                {activeTab === 'support' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <SupportTab />
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}

function Card({ children, className, ...props }: any) {
    return <div className={cn("bg-card border rounded-xl overflow-hidden", className)} {...props}>{children}</div>
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}

function Separator({ className }: { className?: string }) {
    return <div className={cn("h-[1px] w-full bg-border", className)} />
}

function SupportTab() {
  const { auth, navigate } = useAppStore();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ subject, message, orderId: orderId || undefined, priority }),
      });
      if (res.ok) {
        toast.success('Support ticket created');
        setSubject('');
        setMessage('');
        setOrderId('');
        setPriority('medium');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to create ticket');
      }
    } catch {
      toast.error('Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black">Support</h2>
        <p className="text-muted-foreground">Need help? Create a support ticket.</p>
      </div>
      <Card className="border-none shadow-xl rounded-[2.5rem] p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief description of your issue" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue..." rows={4} required />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="orderId">Related Order ID (optional)</Label>
              <Input id="orderId" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="Order ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full h-12 rounded-xl bg-muted/30 border-transparent px-4">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <Button size="lg" className="rounded-full px-10 h-12 font-bold shadow-lg" type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Submit Ticket
          </Button>
        </form>
      </Card>
    </div>
  );
}
