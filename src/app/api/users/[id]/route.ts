import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;
    const { id } = await params;
    const user = await db.user.findFirst({
      where: {
        OR: [
          { id },
          { clerkId: id },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        avatar: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { Enquiry: true, BlogPost: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');
    const body = await request.json();
    const { name, email, role, isActive, password, bio, avatar } = body;

    // Check user exists
    const existing = await db.user.findFirst({
      where: {
        OR: [
          { id },
          { clerkId: id },
        ],
      },
    });
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const data: Record<string, unknown> = {};

    if (name !== undefined) data.name = name.trim();
    if (email !== undefined) {
      const trimmedEmail = email.trim().toLowerCase();
      // Check email uniqueness if changing
      if (trimmedEmail !== existing.email) {
        const emailExists = await db.user.findUnique({ where: { email: trimmedEmail } });
        if (emailExists) {
          return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
        }
      }
      data.email = trimmedEmail;
    }
    if (role !== undefined) {
      // Only allow admin or clerk roles
      const userRole = request.headers.get('x-user-role');
      if (userRole !== 'admin') {
        return NextResponse.json({ error: 'Only admins can change user roles' }, { status: 403 });
      }
      if (!['admin', 'clerk', 'editor'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role. Must be admin, clerk, or editor' }, { status: 400 });
      }
      data.role = role;
    }
    if (isActive !== undefined) data.isActive = isActive;
    if (body.isVerified !== undefined) data.isVerified = body.isVerified;
    if (body.tier !== undefined) data.tier = body.tier;
    if (body.companyId !== undefined) data.companyId = body.companyId;
    if (bio !== undefined) data.bio = bio;
    if (avatar !== undefined) data.avatar = avatar;

    // Handle password change
    if (password !== undefined && password !== '') {
      const { hash } = await import('bcryptjs');
      data.password = await hash(password, 12);
    }

    const user = await db.user.update({
      where: { id: existing.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        avatar: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');

    // Prevent self-deletion
    if (id === userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const user = await db.user.findFirst({
      where: {
        OR: [
          { id },
          { clerkId: id },
        ],
      },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await db.user.delete({ where: { id: user.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
