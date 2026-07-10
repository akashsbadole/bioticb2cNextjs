import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;
    const body = await request.json();
    const { ids, action } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'ids array is required' },
        { status: 400 }
      );
    }

    if (action === 'delete') {
      const result = await db.redirect.deleteMany({
        where: { id: { in: ids } },
      });
      return NextResponse.json({
        message: `${result.count} redirect(s) deleted`,
        count: result.count,
      });
    }

    return NextResponse.json(
      { error: 'action must be delete' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Bulk redirect operation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
