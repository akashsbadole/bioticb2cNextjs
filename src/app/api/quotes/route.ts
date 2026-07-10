import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');

    const reqUserId = request.headers.get('x-user-id');
    const reqUserRole = request.headers.get('x-user-role');

    const where: any = {};

    if (reqUserRole === 'buyer') {
      const user = await db.user.findUnique({ where: { id: reqUserId || '' }, select: { companyId: true } });
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      where.OR = [
        { userId: reqUserId },
      ];
      if (user.companyId) {
        where.OR.push({ companyId: user.companyId });
      }
    } else {
      if (userId) where.userId = userId;
      if (companyId) where.companyId = companyId;
    }

    if (status) where.status = status;

    const quotes = await db.quote.findMany({
      where,
      include: {
        Enquiry: {
          include: { Product: true }
        },
        Company: true,
        User: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ quotes });
  } catch (error) {
    console.error('Get quotes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const role = request.headers.get('x-user-role');
    if (role !== 'admin' && role !== 'clerk') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { enquiryId, companyId, userId, items, totalAmount, notes, validUntil } = body;

    if (!userId || !totalAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const quote = await db.quote.create({
      data: {
        quoteNumber: `QT-${Date.now()}`,
        enquiryId,
        companyId,
        userId,
        items: JSON.stringify(items || []),
        totalAmount,
        subtotal: totalAmount,
        notes,
        validUntil: validUntil ? new Date(validUntil) : null,
        status: 'sent'
      }
    });

    // Update enquiry status if linked
    if (enquiryId) {
      await db.enquiry.update({
        where: { id: enquiryId },
        data: { status: 'replied' }
      });
    }

    return NextResponse.json({ quote }, { status: 201 });
  } catch (error) {
    console.error('Create quote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
