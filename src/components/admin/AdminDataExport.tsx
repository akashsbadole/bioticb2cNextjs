'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Download, Package, FolderOpen, FileText, MessageSquare, Users, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { adminFetch } from '@/lib/admin-fetch';

interface ExportItem {
  type: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

const exportItems: ExportItem[] = [
  { type: 'products', label: 'Products', icon: Package, description: 'Export all active products' },
  { type: 'categories', label: 'Categories', icon: FolderOpen, description: 'Export all categories' },
  { type: 'blog', label: 'Blog Posts', icon: FileText, description: 'Export all blog posts' },
  { type: 'enquiries', label: 'Enquiries', icon: MessageSquare, description: 'Export all enquiries' },
  { type: 'users', label: 'Users', icon: Users, description: 'Export all users' },
];

export function AdminDataExport() {
  const { data: counts = {}, isLoading: loading } = useQuery({
    queryKey: ['admin-export-counts'],
    queryFn: async () => {
        const results = await Promise.all([
          adminFetch('/api/products?all=true').then(r => r.ok ? r.json().then(d => d.products?.length || 0) : 0),
          adminFetch('/api/categories?all=true').then(r => r.ok ? r.json().then(d => d.categories?.length || 0) : 0),
          adminFetch('/api/blog?all=true&limit=1').then(r => r.ok ? r.json().then(d => d.pagination?.total || 0) : 0),
          adminFetch('/api/enquiries?limit=1').then(r => r.ok ? r.json().then(d => d.pagination?.total || 0) : 0),
          adminFetch('/api/users?all=true').then(r => r.ok ? r.json().then(d => d.users?.length || 0) : 0),
        ]);
        return {
          products: results[0],
          categories: results[1],
          blog: results[2],
          enquiries: results[3],
          users: results[4],
        };
    }
  });

  const exportMutation = useMutation({
    mutationFn: async (type: string) => {
        const res = await adminFetch(`/api/export?type=${type}`);
        if (!res.ok) throw new Error('Failed');
        return { type, blob: await res.blob() };
    },
    onSuccess: ({ type, blob }) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-export.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success(`${type} export downloaded`);
    },
    onError: (_, type) => toast.error(`Failed to export ${type}`)
  });

  const handleExport = (type: string) => exportMutation.mutate(type);

  const exporting = exportMutation.isPending ? exportMutation.variables : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Data Export</h2>
        <p className="text-muted-foreground mt-1">Download your data as CSV files</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exportItems.map((item) => {
          const Icon = item.icon;
          const count = counts[item.type];
          const isExporting = exporting === item.type;

          return (
            <Card key={item.type}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-base">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                    <Icon className="h-5 w-5 text-emerald-600" />
                  </div>
                  {item.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {loading ? '...' : `${count} record${count !== 1 ? 's' : ''}`}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isExporting || loading}
                    onClick={() => handleExport(item.type)}
                    className="gap-2"
                  >
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {isExporting ? 'Downloading...' : 'Download CSV'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
