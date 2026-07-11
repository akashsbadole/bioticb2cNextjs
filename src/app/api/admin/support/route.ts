import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getStoreId } from '@/lib/store-db';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (storeId) where.storeId = storeId;

    const skip = (Math.max(1, page) - 1) * Math.min(Math.max(1, limit), 100);

    const [tickets, total] = await Promise.all([
      db.supportTicket.findMany({
        where,
        include: {
          User: { select: { id: true, name: true, email: true } },
          Order: { select: { id: true, orderNumber: true, totalAmount: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Math.min(Math.max(1, limit), 100),
      }),
      db.supportTicket.count({ where }),
    ]);

    return NextResponse.json({
      tickets,
      pagination: {
        page: Math.max(1, page),
        limit: Math.min(Math.max(1, limit), 100),
        total,
        totalPages: Math.ceil(total / Math.min(Math.max(1, limit), 100)),
      },
    });
  } catch (error) {
    console.error('Admin get support tickets error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
