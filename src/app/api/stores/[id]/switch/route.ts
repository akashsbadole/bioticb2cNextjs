import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/admin-auth';

// POST /api/stores/[id]/switch - Switch active store
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authRes = await requireAuth(request);
    if (!authRes.success) return authRes.response;
    const userId = authRes.payload.userId;

    const { id } = await params;

    // Verify user owns this store
    const store = await db.store.findFirst({
      where: { id, ownerUserId: userId, isActive: true },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found or inactive' }, { status: 404 });
    }

    // Update user's current store
    await db.user.update({
      where: { id: userId },
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
