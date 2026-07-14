"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// ─── SVG Icons ───────────────────────────────────────────────

interface VedikaIconProps {
  className?: string;
  style?: React.CSSProperties;
}

export function LeafIcon({ className, style }: VedikaIconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} style={style}>
      <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M16 24C16 24 9 20.5 9 13.5C9 9.5 12 7 16 7C20 7 23 9.5 23 13.5C23 20.5 16 24 16 24Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M16 24V10" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  );
}

export function LeafDeco({ className, style }: VedikaIconProps) {
  return (
    <svg viewBox="0 0 120 30" fill="none" className={className} style={style}>
      <path d="M20 15C20 6.7 13.3 0 5 0M20 15C20 23.3 13.3 30 5 30" stroke="currentColor" strokeWidth=".8"/>
      <path d="M60 15C60 6.7 53.3 0 45 0M60 15C60 23.3 53.3 30 45 30" stroke="currentColor" strokeWidth=".8"/>
      <path d="M100 15C100 6.7 93.3 0 85 0M100 15C100 23.3 93.3 30 85 30" stroke="currentColor" strokeWidth=".8"/>
    </svg>
  );
}

export function SearchIcon({ className, style }: VedikaIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={style}>
      <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
    </svg>
  );
}

export function UserIcon({ className, style }: VedikaIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={style}>
      <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>
    </svg>
  );
}

export function CartIcon({ className, style }: VedikaIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={style}>
      <path d="M4 6h2l1.6 10.2A2 2 0 0 0 9.6 18h7.8a2 2 0 0 0 2-1.7L21 8H7"/>
      <circle cx="10" cy="21" r="1"/><circle cx="18" cy="21" r="1"/>
    </svg>
  );
}

export function MenuIcon({ className, style }: VedikaIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} style={style}>
      <path d="M3 6h18M3 12h18M3 18h18"/>
    </svg>
  );
}

export function CloseIcon({ className, style }: VedikaIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} style={style}>
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  );
}

export function HeartIcon({ className, style }: VedikaIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={style}>
      <path d="M12 21S4 15.5 4 9.5 7.5 4 12 8.5 20 4 20 9.5 12 21 12 21z"/>
    </svg>
  );
}

export function StarIcon({ className, style }: VedikaIconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} style={style}>
      <path d="M8 1.5l1.8 3.7 4.2.6-3 3 .7 4.2L8 11.3l-3.7 2 .7-4.2-3-3 4.2-.6L8 1.5z"/>
    </svg>
  );
}

export function TruckIcon({ className, style }: VedikaIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={style}>
      <rect x="2" y="4" width="14" height="12" rx="1"/><path d="M16 8h3l3 3v4h-2"/><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="18.5" cy="17.5" r="2.5"/>
    </svg>
  );
}

export function LeafSimple({ className, style }: VedikaIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={style}>
      <path d="M12 22V10M12 10c-3 0-6 1-6 5s3 5 6 5 6-1 6-5-3-5-6-5z"/>
    </svg>
  );
}

export function AwardIcon({ className, style }: VedikaIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={style}>
      <circle cx="12" cy="8" r="5"/><path d="M8.5 13L7 22l5-3 5 3-1.5-9"/>
    </svg>
  );
}

export function ShieldIcon({ className, style }: VedikaIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={style}>
      <path d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4z"/>
    </svg>
  );
}

export function MailIcon({ className, style }: VedikaIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={style}>
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13 2 4"/>
    </svg>
  );
}

export function PhoneIcon({ className, style }: VedikaIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={style}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.9 19.9 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.3 1.3.8 2.6 1.5 3.8a2 2 0 0 1-.5 2.3l-1.2 1.2a15.9 15.9 0 0 0 6.3 6.3l1.2-1.2a2 2 0 0 1 2.3-.5c1.1.6 2.4 1.1 3.8 1.4 1 .2 1.7 1 1.7 2z"/>
    </svg>
  );
}

export function PinIcon({ className, style }: VedikaIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={style}>
      <circle cx="12" cy="10" r="3"/><path d="M12 22s-8-7-8-12a8 8 0 0 1 16 0c0 5-8 12-8 12z"/>
    </svg>
  );
}

export function QuoteIcon({ className, style }: VedikaIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M10 11H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5c0 4-4 5-4 5v-2s2-.5 2-3zm10 0h-4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5c0 4-4 5-4 5v-2s2-.5 2-3z"/>
    </svg>
  );
}

export function ClockIcon({ className, style }: VedikaIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={style}>
      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
    </svg>
  );
}

