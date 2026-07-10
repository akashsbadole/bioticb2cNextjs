import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { normalizeImageUrl } from '@/lib/utils';

// GET /api/store/settings - Get store-specific settings
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);

    if (!storeId) {
      // No store context — return global settings
      const settings = await db.siteSetting.findMany({
        where: { storeId: null },
      });
      const result: Record<string, string> = {};
      for (const s of settings) result[s.key] = s.value;
      return NextResponse.json({ settings: result });
    }

    // Get store-specific settings + global fallback
    const allSettings = await db.siteSetting.findMany({
      where: { OR: [{ storeId }, { storeId: null }] },
    });

    const result: Record<string, string> = {};
    // Apply global first
    for (const s of allSettings) {
      if (s.storeId === null) result[s.key] = s.value;
    }
    // Override with store-specific
    for (const s of allSettings) {
      if (s.storeId === storeId) result[s.key] = s.value;
    }

    return NextResponse.json({ settings: result, storeId });
  } catch (error) {
    console.error('Store settings GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/store/settings - Update store settings
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Settings object required' }, { status: 400 });
    }

    // Upsert each setting
    for (const [key, rawValue] of Object.entries(settings)) {
      if (typeof rawValue !== 'string') continue;
      const value = /^(site_)?(logo|icon|favicon|image)/i.test(key) ? (normalizeImageUrl(rawValue) ?? '') : rawValue;

      if (storeId) {
        await db.siteSetting.upsert({
          where: { storeId_key: { storeId, key } },
          update: { value },
          create: { storeId, key, value },
        });
      } else {
        // Global setting update (admin only)
        const existing = await db.siteSetting.findFirst({
          where: { storeId: null, key },
        });

        if (existing) {
          await db.siteSetting.update({
            where: { id: existing.id },
            data: { value },
          });
        } else {
          await db.siteSetting.create({
            data: { storeId: null, key, value },
          });
        }
      }
    }

    revalidatePath('/', 'layout');
    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Store settings PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
