import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;
    const { id } = await params;
    const media = await db.media.findUnique({ where: { id } });
    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Delete files
    const filesToDelete = [media.url];
    try {
      const thumbs = JSON.parse(media.thumbnails);
      filesToDelete.push(...(Object.values(thumbs) as string[]));
    } catch {}

    for (const filePath of filesToDelete) {
      try {
        const fullPath = path.join(process.cwd(), 'public', filePath);
        // Security: validate that the resolved path stays within public directory
        const publicDir = path.join(process.cwd(), 'public');
        const resolvedPath = path.resolve(fullPath);
        if (!resolvedPath.startsWith(publicDir)) {
          console.warn(`Skipping file outside public directory: ${filePath}`);
          continue;
        }
        await unlink(fullPath);
      } catch {}
    }

    await db.media.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete media error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
