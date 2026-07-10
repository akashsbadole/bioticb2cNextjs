import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/stores/resolve?slug=xxx or ?domain=xxx
// Internal endpoint for store resolution (called by middleware)
export async function GET(request: NextRequest) {
  try {
    // Only allow internal requests
    const internalHeader = request.headers.get('x-internal-request');
    if (internalHeader !== 'true') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const domain = searchParams.get('domain');

    if (!slug && !domain) {
      return NextResponse.json({ error: 'slug or domain required' }, { status: 400 });
    }

    let store;
    if (slug) {
      store = await db.store.findUnique({
        where: { slug, isActive: true, isPaused: false },
        select: { id: true, name: true, slug: true, settings: true, theme: true },
      });
    } else if (domain) {
      store = await db.store.findUnique({
        where: { domain: domain!, isActive: true, isPaused: false },
        select: { id: true, name: true, slug: true, settings: true, theme: true },
      });
    }

    if (!store) {
      return NextResponse.json({ storeId: null }, { status: 200 });
    }

    return NextResponse.json({ storeId: store.id, store });
  } catch (error) {
    console.error('Store resolve error:', error);
    return NextResponse.json({ storeId: null }, { status: 200 });
  }
}
