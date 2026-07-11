import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';

export async function POST(request: NextRequest) {
  try {
    const storeId = getStoreId(request);
    const { items } = await request.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ methods: [] });
    }

    const productIds = items.map((i: any) => i.productId).filter(Boolean);
    const dbProducts = await db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true },
    });

    const productPriceMap = new Map(dbProducts.map((p) => [p.id, p.price]));
    let subtotal = 0;
    for (const item of items) {
      const price = productPriceMap.get(item.productId);
      if (price == null) continue;
      subtotal += price * Math.max(1, Math.floor(item.quantity || 1));
    }

    const rates = await db.shippingRate.findMany({
      where: {
        storeId: storeId || undefined,
        isActive: true,
        minSubtotal: { lte: subtotal },
        OR: [
          { maxSubtotal: null },
          { maxSubtotal: { gte: subtotal } },
        ],
      },
      orderBy: { sortOrder: 'asc' },
    });

    const methods = rates.map((r) => {
      let rate = r.rate;
      if (r.freeAbove != null && subtotal >= r.freeAbove) {
        rate = 0;
      }
      return {
        id: r.id,
        name: r.name,
        rate,
        deliveryEta: r.deliveryEta || null,
        free: rate === 0,
      };
    });

    return NextResponse.json({ methods, subtotal });
  } catch (error) {
    console.error('Shipping calculate error:', error);
    return NextResponse.json({ error: 'Failed to calculate shipping' }, { status: 500 });
  }
}
