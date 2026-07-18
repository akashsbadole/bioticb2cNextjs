import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

// GET /api/admin/sessions - list active sessions across all users
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const sessions = await db.session.findMany({
      where: { revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { user: { select: { id: true, email: true, name: true, role: true } } },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('List sessions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/sessions?id=<sessionId> - revoke a single session
// DELETE /api/admin/sessions?userId=<userId> - revoke all of a user's sessions
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id && !userId) {
      return NextResponse.json({ error: 'Provide ?id or ?userId' }, { status: 400 });
    }

    const result = await db.session.updateMany({
      where: {
        ...(id ? { id } : {}),
        ...(userId ? { userId } : {}),
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    return NextResponse.json({ success: true, revoked: result.count });
  } catch (error) {
    console.error('Revoke session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
