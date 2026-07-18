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
    <div className="vedika-container py-5 px-8 text-xs text-vedika-ink-soft flex items-center gap-2 flex-wrap">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-vedika-sand">/</span>}
          {item.href ? (
            <span className="cursor-pointer">{item.label}</span>
          ) : (
            <span className="text-vedika-red">{item.label}</span>
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
      <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.12] m-0 mb-[.5em]">{title}</h2>
      {description && <p className={`text-vedika-ink-soft ${align === "left" ? "" : "mx-auto"} max-w-[560px]`} style={{ margin: align === "left" ? "0" : undefined }}>{description}</p>}
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
    <div className="vedika-section-tight border-t border-b border-vedika-line">
      <div className="vedika-container">
        <div className="trust-row flex justify-between flex-wrap gap-5">
          {items.map((item, i) => (
            <div key={i} className="trust-item flex items-center gap-2.5 text-xs font-semibold text-vedika-green-dark tracking-wide">
              <span className="text-vedika-red shrink-0">{item.icon}</span>
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
    <div className="flex items-center gap-1 text-xs text-vedika-ink-soft mb-2.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon key={i} className={`${i < rating ? "text-vedika-gold" : "text-vedika-sand"}`} style={{ width: size, height: size }} />
      ))}
      <span className="ml-1">({rating})</span>
    </div>
  );
}

export function VedikaNewsletter() {
  const [email, setEmail] = useState("");
  return (
    <div className="vedika-container vedika-section">
      <div className="newsletter flex flex-col md:flex-row items-center justify-between gap-10 px-6 py-10 sm:p-14 bg-vedika-sand rounded-[28px]">
        <div className="text-center md:text-left">
          <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] mb-2">Stay in the know</h2>
          <p className="text-vedika-ink-soft">Seasonal formulations, ritual tips, and subscriber-only offers.</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setEmail(""); }} className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto shrink-0">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full sm:w-[280px] border border-vedika-green-dark rounded-full px-5 py-3.5 bg-vedika-paper font-inherit text-base outline-none focus:outline-2 focus:outline-vedika-green"
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
    <div className={`faq-item ${open ? "open" : ""} border-b border-vedika-line`}>
      <button onClick={() => setOpen(!open)} className="faq-q flex justify-between items-center py-5.5 w-full text-left bg-transparent border-none cursor-pointer font-[var(--serif)] text-lg text-vedika-green-dark">
        {question}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px] shrink-0 transition-transform duration-300" style={{ transform: open ? "rotate(45deg)" : "rotate(0)" }}>
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
      <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: open ? "200px" : "0", paddingBottom: open ? "22px" : "0" }}>
        <p className="text-vedika-ink-soft m-0">{answer}</p>
      </div>
    </div>
  );
}

export function VedikaContactCard({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const content = (
    <div className="contact-card bg-vedika-paper border border-vedika-line rounded-xl p-6 flex gap-4 items-start mb-4">
      <div className="w-[46px] h-[46px] rounded-full bg-vedika-green-tint shrink-0 flex items-center justify-center text-vedika-green">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-vedika-green-dark mb-1">{label}</div>
        <div className="text-sm text-vedika-ink-soft">{value}</div>
      </div>
    </div>
  );
  if (href) return <a href={href} className="no-underline text-inherit block">{content}</a>;
  return content;
}

export function VedikaTimelineItem({ year, title, description }: { year: string; title: string; description: string }) {
  return (
    <div className="relative pb-11">
      <div className="font-fraunces text-vedika-red font-semibold text-lg">{year}</div>
      <h4 className="my-1 mb-2">{title}</h4>
      <p className="text-vedika-ink-soft m-0">{description}</p>
    </div>
  );
}

export function VedikaValueCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="value-card vedika-card p-9 text-left">
      <div className="w-12 h-12 rounded-full bg-vedika-green-tint flex items-center justify-center text-vedika-green mb-4">
        {icon}
      </div>
      <h3 className="mb-2">{title}</h3>
      <p className="text-vedika-ink-soft text-sm m-0">{description}</p>
    </div>
  );
}

export function VedikaTeamCard({ name, role }: { name: string; role: string }) {
  const initials = name.split(" ").map(n => n[0]).join("");
  return (
    <div className="text-center">
      <div className="aspect-1 rounded-full mx-auto mb-[18px] w-[70%] bg-gradient-to-br from-vedika-sand to-vedika-gold-tint flex items-center justify-center">
        <span className="font-fraunces text-2xl font-semibold text-vedika-green-dark">{initials}</span>
      </div>
      <h4 className="mb-1">{name}</h4>
      <p className="text-sm text-vedika-ink-soft m-0">{role}</p>
    </div>
  );
}

export function VedikaRitualStep({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="relative pt-3">
      <div className="font-fraunces text-[3.2rem] text-vedika-sand leading-none mb-2 font-semibold">
        {String(number).padStart(2, "0")}
      </div>
      <h3 className="mb-2">{title}</h3>
      <p className="text-vedika-ink-soft m-0">{description}</p>
    </div>
  );
}

export function VedikaHeroSection({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description?: string; children?: React.ReactNode }) {
  return (
    <section className="bg-vedika-green-dark text-vedika-bg py-[70px] pb-[60px] relative overflow-hidden">
      <div className="vedika-container relative z-1">
        {eyebrow && <div className="text-vedika-gold vedika-eyebrow">{eyebrow}</div>}
        <h1 className="text-white text-[clamp(2.4rem,4.5vw,3.8rem)] leading-[1.05] max-w-[640px]">{title}</h1>
        {description && <p className="text-[#B7C0B4] max-w-[560px] mt-3">{description}</p>}
        {children}
      </div>
      <HerbDeco className="w-[320px] h-[320px] absolute -right-15 -top-15 opacity-12" />
    </section>
  );
}

