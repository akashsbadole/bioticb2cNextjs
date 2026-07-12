import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';

const STOCK_RATE_LIMIT = { maxRequests: 3, windowMs: 60 * 60 * 1000, prefix: 'stock-notify' };

const schema = z.object({
  email: z.string().email(),
  productId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const rateLimitResponse = await checkRateLimit(request, STOCK_RATE_LIMIT);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Valid email and product ID are required' }, { status: 400 });
    }

    const { email, productId } = parsed.data;

    const product = await db.product.findUnique({ where: { id: productId }, select: { id: true, stock: true } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    if (product.stock > 0) {
      return NextResponse.json({ error: 'Product is currently in stock' }, { status: 400 });
    }

    const existing = await db.stockNotification.findUnique({
      where: { email_productId: { email, productId } },
    });
    if (existing) {
      return NextResponse.json({ message: 'You are already subscribed for this product' });
    }

    await db.stockNotification.create({
      data: { email, productId },
    });

    return NextResponse.json({ success: true, message: "We'll notify you when it's back in stock" }, { status: 201 });
  } catch (error) {
    console.error('Stock notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
