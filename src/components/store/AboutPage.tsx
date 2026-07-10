"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Factory,
  Route,
  Train,
  Plane,
  Truck,
  Quote,
  Target,
  Eye,
  HeartHandshake,
  MapPin,
  Linkedin,
} from "lucide-react";
import { BLOCK_DEFAULTS, deepMerge, normalizePageBlocks } from "@/lib/page-blocks";
import { useAppStore } from "@/lib/store";
import { useSeo } from "@/lib/use-seo";
import { StoreHeroBanner } from "@/components/store/StoreHeroBanner";
import { useContentPage, getPageContentData } from "@/lib/use-page-content";
import { ContactFormSection } from "@/components/store/ContactFormSection";
import { getGoogleMapsEmbedUrl } from "@/lib/utils";

interface AboutPageProps {
  onNavigate: (page: string, data?: unknown) => void;
  data?: Record<string, unknown>;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Target,
  Eye,
  HeartHandshake,
  Factory,
  Route,
  Train,
  Plane,
  Truck,
  MapPin,
  Linkedin,
  Quote,
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

export function AboutPage({ onNavigate, data: externalData }: AboutPageProps) {
  useSeo("about", {
    title: "About Us | Purva Bites",
    description:
      "Built on trust. Driven by quality. From a distribution background to a full-scale FMCG manufacturing company — the Purva Bites story is one of conviction and craft.",
  });

  const { data: cmsData } = useQuery({
    queryKey: ["about-cms"],
    enabled: !externalData,
    queryFn: async () => {
        const res = await fetch("/api/content-pages?slug=about");
        const json = await res.json();
        const page = (json.contentPages || [])[0];
        if (page?.blocks) {
            const blocks = normalizePageBlocks(page.blocks);
            return getPageContentData(
                blocks,
                "about-page-content",
                BLOCK_DEFAULTS["about-page-content"].defaultData
            );
        }
        return null;
    }
  });

  const fallbackAbout = BLOCK_DEFAULTS["about-page-content"].defaultData;
  const data = externalData || deepMerge(fallbackAbout, cmsData || {});

  const hero = (data.hero as Record<string, unknown>) || {};
  const stats = (data.stats as Array<{ value: string; label: string }>) || [];
  const story = (data.story as Record<string, unknown>) || {};
  const narrative = (story.narrative as string[]) || [];
  const timeline =
    (story.timeline as Array<{
      year: string;
      title: string;
      desc: string;
      current?: boolean;
    }>) || [];
  const directors =
    (data.directors as Array<{
      name: string;
      role: string;
      bio: string;
      imageUrl?: string;
      socialUrl?: string;
    }>) || [];
  const quoteData = (data.quote as Record<string, string>) || {};
  const ctaCard = (data.ctaCard as Record<string, string>) || {};
  const missionVisionValues =
    (data.missionVisionValues as Array<{
      icon: string;
      color: string;
      bg: string;
      label: string;
      title: string;
      desc: string;
    }>) || [];
  const location = (data.location as Record<string, unknown>) || {};
  const logistics =
    (location.logistics as Array<{
      icon: string;
      label: string;
      value: string;
    }>) || [];
  const dispatchTags = (location.dispatchTags as string[]) || [];
  const ctaData = (data.cta as Record<string, unknown>) || {};
  const ctaCards =
    (ctaData.cards as Array<{
      icon: string;
      title: string;
      desc: string;
      cta: string;
      page: string;
      useForm?: boolean;
    }>) || [];

  return (
    <div className="flex flex-col">
      {/* A1: Hero */}
      <StoreHeroBanner hero={hero} />

      {/* A2: Who we are */}
      <section className="bg-muted/40 py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row gap-10 items-center">
            <div className="hidden md:block w-1 h-12 bg-primary rounded-full flex-shrink-0" />
            <div className="flex-1">
              {(story.heading as string) ? (
                <h2 className="text-xl font-bold mb-3">
                  {story.heading as string}
                </h2>
              ) : null}
              {(story.subtitle as string) ? (
                <p className="text-muted-foreground leading-relaxed">
                  {story.subtitle as string}
                </p>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-3 flex-shrink-0">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-background border rounded-lg p-4 text-center"
                >
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* A3: Company Story / Timeline */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Our Journey
          </p>
          <h2 className="text-2xl font-bold mb-10">How we got here</h2>
          <div className="flex flex-col md:flex-row gap-10">
            <div className="flex-1 md:pr-10 md:border-r">
              {narrative.map((p, i) => (
                <p
                  key={i}
                  className="text-muted-foreground leading-relaxed mb-5"
                >
                  {p}
                </p>
              ))}
              {(story.ctaText as string) ? (
                <button
                  onClick={() =>
                    onNavigate((story.ctaPage as string) || "manufacturing")
                  }
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {story.ctaText as string}
                </button>
              ) : null}
            </div>
            <div className="flex-1 md:pl-10">
              <div className="space-y-0">
                {timeline.map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${item.current ? "bg-emerald-600" : "bg-primary"}`}
                      />
                      {i < timeline.length - 1 && (
                        <div className="w-px h-8 bg-border" />
                      )}
                    </div>
                    <div className="pb-6">
                      <p
                        className={`text-xs font-semibold ${item.current ? "text-emerald-600" : "text-primary"}`}
                      >
                        {item.year}
                      </p>
                      <p className="text-sm font-semibold mt-0.5">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* A4: Director Profiles */}
      <section className="bg-muted/40 py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Leadership
          </p>
          <h2 className="text-2xl font-bold mb-2">
            The people behind Purva Bites
          </h2>
          <p className="text-sm text-muted-foreground mb-10">
            Built by people who understand FMCG from the ground up
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {directors.map((director, i) => (
              <div
                key={i}
                className="bg-background border rounded-xl overflow-hidden"
              >
                <div className="h-[65%] bg-muted flex items-center justify-center overflow-hidden">
                  {director.imageUrl ? (
                    <img
                      src={director.imageUrl}
                      alt={director.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs text-muted-foreground">
                      Director Photo
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold">{director.name}</h3>
                  <p className="text-xs text-primary font-semibold mb-3">
                    {director.role}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    {director.bio}
                  </p>
                  {director.socialUrl && false && (
                    <div className="flex gap-2">
                      <a
                        href={director.socialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs border rounded px-2 py-1 flex items-center gap-1 hover:bg-muted"
                      >
                        <Linkedin className="h-3 w-3" /> Connect
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-4 justify-start">
              {(quoteData.text as string) ? (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
                  <Quote className="h-5 w-5 text-primary mb-3" />
                  <p className="text-sm text-primary italic leading-relaxed">
                    {quoteData.text as string}
                  </p>
                  <div className="flex items-center mt-3">
                    {(quoteData.authorImage as string) && (
                      <img
                        src={quoteData.authorImage as string}
                        alt={(quoteData.author as string) || "author"}
                        className="w-8 h-8 rounded-full object-cover mr-2"
                      />
                    )}
                    {(quoteData.author as string) && (
                      <p className="text-xs text-primary/70 font-medium">
                        — {quoteData.author as string}
                      </p>
                    )}
                  </div>
                </div>
              ) : null}
              <div className="bg-background border rounded-xl p-5">
                <h4 className="text-sm font-semibold mb-2">
                  {ctaCard.title || "Direct access to leadership"}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  {ctaCard.desc || ""}
                </p>
                <button
                  onClick={() => onNavigate("contact")}
                  className="w-full text-xs font-medium bg-primary text-primary-foreground rounded-md py-2 hover:bg-primary/90 transition-colors"
                >
                  {ctaCard.cta || "Speak to us directly →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* A5: Mission, Vision, Values */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            What we stand for
          </p>
          <h2 className="text-2xl font-bold mb-10">Mission, vision & values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {missionVisionValues.map((item) => (
              <div key={item.label} className="border rounded-xl p-5">
                <div
                  className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center mb-4`}
                >
                  <ResolvedIcon
                    name={item.icon}
                    className={`h-5 w-5 ${item.color}`}
                  />
                </div>
                <p className="text-[10px] uppercase tracking-widest font-semibold mb-1">
                  {item.label}
                </p>
                <h3 className="text-base font-bold mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* A6: Factory Location */}
      <section className="bg-muted/40 py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Location
          </p>
          <h2 className="text-2xl font-bold mb-10">Where we operate</h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <div className="bg-background border rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <Factory className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold mb-1">
                      Factory address
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                      {(location.factoryAddress as string) ||
                        "[Factory address]"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-background border rounded-lg p-5">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Route className="h-4 w-4 text-primary" /> Logistics &
                  accessibility
                </p>
                <div className="space-y-3">
                  {logistics.map((item) => (
                    <div
                      key={item.label}
                      className="flex justify-between items-center text-xs border-b pb-2 last:border-0"
                    >
                      <span className="text-muted-foreground flex items-center gap-2">
                        <ResolvedIcon
                          name={item.icon}
                          className="h-3.5 w-3.5"
                        />{" "}
                        {item.label}
                      </span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-background border rounded-lg p-5">
                <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-emerald-600" /> Dispatch reach
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  {(location.dispatchDesc as string) ||
                    "We dispatch to all major markets across India via road and rail freight."}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {dispatchTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-[1.4]">
              {location.googleMapsEmbedUrl ? (
                <iframe
                  src={getGoogleMapsEmbedUrl(location.googleMapsEmbedUrl as string)}
                  width="100%"
                  height="100%"
                  className="rounded-lg min-h-[300px] border"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Factory location"
                />
              ) : (
                <div className="bg-muted border rounded-lg h-full min-h-[300px] flex items-center justify-center text-muted-foreground text-sm flex-col gap-2">
                  <MapPin className="h-8 w-8" />
                  <p>Google Maps embed</p>
                  <p className="text-xs">Factory pin marked with brand marker</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* A8: CTA Strip */}
      <section className="bg-muted/40 py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-center mb-10 text-foreground">
            {(ctaData.title as string) || "Ready to work with us?"}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {ctaCards.map((item, idx) => (
              <div
                key={item.title || idx}
                className="bg-primary rounded-xl p-6 text-center"
              >
                <ResolvedIcon
                  name={item.icon}
                  className="h-6 w-6 text-white mx-auto mb-3"
                />
                <h3 className="text-sm font-semibold mb-2 text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-white/70 mb-5 leading-relaxed">
                  {item.desc}
                </p>
                {item.useForm || idx >= 1 ? (
                  <button
                    onClick={() => useAppStore.getState().openEnquiryModal()}
                    className="w-full text-xs font-medium bg-white text-primary rounded-md py-2.5 hover:bg-white/90 transition-colors"
                  >
                    {item.cta || "Send Enquiry"}
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate(item.page)}
                    className="w-full text-xs font-medium bg-white text-primary rounded-md py-2.5 hover:bg-white/90 transition-colors"
                  >
                    {item.cta}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactFormSection title="Get in Touch" submitText="Send Enquiry →" />
    </div>
  );
}
