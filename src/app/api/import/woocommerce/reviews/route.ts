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

            const rating = parseInt(data['Rating'] || data['rating']) || 5;
            const comment = data['Content'] || data['content'] || '';
            const email = data['Author Email'] || data['email'];
            const productName = data['Product Name'] || data['product'];

            if (!email || !productName) continue;

            // Find user and product
            const user = await db.user.findUnique({ where: { email } });
            const product = await db.product.findFirst({ where: { storeId, name: productName } });

            if (!user || !product) {
                skipped++;
                continue;
            }

            await db.review.create({
                data: {
                    storeId,
                    productId: product.id,
                    userId: user.id,
                    rating,
                    comment,
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
