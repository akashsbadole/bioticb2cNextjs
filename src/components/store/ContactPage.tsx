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
      <section className="page-hero bg-vedika-green-dark text-vedika-bg py-[70px] pb-[60px] relative overflow-hidden">
        <div className="vedika-container relative z-[1]">
          <div className="vedika-eyebrow text-vedika-gold">Get in Touch</div>
          <h1 className="text-white max-w-[640px]" style={{ fontSize: "clamp(2.4rem,4.5vw,3.8rem)", lineHeight: 1.05 }}>We reply within one business day.</h1>
          <p className="text-[#B7C0B4] max-w-[560px] mt-3">Questions on dosha matching, an order, or a bulk/wholesale enquiry — write to us directly, no chatbot in between.</p>
        </div>
        <svg viewBox="0 0 200 200" fill="none" className="absolute -right-[60px] -top-[60px] w-[320px] h-[320px] opacity-[0.12]">
          <path d="M100 20c-20 40-50 50-50 90s30 60 50 70c20-10 50-30 50-70s-30-50-50-90z" stroke="currentColor" strokeWidth=".6"/>
        </svg>
      </section>

      <div className="vedika-container">
        <div className="breadcrumb py-5 text-xs text-vedika-ink-soft flex gap-2 items-center flex-wrap">
          <button onClick={() => onNavigate("home")} className="bg-transparent border-none cursor-pointer font-[inherit] text-inherit">Home</button>
          <span className="text-vedika-sand">/</span>
          <span className="text-vedika-red">Contact Us</span>
        </div>
      </div>

      <section className="vedika-container vedika-section-tight">
        <div className="contact-layout grid grid-cols-1 lg:grid-cols-[.9fr_1.1fr] gap-14">
          {/* LEFT: Contact Info */}
          <div>
            <VedikaContactCard icon={<MailIcon className="w-5 h-5" />} label="Email" value="hello@vedikaayurveda.com" href="mailto:hello@vedikaayurveda.com" />
            <VedikaContactCard icon={<PhoneIcon className="w-5 h-5" />} label="Phone" value="+91 141 478 9200" href="tel:+911414789200" />
            <VedikaContactCard icon={<PinIcon className="w-5 h-5" />} label="Address" value="42, Hawa Sadak, Bani Park, Jaipur — 302 016, Rajasthan, India" />
            <VedikaContactCard icon={<LeafIcon className="w-5 h-5" />} label="Social" value="@vedikaayurveda" />

            {/* FAQ */}
            <div className="mt-12">
              <VedikaSectionTitle eyebrow="Quick Answers" title="FAQs" align="left" />
              {faqItems.map((item, i) => (
                <VedikaFAQItem key={i} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>

          {/* RIGHT: Contact Form */}
          <div>
            <div className="bg-vedika-paper border border-vedika-line rounded-xl p-9">
              <VedikaSectionTitle eyebrow="Send a Message" title="Write to us" align="left" />
              <form onSubmit={handleSubmit}>
                <div className="form-grid grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="form-field">
                    <label className="block text-sm font-semibold text-vedika-green-dark mb-2">Full Name *</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-vedika-line rounded-[6px] px-4 py-[13px] bg-vedika-paper text-vedika-ink font-inherit text-[.92rem]" />
                  </div>
                  <div className="form-field">
                    <label className="block text-sm font-semibold text-vedika-green-dark mb-2">Email *</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-vedika-line rounded-[6px] px-4 py-[13px] bg-vedika-paper text-vedika-ink font-inherit text-[.92rem]" />
                  </div>
                  <div className="form-field full">
                    <label className="block text-sm font-semibold text-vedika-green-dark mb-2">Subject</label>
                    <input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full border border-vedika-line rounded-[6px] px-4 py-[13px] bg-vedika-paper text-vedika-ink font-inherit text-[.92rem]" />
                  </div>
                  <div className="form-field full">
                    <label className="block text-sm font-semibold text-vedika-green-dark mb-2">Message *</label>
                    <textarea required rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full border border-vedika-line rounded-[6px] px-4 py-[13px] bg-vedika-paper text-vedika-ink font-inherit text-[.92rem] resize-y" />
                  </div>
                </div>
                <button type="submit" className="vedika-btn vedika-btn-primary mt-3">Send Message</button>
              </form>
            </div>

            {/* MAP */}
            <div className="map-box aspect-[16/8] rounded-xl overflow-hidden mt-10 flex items-center justify-center relative" style={{
              background: "linear-gradient(var(--vedika-line) 1px, transparent 1px) 0 0/40px 40px, linear-gradient(90deg, var(--vedika-line) 1px, transparent 1px) 0 0/40px 40px, var(--vedika-bg-alt)",
            }}>
              <PinIcon className="w-[52px] h-[52px] text-vedika-red" />
              <span className="absolute bottom-4 left-1/2 text-[.78rem] text-vedika-ink-soft bg-vedika-paper px-3.5 py-1.5 rounded-full whitespace-nowrap" style={{ transform: "translateX(-50%)" }}>
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