export function VedikaPagination({ current, total, onChange }: { current: number; total: number; onChange: (page: number) => void }) {
  if (total <= 1) return null;
  return (
    <div className="flex justify-center gap-2 mt-14">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold cursor-pointer font-inherit transition-all duration-200 ${
            i + 1 === current
              ? "bg-vedika-green text-white border-vedika-green"
              : "bg-transparent text-vedika-ink-soft border-vedika-line"
          }`}
          style={{ border: "1px solid" }}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}

export function VedikaFilterSidebar({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-vedika-paper border border-vedika-line rounded-xl p-[26px] mb-5">
      {children}
    </div>
  );
}

export function VedikaFilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h4 className="text-sm uppercase tracking-wide mb-4 text-vedika-green-dark">{title}</h4>
      <div className="filter-list">{children}</div>
    </div>
  );
}

export function VedikaCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-vedika-ink-soft mb-3 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="accent-vedika-green w-[15px] h-[15px]" />
      {label}
    </label>
  );
}

export function VedikaBlogCard({ title, category, date, readTime, onClick }: { title: string; category?: string; date?: string; readTime?: string; onClick?: () => void }) {
  return (
    <div className="bg-vedika-paper border border-vedika-line rounded-xl overflow-hidden transition-all duration-300 cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_12px_30px_-14px_rgba(28,44,35,0.28)]"
      onClick={onClick}
    >
      <div className="aspect-[16/10] bg-gradient-to-br from-vedika-gold-tint to-vedika-bg-alt flex items-center justify-center">
        <LeafSimple className="w-[40%] h-[40%] text-vedika-green opacity-30" />
      </div>
      <div className="p-6">
        {category && <span className="text-[.7rem] tracking-wide uppercase text-vedika-red font-bold mb-2.5 block">{category}</span>}
        <h3 className="mb-2.5 leading-[1.3] text-lg">{title}</h3>
        <div className="flex gap-3.5 text-xs text-vedika-ink-soft mt-4 items-center">
          {date && (
            <span className="flex items-center gap-1">
              <ClockIcon className="w-[13px] h-[13px] text-vedika-sand" />
              {date}
            </span>
          )}
          {readTime && (
            <span className="flex items-center gap-1">
              <ClockIcon className="w-[13px] h-[13px] text-vedika-sand" />
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
    <div className="testi-card vedika-card p-8">
      <QuoteIcon className="w-6 h-6 text-vedika-sand mb-3 opacity-50" />
      <div className="font-fraunces text-lg text-vedika-green-dark mb-5">{quote}</div>
      <div className="flex items-center gap-3">
        <div className="w-[42px] h-[42px] rounded-full bg-vedika-sand flex items-center justify-center font-fraunces font-semibold text-vedika-green-dark shrink-0">
          {abbr}
        </div>
        <div>
          <strong className="text-sm block">{name}</strong>
          {role && <span className="text-xs text-vedika-ink-soft block">{role}</span>}
        </div>
      </div>
    </div>
  );
}

export function VedikaCategoryCard({ name, count, icon, onClick }: { name: string; count?: number; icon?: React.ReactNode; onClick?: () => void }) {
  return (
    <div className="bg-vedika-paper rounded-[28px] p-9 text-center border border-vedika-line transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_-14px_rgba(28,44,35,0.28)]"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className="w-16 h-16 mx-auto mb-5 bg-vedika-green-tint rounded-full flex items-center justify-center">
        {icon || <LeafSimple className="w-[30px] h-[30px] text-vedika-green" />}
      </div>
      <h3 className="mb-1.5">{name}</h3>
      <p className="text-vedika-ink-soft text-sm mb-3.5">Handpicked formulations</p>
      {count !== undefined && <span className="text-xs text-vedika-red font-semibold tracking-wide">{count} products</span>}
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
    <div className="bg-vedika-paper rounded-xl border border-vedika-line overflow-hidden relative transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_-14px_rgba(28,44,35,0.28)]">
      <div className={`aspect-[1/1.05] flex items-center justify-center relative overflow-hidden ${image ? "bg-vedika-bg-alt" : "bg-gradient-to-br from-vedika-bg-alt to-vedika-green-tint"}`}>
        {image ? (
          <Image src={image} alt={product.name} fill className="object-cover" sizes="(max-width: 680px) 100vw, 25vw" />
        ) : (
          <LeafSimple className="w-[56%] h-[56%] text-vedika-green opacity-30" />
        )}
        {onToggleWishlist && (
          <button onClick={() => onToggleWishlist(product.id)} className={`icon-circle-sm absolute top-3 right-3 ${inWishlist ? "text-vedika-red" : "text-vedika-green-dark"}`} style={{ color: inWishlist ? "var(--vedika-red)" : undefined }}>
            <HeartIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="p-5">
        {product.categoryName && <div className="text-xs text-vedika-ink-soft mb-2">{product.categoryName}</div>}
        <h4 className="font-fraunces text-lg mb-1 text-vedika-green-dark">{product.name}</h4>
        <div className="flex items-center justify-between mt-2.5">
          <div className="font-fraunces text-xl font-semibold text-vedika-green-dark">
            {formatPrice ? formatPrice(product.price) : `₹${product.price}`}
            {product.comparePrice && (
              <span className="text-xs text-vedika-sand line-through ml-1.5 font-work-sans">
                {formatPrice ? formatPrice(product.comparePrice) : `₹${product.comparePrice}`}
              </span>
            )}
          </div>
          {onAddToCart && (
            <button onClick={() => onAddToCart(product)} className="icon-circle hover:bg-vedika-green-dark transition-colors duration-200">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
