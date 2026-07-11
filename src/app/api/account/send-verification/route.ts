import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { sendEmail, getSiteSettings } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      // Don't reveal whether user exists
      return NextResponse.json({ success: true });
    }

    if (user.isVerified) {
      return NextResponse.json({ success: true, message: 'Email already verified' });
    }

    // Invalidate any existing tokens for this user
    await db.emailVerificationToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Create new verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.emailVerificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Send verification email
    const emailSettings = await getSiteSettings();
    const siteName = emailSettings('site_name') || 'Store';
    const siteUrl = emailSettings('seo_canonical_url') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const verifyUrl = `${siteUrl}/auth/verify-email?token=${token}`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #059669;">Verify your email address</h1>
        <p>Hi ${user.name || 'there'},</p>
        <p>Thank you for registering with ${siteName}. Please verify your email address by clicking the button below:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Verify Email Address</a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">This link will expire in 24 hours.</p>
        <p style="color: #6b7280; font-size: 14px;">If you did not create an account, you can safely ignore this email.</p>
      </div>
    `;

    await sendEmail(user.email, `Verify your email - ${siteName}`, html);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
