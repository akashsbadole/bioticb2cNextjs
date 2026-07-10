import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();

    if (!q || q.length < 2) {
      return NextResponse.json({
        products: [],
        categories: [],
        blogPosts: [],
        pages: [],
        users: [],
      });
    }

    const searchCondition = { contains: q };

    const storeFilter = storeId ? { storeId } : {};

    // Search across multiple models in parallel
    const [products, categories, blogPosts, pages, users] = await Promise.all([
      db.product.findMany({
        where: {
          OR: [
            { name: searchCondition },
            { sku: searchCondition },
          ],
          ...storeFilter,
        },
        select: { id: true, name: true, sku: true, isActive: true, slug: true },
        take: 8,
        orderBy: { updatedAt: 'desc' },
      }),
      db.category.findMany({
        where: { name: searchCondition, ...storeFilter },
        select: { id: true, name: true, slug: true, isActive: true },
        take: 8,
        orderBy: { updatedAt: 'desc' },
      }),
      db.blogPost.findMany({
        where: { title: searchCondition, ...storeFilter },
        select: { id: true, title: true, slug: true, isPublished: true },
        take: 8,
        orderBy: { updatedAt: 'desc' },
      }),
      db.contentPage.findMany({
        where: { title: searchCondition, ...storeFilter },
        select: { id: true, title: true, slug: true, isActive: true },
        take: 8,
        orderBy: { updatedAt: 'desc' },
      }),
      db.user.findMany({
        where: {
          OR: [
            { name: searchCondition },
            { email: searchCondition },
          ],
          ...storeFilter,
        },
        select: { id: true, name: true, email: true, role: true, isActive: true },
        take: 8,
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      products: products.map((p) => ({
        id: p.id,
        type: 'product' as const,
        title: p.name,
        subtitle: p.sku || `Slug: ${p.slug}`,
        tab: 'products',
        data: p,
      })),
      categories: categories.map((c) => ({
        id: c.id,
        type: 'category' as const,
        title: c.name,
        subtitle: `Slug: ${c.slug}`,
        tab: 'categories',
        data: c,
      })),
      blogPosts: blogPosts.map((b) => ({
        id: b.id,
        type: 'blogPost' as const,
        title: b.title,
        subtitle: b.isPublished ? 'Published' : 'Draft',
        tab: 'blog',
        data: b,
      })),
      pages: pages.map((p) => ({
        id: p.id,
        type: 'page' as const,
        title: p.title,
        subtitle: `Slug: ${p.slug}`,
        tab: 'pages',
        data: p,
      })),
      users: users.map((u) => ({
        id: u.id,
        type: 'user' as const,
        title: u.name,
        subtitle: u.email,
        tab: 'users',
        data: u,
      })),
    });
  } catch (error) {
    console.error('Admin search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
