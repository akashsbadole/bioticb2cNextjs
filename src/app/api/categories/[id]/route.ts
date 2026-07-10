import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizeImageUrl } from '@/lib/utils';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await db.category.findFirst({
      where: { id, deletedAt: null },
      include: {
        Product: {
          where: { deletedAt: null },
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        },
      },
    });
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ category, products: category.Product });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

    const existing = await db.category.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check slug uniqueness if slug is being updated
    if (body.slug !== undefined && body.slug !== existing.slug) {
      const slugExists = await db.category.findFirst({
        where: { slug: body.slug, NOT: { id }, deletedAt: null },
      });
      if (slugExists) {
        return NextResponse.json({ error: 'Slug already in use' }, { status: 409 });
      }
    }

    const category = await db.category.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.description !== undefined && {
          description: body.description,
        }),
        ...(body.image !== undefined && { image: normalizeImageUrl(body.image) }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.metaTitle !== undefined && {
          metaTitle: body.metaTitle || null,
        }),
        ...(body.metaDescription !== undefined && {
          metaDescription: body.metaDescription || null,
        }),
        ...(body.ogImage !== undefined && {
          ogImage: body.ogImage || null,
        }),
        ...(body.customSchema !== undefined && {
          customSchema: body.customSchema || null,
        }),

        // Category page fields
        ...(body.heroTitle !== undefined && { heroTitle: body.heroTitle || null }),
        ...(body.heroSubtitle !== undefined && { heroSubtitle: body.heroSubtitle || null }),
        ...(body.heroDescription !== undefined && { heroDescription: body.heroDescription || null }),
        ...(body.contentSplitImage !== undefined && { contentSplitImage: body.contentSplitImage || null }),
        ...(body.contentSplitHeading !== undefined && { contentSplitHeading: body.contentSplitHeading || null }),
        ...(body.contentSplitParagraph !== undefined && { contentSplitParagraph: body.contentSplitParagraph || null }),
        ...(body.contentSplitBullets !== undefined && { contentSplitBullets: body.contentSplitBullets || '[]' }),
        ...(body.cardsTitle !== undefined && { cardsTitle: body.cardsTitle || null }),
        ...(body.cardsProductIds !== undefined && { cardsProductIds: body.cardsProductIds || '[]' }),
        ...(body.cardsMaxCount !== undefined && { cardsMaxCount: body.cardsMaxCount ?? 8 }),
        ...(body.cardsColumns !== undefined && { cardsColumns: body.cardsColumns ?? 4 }),
        ...(body.ctaHeading !== undefined && { ctaHeading: body.ctaHeading || null }),
        ...(body.ctaDescription !== undefined && { ctaDescription: body.ctaDescription || null }),
        ...(body.ctaBulkText !== undefined && { ctaBulkText: body.ctaBulkText || null }),
        ...(body.ctaBulkLink !== undefined && { ctaBulkLink: body.ctaBulkLink || null }),
        ...(body.ctaPrivateLabelText !== undefined && { ctaPrivateLabelText: body.ctaPrivateLabelText || null }),
        ...(body.ctaPrivateLabelLink !== undefined && { ctaPrivateLabelLink: body.ctaPrivateLabelLink || null }),
        ...(body.ctaBackgroundColor !== undefined && { ctaBackgroundColor: body.ctaBackgroundColor || null }),
        ...(body.processTitle !== undefined && { processTitle: body.processTitle || null }),
        ...(body.processSubtitle !== undefined && { processSubtitle: body.processSubtitle || null }),
        ...(body.processSteps !== undefined && { processSteps: body.processSteps || '[]' }),
        ...(body.infographicImage !== undefined && { infographicImage: body.infographicImage || null }),
        ...(body.infographicCaption !== undefined && { infographicCaption: body.infographicCaption || null }),
        ...(body.infographicAltText !== undefined && { infographicAltText: body.infographicAltText || null }),

        // Gallery fields
        ...(body.galleryTitle !== undefined && { galleryTitle: body.galleryTitle || null }),
        ...(body.galleryImages !== undefined && { galleryImages: body.galleryImages || '[]' }),

        // FAQ fields
        ...(body.faqTitle !== undefined && { faqTitle: body.faqTitle || null }),
        ...(body.faqItems !== undefined && { faqItems: body.faqItems || '[]' }),
        ...(body.parentId !== undefined && {
          parentId: body.parentId || null,
        }),
      },
    });

    // Handle product assignments if productIds provided
    if (body.productIds !== undefined && Array.isArray(body.productIds)) {
      // Unassign products no longer in this category
      await db.product.updateMany({
        where: { categoryId: id, id: { notIn: body.productIds }, deletedAt: null },
        data: { categoryId: null },
      });
      // Assign selected products to this category
      if (body.productIds.length > 0) {
        await db.product.updateMany({
          where: { id: { in: body.productIds }, deletedAt: null },
          data: { categoryId: id },
        });
      }
    }

    const updated = await db.category.findFirst({
      where: { id },
      include: {
        Product: {
          where: { deletedAt: null },
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        },
      },
    });

    return NextResponse.json({ category: updated, products: updated?.Product || [] });
  } catch (error) {
    console.error('Update category error:', error);
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

    const existing = await db.category.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has products
    const productCount = await db.product.count({
      where: { categoryId: id, deletedAt: null },
    });

    if (permanent) {
      // Only allow permanent delete if no active products
      if (productCount > 0) {
        return NextResponse.json(
          { error: `Cannot permanently delete category with ${productCount} active products. Remove or reassign products first.` },
          { status: 400 }
        );
      }
      await db.category.delete({ where: { id } });
      return NextResponse.json({ message: 'Category permanently deleted' });
    }

    // Soft delete - set deletedAt timestamp
    await db.category.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return NextResponse.json({
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
