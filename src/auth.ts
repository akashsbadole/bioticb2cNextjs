import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import type { NextAuthConfig } from "next-auth";

const config: NextAuthConfig = {
  ...authConfig,
  providers: [
    Credentials({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { authenticateUser } = await import("@/lib/auth");
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;
        const user = await authenticateUser(email, password);
        if (!user) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    Credentials({
      id: "otp",
      name: "Email / SMS OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        const { verifyOtp } = await import("@/lib/otp");
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const code = String(credentials?.code ?? "").trim();
        if (!email || !code) return null;
        const user = await verifyOtp(email, code);
        if (!user) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      const u = user as { id?: string; role?: string } | undefined;
      if (u?.id) {
        token.id = u.id;
        token.role = u.role ?? "customer";
      }
      // Keep role fresh from the database (Node runtime only).
      if (token.id) {
        try {
          const { getUserById } = await import("@/lib/auth");
          const dbUser = await getUserById(token.id as string);
          if (dbUser) {
            token.id = dbUser.id;
            token.role = (dbUser as { role?: string }).role ?? "customer";
          }
        } catch {
          /* ignore */
        }
      }
      return token;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);

export const { GET, POST } = handlers;
