import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getStoreId } from '@/lib/store-db';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const rates = await db.shippingRate.findMany({
      where: { storeId: storeId || undefined },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ rates });
  } catch (error) {
    console.error('Admin shipping rates error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const body = await request.json();

    const rate = await db.shippingRate.create({
      data: {
        storeId: storeId || null,
        name: body.name,
        minSubtotal: parseFloat(body.minSubtotal || '0'),
        maxSubtotal: body.maxSubtotal != null ? parseFloat(body.maxSubtotal) : null,
        rate: parseFloat(body.rate || '0'),
        freeAbove: body.freeAbove != null ? parseFloat(body.freeAbove) : null,
        deliveryEta: body.deliveryEta || null,
        isActive: body.isActive !== false,
        sortOrder: parseInt(body.sortOrder || '0', 10),
      },
    });

    return NextResponse.json({ rate }, { status: 201 });
  } catch (error) {
    console.error('Admin create shipping rate error:', error);
    return NextResponse.json({ error: 'Failed to create shipping rate' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const rate = await db.shippingRate.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.minSubtotal !== undefined && { minSubtotal: parseFloat(data.minSubtotal) }),
        ...(data.maxSubtotal !== undefined && { maxSubtotal: data.maxSubtotal != null ? parseFloat(data.maxSubtotal) : null }),
        ...(data.rate !== undefined && { rate: parseFloat(data.rate) }),
        ...(data.freeAbove !== undefined && { freeAbove: data.freeAbove != null ? parseFloat(data.freeAbove) : null }),
        ...(data.deliveryEta !== undefined && { deliveryEta: data.deliveryEta }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.sortOrder !== undefined && { sortOrder: parseInt(data.sortOrder, 10) }),
      },
    });

    return NextResponse.json({ rate });
  } catch (error) {
    console.error('Admin update shipping rate error:', error);
    return NextResponse.json({ error: 'Failed to update shipping rate' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id query param required' }, { status: 400 });
    }

    await db.shippingRate.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete shipping rate error:', error);
    return NextResponse.json({ error: 'Failed to delete shipping rate' }, { status: 500 });
  }
}
