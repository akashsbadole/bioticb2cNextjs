import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/admin-auth';
import { getStoreId } from '@/lib/store-db';

interface SyncItem {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    const storeId = getStoreId(request);
    const auth = await requireAuth(request);
    const userId = auth.success ? auth.payload.userId : null;

    const body = await request.json();
    const items: SyncItem[] = Array.isArray(body.items) ? body.items : [];
    const guestToken: string | undefined = body.guestToken || undefined;
    const email: string | undefined = body.email || undefined;
    const phone: string | undefined = body.phone || undefined;

    // Identify the cart owner: logged-in user, otherwise a device-level guest token.
    const where = userId
      ? { userId }
      : guestToken
        ? { guestToken }
        : null;

    if (!where) {
      return NextResponse.json({ error: 'guestToken required for guests' }, { status: 400 });
    }

    const sanitizedItems = items
      .filter((i) => i && typeof i.productId === 'string' && i.quantity > 0)
      .map((i) => ({
        productId: i.productId,
        variantId: i.variantId || null,
        quantity: Math.min(Math.max(Math.floor(i.quantity), 1), 999),
      }));

    const productIds = [...new Set(sanitizedItems.map((i) => i.productId))];
    const variantIds = [...new Set(sanitizedItems.map((i) => i.variantId).filter(Boolean))] as string[];

    const [products, variants] = await Promise.all([
      db.product.findMany({ where: { id: { in: productIds } }, select: { id: true, stock: true } }),
      variantIds.length > 0
        ? db.productVariant.findMany({ where: { id: { in: variantIds } }, select: { id: true, stock: true } })
        : Promise.resolve([] as Array<{ id: string; stock: number }>),
    ]);

    const productStock = new Map(products.map((p) => [p.id, p.stock]));
    const variantStock = new Map(variants.map((v) => [v.id, v.stock]));

    const validatedItems: typeof sanitizedItems = [];
    for (const item of sanitizedItems) {
      const product = productStock.get(item.productId);
      if (product === undefined) continue;

      const availableStock = item.variantId ? (variantStock.get(item.variantId) ?? product) : product;

      if (availableStock <= 0) continue;

      validatedItems.push({ ...item, quantity: Math.min(item.quantity, availableStock) });
    }

    const cart = await db.cart.upsert({
      where,
      create: {
        storeId,
        userId: userId || null,
        guestToken: userId ? null : (guestToken as string),
        email: email || null,
        phone: phone || null,
        items: {
          create: validatedItems.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        },
      },
      update: {
        email: email || null,
        phone: phone || null,
        items: {
          deleteMany: {},
          create: validatedItems.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, cartId: cart.id });
  } catch (error) {
    console.error('Cart sync error:', error);
    return NextResponse.json({ error: 'Failed to sync cart' }, { status: 500 });
  }
}
