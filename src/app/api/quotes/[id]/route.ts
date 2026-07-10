import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const reqUserId = request.headers.get('x-user-id');
    const reqUserRole = request.headers.get('x-user-role');
    const { id } = await params;

    const quote = await db.quote.findUnique({
      where: { id },
      include: {
        Enquiry: {
          include: { Product: true }
        },
        Company: true,
        User: { select: { id: true, name: true, email: true } }
      }
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Authorization: Buyers can only see their own quotes or their company's quotes
    if (reqUserRole === 'buyer') {
      const user = await db.user.findUnique({ where: { id: reqUserId || '' }, select: { companyId: true } });
      if (!user || (quote.userId !== reqUserId && quote.companyId !== user.companyId)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json({ quote });
  } catch (error) {
    console.error('Get quote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const reqUserId = request.headers.get('x-user-id');
    const reqUserRole = request.headers.get('x-user-role');
    const { id } = await params;
    const body = await request.json();
    const { status, items, totalAmount, notes, validUntil } = body;

    const quote = await db.quote.findUnique({ where: { id } });
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const data: any = {};

    if (reqUserRole === 'buyer') {
      // Buyers can only accept or decline their own/company quotes
      const user = await db.user.findUnique({ where: { id: reqUserId || '' }, select: { companyId: true } });
      if (!user || (quote.userId !== reqUserId && quote.companyId !== user.companyId)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      if (status && (status === 'accepted' || status === 'declined')) {
        data.status = status;
      } else {
        return NextResponse.json({ error: 'Buyers can only update status to accepted or declined' }, { status: 403 });
      }
    } else if (reqUserRole === 'admin' || reqUserRole === 'clerk') {
      if (status) data.status = status;
      if (items) data.items = JSON.stringify(items);
      if (totalAmount !== undefined) data.totalAmount = totalAmount;
      if (notes !== undefined) data.notes = notes;
      if (validUntil) data.validUntil = new Date(validUntil);
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedQuote = await db.quote.update({
      where: { id },
      data
    });

    return NextResponse.json({ quote: updatedQuote });
  } catch (error) {
    console.error('Update quote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const reqUserRole = request.headers.get('x-user-role');
    if (reqUserRole !== 'admin' && reqUserRole !== 'clerk') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { id } = await params;
    await db.quote.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete quote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
