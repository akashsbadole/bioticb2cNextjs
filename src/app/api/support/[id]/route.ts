import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/admin-auth';
import { getStoreId } from '@/lib/store-db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const { id } = await params;

    const ticket = await db.supportTicket.findFirst({
      where: { id, userId: auth.payload.userId, ...(storeId ? { storeId } : {}) },
      include: {
        Order: { select: { id: true, orderNumber: true, totalAmount: true, status: true } },
        User: { select: { id: true, name: true, email: true } },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error('Get support ticket error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
