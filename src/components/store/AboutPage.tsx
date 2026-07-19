"use client";

import { useSeo } from "@/lib/use-seo";
import { useQuery } from "@tanstack/react-query";
import {
  BioticSectionTitle,
  BioticValueCard,
  BioticTimelineItem,
  BioticTeamCard,
  BioticNewsletter,
  LeafSimple,
  ShieldIcon,
  AwardIcon,
} from "./biotic-components";

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
  { year: "2026", title: "Biotic, today", description: "Still small-batch. Still rooted in the texts. Still made by people who care as much about the process as the outcome." },
];

const team = [
  { name: "Dr. Ananya Sharma", role: "Chief Ayurvedic Formulator" },
  { name: "Rahul Varma", role: "Head of Sourcing & Sustainability" },
  { name: "Priya Kapoor", role: "Lead Product Designer" },
  { name: "Vikram Singh", role: "Operations & Quality" },
];

export function AboutPage({ onNavigate, data: _data }: AboutPageProps) {
  useSeo("about", {
    title: "About Us — Biotic Ayurveda",
    description: "Rooted in classical Ayurvedic texts, tested against modern lab standards. Small-batch formulations made with integrity.",
  });

  return (
    <div>
      {/* HERO */}
      <section className="page-hero bg-biotic-green-dark text-biotic-bg py-[70px] pb-[60px] relative overflow-hidden">
          <div className="biotic-container relative z-[1]">
          <div className="biotic-eyebrow text-biotic-gold">Our Story</div>
          <h1 className="text-white max-w-[640px]" style={{ fontSize: "clamp(2.4rem,4.5vw,3.8rem)", lineHeight: 1.05 }}>Rooted in the Vedas, refined for today.</h1>
          <p className="text-[#B7C0B4] max-w-[560px] mt-3">We believe Ayurveda doesn&apos;t need reinvention — it needs integrity. Every formula we make starts with a classical text and ends with a lab report.</p>
        </div>
        <svg viewBox="0 0 200 200" fill="none" className="absolute -right-[60px] -top-[60px] w-[320px] h-[320px] opacity-[0.12]">
          <path d="M100 20c-20 40-50 50-50 90s30 60 50 70c20-10 50-30 50-70s-30-50-50-90z" stroke="currentColor" strokeWidth=".6"/>
        </svg>
      </section>

      <div className="biotic-container">
        <div className="breadcrumb py-5 text-xs text-biotic-ink-soft flex gap-2 items-center flex-wrap">
          <button onClick={() => onNavigate("home")} className="bg-transparent border-none cursor-pointer font-[inherit] text-inherit">Home</button>
          <span className="text-biotic-sand">/</span>
          <span className="text-biotic-red">About Us</span>
        </div>
      </div>

      {/* STORY SPOTLIGHT */}
      <section className="biotic-section pt-0">
        <div className="biotic-container">
          <div className="spotlight grid grid-cols-1 lg:grid-cols-[.85fr_1.15fr] gap-14 items-center bg-biotic-green-dark rounded-[28px] p-16 text-biotic-bg overflow-hidden">
            <div className="spotlight-art aspect-square rounded-full flex items-center justify-center border border-white/10" style={{ background: "radial-gradient(circle at 35% 30%, #3C5A49, var(--biotic-green-dark) 75%)" }}>
              <svg viewBox="0 0 200 200" fill="none" className="w-3/5 h-3/5">
                <path d="M100 170c0-50 20-70 20-100 0-16-9-28-20-32-11 4-20 16-20 32 0 30 20 50 20 100z" fill="#3C5A49" stroke="#C68A2E" strokeWidth="1.5"/>
                <path d="M100 130c-18-4-30-18-30-18M100 110c18-4 28-16 28-16M100 90c-14-3-22-13-22-13" stroke="#C68A2E" strokeWidth="1.3"/>
              </svg>
            </div>
            <div>
              <div className="biotic-eyebrow text-biotic-gold">The Biotic Difference</div>
              <h2 className="text-biotic-gold-tint">Ayurveda that honours both the past and the proof.</h2>
              <p className="text-[#CBD3C9]">Every formulation we make begins with a classical Ayurvedic text — the Charaka Samhita, the Sushruta Samhita, or the Ashtanga Hridayam. From there, we work with vaidyas who have spent decades studying these texts, not interpreting them through a modern lens. Once a formula is finalised, it goes through third-party lab testing for potency, heavy metals, and microbial safety. Tradition and science don&apos;t have to be at odds — they&apos;re both part of the same standard.</p>
              <div className="spot-stats flex gap-8 mt-7">
                <div><strong className="font-fraunces text-biotic-gold-tint text-[1.4rem] block">3</strong><span className="text-[.76rem] text-[#A9B3A5]">Classical texts referenced</span></div>
                <div><strong className="font-fraunces text-biotic-gold-tint text-[1.4rem] block">100%</strong><span className="text-[.76rem] text-[#A9B3A5]">Lab-tested batches</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="biotic-section bg-biotic-bg-alt">
        <div className="biotic-container">
          <BioticSectionTitle eyebrow="Our Principles" title="How we formulate" description="Three things we don&apos;t compromise on — no matter how fast we grow." />
          <div className="biotic-grid-3">
            {values.map((v, i) => (
              <BioticValueCard key={i} icon={v.icon} title={v.title} description={v.description} />
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="biotic-section">
        <div className="biotic-container">
          <BioticSectionTitle eyebrow="Our Journey" title="The story so far" description="From a small workshop in Jaipur to a community of thousands." align="left" />
          <div className="timeline relative pl-10 max-w-[640px]">
            <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-biotic-line" />
            {timeline.map((t, i) => (
              <div key={i} className="relative pb-11">
                <div className="absolute -left-10 top-1 w-5 h-5 rounded-full bg-biotic-paper border-[3px] border-biotic-red" />
                <BioticTimelineItem year={t.year} title={t.title} description={t.description} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="biotic-section bg-biotic-bg-alt">
        <div className="biotic-container">
          <BioticSectionTitle eyebrow="The People" title="The team behind your rituals" description="Formulators, sourcers, and quality experts who treat every batch like it&apos;s for their own family." />
          <div className="biotic-grid-4">
            {team.map((m, i) => (
              <BioticTeamCard key={i} name={m.name} role={m.role} />
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <BioticNewsletter />
    </div>
  );
}
