import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth-edge';
import { normalizeImageUrl } from '@/lib/utils';

// GET /api/stores/[id] - Get store details
export async function GET(
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

    const store = await db.store.findFirst({
      where: { id, ownerUserId: payload.userId },
      include: {
        _count: {
          select: {
            Product: true,
            Category: true,
          },
        },
      },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    return NextResponse.json({ store });
  } catch (error) {
    console.error('Store GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/stores/[id] - Update store
export async function PUT(
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
    const body = await request.json();

    // Verify ownership
    const existing = await db.store.findFirst({
      where: { id, ownerUserId: payload.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.domain !== undefined) {
      // Check domain uniqueness
      if (body.domain) {
        const domainTaken = await db.store.findFirst({
          where: { domain: body.domain, id: { not: id } },
        });
        if (domainTaken) {
          return NextResponse.json({ error: 'Domain already taken' }, { status: 400 });
        }
      }
      updateData.domain = body.domain || null;
    }
    if (body.logo !== undefined) updateData.logo = normalizeImageUrl(body.logo);
    if (body.favicon !== undefined) updateData.favicon = normalizeImageUrl(body.favicon);
    if (body.description !== undefined) updateData.description = body.description;
    if (body.theme !== undefined) updateData.theme = JSON.stringify(body.theme);
    if (body.settings !== undefined) updateData.settings = JSON.stringify(body.settings);
    if (body.isPaused !== undefined) updateData.isPaused = body.isPaused;

    const store = await db.store.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      store,
      message: 'Store updated successfully',
    });
  } catch (error) {
    console.error('Store PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/stores/[id] - Delete store (soft: set isActive = false)
export async function DELETE(
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

    const existing = await db.store.findFirst({
      where: { id, ownerUserId: payload.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Soft delete: deactivate the store
    await db.store.update({
      where: { id },
      data: { isActive: false },
    });

    // Clear user's current store if it was this one
    const user = await db.user.findUnique({ where: { id: payload.userId } });
    if (user?.currentStoreId === id) {
      await db.user.update({
        where: { id: payload.userId },
        data: { currentStoreId: null },
      });
    }

    return NextResponse.json({ message: 'Store deactivated successfully' });
  } catch (error) {
    console.error('Store DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
