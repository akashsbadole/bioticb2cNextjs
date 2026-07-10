import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

const MAX_BULK_SIZE = 100;

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;
    const { ids, action } = await request.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0 || !action) {
      return NextResponse.json({ error: 'ids and action required' }, { status: 400 });
    }
    
    if (ids.length > MAX_BULK_SIZE) {
      return NextResponse.json({ error: `Maximum ${MAX_BULK_SIZE} items per bulk operation` }, { status: 400 });
    }
    switch (action) {
      case 'publish':
        await db.product.updateMany({ where: { id: { in: ids } }, data: { isActive: true } });
        break;
      case 'unpublish':
        await db.product.updateMany({ where: { id: { in: ids } }, data: { isActive: false } });
        break;
      case 'delete':
        await db.product.updateMany({
          where: { id: { in: ids } },
          data: { deletedAt: new Date() },
        });
        break;
      case 'restore':
        await db.product.updateMany({
          where: { id: { in: ids } },
          data: { deletedAt: null },
        });
        break;
      case 'permanent-delete':
        await db.product.deleteMany({ where: { id: { in: ids } } });
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bulk operation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
