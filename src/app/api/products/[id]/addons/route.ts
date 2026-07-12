import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const addons = await db.productAddon.findMany({
      where: { productId: id },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ addons });
  } catch (error) {
    console.error('Get addons error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;
    const body = await request.json();

    if (!body.name || body.price === undefined) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    const addon = await db.productAddon.create({
      data: {
        productId: id,
        name: body.name,
        description: body.description || null,
        price: parseFloat(body.price),
        isActive: body.isActive !== false,
        sortOrder: body.sortOrder ?? 0,
      },
    });

    return NextResponse.json({ addon }, { status: 201 });
  } catch (error) {
    console.error('Create addon error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
