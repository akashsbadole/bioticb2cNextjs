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

    const cart = await db.cart.upsert({
      where,
      create: {
        storeId,
        userId: userId || null,
        guestToken: userId ? null : (guestToken as string),
        email: email || null,
        phone: phone || null,
        items: {
          create: sanitizedItems.map((i) => ({
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
          create: sanitizedItems.map((i) => ({
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
