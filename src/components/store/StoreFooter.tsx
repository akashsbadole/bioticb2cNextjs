"use client";

import {
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

import { useState, useEffect } from "react";
import { Newsletter } from "./Newsletter";

interface StoreFooterProps {
  onNavigate: (page: string, data?: unknown) => void;
  settings?: Record<string, string> | null;
}

interface FooterMenuItem {
  id: string;
  label: string;
  page?: string;
  url?: string;
  slug?: string;
  children?: FooterMenuItem[];
}

interface FooterMenuData {
  menu: { name: string } | null;
  items: FooterMenuItem[];
}

export function StoreFooter({ onNavigate, settings }: StoreFooterProps) {
  const companyEmail = settings?.site_email || settings?.contact_email || "";
  const companyPhone = settings?.site_phone || settings?.contact_phone || "";
  const companyAddress =
    settings?.site_address || settings?.contact_address || "";
  const siteName = settings?.site_name || "Purva Bites";

  const [footerMenus, setFooterMenus] = useState<FooterMenuData[]>([]);
  const [loading, setLoading] = useState(true);

  const facebookUrl = settings?.facebook_url || "#";
  const twitterUrl = settings?.twitter_url || "#";
  const instagramUrl = settings?.instagram_url || "#";
  const linkedinUrl = settings?.linkedin_url || "#";

  // Fetch all footer columns
  useEffect(() => {
    async function fetchFooterMenus() {
      try {
        const locations = ["footer_1", "footer_2", "footer_3"];
        const results = await Promise.all(
          locations.map(async (loc) => {
            const res = await fetch(`/api/menus?location=${loc}`, {
              cache: "no-store",
            });
            if (res.ok) {
              return await res.json();
            }
            return { menu: null, items: [] };
          }),
        );
        // Filter out empty columns
        setFooterMenus(results.filter((r) => r.items && r.items.length > 0));
      } catch (error) {
        console.error("Failed to fetch footer menus:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFooterMenus();
  }, []);

  const renderMenuItems = (items: FooterMenuItem[]) => {
    return items.map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      return (
        <div key={item.id} className="space-y-2">
          <button
            onClick={() => {
              if (item.url) {
                if (item.url.startsWith("/")) {
                  const segs = item.url.split("/").filter(Boolean);
                  if (segs[0] === "product" && segs[1]) onNavigate("category", segs[1]);
                  else if (segs[0] === "product") onNavigate("products");
                  else if (segs[0] === "catalogue" && segs[1]) onNavigate("category", segs[1]);
                  else if (segs[0] === "catalogue") onNavigate("catalogue");
                  else if (segs[0] === "blog" && segs[1]) onNavigate("blog-post", segs[1]);
                  else if (segs[0] === "blog") onNavigate("blog");
                  else if (segs[0] === "about") onNavigate("about");
                  else if (segs[0] === "manufacturing") onNavigate("manufacturing");
                  else if (segs[0] === "contact") onNavigate("contact");
                  else if (segs[0] === "products" || (segs[0] === "product" && !segs[1])) onNavigate("products");
                  else onNavigate("content-page", segs.join("/"));
                } else {
                  window.open(item.url, "_blank");
                }
              } else if (item.page && item.page !== "url") {
                onNavigate(item.page, item.slug);
              }
            }}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline text-left"
          >
            {item.label}
          </button>
          {hasChildren && (
            <div className="pl-4 flex flex-col gap-2">
              {renderMenuItems(item.children!)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <footer className="border-t bg-muted/30" role="contentinfo">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 max-w-2xl">
            <Newsletter />
        </div>
        <Separator className="mb-12" />
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold tracking-tight">
                {siteName}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {settings?.site_description ||
                "Your trusted online store for quality products and exceptional service."}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Dynamic Footer Columns */}
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="space-y-2">
                  <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-28 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-30 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))
          ) : footerMenus.length > 0 ? (
            footerMenus.map((menuData, idx) => (
              <div key={idx} className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider">
                  {menuData.menu?.name || "Links"}
                </h3>
                <div className="flex flex-col gap-2">
                  {renderMenuItems(menuData.items)}
                </div>
              </div>
            ))
          ) : (
            /* Minimal Fallback if no menus at all */
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider">
                Quick Links
              </h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => onNavigate("home")}
                  className="text-sm text-muted-foreground hover:text-foreground text-left"
                >
                  Home
                </button>
                <button
                  onClick={() => onNavigate("catalogue")}
                  className="text-sm text-muted-foreground hover:text-foreground text-left"
                >
                  Catalogue
                </button>
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Contact Info
            </h3>
            <ul className="space-y-3">
              {companyEmail && (
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <a
                    href={`mailto:${companyEmail}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {companyEmail}
                  </a>
                </li>
              )}
              {companyPhone && (
                <li className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <a
                    href={`tel:${companyPhone}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {companyPhone}
                  </a>
                </li>
              )}
              {companyAddress && (
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {companyAddress}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {(settings?.company_gstin || settings?.company_fssai || settings?.company_cin) && (
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 mb-6 text-xs text-muted-foreground">
            {settings.company_gstin && <span>GSTIN: {settings.company_gstin}</span>}
            {settings.company_fssai && <span>FSSAI: {settings.company_fssai}</span>}
            {settings.company_cin && <span>CIN: {settings.company_cin}</span>}
          </div>
        )}

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Crafted with care for quality shopping.
          </p>
        </div>
      </div>
    </footer>
  );
}
