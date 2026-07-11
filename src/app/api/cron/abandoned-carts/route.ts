import { NextRequest, NextResponse } from 'next/server';
import { findAbandonedCarts, sendAbandonedCartReminder } from '@/lib/abandoned-cart';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || '';
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const carts = await findAbandonedCarts({ onlyUnsent: true });
    const results: { cartId: string; sent: { email: boolean; sms: boolean } }[] = [];

    for (const cart of carts) {
      const sent = await sendAbandonedCartReminder(cart as any);
      results.push({ cartId: cart.id, sent });
    }

    return NextResponse.json({
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error('Cron abandoned carts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
