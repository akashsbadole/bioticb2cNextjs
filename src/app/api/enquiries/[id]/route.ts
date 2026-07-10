import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;
    const { id } = await params;
    const body = await request.json();

    const existing = await db.enquiry.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Enquiry not found' },
        { status: 404 }
      );
    }

    const validStatuses = ['new', 'contacted', 'in_progress', 'resolved', 'closed'];
    
    const enquiry = await db.enquiry.update({
      where: { id },
      data: {
        ...(body.status !== undefined && {
          status: validStatuses.includes(body.status) ? body.status : existing.status
        }),
        ...(body.name !== undefined && { name: body.name }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.phone !== undefined && {
          phone: body.phone || null,
        }),
        ...(body.companyName !== undefined && {
          companyName: body.companyName || null,
        }),
        ...(body.companyEmail !== undefined && {
          companyEmail: body.companyEmail || null,
        }),
        ...(body.companyPhone !== undefined && {
          companyPhone: body.companyPhone || null,
        }),
        ...(body.companyAddress !== undefined && {
          companyAddress: body.companyAddress || null,
        }),
        ...(body.quantity !== undefined && {
          quantity: body.quantity ?? null,
        }),
        ...(body.subject !== undefined && { subject: body.subject }),
        ...(body.message !== undefined && { message: body.message }),
      },
    });

    return NextResponse.json({ enquiry });
  } catch (error) {
    console.error('Update enquiry error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;
    const { id } = await params;

    const existing = await db.enquiry.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Enquiry not found' },
        { status: 404 }
      );
    }

    await db.enquiry.delete({ where: { id } });

    return NextResponse.json({ message: 'Enquiry deleted successfully' });
  } catch (error) {
    console.error('Delete enquiry error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
