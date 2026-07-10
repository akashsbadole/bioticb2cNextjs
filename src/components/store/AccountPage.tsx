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
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';
import { formatPrice } from '@/lib/pricing';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { OrdersPage } from './OrdersPage';

type AccountTab = 'profile' | 'orders' | 'addresses' | 'security';

export function AccountPage() {
  const [activeTab, setActiveTab] = useState<AccountTab>('profile');
  const { auth, logout, navigate, settings } = useAppStore();
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

  if (!auth.user) {
    return (
        <div className="container mx-auto px-4 py-32 text-center">
            <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-black mb-4">Account Access</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">Please sign in to your account to manage your orders, addresses and profile settings.</p>
            <Button size="lg" className="rounded-full px-12" onClick={() => navigate("home")}>Back to Shop</Button>
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
                    { id: 'profile', label: 'My Profile', icon: User },
                    { id: 'orders', label: 'Order History', icon: Package },
                    { id: 'addresses', label: 'Addresses', icon: MapPin },
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
                                <div className="flex items-center gap-3 text-emerald-600">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span className="text-sm font-bold">Email Verified</span>
                                </div>
                                <Button size="lg" className="rounded-full px-8 h-12 font-bold shadow-lg" onClick={() => toast.success("Changes saved")}>
                                    Save Changes
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'orders' && <OrdersPage />}

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
                                        <Input id="curr" type="password" className="h-12 rounded-xl bg-muted/30 border-transparent focus:bg-background" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new">New Password</Label>
                                        <Input id="new" type="password" className="h-12 rounded-xl bg-muted/30 border-transparent focus:bg-background" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="conf">Confirm New Password</Label>
                                        <Input id="conf" type="password" className="h-12 rounded-xl bg-muted/30 border-transparent focus:bg-background" />
                                    </div>
                                </div>
                                <Button size="lg" className="rounded-full px-10 h-12 font-bold shadow-lg mt-4">Update Password</Button>
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
