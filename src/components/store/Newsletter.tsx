"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const subscribeMutation = useMutation({
    mutationFn: async (email: string) => {
        const res = await fetch("/api/newsletter/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
        setSubscribed(true);
        toast.success("Successfully subscribed!");
    },
    onError: () => toast.error("Subscription failed")
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribeMutation.mutate(email);
  };

  if (subscribed) {
    return (
        <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100">
            <CheckCircle2 className="h-5 w-5" />
            <span>Thank you for subscribing!</span>
        </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h3 className="font-bold text-lg">Newsletter</h3>
        <p className="text-sm text-muted-foreground">Get updates on new products and special offers.</p>
      </div>
      <form onSubmit={handleSubscribe} className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Enter your email"
            className="pl-10 h-11 rounded-xl bg-muted/50 border-transparent focus:bg-background"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" size="lg" className="rounded-xl px-6 h-11 font-bold" disabled={subscribeMutation.isPending}>
          {subscribeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join"}
        </Button>
      </form>
    </div>
  );
}
