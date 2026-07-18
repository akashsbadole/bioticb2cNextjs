import { SignJWT, jwtVerify } from 'jose';

const secret = process.env.JWT_SECRET || process.env.AUTH_SECRET;
if (!secret) {
  throw new Error(
    'JWT_SECRET (or AUTH_SECRET) environment variable is not set. ' +
    'Set it to a random string of at least 32 characters before starting the server.'
  );
}

const JWT_SECRET = new TextEncoder().encode(secret);

export type TokenPayload = { userId: string; email: string; role: string; jti?: string };

export async function createToken(payload: TokenPayload) {
  const jti = payload.jti || crypto.randomUUID();
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
