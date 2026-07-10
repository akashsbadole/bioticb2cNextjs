import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Find the token
    const verificationToken = await db.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json({ error: 'Invalid verification token' }, { status: 400 });
    }

    // Check if token is expired
    if (new Date() > verificationToken.expiresAt) {
      return NextResponse.json({ error: 'Verification token has expired' }, { status: 400 });
    }

    // Check if token was already used
    if (verificationToken.usedAt) {
      return NextResponse.json({ error: 'Verification token has already been used' }, { status: 400 });
    }

    // Mark token as used and verify user
    await db.$transaction([
      db.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      }),
      db.user.update({
        where: { id: verificationToken.userId },
        data: { isVerified: true },
      }),
    ]);

    return NextResponse.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
