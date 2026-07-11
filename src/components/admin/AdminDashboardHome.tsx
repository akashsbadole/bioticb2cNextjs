'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Package,
  FolderOpen,
  ImageIcon,
  FileText,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  TrendingUp,
  ShoppingCart,
  Mail,
  Search,
  KeyRound,
  BookOpen,
  Megaphone,
  AlertTriangle,
  BarChart3,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminFetch } from '@/lib/admin-fetch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStats {
  productStats: {
    total: number;
    active: number;
    featured: number;
    categories: number;
    lowStock: number;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    entity: string | null;
    entityId: string | null;
    userName: string | null;
    createdAt: string;
  }>;
}

export function AdminDashboardHome({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
        const res = await adminFetch('/api/dashboard/stats');
        return res.json();
    }
  });

  const stats = statsData as DashboardStats | null;

  const { data: settingsData } = useQuery({
    queryKey: ['admin-smtp-check'],
    queryFn: async () => {
        const res = await adminFetch('/api/store/settings');
        return res.json();
    }
  });

  const smtpConfigured = useMemo(() => {
    const s = settingsData?.settings;
    return !!(s?.smtp_host && s?.smtp_user);
  }, [settingsData]);

  const loading = statsLoading;

  const statCards = stats
    ? [
        { label: 'Total Products', value: stats.productStats.total, icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
        { label: 'Active Products', value: stats.productStats.active, icon: BarChart3, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/40' },
        { label: 'Categories', value: stats.productStats.categories, icon: FolderOpen, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/40' },
  
        ...(stats.productStats.lowStock > 0 ? [{ label: 'Low Stock', value: stats.productStats.lowStock, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/40' }] : []),
      ]
    : [];

  const quickActions = [
    { id: 'products', label: 'Manage Products', icon: Package },
    { id: 'categories', label: 'Manage Categories', icon: FolderOpen },
    { id: 'banners', label: 'Manage Banners', icon: ImageIcon },
    { id: 'settings', label: 'Settings', icon: Star },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Overview of your store performance</p>
      </div>

      {!smtpConfigured && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">Email not configured</p>
            <p className="text-sm text-yellow-700">SMTP settings are not set up. Order confirmation emails and notifications won't be sent. Go to Settings to configure SMTP.</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          : statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      </div>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.bg}`}>
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Navigate to different sections using the sidebar or click a shortcut below.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={`${action.id}-${index}`}
                    variant="outline"
                    size="sm"
                    className="h-auto flex-col gap-2 py-4"
                    onClick={() => onNavigate?.(action.id)}
                  >
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs">{action.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        {stats?.productStats.lowStock ? (
          <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
                Low Stock Alert
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600"
                onClick={() => onNavigate?.('products')}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                {stats.productStats.lowStock} product{stats.productStats.lowStock !== 1 ? 's' : ''} running low on stock
              </p>
              <LowStockList />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-emerald-600" />
                Stock Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">All products are well stocked</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function LowStockList() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-low-stock'],
    queryFn: async () => {
      const res = await adminFetch('/api/products?all=true&stockStatus=out_of_stock&limit=10');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const products = data?.products || [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <p className="text-sm text-muted-foreground">No out-of-stock products found</p>;
  }

  return (
    <div className="space-y-2">
      {products.map((product: any) => (
        <div key={product.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
          <div>
            <p className="text-sm font-medium">{product.name}</p>
            <p className="text-xs text-muted-foreground">SKU: {product.sku || 'N/A'}</p>
          </div>
          <Badge variant="destructive" className="text-xs">
            {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
          </Badge>
        </div>
      ))}
    </div>
  );
}
