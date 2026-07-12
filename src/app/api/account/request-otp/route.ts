import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requestOtp } from "@/lib/otp";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyRecaptcha } from "@/lib/recaptcha";

const OTP_RATE_LIMIT = { maxRequests: 5, windowMs: 15 * 60 * 1000, prefix: "otp-request" };

const schema = z.object({
  email: z.string().email(),
  channel: z.enum(["email", "sms"]).default("email"),
  recaptchaToken: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const rateLimitResponse = await checkRateLimit(request, OTP_RATE_LIMIT);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Verify reCAPTCHA if a token was provided
    if (parsed.data.recaptchaToken) {
      const recaptchaResult = await verifyRecaptcha(parsed.data.recaptchaToken);
      if (!recaptchaResult.success) {
        return NextResponse.json({ error: "reCAPTCHA verification failed" }, { status: 400 });
      }
    }

    const result = await requestOtp(parsed.data.email, parsed.data.channel);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
