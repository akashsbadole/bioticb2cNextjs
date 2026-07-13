import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/admin-auth';

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.success) return auth.response;
    const userId = auth.payload.userId;

    const result = await db.notification.updateMany({
      where: {
        OR: [{ userId }, { userId: null }],
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json({ updatedCount: result.count });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
