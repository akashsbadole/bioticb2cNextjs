import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';

// Settings keys that should never be exposed to the public
const SENSITIVE_KEYS = [
  'smtp_pass', 'smtp_user', 'smtp_host', 'smtp_port',
  'jwt_secret', 'payment_razorpay_key_secret',
  'smtp_password', 'api_key', 'secret_key', 'access_token', 'private_key',
];

export async function GET(request: NextRequest) {
  try {
    const storeId = getStoreId(request);

    const settings = await db.siteSetting.findMany({
      where: storeId ? { OR: [{ storeId }, { storeId: null }] } : { storeId: null },
    });

    const settingsMap: Record<string, string> = {};

    // Apply global first
    for (const s of settings) {
      if (s.storeId === null) {
        if (!SENSITIVE_KEYS.some((sk) => s.key.toLowerCase().includes(sk))) {
          settingsMap[s.key] = s.value;
        }
      }
    }

    // Override with store-specific
    if (storeId) {
      for (const s of settings) {
        if (s.storeId === storeId) {
          if (!SENSITIVE_KEYS.some((sk) => s.key.toLowerCase().includes(sk))) {
            settingsMap[s.key] = s.value;
          }
        }
      }
    }

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error('Get public settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
