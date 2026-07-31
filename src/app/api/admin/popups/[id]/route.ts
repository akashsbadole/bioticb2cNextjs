import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getStoreId } from '@/lib/store-db';
import { CACHE_TAGS, invalidateCache } from '@/lib/cache';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const { id } = await params;

    const existing = await db.popup.findFirst({
      where: { id, ...(storeId ? { storeId } : {}) },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Popup not found' }, { status: 404 });
    }

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

    const popup = await db.popup.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : existing.title,
        subtitle: subtitle !== undefined ? subtitle : existing.subtitle,
        content: content !== undefined ? content : existing.content,
        image: image !== undefined ? image : existing.image,
        ctaText: ctaText !== undefined ? ctaText : existing.ctaText,
        ctaLink: ctaLink !== undefined ? ctaLink : existing.ctaLink,
        triggerType: triggerType || existing.triggerType,
        delayMs: delayMs !== undefined ? Number(delayMs) : existing.delayMs,
        displayFrequency: displayFrequency || existing.displayFrequency,
        position: position || existing.position,
        backgroundColor: backgroundColor !== undefined ? backgroundColor : existing.backgroundColor,
        isActive: isActive !== undefined ? isActive : existing.isActive,
        startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : existing.startDate,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : existing.endDate,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : existing.sortOrder,
      },
    });

    invalidateCache(CACHE_TAGS.popups);

    return NextResponse.json({ popup });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update popup' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const { id } = await params;

    const existing = await db.popup.findFirst({
      where: { id, ...(storeId ? { storeId } : {}) },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Popup not found' }, { status: 404 });
    }

    await db.popup.delete({ where: { id } });

    invalidateCache(CACHE_TAGS.popups);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete popup' }, { status: 500 });
  }
}
