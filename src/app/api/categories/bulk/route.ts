import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;
    const { ids, action } = await request.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0 || !action) {
      return NextResponse.json({ error: 'ids and action required' }, { status: 400 });
    }

    switch (action) {
      case 'activate':
        await db.category.updateMany({ where: { id: { in: ids } }, data: { isActive: true } });
        break;
      case 'deactivate':
        await db.category.updateMany({ where: { id: { in: ids } }, data: { isActive: false } });
        break;
      case 'delete':
        await db.category.deleteMany({ where: { id: { in: ids } } });
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const count = ids.length;
    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error('Bulk category operation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