export function HerbDeco({ className, style }: VedikaIconProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className} style={style}>
      <path d="M100 20c-20 40-50 50-50 90s30 60 50 70c20-10 50-30 50-70s-30-50-50-90z" stroke="currentColor" strokeWidth=".6" fill="currentColor" fillOpacity=".06"/>
      <circle cx="100" cy="20" r="4" fill="currentColor" fillOpacity=".15"/>
      <path d="M70 55c-15-10-30-5-35 10s5 25 15 35" stroke="currentColor" strokeWidth=".6"/>
      <path d="M130 55c15-10 30-5 35 10s-5 25-15 35" stroke="currentColor" strokeWidth=".6"/>
    </svg>
  );
}

// ─── COMPONENTS ─────────────────────────────────────────────

export function VedikaBreadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <div className="vedika-container" style={{ padding: "20px 32px", fontSize: ".82rem", color: "var(--vedika-ink-soft)", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
      {items.map((item, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {i > 0 && <span style={{ color: "var(--vedika-sand)" }}>/</span>}
          {item.href ? (
            <span onClick={() => {}} style={{ cursor: "pointer" }}>{item.label}</span>
          ) : (
            <span style={{ color: "var(--vedika-red)" }}>{item.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}

export function VedikaSectionTitle({ eyebrow, title, description, align = "center" }: { eyebrow?: string; title: string; description?: string; align?: "center" | "left" }) {
  return (
    <div className={`vedika-section-head ${align === "left" ? "left" : ""}`}>
      {eyebrow && <div className="vedika-eyebrow">{eyebrow}</div>}
      <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.6rem)", lineHeight: 1.12, margin: "0 0 .5em" }}>{title}</h2>
      {description && <p style={{ color: "var(--vedika-ink-soft)", maxWidth: align === "left" ? undefined : "560px", margin: align === "left" ? "0" : "0 auto" }}>{description}</p>}
    </div>
  );
}

export function VedikaTrustStrip() {
  const items = [
    { icon: <TruckIcon className="w-[22px] h-[22px]" />, label: "Free shipping across India on orders above ₹799" },
    { icon: <LeafSimple className="w-[22px] h-[22px]" />, label: "Formulated per classical Ayurvedic texts" },
    { icon: <AwardIcon className="w-[22px] h-[22px]" />, label: "Handcrafted in small batches" },
    { icon: <ShieldIcon className="w-[22px] h-[22px]" />, label: "30-day satisfaction guarantee" },
  ];
  return (
    <div className="vedika-section-tight" style={{ borderTop: "1px solid var(--vedika-line)", borderBottom: "1px solid var(--vedika-line)" }}>
      <div className="vedika-container">
        <div className="trust-row" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
          {items.map((item, i) => (
            <div key={i} className="trust-item" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: ".82rem", fontWeight: 600, color: "var(--vedika-green-dark)", letterSpacing: ".02em" }}>
              <span style={{ color: "var(--vedika-red)", flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function VedikaStarRating({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div className="stars" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: ".76rem", color: "var(--vedika-ink-soft)", marginBottom: "10px" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon key={i} className={`w-[${size}px] h-[${size}px]`} style={{ color: i < rating ? "var(--vedika-gold)" : "var(--vedika-sand)", width: size, height: size }} />
      ))}
      <span style={{ marginLeft: 4 }}>({rating})</span>
    </div>
  );
}

export function VedikaNewsletter() {
  const [email, setEmail] = useState("");
  return (
    <div className="vedika-container vedika-section">
      <div className="newsletter flex flex-col md:flex-row items-center justify-between gap-10 px-6 py-10 sm:p-14" style={{ background: "var(--vedika-sand)", borderRadius: "28px" }}>
        <div className="text-center md:text-left">
          <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.6rem)", marginBottom: 8 }}>Stay in the know</h2>
          <p style={{ color: "var(--vedika-ink-soft)" }}>Seasonal formulations, ritual tips, and subscriber-only offers.</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setEmail(""); }} className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto shrink-0">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            style={{ border: "1px solid var(--vedika-green-dark)", borderRadius: "100px", padding: "14px 20px", background: "var(--vedika-paper)", fontFamily: "inherit", fontSize: "1rem", outline: "none" }}
            className="w-full sm:w-[280px]"
            onFocus={(e) => e.target.style.outline = "2px solid var(--vedika-green)"}
            onBlur={(e) => e.target.style.outline = "none"}
          />
          <button type="submit" className="vedika-btn vedika-btn-primary">Subscribe</button>
        </form>
      </div>
    </div>
  );
}

export function VedikaFAQItem({ question, answer, open: defaultOpen = false }: { question: string; answer: string; open?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`faq-item ${open ? "open" : ""}`} style={{ borderBottom: "1px solid var(--vedika-line)" }}>
      <button onClick={() => setOpen(!open)} className="faq-q" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 0", fontFamily: "var(--serif)", fontSize: "1.05rem", color: "var(--vedika-green-dark)", cursor: "pointer", background: "none", border: "none", width: "100%", textAlign: "left" }}>
        {question}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18, flexShrink: 0, transition: "transform .25s ease", transform: open ? "rotate(45deg)" : "rotate(0)" }}>
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
      <div className="faq-a" style={{ maxHeight: open ? "200px" : "0", overflow: "hidden", transition: "max-height .3s ease", paddingBottom: open ? "22px" : "0" }}>
        <p style={{ color: "var(--vedika-ink-soft)", margin: 0 }}>{answer}</p>
      </div>
    </div>
  );
}

export function VedikaContactCard({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const content = (
    <div className="contact-card" style={{ background: "var(--vedika-paper)", border: "1px solid var(--vedika-line)", borderRadius: "14px", padding: "24px", display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "16px" }}>
      <div className="ic" style={{ width: 46, height: 46, borderRadius: "50%", background: "var(--vedika-green-tint)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--vedika-green)" }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: ".84rem", fontWeight: 600, color: "var(--vedika-green-dark)", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: ".88rem", color: "var(--vedika-ink-soft)" }}>{value}</div>
      </div>
    </div>
  );
  if (href) return <a href={href} style={{ textDecoration: "none", color: "inherit", display: "block" }}>{content}</a>;
  return content;
}

export function VedikaTimelineItem({ year, title, description }: { year: string; title: string; description: string }) {
  return (
    <div className="timeline-item" style={{ position: "relative", paddingBottom: 44 }}>
      <div className="yr" style={{ fontFamily: "var(--font-fraunces), Georgia, serif", color: "var(--vedika-red)", fontWeight: 600, fontSize: "1.1rem" }}>{year}</div>
      <h4 style={{ margin: "4px 0 8px" }}>{title}</h4>
      <p style={{ color: "var(--vedika-ink-soft)", margin: 0 }}>{description}</p>
    </div>
  );
}

export function VedikaValueCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="value-card vedika-card" style={{ padding: "36px 28px", textAlign: "left" }}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--vedika-green-tint)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--vedika-green)", marginBottom: 16 }}>
        {icon}
      </div>
      <h3 style={{ marginBottom: 8 }}>{title}</h3>
      <p style={{ color: "var(--vedika-ink-soft)", fontSize: ".88rem", margin: 0 }}>{description}</p>
    </div>
  );
}

