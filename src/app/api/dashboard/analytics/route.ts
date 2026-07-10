import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { startOfDay, subDays, format } from 'date-fns';
import { getStoreId } from '@/lib/store-db';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    const startDate = subDays(startOfDay(new Date()), days);

    // Get enquiries trend
    const enquiries = await db.enquiry.findMany({
      where: {
        createdAt: { gte: startDate },
        ...(storeId ? { storeId } : {}),
      },
      select: {
        createdAt: true,
        status: true
      }
    });

    // Mock page views for trend (since we don't have a real analytics table)
    // In a real app, this would come from a PageViews or Analytics table
    const trend = Array.from({ length: days + 1 }).map((_, i) => {
      const date = format(subDays(new Date(), days - i), 'MMM dd');
      const count = enquiries.filter(e => format(e.createdAt, 'MMM dd') === date).length;
      return {
        date,
        enquiries: count,
        views: count * 15 // Estimated views per enquiry (15:1 ratio)
      };
    });

    // Get popular products (by enquiry count)
    const popularProducts = await db.product.findMany({
      where: { deletedAt: null, ...(storeId ? { storeId } : {}) },
      select: {
        id: true,
        name: true,
        _count: {
          select: { Enquiry: true }
        }
      },
      orderBy: {
        Enquiry: { _count: 'desc' }
      },
      take: 5
    });

    // Get category engagement
    const categories = await db.category.findMany({
      where: storeId ? { storeId } : undefined,
      select: {
        id: true,
        name: true,
        _count: {
          select: { Product: true }
        }
      }
    });

    return NextResponse.json({
      viewsData: trend,
      popularProducts,
      categoryStats: categories,
      summary: {
        totalEnquiries: enquiries.length,
        newEnquiries: enquiries.filter(e => e.status === 'new').length,
        conversionRate: enquiries.length > 0 ? 
          ((enquiries.filter(e => e.status !== 'new').length / enquiries.length) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
