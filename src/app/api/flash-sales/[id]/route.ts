import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;
    const body = await request.json();

    const existing = await db.flashSale.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Flash sale not found' }, { status: 404 });
    }

    // Delete existing product associations and recreate
    if (body.products) {
      await db.flashSaleProduct.deleteMany({ where: { flashSaleId: id } });
    }

    const flashSale = await db.flashSale.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        description: body.description !== undefined ? body.description : existing.description,
        startDate: body.startDate ? new Date(body.startDate) : existing.startDate,
        endDate: body.endDate ? new Date(body.endDate) : existing.endDate,
        isActive: body.isActive !== undefined ? body.isActive : existing.isActive,
        ...(body.products ? {
          products: {
            create: body.products.map((p: { productId: string; discountType: string; discountValue: number }) => ({
              productId: p.productId,
              discountType: p.discountType || 'percentage',
              discountValue: p.discountValue,
            })),
          },
        } : {}),
      },
      include: {
        products: {
          include: {
            Product: { select: { id: true, name: true, slug: true, price: true, images: true } },
          },
        },
      },
    });

    return NextResponse.json({ flashSale });
  } catch (error) {
    console.error('Update flash sale error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;

    const existing = await db.flashSale.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Flash sale not found' }, { status: 404 });
    }

    await db.flashSale.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete flash sale error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
