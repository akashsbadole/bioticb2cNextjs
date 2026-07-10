import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { requireAuth } from '@/lib/admin-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviews = await db.review.findMany({
      where: { productId: id, isActive: true },
      include: {
        User: {
          select: { name: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;
    const storeId = getStoreId(request);
    const body = await request.json();
    const { rating, comment } = body;

    if (!rating) {
        return NextResponse.json({ error: 'Missing rating' }, { status: 400 });
    }

    const review = await db.review.create({
      data: {
        productId: id,
        storeId,
        userId: auth.payload.userId,
        rating: Number(rating),
        comment,
        isActive: false // Default to false for moderation
      }
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