export function VedikaTeamCard({ name, role }: { name: string; role: string }) {
  const initials = name.split(" ").map(n => n[0]).join("");
  return (
    <div className="team-card" style={{ textAlign: "center" }}>
      <div className="team-photo" style={{ aspectRatio: "1", borderRadius: "50%", margin: "0 auto 18px", width: "70%", background: "linear-gradient(160deg, var(--vedika-sand), var(--vedika-gold-tint))", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: "1.5rem", fontWeight: 600, color: "var(--vedika-green-dark)" }}>{initials}</span>
      </div>
      <h4 style={{ marginBottom: 4 }}>{name}</h4>
      <p style={{ fontSize: ".84rem", color: "var(--vedika-ink-soft)", margin: 0 }}>{role}</p>
    </div>
  );
}

export function VedikaRitualStep({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="ritual-step" style={{ position: "relative", paddingTop: 12 }}>
      <div className="ritual-num" style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: "3.2rem", color: "var(--vedika-sand)", lineHeight: 1, marginBottom: 8, fontWeight: 600 }}>
        {String(number).padStart(2, "0")}
      </div>
      <h3 style={{ marginBottom: 8 }}>{title}</h3>
      <p style={{ color: "var(--vedika-ink-soft)", margin: 0 }}>{description}</p>
    </div>
  );
}

