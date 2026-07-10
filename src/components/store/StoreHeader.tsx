"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Menu,
  X,
  User,
  ShoppingBag,
  FileText,
  Search,
  ChevronDown,
  ChevronRight,
  Clock,
  Trash2,
  ShoppingCart,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, getFirstImage } from "@/lib/utils";
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

const mainNavLinks: NavItem[] = [];

export function StoreHeader({ onNavigate }: StoreHeaderProps) {
  const { currentPage, settings, cart, wishlistIds } = useAppStore();
  const isB2C = settings?.store_mode === "b2c";
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
                "catalogue",
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
        `/api/products?search=${encodeURIComponent(query)}`,
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

  const handleResultClick = (product: { name: string; id: string }) => {
    saveSearchToHistory(searchQuery);
    setSearchOpen(false);
    useAppStore.getState().openEnquiryModal(product.name, product.id);
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
    catalogue: "catalogue",
    catalog: "catalogue",
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
          if (segments[0] === "product" && segments[1])
            onNavigate("category", segments[1]);
          else if (segments[0] === "product") onNavigate("products");
          else if (segments[0] === "catalogue" && segments[1])
            onNavigate("category", segments[1]);
          else if (segments[0] === "catalogue") onNavigate("catalogue");
          else if (segments[0] === "blog" && segments[1])
            onNavigate("blog-post", segments[1]);
          else if (segments[0] === "blog") onNavigate("blog");
          else if (segments[0] === "about") onNavigate("about");
          else if (segments[0] === "manufacturing") onNavigate("manufacturing");
          else if (segments[0] === "contact") onNavigate("contact");
          else if (
            segments[0] === "products" ||
            (segments[0] === "product" && !segments[1])
          )
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
          onNavigate("catalogue");
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
      {/* === MAIN NAVIGATION BAR === */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          {/* Logo */}
          <Link href={"/"}>
            <button
              onClick={() => onNavigate("home")}
              className="flex items-center gap-2 transition-opacity hover:opacity-80 shrink-0"
            >
              {settings?.site_logo ? (
                <img
                  src={settings.site_logo}
                  alt={settings.site_name || "Logo"}
                  className="h-[50px] w-auto object-contain"
                />
              ) : (
                <img
                  src="/pruvabites.jpg"
                  alt="Logo"
                  className="h-[50px] w-auto object-contain"
                />
              )}
              <span className="text-lg font-bold tracking-tight hidden sm:inline">
                {settings?.site_name}
              </span>
            </button>
          </Link>

          {/* Desktop Navigation - Center */}
          <nav
            className="hidden lg:flex items-center gap-0.5"
            role="navigation"
            aria-label="Main navigation"
          >
            {menuLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-9 w-20 bg-muted animate-pulse rounded"
                  />
                ))
              : primaryMenuItems.length > 0
                ? primaryMenuItems.map((item) => {
                    const hasChildren =
                      item.children && item.children.length > 0;
                    const active = isNavItemActive(item);
                    return (
                      <div key={item.id} className="relative group">
                        <Button
                          variant="ghost"
                          className={cn(
                            "relative text-sm font-medium px-3 text-black hover:text-white",
                            active &&
                              "after:absolute after:-bottom-[1px] after:left-2 after:right-2 after:h-0.5 after:bg-primary after:rounded-full after:content-['']",
                          )}
                          onClick={() => navigateOrOpen(item)}
                        >
                          {item.label}
                          {hasChildren && (
                            <ChevronDown className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                        {hasChildren && (
                          <div className="absolute top-full left-0 mt-1 w-48 rounded-md bg-popover border shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            {item.children?.map((child) => (
                              <button
                                key={child.id}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors"
                                onClick={() => navigateOrOpen(child)}
                              >
                                {child.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                : allNavLinks.map((link) => {
                    const active = currentPage.type === link.page;
                    return (
                      <Button
                        key={link.slug || link.page}
                        variant="ghost"
                        className={cn(
                          "relative text-sm font-medium px-3",
                          active &&
                            "after:absolute after:-bottom-[1px] after:left-2 after:right-2 after:h-0.5 after:bg-primary after:rounded-full after:content-['']",
                        )}
                        onClick={() => onNavigate(link.page, link.slug)}
                      >
                        {link.label}
                      </Button>
                    );
                  })}
          </nav>

          {/* Right: Search + CTA */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
            >
              <Search className="h-4.5 w-4.5" />
            </Button>

            {/* Account Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => onNavigate("account")}
              aria-label="Account"
            >
              <User className="h-4.5 w-4.5" />
            </Button>

            {/* Wishlist Button (B2C) */}
            {isB2C && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 relative"
                onClick={() => onNavigate("wishlist")}
                aria-label="View wishlist"
              >
                <Heart className="h-4.5 w-4.5" />
                {wishlistIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                    {wishlistIds.length}
                  </span>
                )}
              </Button>
            )}

            {/* Cart Button (B2C) */}
            {isB2C && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 relative"
                onClick={() => onNavigate("cart")}
                aria-label="View cart"
              >
                <ShoppingCart className="h-4.5 w-4.5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            )}

            {/* Get Bulk Quote CTA (B2B) */}
            {!isB2C && (
              <Button
                size="sm"
                className="hidden md:flex text-sm bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 px-4"
                onClick={() => onNavigate("products")}
              >
                <FileText className="h-4 w-4" />
                Get Bulk Quote
              </Button>
            )}
            {/* Mobile Menu Trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <SheetHeader className="border-b px-4 py-3">
                  <SheetTitle className="flex items-center gap-2 text-base">
                    {settings?.site_logo ? (
                      <img
                        src={settings.site_logo}
                        alt={settings.site_name || "Logo"}
                        className="h-6 w-auto object-contain"
                      />
                    ) : (
                      <ShoppingBag className="h-5 w-5 text-primary" />
                    )}
                    {settings?.site_name}
                  </SheetTitle>
                </SheetHeader>
                <nav
                  className="flex flex-col gap-1 px-3 pt-3"
                  role="navigation"
                  aria-label="Mobile navigation"
                >
                  {menuLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-9 w-full bg-muted animate-pulse rounded"
                        />
                      ))
                    : primaryMenuItems.length > 0
                      ? primaryMenuItems.map((item) => {
                          const hasChildren =
                            item.children && item.children.length > 0;
                          const isExpanded = expandedItems.has(item.id);
                          return (
                            <div key={item.id}>
                              {hasChildren ? (
                                <Button
                                  variant="ghost"
                                  className="justify-between text-sm h-9 w-full"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toggleExpanded(item.id);
                                  }}
                                >
                                  <span>{item.label}</span>
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                                  )}
                                </Button>
                              ) : (
                                <SheetClose asChild>
                                  <Button
                                    variant="ghost"
                                    className="justify-start text-sm h-9 w-full"
                                    onClick={() => navigateOrOpen(item)}
                                  >
                                    {item.label}
                                  </Button>
                                </SheetClose>
                              )}
                              {hasChildren && isExpanded && (
                                <div className="ml-3 border-l pl-2 space-y-0.5">
                                  {item.children?.map((child) => (
                                    <SheetClose asChild key={child.id}>
                                      <Button
                                        variant="ghost"
                                        className="justify-start text-sm h-9 w-full pl-3"
                                        onClick={() => navigateOrOpen(child)}
                                      >
                                        {child.label}
                                      </Button>
                                    </SheetClose>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })
                      : allNavLinks.map((link) => (
                          <SheetClose asChild key={link.slug || link.page}>
                            <Button
                              variant="ghost"
                              className="justify-start text-sm h-9"
                              onClick={() => onNavigate(link.page, link.slug)}
                            >
                              {link.label}
                            </Button>
                          </SheetClose>
                        ))}

                  <Separator className="my-2" />

                  {/* Bulk Quote CTA (B2B) */}
                  {!isB2C && (
                    <SheetClose asChild>
                      <Button
                        className="justify-start text-sm h-9 bg-primary text-primary-foreground w-full"
                        onClick={() => onNavigate("products")}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Get Bulk Quote
                      </Button>
                    </SheetClose>
                  )}

                  {/* Cart CTA (B2C) */}
                  {isB2C && (
                    <SheetClose asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-sm h-9 w-full"
                        onClick={() => onNavigate("cart")}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        View Cart ({cartItemCount})
                      </Button>
                    </SheetClose>
                  )}

                  {/* Account */}
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="justify-start text-sm h-9"
                      onClick={() => onNavigate("account")}
                    >
                      <User className="mr-2 h-4 w-4" />
                      My Account
                    </Button>
                  </SheetClose>

                  {/* Search */}
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-sm h-9"
                      onClick={() => setSearchOpen(true)}
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Search Products
                    </Button>
                  </SheetClose>
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
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
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
                <Search className="h-8 w-8 text-muted-foreground/50" />
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
                    <Search className="h-8 w-8 text-muted-foreground/50" />
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
