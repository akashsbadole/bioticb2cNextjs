import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { getGlobalSetting } from '@/lib/settings';
import { checkRateLimit } from '@/lib/rate-limit';

const RESET_RATE_LIMIT = { maxRequests: 5, windowMs: 15 * 60 * 1000, prefix: 'forgot-password-post' };

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request, RESET_RATE_LIMIT);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (user && user.isActive) {
      const token = crypto.randomBytes(32).toString('hex');

      await db.passwordResetToken.deleteMany({
        where: {
          userId: user.id,
          usedAt: null,
        },
      });

      await db.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const resetUrl = `${siteUrl}/reset-password?token=${token}`;

      const siteNameValue = await getGlobalSetting('site_name');
      const brandName = siteNameValue || 'Your Store';

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p style="color: #555; line-height: 1.6;">
            Click the button below to reset your password. This link will expire in 1 hour.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Reset Password
            </a>
          </div>
        </div>
      `;

      await sendEmail(user.email, `Reset your ${brandName} password`, html);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ success: true });
  }
}
