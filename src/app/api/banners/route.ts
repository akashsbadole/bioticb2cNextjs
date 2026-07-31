import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { storefrontCache, CACHE_TAGS, storefrontCacheHeaders } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const storeId = getStoreId(request);

    const loadBanners = storefrontCache(
      [`banners:${storeId ?? 'default'}`],
      async () =>
        db.banner.findMany({
          where: {
            isActive: true,
            ...(storeId ? { storeId } : {}),
          },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        }),
      [CACHE_TAGS.banners],
      300,
    );

    const banners = await loadBanners();

    const response = NextResponse.json({ banners });
    Object.entries(storefrontCacheHeaders(300)).forEach(([key, value]) =>
      response.headers.set(key, value),
    );
    return response;
  } catch (error) {
    return NextResponse.json({ banners: [] }, { status: 200 });
  }
}
