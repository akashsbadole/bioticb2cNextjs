import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { escapeCSV } from '@/lib/utils';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    const categories = await db.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    const headers = ['name', 'slug', 'description', 'isActive', 'sortOrder'];

    const rows = categories.map((c) => [
      escapeCSV(c.name),
      escapeCSV(c.slug),
      escapeCSV(c.description),
      escapeCSV(c.isActive),
      escapeCSV(c.sortOrder),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="categories-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export categories error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
