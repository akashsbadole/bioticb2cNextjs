import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/activity-log';
import { productSchema } from '@/lib/validations';
import { getStoreId } from '@/lib/store-db';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const storeId = getStoreId(request);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const categoryId = searchParams.get('categoryId');
    const featured = searchParams.get('featured');
    const ids = searchParams.get('ids');
    const slug = searchParams.get('slug');
    const trashed = searchParams.get('trashed');

    // Pagination params
    const cursor = searchParams.get('cursor');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const page = searchParams.get('page');

    const sort = searchParams.get('sort');
    const all = searchParams.get('all');
    const where: Record<string, unknown> = {};

    // Handle trashed filtering
    if (trashed === 'true') {
      where.deletedAt = { not: null };
    } else {
      where.deletedAt = null;
    }

    if (!all && trashed !== 'true') {
      where.isActive = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStock = searchParams.get('inStock');
    const stockStatus = searchParams.get('stockStatus');

    if (minPrice) {
      const gte = parseFloat(minPrice);
      where.price = typeof where.price === 'object' ? { ...where.price, gte } : { gte };
    }
    if (maxPrice) {
      const lte = parseFloat(maxPrice);
      where.price = typeof where.price === 'object' ? { ...where.price, lte } : { lte };
    }
    if (inStock === 'true' || stockStatus === 'in_stock') {
      where.stock = { gt: 0 };
    } else if (stockStatus === 'out_of_stock') {
      where.stock = { lte: 0 };
    }

    if (featured !== null && featured !== undefined) {
      where.isFeatured = featured === 'true';
    }

    // Single product lookup by slug
    if (slug) {
      where.slug = slug;
    }

    // Handle fetching specific products by IDs
    if (ids) {
      const idList = ids.split(',').filter(Boolean);
      if (idList.length > 0) {
        where.id = { in: idList };
      }
    }

    // Build orderBy from sort param
    let orderBy: Record<string, string>[];
    switch (sort) {
      case 'price_asc':
        orderBy = [{ price: 'asc' }];
        break;
      case 'price_desc':
        orderBy = [{ price: 'desc' }];
        break;
      case 'newest':
        orderBy = [{ createdAt: 'desc' }];
        break;
      case 'oldest':
        orderBy = [{ createdAt: 'asc' }];
        break;
      case 'name_asc':
        orderBy = [{ name: 'asc' }];
        break;
      case 'name_desc':
        orderBy = [{ name: 'desc' }];
        break;
      default:
        orderBy = [{ sortOrder: 'asc' }, { id: 'asc' }];
        break;
    }

    const scopedWhere = { ...where, ...(storeId ? { storeId } : {}) };

    // Cursor-based or page-based pagination
    let products: any[];
    let nextCursor = null;
    let total = 0;

    if (cursor && !page) {
      // Cursor-based pagination
      products = await db.product.findMany({
        where: { ...scopedWhere, id: { gt: cursor } },
        include: { Category: true, ProductVariant: true },
        orderBy,
        take: limit + 1,
      });
      if (products.length > limit) {
        nextCursor = products.pop()?.id || null;
      }
      total = await db.product.count({ where: scopedWhere });
    } else {
      // Page-based pagination (default, backward compatible)
      const pageNum = Math.max(1, parseInt(page || '1'));
      const skip = (pageNum - 1) * limit;

      [products, total] = await Promise.all([
        db.product.findMany({
          where: scopedWhere,
          include: { Category: true, ProductVariant: true },
          orderBy,
          skip,
          take: limit,
        }),
        db.product.count({ where: scopedWhere }),
      ]);
    }

    const response = NextResponse.json({
      products,
      pagination: {
        total,
        limit,
        nextCursor,
      },
    });

    // Cache public product listings for 5 minutes (revalidate in background)
    if (!all && trashed !== 'true') {
      response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    }

    return response;
  } catch (error) {
    console.error('Get products error:', error);
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

    // Auto-generate slug from name if not provided
    if (!body.slug && body.name) {
      body.slug = body.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
    }

    const result = productSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const validatedData = result.data;

    const storeId = getStoreId(request);

    // Check slug uniqueness per store
    const existingSlug = await db.product.findFirst({
      where: { slug: validatedData.slug, ...(storeId ? { storeId } : {}) }
    });
    if (existingSlug) {
      return NextResponse.json({ error: 'Slug already in use' }, { status: 409 });
    }
    const product = await db.product.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        shortDescription: validatedData.shortDescription || null,
        price: validatedData.price,
        comparePrice: validatedData.comparePrice || null,
        wholesalePrice: validatedData.wholesalePrice || null,
        minOrderQty: validatedData.minOrderQty ?? 1,
        sku: validatedData.sku || null,
        barcode: body.barcode || null,
        attributes: body.attributes || "{}",
        tags: body.tags || null,
        images: typeof body.images === 'string' ? body.images : JSON.stringify(body.images || []),
        categoryId: validatedData.categoryId || null,
        whatsappNumber: validatedData.whatsappNumber || null,
        isFeatured: validatedData.isFeatured ?? false,
        isActive: validatedData.isActive ?? true,
        sortOrder: validatedData.sortOrder ?? 0,
        specifications: validatedData.specifications
          ? typeof validatedData.specifications === 'string'
            ? validatedData.specifications
            : JSON.stringify(validatedData.specifications)
          : null,
        metaTitle: validatedData.metaTitle || null,
        metaDescription: validatedData.metaDescription || null,
        ogImage: validatedData.ogImage || null,
        customSchema: body.customSchema || null,
        stock: typeof body.stock === 'number' ? body.stock : (parseInt(body.stock) || 0),
        lowStockThreshold: typeof body.lowStockThreshold === 'number' ? body.lowStockThreshold : (parseInt(body.lowStockThreshold) || 10),
        relatedProductIds: typeof body.relatedProductIds === 'string' ? body.relatedProductIds : '[]',
        isBestSeller: body.isBestSeller === true,
        isDigital: body.isDigital === true,
        downloadUrl: body.downloadUrl || null,
        videoUrl: body.videoUrl || null,
        blocks: typeof body.blocks === 'string' ? body.blocks : JSON.stringify(body.blocks || []),

        ...(storeId ? { storeId } : {}),
      },
      include: { Category: true },
    });

    // Log product creation
    const userId = request.headers.get('x-user-id') || undefined;
    const userName = request.headers.get('x-user-email') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') || undefined;
    logActivity({
      action: 'product.create',
      entity: 'Product',
      entityId: product.id,
      userId,
      userName,
      ipAddress,
      details: { name: product.name, price: product.price },
    }).catch(() => {});

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
