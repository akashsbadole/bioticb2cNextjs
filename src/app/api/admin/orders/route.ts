import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getStoreId } from '@/lib/store-db';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);

    const orders = await db.order.findMany({
      where: storeId ? { storeId } : {},
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Admin get orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
