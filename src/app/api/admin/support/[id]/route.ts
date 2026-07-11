import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getStoreId } from '@/lib/store-db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const { id } = await params;

    const ticket = await db.supportTicket.findFirst({
      where: { id, ...(storeId ? { storeId } : {}) },
      include: {
        User: { select: { id: true, name: true, email: true } },
        Order: { select: { id: true, orderNumber: true, totalAmount: true, status: true } },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error('Admin get support ticket error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    const { status, priority, adminReply } = body;

    const ticket = await db.supportTicket.findFirst({
      where: { id, ...(storeId ? { storeId } : {}) },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (adminReply !== undefined) {
      updateData.adminReply = adminReply;
      updateData.repliedAt = adminReply ? new Date() : null;
    }

    const updated = await db.supportTicket.update({
      where: { id },
      data: updateData,
      include: {
        User: { select: { id: true, name: true, email: true } },
        Order: { select: { id: true, orderNumber: true, totalAmount: true } },
      },
    });

    return NextResponse.json({ ticket: updated });
  } catch (error) {
    console.error('Admin update support ticket error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
