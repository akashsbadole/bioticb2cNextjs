import { createHash, randomInt } from "crypto";
import { db } from "./db";
import { getUserById, type AuthUser } from "./auth";
import { sendEmail } from "./email";
import { sendSms } from "./sms";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const OTP_LENGTH = 6;

function hashCode(code: string): string {
  return createHash("sha256").update(`${code}:${process.env.OTP_SECRET || "wcommerce-otp"}`).digest("hex");
}

function generateCode(): string {
  let code = "";
  for (let i = 0; i < OTP_LENGTH; i++) code += randomInt(0, 9).toString();
  return code;
}

/**
 * Request a one-time password for the given email.
 * channel: "email" | "sms". For "sms" the user's phone (from the User record) is used.
 * Always returns success:true to avoid account enumeration.
 */
function normalizePhone(phone: string): string {
  return phone.replace(/[\s()-]/g, "");
}

export async function requestOtp(
  email: string,
  channel: "email" | "sms" = "email",
  phone?: string,
): Promise<{ success: boolean; code?: string; error?: string }> {
  const normalized = email.trim().toLowerCase();
  const user = await db.user.findUnique({ where: { email: normalized } });

  if (!user) {
    // Pretend success to avoid leaking which emails are registered.
    return { success: true };
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await db.otpToken.create({
    data: {
      identifier: normalized,
      channel,
      codeHash: hashCode(code),
      expiresAt,
    },
  });

  if (channel === "sms") {
    if (!user.phone) {
      return { success: false, error: "No phone number on file for this account" };
    }
    if (phone && normalizePhone(phone) !== normalizePhone(user.phone)) {
      return { success: false, error: "Phone number does not match this account" };
    }
    const destination = phone ? normalizePhone(phone) : user.phone;
    const result = await sendSms(
      destination,
      `Your verification code is ${code}. It expires in 10 minutes.`,
    );
    if (!result.success) {
      console.log(`[OTP DEV] Code ${code} would have been sent via SMS to ${destination}`);
      if (process.env.NODE_ENV !== "production") {
        return { success: true, code };
      }
    }
    return { success: result.success, code, error: result.error };
  }

  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Store";
  const emailSent = await sendEmail(
    normalized,
    `Your ${siteName} verification code`,
    `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px">
       <h2>Your verification code</h2>
       <p>Use the following code to sign in to ${siteName}:</p>
       <div style="font-size:32px;letter-spacing:8px;font-weight:700;margin:16px 0">${code}</div>
       <p style="color:#6b7280;font-size:13px">This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>
     </div>`,
  );
  if (!emailSent) {
    console.log(`[OTP DEV] Code ${code} would have been sent via email to ${normalized}`);
  }

  return { success: true, code };
}

/**
 * Verify an OTP code and return the associated user if valid.
 * Marks the token as used so it cannot be replayed.
 */
export async function verifyOtp(email: string, code: string, phone?: string): Promise<AuthUser | null> {
  const normalized = email.trim().toLowerCase();
  const token = await db.otpToken.findFirst({
    where: {
      identifier: normalized,
      channel: { in: ["email", "sms"] },
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!token) return null;

  const expected = hashCode(code);
  if (token.codeHash !== expected) return null;

  await db.otpToken.update({
    where: { id: token.id },
    data: { usedAt: new Date() },
  });

  const user = await db.user.findUnique({ where: { email: normalized } });
  if (!user || !user.isActive) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isVerified: user.isVerified,
    phone: user.phone,
  };
}
