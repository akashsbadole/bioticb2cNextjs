import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { validateBody } from '@/lib/validate';
import { redirectSchema } from '@/lib/validations';

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

    const parsed = await validateBody(request, redirectSchema);
    if (parsed.response) return parsed.response;

    const { from, to, type, isActive } = parsed.data;
    const storeId = getStoreId(request);

    const existing = await db.redirect.findFirst({
      where: { from, ...(storeId ? { storeId } : {}) }
    });
    if (existing) {
      return NextResponse.json({ error: 'Redirect already exists for this path' }, { status: 409 });
    }

    const redirect = await db.redirect.create({
      data: { from, to, type, isActive, ...(storeId ? { storeId } : {}) },
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
