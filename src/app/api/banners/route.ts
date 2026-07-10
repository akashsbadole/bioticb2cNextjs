import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { normalizeImageUrl } from '@/lib/utils';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const storeId = getStoreId(request);
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all');
    const where: Record<string, unknown> = {};
    if (!all) {
      where.isActive = true;
    }

    const banners = await db.banner.findMany({
      where: { ...where, ...(storeId ? { storeId } : {}) },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ banners });
  } catch (error) {
    console.error('Get banners error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;
    const body = await request.json();
    const { title, subtitle, image, link, linkText, sortOrder, isActive } =
      body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const storeId = getStoreId(request);
    const banner = await db.banner.create({
      data: {
        title,
        subtitle: subtitle || null,
        image: normalizeImageUrl(image),
        link: link || null,
        linkText: linkText || null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
        ...(storeId ? { storeId } : {}),
      },
    });

    return NextResponse.json({ banner }, { status: 201 });
  } catch (error) {
    console.error('Create banner error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
