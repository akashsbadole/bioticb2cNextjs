import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';

export async function GET(request: NextRequest) {
  const storeId = getStoreId(request);
  try {
    const settings = await db.siteSetting.findMany();
    const getSetting = (key: string) =>
      settings.find((s) => s.key === key)?.value || '';

    const siteName = getSetting('site_name') || 'Store';
    const siteUrl = getSetting('site_url') || 'https://example.com';
    const baseUrl = siteUrl.replace(/\/$/, '');

    // Fetch all active products and categories
    const storeFilter = storeId ? { storeId } : {};
    const [products, categories, contentPages, blogPosts] = await Promise.all([
      db.product.findMany({
        where: { isActive: true, ...storeFilter },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
      db.category.findMany({
        where: { isActive: true, deletedAt: null, ...storeFilter },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
      db.contentPage.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
      db.blogPost.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    // Get the most recent update across all entities
    const allDates = products.map((p) => p.updatedAt)
      .concat(categories.map((c) => c.updatedAt))
      .concat(contentPages.map((p) => p.updatedAt))
      .concat(blogPosts.map((p) => p.updatedAt));
    const siteLastmod = allDates.length > 0
      ? allDates.sort((a, b) => b.getTime() - a.getTime())[0].toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const urls: string[] = [];

    // Homepage
    urls.push(`  <url>\n    <loc>${baseUrl}</loc>\n    <lastmod>${siteLastmod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`);

    // Catalogue
    urls.push(`  <url>\n    <loc>${baseUrl}/catalogue</loc>\n    <lastmod>${siteLastmod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>`);

    // Products
    for (const product of products) {
      const lastmod = product.updatedAt.toISOString().split('T')[0];
      urls.push(`  <url>\n    <loc>${baseUrl}/${product.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`);
    }

    // Categories
    for (const category of categories) {
      const lastmod = category.updatedAt.toISOString().split('T')[0];
      urls.push(`  <url>\n    <loc>${baseUrl}/category/${category.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`);
    }

    // Content Pages — use /{slug} to match app routing
    for (const page of contentPages) {
      const lastmod = page.updatedAt.toISOString().split('T')[0];
      urls.push(`  <url>\n    <loc>${baseUrl}/${page.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`);
    }

    // Blog Posts
    for (const post of blogPosts) {
      const lastmod = post.updatedAt.toISOString().split('T')[0];
      urls.push(`  <url>\n    <loc>${baseUrl}/blog/${post.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`);
    }

    // Blog listing page
    urls.push(`  <url>\n    <loc>${baseUrl}/blog</loc>\n    <lastmod>${siteLastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`);

    // Contact
    urls.push(`  <url>\n    <loc>${baseUrl}/contact</loc>\n    <lastmod>${siteLastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error('Sitemap error:', error);
    return NextResponse.json(
      { error: 'Failed to generate sitemap' },
      { status: 500 }
    );
  }
}
