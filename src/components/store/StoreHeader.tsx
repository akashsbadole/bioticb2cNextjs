"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  X,
  ShoppingBag,
  Search as SearchIcon,
  Clock,
  Trash2,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getFirstImage } from "@/lib/utils";
import { formatPrice as libFormatPrice } from "@/lib/pricing";
import Link from "next/link";

interface StoreHeaderProps {
  onNavigate: (page: string, data?: unknown) => void;
}

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string;
  Category: { id: string; name: string } | null;
}

interface NavItem {
  label: string;
  page: string;
  slug?: string;
  children?: NavItem[];
}

interface MenuItem {
  id: string;
  label: string;
  url?: string;
  page?: string;
  slug?: string;
  openInNewTab?: boolean;
  children?: MenuItem[];
}

const mainNavLinks: NavItem[] = [
  { label: "Bundles", page: "bundles" },
];

export function StoreHeader({ onNavigate }: StoreHeaderProps) {
  const { currentPage, settings, cart, wishlistIds, auth } = useAppStore();
  const cartItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const stored =
        typeof window !== "undefined"
          ? localStorage.getItem("search_history")
          : null;
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [dynamicNavLinks, setDynamicNavLinks] = useState<NavItem[]>([]);
  const [primaryMenuItems, setPrimaryMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch primary menu from API
  useEffect(() => {
    async function fetchPrimaryMenu() {
      try {
        const res = await fetch("/api/menus?location=primary");
        if (res.ok) {
          const data = await res.json();
          if (data.menu && data.items) {
            setPrimaryMenuItems(data.items);
          }
        }
      } catch {
        setPrimaryMenuItems([]);
      } finally {
        setMenuLoading(false);
      }
    }
    fetchPrimaryMenu();
  }, []);

  // Merge dynamic content pages into main nav
  useEffect(() => {
    async function fetchNavLinks() {
      try {
        const res = await fetch("/api/content-pages");
        if (res.ok) {
          const data = await res.json();
          const pages = (data.contentPages || []).filter(
            (p: any) =>
              p.isActive &&
              ![
                "home",
                "shop",
                "about-us",
                "manufacturing",
                "contact",
              ].includes(p.slug),
          );
          if (pages.length > 0) {
            const links: NavItem[] = pages.map((p: any) => ({
              label: p.title,
              page: "content-page",
              slug: p.slug,
            }));
            setDynamicNavLinks(links);
          }
        }
      } catch {
        setDynamicNavLinks([]);
      }
    }
    fetchNavLinks();
  }, []);

  const allNavLinks = [...mainNavLinks, ...dynamicNavLinks];

  // Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (searchOpen) {
      const timer = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => window.clearTimeout(timer);
    }

    const resetTimer = window.setTimeout(() => {
      setSearchQuery("");
      setSearchResults([]);
    }, 0);
    return () => window.clearTimeout(resetTimer);
  }, [searchOpen]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const doSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(
        `/api/products?search=${encodeURIComponent(query)}&inStock=true`,
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.products || []);
      }
    } catch {
      // ignore search errors
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const saveSearchToHistory = (query: string) => {
    if (!query.trim()) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter(
        (q) => q.toLowerCase() !== query.toLowerCase(),
      );
      const next = [query, ...filtered].slice(0, 10);
      try {
        localStorage.setItem("search_history", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const removeSearchFromHistory = (query: string) => {
    setSearchHistory((prev) => {
      const next = prev.filter((q) => q !== query);
      try {
        localStorage.setItem("search_history", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem("search_history");
    } catch {
      /* ignore */
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(value);
    }, 300);
  };

  const handleResultClick = (product: { slug: string }) => {
    saveSearchToHistory(searchQuery);
    setSearchOpen(false);
    onNavigate("product-page", product.slug);
  };

  // Map known content-page slugs to their dedicated page routes so menu items
  // configured as "content-page" with e.g. slug="about-us" or "mfg-page-content"
  // land on the correct dedicated component instead of the generic CmsPage.
  const SLUG_TO_DEDICATED_PAGE: Record<string, string> = {
    about: "about",
    "about-us": "about",
    "about-page-content": "about",
    manufacturing: "manufacturing",
    "mfg-page-content": "manufacturing",
    contact: "contact",
    "contact-us": "contact",
    blog: "blog",
    catalogue: "shop",
    catalog: "shop",
    products: "products",
    product: "products",
    home: "home",
    homepage: "home",
  };

  const navigateOrOpen = useCallback(
    (item: {
      url?: string | null;
      page?: string | null;
      slug?: string | null;
      openInNewTab?: boolean | null;
    }) => {
      if (item.url) {
        if (item.url.startsWith("/")) {
          const segments = item.url.split("/").filter(Boolean);
          const p = segments.join("/");
          if (segments[0] === "products" && segments[1])
            onNavigate("product-page", segments[1]);
          else if (segments[0] === "shop" && segments[1])
            onNavigate("category", segments[1]);
          else if (segments[0] === "shop") onNavigate("shop");
          else if (segments[0] === "blog" && segments[1])
            onNavigate("blog-post", segments[1]);
          else if (segments[0] === "blog") onNavigate("blog");
          else if (segments[0] === "about") onNavigate("about");
          else if (segments[0] === "manufacturing") onNavigate("manufacturing");
          else if (segments[0] === "contact") onNavigate("contact");
          else if (segments[0] === "products")
            onNavigate("products");
          else onNavigate("content-page", p);
        } else {
          window.open(item.url, item.openInNewTab ? "_blank" : "_self");
        }
      } else if (item.page && item.page !== "url") {
        // If the page is "content-page" but the slug maps to a known dedicated page,
        // route to that dedicated page instead of the generic CmsPage.
        const dedicatedPage = item.slug
          ? SLUG_TO_DEDICATED_PAGE[item.slug]
          : undefined;

        if (item.page === "content-page" && dedicatedPage) {
          onNavigate(dedicatedPage);
        } else if (item.page === "category" && !item.slug) {
          // Top-level "Product Category" item without a specific slug
          onNavigate("shop");
        } else {
          onNavigate(item.page, item.slug ?? undefined);
        }
      }
    },
    [onNavigate],
  );

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const formatPrice = (price: number) => {
    return libFormatPrice(price, settings?.currency || "USD");
  };

  const isNavItemActive = (item: {
    page?: string | null;
    slug?: string | null;
  }) => {
    if (!item.page) return false;
    if (item.page === "content-page" && item.slug) {
      const dedicated = SLUG_TO_DEDICATED_PAGE[item.slug];
      if (dedicated) return currentPage.type === dedicated;
      return (
        currentPage.type === "content-page" && currentPage.slug === item.slug
      );
    }
    if (item.page === "category") return currentPage.type === "category";
    if (item.page === "url") return false;
    return currentPage.type === item.page;
  };

  return (
    <>
      {/* === ANNOUNCEMENT BAR === */}
      <div className="announce" style={{ background: "var(--vedika-green-dark)", color: "var(--vedika-gold-tint)", textAlign: "center", fontSize: ".78rem", letterSpacing: ".05em", padding: "9px 12px" }}>
        Free shipping across India on orders above ₹799 &nbsp;•&nbsp; Formulated per classical Ayurvedic texts
      </div>

      {/* === MAIN NAVIGATION BAR === */}
      <header className="site-header" style={{ position: "sticky", top: 0, zIndex: 500, background: "rgba(247,241,222,.92)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--vedika-line)" }}>
        <div className="nav" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 32px", maxWidth: "1240px", margin: "0 auto", gap: "24px" }}>
          {/* Logo */}
          <Link href={"/"} className="logo" style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: "1.5rem", fontWeight: 600, color: "var(--vedika-green-dark)", flexShrink: 0 }}>
            <button onClick={() => onNavigate("home")} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", font: "inherit", color: "inherit" }}>
              <svg viewBox="0 0 32 32" fill="none" style={{ width: 30, height: 30 }}>
                <circle cx="16" cy="16" r="15" stroke="#2F4A3C" strokeWidth="1.4"/>
                <path d="M16 24C16 24 9 20.5 9 13.5C9 9.5 12 7 16 7C20 7 23 9.5 23 13.5C23 20.5 16 24 16 24Z" stroke="#2F4A3C" strokeWidth="1.3" strokeLinejoin="round"/>
                <path d="M16 24V10" stroke="#2F4A3C" strokeWidth="1.3"/>
              </svg>
              {settings?.site_name || "Vedika"}
            </button>
          </Link>

          {/* Desktop Navigation - Center */}
          <ul className="nav-links" style={{ alignItems: "center", gap: 36, fontSize: ".92rem", fontWeight: 500, listStyle: "none", margin: 0, padding: 0 }}>
            {menuLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <li key={i}><div style={{ width: 60, height: 16, background: "var(--vedika-sand)", borderRadius: 4, opacity: 0.3 }} /></li>
                ))
              : primaryMenuItems.length > 0
                ? primaryMenuItems.map((item) => {
                    const hasChildren = item.children && item.children.length > 0;
                    const active = isNavItemActive(item);
                    return (
                      <li key={item.id} style={{ position: "relative" }}>
                        <button
                          onClick={() => navigateOrOpen(item)}
                          style={{
                            position: "relative", padding: "4px 0", color: active ? "var(--vedika-red)" : "var(--vedika-ink)",
                            background: "none", border: "none", cursor: "pointer", font: "inherit",
                            textDecoration: "none",
                          }}
                          onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "var(--vedika-red)"; }}
                          onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "var(--vedika-ink)"; }}
                        >
                          {item.label}
                          {hasChildren && <span style={{ marginLeft: 4, fontSize: ".7rem" }}>▾</span>}
                          <span style={{
                            content: "", position: "absolute", left: 0, bottom: -2,
                            width: active ? "100%" : "0", height: 1.5, background: "var(--vedika-red)",
                            transition: "width .25s ease", display: "block",
                          }} />
                        </button>
                        {hasChildren && (
                          <div style={{
                            position: "absolute", top: "100%", left: 0, marginTop: 8,
                            background: "var(--vedika-paper)", border: "1px solid var(--vedika-line)",
                            borderRadius: 8, boxShadow: "0 12px 30px -14px rgba(28,44,35,.28)",
                            minWidth: 180, padding: 8, zIndex: 100, display: "none",
                          }}
                            className="dropdown-menu"
                          >
                            {item.children?.map((child) => (
                              <button
                                key={child.id}
                                onClick={() => navigateOrOpen(child)}
                                style={{
                                  display: "block", width: "100%", textAlign: "left",
                                  padding: "8px 12px", fontSize: ".88rem", color: "var(--vedika-ink)",
                                  background: "none", border: "none", cursor: "pointer", font: "inherit",
                                  borderRadius: 4,
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--vedika-bg-alt)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                              >
                                {child.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </li>
                    );
                  })
                : allNavLinks.map((link) => {
                    const active = currentPage.type === link.page;
                    return (
                      <li key={link.slug || link.page}>
                        <button
                          onClick={() => onNavigate(link.page, link.slug)}
                          style={{
                            position: "relative", padding: "4px 0", color: active ? "var(--vedika-red)" : "var(--vedika-ink)",
                            background: "none", border: "none", cursor: "pointer", font: "inherit",
                            textDecoration: "none",
                          }}
                          onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "var(--vedika-red)"; }}
                          onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "var(--vedika-ink)"; }}
                        >
                          {link.label}
                          <span style={{
                            content: "", position: "absolute", left: 0, bottom: -2,
                            width: active ? "100%" : "0", height: 1.5, background: "var(--vedika-red)",
                            transition: "width .25s ease", display: "block",
                          }} />
                        </button>
                      </li>
                    );
                  })}
          </ul>

          {/* Right: Icon Actions */}
          <div className="nav-actions" style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {/* Search Button */}
            <button onClick={() => setSearchOpen(true)} className="icon-btn" aria-label="Search"
              style={{ width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--vedika-green-dark)", position: "relative", background: "none", border: "none", cursor: "pointer", transition: "background .2s ease" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--vedika-sand)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 19, height: 19 }}>
                <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
              </svg>
            </button>

            {/* Account Button */}
            <button onClick={() => onNavigate(auth?.user ? "account" : "login")} className="icon-btn" aria-label="Account"
              style={{ width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--vedika-green-dark)", position: "relative", background: "none", border: "none", cursor: "pointer", transition: "background .2s ease" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--vedika-sand)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 19, height: 19 }}>
                <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>
              </svg>
            </button>

            {/* Cart Button */}
            <button onClick={() => onNavigate("cart")} className="icon-btn" aria-label="Cart"
              style={{ width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--vedika-green-dark)", position: "relative", background: "none", border: "none", cursor: "pointer", transition: "background .2s ease" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--vedika-sand)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 19, height: 19 }}>
                <path d="M4 6h2l1.6 10.2A2 2 0 0 0 9.6 18h7.8a2 2 0 0 0 2-1.7L21 8H7"/><circle cx="10" cy="21" r="1"/><circle cx="18" cy="21" r="1"/>
              </svg>
              {cartItemCount > 0 && (
                <span className="cart-count" style={{
                  position: "absolute", top: -2, right: -2,
                  background: "var(--vedika-red)", color: "#fff",
                  fontSize: ".62rem", fontWeight: 700,
                  width: 16, height: 16, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button className="menu-toggle" aria-label="Menu" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--vedika-green-dark)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 26, height: 26 }}>
                    <path d="M3 6h18M3 12h18M3 18h18"/>
                  </svg>
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0" style={{ background: "var(--vedika-paper)", borderLeft: "1px solid var(--vedika-line)" }}>
                <SheetHeader className="border-b px-4 py-3" style={{ borderBottom: "1px solid var(--vedika-line)" }}>
                  <SheetTitle className="flex items-center gap-2 text-base" style={{ fontFamily: "var(--font-fraunces), Georgia, serif", color: "var(--vedika-green-dark)", fontSize: "1.2rem" }}>
                    <svg viewBox="0 0 32 32" fill="none" style={{ width: 24, height: 24 }}>
                      <circle cx="16" cy="16" r="15" stroke="#2F4A3C" strokeWidth="1.4"/>
                      <path d="M16 24C16 24 9 20.5 9 13.5C9 9.5 12 7 16 7C20 7 23 9.5 23 13.5C23 20.5 16 24 16 24Z" stroke="#2F4A3C" strokeWidth="1.3" strokeLinejoin="round"/>
                      <path d="M16 24V10" stroke="#2F4A3C" strokeWidth="1.3"/>
                    </svg>
                    {settings?.site_name || "Vedika"}
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 px-3 pt-3" role="navigation" aria-label="Mobile navigation">
                  {menuLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} style={{ height: 36, background: "var(--vedika-bg-alt)", borderRadius: 4, opacity: 0.3 }} />
                      ))
                    : primaryMenuItems.length > 0
                      ? primaryMenuItems.map((item) => {
                          const hasChildren = item.children && item.children.length > 0;
                          const isExpanded = expandedItems.has(item.id);
                          return (
                            <div key={item.id}>
                              {hasChildren ? (
                                <button
                                  onClick={(e) => { e.preventDefault(); toggleExpanded(item.id); }}
                                  style={{
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                    width: "100%", padding: "10px 12px", fontSize: ".92rem",
                                    fontWeight: 500, color: "var(--vedika-ink)",
                                    background: "none", border: "none", cursor: "pointer", font: "inherit",
                                    borderRadius: 6,
                                  }}
                                >
                                  <span>{item.label}</span>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s ease" }}>
                                    <path d="M6 9l6 6 6-6"/>
                                  </svg>
                                </button>
                              ) : (
                                <button
                                  onClick={() => navigateOrOpen(item)}
                                  style={{
                                    display: "block", width: "100%", textAlign: "left",
                                    padding: "10px 12px", fontSize: ".92rem", fontWeight: 500,
                                    color: "var(--vedika-ink)",
                                    background: "none", border: "none", cursor: "pointer", font: "inherit",
                                    borderRadius: 6,
                                  }}
                                >
                                  {item.label}
                                </button>
                              )}
                              {hasChildren && isExpanded && (
                                <div style={{ marginLeft: 12, borderLeft: "1px solid var(--vedika-line)", paddingLeft: 8 }}>
                                  {item.children?.map((child) => (
                                    <button
                                      key={child.id}
                                      onClick={() => navigateOrOpen(child)}
                                      style={{
                                        display: "block", width: "100%", textAlign: "left",
                                        padding: "8px 12px", fontSize: ".86rem", color: "var(--vedika-ink-soft)",
                                        background: "none", border: "none", cursor: "pointer", font: "inherit",
                                        borderRadius: 6,
                                      }}
                                    >
                                      {child.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })
                      : allNavLinks.map((link) => (
                          <button
                            key={link.slug || link.page}
                            onClick={() => { onNavigate(link.page, link.slug); setMobileOpen(false); }}
                            style={{
                              display: "block", width: "100%", textAlign: "left",
                              padding: "10px 12px", fontSize: ".92rem", fontWeight: 500,
                              color: currentPage.type === link.page ? "var(--vedika-red)" : "var(--vedika-ink)",
                              background: "none", border: "none", cursor: "pointer", font: "inherit",
                              borderRadius: 6,
                            }}
                          >
                            {link.label}
                          </button>
                        ))}

                  <div style={{ height: 1, background: "var(--vedika-line)", margin: "12px 0" }} />

                  <button
                    onClick={() => { onNavigate("cart"); setMobileOpen(false); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      width: "100%", textAlign: "left",
                      padding: "10px 12px", fontSize: ".92rem", color: "var(--vedika-ink)",
                      background: "none", border: "1px solid var(--vedika-line)", cursor: "pointer", font: "inherit",
                      borderRadius: 6, fontWeight: 500,
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 16, height: 16 }}>
                      <path d="M4 6h2l1.6 10.2A2 2 0 0 0 9.6 18h7.8a2 2 0 0 0 2-1.7L21 8H7"/><circle cx="10" cy="21" r="1"/><circle cx="18" cy="21" r="1"/>
                    </svg>
                    View Cart ({cartItemCount})
                  </button>

                  <button
                    onClick={() => { onNavigate(auth?.user ? "account" : "login"); setMobileOpen(false); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      width: "100%", textAlign: "left",
                      padding: "10px 12px", fontSize: ".92rem", color: "var(--vedika-ink)",
                      background: "none", border: "none", cursor: "pointer", font: "inherit",
                      borderRadius: 6,
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 16, height: 16 }}>
                      <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>
                    </svg>
                    My Account
                  </button>

                  <button
                    onClick={() => setSearchOpen(true)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      width: "100%", textAlign: "left",
                      padding: "10px 12px", fontSize: ".92rem", color: "var(--vedika-ink)",
                      background: "none", border: "1px solid var(--vedika-line)", cursor: "pointer", font: "inherit",
                      borderRadius: 6,
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 16, height: 16 }}>
                      <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
                    </svg>
                    Search Products
                  </button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-lg p-0 gap-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Search Products</DialogTitle>
          </DialogHeader>
          <div className="flex items-center border-b px-4">
            <SearchIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  saveSearchToHistory(searchQuery);
                  doSearch(searchQuery);
                }
              }}
              className="flex h-12 w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="shrink-0 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {searchLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery && searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <SearchIcon className="h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No results found
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try adjusting your search terms
                </p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="p-2">
                {searchResults.map((product) => {
                  const image = getFirstImage(product.images);
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleResultClick(product)}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left hover:bg-muted transition-colors"
                    >
                      {image ? (
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                          <Image
                            src={image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {product.Category && (
                            <span>{product.Category.name}</span>
                          )}
                          <span>{formatPrice(product.price)}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col py-2">
                {searchHistory.length > 0 && (
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Recent Searches
                    </span>
                    <button
                      onClick={clearSearchHistory}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear
                    </button>
                  </div>
                )}
                {searchHistory.length > 0 ? (
                  <div className="px-2">
                    {searchHistory.map((query, idx) => (
                      <div key={idx} className="flex items-center gap-2 group">
                        <button
                          onClick={() => {
                            setSearchQuery(query);
                            doSearch(query);
                          }}
                          className="flex flex-1 items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-muted transition-colors"
                        >
                          <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="text-sm">{query}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSearchFromHistory(query);
                          }}
                          className="shrink-0 p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Remove "${query}" from history`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <SearchIcon className="h-8 w-8 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Start typing to search products
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Press{" "}
                      <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">
                        Esc
                      </kbd>{" "}
                      to close
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
