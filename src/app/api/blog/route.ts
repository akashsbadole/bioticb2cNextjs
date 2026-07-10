import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/activity-log';
import { blogPostSchema } from '@/lib/validations';
import { getStoreId } from '@/lib/store-db';
import { normalizeBlocksForStorage } from '@/lib/page-blocks';
import { normalizeImageUrl } from '@/lib/utils';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const storeId = getStoreId(request);
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all');
    const published = searchParams.get('published');
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');
    const slug = searchParams.get('slug');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const where: Record<string, unknown> = {};

    // Single post lookup by slug
    if (slug) {
      where.slug = slug;
    }

    if (published === 'true') {
      where.isPublished = true;
    } else if (!all) {
      where.isPublished = true;
    }

    if (search) {
      // Use AND to combine with existing filters instead of OR which overwrites
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : []),
        {
          OR: [
            { title: { contains: search } },
            { excerpt: { contains: search } },
          ],
        },
      ];
    }

    if (tag) {
      where.tags = { contains: tag };
    }

    const scopedWhere = { ...where, ...(storeId ? { storeId } : {}) };

    const [blogPosts, total] = await Promise.all([
      db.blogPost.findMany({
        where: scopedWhere,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          content: true,
          coverImage: true,
          authorId: true,
          metaTitle: true,
          metaDescription: true,
          ogImage: true,
          tags: true,
          isPublished: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
          User: { select: { id: true, name: true, email: true, avatar: true, bio: true } },
        },
        orderBy: published === 'true' || !all
          ? { publishedAt: 'desc' }
          : { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.blogPost.count({ where: scopedWhere }),
    ]);

    return NextResponse.json({
      blogPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get blog posts error:', error);
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

    // Auto-generate slug from title if not provided
    if (!body.slug && body.title) {
      body.slug = body.title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
    }

    const result = blogPostSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const validatedData = result.data;
    let blocks: string;
    try {
      blocks = normalizeBlocksForStorage(validatedData.blocks);
    } catch {
      return NextResponse.json(
        { error: 'Blocks must be an array or a valid JSON string' },
        { status: 400 }
      );
    }

    const storeId = getStoreId(request);

    // Check slug uniqueness per store
    const existingSlug = await db.blogPost.findFirst({
      where: { slug: validatedData.slug, ...(storeId ? { storeId } : {}) }
    });
    if (existingSlug) {
      return NextResponse.json({ error: 'Slug already in use' }, { status: 409 });
    }
    const blogPost = await db.blogPost.create({
      data: {
        title: validatedData.title,
        slug: validatedData.slug,
        excerpt: validatedData.excerpt || null,
        content: validatedData.content || '',
        coverImage: normalizeImageUrl(validatedData.coverImage),
        authorId: validatedData.authorId || null,
        metaTitle: validatedData.metaTitle || null,
        metaDescription: validatedData.metaDescription || null,
        ogImage: normalizeImageUrl(validatedData.ogImage),
        blocks,
        tags: validatedData.tags
          ? JSON.stringify(validatedData.tags.split(',').map((t: string) => t.trim()).filter(Boolean))
          : null,
        isPublished: validatedData.isPublished ?? false,
        publishedAt: validatedData.isPublished ? new Date() : null,
        ...(storeId ? { storeId } : {}),
      },
      include: { User: { select: { id: true, name: true, email: true, avatar: true, bio: true } } },
    });

    // Log blog creation
    const userId = request.headers.get('x-user-id') || undefined;
    const userName = request.headers.get('x-user-email') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') || undefined;
    logActivity({
      action: 'blog.create',
      entity: 'Blog',
      entityId: blogPost.id,
      userId,
      userName,
      ipAddress,
      details: { title: blogPost.title, isPublished: blogPost.isPublished },
    }).catch(() => {});

    return NextResponse.json({ blogPost }, { status: 201 });
  } catch (error) {
    console.error('Create blog post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
