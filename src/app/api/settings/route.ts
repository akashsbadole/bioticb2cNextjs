import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { requireAdminAuth } from '@/lib/admin-auth';

// Settings keys that should never be exposed to the public
const SENSITIVE_KEYS = [
  'smtp_pass', 'smtp_user', 'smtp_host', 'smtp_port',
  'jwt_secret', 'payment_razorpay_key_secret',
  'smtp_password', 'api_key', 'secret_key', 'access_token', 'private_key',
];

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;
    const settings = await db.siteSetting.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }
    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const body = await request.json();
    const { settings } = body as { settings: Record<string, string> };

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Settings object is required' },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      Object.entries(settings).map(async ([key, value]) => {
        const existing = await db.siteSetting.findFirst({ where: { storeId: null, key } });
        if (existing) {
          return db.siteSetting.update({ where: { id: existing.id }, data: { value: value as string } });
        }
        return db.siteSetting.create({ data: { key, value: value as string } });
      })
    );

    return NextResponse.json({ settings: results });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const settings = await db.siteSetting.findMany();
    const getSetting = (key: string) =>
      settings.find((s) => s.key === key)?.value || '';

    const siteEmail = getSetting('site_email') || getSetting('email_from') || 'admin@store.com';
    const siteName = getSetting('site_name') || 'Store';

    const success = await sendEmail(
      siteEmail,
      `Test Email from ${siteName}`,
      `<h2>Test Email</h2><p>This is a test email from <strong>${siteName}</strong>. Your SMTP settings are working correctly.</p>`
    );

    if (success) {
      return NextResponse.json({ message: 'Test email sent successfully' });
    } else {
      return NextResponse.json(
        { error: 'Failed to send test email. Check SMTP settings.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
