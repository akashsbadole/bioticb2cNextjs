import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/admin-auth';
import { ORDER_STATUS, ACTIVITY, type OrderStatus } from '@/lib/constants';
import { returnRequestSchema } from '@/lib/validations';
import { logActivity } from '@/lib/activity-log';
import { validateBody } from '@/lib/validate';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.success) return auth.response;

    const parsed = await validateBody(request, returnRequestSchema);
    if (parsed.response) return parsed.response;
    const { orderId, reason } = parsed.data;

    const order = await db.order.findUnique({
      where: { id: orderId, userId: auth.payload.userId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const returnable: OrderStatus[] = [ORDER_STATUS.DELIVERED, ORDER_STATUS.SHIPPED];
    if (!returnable.includes(order.status as OrderStatus)) {
      return NextResponse.json({ error: 'Return can only be requested for delivered or shipped orders' }, { status: 400 });
    }

    const updated = await db.order.update({
      where: { id: orderId },
      data: {
        returnStatus: 'requested',
        notes: reason || order.notes,
      },
    });

    logActivity({
      action: ACTIVITY.ORDER_RETURN_REQUEST,
      entity: 'Order',
      entityId: order.id,
      userId: auth.payload.userId,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      details: { reason: reason || null },
    }).catch(() => {});

    return NextResponse.json({ order: updated });
  } catch (error) {
    console.error('Return request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
