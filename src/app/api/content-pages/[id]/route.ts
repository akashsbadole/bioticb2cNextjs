import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { normalizeImageUrl } from '@/lib/utils';
import { getStoreId } from '@/lib/store-db';
import { normalizeBlocksForStorage } from '@/lib/page-blocks';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const contentPage = await db.contentPage.findFirst({
      where: { id },
    });

    if (!contentPage) {
      return NextResponse.json(
        { error: 'Content page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ contentPage });
  } catch (error) {
    console.error('Get content page error:', error);
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
    const storeId = getStoreId(request);
    let blocks: string | undefined;

    if (body.blocks !== undefined) {
      try {
        blocks = normalizeBlocksForStorage(body.blocks);
      } catch {
        return NextResponse.json(
          { error: 'Blocks must be an array or a valid JSON string' },
          { status: 400 }
        );
      }
    }

    const existing = await db.contentPage.findFirst({ where: { id, ...(storeId ? { storeId } : {}) } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Content page not found' },
        { status: 404 }
      );
    }

    // Check slug uniqueness if slug is being updated
    if (body.slug !== undefined && body.slug !== existing.slug) {
      const slugExists = await db.contentPage.findFirst({
        where: { slug: body.slug, NOT: { id } },
      });
      if (slugExists) {
        return NextResponse.json({ error: 'Slug already in use' }, { status: 409 });
      }
    }

    const contentPage = await db.contentPage.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.heroImage !== undefined && {
          heroImage: normalizeImageUrl(body.heroImage),
        }),
        ...(body.metaTitle !== undefined && {
          metaTitle: body.metaTitle || null,
        }),
        ...(body.metaDescription !== undefined && {
          metaDescription: body.metaDescription || null,
        }),
        ...(body.ogImage !== undefined && {
          ogImage: normalizeImageUrl(body.ogImage),
        }),
        ...(body.customSchema !== undefined && {
          customSchema: body.customSchema || null,
        }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(blocks !== undefined && { blocks }),
        ...(storeId ? { storeId } : { storeId: null }),
      },
    });

    revalidatePath('/', 'layout');
    return NextResponse.json({ contentPage });
  } catch (error) {
    console.error('Update content page error:', error);
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

    const existing = await db.contentPage.findFirst({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Content page not found' },
        { status: 404 }
      );
    }

    await db.contentPage.delete({ where: { id } });

    revalidatePath('/', 'layout');
    return NextResponse.json({
      message: 'Content page deleted successfully',
    });
  } catch (error) {
    console.error('Delete content page error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
