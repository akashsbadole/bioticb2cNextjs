"use client";

import { useSeo } from "@/lib/use-seo";
import { useQuery } from "@tanstack/react-query";
import {
  VedikaSectionTitle,
  VedikaValueCard,
  VedikaTimelineItem,
  VedikaTeamCard,
  VedikaNewsletter,
  LeafSimple,
  ShieldIcon,
  AwardIcon,
} from "./vedika-components";

interface AboutPageProps {
  onNavigate: (page: string, data?: unknown) => void;
  data?: Record<string, unknown>;
}

const values = [
  { icon: <LeafSimple className="w-5 h-5" />, title: "Rooted in Tradition", description: "Every formula begins with a classical Ayurvedic text — no shortcuts, no modern reinterpretations that lose the original intent." },
  { icon: <ShieldIcon className="w-5 h-5" />, title: "Tested to Modern Standards", description: "We lab-test every batch for potency, heavy metals, and microbial safety. Tradition and science coexist here." },
  { icon: <AwardIcon className="w-5 h-5" />, title: "Single-Origin, Traceable", description: "We source from farming cooperatives we've visited. You can trace each ingredient back to the region it was grown in." },
];

const timeline = [
  { year: "2012", title: "Founded in Jaipur", description: "A small workshop with two Ayurvedic vaidyas and a belief that classical formulas deserved a modern audience." },
  { year: "2015", title: "First lab partnership", description: "Partnered with an NABL-accredited lab in Pune to test every batch for safety and potency — a non-negotiable we've maintained since." },
  { year: "2018", title: "40,000th ritual shipped", description: "Crossed a milestone that proved people were ready to trade short-term fixes for long-term wellness routines." },
  { year: "2026", title: "Vedika, today", description: "Still small-batch. Still rooted in the texts. Still made by people who care as much about the process as the outcome." },
];

const team = [
  { name: "Dr. Ananya Sharma", role: "Chief Ayurvedic Formulator" },
  { name: "Rahul Varma", role: "Head of Sourcing & Sustainability" },
  { name: "Priya Kapoor", role: "Lead Product Designer" },
  { name: "Vikram Singh", role: "Operations & Quality" },
];

