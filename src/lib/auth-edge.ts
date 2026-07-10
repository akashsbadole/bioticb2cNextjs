import { jwtVerify } from 'jose';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

let _jwtSecret: Uint8Array | null = null;
let _lastEnvValue: string | undefined;

function getJwtSecret(): Uint8Array {
  const currentEnv = process.env.JWT_SECRET;
  if (_jwtSecret && _lastEnvValue !== currentEnv) {
    _jwtSecret = null;
  }
  _lastEnvValue = currentEnv;

  if (!_jwtSecret) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('[auth-edge] JWT_SECRET is not set in environment');
      throw new Error('JWT_SECRET environment variable is not set. Generate one with: openssl rand -hex 32');
    }
    _jwtSecret = new TextEncoder().encode(secret);
    console.log('[auth-edge] JWT_SECRET loaded, length:', _jwtSecret.length);
  }
  return _jwtSecret;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    if (!token || token.split('.').length !== 3) {
      return null;
    }
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}
