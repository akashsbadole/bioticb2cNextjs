import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';

export async function GET(request: NextRequest) {
  try {
    const storeId = getStoreId(request);
    const now = new Date();

    const popups = await db.popup.findMany({
      where: {
        isActive: true,
        ...(storeId ? { storeId } : {}),
        AND: [
          {
            OR: [{ startDate: null }, { startDate: { lte: now } }],
          },
          {
            OR: [{ endDate: null }, { endDate: { gte: now } }],
          },
        ],
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ popups });
  } catch (error) {
    return NextResponse.json({ popups: [] }, { status: 200 });
  }
}
