'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageBlockRenderer } from './PageBlockRenderer';
import type { PageBlock } from '@/lib/page-blocks';
import { normalizePageBlocks } from '@/lib/page-blocks';
import { useSeo } from '@/lib/use-seo';
import { StoreLoading } from './StoreLoading';

interface PageData {
  title: string;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
}

interface CmsPageProps {
  slug: string;
  onNavigate: (page: string, data?: unknown) => void;
  fallbackBlocks?: PageBlock[];
}

export function CmsPage({ slug, onNavigate, fallbackBlocks }: CmsPageProps) {
  const { data, isLoading: loading } = useQuery({
    queryKey: ['cms-page', slug],
    queryFn: async () => {
        const res = await fetch(`/api/content-pages?slug=${encodeURIComponent(slug)}`);
        const data = await res.json();
        const page = (data.contentPages || [])[0];
        if (page) {
            let blocks = normalizePageBlocks(page.blocks || "[]");
            if (blocks.length === 0 && page.content) {
                blocks = [{ id: 'legacy-content', type: 'text', data: { content: page.content } }];
            }
            return {
                pageData: {
                    title: page.title || '',
                    metaTitle: page.metaTitle || null,
                    metaDescription: page.metaDescription || null,
                    ogImage: page.ogImage || null,
                },
                blocks
            };
        }
        if (fallbackBlocks) return { pageData: null, blocks: fallbackBlocks };
        return null;
    }
  });

  const pageData = data?.pageData || null;
  const blocks = data?.blocks || null;

  useSeo(`cms-${slug}`, {
    title: pageData?.metaTitle || pageData?.title,
    description: pageData?.metaDescription,
    ogImage: pageData?.ogImage,
  });

  if (loading) {
    return <StoreLoading />;
  }

  if (!blocks || blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground">This page has no content yet.</p>
        <p className="mt-2 text-sm text-muted-foreground/70">
          Add blocks in the admin panel to customize this page.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <PageBlockRenderer blocks={blocks} onNavigate={onNavigate} />
    </div>
  );
}
