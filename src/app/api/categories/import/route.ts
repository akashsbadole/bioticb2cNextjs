import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

// Simple CSV parser
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = '';
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(current.trim());
        current = '';
      } else if (ch === '\n' || (ch === '\r' && next === '\n')) {
        row.push(current.trim());
        current = '';
        if (row.length > 0 && row.some(cell => cell !== '')) {
          rows.push(row);
        }
        row = [];
        if (ch === '\r') i++;
      } else {
        current += ch;
      }
    }
  }

  if (current || row.length > 0) {
    row.push(current.trim());
    if (row.some(cell => cell !== '')) {
      rows.push(row);
    }
  }

  return rows;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    if (!file.name.endsWith('.csv')) return NextResponse.json({ error: 'Only CSV files are accepted' }, { status: 400 });

    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length < 2) return NextResponse.json({ error: 'CSV must have a header row' }, { status: 400 });

    const headers = rows[0].map(h => h.toLowerCase().trim());
    const errors: string[] = [];
    let imported = 0;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length === 0 || row.every(cell => cell === '')) continue;

      const getValue = (field: string) => {
        const idx = headers.indexOf(field.toLowerCase());
        return idx >= 0 && idx < row.length ? row[idx] : '';
      };

      const name = getValue('name');
      if (!name) {
        errors.push(`Row ${i + 1}: Missing category name`);
        continue;
      }

      const slug = getValue('slug') || name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');

      try {
        await db.category.upsert({
          where: { slug },
          update: {
            name,
            description: getValue('description') || null,
            isActive: getValue('isactive')?.toLowerCase() !== 'false',
            sortOrder: parseInt(getValue('sortorder')) || 0,
          },
          create: {
            name,
            slug,
            description: getValue('description') || null,
            isActive: getValue('isactive')?.toLowerCase() !== 'false',
            sortOrder: parseInt(getValue('sortorder')) || 0,
          },
        });
        imported++;
      } catch (err: any) {
        errors.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    return NextResponse.json({ success: true, imported, errors });
  } catch (error) {
    console.error('Import categories error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
