import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/activity-log';
import { categorySchema } from '@/lib/validations';
import { getStoreId } from '@/lib/store-db';
import { normalizeImageUrl } from '@/lib/utils';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const storeId = getStoreId(request);
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all');
    const includeDeleted = searchParams.get('includeDeleted');
    const slug = searchParams.get('slug');
    const where: Record<string, unknown> = {};

    // Always exclude soft-deleted unless explicitly requested
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (!all) {
      where.isActive = true;
    }

    if (slug) {
      where.slug = slug;
    }

    const categories = await db.category.findMany({
      where: { ...where, ...(storeId ? { storeId } : {}) },
      orderBy: { sortOrder: 'asc' },
      include: all ? { _count: { select: { Product: true } } } : undefined,
    });

    const response = NextResponse.json(
      slug ? { category: categories[0] || null } : { categories }
    );

    // Cache public category listings for 10 minutes
    if (!includeDeleted) {
      response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
    }

    return response;
  } catch (error) {
    console.error('Get categories error:', error);
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

    const result = categorySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const validatedData = result.data;

    const storeId = getStoreId(request);

    // Check slug uniqueness per store (excluding soft-deleted)
    const existingSlug = await db.category.findFirst({
      where: { slug: validatedData.slug, deletedAt: null, ...(storeId ? { storeId } : {}) },
    });
    if (existingSlug) {
      return NextResponse.json({ error: 'Slug already in use' }, { status: 409 });
    }

    const category = await db.category.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        image: normalizeImageUrl(validatedData.image),
        sortOrder: validatedData.sortOrder ?? 0,
        isActive: validatedData.isActive ?? true,
        metaTitle: validatedData.metaTitle || null,
        metaDescription: validatedData.metaDescription || null,
        ogImage: validatedData.ogImage || null,
        customSchema: (validatedData as Record<string, unknown>).customSchema as string || null,

        // Category page fields
        heroTitle: validatedData.heroTitle || null,
        heroSubtitle: validatedData.heroSubtitle || null,
        heroDescription: validatedData.heroDescription || null,
        contentSplitImage: validatedData.contentSplitImage || null,
        contentSplitHeading: validatedData.contentSplitHeading || null,
        contentSplitParagraph: validatedData.contentSplitParagraph || null,
        contentSplitBullets: validatedData.contentSplitBullets || '[]',
        cardsTitle: validatedData.cardsTitle || null,
        cardsProductIds: validatedData.cardsProductIds || '[]',
        cardsMaxCount: validatedData.cardsMaxCount ?? 8,
        cardsColumns: validatedData.cardsColumns ?? 4,
        ctaHeading: validatedData.ctaHeading || null,
        ctaDescription: validatedData.ctaDescription || null,
        ctaBulkText: validatedData.ctaBulkText || null,
        ctaBulkLink: validatedData.ctaBulkLink || null,
        ctaPrivateLabelText: validatedData.ctaPrivateLabelText || null,
        ctaPrivateLabelLink: validatedData.ctaPrivateLabelLink || null,
        ctaBackgroundColor: validatedData.ctaBackgroundColor || null,
        processTitle: validatedData.processTitle || null,
        processSubtitle: validatedData.processSubtitle || null,
        processSteps: validatedData.processSteps || '[]',
        infographicImage: validatedData.infographicImage || null,
        infographicCaption: validatedData.infographicCaption || null,
        infographicAltText: validatedData.infographicAltText || null,

        // Gallery fields
        galleryTitle: validatedData.galleryTitle || null,
        galleryImages: validatedData.galleryImages || '[]',

        // FAQ fields
        faqTitle: validatedData.faqTitle || null,
        faqItems: validatedData.faqItems || '[]',
        parentId: body.parentId || null,
        ...(storeId ? { storeId } : {}),
      },
    });

    // Assign products if provided
    const productIds: string[] = body.productIds || [];
    if (productIds.length > 0) {
      await db.product.updateMany({
        where: { id: { in: productIds }, deletedAt: null },
        data: { categoryId: category.id },
      });
    }

    // Log category creation
    const userId = request.headers.get('x-user-id') || undefined;
    const userName = request.headers.get('x-user-email') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') || undefined;
    logActivity({
      action: 'category.create',
      entity: 'Category',
      entityId: category.id,
      userId,
      userName,
      ipAddress,
      details: { name: category.name },
    }).catch(() => {});

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
