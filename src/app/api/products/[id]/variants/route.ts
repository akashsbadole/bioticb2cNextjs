import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const variants = await db.productVariant.findMany({
      where: { productId: id },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ variants });
  } catch (error) {
    console.error('Get variants error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, sku, price, comparePrice, wholesalePrice, stock, images, sortOrder, isActive } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Variant name is required' },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await db.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const variant = await db.productVariant.create({
      data: {
        productId: id,
        name,
        sku: sku || null,
        price: price !== undefined ? parseFloat(price) : null,
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        wholesalePrice: wholesalePrice ? parseFloat(wholesalePrice) : null,
        stock: stock ?? 0,
        images: typeof images === 'string' ? images : JSON.stringify(images || []),
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ variant }, { status: 201 });
  } catch (error) {
    console.error('Create variant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
