import { useEffect } from "react";

interface SeoProps {
  title?: string | null;
  description?: string | null;
  ogImage?: string | null;
  ogType?: string;
  twitterCard?: "summary" | "summary_large_image";
  jsonLd?: Record<string, unknown> | null;
  canonical?: string;
  siteName?: string;
  publishedAt?: string | null;
}

function setOrUpdateMeta(name: string, content: string, property = false) {
  const attr = property ? "property" : "name";
  let tag = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function removeMeta(name: string, property = false) {
  const attr = property ? "property" : "name";
  const tag = document.querySelector(`meta[${attr}="${name}"]`);
  if (tag) tag.remove();
}

function injectJsonLd(id: string, data: Record<string, unknown>) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data);
  script.id = id;
  document.head.appendChild(script);
}

function removeJsonLd(id: string) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

export function useSeo(
  pageKey: string,
  {
    title,
    description,
    ogImage,
    ogType = "website",
    twitterCard = "summary_large_image",
    jsonLd,
    canonical,
    siteName,
    publishedAt,
  }: SeoProps,
) {
  useEffect(() => {
    const jsonLdId = `seo-${pageKey}-jsonld`;

    document.title = title || document.title;

    if (description) {
      setOrUpdateMeta("description", description);
    }

    if (ogImage) {
      setOrUpdateMeta("og:image", ogImage, true);
    }

    setOrUpdateMeta("og:type", ogType, true);
    setOrUpdateMeta("og:title", document.title, true);

    if (description) {
      setOrUpdateMeta("og:description", description, true);
    }

    setOrUpdateMeta("twitter:card", twitterCard);
    setOrUpdateMeta("twitter:title", document.title);
    if (description) {
      setOrUpdateMeta("twitter:description", description);
    }
    if (ogImage) {
      setOrUpdateMeta("twitter:image", ogImage);
    }

    if (publishedAt) {
      setOrUpdateMeta("article:published_time", new Date(publishedAt).toISOString(), true);
    }

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonical);
    }

    if (jsonLd) {
      injectJsonLd(jsonLdId, jsonLd);
    }

    return () => {
      removeJsonLd(jsonLdId);
    };
  }, [pageKey, title, description, ogImage, ogType, twitterCard, jsonLd, canonical, siteName, publishedAt]);
}
