import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    const storeId = getStoreId(request);

    const where: Record<string, unknown> = {};
    if (storeId) where.storeId = storeId;

    if (active === 'true') {
      const now = new Date();
      where.startDate = { lte: now };
      where.endDate = { gte: now };
      where.isActive = true;
    }

    const flashSales = await db.flashSale.findMany({
      where,
      include: {
        products: {
          include: {
            Product: {
              select: { id: true, name: true, slug: true, price: true, images: true, stock: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ flashSales });
  } catch (error) {
    console.error('Get flash sales error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const body = await request.json();
    const storeId = getStoreId(request);

    if (!body.name || !body.startDate || !body.endDate) {
      return NextResponse.json({ error: 'Name, startDate, and endDate are required' }, { status: 400 });
    }

    const flashSale = await db.flashSale.create({
      data: {
        name: body.name,
        description: body.description || null,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        isActive: body.isActive !== false,
        ...(storeId ? { storeId } : {}),
        products: {
          create: (body.products || []).map((p: { productId: string; discountType: string; discountValue: number }) => ({
            productId: p.productId,
            discountType: p.discountType || 'percentage',
            discountValue: p.discountValue,
          })),
        },
      },
      include: {
        products: {
          include: {
            Product: { select: { id: true, name: true, slug: true, price: true, images: true } },
          },
        },
      },
    });

    return NextResponse.json({ flashSale }, { status: 201 });
  } catch (error) {
    console.error('Create flash sale error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
