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

interface EnquiryTrendPoint {
  date: string;
  count: number;
}

interface DashboardChartData {
  enquiryTrends: EnquiryTrendPoint[];
  enquiryStats: {
    thisWeek: number;
    lastWeek: number;
    total: number;
    newCount: number;
    rfqCount: number;
  };
  conversionRate: number;
  productStats: {
    total: number;
    active: number;
    featured: number;
    categories: number;
  };
}

function formatDateShort(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-sm">
      <p className="text-xs text-muted-foreground">{formatDateShort(label || '')}</p>
      <p className="text-sm font-semibold">{payload[0].value} enquiries</p>
    </div>
  );
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

  const weekDelta = data
    ? data.enquiryStats.thisWeek - data.enquiryStats.lastWeek
    : 0;
  const weekPercent = data
    ? data.enquiryStats.lastWeek > 0
      ? Math.round((weekDelta / data.enquiryStats.lastWeek) * 100)
      : data.enquiryStats.thisWeek > 0
        ? 100
        : 0
    : 0;

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[280px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Enquiry Trend Area Chart */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-emerald-600" />
            Enquiry Trends (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.enquiryTrends} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="enquiryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDateShort}
                  className="text-xs"
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#enquiryGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            Quick Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enquiries This Week vs Last Week */}
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground mb-1">Enquiries This Week</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{data.enquiryStats.thisWeek}</span>
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  weekDelta >= 0
                    ? 'text-emerald-600'
                    : 'text-rose-600'
                }`}
              >
                {weekDelta >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {weekDelta >= 0 ? '+' : ''}{weekPercent}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              vs {data.enquiryStats.lastWeek} last week
            </p>
          </div>

          {/* Conversion Rate */}
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground mb-1">Response Rate</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{data.conversionRate}%</span>
              <Percent className="h-3 w-3 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              enquiries replied or closed
            </p>
          </div>

          {/* New vs Total */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">New</p>
              <p className="text-lg font-bold text-amber-600">{data.enquiryStats.newCount}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">RFQs</p>
              <p className="text-lg font-bold text-orange-600">{data.enquiryStats.rfqCount}</p>
            </div>
          </div>

          {/* Product Summary */}
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
    </div>
  );
}
