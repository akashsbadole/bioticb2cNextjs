import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;
    const { id } = await params;
    const body = await request.json();

    const existing = await db.redirect.findFirst({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Redirect not found' },
        { status: 404 }
      );
    }

    const redirect = await db.redirect.update({
      where: { id },
      data: {
        ...(body.from !== undefined && { from: body.from }),
        ...(body.to !== undefined && { to: body.to }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return NextResponse.json({ redirect });
  } catch (error) {
    console.error('Update redirect error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;
    const { id } = await params;

    const existing = await db.redirect.findFirst({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Redirect not found' },
        { status: 404 }
      );
    }

    await db.redirect.delete({ where: { id } });

    return NextResponse.json({
      message: 'Redirect deleted successfully',
    });
  } catch (error) {
    console.error('Delete redirect error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
