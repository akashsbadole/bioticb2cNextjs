import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;
    const body = await request.json();
    const { ids, action } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs array is required' }, { status: 400 });
    }

    if (!['delete', 'activate', 'deactivate'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Use: delete, activate, deactivate' }, { status: 400 });
    }

    const userId = request.headers.get('x-user-id');

    switch (action) {
      case 'delete': {
        // Prevent self-deletion in bulk
        const safeIds = ids.filter((id: string) => id !== userId);
        const result = await db.user.deleteMany({
          where: { id: { in: safeIds } },
        });
        try {
          await createNotification({
            title: 'Bulk User Delete',
            message: `Deleted ${result.count} user(s)`,
            type: 'warning',
            link: 'users',
          });
        } catch { /* ignore */ }
        return NextResponse.json({ message: `Deleted ${result.count} user(s)` });
      }
      case 'activate': {
        const result = await db.user.updateMany({
          where: { id: { in: ids } },
          data: { isActive: true },
        });
        try {
          await createNotification({
            title: 'Bulk User Activate',
            message: `Activated ${result.count} user(s)`,
            type: 'success',
            link: 'users',
          });
        } catch { /* ignore */ }
        return NextResponse.json({ message: `Activated ${result.count} user(s)` });
      }
      case 'deactivate': {
        // Prevent self-deactivation
        const safeIds = ids.filter((id: string) => id !== userId);
        const result = await db.user.updateMany({
          where: { id: { in: safeIds } },
          data: { isActive: false },
        });
        try {
          await createNotification({
            title: 'Bulk User Deactivate',
            message: `Deactivated ${result.count} user(s)`,
            type: 'warning',
            link: 'users',
          });
        } catch { /* ignore */ }
        return NextResponse.json({ message: `Deactivated ${result.count} user(s)` });
      }
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Bulk users action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
