import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { storefrontCache, CACHE_TAGS } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const storeId = getStoreId(request);

    const loadPopups = storefrontCache(
      [`popups:${storeId ?? 'default'}`],
      async () => {
        const now = new Date();

        return db.popup.findMany({
          where: {
            isActive: true,
            ...(storeId ? { storeId } : {}),
            AND: [
              {
                OR: [{ startDate: null }, { startDate: { lte: now } }],
              },
              {
                OR: [{ endDate: null }, { endDate: { gte: now } }],
              },
            ],
          },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        });
      },
      [CACHE_TAGS.popups],
      300,
    );

    const popups = await loadPopups();

    return NextResponse.json({ popups });
  } catch (error) {
    return NextResponse.json({ popups: [] }, { status: 200 });
  }
}
