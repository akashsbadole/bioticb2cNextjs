import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { logActivity } from '@/lib/activity-log';
import { loginSchema } from '@/lib/validations';

// Max 5 login attempts per 15 minutes per IP
const LOGIN_RATE_LIMIT = { maxRequests: 5, windowMs: 15 * 60 * 1000, prefix: 'auth-login' };

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(request, LOGIN_RATE_LIMIT);
    if (rateLimitResponse) return rateLimitResponse;
    const body = await request.json();

    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { email, password } = result.data;

    const authResult = await authenticateUser(email, password);

    if (!authResult) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Log successful login
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
    logActivity({
      action: 'user.login',
      entity: 'User',
      entityId: authResult.user.id,
      userId: authResult.user.id,
      userName: authResult.user.name,
      ipAddress,
      details: { email: authResult.user.email, role: authResult.user.role },
    }).catch(() => {});

    const response = NextResponse.json(authResult);
    response.cookies.set('admin_token', authResult.token, {
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
