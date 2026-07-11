import twilio from "twilio";

interface SmsResult {
  success: boolean;
  error?: string;
}

/**
 * Send an SMS via Twilio. Returns success=false (without throwing) when
 * Twilio credentials are not configured so the app keeps working in dev.
 */
export async function sendSms(to: string, body: string): Promise<SmsResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !from) {
    console.warn(
      "[sms] Twilio is not configured (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_PHONE_NUMBER). Skipping SMS send.",
    );
    return { success: false, error: "SMS provider not configured" };
  }

  try {
    const client = twilio(accountSid, authToken);
    await client.messages.create({ to, from, body });
    return { success: true };
  } catch (error) {
    console.error("[sms] Failed to send SMS:", error);
    return { success: false, error: "Failed to send SMS" };
  }
}
