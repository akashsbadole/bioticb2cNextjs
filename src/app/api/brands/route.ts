import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { validateBody } from '@/lib/validate';
import { brandSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const storeId = getStoreId(request);
    const brands = await db.brand.findMany({
      where: storeId ? { storeId } : {},
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ brands });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const parsed = await validateBody(request, brandSchema);
    if (parsed.response) return parsed.response;

    const { name, slug, description, image } = parsed.data;

    const brand = await db.brand.create({
      data: {
        storeId,
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        image,
      }
    });

    return NextResponse.json({ brand });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
  }
}
