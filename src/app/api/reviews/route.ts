import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const storeId = getStoreId(request);

    const reviews = await db.review.findMany({
      where: {
        isActive: true,
        ...(storeId ? { storeId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        Product: { select: { name: true, slug: true, images: true } },
        User: { select: { name: true } },
      },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
