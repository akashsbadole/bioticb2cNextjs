import { SignJWT, jwtVerify } from 'jose';
import { randomUUID } from 'crypto';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.AUTH_SECRET || "change-me-to-a-random-64-char-string-for-security-hardening-12345678"
);

export type TokenPayload = { userId: string; email: string; role: string; jti?: string };

export async function createToken(payload: TokenPayload) {
  const jti = payload.jti || randomUUID();
  return await new SignJWT({ ...payload, jti })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as TokenPayload;
  } catch {
    return null;
  }
}
