"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbsProps {
  items: Array<{ label: string; page?: string; slug?: string }>;
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const { navigate } = useAppStore();

  // Emit BreadcrumbList structured data (audit 10.6) for SEO.
  useEffect(() => {
    const trail = [
      { name: "Home", url: typeof window !== "undefined" ? window.location.origin : "" },
      ...items.map((it) => ({
        name: it.label,
        url: typeof window !== "undefined" ? window.location.href : "",
      })),
    ];
    const script = document.getElementById("breadcrumb-jsonld");
    if (script) script.remove();
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = "breadcrumb-jsonld";
    el.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: trail.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: t.name,
        item: t.url,
      })),
    });
    document.head.appendChild(el);
    return () => {
      const s = document.getElementById("breadcrumb-jsonld");
      if (s) s.remove();
    };
  }, [items]);

  return (
    <nav className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-6 overflow-x-auto whitespace-nowrap pb-1">
      <button
        onClick={() => navigate("home")}
        className="flex items-center gap-1 hover:text-primary transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span>Home</span>
      </button>

      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 opacity-50" />
          {idx === items.length - 1 ? (
            <span className="text-foreground font-bold">{item.label}</span>
          ) : (
            <button
              onClick={() => item.page && navigate(item.page, item.slug)}
              className="hover:text-primary transition-colors"
            >
              {item.label}
            </button>
          )}
        </div>
      ))}
    </nav>
  );
}
