import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    // --- Enquiry Trends: last 30 days grouped by createdAt date ---
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const enquiriesLast30 = await db.enquiry.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        ...(storeId ? { storeId } : {}),
      },
      select: {
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date string (YYYY-MM-DD)
    const dateMap = new Map<string, number>();
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const key = d.toISOString().split('T')[0];
      dateMap.set(key, 0);
    }

    for (const eq of enquiriesLast30) {
      const key = eq.createdAt.toISOString().split('T')[0];
      if (dateMap.has(key)) {
        dateMap.set(key, (dateMap.get(key) || 0) + 1);
      }
    }

    const enquiryTrends = Array.from(dateMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    // --- Product Stats ---
    const productWhere = storeId ? { storeId } : {};
    const [totalProducts, activeProducts, featuredProducts, totalCategories] = await Promise.all([
      db.product.count({ where: productWhere }),
      db.product.count({ where: { isActive: true, ...productWhere } }),
      db.product.count({ where: { isFeatured: true, ...productWhere } }),
      db.category.count({ where: productWhere }),
    ]);

    const productStats = {
      total: totalProducts,
      active: activeProducts,
      featured: featuredProducts,
      categories: totalCategories,
    };

    // --- Recent Activity: last 10 activity log entries ---
    const recentActivity = await db.activityLog.findMany({
      take: 10,
      include: {
        User: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // --- Summary stats (enquiries this week vs last week) ---
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const enquiryWhere = storeId ? { storeId } : {};
    const [thisWeekCount, lastWeekCount] = await Promise.all([
      db.enquiry.count({ where: { createdAt: { gte: startOfWeek }, ...enquiryWhere } }),
      db.enquiry.count({
        where: { createdAt: { gte: startOfLastWeek, lt: startOfWeek }, ...enquiryWhere },
      }),
    ]);

    const enquiryStats = {
      thisWeek: thisWeekCount,
      lastWeek: lastWeekCount,
      total: await db.enquiry.count({ where: enquiryWhere }),
      newCount: await db.enquiry.count({ where: { status: 'new', ...enquiryWhere } }),
      rfqCount: await db.enquiry.count({ where: { type: 'rfq', ...enquiryWhere } }),
    };

    // Conversion rate = enquiries replied or closed / total enquiries * 100
    const repliedOrClosed = await db.enquiry.count({
      where: { status: { in: ['replied', 'closed'] }, ...enquiryWhere },
    });
    const conversionRate =
      enquiryStats.total > 0
        ? Math.round((repliedOrClosed / enquiryStats.total) * 100)
        : 0;

    return NextResponse.json({
      enquiryTrends,
      productStats,
      recentActivity,
      enquiryStats,
      conversionRate,
      quoteStats: {
        total: await db.quote.count(),
        sent: await db.quote.count({ where: { status: 'sent' } }),
        accepted: await db.quote.count({ where: { status: 'accepted' } }),
        totalAmount: (await db.quote.aggregate({
          where: { status: 'accepted' },
          _sum: { totalAmount: true }
        }))._sum.totalAmount || 0,
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
