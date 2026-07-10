import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getStoreId } from '@/lib/store-db';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);

    // Aggregate Orders
    const orders = await db.order.findMany({
        where: storeId ? { storeId } : {},
        select: { totalAmount: true, createdAt: true, status: true }
    });

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = orders.length;

    // Sales by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesByDay: Record<string, number> = {};
    orders.forEach(o => {
        if (o.createdAt >= thirtyDaysAgo) {
            const day = o.createdAt.toISOString().split('T')[0];
            salesByDay[day] = (salesByDay[day] || 0) + o.totalAmount;
        }
    });

    const chartData = Object.entries(salesByDay).map(([date, amount]) => ({ date, amount })).sort((a, b) => a.date.localeCompare(b.date));

    // Top Products
    const topProducts = await db.orderItem.groupBy({
        by: ['productId', 'name'],
        where: { Order: storeId ? { storeId } : {} },
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
    });

    return NextResponse.json({
        stats: {
            totalRevenue,
            totalOrders,
            averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        },
        chartData,
        topProducts
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
