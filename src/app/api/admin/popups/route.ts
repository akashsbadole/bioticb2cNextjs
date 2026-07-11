import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getStoreId } from '@/lib/store-db';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const popups = await db.popup.findMany({
      where: storeId ? { storeId } : {},
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ popups });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const body = await request.json();
    const {
      title,
      subtitle,
      content,
      image,
      ctaText,
      ctaLink,
      triggerType,
      delayMs,
      displayFrequency,
      position,
      backgroundColor,
      isActive,
      startDate,
      endDate,
      sortOrder,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const popup = await db.popup.create({
      data: {
        storeId,
        title: title.trim(),
        subtitle: subtitle || null,
        content: content || null,
        image: image || null,
        ctaText: ctaText || null,
        ctaLink: ctaLink || null,
        triggerType: triggerType || 'delay',
        delayMs: Number(delayMs) || 3000,
        displayFrequency: displayFrequency || 'once',
        position: position || 'center',
        backgroundColor: backgroundColor || null,
        isActive: isActive !== false,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        sortOrder: Number(sortOrder) || 0,
      },
    });

    return NextResponse.json({ popup });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create popup' }, { status: 500 });
  }
}
