'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  Package,
  FolderOpen,
  BookOpen,
  FileText,
  Users,
  Loader2,
  CornerDownLeft,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { adminFetch } from '@/lib/admin-fetch';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  tab: string;
  data: unknown;
}

interface SearchResults {
  products: SearchResult[];
  categories: SearchResult[];
  blogPosts: SearchResult[];
  pages: SearchResult[];
  users: SearchResult[];
}

interface AdminSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (tab: string, data?: unknown) => void;
}

const typeConfig: Record<string, { label: string; icon: typeof Package }> = {
  products: { label: 'Products', icon: Package },
  categories: { label: 'Categories', icon: FolderOpen },
  blogPosts: { label: 'Blog Posts', icon: BookOpen },
  pages: { label: 'Pages', icon: FileText },
  users: { label: 'Users', icon: Users },
};

function getResultCount(results: SearchResults): number {
  return (
    results.products.length +
    results.categories.length +
    results.blogPosts.length +
    results.pages.length +
    results.users.length
  );
}

export function AdminSearchDialog({ open, onOpenChange, onNavigate }: AdminSearchDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build flat list of all results for keyboard navigation
  const flatResults = results
    ? [
        ...results.products.map((r) => ({ ...r, group: 'products' })),
        ...results.categories.map((r) => ({ ...r, group: 'categories' })),
        ...results.blogPosts.map((r) => ({ ...r, group: 'blogPosts' })),
        ...results.pages.map((r) => ({ ...r, group: 'pages' })),
        ...results.users.map((r) => ({ ...r, group: 'users' })),
      ]
    : [];

  const doSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await adminFetch(`/api/admin/search?q=${encodeURIComponent(searchTerm)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setSelectedIndex(0);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(value);
    }, 300);
  };

  const handleSelect = (result: SearchResult) => {
    onOpenChange(false);
    setQuery('');
    setResults(null);
    onNavigate(result.tab, result.data);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (flatResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flatResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatResults.length) % flatResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = flatResults[selectedIndex];
      if (selected) {
        handleSelect(selected);
      }
    }
  };

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery('');
      setResults(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>Search across products, categories, blog posts, pages, and users</DialogDescription>
        </DialogHeader>

        {/* Search Input */}
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search products, categories, blog, pages, users..."
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-12 border-0 shadow-none focus-visible:ring-0 px-0"
          />
          {loading && (
            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
          )}
          <kbd className="pointer-events-none ml-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
            <CornerDownLeft className="h-2.5 w-2.5" />
            <span>enter</span>
          </kbd>
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[400px] overflow-y-auto">
          {!query || query.length < 2 ? (
            <div className="px-4 py-8 text-center">
              <Search className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                Type at least 2 characters to search
              </p>
            </div>
          ) : loading && !results ? (
            <div className="px-4 py-8 text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Searching...</p>
            </div>
          ) : results && getResultCount(results) === 0 ? (
            <div className="px-4 py-8 text-center">
              <Search className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No results found for &ldquo;{query}&rdquo;
              </p>
            </div>
          ) : results ? (
            <div className="py-2">
              {(['products', 'categories', 'blogPosts', 'pages', 'users'] as const).map((group) => {
                const items = results[group];
                if (items.length === 0) return null;
                const config = typeConfig[group];
                const GroupIcon = config.icon;

                return (
                  <div key={group}>
                    {/* Group Header */}
                    <div className="px-4 py-1.5 text-xs font-medium text-muted-foreground">
                      {config.label}
                    </div>
                    {/* Group Items */}
                    {items.map((item) => {
                      // Calculate flat index for this item
                      const flatIdx = flatResults.findIndex(
                        (r) => r.id === item.id && r.group === group
                      );
                      const isSelected = flatIdx === selectedIndex;

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          className={`flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <GroupIcon
                            className={`h-4 w-4 shrink-0 ${
                              isSelected
                                ? 'text-emerald-600'
                                : 'text-muted-foreground'
                            }`}
                          />
                          <div className="flex-1 text-left min-w-0">
                            <p className="font-medium truncate">{item.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {item.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ) : null}
        </ScrollArea>

        {/* Footer hint */}
        <div className="border-t px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">↑↓</kbd>
            <span>navigate</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">↵</kbd>
            <span>open</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">esc</kbd>
            <span>close</span>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
