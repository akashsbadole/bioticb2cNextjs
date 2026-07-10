import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const reqUserId = request.headers.get('x-user-id');
    const reqUserRole = request.headers.get('x-user-role');

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const tier = searchParams.get('tier');
    const verified = searchParams.get('verified');

    const where: any = {};

    if (reqUserRole === 'buyer') {
      const user = await db.user.findUnique({ where: { id: reqUserId || '' }, select: { companyId: true } });
      if (!user || !user.companyId) {
        return NextResponse.json({ companies: [] });
      }
      where.id = user.companyId;
    } else if (reqUserRole === 'admin' || reqUserRole === 'clerk') {
      if (search) {
        where.name = { contains: search, mode: 'insensitive' };
      }
      if (tier) {
        where.tier = tier;
      }
      if (verified !== null && verified !== undefined && verified !== '') {
        where.isVerified = verified === 'true';
      }
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const companies = await db.company.findMany({
      where,
      include: {
        _count: {
          select: { User: true, Enquiry: true, Quote: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ companies });
  } catch (error) {
    console.error('Get companies error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
