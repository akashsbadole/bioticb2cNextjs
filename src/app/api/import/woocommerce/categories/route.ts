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

    // First pass: Create all categories
    const categoryMap = new Map<string, string>(); // name -> id

    for (const row of rows.slice(1)) {
        try {
            const data: any = {};
            headers.forEach((h, i) => { data[h] = row[i]; });

            const name = data['Name'] || data['name'];
            if (!name) continue;
            const slug = data['Slug'] || data['slug'] || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

            let existing = await db.category.findFirst({ where: { storeId, slug } });
            if (!existing) {
                existing = await db.category.create({
                    data: {
                        storeId,
                        name,
                        slug,
                        description: data['Description'] || '',
                    }
                });
                imported++;
            } else {
                skipped++;
            }
            categoryMap.set(name, existing.id);
        } catch {
            skipped++;
        }
    }

    // Second pass: Setup hierarchy
    for (const row of rows.slice(1)) {
        try {
            const data: any = {};
            headers.forEach((h, i) => { data[h] = row[i]; });

            const name = data['Name'] || data['name'];
            const parentName = data['Parent'] || data['parent'];

            if (name && parentName && categoryMap.has(name) && categoryMap.has(parentName)) {
                await db.category.update({
                    where: { id: categoryMap.get(name) },
                    data: { parentId: categoryMap.get(parentName) }
                });
            }
        } catch {
            // ignore hierarchy errors
        }
    }

    return NextResponse.json({ imported, skipped, total: rows.length - 1, errors: [] });
  } catch (error) {
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
