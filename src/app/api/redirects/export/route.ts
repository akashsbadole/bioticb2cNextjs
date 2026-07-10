import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { escapeCSV } from '@/lib/utils';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    const redirects = await db.redirect.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const headers = ['from', 'to', 'type', 'isActive'];

    const rows = redirects.map((r) => [
      escapeCSV(r.from),
      escapeCSV(r.to),
      escapeCSV(r.type),
      escapeCSV(r.isActive),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="redirects-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export redirects error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
