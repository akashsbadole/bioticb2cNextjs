import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { requireAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const wishlist = await db.wishlist.findMany({
      where: { userId: auth.payload.userId, storeId },
      include: {
        Product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            shortDescription: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ items: wishlist });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const body = await request.json();
    const { productId } = body;

    if (!productId) return NextResponse.json({ error: 'Product ID required' }, { status: 400 });

    const item = await db.wishlist.upsert({
      where: {
        userId_productId: {
          userId: auth.payload.userId,
          productId,
        }
      },
      update: {},
      create: {
        userId: auth.payload.userId,
        productId,
        storeId,
      }
    });

    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.success) return auth.response;

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) return NextResponse.json({ error: 'Product ID required' }, { status: 400 });

    await db.wishlist.delete({
      where: {
        userId_productId: {
          userId: auth.payload.userId,
          productId,
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
