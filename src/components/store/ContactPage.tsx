"use client";

import { useState } from "react";
import { useSeo } from "@/lib/use-seo";
import {
  VedikaSectionTitle,
  VedikaContactCard,
  VedikaFAQItem,
  VedikaNewsletter,
  MailIcon,
  PhoneIcon,
  PinIcon,
  LeafIcon,
} from "./vedika-components";

interface ContactPageProps {
  onNavigate: (page: string, data?: unknown) => void;
  data?: Record<string, unknown>;
}

const faqItems = [
  { question: "How long does shipping take within India?", answer: "Standard shipping takes 5–7 business days. Metro cities typically receive orders within 3–5 business days. We ship from our facility in Jaipur." },
  { question: "Do you ship internationally?", answer: "Yes, we ship to select countries. International delivery takes 10–14 business days. Customs duties, if any, are borne by the customer." },
  { question: "What is your return policy?", answer: "We accept returns within 15 days of delivery for unopened products in their original packaging. Ayurvedic products are formulated in small batches, so each return helps us improve." },
  { question: "Can I speak to an Ayurvedic practitioner?", answer: "Absolutely. Our team includes qualified vaidyas who can help with product selection based on your dosha profile. Just mention it in your message and we'll schedule a call." },
  { question: "Do you offer bulk or wholesale pricing?", answer: "Yes, we work with wellness centres, clinics, and retail partners. Please use the form below with details about your requirements and we'll share a custom quote." },
];

