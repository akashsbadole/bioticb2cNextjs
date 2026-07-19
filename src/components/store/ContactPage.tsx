"use client";

import { useState } from "react";
import { useSeo } from "@/lib/use-seo";
import {
  BioticSectionTitle,
  BioticContactCard,
  BioticFAQItem,
  BioticNewsletter,
  MailIcon,
  PhoneIcon,
  PinIcon,
  LeafIcon,
} from "./biotic-components";

interface ContactPageProps {
  onNavigate: (page: string, data?: unknown) => void;
  data?: Record<string, unknown>;
}

const faqItems = [
  {
    question: "How long does shipping take within India?",
    answer:
      "Standard shipping takes 5–7 business days. Metro cities typically receive orders within 3–5 business days. We ship from our facility in Jaipur.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship to select countries. International delivery takes 10–14 business days. Customs duties, if any, are borne by the customer.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We accept returns within 15 days of delivery for unopened products in their original packaging. Ayurvedic products are formulated in small batches, so each return helps us improve.",
  },
  {
    question: "Can I speak to an Ayurvedic practitioner?",
    answer:
      "Absolutely. Our team includes qualified vaidyas who can help with product selection based on your dosha profile. Just mention it in your message and we'll schedule a call.",
  },
  {
    question: "Do you offer bulk or wholesale pricing?",
    answer:
      "Yes, we work with wellness centres, clinics, and retail partners. Please use the form below with details about your requirements and we'll share a custom quote.",
  },
];

export function ContactPage({ onNavigate, data: _data }: ContactPageProps) {
  useSeo("contact", {
    title: "Contact Us — Biotic Naturals",
    description:
      "Get in touch with the Biotic team. Questions on dosha matching, orders, or bulk enquiries — we reply within one business day.",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic
  };

  return (
    <div>
      {/* HERO */}
      <section className="page-hero bg-biotic-green-dark text-biotic-bg py-[70px] pb-[60px] relative overflow-hidden">
        <div className="biotic-container relative z-[1]">
          <div className="biotic-eyebrow text-biotic-gold">Get in Touch</div>
          <h1
            className="text-white max-w-[640px]"
            style={{ fontSize: "clamp(2.4rem,4.5vw,3.8rem)", lineHeight: 1.05 }}
          >
            We reply within one business day.
          </h1>
          <p className="text-[#B7C0B4] max-w-[560px] mt-3">
            Questions on dosha matching, an order, or a bulk/wholesale enquiry —
            write to us directly, no chatbot in between.
          </p>
        </div>
        <svg
          viewBox="0 0 200 200"
          fill="none"
          className="absolute -right-[60px] -top-[60px] w-[320px] h-[320px] opacity-[0.12]"
        >
          <path
            d="M100 20c-20 40-50 50-50 90s30 60 50 70c20-10 50-30 50-70s-30-50-50-90z"
            stroke="currentColor"
            strokeWidth=".6"
          />
        </svg>
      </section>

      <div className="biotic-container">
        <div className="breadcrumb py-5 text-xs text-biotic-ink-soft flex gap-2 items-center flex-wrap">
          <button
            onClick={() => onNavigate("home")}
            className="bg-transparent border-none cursor-pointer font-[inherit] text-inherit"
          >
            Home
          </button>
          <span className="text-biotic-sand">/</span>
          <span className="text-biotic-red">Contact Us</span>
        </div>
      </div>

      <section className="biotic-container biotic-section-tight">
        <div className="contact-layout grid grid-cols-1 lg:grid-cols-[.9fr_1.1fr] gap-14">
          {/* LEFT: Contact Info */}
          <div>
            <BioticContactCard
              icon={<MailIcon className="w-5 h-5" />}
              label="Email"
              value="info@bioticnaturals.com"
              href="mailto:info@bioticnaturals.com"
            />
            <BioticContactCard
              icon={<PhoneIcon className="w-5 h-5" />}
              label="Phone"
              value="+91 141 478 9200"
              href="tel:+911414789200"
            />
            <BioticContactCard
              icon={<PinIcon className="w-5 h-5" />}
              label="Address"
              value="42, Hawa Sadak, Bani Park, Jaipur — 302 016, Rajasthan, India"
            />
            <BioticContactCard
              icon={<LeafIcon className="w-5 h-5" />}
              label="Social"
              value="@bioticayurveda"
            />

            {/* FAQ */}
            <div className="mt-12">
              <BioticSectionTitle
                eyebrow="Quick Answers"
                title="FAQs"
                align="left"
              />
              {faqItems.map((item, i) => (
                <BioticFAQItem
                  key={i}
                  question={item.question}
                  answer={item.answer}
                />
              ))}
            </div>
          </div>

          {/* RIGHT: Contact Form */}
          <div>
            <div className="bg-biotic-paper border border-biotic-line rounded-xl p-9">
              <BioticSectionTitle
                eyebrow="Send a Message"
                title="Write to us"
                align="left"
              />
              <form onSubmit={handleSubmit}>
                <div className="form-grid grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="form-field">
                    <label className="block text-sm font-semibold text-biotic-green-dark mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full border border-biotic-line rounded-[6px] px-4 py-[13px] bg-biotic-paper text-biotic-ink font-inherit text-[.92rem]"
                    />
                  </div>
                  <div className="form-field">
                    <label className="block text-sm font-semibold text-biotic-green-dark mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full border border-biotic-line rounded-[6px] px-4 py-[13px] bg-biotic-paper text-biotic-ink font-inherit text-[.92rem]"
                    />
                  </div>
                  <div className="form-field full">
                    <label className="block text-sm font-semibold text-biotic-green-dark mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="w-full border border-biotic-line rounded-[6px] px-4 py-[13px] bg-biotic-paper text-biotic-ink font-inherit text-[.92rem]"
                    />
                  </div>
                  <div className="form-field full">
                    <label className="block text-sm font-semibold text-biotic-green-dark mb-2">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full border border-biotic-line rounded-[6px] px-4 py-[13px] bg-biotic-paper text-biotic-ink font-inherit text-[.92rem] resize-y"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="biotic-btn biotic-btn-primary mt-3"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* MAP */}
            <div
              className="map-box aspect-[16/8] rounded-xl overflow-hidden mt-10 flex items-center justify-center relative"
              style={{
                background:
                  "linear-gradient(var(--biotic-line) 1px, transparent 1px) 0 0/40px 40px, linear-gradient(90deg, var(--biotic-line) 1px, transparent 1px) 0 0/40px 40px, var(--biotic-bg-alt)",
              }}
            >
              <PinIcon className="w-[52px] h-[52px] text-biotic-red" />
              <span
                className="absolute bottom-4 left-1/2 text-[.78rem] text-biotic-ink-soft bg-biotic-paper px-3.5 py-1.5 rounded-full whitespace-nowrap"
                style={{ transform: "translateX(-50%)" }}
              >
                42, Hawa Sadak, Bani Park, Jaipur
              </span>
            </div>
          </div>
        </div>
      </section>

      <BioticNewsletter />
    </div>
  );
}
