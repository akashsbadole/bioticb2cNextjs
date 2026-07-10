import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { escapeCSV } from '@/lib/utils';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    const posts = await db.blogPost.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    const headers = ['title', 'slug', 'excerpt', 'content', 'isPublished', 'createdAt'];

    const rows = posts.map((p) => [
      escapeCSV(p.title),
      escapeCSV(p.slug),
      escapeCSV(p.excerpt),
      escapeCSV(p.content),
      escapeCSV(p.isPublished),
      escapeCSV(p.createdAt.toISOString()),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="blog-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export blog error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
