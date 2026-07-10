import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

// PUT /api/admin/quotes/[id] - Admin can update status, adminNotes, pricing
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;
    const body = await request.json();
    const { status, adminNotes, discount, tax } = body;

    const quote = await db.quote.findUnique({
      where: { id },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const allowedStatuses = ['draft', 'sent', 'approved', 'rejected', 'converted'];
    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (discount !== undefined) {
      updateData.discount = discount;
      updateData.total = quote.subtotal - discount + (tax !== undefined ? tax : quote.tax);
    }
    if (tax !== undefined) {
      updateData.tax = tax;
      updateData.total = quote.subtotal - (discount !== undefined ? discount : quote.discount) + tax;
    }

    const updatedQuote = await db.quote.update({
      where: { id },
      data: updateData,
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        Company: true,
      },
    });

    return NextResponse.json({
      quote: updatedQuote,
      message: 'Quote updated successfully',
    });
  } catch (error) {
    console.error('Admin Quote PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