export function VedikaHeroSection({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description?: string; children?: React.ReactNode }) {
  return (
    <section className="page-hero" style={{ background: "var(--vedika-green-dark)", color: "var(--vedika-bg)", padding: "70px 0 60px", position: "relative", overflow: "hidden" }}>
      <div className="vedika-container" style={{ position: "relative", zIndex: 1 }}>
        {eyebrow && <div className="vedika-eyebrow" style={{ color: "var(--vedika-gold)" }}>{eyebrow}</div>}
        <h1 style={{ color: "#fff", fontSize: "clamp(2.4rem,4.5vw,3.8rem)", lineHeight: 1.05, maxWidth: 640 }}>{title}</h1>
        {description && <p style={{ color: "#B7C0B4", maxWidth: 560, marginTop: 12 }}>{description}</p>}
        {children}
      </div>
      <HerbDeco className="w-[320px] h-[320px]" style={{ position: "absolute", right: -60, top: -60, opacity: 0.12 }} />
    </section>
  );
}

export function VedikaPagination({ current, total, onChange }: { current: number; total: number; onChange: (page: number) => void }) {
  if (total <= 1) return null;
  return (
    <div className="pagination" style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "56px" }}>
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          className={i + 1 === current ? "active" : ""}
          style={{
            width: 40, height: 40, borderRadius: "50%", border: "1px solid var(--vedika-line)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".86rem", fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
            background: i + 1 === current ? "var(--vedika-green)" : "transparent",
            color: i + 1 === current ? "#fff" : "var(--vedika-ink-soft)",
            borderColor: i + 1 === current ? "var(--vedika-green)" : "var(--vedika-line)",
            transition: "all .2s ease",
          }}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}

export function VedikaFilterSidebar({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--vedika-paper)", border: "1px solid var(--vedika-line)", borderRadius: "14px", padding: "26px", marginBottom: "20px" }}>
      {children}
    </div>
  );
}

export function VedikaFilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h4 style={{ fontSize: ".86rem", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 16, color: "var(--vedika-green-dark)" }}>{title}</h4>
      <div className="filter-list">{children}</div>
    </div>
  );
}

export function VedikaCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: ".88rem", color: "var(--vedika-ink-soft)", marginBottom: 12, cursor: "pointer" }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ accentColor: "var(--vedika-green)", width: 15, height: 15 }} />
      {label}
    </label>
  );
}

