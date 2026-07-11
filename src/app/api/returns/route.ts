import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.success) return auth.response;

    const body = await request.json();
    const { orderId, reason } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: orderId, userId: auth.payload.userId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!['delivered', 'shipped'].includes(order.status)) {
      return NextResponse.json({ error: 'Return can only be requested for delivered or shipped orders' }, { status: 400 });
    }

    const updated = await db.order.update({
      where: { id: orderId },
      data: {
        returnStatus: 'requested',
        notes: reason || order.notes,
      },
    });

    return NextResponse.json({ order: updated });
  } catch (error) {
    console.error('Return request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
