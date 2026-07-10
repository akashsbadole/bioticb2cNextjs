import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  companyName: z.string().min(1, 'Company name is required'),
  taxId: z.string().min(1, 'Tax ID is required'),
  address: z.string().min(1, 'Address is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, companyName, taxId, address } = result.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 12);

    // Use a transaction to create Company and User
    const user = await db.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: companyName,
          taxId,
          address,
          isVerified: false,
          tier: 'standard',
        },
      });

      return tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          role: 'buyer',
          isActive: true, // User can log in, but might be restricted if company not verified
          isVerified: false,
          companyId: company.id,
          tier: 'standard',
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
