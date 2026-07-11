import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

    const steps = [
      { key: 'pending', label: 'Order Placed', description: 'Your order has been placed' },
      { key: 'processing', label: 'Processing', description: 'Your order is being processed' },
      { key: 'shipped', label: 'Shipped', description: 'Your order is on the way' },
      { key: 'delivered', label: 'Delivered', description: 'Your order has been delivered' },
    ];

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
