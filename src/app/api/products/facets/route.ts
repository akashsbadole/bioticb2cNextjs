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

    // Aggregate attribute facets from the product `attributes` JSON string
    // (flat object like {"Material":"Cotton","Size":"M"}).
    const attributeMap = new Map<string, Map<string, number>>();
    const attributeProducts = await db.product.findMany({
      where: baseWhere,
      select: { attributes: true },
      take: 5000,
    });
    for (const p of attributeProducts) {
      if (!p.attributes) continue;
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(p.attributes);
      } catch {
        continue;
      }
      for (const [key, rawValue] of Object.entries(parsed)) {
        const values = Array.isArray(rawValue) ? rawValue.map(String) : [String(rawValue)];
        for (const value of values) {
          if (!value) continue;
          const byValue = attributeMap.get(key) || new Map<string, number>();
          byValue.set(value, (byValue.get(value) || 0) + 1);
          attributeMap.set(key, byValue);
        }
      }
    }
    const attributes = Array.from(attributeMap.entries()).map(([key, byValue]) => ({
      key,
      values: Array.from(byValue.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count),
    }));

    return NextResponse.json({
      categories: categories.map(c => ({ id: c.id, name: c.name, slug: c.slug, count: (c as any)._count.Product })),
      priceRange: {
        min: priceStats._min.price || 0,
        max: priceStats._max.price || 0,
        avg: priceStats._avg.price || 0,
      },
      brands: brands.map(b => ({ id: b.id, name: b.name, slug: b.slug, count: (b as any)._count.Product })),
      availability: { inStock: inStockCount, outOfStock: outOfStockCount },
      attributes,
    });
  } catch (error) {
    console.error('Facets error:', error);
    return NextResponse.json({ categories: [], priceRange: { min: 0, max: 0, avg: 0 }, brands: [], availability: { inStock: 0, outOfStock: 0 }, attributes: [] });
  }
}
