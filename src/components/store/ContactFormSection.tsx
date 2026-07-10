"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ContactFormSection({
  title = "Contact Us",
  subtitle = "Have a question or need assistance? Fill out the form and we'll get back to you.",
  submitText = "Send Enquiry",
  successMessage = "Enquiry submitted! We'll get back to you shortly.",
}: {
  title?: string;
  subtitle?: string;
  submitText?: string;
  successMessage?: string;
}) {
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone") || null,
          companyName: formData.get("company") || null,
          message: formData.get("message") || "",
          subject: formData.get("subject") || "Contact form enquiry",
          type: "contact",
        }),
      });
      if (res.ok) {
        toast.success(successMessage || "Enquiry submitted! We'll get back to you shortly.");
        form.reset();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to submit. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="py-16 px-4 bg-background">
      <div className="container mx-auto max-w-2xl">
        {title && (
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-muted-foreground text-center mb-8 text-sm">
            {subtitle}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cf-name">Name *</Label>
              <Input id="cf-name" name="name" required placeholder="Your name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cf-email">Email *</Label>
              <Input id="cf-email" name="email" type="email" required placeholder="Your email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cf-phone">Phone</Label>
              <Input id="cf-phone" name="phone" type="tel" placeholder="Phone number" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cf-company">Company</Label>
              <Input id="cf-company" name="company" placeholder="Company name" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cf-message">Message *</Label>
            <Textarea id="cf-message" name="message" required rows={4} placeholder="Tell us about your requirement..." />
          </div>
          <div className="flex justify-center pt-2">
            <Button type="submit" size="lg" disabled={sending}>
              {sending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {submitText || "Send Enquiry"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
