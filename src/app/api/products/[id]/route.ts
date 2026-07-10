import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

async function resolveProduct(idOrSlug: string, includeDeleted = false) {
  const where = {
    OR: [
      { id: idOrSlug },
      { slug: idOrSlug },
    ],
    ...(includeDeleted ? {} : { deletedAt: null }),
  };
  
  return db.product.findFirst({
    where,
    include: { Category: true },
  });
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

    const existing = await resolveProduct(id);
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (body.restore) {
      const product = await db.product.update({
        where: { id: existing.id },
        data: { deletedAt: null },
        include: { Category: true },
      });
      return NextResponse.json({ product });
    }

    return NextResponse.json({ error: 'No valid action specified' }, { status: 400 });
  } catch (error) {
    console.error('Patch product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await resolveProduct(id);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
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

    const existing = await resolveProduct(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (body.slug !== undefined && body.slug !== existing.slug) {
      const slugExists = await db.product.findFirst({
        where: { slug: body.slug, NOT: { id: existing.id } },
      });
      if (slugExists) {
        return NextResponse.json({ error: 'Slug already in use' }, { status: 409 });
      }
    }

    const product = await db.product.update({
      where: { id: existing.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.shortDescription !== undefined && { shortDescription: body.shortDescription }),
        ...(body.price !== undefined && { price: isNaN(parseFloat(body.price)) ? existing.price : parseFloat(body.price) }),
        ...(body.comparePrice !== undefined && {
          comparePrice: body.comparePrice ? (isNaN(parseFloat(body.comparePrice)) ? null : parseFloat(body.comparePrice)) : null,
        }),
        ...(body.wholesalePrice !== undefined && {
          wholesalePrice: body.wholesalePrice ? (isNaN(parseFloat(body.wholesalePrice)) ? null : parseFloat(body.wholesalePrice)) : null,
        }),
        ...(body.minOrderQty !== undefined && { minOrderQty: body.minOrderQty }),
        ...(body.sku !== undefined && { sku: body.sku }),
        ...(body.barcode !== undefined && { barcode: body.barcode }),
        ...(body.attributes !== undefined && { attributes: body.attributes }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.images !== undefined && {
          images: typeof body.images === 'string' ? body.images : JSON.stringify(body.images),
        }),
        ...(body.categoryId !== undefined && { categoryId: body.categoryId || null }),
        ...(body.whatsappNumber !== undefined && { whatsappNumber: body.whatsappNumber || null }),
        ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.isBestSeller !== undefined && { isBestSeller: body.isBestSeller }),
        ...(body.isDigital !== undefined && { isDigital: body.isDigital }),
        ...(body.downloadUrl !== undefined && { downloadUrl: body.downloadUrl }),
        ...(body.videoUrl !== undefined && { videoUrl: body.videoUrl }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(body.specifications !== undefined && {
          specifications: body.specifications
            ? typeof body.specifications === 'string' ? body.specifications : JSON.stringify(body.specifications)
            : null,
        }),
        ...(body.metaTitle !== undefined && { metaTitle: body.metaTitle || null }),
        ...(body.metaDescription !== undefined && { metaDescription: body.metaDescription || null }),
        ...(body.ogImage !== undefined && { ogImage: body.ogImage || null }),
        ...(body.customSchema !== undefined && { customSchema: body.customSchema || null }),
        ...(body.stock !== undefined && { stock: typeof body.stock === 'number' ? body.stock : parseInt(body.stock) || 0 }),
        ...(body.lowStockThreshold !== undefined && { lowStockThreshold: typeof body.lowStockThreshold === 'number' ? body.lowStockThreshold : parseInt(body.lowStockThreshold) || 10 }),
        ...(body.relatedProductIds !== undefined && {
          relatedProductIds: typeof body.relatedProductIds === 'string' ? body.relatedProductIds : JSON.stringify(body.relatedProductIds || []),
        }),
        ...(body.blocks !== undefined && {
          blocks: typeof body.blocks === 'string' ? body.blocks : JSON.stringify(body.blocks || []),
        }),
      },
      include: { Category: true },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Update product error:', error);
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

    const existing = await resolveProduct(id, true);
    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (permanent) {
      await db.product.delete({ where: { id: existing.id } });
      return NextResponse.json({ message: 'Product permanently deleted' });
    }

    // If already soft-deleted, skip update
    if (existing.deletedAt) {
      return NextResponse.json({ message: 'Product already in trash' });
    }

    await db.product.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: 'Product moved to trash' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
