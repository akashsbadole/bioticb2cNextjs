import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth-edge';

function generateStoreSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 40);
}

// GET /api/stores - List user's stores
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stores = await db.store.findMany({
      where: { ownerUserId: payload.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        domain: true,
        plan: true,
        isActive: true,
        isPaused: true,
        createdAt: true,
        _count: {
          select: {
            Product: true,
            Category: true,
          },
        },
      },
    });

    return NextResponse.json({ stores });
  } catch (error) {
    console.error('Stores GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/stores - Create a new store
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, domain } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Store name must be at least 2 characters' }, { status: 400 });
    }

    // Generate slug from name
    let slug = generateStoreSlug(name);

    // Check if slug is available
    const existing = await db.store.findUnique({ where: { slug } });
    if (existing) {
      // Append a random suffix
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    // Check custom domain availability
    if (domain) {
      const existingDomain = await db.store.findUnique({ where: { domain } });
      if (existingDomain) {
        return NextResponse.json({ error: 'This domain is already taken' }, { status: 400 });
      }
    }

    // Create store with default settings
    const defaultSettings = JSON.stringify({
      currency: 'USD',
      tax_rate: '0',
      site_name: name,
    });

    const store = await db.store.create({
      data: {
        name: name.trim(),
        slug,
        domain: domain || null,
        ownerUserId: payload.userId,
        settings: defaultSettings,
        theme: JSON.stringify({
          primaryColor: '#10b981',
          accentColor: '#3b82f6',
        }),
      },
    });

    // Set as user's current store
    await db.user.update({
      where: { id: payload.userId },
      data: { currentStoreId: store.id },
    });

    return NextResponse.json({
      store,
      message: 'Store created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Stores POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
