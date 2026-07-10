import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/admin-auth';

interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

// GET /api/account/addresses - Get user's saved addresses
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.success) return auth.response;

    const user = await db.user.findUnique({
      where: { id: auth.payload.userId },
      select: { addresses: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let addresses: Address[] = [];
    try {
      addresses = JSON.parse(user.addresses || '[]');
    } catch {
      addresses = [];
    }

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error('Addresses GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/account/addresses - Add a new address
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.success) return auth.response;

    const body = await request.json();
    const { label, name, phone, address, city, state, pincode, country, isDefault } = body;

    if (!label || !name || !address) {
      return NextResponse.json({ error: 'Label, name, and address are required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: auth.payload.userId },
      select: { addresses: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let addresses: Address[] = [];
    try {
      addresses = JSON.parse(user.addresses || '[]');
    } catch {
      addresses = [];
    }

    const newAddress: Address = {
      id: `addr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      label,
      name,
      phone: phone || '',
      address,
      city: city || '',
      state: state || '',
      pincode: pincode || '',
      country: country || 'India',
      isDefault: isDefault || addresses.length === 0,
    };

    // If new address is default, unset other defaults
    if (newAddress.isDefault) {
      addresses = addresses.map((a) => ({ ...a, isDefault: false }));
    }

    addresses.push(newAddress);

    await db.user.update({
      where: { id: auth.payload.userId },
      data: { addresses: JSON.stringify(addresses) },
    });

    return NextResponse.json({ address: newAddress, addresses }, { status: 201 });
  } catch (error) {
    console.error('Address POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/account/addresses - Update addresses (bulk replace)
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.success) return auth.response;

    const body = await request.json();
    const { addresses } = body;

    if (!Array.isArray(addresses)) {
      return NextResponse.json({ error: 'Addresses must be an array' }, { status: 400 });
    }

    await db.user.update({
      where: { id: auth.payload.userId },
      data: { addresses: JSON.stringify(addresses) },
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error('Addresses PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
