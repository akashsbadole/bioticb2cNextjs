import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { escapeCSV } from '@/lib/utils';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    const products = await db.product.findMany({
      where: { deletedAt: null },
      include: { Category: true },
      orderBy: { sortOrder: 'asc' },
    });

    const headers = [
      'name', 'slug', 'description', 'shortDescription', 'price',
      'comparePrice', 'wholesalePrice', 'minOrderQty', 'sku',
      'categoryId', 'categoryName', 'isFeatured', 'isActive',
      'sortOrder', 'stock', 'lowStockThreshold', 'whatsappNumber',
    ];

    const rows = products.map((p) => [
      escapeCSV(p.name),
      escapeCSV(p.slug),
      escapeCSV(p.description),
      escapeCSV(p.shortDescription),
      escapeCSV(p.price),
      escapeCSV(p.comparePrice),
      escapeCSV(p.wholesalePrice),
      escapeCSV(p.minOrderQty),
      escapeCSV(p.sku),
      escapeCSV(p.categoryId),
      escapeCSV(p.Category?.name || ''),
      escapeCSV(p.isFeatured),
      escapeCSV(p.isActive),
      escapeCSV(p.sortOrder),
      escapeCSV(p.stock),
      escapeCSV(p.lowStockThreshold),
      escapeCSV(p.whatsappNumber),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="products-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export products error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