export function VedikaBlogCard({ title, category, date, readTime, onClick }: { title: string; category?: string; date?: string; readTime?: string; onClick?: () => void }) {
  return (
    <div className="blog-card" style={{ background: "var(--vedika-paper)", border: "1px solid var(--vedika-line)", borderRadius: "14px", overflow: "hidden", transition: "transform .3s ease, box-shadow .3s ease", cursor: "pointer" }}
      onClick={onClick}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 12px 30px -14px rgba(28,44,35,.28)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div className="blog-media" style={{ aspectRatio: "16/10", background: "linear-gradient(150deg, var(--vedika-gold-tint), var(--vedika-bg-alt))", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <LeafSimple className="w-[40%] h-[40%]" style={{ color: "var(--vedika-green)", opacity: 0.3 }} />
      </div>
      <div className="blog-body" style={{ padding: 24 }}>
        {category && <span className="blog-cat" style={{ fontSize: ".7rem", letterSpacing: ".06em", textTransform: "uppercase", color: "var(--vedika-red)", fontWeight: 700, marginBottom: 10, display: "block" }}>{category}</span>}
        <h3 style={{ marginBottom: 10, lineHeight: 1.3, fontSize: "1.15rem" }}>{title}</h3>
        <div className="blog-meta" style={{ display: "flex", gap: 14, fontSize: ".78rem", color: "var(--vedika-ink-soft)", marginTop: 16, alignItems: "center" }}>
          {date && (
            <span className="m-item" style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <ClockIcon className="w-[13px] h-[13px]" style={{ color: "var(--vedika-sand)" }} />
              {date}
            </span>
          )}
          {readTime && (
            <span className="m-item" style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <ClockIcon className="w-[13px] h-[13px]" style={{ color: "var(--vedika-sand)" }} />
              {readTime}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function VedikaTestimonialCard({ quote, name, title: role, initials }: { quote: string; name: string; title?: string; initials?: string }) {
  const abbr = initials || name.split(" ").map(n => n[0]).join("");
  return (
    <div className="testi-card vedika-card" style={{ padding: "32px" }}>
      <QuoteIcon className="w-6 h-6" style={{ color: "var(--vedika-sand)", marginBottom: 12, opacity: 0.5 }} />
      <div className="testi-quote" style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: "1.05rem", color: "var(--vedika-green-dark)", marginBottom: 20 }}>{quote}</div>
      <div className="testi-person" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="avatar" style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--vedika-sand)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-fraunces), Georgia, serif", fontWeight: 600, color: "var(--vedika-green-dark)", flexShrink: 0 }}>
          {abbr}
        </div>
        <div>
          <strong style={{ fontSize: ".92rem", display: "block" }}>{name}</strong>
          {role && <span style={{ fontSize: ".8rem", color: "var(--vedika-ink-soft)", display: "block" }}>{role}</span>}
        </div>
      </div>
    </div>
  );
}

export function VedikaCategoryCard({ name, count, icon, onClick }: { name: string; count?: number; icon?: React.ReactNode; onClick?: () => void }) {
  return (
    <div className="cat-card" style={{ background: "var(--vedika-paper)", borderRadius: "28px", padding: "36px 28px", textAlign: "center", border: "1px solid var(--vedika-line)", cursor: onClick ? "pointer" : "default", transition: "transform .3s ease, box-shadow .3s ease" }}
      onClick={onClick}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 12px 30px -14px rgba(28,44,35,.28)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div className="cat-icon" style={{ width: 64, height: 64, margin: "0 auto 20px", background: "var(--vedika-green-tint)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon || <LeafSimple className="w-[30px] h-[30px]" style={{ color: "var(--vedika-green)" }} />}
      </div>
      <h3 style={{ marginBottom: 6 }}>{name}</h3>
      <p style={{ color: "var(--vedika-ink-soft)", fontSize: ".86rem", marginBottom: 14 }}>Handpicked formulations</p>
      {count !== undefined && <span className="count" style={{ fontSize: ".76rem", color: "var(--vedika-red)", fontWeight: 600, letterSpacing: ".03em" }}>{count} products</span>}
    </div>
  );
}

export function VedikaProductCard({ product, onNavigate, formatPrice, onAddToCart, onToggleWishlist, inWishlist }: {
  product: { id: string; name: string; slug: string; price: number; comparePrice?: number | null; images?: string; categoryName?: string };
  onNavigate?: (page: string, slug: string) => void;
  formatPrice?: (price: number) => string;
  onAddToCart?: (product: any) => void;
  onToggleWishlist?: (id: string) => void;
  inWishlist?: boolean;
}) {
  const image = product.images ? (() => {
    try {
      const parsed = JSON.parse(product.images);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
    } catch { return null; }
  })() : null;

  return (
    <div className="product-card" style={{ background: "var(--vedika-paper)", borderRadius: "14px", border: "1px solid var(--vedika-line)", overflow: "hidden", transition: "transform .3s ease, box-shadow .3s ease", position: "relative" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 12px 30px -14px rgba(28,44,35,.28)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div className="product-media" style={{ aspectRatio: "1/1.05", background: image ? "var(--vedika-bg-alt)" : "linear-gradient(160deg, var(--vedika-bg-alt), var(--vedika-green-tint))", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        {image ? (
          <Image src={image} alt={product.name} fill className="object-cover" sizes="(max-width: 680px) 100vw, 25vw" />
        ) : (
          <LeafSimple className="w-[56%] h-[56%]" style={{ color: "var(--vedika-green)", opacity: 0.3 }} />
        )}
        {onToggleWishlist && (
          <button onClick={() => onToggleWishlist(product.id)} className="product-wish" style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: "50%", background: "rgba(255,253,246,.9)", display: "flex", alignItems: "center", justifyContent: "center", color: inWishlist ? "var(--vedika-red)" : "var(--vedika-green-dark)", border: "none", cursor: "pointer" }}>
            <HeartIcon className="w-[16px] h-[16px]" />
          </button>
        )}
      </div>
      <div className="product-info" style={{ padding: 20 }}>
        {product.categoryName && <div className="cat-label" style={{ fontSize: ".74rem", color: "var(--vedika-ink-soft)", marginBottom: 8 }}>{product.categoryName}</div>}
        <h4 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: "1.05rem", marginBottom: 4, color: "var(--vedika-green-dark)" }}>{product.name}</h4>
        <div className="price-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
          <div className="price" style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: "1.15rem", fontWeight: 600, color: "var(--vedika-green-dark)" }}>
            {formatPrice ? formatPrice(product.price) : `₹${product.price}`}
            {product.comparePrice && (
              <span className="was" style={{ fontSize: ".82rem", color: "var(--vedika-sand)", textDecoration: "line-through", marginLeft: 6, fontFamily: "var(--font-work-sans), sans-serif" }}>
                {formatPrice ? formatPrice(product.comparePrice) : `₹${product.comparePrice}`}
              </span>
            )}
          </div>
          {onAddToCart && (
            <button onClick={() => onAddToCart(product)} className="add-btn" style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--vedika-green)", color: "var(--vedika-paper)", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", transition: "background .2s ease" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--vedika-green-dark)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "var(--vedika-green)"}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
