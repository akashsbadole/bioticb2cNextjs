import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { logError } from '@/lib/error-logger';
import { sendLowStockAlert, sendBackInStockNotification } from '@/lib/email';
import { ensurePluginsLoaded, isPluginEnabled, hooks } from '@/lib/plugins';
import { storefrontCache, CACHE_TAGS, invalidateCache, storefrontCacheHeaders } from '@/lib/cache';

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
      invalidateCache(CACHE_TAGS.products);
      invalidateCache(CACHE_TAGS.product(existing.id));
      return NextResponse.json({ product });
    }

    return NextResponse.json({ error: 'No valid action specified' }, { status: 400 });
  } catch (error) {
    logError(error, { category: 'api', context: 'PATCH /api/products/[id]' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ISR-style data cache for the public detail endpoint. Invalidated on
    // admin writes via invalidateCache(CACHE_TAGS.product(id)).
    const fetchProduct = storefrontCache(
      [`product:${id}`],
      async () => {
        const product = await resolveProduct(id);
        if (!product) return null;

        const customFieldValues = await db.customFieldValue.findMany({
          where: {
            entityId: product.id,
            entityType: 'product',
          },
          include: { Definition: true },
          orderBy: {
            Definition: { sortOrder: 'asc' },
          },
        });

        const formattedValues = customFieldValues.map((v) => ({
          id: v.id,
          definitionId: v.definitionId,
          entityId: v.entityId,
          entityType: v.entityType,
          value: v.value,
          definition: {
            id: v.Definition.id,
            name: v.Definition.name,
            type: v.Definition.type,
            isVisible: v.Definition.isVisible,
            options: v.Definition.options,
          },
        }));

        return { product, customFieldValues: formattedValues };
      },
      [CACHE_TAGS.products, CACHE_TAGS.product(id)],
      300,
    );

    const data = await fetchProduct();
    if (!data) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const response = NextResponse.json(data);
    Object.entries(storefrontCacheHeaders(300)).forEach(([key, value]) =>
      response.headers.set(key, value),
    );
    return response;
  } catch (error) {
    logError(error, { category: 'api', context: 'GET /api/products/[id]' });
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
        ...(body.weight !== undefined && { weight: typeof body.weight === 'number' ? body.weight : (parseFloat(body.weight) || 0) }),
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

    const newStock = product.stock;
    const threshold = product.lowStockThreshold ?? 0;
    if (
      body.stock !== undefined &&
      newStock <= threshold &&
      existing.stock > threshold
    ) {
      sendLowStockAlert({
        productName: product.name,
        sku: product.sku,
        stock: newStock,
        lowStockThreshold: threshold,
      }).catch(() => {
        logError('Failed to send low stock alert', {
          category: 'email',
          context: `PUT /api/products/[id] (${product.id})`,
        });
      });
    }

    // Dispatch back-in-stock notification emails when stock transitions
    // from out-of-stock (<=0) to a positive value. When the
    // `stock-notifications` plugin is enabled, the plugin hook handles the
    // dispatch; otherwise the built-in logic below runs (default behavior).
    if (
      body.stock !== undefined &&
      product.stock > 0 &&
      existing.stock <= 0
    ) {
      await ensurePluginsLoaded();
      if (isPluginEnabled("stock-notifications")) {
        hooks.doAction("product:stock-updated", {
          productId: product.id,
          stock: product.stock,
        });
      } else {
        (async () => {
          try {
            const subscribers = await db.stockNotification.findMany({
              where: { productId: product.id, notified: false },
            });
            if (subscribers.length === 0) return;

            const notifiedIds: string[] = [];
            await Promise.allSettled(
              subscribers.map(async (sub) => {
                const sent = await sendBackInStockNotification({
                  email: sub.email,
                  productName: product.name,
                  productSlug: product.slug,
                });
                if (sent) notifiedIds.push(sub.id);
              })
            );

            if (notifiedIds.length > 0) {
              await db.stockNotification.updateMany({
                where: { id: { in: notifiedIds } },
                data: { notified: true, notifiedAt: new Date() },
              });
            }
          } catch (err) {
            logError(err, {
              category: 'email',
              context: `stock-notification dispatch (${product.id})`,
            });
          }
        })();
      }
    }

    invalidateCache(CACHE_TAGS.products);
    invalidateCache(CACHE_TAGS.product(product.id));

    return NextResponse.json({ product });
  } catch (error) {
    logError(error, { category: 'api', context: 'PUT /api/products/[id]' });
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
      invalidateCache(CACHE_TAGS.products);
      invalidateCache(CACHE_TAGS.product(existing.id));
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

    invalidateCache(CACHE_TAGS.products);
    invalidateCache(CACHE_TAGS.product(existing.id));

    return NextResponse.json({ message: 'Product moved to trash' });
  } catch (error) {
    logError(error, { category: 'api', context: 'DELETE /api/products/[id]' });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
