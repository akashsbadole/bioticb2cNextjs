import { compare, hash } from "bcryptjs";
import { db } from "./db";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isVerified?: boolean;
  avatar?: string | null;
  bio?: string | null;
  phone?: string | null;
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  const user = await db.user.findUnique({ where: { id } });
  if (!user || !user.isActive) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isVerified: user.isVerified,
    avatar: user.avatar,
    bio: user.bio,
    phone: user.phone,
  };
}

export { compare, hash };

/**
 * Validate email + password against the local user table.
 * Returns the user (without a password) or null.
 */
export async function authenticateUser(
  email: string,
  password: string,
): Promise<AuthUser | null> {
  const user = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user || !user.password) return null;

  const valid = await compare(password, user.password);
  if (!valid) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isVerified: user.isVerified,
    phone: user.phone,
  };
}

/**
 * Create a new customer/user. Password is hashed with bcrypt.
 */
export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  phone?: string | null;
  role?: string;
}): Promise<AuthUser> {
  const hashed = await hash(data.password, 10);
  const user = await db.user.create({
    data: {
      email: data.email.trim().toLowerCase(),
      password: hashed,
      name: data.name,
      phone: data.phone || null,
      role: data.role || "customer",
      isVerified: true,
    },
  });
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isVerified: user.isVerified,
    phone: user.phone,
  };
}
