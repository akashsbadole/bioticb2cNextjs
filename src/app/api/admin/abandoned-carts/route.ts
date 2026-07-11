import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getStoreId } from '@/lib/store-db';
import { findAbandonedCarts, sendAbandonedCartReminder } from '@/lib/abandoned-cart';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const carts = await findAbandonedCarts({ storeId });

    return NextResponse.json({ carts });
  } catch (error) {
    console.error('Abandoned carts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const body = await request.json();
    const { email, userName, cartId } = body;

    if (!cartId) {
      return NextResponse.json({ error: 'cartId required' }, { status: 400 });
    }

    // Find the full cart with included relations for the reminder helper
    const cart = await db.cart.findUnique({
      where: { id: cartId },
      include: {
        User: { select: { name: true, email: true, phone: true } },
        items: { include: { Product: { select: { name: true, price: true } } } },
      },
    });

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const result = await sendAbandonedCartReminder(cart as any);

    return NextResponse.json({ success: true, sent: result });
  } catch (error) {
    console.error('Abandoned cart reminder error:', error);
    return NextResponse.json({ error: 'Failed to send reminder' }, { status: 500 });
  }
}
