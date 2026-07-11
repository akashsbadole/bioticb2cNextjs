"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AdminLoginProps {
  onLogin?: (user: AdminUser, token?: string) => void;
  onNavigate?: (page: string, data?: unknown) => void;
}

export function AdminLogin({ onLogin, onNavigate }: AdminLoginProps) {
  const router = useRouter();
  const [email, setEmail] = useState("admin@store.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error || "Invalid email or password");
        setLoading(false);
        return;
      }

      // Fetch the current session user to hand off to the SPA shell.
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      const user = session?.user as AdminUser | undefined;

      if (onLogin && user) {
        onLogin({
          id: user.id,
          email: user.email,
          name: user.name ?? "",
          role: user.role ?? "admin",
        });
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Admin login error:", err);
      toast.error("Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <LogIn className="h-6 w-6 text-emerald-600" />
          </div>
          <h1 className="text-xl font-semibold">Admin Sign In</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Access the WCommerce admin dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="admin@store.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign In
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Storefront?{" "}
          <button
            type="button"
            className="text-emerald-600 hover:underline"
            onClick={() => onNavigate ? onNavigate("home") : router.push("/")}
          >
            Go to store
          </button>
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
