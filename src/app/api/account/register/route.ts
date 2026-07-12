import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyRecaptcha } from "@/lib/recaptcha";

const REGISTER_RATE_LIMIT = { maxRequests: 5, windowMs: 60 * 60 * 1000, prefix: "auth-register" };

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  phone: z.string().optional(),
  recaptchaToken: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const rateLimitResponse = await checkRateLimit(request, REGISTER_RATE_LIMIT);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { name, email, password, phone, recaptchaToken } = parsed.data;

    // Verify reCAPTCHA if a token was provided
    if (recaptchaToken) {
      const recaptchaResult = await verifyRecaptcha(recaptchaToken);
      if (!recaptchaResult.success) {
        return NextResponse.json({ error: "reCAPTCHA verification failed" }, { status: 400 });
      }
    }
    const normalized = email.trim().toLowerCase();

    const existing = await db.user.findUnique({ where: { email: normalized } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const user = await createUser({ name, email: normalized, password, phone: phone || null });

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
