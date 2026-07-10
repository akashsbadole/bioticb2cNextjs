/**
 * Admin authentication middleware for API routes.
 * Uses headers injected by clerkMiddleware.
 */

import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

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

/**
 * Verify admin authentication from headers injected by middleware.
 */
export async function requireAdminAuth(request: NextRequest): Promise<AdminAuthResult> {
  const userId = request.headers.get('x-user-id');
  const role = request.headers.get('x-user-role');
  const email = request.headers.get('x-user-email') || '';

  if (!userId) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  if (!['admin', 'editor', 'clerk'].includes(role || '')) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return {
    success: true,
    payload: { id: userId, email, role: role || 'clerk' }
  };
}

/**
 * Verify user authentication from headers injected by middleware.
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  const userId = request.headers.get('x-user-id');
  const role = request.headers.get('x-user-role') || 'customer';
  const email = request.headers.get('x-user-email') || '';

  if (!userId) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
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
