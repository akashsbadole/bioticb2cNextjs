import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { escapeCSV } from '@/lib/utils';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const headers = ['name', 'email', 'role', 'isActive', 'createdAt'];

    const rows = users.map((u) => [
      escapeCSV(u.name),
      escapeCSV(u.email),
      escapeCSV(u.role),
      escapeCSV(u.isActive),
      escapeCSV(u.createdAt.toISOString()),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
