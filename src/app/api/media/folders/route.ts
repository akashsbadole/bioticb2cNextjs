import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { validateBody } from '@/lib/validate';
import { folderCreateSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;
    const folders = await db.media.findMany({
      select: { folder: true },
      distinct: ['folder'],
      orderBy: { folder: 'asc' },
    });

    const folderList = folders
      .map(f => f.folder)
      .filter((f): f is string => f !== null && f !== '');

    return NextResponse.json({ folders: folderList });
  } catch (error) {
    console.error('List folders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const parsed = await validateBody(request, folderCreateSchema);
    if (parsed.response) return parsed.response;

    const sanitized = parsed.data.folder.trim().replace(/[^a-zA-Z0-9_\-\/ ]/g, '');
    if (!sanitized.startsWith('/')) {
      return NextResponse.json({ error: 'Folder must start with /' }, { status: 400 });
    }

    const existing = await db.media.findFirst({
      where: { folder: sanitized },
      select: { folder: true },
    });

    if (existing) {
      return NextResponse.json({
        folder: sanitized,
        alreadyExists: true,
        message: 'Folder already exists',
      });
    }

    await db.media.create({
      data: {
        filename: '.keep',
        originalName: '.keep',
        mimeType: 'text/plain',
        size: 0,
        url: `${sanitized}/.keep`,
        folder: sanitized,
      },
    });

    return NextResponse.json({
      folder: sanitized,
      alreadyExists: false,
      message: 'Folder created',
    });
  } catch (error) {
    console.error('Create folder error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}