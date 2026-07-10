import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getStoreId } from '@/lib/store-db';

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

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Admin update order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
