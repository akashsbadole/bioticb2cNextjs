"use client";

import { useState } from "react";
import { Send, Check, Building2, Package, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";

export function GlobalEnquiryModal() {
  const { enquiryModal, closeEnquiryModal } = useAppStore();
  const { open, productName, productId } = enquiryModal;

  const [submitting, setSubmitting] = useState(false);
  const [businessOpen, setBusinessOpen] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    enquiryType: "product",
    quantity: "1",
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    source: "",
    productInterest: "",
  });

  const isRFQ = form.enquiryType === "rfq";

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      message: productName
        ? `I'm interested in ${productName}. Please provide more information.`
        : "",
      enquiryType: "product",
      quantity: "1",
      companyName: "",
      companyEmail: "",
      companyPhone: "",
      companyAddress: "",
      source: "",
      productInterest: "",
    });
    setBusinessOpen(false);
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

    if (isRFQ && (!form.quantity || parseInt(form.quantity) < 1)) {
      toast.error("Please enter a valid quantity for your quote request");
      return;
    }

    setSubmitting(true);
    try {
      const subject = productName
        ? isRFQ
          ? `RFQ: ${productName} (Qty: ${form.quantity})`
          : `Enquiry about ${productName}`
        : `Product Enquiry${form.productInterest ? ` - ${form.productInterest}` : ""}`;

      const message = [
        form.companyName ? `Company: ${form.companyName}` : "",
        form.productInterest ? `Product interest: ${form.productInterest}` : "",
        form.quantity ? `Approx. qty/month: ${form.quantity}` : "",
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
          companyName: form.companyName || null,
          companyEmail: form.companyEmail || null,
          companyPhone: form.companyPhone || null,
          companyAddress: form.companyAddress || null,
          subject,
          message,
          productId: productId || null,
          type: isRFQ ? "rfq" : "product",
          quantity: form.quantity ? parseInt(form.quantity) : null,
        }),
      });

      if (res.ok) {
        toast.success(
          isRFQ
            ? "Quote request submitted! Our sales team will respond shortly."
            : "Enquiry submitted! Our team will respond within 24 hours.",
          { icon: <Check className="h-4 w-4" /> },
        );
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
            {productName
              ? "Enquire about this product"
              : "Send us your requirement"}
          </DialogTitle>
          {productName && (
            <DialogDescription>
              You&apos;re enquiring about:{" "}
              <span className="font-semibold text-foreground">
                {productName}
              </span>
            </DialogDescription>
          )}
          {!productName && (
            <DialogDescription>
              Fields marked * are required. We respond within 24 working hours.
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Enquiry Type & Quantity */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Enquiry Type</Label>
              <Select
                value={form.enquiryType}
                onValueChange={(val) => setForm({ ...form, enquiryType: val })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">General Enquiry</SelectItem>
                  <SelectItem value="rfq">Request for Quote (RFQ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" />
                Required Quantity
                {isRFQ && <span className="text-rose-500">*</span>}
              </Label>
              <Input
                type="number"
                min="1"
                placeholder="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className={
                  isRFQ ? "border-amber-400 ring-1 ring-amber-400" : ""
                }
              />
              {isRFQ && (
                <p className="text-xs text-amber-600">
                  Quantity is required for quote requests
                </p>
              )}
            </div>
          </div>

          <Separator />

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
                <Label>Company Name</Label>
                <Input
                  placeholder="Acme Corp"
                  value={form.companyName}
                  onChange={(e) =>
                    setForm({ ...form, companyName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Phone <span className="text-rose-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-[100px] shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+91">IN +91</SelectItem>
                      <SelectItem value="+1">US +1</SelectItem>
                      <SelectItem value="+44">UK +44</SelectItem>
                      <SelectItem value="+971">UAE +971</SelectItem>
                      <SelectItem value="+61">AU +61</SelectItem>
                      <SelectItem value="+92">PK +92</SelectItem>
                      <SelectItem value="+880">BD +880</SelectItem>
                      <SelectItem value="+977">NP +977</SelectItem>
                      <SelectItem value="+65">SG +65</SelectItem>
                      <SelectItem value="+81">JP +81</SelectItem>
                      <SelectItem value="+86">CN +86</SelectItem>
                      <SelectItem value="+49">DE +49</SelectItem>
                      <SelectItem value="+33">FR +33</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="tel"
                    placeholder="Phone number *"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                    className="flex-1"
                  />
                </div>
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
          </div>

          {/* Product Interest & Quantity */}
          {!productName && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Product interest</Label>
                <Input
                  placeholder="Product interest (optional)"
                  value={form.productInterest}
                  onChange={(e) =>
                    setForm({ ...form, productInterest: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Approx. qty / month</Label>
                <Input
                  placeholder="Approximate quantity"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* Collapsible Business Details */}
          <Collapsible open={businessOpen} onOpenChange={setBusinessOpen}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Business Details
                  {(form.companyEmail ||
                    form.companyPhone ||
                    form.companyAddress) && (
                    <span className="text-xs text-primary font-normal">
                      (filled)
                    </span>
                  )}
                </span>
                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    Company Name
                  </Label>
                  <Input
                    placeholder="Acme Corp"
                    value={form.companyName}
                    onChange={(e) =>
                      setForm({ ...form, companyName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company Email</Label>
                  <Input
                    type="email"
                    placeholder="sales@company.com"
                    value={form.companyEmail}
                    onChange={(e) =>
                      setForm({ ...form, companyEmail: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Company Phone</Label>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={form.companyPhone}
                    onChange={(e) =>
                      setForm({ ...form, companyPhone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company Address</Label>
                  <Input
                    placeholder="123 Business St"
                    value={form.companyAddress}
                    onChange={(e) =>
                      setForm({ ...form, companyAddress: e.target.value })
                    }
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* How did you hear */}
          <div className="space-y-2">
            <Label>How did you hear about us?</Label>
            <Select
              value={form.source}
              onValueChange={(val) => setForm({ ...form, source: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google search</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="social">Social media</SelectItem>
                <SelectItem value="trade">Trade show</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
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
            onClick={() => {
              const syntheticEvent = {
                preventDefault: () => {},
                stopPropagation: () => {},
              } as React.FormEvent;
              handleSubmit(syntheticEvent);
            }}
            className="bg-primary hover:bg-primary/80 text-white"
            disabled={submitting}
          >
            {submitting
              ? "Submitting..."
              : isRFQ
                ? "Request Quote"
                : "Send Enquiry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
