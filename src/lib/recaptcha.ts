export async function verifyRecaptcha(token?: string): Promise<{ success: boolean }> {
  if (!token) return { success: false };

  let secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    try {
      const { db } = await import('@/lib/db');
      const setting = await (db as any).siteSetting.findFirst({ where: { key: 'recaptcha_secret_key' } });
      secretKey = setting?.value || undefined;
    } catch {
      return { success: false };
    }
  }

  if (!secretKey) return { success: false };

  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
    });
    const data = await res.json();
    return { success: data.success === true };
  } catch {
    return { success: false };
  }
}
