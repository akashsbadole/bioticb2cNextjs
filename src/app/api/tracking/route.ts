import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ORDER_STATUS_FLOW, type OrderStatus } from '@/lib/constants';

const STEP_LABELS: Record<OrderStatus, string> = {
  pending: 'Order Placed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STEP_DESCRIPTIONS: Record<OrderStatus, string> = {
  pending: 'Your order has been placed',
  processing: 'Your order is being processed',
  shipped: 'Your order is on the way',
  delivered: 'Your order has been delivered',
  cancelled: 'Your order has been cancelled',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const email = searchParams.get('email');

    if (!orderId || !email) {
      return NextResponse.json(
        { error: 'Order ID and email are required' },
        { status: 400 }
      );
    }

    const order = await db.order.findFirst({
      where: {
        id: orderId,
        customerEmail: email,
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        trackingNumber: true,
        paymentMethod: true,
        totalAmount: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            name: true,
            quantity: true,
            price: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const steps = ORDER_STATUS_FLOW.map((key) => ({
      key,
      label: STEP_LABELS[key],
      description: STEP_DESCRIPTIONS[key],
    }));

    const currentStatus = order.status.toLowerCase();
    const currentIndex = steps.findIndex((s) => s.key === currentStatus);

    return NextResponse.json({
      order,
      steps,
      currentIndex: currentIndex >= 0 ? currentIndex : 0,
    });
  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
