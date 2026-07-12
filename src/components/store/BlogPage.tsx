"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { VedikaBlogCard, ClockIcon } from "./vedika-components";

interface BlogPageProps {
  onNavigate: (page: string, data?: unknown) => void;
}

const fallbackPosts = [
  { slug: "how-to-identify-your-dominant-dosha-at-home", title: "How to identify your dominant dosha at home", excerpt: "A simple self-assessment based on classical Ayurvedic principles — no quiz, no app required.", category: "Dosha Guide", date: "12 Jun 2026", readTime: "6 min read" },
  { slug: "turmeric-vs-saffron-which-one-belongs-in-your-routine", title: "Turmeric vs. saffron: which one belongs in your routine?", excerpt: "Both are gold-standard ingredients in Ayurveda, but they serve very different purposes. Here's how to choose.", category: "Ingredients", date: "2 Jun 2026", readTime: "4 min read" },
  { slug: "a-10-minute-dinacharya-for-people-who-hate-routines", title: "A 10-minute Dinacharya for people who hate routines", excerpt: "If a 20-step morning ritual sounds overwhelming, start here. The minimum viable daily practice.", category: "Rituals", date: "24 May 2026", readTime: "5 min read" },
  { slug: "why-we-still-formulate-by-hand-and-by-text", title: "Why we still formulate by hand (and by text)", excerpt: "In an age of machine blending, every Vedika formulation is still hand-weighed and hand-mixed in small batches.", category: "Behind the Brand", date: "10 May 2026", readTime: "7 min read" },
  { slug: "the-three-doshas-explained-simply", title: "The three doshas explained simply", excerpt: "Vata, Pitta, Kapha — what they actually mean for your day-to-day choices in food, skincare, and lifestyle.", category: "Dosha Guide", date: "28 Apr 2026", readTime: "8 min read" },
  { slug: "what-to-look-for-in-an-ashwagandha-supplement", title: "What to look for in an Ashwagandha supplement", excerpt: "Not all Ashwagandha is created equal. Here's how to read labels, choose the right extract, and avoid common pitfalls.", category: "Ingredients", date: "15 Apr 2026", readTime: "5 min read" },
];

const allTags = ["All", "Dosha Guide", "Ingredients", "Rituals", "Behind the Brand"];

