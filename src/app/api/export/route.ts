import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { toCsvRow } from '@/lib/utils';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json({ error: 'type parameter required' }, { status: 400 });
    }

    const validTypes = ['products', 'categories', 'blog', 'enquiries', 'users'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    let csvContent = '';
    let filename = '';

    switch (type) {
      case 'products': {
        const products = await db.product.findMany({
          where: { deletedAt: null },
          include: { Category: true },
          orderBy: { createdAt: 'desc' },
        });
        csvContent = toCsvRow(['ID', 'Name', 'Slug', 'SKU', 'Price', 'Compare Price', 'Wholesale Price', 'Min Order Qty', 'Category', 'Active', 'Featured', 'Created At']);
        for (const p of products) {
          csvContent += toCsvRow([p.id, p.name, p.slug, p.sku || '', p.price, p.comparePrice || '', p.wholesalePrice || '', p.minOrderQty, p.Category?.name || '', p.isActive, p.isFeatured, p.createdAt.toISOString()]);
        }
        filename = `products-${new Date().toISOString().slice(0, 10)}.csv`;
        break;
      }

      case 'categories': {
        const categories = await db.category.findMany({ orderBy: { sortOrder: 'asc' } });
        csvContent = toCsvRow(['ID', 'Name', 'Slug', 'Description', 'Active', 'Sort Order', 'Created At']);
        for (const c of categories) {
          csvContent += toCsvRow([c.id, c.name, c.slug, c.description || '', c.isActive, c.sortOrder, c.createdAt.toISOString()]);
        }
        filename = `categories-${new Date().toISOString().slice(0, 10)}.csv`;
        break;
      }

      case 'blog': {
        const posts = await db.blogPost.findMany({
          where: { deletedAt: null },
          include: { User: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        });
        csvContent = toCsvRow(['ID', 'Title', 'Slug', 'Author', 'Published', 'Tags', 'Created At']);
        for (const p of posts) {
          let tags = '';
          try {
            tags = p.tags ? JSON.parse(p.tags).join('; ') : '';
          } catch {
            tags = p.tags || '';
          }
          csvContent += toCsvRow([p.id, p.title, p.slug, p.User?.name || '', p.isPublished, tags, p.createdAt.toISOString()]);
        }
        filename = `blog-posts-${new Date().toISOString().slice(0, 10)}.csv`;
        break;
      }

      case 'enquiries': {
        const enquiries = await db.enquiry.findMany({
          include: { Product: { select: { name: true } }, User: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        });
        csvContent = toCsvRow(['ID', 'Name', 'Email', 'Phone', 'Company', 'Subject', 'Type', 'Status', 'Product', 'Message', 'Created At']);
        for (const e of enquiries) {
          csvContent += toCsvRow([e.id, e.name, e.email, e.phone || '', e.companyName || '', e.subject, e.type, e.status, e.Product?.name || '', e.message.replace(/\n/g, ' '), e.createdAt.toISOString()]);
        }
        filename = `enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
        break;
      }

      case 'users': {
        const users = await db.user.findMany({ orderBy: { createdAt: 'desc' } });
        csvContent = toCsvRow(['ID', 'Name', 'Email', 'Role', 'Active', 'Created At']);
        for (const u of users) {
          csvContent += toCsvRow([u.id, u.name, u.email, u.role, u.isActive, u.createdAt.toISOString()]);
        }
        filename = `users-${new Date().toISOString().slice(0, 10)}.csv`;
        break;
      }
    }

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
