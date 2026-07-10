import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseCSV } from '@/lib/utils';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getStoreId } from '@/lib/store-db';

// POST /api/import/woocommerce/orders - Import orders from WooCommerce CSV
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const rows = parseCSV(text);
    if (rows.length < 2) {
        return NextResponse.json({ error: 'Empty CSV' }, { status: 400 });
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);

    let imported = 0;
    let skipped = 0;
    let errors: string[] = [];

    for (const row of dataRows) {
        try {
            const data: any = {};
            headers.forEach((h, i) => { data[h] = row[i] || ''; });

            // Basic mapping for WooCommerce Orders
            const wcOrderId = data['Order ID'] || data['ID'];
            const status = data['Status'] || 'completed';
            const total = parseFloat(data['Order Total Amount'] || data['Total']) || 0;
            const email = data['Billing Email'] || data['Email'];
            const firstName = data['Billing First Name'] || '';
            const lastName = data['Billing Last Name'] || '';

            if (!wcOrderId) {
                skipped++;
                continue;
            }

            // Check if already exists by checking if any order has this notes/metadata or specific ID
            // To avoid collisions in multi-tenant, we prefix or use a custom field
            const orderId = `wc_${storeId || 'global'}_${wcOrderId}`;

            const existing = await db.order.findUnique({
                where: { id: orderId }
            });
            if (existing) {
                skipped++;
                continue;
            }

            await db.order.create({
                data: {
                    id: orderId,
                    storeId,
                    customerName: `${firstName} ${lastName}`.trim(),
                    customerEmail: email,
                    totalAmount: total,
                    subtotal: total,
                    status: status.replace('wc-', ''),
                    paymentStatus: status === 'wc-completed' ? 'paid' : 'unpaid',
                    createdAt: data['Order Date'] ? new Date(data['Order Date']) : new Date(),
                }
            });
            imported++;
        } catch (err) {
            errors.push(`Row failed: ${err instanceof Error ? err.message : 'Unknown'}`);
        }
    }

    return NextResponse.json({ imported, skipped, errors: errors.slice(0, 10) });
  } catch (error) {
    console.error('WC Order import error:', error);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
