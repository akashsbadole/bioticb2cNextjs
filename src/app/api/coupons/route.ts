import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';

export async function GET(request: NextRequest) {
  try {
    const storeId = getStoreId(request);
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const coupon = await db.coupon.findFirst({
      where: {
        storeId,
        code: code.toUpperCase(),
        isActive: true,
      }
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
    }

    // Check dates
    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) {
        return NextResponse.json({ error: 'Coupon not yet active' }, { status: 400 });
    }
    if (coupon.endDate && now > coupon.endDate) {
        return NextResponse.json({ error: 'Coupon expired' }, { status: 400 });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });
    }

    return NextResponse.json({ coupon });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
