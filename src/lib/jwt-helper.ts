import { SignJWT, jwtVerify } from 'jose';

// Resolve the secret lazily (inside the functions) rather than at module load.
// This keeps the module safe to import from the Edge runtime (middleware): the
// Edge bundle is evaluated at build time, where env vars may not yet be present,
// so a top-level `throw` would break the entire middleware chain on Vercel.
let cachedSecret: Uint8Array | null = null;

function getSecret(): Uint8Array {
  if (cachedSecret) return cachedSecret;
  const secret = process.env.JWT_SECRET || process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      'JWT_SECRET (or AUTH_SECRET) environment variable is not set. ' +
      'Set it to a random string of at least 32 characters before starting the server.'
    );
  }
  cachedSecret = new TextEncoder().encode(secret);
  return cachedSecret;
}

export type TokenPayload = { userId: string; email: string; role: string; jti: string };

export async function createToken(payload: TokenPayload) {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as TokenPayload;
  } catch {
    return null;
  }
}
