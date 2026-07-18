import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/admin-auth';
import { db } from '@/lib/db';
import { hash, compare } from '@/lib/auth';
import { passwordSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Both current and new passwords are required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: auth.payload.userId } });
    if (!user || !user.password) {
      return NextResponse.json({ error: 'User or password not found' }, { status: 404 });
    }

    const isValid = await compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
    }

    const passwordCheck = passwordSchema.safeParse(newPassword);
    if (!passwordCheck.success) {
      return NextResponse.json(
        { error: 'New password is too weak', details: passwordCheck.error.issues.map((i) => i.message) },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(newPassword, 12);
    await db.user.update({
      where: { id: auth.payload.userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
