import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json({ found: false }, { status: 200 });
    }

    const host = request.headers.get('host') || '';
    const storeSlug = host.split('.')[0];
    const store = await db.store.findFirst({
      where: {
        OR: [{ slug: storeSlug }, { domain: host }],
      },
    });

    const redirect = await db.redirect.findFirst({
      where: {
        from: path,
        storeId: store?.id || null
      },
      select: { from: true, to: true, type: true, isActive: true },
    });

    if (redirect && redirect.isActive) {
      return NextResponse.json({
        found: true,
        from: redirect.from,
        to: redirect.to,
        type: redirect.type,
      });
    }

    return NextResponse.json({ found: false }, { status: 200 });
  } catch (error) {
    console.error('Redirect check error:', error);
    // Return 500 so callers know the check failed, not just "no redirect found"
    return NextResponse.json(
      { found: false, error: 'Redirect check failed' },
      { status: 500 }
    );
  }
}
