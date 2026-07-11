import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    // --- Product Stats ---
    const productWhere = storeId ? { storeId } : {};
    const [totalProducts, activeProducts, featuredProducts, totalCategories, lowStockCount] = await Promise.all([
      db.product.count({ where: productWhere }),
      db.product.count({ where: { isActive: true, ...productWhere } }),
      db.product.count({ where: { isFeatured: true, ...productWhere } }),
      db.category.count({ where: productWhere }),
      db.product.count({ where: { stock: { lte: 5 }, ...productWhere } }),
    ]);

    const productStats = {
      total: totalProducts,
      active: activeProducts,
      featured: featuredProducts,
      categories: totalCategories,
      lowStock: lowStockCount,
    };

    // --- Recent Activity: last 10 activity log entries ---
    const recentActivity = await db.activityLog.findMany({
      take: 10,
      include: {
        User: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      productStats,
      recentActivity,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
