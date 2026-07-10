import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizeBlocksForStorage } from '@/lib/page-blocks';
import { getStoreId } from '@/lib/store-db';
import { normalizeImageUrl } from '@/lib/utils';
import { requireAdminAuth } from '@/lib/admin-auth';

async function resolveBlogPost(idOrSlug: string, storeId: string | null) {
  return db.blogPost.findFirst({
    where: {
      OR: [
        { id: idOrSlug },
        { slug: idOrSlug },
      ],
      ...(storeId ? { storeId } : {}),
    },
    include: { User: { select: { id: true, name: true, email: true, avatar: true, bio: true } } },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const storeId = getStoreId(request);
    const blogPost = await resolveBlogPost(id, storeId);

    if (!blogPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ blogPost });
  } catch (error) {
    console.error('Get blog post error:', error);
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

    const existing = await resolveBlogPost(id, storeId);
    if (!existing) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Check slug uniqueness if slug is being updated
    if (body.slug !== undefined && body.slug !== existing.slug) {
      const slugExists = await db.blogPost.findFirst({
        where: { slug: body.slug, NOT: { id: existing.id }, ...(storeId ? { storeId } : {}) },
      });
      if (slugExists) {
        return NextResponse.json({ error: 'Slug already in use' }, { status: 409 });
      }
    }

    // If publishing for the first time, set publishedAt
    let publishedAt: Date | null | undefined = undefined;
    if (body.isPublished === true && !existing.publishedAt) {
      publishedAt = new Date();
    } else if (body.isPublished === false) {
      publishedAt = null;
    }

    const blogPost = await db.blogPost.update({
      where: { id: existing.id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.excerpt !== undefined && {
          excerpt: body.excerpt || null,
        }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.coverImage !== undefined && {
          coverImage: normalizeImageUrl(body.coverImage),
        }),
        ...(body.authorId !== undefined && {
          authorId: body.authorId || null,
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
        ...(body.tags !== undefined && {
          tags: body.tags
            ? JSON.stringify(body.tags.split(',').map((t: string) => t.trim()).filter(Boolean))
            : null,
        }),
        ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
        ...(publishedAt !== undefined && { publishedAt }),
        ...(blocks !== undefined && { blocks }),
      },
    });

    return NextResponse.json({ blogPost });
  } catch (error) {
    console.error('Update blog post error:', error);
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
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';
    const storeId = getStoreId(request);

    const existing = await resolveBlogPost(id, storeId);

    if (!existing) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    if (permanent) {
      await db.blogPost.delete({ where: { id: existing.id } });
    } else {
      await db.blogPost.update({
        where: { id: existing.id },
        data: { deletedAt: new Date(), isPublished: false },
      });
    }

    return NextResponse.json({
      message: permanent
        ? 'Blog post deleted permanently'
        : 'Blog post moved to trash',
    });
  } catch (error) {
    console.error('Delete blog post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;
    const { id } = await params;
    const body = await request.json();
    const storeId = getStoreId(request);

    const existing = await db.blogPost.findFirst({
      where: { id, ...(storeId ? { storeId } : {}) }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    if (body.restore) {
      await db.blogPost.update({
        where: { id: existing.id },
        data: { deletedAt: null },
      });
      return NextResponse.json({ message: 'Blog post restored' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Restore blog post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
