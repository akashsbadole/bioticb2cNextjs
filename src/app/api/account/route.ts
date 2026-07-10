import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolveUserId } from '@/lib/auth-helpers';
import { hash, compare } from '@/lib/auth';

// GET /api/account - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        phone: true,
        avatar: true,
        isVerified: true,
        tier: true,
        createdAt: true,
        Company: {
          select: {
            name: true,
            taxId: true,
            address: true,
          },
        },
        _count: {
          select: {
            Quote: true,
            Enquiry: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { Company, ...rest } = user;
    return NextResponse.json({
      user: {
        ...rest,
        companyName: Company?.name || null,
        taxId: Company?.taxId || null,
        businessAddress: Company?.address || null,
      },
    });
  } catch (error) {
    console.error('Account GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/account - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, companyName, taxId, businessAddress, currentPassword, newPassword } = body;

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;

    // Update company fields via Company relation
    if (companyName !== undefined || taxId !== undefined || businessAddress !== undefined) {
      const userWithCompany = await db.user.findUnique({
        where: { id: userId },
        select: { companyId: true },
      });

      if (userWithCompany?.companyId) {
        const companyUpdate: Record<string, unknown> = {};
        if (companyName !== undefined) companyUpdate.name = companyName;
        if (taxId !== undefined) companyUpdate.taxId = taxId;
        if (businessAddress !== undefined) companyUpdate.address = businessAddress;
        await db.company.update({
          where: { id: userWithCompany.companyId },
          data: companyUpdate,
        });
      } else if (companyName !== undefined) {
        // Create a new company for this user
        const newCompany = await db.company.create({
          data: { name: companyName, taxId: taxId || null, address: businessAddress || null },
        });
        updateData.companyId = newCompany.id;
      }
    }

    // Password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
      }
      if (!user.password) {
        return NextResponse.json({ error: 'No password set on this account' }, { status: 400 });
      }
      const isValid = await compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }
      if (newPassword.length < 8) {
        return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
      }
      updateData.password = await hash(newPassword, 12);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        isVerified: true,
        tier: true,
        Company: {
          select: {
            name: true,
            taxId: true,
            address: true,
          },
        },
      },
    });

    const { Company: updatedCompany, ...restUser } = updatedUser;
    return NextResponse.json({
      user: {
        ...restUser,
        companyName: updatedCompany?.name || null,
        taxId: updatedCompany?.taxId || null,
        businessAddress: updatedCompany?.address || null,
      },
      message: 'Profile updated',
    });
  } catch (error) {
    console.error('Account PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
