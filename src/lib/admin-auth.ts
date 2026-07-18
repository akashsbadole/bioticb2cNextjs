import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

export interface AdminPayload {
  id: string;
  email: string;
  role: string;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

export type AdminAuthResult = 
  | { success: true; payload: AdminPayload }
  | { success: false; response: NextResponse };

export type AuthResult = 
  | { success: true; payload: AuthPayload }
  | { success: false; response: NextResponse };

async function checkSessionValid(jti: string): Promise<boolean> {
  try {
    const session = await db.session.findUnique({ where: { tokenId: jti } });
    if (!session) return false;
    if (session.revokedAt) return false;
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) return false;
    return true;
  } catch {
    return true;
  }
}

/**
 * Verify admin authentication from headers injected by middleware.
 * Also checks that the JWT session has not been revoked or expired.
 */
export async function requireAdminAuth(request: NextRequest): Promise<AdminAuthResult> {
  const userId = request.headers.get('x-user-id');
  const role = request.headers.get('x-user-role');
  const email = request.headers.get('x-user-email') || '';
  const jti = request.headers.get('x-user-jti');

  if (!userId) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  if (!['admin', 'editor'].includes(role || '')) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  if (jti) {
    const valid = await checkSessionValid(jti);
    if (!valid) {
      return {
        success: false,
        response: NextResponse.json({ error: 'Session expired or revoked' }, { status: 401 }),
      };
    }
  }

  return {
    success: true,
    payload: { id: userId, email, role: role || 'customer' }
  };
}

/**
 * Verify user authentication from headers injected by middleware.
 * Also checks that the JWT session has not been revoked or expired.
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  const userId = request.headers.get('x-user-id');
  const role = request.headers.get('x-user-role') || 'customer';
  const email = request.headers.get('x-user-email') || '';
  const jti = request.headers.get('x-user-jti');

  if (!userId) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  if (jti) {
    const valid = await checkSessionValid(jti);
    if (!valid) {
      return {
        success: false,
        response: NextResponse.json({ error: 'Session expired or revoked' }, { status: 401 }),
      };
    }
  }

  return {
    success: true,
    payload: {
      userId,
      email,
      role,
    },
  };
}