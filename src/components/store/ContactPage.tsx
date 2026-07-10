"use client";

import { useState } from "react";
import {
  Package,
  Box,
  Truck,
  TrendingUp,
  Briefcase,
  MoreHorizontal,
  MapPin,
  Factory,
  Clock,
} from "lucide-react";
import { BLOCK_DEFAULTS, deepMerge } from "@/lib/page-blocks";
import { useSeo } from "@/lib/use-seo";
import { StoreHeroBanner } from "@/components/store/StoreHeroBanner";
import { useContentPage, getPageContentData } from "@/lib/use-page-content";
import { ContactFormSection } from "@/components/store/ContactFormSection";

interface ContactPageProps {
  onNavigate: (page: string, data?: unknown) => void;
  data?: Record<string, unknown>;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Package,
  Box,
  Truck,
  TrendingUp,
  Briefcase,
  MoreHorizontal,
  MapPin,
  Factory,
};

function ResolvedIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = iconMap[name];
  if (Icon) return <Icon className={className} />;
  return null;
}

export function ContactPage({
  onNavigate,
  data: _data,
}: ContactPageProps) {
  useSeo("contact", {
    title: "Contact Us | Purva Bites",
    description: "Looking for bulk supply, private label manufacturing or a distribution partnership? Share your requirement and we'll respond within 24 hours.",
  });

  const [selectedType, setSelectedType] = useState<string>("bulk");

  const slugMap: Record<string, string> = {
    "about-page-content": "about-us",
    "mfg-page-content": "manufacturing",
    "contact-page-content": "contact-us",
    home: "homepage",
  };

  const cmsSlug =
    (slugMap["contact-page-content"] as string | undefined) ||
    "contact-page-content";

  const { blocks: contactBlocks } = useContentPage("contact-page-content");
  const { blocks: fallbackBlocks } = useContentPage(cmsSlug);
  const effectiveBlocks = contactBlocks ?? fallbackBlocks;
  const cmsContactData = getPageContentData(
    effectiveBlocks,
    "contact-page-content",
    BLOCK_DEFAULTS["contact-page-content"].defaultData,
  );
  const fallbackContact = BLOCK_DEFAULTS["contact-page-content"].defaultData;
  const data = deepMerge(fallbackContact, cmsContactData);

  const hero = (data.hero as Record<string, unknown>) || {};
  const requirementTypes =
    (hero.requirementTypes as Array<{
      id: string;
      label: string;
      icon: string;
    }>) || [];

  const formSection = (data.formSection as Record<string, string>) || {};
  const responsePromise =
    (data.responsePromise as Record<string, unknown>) || {};
  const promiseItems =
    (responsePromise.items as Array<{ label: string; time: string }>) || [];
  const locations = (data.locations as Record<string, unknown>) || {};
      const locationCards =
        (locations.cards as Array<{
          type: string;
          title: string;
          subtitle?: string;
          address?: string;
          accessibility?: string;
          description?: string;
          highlights?: string[];
          cta?: string;
          link?: string;
          buttons?: Array<{ text: string; icon: string; link?: string }>;
        }>) || [];

  return (
    <div className="flex flex-col">
      {/* CT0: Hero */}
      <StoreHeroBanner
        hero={hero}
        requirementTypes={requirementTypes}
        selectedType={selectedType}
        onSelectType={setSelectedType}
      />

      {/* CT1: Contact Form */}
      <ContactFormSection
        title={(formSection.title as string) || "Send us your requirement"}
        subtitle={(formSection.subtitle as string) || "Fields marked * are required. We respond within 24 working hours."}
      />

      {/* Response promise */}
      {promiseItems.length > 0 && (
        <section className="bg-muted/40 py-8 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 max-w-md mx-auto">
              <p className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4" />{" "}
                {(responsePromise.title as string) || "Our response commitment"}
              </p>
              <div className="space-y-3">
                {promiseItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between items-center text-xs border-b pb-2 last:border-0"
                  >
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-primary font-medium">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
              {(responsePromise.footer as string) && (
                <p className="text-[10px] text-muted-foreground mt-3">
                  {responsePromise.footer as string}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CT2: Address Cards */}
      {locationCards.length > 0 && (
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-5xl">
            {(locations.title as string) && (
              <h2 className="text-lg font-bold mb-8">
                {locations.title as string}
              </h2>
            )}
            <div className="grid md:grid-cols-3 gap-6">
              {locationCards.map((card) => (
                <div
                  key={card.title}
                  className={`bg-background border rounded-xl p-5 border-t-4 ${card.type === "visit" ? "border-t-primary bg-primary/5 border-primary/20" : card.type === "factory" ? "border-t-primary" : "border-t-muted"}`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <ResolvedIcon
                      name={card.type === "visit" ? "MapPin" : "Factory"}
                      className={`h-5 w-5 ${card.type === "factory" || card.type === "visit" ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <p className="text-sm font-semibold">{card.title}</p>
                    {card.subtitle && (
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-auto">
                        {card.subtitle}
                      </span>
                    )}
                  </div>
                  {card.address && (
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3 whitespace-pre-line">
                      {card.address}
                    </p>
                  )}
                  {card.accessibility && (
                    <p className="text-xs text-muted-foreground mb-4">
                      {card.accessibility}
                    </p>
                  )}
                  {card.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                      {card.description}
                    </p>
                  )}
                  {card.highlights && (
                    <div className="space-y-2 mb-5">
                      {card.highlights.map((h) => (
                        <p
                          key={h}
                          className="text-xs text-muted-foreground flex items-center gap-2"
                        >
                          <span className="text-primary">✓</span> {h}
                        </p>
                      ))}
                    </div>
                  )}
                  {card.buttons && (
                    <div className="flex gap-2">
                      {card.buttons.map((btn) => {
                        const isVisitButton =
                          /book|schedule|visit/i.test(btn.text || "");
                        const fallbackLink =
                          btn.text === "Get directions"
                            ? card.address
                              ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(card.address)}`
                              : undefined
                            : isVisitButton
                              ? "#contact-form"
                              : undefined;
                        const href = btn.link || fallbackLink;
                        if (href) {
                          const isExternal = href.startsWith("http");
                          return (
                            <a
                              key={btn.text}
                              href={href}
                              target={isExternal ? "_blank" : undefined}
                              rel={isExternal ? "noopener noreferrer" : undefined}
                              className="text-[10px] border rounded px-2 py-1 flex items-center gap-1 hover:bg-muted"
                            >
                              <ResolvedIcon name={btn.icon} className="h-3 w-3" />{" "}
                              {btn.text}
                            </a>
                          );
                        }
                        return (
                          <button
                            key={btn.text}
                            className="text-[10px] border rounded px-2 py-1 flex items-center gap-1 hover:bg-muted"
                          >
                            <ResolvedIcon name={btn.icon} className="h-3 w-3" />{" "}
                            {btn.text}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {card.cta && (
                    <>
                      {card.link ? (
                        <a
                          href={card.link}
                          className="w-full bg-primary text-primary-foreground text-xs font-medium rounded py-2.5 hover:bg-primary/90 transition-colors text-center block"
                        >
                          {card.cta}
                        </a>
                      ) : (
                        <button
                          onClick={() => {
                            const form = document.getElementById("contact-form");
                            if (form) form.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="w-full bg-primary text-primary-foreground text-xs font-medium rounded py-2.5 hover:bg-primary/90 transition-colors"
                        >
                          {card.cta}
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
