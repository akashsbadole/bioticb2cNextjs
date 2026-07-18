import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt-helper';

export async function POST(request: NextRequest) {
  // Revoke the active session if a bearer token is provided (audit 6.2).
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (token) {
    const payload = await verifyToken(token);
    if (payload?.jti) {
      await db.session.updateMany({
        where: { tokenId: payload.jti, revokedAt: null },
        data: { revokedAt: new Date() },
      }).catch(() => {});
    }
  }
  return NextResponse.json({ message: 'Logged out successfully' });
}
