"use client";

import { useEffect, useState, useMemo } from "react";
import DOMPurify from "dompurify";
import {
  Calendar,
  ArrowLeft,
  Clock,
  ChevronRight,
  Home,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoreLoading } from "./StoreLoading";
import { SocialShare } from "./SocialShare";
import { generateArticleSchema } from "@/lib/seo/schema-generator";
import { useSeo } from "@/lib/use-seo";

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  blocks: string;
  coverImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  tags: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  User?: { id: string; name: string; email: string; avatar?: string | null; bio?: string | null } | null;
}

interface BlogPostViewProps {
  postId: string;
  onNavigate: (page: string, data?: unknown) => void;
}

function calculateReadTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, "");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function parseTags(tags: string | null): string[] {
  if (!tags) return [];
  try {
    const parsed = JSON.parse(tags);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    /* fallback */
  }
  return [];
}

function injectHeadingIds(html: string): string {
  return html.replace(
    /<h([23])(\s[^>]*)?>(.*?)<\/h\1>/gi,
    (_match, level, attrs, content) => {
      if (attrs && /\bid\s*=\s*["']/i.test(attrs)) return _match;
      const text = content.replace(/<[^>]*>/g, "").trim();
      if (!text) return _match;
      const id = text
        .toLowerCase()
        .replace(/[^\w]+/g, "-")
        .replace(/^-|-$/g, "");
      const attrStr = attrs || "";
      return `<h${level}${attrStr} id="${id}">${content}</h${level}>`;
    },
  );
}

function extractHeadings(
  html: string,
): Array<{ level: number; text: string; id: string }> {
  const headings: Array<{ level: number; text: string; id: string }> = [];
  const regex = /<h([23])(?:\s[^>]*)?>(.*?)<\/h\1>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = match[2].replace(/<[^>]*>/g, "").trim();
    if (text) {
      const id = text
        .toLowerCase()
        .replace(/[^\w]+/g, "-")
        .replace(/^-|-$/g, "");
      headings.push({ level: parseInt(match[1]), text, id });
    }
  }
  return headings;
}

export function BlogPostView({ postId, onNavigate }: BlogPostViewProps) {
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostData[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/blog/${postId}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data.blogPost);
        } else if (res.status === 404) {
          setError("Post not found");
        } else {
          setError("Failed to load post");
        }
      } catch {
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  useEffect(() => {
    if (!post) return;
    fetch(`/api/blog?limit=3&published=true`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.blogPosts) {
          setRelatedPosts(
            data.blogPosts
              .filter((p: BlogPostData) => p.id !== post.id)
              .slice(0, 3),
          );
        }
      })
      .catch(() => {});
  }, [post]);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000");
  const brandName = process.env.NEXT_PUBLIC_SITE_NAME;

  useSeo(`blog-post-${post?.slug || ""}`, {
    title: post?.metaTitle || (post ? `${post.title} | Blog` : undefined),
    description:
      post?.metaDescription ||
      post?.excerpt ||
      post?.content?.substring(0, 160),
    ogImage: post?.ogImage || post?.coverImage,
    ogType: "article",
    publishedAt: post?.publishedAt || null,
    jsonLd: post ? generateArticleSchema(post, siteUrl, brandName) : null,
    canonical: post ? `${siteUrl}/blog/${post.slug}` : undefined,
  });

  const headings = useMemo(
    () => (post ? extractHeadings(post.content) : []),
    [post],
  );
  const readTime = useMemo(
    () => (post ? calculateReadTime(post.content) : 0),
    [post],
  );
  const postUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/blog/${post?.slug || ""}`;
  }, [post]);

  if (loading) {
    return <StoreLoading />;
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">
          Post not found or no longer available.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => onNavigate("blog")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>
      </div>
    );
  }

  const tags = parseTags(post.tags);

  const sanitized = DOMPurify.sanitize(injectHeadingIds(post.content), {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: [
      "allow",
      "allowfullscreen",
      "frameborder",
      "scrolling",
      "src",
      "width",
      "height",
    ],
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "a",
      "img",
      "blockquote",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "hr",
      "div",
      "span",
      "pre",
      "code",
      "figure",
      "figcaption",
      "sup",
      "sub",
      "iframe",
    ],
    ALLOWED_ATTR: [
      "href",
      "src",
      "alt",
      "title",
      "class",
      "id",
      "style",
      "target",
      "rel",
      "colspan",
      "rowspan",
      "allow",
      "allowfullscreen",
      "frameborder",
      "scrolling",
      "width",
      "height",
    ],
  });

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex gap-1.5 text-sm text-muted-foreground mb-8">
        <button
          onClick={() => onNavigate("home")}
          className="hover:text-foreground transition-colors inline-flex items-center gap-1"
        >
          <Home className="h-3.5 w-3.5" />
          Home
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <button
          onClick={() => onNavigate("blog")}
          className="hover:text-foreground transition-colors"
        >
          Blog
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate max-w-[200px]">
          {post.title}
        </span>
      </nav>

      {/* Blog Title */}
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-4">
        {post.title}
      </h1>

      {/* Author | Date | Read Time | Views */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
        {post.User && (
          <span className="flex items-center gap-2">
            {post.User.avatar ? (
              <img
                src={post.User.avatar}
                alt={post.User.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                {post.User.name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="font-medium text-foreground">{post.User.name}</span>
          </span>
        )}
        {post.publishedAt && (
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-primary" />
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-primary" />
          {readTime} min read
        </span>
      </div>

      {/* Featured Image */}
      {post.coverImage && (
        <div className="mb-10">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-[400px] object-cover rounded-xl shadow-lg"
          />
        </div>
      )}

      <div className="flex gap-8">
        {/* Table of Contents Sidebar */}
        {headings.length > 0 && (
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Table of Contents
              </h4>
              <nav className="space-y-1.5">
                {headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className={`block text-sm transition-colors hover:text-primary ${
                      h.level === 3
                        ? "pl-4 text-muted-foreground/70"
                        : "text-muted-foreground"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById(h.id);
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Excerpt */}
          {post.excerpt && (
            <div className="mb-10">
              <p className="text-xl text-muted-foreground font-medium italic leading-relaxed border-y py-6 border-primary/10">
                &ldquo;{post.excerpt}&rdquo;
              </p>
            </div>
          )}

          {/* Content */}
          {post.content ? (
            <div
              className="prose prose-neutral dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-20
                prose-p:text-foreground/80 prose-a:text-primary
                prose-img:rounded-lg prose-blockquote:border-primary/20
                [&>p]:mb-4 [&>h2]:mt-10 [&>h3]:mt-8
                [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto
                [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm
                [&_pre_code]:bg-transparent [&_pre_code]:p-0
                [&_table]:w-full [&_table]:border-collapse
                [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-sm [&_th]:font-semibold
                [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm
                [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-lg [&_iframe]:border [&_iframe]:border-border"
              dangerouslySetInnerHTML={{ __html: sanitized }}
            />
          ) : null}

          {/* Mobile Table of Contents */}
          {headings.length > 0 && (
            <div className="lg:hidden mt-10 p-4 border rounded-lg bg-muted/30">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Table of Contents
              </h4>
              <nav className="space-y-1.5">
                {headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className={`block text-sm transition-colors hover:text-primary ${
                      h.level === 3
                        ? "pl-4 text-muted-foreground/70"
                        : "text-muted-foreground"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById(h.id);
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-10 pt-8 border-t">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="bg-primary/5 text-primary/80 border-primary/20"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio Card */}
          {post.User && post.User.bio && (
            <div className="mt-10 pt-8 border-t">
              <div className="flex gap-4 p-5 rounded-xl bg-muted/30 border">
                {post.User.avatar ? (
                  <img
                    src={post.User.avatar}
                    alt={post.User.name}
                    className="h-14 w-14 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-lg font-bold">
                    {post.User.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{post.User.name}</p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {post.User.bio}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Share Buttons */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <Share2 className="h-4 w-4" />
                Share
              </span>
              <SocialShare url={postUrl} title={post.title} />
            </div>
          </div>

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h3 className="text-2xl font-bold tracking-tight mb-6">
                Related Articles
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((rp) => (
                  <button
                    key={rp.id}
                    onClick={() => onNavigate("blog-post", rp.slug)}
                    className="text-left group"
                  >
                    <div className="relative h-40 rounded-lg overflow-hidden bg-muted mb-3">
                      {rp.coverImage ? (
                        <img
                          src={rp.coverImage}
                          alt={rp.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10" />
                      )}
                    </div>
                    <h4 className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {rp.title}
                    </h4>
                    {rp.publishedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(rp.publishedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
