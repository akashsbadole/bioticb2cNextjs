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

    // Authorization: Buyers can only see their own company
    if (reqUserRole === 'buyer') {
      const user = await db.user.findUnique({ where: { id: reqUserId || '' }, select: { companyId: true } });
      if (!user || user.companyId !== id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const company = await db.company.findUnique({
      where: { id },
      include: {
        User: {
          select: { id: true, name: true, email: true, role: true, isVerified: true }
        },
        Enquiry: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        Quote: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({ company });
  } catch (error) {
    console.error('Get company error:', error);
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
    const { name, taxId, address, website, isVerified, tier } = body;

    // Authorization: only admin/clerk can update company via this endpoint
    // Buyers should use a profile update endpoint if they need to change their info
    if (reqUserRole !== 'admin' && reqUserRole !== 'clerk') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const company = await db.$transaction(async (tx) => {
      const updated = await tx.company.update({
        where: { id },
        data: {
          name,
          taxId,
          address,
          website,
          isVerified,
          tier
        }
      });

      // If company verification status changed, sync with users
      if (isVerified !== undefined) {
        await tx.user.updateMany({
          where: { companyId: id },
          data: { isVerified }
        });
      }

      // Sync tier with users as well
      if (tier) {
         await tx.user.updateMany({
          where: { companyId: id },
          data: { tier }
        });
      }

      return updated;
    });

    return NextResponse.json({ company });
  } catch (error) {
    console.error('Update company error:', error);
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
    await db.company.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete company error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
