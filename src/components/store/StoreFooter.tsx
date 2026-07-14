"use client";

import { useState, useEffect } from "react";
import { LeafIcon, MailIcon, PhoneIcon, PinIcon } from "./vedika-components";

interface StoreFooterProps {
  onNavigate: (page: string, data?: unknown) => void;
  settings?: Record<string, string> | null;
}

interface FooterMenuItem {
  id: string;
  label: string;
  page?: string;
  url?: string;
  slug?: string;
  children?: FooterMenuItem[];
}

interface FooterMenuData {
  menu: { name: string } | null;
  items: FooterMenuItem[];
}

export function StoreFooter({ onNavigate, settings }: StoreFooterProps) {
  const companyEmail = settings?.site_email || settings?.contact_email || "";
  const companyPhone = settings?.site_phone || settings?.contact_phone || "";
  const companyAddress = settings?.site_address || settings?.contact_address || "";
  const siteName = settings?.site_name || "Vedika Ayurveda";

  const [footerMenus, setFooterMenus] = useState<FooterMenuData[]>([]);
  const [loading, setLoading] = useState(true);

  const facebookUrl = settings?.facebook_url || "#";
  const instagramUrl = settings?.instagram_url || "#";

  useEffect(() => {
    async function fetchFooterMenus() {
      try {
        const locations = ["footer_1", "footer_2", "footer_3"];
        const results = await Promise.all(
          locations.map(async (loc) => {
            const res = await fetch(`/api/menus?location=${loc}`, { cache: "no-store" });
            if (res.ok) return await res.json();
            return { menu: null, items: [] };
          }),
        );
        setFooterMenus(results.filter((r) => r.items && r.items.length > 0));
      } catch { /* ignore */ } finally { setLoading(false); }
    }
    fetchFooterMenus();
  }, []);

  const navigateItem = (item: FooterMenuItem) => {
    if (item.url) {
      if (item.url.startsWith("/")) {
        const segs = item.url.split("/").filter(Boolean);
        if (segs[0] === "products" && segs[1]) onNavigate("product-page", segs[1]);
        else if (segs[0] === "shop" && segs[1]) onNavigate("category", segs[1]);
        else if (segs[0] === "shop") onNavigate("shop");
        else if (segs[0] === "blog" && segs[1]) onNavigate("blog-post", segs[1]);
        else if (segs[0] === "blog") onNavigate("blog");
        else if (segs[0] === "about") onNavigate("about");
        else if (segs[0] === "contact") onNavigate("contact");
        else if (segs[0] === "products") onNavigate("products");
        else onNavigate("content-page", segs.join("/"));
      } else {
        window.open(item.url, "_blank");
      }
    } else if (item.page && item.page !== "url") {
      onNavigate(item.page, item.slug);
    }
  };

  return (
    <footer className="site-footer" style={{ background: "var(--vedika-green-dark)", color: "#CBD3C9", padding: "80px 0 0" }}>
      <div className="vedika-container">
        <div className="footer-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]" style={{ gap: 32, paddingBottom: 56, borderBottom: "1px solid rgba(255,255,255,.1)" }}>
          {/* Brand Column */}
          <div className="footer-col">
            <div className="footer-logo" style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: "1.5rem", color: "#fff", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <LeafIcon className="w-[26px] h-[26px]" style={{ color: "var(--vedika-gold)" }} />
              {siteName}
            </div>
            <p style={{ color: "#98A398", fontSize: ".88rem", lineHeight: 1.7 }}>
              {settings?.site_description || "Rooted in wellness. Small-batch, classical Ayurvedic formulations made with integrity and intention."}
            </p>
            <div className="social-row" style={{ display: "flex", gap: 10, marginTop: 18 }}>
              {facebookUrl !== "#" && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B7C0B4", transition: "background .2s ease" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--vedika-gold)"; e.currentTarget.style.color = "var(--vedika-green-dark)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "#B7C0B4"; }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 15, height: 15 }}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z"/></svg>
                </a>
              )}
              {instagramUrl !== "#" && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B7C0B4", transition: "background .2s ease" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--vedika-gold)"; e.currentTarget.style.color = "var(--vedika-green-dark)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "#B7C0B4"; }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 15, height: 15 }}><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Dynamic Footer Columns */}
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="footer-col">
                <div style={{ height: 14, width: 80, background: "rgba(255,255,255,.1)", borderRadius: 4, marginBottom: 18 }} />
                <div style={{ height: 10, width: 120, background: "rgba(255,255,255,.08)", borderRadius: 4, marginBottom: 11 }} />
                <div style={{ height: 10, width: 100, background: "rgba(255,255,255,.08)", borderRadius: 4, marginBottom: 11 }} />
              </div>
            ))
          ) : footerMenus.length > 0 ? (
            footerMenus.map((menuData, idx) => (
              <div key={idx} className="footer-col">
                <h4 style={{ color: "#fff", fontSize: ".86rem", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 18 }}>
                  {menuData.menu?.name || "Links"}
                </h4>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {menuData.items.map((item) => (
                    <li key={item.id} style={{ marginBottom: 11 }}>
                      <button onClick={() => navigateItem(item)}
                        style={{ fontSize: ".88rem", color: "#B7C0B4", transition: "color .2s ease", background: "none", border: "none", cursor: "pointer", font: "inherit", textAlign: "left" }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "var(--vedika-gold)"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "#B7C0B4"}
                      >
                        {item.label}
                      </button>
                      {item.children && item.children.length > 0 && (
                        <ul style={{ listStyle: "none", margin: "8px 0 0", paddingLeft: 12 }}>
                          {item.children.map((child) => (
                            <li key={child.id} style={{ marginBottom: 8 }}>
                              <button onClick={() => navigateItem(child)}
                                style={{ fontSize: ".82rem", color: "#98A398", transition: "color .2s ease", background: "none", border: "none", cursor: "pointer", font: "inherit", textAlign: "left" }}
                                onMouseEnter={(e) => e.currentTarget.style.color = "var(--vedika-gold)"}
                                onMouseLeave={(e) => e.currentTarget.style.color = "#98A398"}
                              >
                                {child.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div className="footer-col">
              <h4 style={{ color: "#fff", fontSize: ".86rem", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 18 }}>Quick Links</h4>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                <li style={{ marginBottom: 11 }}><button onClick={() => onNavigate("home")} style={{ fontSize: ".88rem", color: "#B7C0B4", background: "none", border: "none", cursor: "pointer", font: "inherit", textAlign: "left" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "var(--vedika-gold)"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#B7C0B4"}
                >Home</button></li>
                <li style={{ marginBottom: 11 }}><button onClick={() => onNavigate("shop")} style={{ fontSize: ".88rem", color: "#B7C0B4", background: "none", border: "none", cursor: "pointer", font: "inherit", textAlign: "left" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "var(--vedika-gold)"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#B7C0B4"}
                >Shop</button></li>
              </ul>
            </div>
          )}

          {/* Support Column */}
          <div className="footer-col">
            <h4 style={{ color: "#fff", fontSize: ".86rem", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 18 }}>Support</h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              <li style={{ marginBottom: 11 }}><button onClick={() => onNavigate("contact")} style={{ fontSize: ".88rem", color: "#B7C0B4", background: "none", border: "none", cursor: "pointer", font: "inherit", textAlign: "left" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--vedika-gold)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#B7C0B4"}
              >Contact Us</button></li>
              <li style={{ marginBottom: 11 }}><button onClick={() => onNavigate("faq")} style={{ fontSize: ".88rem", color: "#B7C0B4", background: "none", border: "none", cursor: "pointer", font: "inherit", textAlign: "left" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--vedika-gold)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#B7C0B4"}
              >FAQ</button></li>
              <li style={{ marginBottom: 11 }}><button onClick={() => onNavigate("tracking")} style={{ fontSize: ".88rem", color: "#B7C0B4", background: "none", border: "none", cursor: "pointer", font: "inherit", textAlign: "left" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--vedika-gold)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#B7C0B4"}
              >Track Order</button></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="footer-col">
            <h4 style={{ color: "#fff", fontSize: ".86rem", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 18 }}>Get in Touch</h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {companyEmail && (
                <li style={{ marginBottom: 11, display: "flex", alignItems: "center", gap: 8 }}>
                  <MailIcon className="w-[14px] h-[14px]" style={{ color: "var(--vedika-gold)", flexShrink: 0 }} />
                  <a href={`mailto:${companyEmail}`} style={{ fontSize: ".86rem", color: "#B7C0B4", transition: "color .2s ease", textDecoration: "none" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "var(--vedika-gold)"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#B7C0B4"}
                  >{companyEmail}</a>
                </li>
              )}
              {companyPhone && (
                <li style={{ marginBottom: 11, display: "flex", alignItems: "center", gap: 8 }}>
                  <PhoneIcon className="w-[14px] h-[14px]" style={{ color: "var(--vedika-gold)", flexShrink: 0 }} />
                  <a href={`tel:${companyPhone}`} style={{ fontSize: ".86rem", color: "#B7C0B4", transition: "color .2s ease", textDecoration: "none" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "var(--vedika-gold)"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#B7C0B4"}
                  >{companyPhone}</a>
                </li>
              )}
              {companyAddress && (
                <li style={{ marginBottom: 11, display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <PinIcon className="w-[14px] h-[14px]" style={{ color: "var(--vedika-gold)", flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: ".86rem", color: "#98A398" }}>{companyAddress}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="footer-bottom" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0", fontSize: ".78rem", color: "#8A9587", flexWrap: "wrap", gap: 12 }}>
          <span>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</span>
          <span>Crafted with care for quality Ayurveda.</span>
        </div>
      </div>
    </footer>
  );
}
