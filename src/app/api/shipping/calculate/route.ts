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
      select: { id: true, price: true, weight: true },
    });

    let totalWeight = 0;
    const productPriceMap = new Map(dbProducts.map((p) => [p.id, p.price]));
    const productWeightMap = new Map(dbProducts.map((p) => [p.id, p.weight ?? 0]));

    let subtotal = 0;
    for (const item of items) {
      const price = productPriceMap.get(item.productId);
      if (price == null) continue;
      const qty = Math.max(1, Math.floor(item.quantity || 1));
      subtotal += price * qty;
      totalWeight += (productWeightMap.get(item.productId) || 0) * qty;
    }

    // Fetch site settings for weight shipping and fallback costs
    const settingsList = await db.siteSetting.findMany({
      where: {
        key: { in: ['shipping_weight_rates', 'shipping_free_threshold', 'shipping_fixed_cost'] }
      }
    });

    const settingsMap = new Map(settingsList.map((s) => [s.key, s.value]));
    const weightRatesStr = settingsMap.get('shipping_weight_rates') || '[]';
    const freeThreshold = parseFloat(settingsMap.get('shipping_free_threshold') || '500');
    const flatCost = parseFloat(settingsMap.get('shipping_fixed_cost') || '50');

    let weightRate: number | null = null;
    if (weightRatesStr) {
      try {
        const tiers = JSON.parse(weightRatesStr);
        if (Array.isArray(tiers) && tiers.length > 0) {
          // Sort ascending by maxWeight
          tiers.sort((a: any, b: any) => a.maxWeight - b.maxWeight);
          const matched = tiers.find((t: any) => t.maxWeight >= totalWeight);
          if (matched) {
            weightRate = matched.rate;
          } else {
            // Fallback to highest tier
            weightRate = tiers[tiers.length - 1].rate;
          }
        }
      } catch (err) {
        console.error('Failed to parse weight rates:', err);
      }
    }

    const methods: any[] = [];
    if (weightRate !== null) {
      let rate = weightRate;
      if (subtotal >= freeThreshold) {
        rate = 0;
      }
      methods.push({
        id: 'weight-based',
        name: `Weight-based Shipping (${totalWeight.toFixed(2)} kg)`,
        rate,
        deliveryEta: '3-5 business days',
        free: rate === 0,
      });
    }

    // Fallback to custom database shipping rates
    if (methods.length === 0) {
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

      const dbMethods = rates.map((r) => {
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
      methods.push(...dbMethods);
    }

    // Default standard fallback
    if (methods.length === 0) {
      let rate = flatCost;
      if (subtotal >= freeThreshold) {
        rate = 0;
      }
      methods.push({
        id: 'flat-rate',
        name: 'Standard Delivery',
        rate,
        deliveryEta: '3-5 business days',
        free: rate === 0,
      });
    }

    return NextResponse.json({ methods, subtotal });
  } catch (error) {
    console.error('Shipping calculate error:', error);
    return NextResponse.json({ error: 'Failed to calculate shipping' }, { status: 500 });
  }
}
