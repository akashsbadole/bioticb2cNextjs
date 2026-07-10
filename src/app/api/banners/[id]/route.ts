import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizeImageUrl } from '@/lib/utils';
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

    const existing = await db.banner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      );
    }

    const banner = await db.banner.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.subtitle !== undefined && {
          subtitle: body.subtitle,
        }),
        ...(body.image !== undefined && { image: normalizeImageUrl(body.image) }),
        ...(body.link !== undefined && { link: body.link }),
        ...(body.linkText !== undefined && { linkText: body.linkText }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return NextResponse.json({ banner });
  } catch (error) {
    console.error('Update banner error:', error);
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

    const existing = await db.banner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      );
    }

    await db.banner.delete({ where: { id } });

    return NextResponse.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Delete banner error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
