import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { storefrontCache, CACHE_TAGS, storefrontCacheHeaders } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const storeId = getStoreId(request);
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');

    if (!location) {
      return NextResponse.json(
        { error: 'Location parameter is required' },
        { status: 400 }
      );
    }

    const loadMenu = storefrontCache(
      [`menu:${storeId ?? 'default'}:${location}`],
      async () => {
        const menu = await db.menu.findFirst({
          where: {
            location,
            isActive: true,
            ...(storeId ? { storeId } : {}),
          },
          include: {
            items: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
              include: {
                children: {
                  where: { isActive: true },
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        });

        if (!menu) {
          return { menu: null, items: [] };
        }

        // Build hierarchical structure
        const topLevelItems = menu.items.filter((item) => !item.parentId);
        const itemsByParent = new Map<string, typeof menu.items>();
        menu.items.forEach((item) => {
          if (item.parentId) {
            if (!itemsByParent.has(item.parentId)) {
              itemsByParent.set(item.parentId, []);
            }
            itemsByParent.get(item.parentId)!.push(item);
          }
        });

        const buildTree = (items: typeof menu.items) => {
          return items.map((item) => ({
            ...item,
            children: buildTree(itemsByParent.get(item.id) || []),
          }));
        };

        const tree = buildTree(topLevelItems);

        return { menu, items: tree };
      },
      [CACHE_TAGS.menus],
      600,
    );

    const { menu, items } = await loadMenu();
    const response = NextResponse.json({ menu, items });
    Object.entries(storefrontCacheHeaders(600)).forEach(([key, value]) =>
      response.headers.set(key, value),
    );
    return response;
  } catch (error) {
    console.error('Get menu by location error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
