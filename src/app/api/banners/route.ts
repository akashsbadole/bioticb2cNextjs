import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';

export async function GET(request: NextRequest) {
  try {
    const storeId = getStoreId(request);

    const banners = await db.banner.findMany({
      where: {
        isActive: true,
        ...(storeId ? { storeId } : {}),
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ banners });
  } catch (error) {
    return NextResponse.json({ banners: [] }, { status: 200 });
  }
}
