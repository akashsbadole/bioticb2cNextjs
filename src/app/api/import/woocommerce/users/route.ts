import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseCSV } from '@/lib/utils';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getStoreId } from '@/lib/store-db';

// POST /api/import/woocommerce/users - Import customers from WooCommerce CSV
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

            const email = data['user_email'] || data['Email'];
            const name = data['display_name'] || `${data['first_name']} ${data['last_name']}` || email;

            if (!email) continue;

            const existing = await db.user.findUnique({ where: { email } });
            if (existing) {
                skipped++;
                continue;
            }

            await db.user.create({
                data: {
                    email,
                    name,
                    role: 'buyer',
                    isActive: true,
                    currentStoreId: storeId || null,
                    // Note: No password imported from CSV
                }
            });
            imported++;
        } catch {
            skipped++;
        }
    }

    return NextResponse.json({ imported, skipped });
  } catch (error) {
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
