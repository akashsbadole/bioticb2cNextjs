"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAppStore } from "@/lib/store";

export function GlobalEnquiryModal() {
  const { enquiryModal, closeEnquiryModal } = useAppStore();
  const { open, productName, productId } = enquiryModal;

  const [submitting, setSubmitting] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    source: "",
  });

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      message: productName
        ? `I'm interested in ${productName}. Please provide more information.`
        : "",
      source: "",
    });
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      closeEnquiryModal();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.phone) {
      toast.error("Please fill in your name and phone number");
      return;
    }

    setSubmitting(true);
    try {
      const subject = productName
        ? `Enquiry about ${productName}`
        : `Product Enquiry`;

      const message = [
        form.source ? `Source: ${form.source}` : "",
        form.message,
      ]
        .filter(Boolean)
        .join("\n");

      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email || null,
          phone: `${countryCode} ${form.phone}`,
          subject,
          message,
          productId: productId || null,
        }),
      });

      if (res.ok) {
        toast.success("Enquiry submitted! Our team will respond within 24 hours.", {
          icon: <Check className="h-4 w-4" />,
        });
        closeEnquiryModal();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit enquiry");
      }
    } catch {
      toast.error("Failed to submit enquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            {productName ? "Enquire about this product" : "Send us your requirement"}
          </DialogTitle>
          {productName && (
            <DialogDescription>
              You&apos;re enquiring about:{" "}
              <span className="font-semibold text-foreground">{productName}</span>
            </DialogDescription>
          )}
          {!productName && (
            <DialogDescription>
              Fields marked * are required. We respond within 24 working hours.
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Details */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Your Details
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>
                Phone <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="tel"
                placeholder="Phone number *"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>How did you hear about us?</Label>
            <Input
              placeholder="Google, referral, social media... (optional)"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
            />
          </div>

          <Separator />

          {/* Message */}
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              placeholder="Tell us what you'd like to know..."
              rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={closeEnquiryModal}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-primary hover:bg-primary/80 text-white"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Send Enquiry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
