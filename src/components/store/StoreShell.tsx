"use client";

import { useEffect, useCallback, useState, ReactNode } from "react";
import { useAppStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { StoreLayout } from "./StoreLayout";
import { HomePage } from "./HomePage";
import { CataloguePage } from "./CataloguePage";
import { CategoryPage } from "./CategoryPage";
import { ProductPage } from "./ProductPage";
import { ProductsOverviewPage } from "./ProductsOverviewPage";
import { BlogPage } from "./BlogPage";
import { BlogPostView } from "./BlogPostView";
import { CmsPage } from "./CmsPage";
import { AboutPage } from "./AboutPage";
import { ManufacturingPage } from "./ManufacturingPage";
import { ContactPage } from "./ContactPage";
import { CartPage } from "./CartPage";
import { CheckoutPage } from "./CheckoutPage";
import { OrderSuccessPage } from "./OrderSuccessPage";
import { OrdersPage } from "./OrdersPage";
import { AccountPage } from "./AccountPage";
import { WishlistPage } from "./WishlistPage";
import { FaqPage } from "./FaqPage";
import { ComparisonPage } from "./ComparisonPage";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface StoreShellProps {
  initialPage?: string | { type: string; slug?: string };
  children?: ReactNode;
}

const routeFromPath = (path: string, navigate: (page: string, data?: unknown) => void) => {
  if (path === "/" || path === "") return;
  const segments = path.split("/").filter(Boolean);
  if (segments[0] === "product" && segments[1]) {
    navigate("category", segments[1]);
  } else if (segments[0] === "catalogue") {
    if (segments[1]) navigate("category", segments[1]);
    else navigate("catalogue");
  } else if (segments[0] === "about") {
    navigate("about");
  } else if (segments[0] === "manufacturing") {
    navigate("manufacturing");
  } else if (segments[0] === "contact") {
    navigate("contact");
  } else if (segments[0] === "cart") {
    navigate("cart");
  } else if (segments[0] === "checkout") {
    navigate("checkout");
  } else if (segments[0] === "order-success" && segments[1]) {
    navigate("order-success", segments[1]);
  } else if (segments[0] === "account") {
    navigate("account");
  } else if (segments[0] === "wishlist") {
    navigate("wishlist");
  } else if (segments[0] === "faq") {
    navigate("faq");
  } else if (segments[0] === "compare") {
    navigate("compare");
  } else if (segments[0] === "blog") {
    if (segments[1]) navigate("blog-post", segments[1]);
    else navigate("blog");
  } else if (segments[0] === "products" || (segments[0] === "product" && !segments[1])) {
    navigate("products");
  } else {
    navigate("content-page", segments.join("/"));
  }
};

interface ShellPage {
  type: string;
  slug?: string;
}

function toPage(initialPage: string | { type: string; slug?: string } | undefined): ShellPage | null {
  if (!initialPage) return null;
  if (typeof initialPage === "string") return { type: initialPage };
  return initialPage;
}

export function StoreShell({ initialPage, children }: StoreShellProps) {
  const storePage = useAppStore((s) => s.currentPage);
  const navigate = useAppStore((s) => s.navigate);

  const initialPageObj = toPage(initialPage);

  const [page, setPage] = useState<ShellPage>(() => initialPageObj ?? storePage);

  useEffect(() => {
    if (initialPageObj) {
      const state = useAppStore.getState();
      const current = state.currentPage;
      const needsNav = initialPageObj.slug
        ? current.type !== initialPageObj.type || (current as ShellPage).slug !== initialPageObj.slug
        : current.type !== initialPageObj.type;
      if (needsNav) {
        state.navigate(initialPageObj.type, initialPageObj.slug);
      }
    } else {
      const path = window.location.pathname;
      if (path !== "/" && !path.startsWith("/admin")) {
        routeFromPath(path, navigate);
      }
    }

    const handlePopState = () => {
      const currentPath = window.location.pathname;
      if (currentPath === "/" || currentPath === "") {
        navigate("home");
      } else if (!currentPath.startsWith("/admin")) {
        routeFromPath(currentPath, navigate);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const unsub = useAppStore.subscribe((state) => {
      setPage(state.currentPage);
    });
    return unsub;
  }, []);

  const renderPage = useCallback(() => {
    switch (page.type) {
      case "home":
        return <HomePage onNavigate={navigate} />;
      case "catalogue":
        return <CataloguePage onNavigate={navigate} />;
      case "category":
        return <CategoryPage slug={page.slug!} onNavigate={navigate} />;
      case "content-page":
        return <CmsPage slug={page.slug!} onNavigate={navigate} />;
      case "product-page":
        return <ProductPage slug={page.slug!} onNavigate={navigate} />;
      case "products":
        return <ProductsOverviewPage onNavigate={navigate} />;
      case "blog":
        return <BlogPage onNavigate={navigate} />;
      case "blog-post":
        return <BlogPostView postId={page.slug!} onNavigate={navigate} />;
      case "about":
        return <AboutPage onNavigate={navigate} />;
      case "manufacturing":
        return <ManufacturingPage onNavigate={navigate} />;
      case "contact":
        return <ContactPage onNavigate={navigate} />;
      case "cart":
        return <CartPage />;
      case "checkout":
        return <CheckoutPage />;
      case "order-success":
        return <OrderSuccessPage orderId={(page as any).orderId} />;
      case "orders":
        return <OrdersPage />;
      case "account":
        return <AccountPage />;
      case "wishlist":
        return <WishlistPage />;
      case "faq":
        return <FaqPage />;
      case "compare":
        return <ComparisonPage />;
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative">
              <span className="text-[8rem] font-black leading-none tracking-tighter text-emerald-100 dark:text-emerald-900/30 select-none sm:text-[10rem]">
                404
              </span>
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">
              Page not found
            </h1>
            <p className="mt-2 text-muted-foreground max-w-md">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate("home")}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
              >
                Back to Home
              </button>
              <button
                onClick={() => navigate("catalogue")}
                className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Browse Catalogue
              </button>
            </div>
          </div>
        );
    }
  }, [page, navigate]);

  if (children) return <>{children}</>;

  return (
    <StoreLayout currentPage={page.type} onNavigate={navigate}>
      <AnimatePresence mode="wait">
        <motion.div
            key={page.type + (page.slug || "")}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
        >
            <ErrorBoundary>{renderPage()}</ErrorBoundary>
        </motion.div>
      </AnimatePresence>
    </StoreLayout>
  );
}
