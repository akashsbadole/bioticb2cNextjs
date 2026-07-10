import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;
    const body = await request.json();
    const { ids, action, status } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'ids array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!action || !['update-status', 'delete'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "update-status" or "delete"' },
        { status: 400 }
      );
    }

    let count = 0;

    if (action === 'update-status') {
      if (!status || typeof status !== 'string') {
        return NextResponse.json(
          { error: 'status is required for update-status action' },
          { status: 400 }
        );
      }

      const validStatuses = ['new', 'read', 'replied', 'closed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `status must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }

      const result = await db.enquiry.updateMany({
        where: { id: { in: ids } },
        data: { status },
      });
      count = result.count;
    } else if (action === 'delete') {
      const result = await db.enquiry.deleteMany({
        where: { id: { in: ids } },
      });
      count = result.count;
    }

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error('Bulk enquiry operation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
