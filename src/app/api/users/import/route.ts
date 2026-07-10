import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { parseCSV, generateRandomPassword } from '@/lib/utils';
import { requireAdminAuth } from '@/lib/admin-auth';

// Max 10MB file size
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

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

      const email = getValue('email');
      const name = getValue('name');
      const password = getValue('password') || generateRandomPassword();
      const role = getValue('role') || 'clerk';

      if (!email || !name) {
        errors.push(`Row ${i + 1}: Missing email or name`);
        continue;
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.user.upsert({
          where: { email },
          update: {
            name,
            role,
            isActive: getValue('isactive')?.toLowerCase() !== 'false',
          },
          create: {
            email,
            name,
            password: hashedPassword,
            role,
            isActive: getValue('isactive')?.toLowerCase() !== 'false',
          },
        });
        imported++;
      } catch (err: any) {
        errors.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    return NextResponse.json({ success: true, imported, errors });
  } catch (error) {
    console.error('Import users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
