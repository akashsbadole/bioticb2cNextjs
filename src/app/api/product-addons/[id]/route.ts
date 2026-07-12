import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;
    const body = await request.json();

    const existing = await db.productAddon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Add-on not found' }, { status: 404 });
    }

    const addon = await db.productAddon.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        description: body.description !== undefined ? body.description : existing.description,
        price: body.price !== undefined ? parseFloat(body.price) : existing.price,
        isActive: body.isActive !== undefined ? body.isActive : existing.isActive,
        sortOrder: body.sortOrder !== undefined ? body.sortOrder : existing.sortOrder,
      },
    });

    return NextResponse.json({ addon });
  } catch (error) {
    console.error('Update addon error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;

    const existing = await db.productAddon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Add-on not found' }, { status: 404 });
    }

    await db.productAddon.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete addon error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
