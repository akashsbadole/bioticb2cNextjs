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
    staleTime: 10 * 60 * 1000,
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
      <section className="page-hero bg-vedika-green-dark text-vedika-bg py-[70px] pb-[60px] relative overflow-hidden">
        <div className="vedika-container relative z-[1]">
          <div className="vedika-eyebrow text-vedika-gold">The Journal</div>
          <h1 className="text-white max-w-[640px]" style={{ fontSize: "clamp(2.4rem,4.5vw,3.8rem)", lineHeight: 1.05 }}>Notes on Ayurveda,<br />ingredients &amp; ritual.</h1>
          <p className="text-[#B7C0B4] max-w-[560px] mt-3">Long-form writing on doshas, sourcing trips, and the science behind formulas that are centuries old.</p>
        </div>
        <svg viewBox="0 0 200 200" fill="none" className="absolute -right-[60px] -top-[60px] w-[320px] h-[320px] opacity-[0.12]">
          <path d="M100 20c-20 40-50 50-50 90s30 60 50 70c20-10 50-30 50-70s-30-50-50-90z" stroke="currentColor" strokeWidth=".6"/>
        </svg>
      </section>

      <div className="vedika-container">
        <div className="breadcrumb py-5 text-xs text-vedika-ink-soft flex gap-2 items-center flex-wrap">
          <button onClick={() => onNavigate("home")} className="bg-transparent border-none cursor-pointer font-[inherit] text-inherit">Home</button>
          <span className="text-vedika-sand">/</span>
          <span className="text-vedika-red">Journal</span>
        </div>
      </div>

      <section className="vedika-container vedika-section-tight">
        {/* FEATURED POST */}
        {featured && (
          <div className="blog-featured grid grid-cols-[1.1fr_.9fr] bg-vedika-paper border border-vedika-line rounded-xl overflow-hidden mb-16">
            <div className="blog-media flex items-center justify-center min-h-[300px]" style={{ background: "linear-gradient(150deg, var(--vedika-gold-tint), var(--vedika-bg-alt))" }}>
              <svg viewBox="0 0 100 100" fill="none" className="w-2/5 h-2/5">
                <circle cx="50" cy="50" r="26" fill="#FFFDF6" stroke="#2F4A3C" strokeWidth="2"/>
                <path d="M50 24v52M24 50h52" stroke="#2F4A3C" strokeWidth="1"/>
              </svg>
            </div>
            <div className="blog-featured-body p-12 flex flex-col justify-center">
              {featured.category && <span className="blog-cat text-xs tracking-wider uppercase text-vedika-red font-bold mb-2.5 block">{featured.category}</span>}
              <h2 className="mb-3 leading-[1.2]">{featured.title}</h2>
              {featured.excerpt && <p className="text-vedika-ink-soft mb-4">{featured.excerpt}</p>}
              <div className="blog-meta flex gap-3.5 text-[.78rem] text-vedika-ink-soft items-center">
                {featured.date && <span className="m-item flex items-center gap-1.25"><ClockIcon className="w-[13px] h-[13px] text-vedika-sand" />{featured.date}</span>}
                {featured.readTime && <span className="m-item flex items-center gap-1.25"><ClockIcon className="w-[13px] h-[13px] text-vedika-sand" />{featured.readTime}</span>}
              </div>
              <div className="mt-6">
                <button className="vedika-btn vedika-btn-outline vedika-btn-sm" onClick={() => onNavigate("blog-post", featured.slug)}>Read Article</button>
              </div>
            </div>
          </div>
        )}

        {/* FILTER TAGS */}
        <div className="blog-tags-row flex gap-2.5 mb-7 flex-wrap">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`blog-filter-tag px-[18px] py-[9px] rounded-full border text-xs font-semibold cursor-pointer font-inherit transition-all duration-200 ${
                selectedTag === tag
                  ? "bg-vedika-green text-white border-vedika-green"
                  : "bg-transparent text-vedika-ink-soft border-vedika-line"
              }`}
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
          <div className="text-center py-[60px] text-vedika-ink-soft">
            <p>No posts found for this category.</p>
          </div>
        )}

        {rest.length > 6 && (
          <div className="text-center mt-14">
            <button className="vedika-btn vedika-btn-outline">Load More Articles</button>
          </div>
        )}
      </section>
    </div>
  );
}
