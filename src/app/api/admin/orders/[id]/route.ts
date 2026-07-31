import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getStoreId } from '@/lib/store-db';
import { sendTrackingUpdate } from '@/lib/email';
import { sendWhatsApp } from '@/lib/sms';
import { ensurePluginsLoaded, hooks } from '@/lib/plugins';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);

    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus, returnStatus, refundAmount, trackingNumber } = body;

    const order = await db.order.update({
      where: { id, ...(storeId ? { storeId } : {}) },
      data: {
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
        returnStatus: returnStatus || undefined,
        refundAmount: refundAmount !== undefined ? parseFloat(refundAmount) : undefined,
        trackingNumber: trackingNumber !== undefined ? trackingNumber : undefined,
      },
    });

    // Send tracking update email + WhatsApp when tracking is newly set
    if (trackingNumber) {
      if (order.customerEmail) {
        sendTrackingUpdate({
          id: order.id,
          customerName: order.customerName || 'Customer',
          customerEmail: order.customerEmail,
          trackingNumber: trackingNumber,
        }).catch(() => {});
      }
      if (order.customerPhone) {
        sendWhatsApp(
          order.customerPhone,
          `Your order ${order.orderNumber || order.id.slice(0, 8)} has been shipped! Tracking: ${trackingNumber}`,
        ).catch(() => {});
      }
    }

    // Plugin hook point: extensions can react to order status/payment changes.
    await ensurePluginsLoaded();
    hooks.doAction("order:status-updated", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber,
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Admin update order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
