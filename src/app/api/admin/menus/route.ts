import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { z } from 'zod';

const menuSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  location: z.string().min(1),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  items: z.array(z.object({
    id: z.string().optional(),
    parentId: z.string().nullable().optional(),
    label: z.string().min(1),
    url: z.string().optional().nullable(),
    page: z.string().optional().nullable(),
    slug: z.string().optional().nullable(),
    sortOrder: z.number().optional(),
    isActive: z.boolean().optional(),
    openInNewTab: z.boolean().optional(),
  })).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all');
    const location = searchParams.get('location');

    const where: Record<string, unknown> = {};

    if (!all) {
      where.isActive = true;
    }

    if (location) {
      where.location = location;
    }

    if (storeId) {
      where.storeId = storeId;
    }

    const menus = await db.menu.findMany({
      where,
      include: {
        items: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ menus });
  } catch (error) {
    console.error('Get menus error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const body = await request.json();
    const result = menuSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const validatedData = result.data;

    const storeId = getStoreId(request);

    // Check slug uniqueness per store
    const existingSlug = await db.menu.findFirst({
      where: { slug: validatedData.slug, ...(storeId ? { storeId } : {}) },
    });
    if (existingSlug) {
      return NextResponse.json({ error: 'Slug already in use' }, { status: 409 });
    }

    const { items, ...menuData } = validatedData;

    const menu = await db.menu.create({
      data: {
        ...menuData,
        isActive: validatedData.isActive ?? true,
        ...(storeId ? { storeId } : {}),
      },
    });

    // Create items sequentially to handle parentId references
    if (items?.length) {
      const idMap = new Map<string, string>();
      const sorted = [...items].sort((a, b) => {
        if (!a.parentId && !b.parentId) return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
        if (!a.parentId) return -1;
        if (!b.parentId) return 1;
        return 0;
      });

      for (const item of sorted) {
        const created = await db.menuItem.create({
          data: {
            menuId: menu.id,
            parentId: item.parentId ? idMap.get(item.parentId) ?? null : null,
            label: item.label,
            url: item.url ?? null,
            page: item.page ?? null,
            slug: item.slug ?? null,
            sortOrder: item.sortOrder ?? 0,
            isActive: item.isActive ?? true,
            openInNewTab: item.openInNewTab ?? false,
          },
        });
        if (item.id) {
          idMap.set(item.id, created.id);
        }
      }
    }

    const menuWithItems = await db.menu.findUnique({
      where: { id: menu.id },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });

    revalidatePath('/', 'layout');
    return NextResponse.json({ menu: menuWithItems }, { status: 201 });
  } catch (error) {
    console.error('Create menu error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}