export function BlogPage({ onNavigate }: BlogPageProps) {
  const [selectedTag, setSelectedTag] = useState("All");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const res = await fetch("/api/blog-posts");
      const data = await res.json();
      return data.posts || data || [];
    },
  });

  const displayPosts = posts.length > 0 ? posts : fallbackPosts;
  const filtered = selectedTag === "All" ? displayPosts : displayPosts.filter((p: any) => {
    const tags = p.category || p.tags || "";
    return typeof tags === "string" && tags.includes(selectedTag);
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div>
      {/* HERO */}
      <section className="page-hero" style={{ background: "var(--vedika-green-dark)", color: "var(--vedika-bg)", padding: "70px 0 60px", position: "relative", overflow: "hidden" }}>
        <div className="vedika-container" style={{ position: "relative", zIndex: 1 }}>
          <div className="vedika-eyebrow" style={{ color: "var(--vedika-gold)" }}>The Journal</div>
          <h1 style={{ color: "#fff", fontSize: "clamp(2.4rem,4.5vw,3.8rem)", lineHeight: 1.05, maxWidth: 640 }}>Notes on Ayurveda,<br />ingredients &amp; ritual.</h1>
          <p style={{ color: "#B7C0B4", maxWidth: 560, marginTop: 12 }}>Long-form writing on doshas, sourcing trips, and the science behind formulas that are centuries old.</p>
        </div>
        <svg viewBox="0 0 200 200" fill="none" style={{ position: "absolute", right: -60, top: -60, width: 320, height: 320, opacity: 0.12 }}>
          <path d="M100 20c-20 40-50 50-50 90s30 60 50 70c20-10 50-30 50-70s-30-50-50-90z" stroke="currentColor" strokeWidth=".6"/>
        </svg>
      </section>

      <div className="vedika-container">
        <div className="breadcrumb" style={{ padding: "20px 0", fontSize: ".82rem", color: "var(--vedika-ink-soft)", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={() => onNavigate("home")} style={{ background: "none", border: "none", cursor: "pointer", font: "inherit", color: "inherit" }}>Home</button>
          <span style={{ color: "var(--vedika-sand)" }}>/</span>
          <span style={{ color: "var(--vedika-red)" }}>Journal</span>
        </div>
      </div>

      <section className="vedika-container vedika-section-tight">
        {/* FEATURED POST */}
        {featured && (
          <div className="blog-featured" style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 0, background: "var(--vedika-paper)", border: "1px solid var(--vedika-line)", borderRadius: "28px", overflow: "hidden", marginBottom: 64 }}>
            <div className="blog-media" style={{ background: "linear-gradient(150deg, var(--vedika-gold-tint), var(--vedika-bg-alt))", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
              <svg viewBox="0 0 100 100" fill="none" style={{ width: "40%", height: "40%" }}>
                <circle cx="50" cy="50" r="26" fill="#FFFDF6" stroke="#2F4A3C" strokeWidth="2"/>
                <path d="M50 24v52M24 50h52" stroke="#2F4A3C" strokeWidth="1"/>
              </svg>
            </div>
            <div className="blog-featured-body" style={{ padding: 48, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              {featured.category && <span className="blog-cat" style={{ fontSize: ".7rem", letterSpacing: ".06em", textTransform: "uppercase", color: "var(--vedika-red)", fontWeight: 700, marginBottom: 10, display: "block" }}>{featured.category}</span>}
              <h2 style={{ marginBottom: 12, lineHeight: 1.2 }}>{featured.title}</h2>
              {featured.excerpt && <p style={{ color: "var(--vedika-ink-soft)", marginBottom: 16 }}>{featured.excerpt}</p>}
              <div className="blog-meta" style={{ display: "flex", gap: 14, fontSize: ".78rem", color: "var(--vedika-ink-soft)", alignItems: "center" }}>
                {featured.date && <span className="m-item" style={{ display: "flex", alignItems: "center", gap: 5 }}><ClockIcon className="w-[13px] h-[13px]" style={{ color: "var(--vedika-sand)" }} />{featured.date}</span>}
                {featured.readTime && <span className="m-item" style={{ display: "flex", alignItems: "center", gap: 5 }}><ClockIcon className="w-[13px] h-[13px]" style={{ color: "var(--vedika-sand)" }} />{featured.readTime}</span>}
              </div>
              <div style={{ marginTop: 24 }}>
                <button className="vedika-btn vedika-btn-outline vedika-btn-sm" onClick={() => onNavigate("blog-post", featured.slug)}>Read Article</button>
              </div>
            </div>
          </div>
        )}

        {/* FILTER TAGS */}
        <div className="blog-tags-row" style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className="blog-filter-tag"
              style={{
                padding: "9px 18px", borderRadius: 100, border: "1px solid var(--vedika-line)",
                fontSize: ".82rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                background: selectedTag === tag ? "var(--vedika-green)" : "transparent",
                color: selectedTag === tag ? "#fff" : "var(--vedika-ink-soft)",
                borderColor: selectedTag === tag ? "var(--vedika-green)" : "var(--vedika-line)",
                transition: "all .2s ease",
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* BLOG GRID */}
        {rest.length > 0 ? (
          <div className="vedika-grid-3">
            {rest.map((post: any, i: number) => (
              <VedikaBlogCard key={i} title={post.title} category={post.category || post.tags} date={post.date} readTime={post.readTime} onClick={() => onNavigate("blog-post", post.slug)} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--vedika-ink-soft)" }}>
            <p>No posts found for this category.</p>
          </div>
        )}

        {rest.length > 6 && (
          <div style={{ textAlign: "center", marginTop: 56 }}>
            <button className="vedika-btn vedika-btn-outline">Load More Articles</button>
          </div>
        )}
      </section>
    </div>
  );
}
