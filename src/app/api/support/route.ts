import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/admin-auth';
import { getStoreId } from '@/lib/store-db';
import { z } from 'zod';

const ticketSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(255),
  message: z.string().min(1, 'Message is required'),
  orderId: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const tickets = await db.supportTicket.findMany({
      where: { userId: auth.payload.userId, ...(storeId ? { storeId } : {}) },
      include: {
        Order: { select: { id: true, orderNumber: true, totalAmount: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('Get support tickets error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const body = await request.json();
    const result = ticketSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { subject, message, orderId, priority } = result.data;

    const ticket = await db.supportTicket.create({
      data: {
        subject,
        message,
        orderId: orderId || null,
        priority,
        userId: auth.payload.userId,
        storeId: storeId || null,
      },
      include: {
        Order: { select: { id: true, orderNumber: true, totalAmount: true } },
      },
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    console.error('Create support ticket error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
