import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Return empty sitemap if DATABASE_URL is not provided (avoids build failures)
  if (!process.env.DATABASE_URL) {
    return [
        { url: baseUrl, lastModified: new Date() },
        { url: `${baseUrl}/catalogue`, lastModified: new Date() }
    ];
  }

  // 1. Static Pages
  const staticPages = [
    '',
    '/catalogue',
    '/about',
    '/contact',
    '/faq',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 1,
  }));

  // 2. Dynamic Products
  const products = await db.product.findMany({
    where: { isActive: true, deletedAt: null },
    select: { slug: true, updatedAt: true }
  });
  const productPages = products.map(p => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // 3. Dynamic Categories
  const categories = await db.category.findMany({
    where: { isActive: true, deletedAt: null },
    select: { slug: true, updatedAt: true }
  });
  const categoryPages = categories.map(c => ({
    url: `${baseUrl}/catalogue/${c.slug}`, // Fixed: should be catalogue or category
    lastModified: c.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...categoryPages];
}
