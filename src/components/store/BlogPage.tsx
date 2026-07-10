"use client";

import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ImageIcon, Search, Tag, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StoreLoading } from "./StoreLoading";
import { useAppStore } from '@/lib/store';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  tags: string | null;
  User?: { id: string; name: string; email: string; avatar?: string | null; bio?: string | null } | null;
}

interface BlogPageProps {
  onNavigate: (page: string, data?: unknown) => void;
}

function parseTags(tagsStr: string | null): string[] {
  if (!tagsStr) return [];
  try {
    const parsed = JSON.parse(tagsStr);
    if (Array.isArray(parsed))
      return parsed.filter((t: unknown) => typeof t === "string");
  } catch {
    // If it's not valid JSON, try splitting by comma as a fallback
    return tagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

export function BlogPage({ onNavigate }: BlogPageProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: posts = [], isLoading: loading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
        const res = await fetch("/api/blog?published=true");
        const data = await res.json();
        return data.blogPosts || [];
    }
  });

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach((post: BlogPost) => {
        parseTags(post.tags).forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    let result = posts;

    // Filter by selected tag
    if (selectedTag) {
      result = result.filter((post) => {
        const postTags = parseTags(post.tags);
        return postTags.includes(selectedTag);
      });
    }

    // Filter by search query (title)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((post) =>
        post.title.toLowerCase().includes(query),
      );
    }

    return result;
  }, [posts, selectedTag, searchQuery]);

  // Count posts per tag
  const getTagCount = (tag: string) => {
    return posts.filter((post) => parseTags(post.tags).includes(tag)).length;
  };

  if (loading) {
    return <StoreLoading />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Blog</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Read our latest articles, news, and updates.
        </p>
      </div>

      {/* Search Input */}
      {posts.length > 0 && (
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search articles by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              aria-label="Search blog posts by title"
            />
          </div>
        </div>
      )}

      {/* Tag Filter Bar */}
      {allTags.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-4 w-4 text-muted-foreground mr-1" />
            <Badge
              variant={selectedTag === null ? "default" : "outline"}
              className={`cursor-pointer select-none transition-colors ${
                selectedTag === null
                  ? "bg-primary hover:bg-primary/80 text-white"
                  : "hover:bg-primary/5 hover:text-primary/80 hover:border-primary/30"
              }`}
              onClick={() => setSelectedTag(null)}
            >
              All ({posts.length})
            </Badge>
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                className={`cursor-pointer select-none transition-colors ${
                  selectedTag === tag
                    ? "bg-primary hover:bg-primary/80 text-white"
                    : "hover:bg-primary/5 hover:text-primary/80 hover:border-primary/30"
                }`}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                {tag} ({getTagCount(tag)})
              </Badge>
            ))}
            {selectedTag && (
              <button
                onClick={() => {
                  const form = document.getElementById("blog-enquiry-form");
                  if (form) {
                    form.scrollIntoView({ behavior: "smooth" });
                  } else {
                    onNavigate("contact");
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs bg-primary text-primary-foreground rounded-full px-3 py-1.5 hover:bg-primary/90 transition-colors"
              >
                <Send className="h-3 w-3" />
                Enquire about {selectedTag}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Enquire from tag filter */}
      <section className="bg-muted/40 py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto">
          {selectedTag && (
            <div className="bg-background border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-1">
                Enquire about {selectedTag}
              </h3>
              <p className="text-xs text-muted-foreground mb-5">
                Fill in your details and we'll respond within 24 hours
              </p>
              <button
                onClick={() => useAppStore.getState().openEnquiryModal()}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium px-6 py-2.5 rounded-md text-sm hover:bg-primary/90 transition-colors"
              >
                <Send className="h-4 w-4" />
                Send Enquiry
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Blog Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16">
          {searchQuery || selectedTag ? (
            <>
              <p className="text-muted-foreground">
                No blog posts found matching your criteria.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTag(null);
                }}
                className="text-primary hover:text-primary/80 text-sm mt-2 underline"
              >
                Clear filters
              </button>
            </>
          ) : (
            <p className="text-muted-foreground">
              No blog posts published yet. Check back soon!
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="group cursor-pointer"
              onClick={() => onNavigate("blog-post", post.slug)}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onNavigate("blog-post", post.slug);
                }
              }}
            >
              <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                {/* Cover Image */}
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                <CardContent className="p-5 flex flex-col gap-3">
                  {/* Tags */}
                  {post.tags && (
                    <div className="flex flex-wrap gap-1.5">
                      {parseTags(post.tags).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs font-normal"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h2 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-2">
                    {post.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.publishedAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </span>
                    )}
                    {post.User && (
                      <span className="flex items-center gap-1.5">
                        {post.User.avatar ? (
                          <img
                            src={post.User.avatar}
                            alt={post.User.name}
                            className="h-5 w-5 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[9px] font-bold">
                            {post.User.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                        <span className="truncate max-w-[120px]">{post.User.name}</span>
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
