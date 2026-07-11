'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { adminFetch } from '@/lib/admin-fetch';

interface DashboardChartData {
  productStats: {
    total: number;
    active: number;
    featured: number;
    categories: number;
  };
}

export function DashboardCharts() {
  const { data: rawData, isLoading: loading } = useQuery({
    queryKey: ['admin-dashboard-stats-charts'],
    queryFn: async () => {
        const res = await adminFetch('/api/dashboard/stats');
        return res.json();
    }
  });

  const data = rawData as DashboardChartData | null;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-emerald-600" />
          Product Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground mb-1">Products</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Active</span>
            <span className="font-medium">{data.productStats.active}/{data.productStats.total}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">Featured</span>
            <span className="font-medium">{data.productStats.featured}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">Categories</span>
            <span className="font-medium">{data.productStats.categories}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
