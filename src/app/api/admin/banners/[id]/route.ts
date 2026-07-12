import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getStoreId } from '@/lib/store-db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const { id } = await params;

    const existing = await db.banner.findFirst({
      where: { id, ...(storeId ? { storeId } : {}) },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      subtitle,
      image,
      link,
      linkText,
      isActive,
      sortOrder,
    } = body;

    const banner = await db.banner.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : existing.title,
        subtitle: subtitle !== undefined ? subtitle : existing.subtitle,
        image: image !== undefined ? image : existing.image,
        link: link !== undefined ? link : existing.link,
        linkText: linkText !== undefined ? linkText : existing.linkText,
        isActive: isActive !== undefined ? isActive : existing.isActive,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : existing.sortOrder,
      },
    });

    return NextResponse.json({ banner });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const { id } = await params;

    const existing = await db.banner.findFirst({
      where: { id, ...(storeId ? { storeId } : {}) },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    await db.banner.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}
