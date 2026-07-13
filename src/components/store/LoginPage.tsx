"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";

const RecaptchaWidget = dynamic(() => import("./RecaptchaWidget").then((m) => m.RecaptchaWidget), { ssr: false });

type Mode = "password" | "otp";

export function LoginPage() {
  const { navigate, settings } = useAppStore();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [otpChannel, setOtpChannel] = useState<"email" | "sms">("email");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaKey, setRecaptchaKey] = useState(0);

  const finishLogin = async () => {
    window.location.href = "/account";
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[handlePassword] Starting login for:", email);
    if (settings?.recaptcha_site_key && !recaptchaToken) {
      console.log("[handlePassword] reCAPTCHA verification blocked");
      toast.error("Please complete the reCAPTCHA");
      return;
    }
    setLoading(true);
    try {
      console.log("[handlePassword] Calling NextAuth signIn...");
      const res = await signIn("credentials", { email, password, recaptchaToken, redirect: false });
      console.log("[handlePassword] signIn result:", res);
      if (!res || res.error) {
        console.error("[handlePassword] signIn failed:", res?.error);
        toast.error("Invalid email or password");
        return;
      }
      console.log("[handlePassword] signIn success, completing login...");
      toast.success("Welcome back!");
      await finishLogin();
    } catch (err) {
      console.error("[handlePassword] Catastrophic error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }
    if (settings?.recaptcha_site_key && !recaptchaToken) {
      toast.error("Please complete the reCAPTCHA");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/account/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, channel: otpChannel, recaptchaToken }),
      });
      const data = await res.json();
      if (!res.ok && data.error) {
        toast.error(data.error);
        return;
      }
      setOtpSent(true);
      if (data.devCode) {
        toast.info(`[DEV] Your OTP code is: ${data.devCode}`, { duration: 10000 });
      }
      toast.success("If that email exists, a code has been sent");
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("otp", { email, code, redirect: false });
      if (!res || res.error) {
        toast.error("Invalid or expired code");
        return;
      }
      toast.success("Welcome back!");
      await finishLogin();
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!email) {
      toast.error("Enter your email first to reset your password");
      return;
    }
    if (settings?.recaptcha_site_key && !recaptchaToken) {
      toast.error("Please complete the reCAPTCHA");
      return;
    }
    try {
      await fetch("/api/account/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, recaptchaToken }),
      });
      toast.success("If that email exists, a reset link has been sent");
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 max-w-md">
      <div className="rounded-[2rem] border shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-black">Sign In</h1>
          <p className="text-muted-foreground mt-1">Access your account and orders</p>
        </div>

        <div className="flex gap-2">
          <Button variant={mode === "password" ? "default" : "outline"} className="flex-1" onClick={() => setMode("password")}>Password</Button>
          <Button variant={mode === "otp" ? "default" : "outline"} className="flex-1" onClick={() => setMode("otp")}>OTP</Button>
        </div>

        {mode === "password" ? (
          <form onSubmit={handlePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 pl-10 rounded-xl" placeholder="you@example.com" required />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" onClick={handleForgot} className="text-xs font-medium text-primary hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 pl-10 rounded-xl" placeholder="••••••••" required />
              </div>
            </div>
            {settings?.recaptcha_site_key && (
              <RecaptchaWidget
                key={recaptchaKey}
                siteKey={settings.recaptcha_site_key}
                onVerify={setRecaptchaToken}
              />
            )}

            <Button type="submit" size="lg" className="w-full rounded-xl h-12 font-bold" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign In <ArrowRight className="h-4 w-4 ml-1" /></>}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 pl-10 rounded-xl" placeholder="you@example.com" required disabled={otpSent} />
              </div>
            </div>
            {!otpSent ? (
              <>
                <div className="space-y-2">
                  <Label>Receive OTP via</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={otpChannel === "email" ? "default" : "outline"}
                      className="flex-1 h-10 text-xs font-semibold rounded-lg"
                      onClick={() => setOtpChannel("email")}
                    >
                      Email
                    </Button>
                    <Button
                      type="button"
                      variant={otpChannel === "sms" ? "default" : "outline"}
                      className="flex-1 h-10 text-xs font-semibold rounded-lg"
                      onClick={() => setOtpChannel("sms")}
                    >
                      SMS
                    </Button>
                  </div>
                </div>
                {settings?.recaptcha_site_key && (
                  <RecaptchaWidget
                    key={recaptchaKey}
                    siteKey={settings.recaptcha_site_key}
                    onVerify={setRecaptchaToken}
                  />
                )}
                <Button onClick={handleRequestOtp} size="lg" className="w-full rounded-xl h-12 font-bold mt-2" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send code"}
                </Button>
              </>
            ) : (
              <form onSubmit={handleOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Verification code</Label>
                  <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} className="h-12 rounded-xl tracking-widest text-center" placeholder="123456" required />
                </div>
                <Button type="submit" size="lg" className="w-full rounded-xl h-12 font-bold" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Sign In"}
                </Button>
                <button type="button" onClick={() => setOtpSent(false)} className="text-xs font-medium text-primary hover:underline w-full">Use a different email</button>
              </form>
            )}
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <button onClick={() => navigate("register")} className="font-semibold text-primary hover:underline">Create one</button>
        </p>
      </div>
    </div>
  );
}
