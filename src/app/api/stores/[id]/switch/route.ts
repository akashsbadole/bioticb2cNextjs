import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth-edge';

// POST /api/stores/[id]/switch - Switch active store
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify user owns this store
    const store = await db.store.findFirst({
      where: { id, ownerUserId: payload.userId, isActive: true },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found or inactive' }, { status: 404 });
    }

    // Update user's current store
    await db.user.update({
      where: { id: payload.userId },
      data: { currentStoreId: id },
    });

    return NextResponse.json({
      store: {
        id: store.id,
        name: store.name,
        slug: store.slug,
      },
      message: 'Switched to store successfully',
    });
  } catch (error) {
    console.error('Store switch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
