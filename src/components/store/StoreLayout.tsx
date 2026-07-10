"use client";

import {
  useEffect,
  useRef,
  ReactNode,
  cloneElement,
  isValidElement,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/lib/store";
import { StoreHeader } from "./StoreHeader";
import { StoreFooter } from "./StoreFooter";
import { BackToTop } from "./BackToTop";
import { CookieConsent } from "./CookieConsent";
import { MobileBottomNav } from "./MobileBottomNav";
import { CompareBar } from "./CompareBar";
import { GlobalEnquiryModal } from "./GlobalEnquiryModal";
import { StickyCtaBar } from "./StickyCtaBar";
import { CustomScripts } from "./CustomScripts";

interface StoreLayoutProps {
  currentPage: string;
  onNavigate: (page: string, data?: unknown) => void;
  children: ReactNode;
}

export function StoreLayout({
  currentPage,
  onNavigate,
  children,
}: StoreLayoutProps) {
  const { auth, setWishlistIds } = useAppStore();
  const settings = useAppStore((s) => s.settings);
  const fetchSettings = useAppStore((s) => s.fetchSettings);
  const prevPageRef = useRef(currentPage);

  useEffect(() => {
    if (!settings) {
      fetchSettings();
    }
  }, [settings, fetchSettings]);

  // Sync wishlist IDs for instant UI feedback
  useQuery({
    queryKey: ["wishlist-ids"],
    enabled: !!auth.user,
    queryFn: async () => {
        const res = await fetch("/api/wishlist");
        const data = await res.json();
        const ids = (data.items || []).map((i: any) => i.productId);
        setWishlistIds(ids);
        return ids;
    }
  });

  useEffect(() => {
    if (!settings) return;

    const siteName = settings.site_name || "Purva Bites";
    const siteDesc =
      settings.site_description || "Premium Products & B2B Wholesale Supplier";
    const contactEmail = settings.contact_email || "";
    const contactPhone = settings.contact_phone || "";

    const orgJsonLd: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteName,
      description: siteDesc,
      url: typeof window !== "undefined" ? window.location.origin : "",
    };

    if (settings.site_logo) {
      orgJsonLd.logo = settings.site_logo;
    }

    const contactPoint: Record<string, unknown> = {
      "@type": "ContactPoint",
      contactType: "sales",
      availableLanguage: ["English"],
    };
    if (contactEmail) contactPoint.email = contactEmail;
    if (contactPhone) contactPoint.telephone = contactPhone;
    orgJsonLd.contactPoint = contactPoint;

    const existing = document.getElementById("layout-org-jsonld");
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(orgJsonLd);
    script.id = "layout-org-jsonld";
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("layout-org-jsonld");
      if (el) el.remove();
    };
  }, [settings]);

  useEffect(() => {
    if (prevPageRef.current !== currentPage) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      prevPageRef.current = currentPage;
    }
  }, [currentPage]);

  useEffect(() => {
    if (settings?.chat_widget_id) {
        const script = document.createElement("script");
        script.async = true;
        script.src = `https://embed.tawk.to/${settings.chat_widget_id}/default`;
        script.charset = "UTF-8";
        script.setAttribute("crossorigin", "*");
        document.body.appendChild(script);
        return () => {
            const currentScript = document.querySelector(`script[src="https://embed.tawk.to/${settings.chat_widget_id}/default"]`);
            if (currentScript) document.body.removeChild(currentScript);
        };
    }
  }, [settings?.chat_widget_id]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Announcement Bar */}
      {settings?.announcement_text ? (
        <div className="bg-primary text-center text-xs py-2 px-4">
          <p className="text-white">{settings.announcement_text}</p>
        </div>
      ) : null}
      <StoreHeader onNavigate={onNavigate} />

      <main className="flex-1">
        {settings
          ? isValidElement(children)
            ? cloneElement(
                children as React.ReactElement<Record<string, unknown>>,
                { settings },
              )
            : children
          : children}
      </main>

      <StoreFooter onNavigate={onNavigate} settings={settings} />

      <MobileBottomNav onNavigate={onNavigate} />

      <CompareBar />

      <div className="md:mb-16 lg:mb-0">
        <BackToTop />
      </div>

      <CookieConsent />

      <GlobalEnquiryModal />

      <CustomScripts />
    </div>
  );
}

export { type StoreLayoutProps };
