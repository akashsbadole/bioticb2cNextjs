import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { z } from 'zod';

const menuItemSchema = z.object({
  id: z.string().optional(),
  parentId: z.string().nullable().optional(),
  label: z.string().min(1),
  url: z.string().optional().nullable(),
  page: z.string().optional().nullable(),
  slug: z.string().optional().nullable(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
  openInNewTab: z.boolean().optional(),
  children: z.lazy(() => z.array(menuItemSchema).optional()),
});

const menuUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  location: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  items: z.array(menuItemSchema).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;
    const storeId = getStoreId(request);

    const menu = await db.menu.findFirst({
      where: { id, ...(storeId ? { storeId } : {}) },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!menu) {
      return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
    }

    return NextResponse.json({ menu });
  } catch (error) {
    console.error('Get menu error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;
    const body = await request.json();
    const result = menuUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const validatedData = result.data;

    const storeId = getStoreId(request);

    const existingMenu = await db.menu.findFirst({
      where: { id, ...(storeId ? { storeId } : {}) },
    });

    if (!existingMenu) {
      return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
    }

    // Check slug uniqueness if changing
    if (validatedData.slug && validatedData.slug !== existingMenu.slug) {
      const existingSlug = await db.menu.findFirst({
        where: { slug: validatedData.slug, ...(storeId ? { storeId } : {}) },
      });
      if (existingSlug) {
        return NextResponse.json({ error: 'Slug already in use' }, { status: 409 });
      }
    }

    const { items, ...menuData } = validatedData;

    // Update menu
    const menu = await db.menu.update({
      where: { id },
      data: {
        ...menuData,
      },
      include: { items: true },
    });

    if (items?.length) {
      // Delete existing items, then recreate with correct parentId references
      await db.menuItem.deleteMany({ where: { menuId: id } });

      const idMap = new Map<string, string>();

      // Items come as flat array with parentId. Create parents first so parentId can be resolved.
      const sortedItems = [...items].sort((a) => (a.parentId ? 1 : -1));
      for (const item of sortedItems) {
        const clientId = item.id || crypto.randomUUID();
        const created = await db.menuItem.create({
          data: {
            menuId: id,
            parentId: item.parentId ? idMap.get(item.parentId) ?? null : null,
            label: item.label,
            url: item.url || null,
            page: item.page || null,
            slug: item.slug || null,
            sortOrder: item.sortOrder ?? 0,
            isActive: item.isActive ?? true,
            openInNewTab: item.openInNewTab ?? false,
          },
        });
        idMap.set(clientId, created.id);
      }
    }

    const updatedMenu = await db.menu.findFirst({
      where: { id },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });

    revalidatePath('/', 'layout');
    return NextResponse.json({ menu: updatedMenu });
  } catch (error) {
    console.error('Update menu error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;
    const storeId = getStoreId(request);

    const existingMenu = await db.menu.findFirst({
      where: { id, ...(storeId ? { storeId } : {}) },
    });

    if (!existingMenu) {
      return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
    }

    await db.menu.delete({ where: { id } });

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete menu error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}