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

    // Try trigram similarity first, fallback to ILIKE
    let suggestions;
    try {
      if (storeId) {
        suggestions = await db.$queryRawUnsafe(
          `SELECT DISTINCT name, similarity(name, $1) as sim
           FROM "Product"
           WHERE "isActive" = true
           AND "deletedAt" IS NULL
           AND "storeId" = $3
           AND name % $1
           ORDER BY sim DESC
           LIMIT $2`,
          q, limit, storeId
        );
      } else {
        suggestions = await db.$queryRawUnsafe(
          `SELECT DISTINCT name, similarity(name, $1) as sim
           FROM "Product"
           WHERE "isActive" = true
           AND "deletedAt" IS NULL
           AND name % $1
           ORDER BY sim DESC
           LIMIT $2`,
          q, limit
        );
      }
    } catch {
      // Fallback: use ILIKE
      const storeFilter = storeId ? { storeId } : {};
      suggestions = await db.product.findMany({
        where: {
          isActive: true,
          deletedAt: null,
          ...storeFilter,
          name: { contains: q, mode: 'insensitive' },
        },
        select: { name: true },
        take: limit,
        orderBy: { name: 'asc' },
      });
    }

    return NextResponse.json({
      suggestions: suggestions.map((s: any) => s.name),
    });
  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
