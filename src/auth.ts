import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authenticateUser, getUserById } from "@/lib/auth";
import { verifyOtp } from "@/lib/otp";
import type { AuthUser } from "@/lib/auth";

function toNextAuthUser(user: AuthUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" as const },
  pages: {
    signIn: "/admin",
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await authenticateUser(
          String(credentials.email),
          String(credentials.password),
        );
        if (!user) return null;
        return toNextAuthUser(user);
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
        if (!credentials?.email || !credentials?.code) return null;
        const user = await verifyOtp(
          String(credentials.email),
          String(credentials.code),
        );
        if (!user) return null;
        return toNextAuthUser(user);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export const { GET, POST } = handlers;

// Re-export for convenience where only user lookup is needed.
export { getUserById };
