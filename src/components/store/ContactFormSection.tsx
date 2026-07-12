"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";

const RecaptchaWidget = dynamic(() => import("./RecaptchaWidget").then((m) => m.RecaptchaWidget), { ssr: false });
import { useAppStore } from "@/lib/store";

interface ContactFormSectionProps {
  title: string;
  subtitle: string;
}

export function ContactFormSection({ title, subtitle }: ContactFormSectionProps) {
  const settings = useAppStore((s) => s.settings);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaKey, setRecaptchaKey] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (settings?.recaptcha_site_key && !recaptchaToken) {
      toast.error("Please complete the reCAPTCHA");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, recaptchaToken }),
      });
      if (res.ok) {
        toast.success("Message sent! We'll get back to you within 24 hours.");
        setForm({ name: "", email: "", phone: "", subject: "", message: "" });
        setRecaptchaToken(null);
        setRecaptchaKey((k) => k + 1);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to send message");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact-form" className="py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground mb-8">{subtitle}</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cf-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input id="cf-name" name="name" required value={form.name} onChange={handleChange} placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cf-email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input id="cf-email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cf-phone">Phone (optional)</Label>
            <Input id="cf-phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91 9876543210" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cf-subject">
              Subject <span className="text-destructive">*</span>
            </Label>
            <Input id="cf-subject" name="subject" required value={form.subject} onChange={handleChange} placeholder="What is this regarding?" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cf-message">
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea id="cf-message" name="message" required rows={5} value={form.message} onChange={handleChange} placeholder="Tell us more about your requirement..." />
          </div>

          {settings?.recaptcha_site_key && (
            <RecaptchaWidget
              key={recaptchaKey}
              siteKey={settings.recaptcha_site_key}
              onVerify={setRecaptchaToken}
            />
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send Message
          </Button>
        </form>
      </div>
    </section>
  );
}
