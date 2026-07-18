import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const storeId = getStoreId(request);

    const storeFilter = storeId ? { storeId } : {};
    const baseWhere: any = { isActive: true, deletedAt: null, ...storeFilter };
    if (search) {
      baseWhere.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Get categories with counts
    const categories = await db.category.findMany({
      where: { ...storeFilter, deletedAt: null },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { Product: { where: baseWhere } } },
      },
      orderBy: { name: 'asc' },
    });

    // Get price ranges
    const priceStats = await db.product.aggregate({
      where: baseWhere,
      _min: { price: true },
      _max: { price: true },
      _avg: { price: true },
    });

    // Availability counts
    const inStockCount = await db.product.count({ where: { ...baseWhere, stock: { gt: 0 } } });
    const outOfStockCount = await db.product.count({ where: { ...baseWhere, stock: { lte: 0 } } });

    // Get brands with product counts
    const brands = await db.brand.findMany({
      where: { ...storeFilter, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { Product: { where: baseWhere } } },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      categories: categories.map(c => ({ id: c.id, name: c.name, slug: c.slug, count: (c as any)._count.Product })),
      priceRange: {
        min: priceStats._min.price || 0,
        max: priceStats._max.price || 0,
        avg: priceStats._avg.price || 0,
      },
      brands: brands.map(b => ({ id: b.id, name: b.name, slug: b.slug, count: (b as any)._count.Product })),
      availability: { inStock: inStockCount, outOfStock: outOfStockCount },
    });
  } catch (error) {
    console.error('Facets error:', error);
    return NextResponse.json({ categories: [], priceRange: { min: 0, max: 0, avg: 0 }, brands: [], availability: { inStock: 0, outOfStock: 0 } });
  }
}
