import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const categoryId = searchParams.get('categoryId');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort') || 'relevance';
    const storeId = getStoreId(request);

    if (!q) {
      return NextResponse.json({ products: [], total: 0 });
    }

    const tsQuery = q.split(/\s+/).filter(Boolean).join(' & ');

    // Try full-text search via raw SQL (tsvector column)
    let products;
    try {
      const conditions: string[] = ['"P"."isActive" = true'];
      const params: any[] = [tsQuery, limit];
      let paramIdx = 3;

      if (storeId) {
        conditions.push(`"P"."storeId" = $${paramIdx++}`);
        params.push(storeId);
      }
      if (categoryId) {
        conditions.push(`"P"."categoryId" = $${paramIdx++}`);
        params.push(categoryId);
      }
      if (minPrice) {
        conditions.push(`"P"."price" >= $${paramIdx++}`);
        params.push(parseFloat(minPrice));
      }
      if (maxPrice) {
        conditions.push(`"P"."price" <= $${paramIdx++}`);
        params.push(parseFloat(maxPrice));
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

      let orderClause: string;
      switch (sort) {
        case 'price_asc': orderClause = 'ORDER BY "P"."price" ASC'; break;
        case 'price_desc': orderClause = 'ORDER BY "P"."price" DESC'; break;
        case 'newest': orderClause = 'ORDER BY "P"."createdAt" DESC'; break;
        case 'name': orderClause = 'ORDER BY "P"."name" ASC'; break;
        default: orderClause = 'ORDER BY ts_rank("P"."search_vector", to_tsquery(\'english\', $1)) DESC'; break;
      }

      products = await db.$queryRawUnsafe(
        `SELECT "P".* FROM "Product" "P" ${whereClause} AND "P"."search_vector" @@ to_tsquery('english', $1) ${orderClause} LIMIT $2`,
        ...params
      );
    } catch {
      // Fallback to ILIKE search
      const storeFilter = storeId ? { storeId } : {};
      const where: any = {
        isActive: true,
        deletedAt: null,
        ...storeFilter,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      };

      if (categoryId) where.categoryId = categoryId;
      if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
      if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };

      let orderBy: any;
      switch (sort) {
        case 'price_asc': orderBy = { price: 'asc' as const }; break;
        case 'price_desc': orderBy = { price: 'desc' as const }; break;
        case 'newest': orderBy = { createdAt: 'desc' as const }; break;
        case 'name': orderBy = { name: 'asc' as const }; break;
        default: orderBy = { createdAt: 'desc' as const };
      }

      products = await db.product.findMany({ where, take: limit, orderBy });
    }

    return NextResponse.json({ products, total: products.length });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ products: [], total: 0 });
  }
}
