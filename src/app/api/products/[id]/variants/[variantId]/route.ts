import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const { id, variantId } = await params;
    const body = await request.json();

    const existing = await db.productVariant.findFirst({
      where: { id: variantId, productId: id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: 'Variant not found' },
        { status: 404 }
      );
    }

    const variant = await db.productVariant.update({
      where: { id: variantId },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.sku !== undefined && { sku: body.sku || null }),
        ...(body.price !== undefined && {
          price: body.price !== null ? parseFloat(body.price) : null,
        }),
        ...(body.comparePrice !== undefined && {
          comparePrice: body.comparePrice ? parseFloat(body.comparePrice) : null,
        }),
        ...(body.wholesalePrice !== undefined && {
          wholesalePrice: body.wholesalePrice ? parseFloat(body.wholesalePrice) : null,
        }),
        ...(body.stock !== undefined && { stock: body.stock }),
        ...(body.images !== undefined && {
          images: typeof body.images === 'string' ? body.images : JSON.stringify(body.images || []),
        }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return NextResponse.json({ variant });
  } catch (error) {
    console.error('Update variant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const { id, variantId } = await params;

    const existing = await db.productVariant.findFirst({
      where: { id: variantId, productId: id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: 'Variant not found' },
        { status: 404 }
      );
    }

    await db.productVariant.delete({ where: { id: variantId } });

    return NextResponse.json({ message: 'Variant deleted successfully' });
  } catch (error) {
    console.error('Delete variant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