export function AboutPage({ onNavigate, data: _data }: AboutPageProps) {
  useSeo("about", {
    title: "About Us — Vedika Ayurveda",
    description: "Rooted in classical Ayurvedic texts, tested against modern lab standards. Small-batch formulations made with integrity.",
  });

  return (
    <div>
      {/* HERO */}
      <section className="page-hero" style={{ background: "var(--vedika-green-dark)", color: "var(--vedika-bg)", padding: "70px 0 60px", position: "relative", overflow: "hidden" }}>
        <div className="vedika-container" style={{ position: "relative", zIndex: 1 }}>
          <div className="vedika-eyebrow" style={{ color: "var(--vedika-gold)" }}>Our Story</div>
          <h1 style={{ color: "#fff", fontSize: "clamp(2.4rem,4.5vw,3.8rem)", lineHeight: 1.05, maxWidth: 640 }}>Rooted in the Vedas, refined for today.</h1>
          <p style={{ color: "#B7C0B4", maxWidth: 560, marginTop: 12 }}>We believe Ayurveda doesn&apos;t need reinvention — it needs integrity. Every formula we make starts with a classical text and ends with a lab report.</p>
        </div>
        <svg viewBox="0 0 200 200" fill="none" style={{ position: "absolute", right: -60, top: -60, width: 320, height: 320, opacity: 0.12 }}>
          <path d="M100 20c-20 40-50 50-50 90s30 60 50 70c20-10 50-30 50-70s-30-50-50-90z" stroke="currentColor" strokeWidth=".6"/>
        </svg>
      </section>

      <div className="vedika-container">
        <div className="breadcrumb" style={{ padding: "20px 0", fontSize: ".82rem", color: "var(--vedika-ink-soft)", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={() => onNavigate("home")} style={{ background: "none", border: "none", cursor: "pointer", font: "inherit", color: "inherit" }}>Home</button>
          <span style={{ color: "var(--vedika-sand)" }}>/</span>
          <span style={{ color: "var(--vedika-red)" }}>About Us</span>
        </div>
      </div>

      {/* STORY SPOTLIGHT */}
      <section className="vedika-section" style={{ paddingTop: 0 }}>
        <div className="vedika-container">
          <div className="spotlight" style={{ display: "grid", gridTemplateColumns: ".85fr 1.15fr", gap: 56, alignItems: "center", background: "var(--vedika-green-dark)", borderRadius: "28px", padding: "64px", color: "var(--vedika-bg)", overflow: "hidden" }}>
            <div className="spotlight-art" style={{ aspectRatio: "1", borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #3C5A49, var(--vedika-green-dark) 75%)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,.08)" }}>
              <svg viewBox="0 0 200 200" fill="none" style={{ width: "60%", height: "60%" }}>
                <path d="M100 170c0-50 20-70 20-100 0-16-9-28-20-32-11 4-20 16-20 32 0 30 20 50 20 100z" fill="#3C5A49" stroke="#C68A2E" strokeWidth="1.5"/>
                <path d="M100 130c-18-4-30-18-30-18M100 110c18-4 28-16 28-16M100 90c-14-3-22-13-22-13" stroke="#C68A2E" strokeWidth="1.3"/>
              </svg>
            </div>
            <div>
              <div className="vedika-eyebrow" style={{ color: "var(--vedika-gold)" }}>The Vedika Difference</div>
              <h2 style={{ color: "var(--vedika-gold-tint)" }}>Ayurveda that honours both the past and the proof.</h2>
              <p style={{ color: "#CBD3C9" }}>Every formulation we make begins with a classical Ayurvedic text — the Charaka Samhita, the Sushruta Samhita, or the Ashtanga Hridayam. From there, we work with vaidyas who have spent decades studying these texts, not interpreting them through a modern lens. Once a formula is finalised, it goes through third-party lab testing for potency, heavy metals, and microbial safety. Tradition and science don&apos;t have to be at odds — they&apos;re both part of the same standard.</p>
              <div className="spot-stats" style={{ display: "flex", gap: 32, marginTop: 28 }}>
                <div><strong style={{ fontFamily: "var(--font-fraunces), Georgia, serif", color: "var(--vedika-gold-tint)", fontSize: "1.4rem", display: "block" }}>3</strong><span style={{ fontSize: ".76rem", color: "#A9B3A5" }}>Classical texts referenced</span></div>
                <div><strong style={{ fontFamily: "var(--font-fraunces), Georgia, serif", color: "var(--vedika-gold-tint)", fontSize: "1.4rem", display: "block" }}>100%</strong><span style={{ fontSize: ".76rem", color: "#A9B3A5" }}>Lab-tested batches</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="vedika-section" style={{ background: "var(--vedika-bg-alt)" }}>
        <div className="vedika-container">
          <VedikaSectionTitle eyebrow="Our Principles" title="How we formulate" description="Three things we don&apos;t compromise on — no matter how fast we grow." />
          <div className="vedika-grid-3">
            {values.map((v, i) => (
              <VedikaValueCard key={i} icon={v.icon} title={v.title} description={v.description} />
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="vedika-section">
        <div className="vedika-container">
          <VedikaSectionTitle eyebrow="Our Journey" title="The story so far" description="From a small workshop in Jaipur to a community of thousands." align="left" />
          <div className="timeline" style={{ position: "relative", paddingLeft: 40, maxWidth: 640 }}>
            <div style={{ position: "absolute", left: 9, top: 8, bottom: 8, width: 2, background: "var(--vedika-line)" }} />
            {timeline.map((t, i) => (
              <div key={i} style={{ position: "relative", paddingBottom: 44 }}>
                <div style={{ position: "absolute", left: -40, top: 4, width: 20, height: 20, borderRadius: "50%", background: "var(--vedika-paper)", border: "3px solid var(--vedika-red)" }} />
                <VedikaTimelineItem year={t.year} title={t.title} description={t.description} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="vedika-section" style={{ background: "var(--vedika-bg-alt)" }}>
        <div className="vedika-container">
          <VedikaSectionTitle eyebrow="The People" title="The team behind your rituals" description="Formulators, sourcers, and quality experts who treat every batch like it&apos;s for their own family." />
          <div className="vedika-grid-4">
            {team.map((m, i) => (
              <VedikaTeamCard key={i} name={m.name} role={m.role} />
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <VedikaNewsletter />
    </div>
  );
}
