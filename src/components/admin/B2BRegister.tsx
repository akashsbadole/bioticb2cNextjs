"use client";

import { useState } from "react";
import {
  ShoppingBag,
  ArrowLeft,
  Loader2,
  Building2,
  User,
  Mail,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface B2BRegisterProps {
  onNavigate: (page: string) => void;
}

export function B2BRegister({ onNavigate }: B2BRegisterProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    taxId: "",
    address: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSuccess(true);
        toast.success("Registration successful! Please wait for verification.");
      } else {
        const data = await res.json();
        toast.error(data.error || "Registration failed");
      }
    } catch {
      toast.error("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl">Registration Pending</CardTitle>
            <CardDescription>
              Thank you for registering your business with PurvaBites.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your account has been created and is now pending verification by
              our team. We will review your business details and notify you via
              email once your account is active.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => onNavigate("home")}>
              Return to Store
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 py-12 px-4">
      <div className="w-full max-w-xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => onNavigate("home")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Store
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mb-2">
              <Building2 className="h-6 w-6 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl">B2B Partner Registration</CardTitle>
            <CardDescription>
              Register your business for wholesale pricing and portal access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-600" />
                  Account Administrator
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Full Name</Label>
                    <Input
                      id="reg-name"
                      name="name"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Business Email</Label>
                    <Input
                      id="reg-email"
                      name="email"
                      type="email"
                      placeholder="john@company.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      name="password"
                      type="password"
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-confirm">Confirm Password</Label>
                    <Input
                      id="reg-confirm"
                      name="confirmPassword"
                      type="password"
                      placeholder="Repeat password"
                      value={form.confirmPassword}
                      onChange={(e) =>
                        setForm({ ...form, confirmPassword: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Business Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-emerald-600" />
                  Business Information
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="reg-company">Company Name</Label>
                    <Input
                      id="reg-company"
                      name="companyName"
                      placeholder="Acme Corporation"
                      value={form.companyName}
                      onChange={(e) =>
                        setForm({ ...form, companyName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-tax">
                      Tax ID / Business Registration
                    </Label>
                    <Input
                      id="reg-tax"
                      name="taxId"
                      placeholder="VAT/TIN/EIN"
                      value={form.taxId}
                      onChange={(e) =>
                        setForm({ ...form, taxId: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-address">Business Address</Label>
                  <Input
                    id="reg-address"
                    name="address"
                    placeholder="123 Business Avenue, Suite 100"
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Create Partner Account"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t bg-muted/20 py-4">
            <p className="text-xs text-center text-muted-foreground">
              By registering, you agree to our Terms of Service and Privacy
              Policy. All B2B accounts are subject to verification.
            </p>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center">
          <button
            onClick={() => (window.location.href = "/admin")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Already have an account? Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
