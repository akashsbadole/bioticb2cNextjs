import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 10);
    const storeId = getStoreId(request);

    if (!q || q.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const storeFilter = storeId ? { storeId } : {};
    const results = await db.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        ...storeFilter,
        name: { contains: q },
      },
      select: { name: true },
      take: limit,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      suggestions: results.map((r) => r.name),
    });
  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
