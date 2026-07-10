import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

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

      const title = getValue('title');
      if (!title) {
        errors.push(`Row ${i + 1}: Missing blog title`);
        continue;
      }

      const slug = getValue('slug') || title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');

      try {
        const existing = await db.blogPost.findFirst({ where: { slug } });
        if (existing) {
          await db.blogPost.update({
            where: { id: existing.id },
            data: {
              title,
              excerpt: getValue('excerpt') || null,
              content: getValue('content') || '',
              isPublished: getValue('ispublished')?.toLowerCase() === 'true',
            },
          });
        } else {
          await db.blogPost.create({
            data: {
              title,
              slug,
              excerpt: getValue('excerpt') || null,
              content: getValue('content') || '',
              isPublished: getValue('ispublished')?.toLowerCase() === 'true',
              blocks: JSON.stringify([]),
            },
          });
        }
        imported++;
      } catch (err: any) {
        errors.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    return NextResponse.json({ success: true, imported, errors });
  } catch (error) {
    console.error('Import blog error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
