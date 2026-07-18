import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { createToken } from '@/lib/jwt-helper';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/activity-log';
import { ACTIVITY } from '@/lib/constants';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const ipAddress = request.headers.get('x-forwarded-for') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await authenticateUser(email, password);
    if (!user) {
      logActivity({
        action: ACTIVITY.USER_LOGIN_FAILED,
        entity: 'User',
        details: { email },
        ipAddress,
      }).catch(() => {});
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const jti = randomUUID();
    const token = await createToken({ userId: user.id, email: user.email, role: user.role, jti });

    // Track active session (audit 6.2)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.session.create({
      data: { userId: user.id, tokenId: jti, ipAddress, userAgent, expiresAt },
    }).catch((err) => console.error('Failed to record session:', err));

    logActivity({
      action: ACTIVITY.USER_LOGIN,
      entity: 'User',
      entityId: user.id,
      userName: user.email,
      ipAddress,
      details: { email: user.email },
    }).catch(() => {});

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('API custom login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
