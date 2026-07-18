import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { requireAuth } from '@/lib/admin-auth';
import { sanitizeHtml } from '@/lib/sanitize';
import { reviewSchema } from '@/lib/validations';

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

    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { rating, comment } = parsed.data;

    const review = await db.review.create({
      data: {
        productId: id,
        storeId,
        userId: auth.payload.userId,
        rating,
        comment: comment ? sanitizeHtml(comment) : null,
        isActive: false
      }
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
