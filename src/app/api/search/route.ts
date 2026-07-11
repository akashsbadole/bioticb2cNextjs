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

    const storeFilter = storeId ? { storeId } : {};
    const where: any = {
      isActive: true,
      deletedAt: null,
      ...storeFilter,
      OR: [
        { name: { contains: q } },
        { sku: { contains: q } },
        { description: { contains: q } },
      ],
    };

    if (categoryId) where.categoryId = categoryId;
    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };

    let orderBy: any;
    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' as const };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' as const };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' as const };
        break;
      case 'name':
        orderBy = { name: 'asc' as const };
        break;
      default:
        orderBy = { createdAt: 'desc' as const };
    }

    const products = await db.product.findMany({ where, take: limit, orderBy });

    return NextResponse.json({ products, total: products.length });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ products: [], total: 0 });
  }
}
