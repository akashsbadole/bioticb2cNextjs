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

    if (!['publish', 'unpublish', 'delete', 'restore', 'permanent-delete'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be publish, unpublish, delete, restore, or permanent-delete' },
        { status: 400 }
      );
    }

    if (action === 'delete') {
      const result = await db.blogPost.updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() },
      });
      return NextResponse.json({
        message: `${result.count} blog post(s) moved to trash`,
        count: result.count,
      });
    }

    if (action === 'publish') {
      const result = await db.blogPost.updateMany({
        where: {
          id: { in: ids },
          publishedAt: null,
        },
        data: {
          isPublished: true,
          publishedAt: new Date(),
        },
      });
      // Also update posts that already have publishedAt
      const result2 = await db.blogPost.updateMany({
        where: {
          id: { in: ids },
          publishedAt: { not: null },
        },
        data: {
          isPublished: true,
        },
      });
      const total = result.count + result2.count;
      return NextResponse.json({
        message: `${total} blog post(s) published`,
        count: total,
      });
    }

    if (action === 'unpublish') {
      const result = await db.blogPost.updateMany({
        where: { id: { in: ids } },
        data: {
          isPublished: false,
          publishedAt: null,
        },
      });
      return NextResponse.json({
        message: `${result.count} blog post(s) unpublished`,
        count: result.count,
      });
    }

    if (action === 'restore') {
      const result = await db.blogPost.updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: null },
      });
      return NextResponse.json({
        message: `${result.count} blog post(s) restored`,
        count: result.count,
      });
    }

    if (action === 'permanent-delete') {
      const result = await db.blogPost.deleteMany({
        where: { id: { in: ids } },
      });
      return NextResponse.json({
        message: `${result.count} blog post(s) permanently deleted`,
        count: result.count,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Bulk blog operation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
