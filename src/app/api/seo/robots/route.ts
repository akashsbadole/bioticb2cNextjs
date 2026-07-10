import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const settings = await db.siteSetting.findMany();
    const getSetting = (key: string) =>
      settings.find((s) => s.key === key)?.value || '';

    const siteUrl = getSetting('site_url') || 'https://example.com';
    const baseUrl = siteUrl.replace(/\/$/, '');

    const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/api/seo/sitemap
`;

    return new NextResponse(robotsTxt, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Robots error:', error);
    return NextResponse.json(
      { error: 'Failed to generate robots.txt' },
      { status: 500 }
    );
  }
}
