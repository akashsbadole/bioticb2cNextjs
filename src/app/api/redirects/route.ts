import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;
    const storeId = getStoreId(request);
    const redirects = await db.redirect.findMany({
      where: storeId ? { storeId } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ redirects });
  } catch (error) {
    console.error('Get redirects error:', error);
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
    const { from, to, type, isActive } = body;

    if (!from || !to) {
      return NextResponse.json(
        { error: 'From and to paths are required' },
        { status: 400 }
      );
    }

    const storeId = getStoreId(request);

    // Check uniqueness per store
    const existing = await db.redirect.findFirst({
      where: { from, ...(storeId ? { storeId } : {}) }
    });
    if (existing) {
      return NextResponse.json({ error: 'Redirect already exists for this path' }, { status: 409 });
    }

    const redirect = await db.redirect.create({
      data: {
        from,
        to,
        type: type || '301',
        isActive: isActive ?? true,
        ...(storeId ? { storeId } : {}),
      },
    });

    return NextResponse.json({ redirect }, { status: 201 });
  } catch (error) {
    console.error('Create redirect error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
