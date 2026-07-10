import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getStoreId } from '@/lib/store-db';
import { sendEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);

    // Abandoned carts: Carts older than 2 hours that haven't been converted to orders
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

    const carts = await db.cart.findMany({
      where: {
        storeId,
        updatedAt: { lte: twoHoursAgo },
        items: { some: {} } // Has at least one item
      },
      include: {
        User: { select: { name: true, email: true } },
        items: { include: { Product: { select: { name: true, price: true } } } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ carts });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
    try {
        const auth = await requireAdminAuth(request);
        if (!auth.success) return auth.response;

        const body = await request.json();
        const { email, userName, cartId } = body;

        if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

        const siteName = (await db.siteSetting.findFirst({ where: { key: 'site_name' } }))?.value || 'Our Store';
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

        await sendEmail(
            email,
            `Did you forget something at ${siteName}?`,
            `
            <h2>Hi ${userName || 'there'},</h2>
            <p>We noticed you left some items in your cart. They are waiting for you!</p>
            <p><a href="${siteUrl}/cart" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; rounded: 5px;">Return to Cart</a></p>
            <p>If you have any questions, feel free to reply to this email.</p>
            `
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to send reminder' }, { status: 500 });
    }
}