export function ContactPage({ onNavigate, data: _data }: ContactPageProps) {
  useSeo("contact", {
    title: "Contact Us — Vedika Ayurveda",
    description: "Get in touch with the Vedika team. Questions on dosha matching, orders, or bulk enquiries — we reply within one business day.",
  });

  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic
  };

  return (
    <div>
      {/* HERO */}
      <section className="page-hero" style={{ background: "var(--vedika-green-dark)", color: "var(--vedika-bg)", padding: "70px 0 60px", position: "relative", overflow: "hidden" }}>
        <div className="vedika-container" style={{ position: "relative", zIndex: 1 }}>
          <div className="vedika-eyebrow" style={{ color: "var(--vedika-gold)" }}>Get in Touch</div>
          <h1 style={{ color: "#fff", fontSize: "clamp(2.4rem,4.5vw,3.8rem)", lineHeight: 1.05, maxWidth: 640 }}>We reply within one business day.</h1>
          <p style={{ color: "#B7C0B4", maxWidth: 560, marginTop: 12 }}>Questions on dosha matching, an order, or a bulk/wholesale enquiry — write to us directly, no chatbot in between.</p>
        </div>
        <svg viewBox="0 0 200 200" fill="none" style={{ position: "absolute", right: -60, top: -60, width: 320, height: 320, opacity: 0.12 }}>
          <path d="M100 20c-20 40-50 50-50 90s30 60 50 70c20-10 50-30 50-70s-30-50-50-90z" stroke="currentColor" strokeWidth=".6"/>
        </svg>
      </section>

      <div className="vedika-container">
        <div className="breadcrumb" style={{ padding: "20px 0", fontSize: ".82rem", color: "var(--vedika-ink-soft)", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={() => onNavigate("home")} style={{ background: "none", border: "none", cursor: "pointer", font: "inherit", color: "inherit" }}>Home</button>
          <span style={{ color: "var(--vedika-sand)" }}>/</span>
          <span style={{ color: "var(--vedika-red)" }}>Contact Us</span>
        </div>
      </div>

      <section className="vedika-container vedika-section-tight">
        <div className="contact-layout" style={{ display: "grid", gridTemplateColumns: ".9fr 1.1fr", gap: 56 }}>
          {/* LEFT: Contact Info */}
          <div>
            <VedikaContactCard icon={<MailIcon className="w-5 h-5" />} label="Email" value="hello@vedikaayurveda.com" href="mailto:hello@vedikaayurveda.com" />
            <VedikaContactCard icon={<PhoneIcon className="w-5 h-5" />} label="Phone" value="+91 141 478 9200" href="tel:+911414789200" />
            <VedikaContactCard icon={<PinIcon className="w-5 h-5" />} label="Address" value="42, Hawa Sadak, Bani Park, Jaipur — 302 016, Rajasthan, India" />
            <VedikaContactCard icon={<LeafIcon className="w-5 h-5" />} label="Social" value="@vedikaayurveda" />

            {/* FAQ */}
            <div style={{ marginTop: 48 }}>
              <VedikaSectionTitle eyebrow="Quick Answers" title="FAQs" align="left" />
              {faqItems.map((item, i) => (
                <VedikaFAQItem key={i} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>

          {/* RIGHT: Contact Form */}
          <div>
            <div style={{ background: "var(--vedika-paper)", border: "1px solid var(--vedika-line)", borderRadius: "14px", padding: "36px" }}>
              <VedikaSectionTitle eyebrow="Send a Message" title="Write to us" align="left" />
              <form onSubmit={handleSubmit}>
                <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div className="form-field">
                    <label style={{ display: "block", fontSize: ".84rem", fontWeight: 600, color: "var(--vedika-green-dark)", marginBottom: 8 }}>Full Name *</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: "100%", border: "1px solid var(--vedika-line)", borderRadius: "6px", padding: "13px 16px", background: "var(--vedika-paper)", color: "var(--vedika-ink)", font: "inherit", fontSize: ".92rem" }} />
                  </div>
                  <div className="form-field">
                    <label style={{ display: "block", fontSize: ".84rem", fontWeight: 600, color: "var(--vedika-green-dark)", marginBottom: 8 }}>Email *</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: "100%", border: "1px solid var(--vedika-line)", borderRadius: "6px", padding: "13px 16px", background: "var(--vedika-paper)", color: "var(--vedika-ink)", font: "inherit", fontSize: ".92rem" }} />
                  </div>
                  <div className="form-field full">
                    <label style={{ display: "block", fontSize: ".84rem", fontWeight: 600, color: "var(--vedika-green-dark)", marginBottom: 8 }}>Subject</label>
                    <input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      style={{ width: "100%", border: "1px solid var(--vedika-line)", borderRadius: "6px", padding: "13px 16px", background: "var(--vedika-paper)", color: "var(--vedika-ink)", font: "inherit", fontSize: ".92rem" }} />
                  </div>
                  <div className="form-field full">
                    <label style={{ display: "block", fontSize: ".84rem", fontWeight: 600, color: "var(--vedika-green-dark)", marginBottom: 8 }}>Message *</label>
                    <textarea required rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      style={{ width: "100%", border: "1px solid var(--vedika-line)", borderRadius: "6px", padding: "13px 16px", background: "var(--vedika-paper)", color: "var(--vedika-ink)", font: "inherit", fontSize: ".92rem", resize: "vertical" }} />
                  </div>
                </div>
                <button type="submit" className="vedika-btn vedika-btn-primary" style={{ marginTop: 12 }}>Send Message</button>
              </form>
            </div>

            {/* MAP */}
            <div className="map-box" style={{
              aspectRatio: "16/8", borderRadius: "14px", overflow: "hidden", marginTop: 40,
              background: "linear-gradient(var(--vedika-line) 1px, transparent 1px) 0 0/40px 40px, linear-gradient(90deg, var(--vedika-line) 1px, transparent 1px) 0 0/40px 40px, var(--vedika-bg-alt)",
              display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
            }}>
              <PinIcon className="w-[52px] h-[52px]" style={{ color: "var(--vedika-red)" }} />
              <span style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", fontSize: ".78rem", color: "var(--vedika-ink-soft)", background: "var(--vedika-paper)", padding: "6px 14px", borderRadius: 100, whiteSpace: "nowrap" }}>
                42, Hawa Sadak, Bani Park, Jaipur
              </span>
            </div>
          </div>
        </div>
      </section>

      <VedikaNewsletter />
    </div>
  );
}
