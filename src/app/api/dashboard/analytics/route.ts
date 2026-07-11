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
      categoryStats: categories,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
