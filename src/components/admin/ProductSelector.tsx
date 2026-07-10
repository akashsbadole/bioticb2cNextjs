"use client";

import { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, X, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
}

interface ProductSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProductSelector({ value, onChange }: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedIds: string[] = (() => {
    try {
      const parsed = JSON.parse(value || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return value ? value.split(",").map((s) => s.trim()).filter(Boolean) : [];
    }
  })();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/products?all=true&limit=200`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = products.filter(
    (p) =>
      !selectedIds.includes(p.id) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())),
  );

  const selectedProducts = products.filter((p) => selectedIds.includes(p.id));

  const toggleProduct = (id: string) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    onChange(JSON.stringify(next));
  };

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <div className="flex flex-wrap gap-1.5 min-h-[36px] p-1.5 border rounded-md bg-background">
        {selectedProducts.length === 0 && (
          <span className="text-sm text-muted-foreground px-1 py-0.5">
            No products selected
          </span>
        )}
        {selectedProducts.map((p) => (
          <Badge key={p.id} variant="secondary" className="gap-1">
            {p.name}
            <button
              type="button"
              onClick={() => toggleProduct(p.id)}
              className="ml-0.5 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="relative">
        <div
          className="flex items-center border rounded-md px-3 py-2 cursor-pointer hover:border-primary transition-colors"
          onClick={() => setOpen(!open)}
        >
          <Search className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm text-muted-foreground flex-1">
            {open ? "Type to search products..." : "Search & add products..."}
          </span>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
        </div>
        {open && (
          <div className="absolute z-50 mt-1 w-full border rounded-md bg-popover shadow-md">
            <div className="p-2 border-b">
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="h-8"
              />
            </div>
            <div className="max-h-48 overflow-y-auto p-1">
              {loading && (
                <p className="text-sm text-muted-foreground p-2">
                  Loading...
                </p>
              )}
              {!loading && filtered.length === 0 && (
                <p className="text-sm text-muted-foreground p-2">
                  No products found
                </p>
              )}
              {!loading &&
                filtered.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-left",
                    )}
                    onClick={() => {
                      toggleProduct(p.id);
                      setSearch("");
                    }}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        selectedIds.includes(p.id)
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    <span className="flex-1 truncate">{p.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {p.sku}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Leave empty to show random products from this category
      </p>
    </div>
  );
}
