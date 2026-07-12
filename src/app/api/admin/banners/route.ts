import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getStoreId } from '@/lib/store-db';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const banners = await db.banner.findMany({
      where: storeId ? { storeId } : {},
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ banners });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
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

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const banner = await db.banner.create({
      data: {
        storeId,
        title: title.trim(),
        subtitle: subtitle || null,
        image: image || null,
        link: link || null,
        linkText: linkText || null,
        isActive: isActive !== false,
        sortOrder: Number(sortOrder) || 0,
      },
    });

    return NextResponse.json({ banner });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}
