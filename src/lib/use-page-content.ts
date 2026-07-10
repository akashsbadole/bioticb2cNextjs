"use client";

import { useState, useEffect } from "react";
import type { PageBlock } from "./page-blocks";
import { normalizePageBlocks } from "./page-blocks";

interface ContentPageMeta {
  title: string;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
}

/**
 * Fetches a CMS ContentPage by slug and returns its parsed blocks + SEO fields.
 * Falls back to null if not found (caller should provide defaults).
 */
export function useContentPage(slug: string) {
  const [blocks, setBlocks] = useState<PageBlock[] | null>(null);
  const [meta, setMeta] = useState<ContentPageMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(
          `/api/content-pages?slug=${encodeURIComponent(slug)}`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        if (cancelled) return;
        const pages: {
          id: string;
          slug: string;
          title: string;
          blocks: string;
          metaTitle: string | null;
          metaDescription: string | null;
          ogImage: string | null;
        }[] = data.contentPages ?? [];
        const page = pages[0];
        if (!page) {
          if (!cancelled) {
            setBlocks(null);
            setMeta(null);
            setLoading(false);
          }
          return;
        }
        if (!cancelled) {
          setMeta({
            title: page.title || '',
            metaTitle: page.metaTitle || null,
            metaDescription: page.metaDescription || null,
            ogImage: page.ogImage || null,
          });
        }
        const parsed = normalizePageBlocks(page.blocks);
        if (!cancelled) {
          setBlocks(parsed.length > 0 ? parsed : null);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setBlocks(null);
          setMeta(null);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { blocks, meta, loading };
}

/**
 * Extracts the first block of a given type from an array of blocks.
 */
export function getBlockData(
  blocks: PageBlock[] | null,
  type: string,
): Record<string, unknown> | null {
  if (!blocks) return null;
  const block = blocks.find((b) => b.type === type);
  return block?.data ?? null;
}

export function getPageContentData(
  blocks: PageBlock[] | null,
  type: string,
  fallback: Record<string, unknown>,
): Record<string, unknown> {
  return getBlockData(blocks, type) ?? fallback;
}
