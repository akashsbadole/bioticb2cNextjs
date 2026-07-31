import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { contentPageSchema } from '@/lib/validations';
import { normalizeImageUrl } from '@/lib/utils';
import { getStoreId } from '@/lib/store-db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { storefrontCache, CACHE_TAGS, invalidateCache, storefrontCacheHeaders } from '@/lib/cache';
import { normalizeBlocksForStorage } from '@/lib/page-blocks';
import { PLATFORM_PAGE_SLUGS } from '@/lib/platform-pages';
import { sanitizeHtml, sanitizeBlocks } from '@/lib/sanitize';

export async function GET(request: NextRequest) {
  try {
    const storeId = getStoreId(request);
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all');
    const search = searchParams.get('search');
    const slug = searchParams.get('slug');

    const where: Record<string, unknown> = {};

    if (!all) {
      where.isActive = true;
    }

    if (search) {
      where.title = { contains: search };
    }

    if (slug) {
      where.slug = slug;
    }

    const skipStoreFilter = PLATFORM_PAGE_SLUGS.has(slug || '');

    // ISR-style data cache for public content page reads. Invalidated on
    // admin writes via invalidateCache(CACHE_TAGS.pages).
    const fetchContentPages = storefrontCache(
      [storeId || '', all || '', search || '', slug || '', String(skipStoreFilter)],
      async () => {
        return db.contentPage.findMany({
          where: {
            ...where,
            ...(storeId && !skipStoreFilter ? { storeId } : {}),
          },
          orderBy: { sortOrder: 'asc' },
        });
      },
      [CACHE_TAGS.pages],
      600,
    );

    const contentPages = await fetchContentPages();

    const response = NextResponse.json({ contentPages });
    Object.entries(storefrontCacheHeaders(600)).forEach(([key, value]) =>
      response.headers.set(key, value),
    );
    return response;
  } catch (error) {
    console.error('Get content pages error:', error);
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

    const result = contentPageSchema.safeParse(body);
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

    // Check slug uniqueness
    const existingSlug = await db.contentPage.findFirst({
      where: { slug: validatedData.slug, ...(storeId ? { storeId } : {}) }
    });
    if (existingSlug) {
      return NextResponse.json({ error: 'Slug already in use' }, { status: 409 });
    }
    const contentPage = await db.contentPage.create({
      data: {
        title: validatedData.title,
        slug: validatedData.slug,
        content: sanitizeHtml(validatedData.content || ''),
        blocks: sanitizeBlocks(blocks),
        heroImage: normalizeImageUrl(validatedData.heroImage),
        metaTitle: validatedData.metaTitle || null,
        metaDescription: validatedData.metaDescription || null,
        ogImage: normalizeImageUrl(validatedData.ogImage),
        customSchema: body.customSchema || null,
        isActive: validatedData.isActive ?? true,
        sortOrder: validatedData.sortOrder ?? 0,
        ...(storeId ? { storeId } : {}),
      },
    });

    revalidatePath('/', 'layout');
    invalidateCache(CACHE_TAGS.pages);
    return NextResponse.json({ contentPage }, { status: 201 });
  } catch (error) {
    console.error('Create content page error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
