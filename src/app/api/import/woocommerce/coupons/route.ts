import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseCSV } from '@/lib/utils';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getStoreId } from '@/lib/store-db';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const text = await file.text();
    const rows = parseCSV(text);
    const headers = rows[0];

    let imported = 0;
    let skipped = 0;

    for (const row of rows.slice(1)) {
        try {
            const data: any = {};
            headers.forEach((h, i) => { data[h] = row[i]; });

            const code = (data['Coupon code'] || data['code'] || '').toUpperCase();
            if (!code) continue;

            const existing = await db.coupon.findFirst({ where: { storeId, code } });
            if (existing) {
                skipped++;
                continue;
            }

            const discountType = data['Discount type'] === 'fixed_cart' ? 'fixed' : 'percentage';
            const value = parseFloat(data['Coupon amount'] || data['amount']) || 0;

            await db.coupon.create({
                data: {
                    storeId,
                    code,
                    discountType,
                    discountValue: value,
                    isActive: true,
                }
            });
            imported++;
        } catch {
            skipped++;
        }
    }

    return NextResponse.json({ imported, skipped, total: rows.length - 1, errors: [] });
  } catch (error) {
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
