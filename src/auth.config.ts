import type { NextAuthConfig } from "next-auth";

// Edge-safe auth configuration used by the middleware.
// MUST NOT import any Node.js-only modules (Prisma, crypto, bcrypt, etc.)
// and must NOT define providers that reference them.
export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  // Empty providers array keeps this config edge-safe (no Node-only modules).
  // The full set of providers is added in ./auth.ts (Node runtime only).
  providers: [],
  pages: {
    signIn: "/admin",
    error: "/admin",
  },
  callbacks: {
    async jwt({ token, user }) {
      const u = user as { id?: string; role?: string } | undefined;
      if (u?.id) {
        token.id = u.id;
        token.role = u.role ?? "customer";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "customer";
        session.user.name = (token.name as string) || "";
        session.user.email = (token.email as string) || "";
      }
      return session;
    },
  },
};
