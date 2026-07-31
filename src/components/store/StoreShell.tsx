"use client";

import { useEffect, useCallback, useState, ReactNode, Suspense } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useAppStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { StoreLayout } from "./StoreLayout";
import { PageSkeleton } from "./PageSkeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { StorefrontInitialData } from "@/lib/storefront-data";

interface StoreShellProps {
  initialPage?: string | { type: string; slug?: string };
  initialData?: StorefrontInitialData;
  children?: ReactNode;
}

const routeFromPath = (
  path: string,
  navigate: (page: string, data?: unknown) => void,
) => {
  if (path === "/" || path === "") return;
  const segments = path.split("/").filter(Boolean);
  if (segments[0] === "products" && segments[1]) {
    navigate("product-page", segments[1]);
  } else if (segments[0] === "shop") {
    if (segments[1]) navigate("category", segments[1]);
    else navigate("shop");
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
  } else if (segments[0] === "login") {
    navigate("login");
  } else if (segments[0] === "register") {
    navigate("register");
  } else if (segments[0] === "wishlist") {
    navigate("wishlist");
  } else if (segments[0] === "orders") {
    navigate("orders");
  } else if (segments[0] === "bundles") {
    navigate("bundles");
  } else if (segments[0] === "faq") {
    navigate("faq");
  } else if (segments[0] === "compare") {
    navigate("compare");
  } else if (segments[0] === "support") {
    navigate("support");
  } else if (segments[0] === "tracking") {
    navigate("tracking");
  } else if (segments[0] === "blog") {
    if (segments[1]) navigate("blog-post", segments[1]);
    else navigate("blog");
  } else if (segments[0] === "products") {
    navigate("products");
  } else {
    navigate("content-page", segments.join("/"));
  }
};

interface ShellPage {
  type: string;
  slug?: string;
}

function toPage(
  initialPage: string | { type: string; slug?: string } | undefined,
): ShellPage | null {
  if (!initialPage) return null;
  if (typeof initialPage === "string") return { type: initialPage };
  return initialPage;
}

const HomePage = dynamic(() => import("./HomePage").then((m) => m.HomePage), {
  ssr: false,
  loading: () => <PageSkeleton />,
});
const ShopPage = dynamic(() => import("./ShopPage").then((m) => m.ShopPage), {
  ssr: false,
  loading: () => <PageSkeleton />,
});
const CategoryPage = dynamic(
  () => import("./CategoryPage").then((m) => m.CategoryPage),
  { ssr: false, loading: () => <PageSkeleton /> },
);
const ProductPage = dynamic(
  () => import("./ProductPage").then((m) => m.ProductPage),
  { ssr: false, loading: () => <PageSkeleton /> },
);
const ProductsOverviewPage = dynamic(
  () => import("./ProductsOverviewPage").then((m) => m.ProductsOverviewPage),
  { ssr: false, loading: () => <PageSkeleton /> },
);
const CartPage = dynamic(() => import("./CartPage").then((m) => m.CartPage), {
  ssr: false,
  loading: () => <PageSkeleton />,
});
const CheckoutPage = dynamic(
  () => import("./CheckoutPage").then((m) => m.CheckoutPage),
  { ssr: false, loading: () => <PageSkeleton /> },
);
const OrderSuccessPage = dynamic(
  () => import("./OrderSuccessPage").then((m) => m.OrderSuccessPage),
  { ssr: false, loading: () => <PageSkeleton /> },
);
const OrdersPage = dynamic(
  () => import("./OrdersPage").then((m) => m.OrdersPage),
  { ssr: false, loading: () => <PageSkeleton /> },
);
const AccountPage = dynamic(
  () => import("./AccountPage").then((m) => m.AccountPage),
  { ssr: false, loading: () => <PageSkeleton /> },
);
const LoginPage = dynamic(
  () => import("./LoginPage").then((m) => m.LoginPage),
  { ssr: false, loading: () => <PageSkeleton /> },
);
const RegisterPage = dynamic(
  () => import("./RegisterPage").then((m) => m.RegisterPage),
  { ssr: false, loading: () => <PageSkeleton /> },
);
const WishlistPage = dynamic(
  () => import("./WishlistPage").then((m) => m.WishlistPage),
  { ssr: false, loading: () => <PageSkeleton /> },
);
const ComparisonPage = dynamic(
  () => import("./ComparisonPage").then((m) => m.ComparisonPage),
  { ssr: false, loading: () => <PageSkeleton /> },
);
const BundlesPage = dynamic(
  () => import("./BundlesPage").then((m) => m.BundlesPage),
  { ssr: false, loading: () => <PageSkeleton /> },
);

const BlogPage = dynamic(() => import("./BlogPage").then((m) => m.BlogPage), {
  loading: () => <PageSkeleton />,
});
const BlogPostView = dynamic(
  () => import("./BlogPostView").then((m) => m.BlogPostView),
  { loading: () => <PageSkeleton /> },
);
const CmsPage = dynamic(() => import("./CmsPage").then((m) => m.CmsPage), {
  loading: () => <PageSkeleton />,
});
const AboutPage = dynamic(
  () => import("./AboutPage").then((m) => m.AboutPage),
  { loading: () => <PageSkeleton /> },
);
const ManufacturingPage = dynamic(
  () => import("./ManufacturingPage").then((m) => m.ManufacturingPage),
  { loading: () => <PageSkeleton /> },
);
const ContactPage = dynamic(
  () => import("./ContactPage").then((m) => m.ContactPage),
  { loading: () => <PageSkeleton /> },
);
const FaqPage = dynamic(() => import("./FaqPage").then((m) => m.FaqPage), {
  loading: () => <PageSkeleton />,
});
const SupportPage = dynamic(
  () => import("./SupportPage").then((m) => m.SupportPage),
  { loading: () => <PageSkeleton /> },
);
const TrackingPage = dynamic(
  () => import("./TrackingPage").then((m) => m.TrackingPage),
  { loading: () => <PageSkeleton /> },
);

export function StoreShell({ initialPage, initialData, children }: StoreShellProps) {
  const storePage = useAppStore((s) => s.currentPage);
  const navigate = useAppStore((s) => s.navigate);
  const setAuthUser = useAppStore((s) => s.setAuthUser);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      setAuthUser({
        id: session.user.id,
        email: session.user.email || "",
        name: session.user.name || "",
        role: (session.user as { role?: string }).role || "customer",
      });
    }
  }, [session, setAuthUser]);

  const initialPageObj = toPage(initialPage);

  const [page, setPage] = useState<ShellPage>(
    () => initialPageObj ?? storePage,
  );

  useEffect(() => {
    if (initialPageObj) {
      const state = useAppStore.getState();
      const current = state.currentPage;
      const needsNav = initialPageObj.slug
        ? current.type !== initialPageObj.type ||
          (current as ShellPage).slug !== initialPageObj.slug
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
        return <HomePage onNavigate={navigate} initialData={initialData?.home} />;
      case "shop":
        return <ShopPage onNavigate={navigate} initialData={initialData?.shop} />;
      case "category":
        return <CategoryPage slug={page.slug!} onNavigate={navigate} initialData={initialData?.category} />;
      case "content-page":
        return <CmsPage slug={page.slug!} onNavigate={navigate} />;
      case "product-page":
        return <ProductPage slug={page.slug!} onNavigate={navigate} />;
      case "products":
        return <ProductsOverviewPage onNavigate={navigate} />;
      case "blog":
        return <BlogPage onNavigate={navigate} initialData={initialData?.blog} />;
      case "blog-post":
        return <BlogPostView postId={page.slug!} onNavigate={navigate} initialData={initialData?.blogPost} />;      case "about":
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
      case "login":
        return <LoginPage />;
      case "register":
        return <RegisterPage />;
      case "wishlist":
        return <WishlistPage />;
      case "faq":
        return <FaqPage />;
      case "compare":
        return <ComparisonPage />;
      case "support":
        return <SupportPage />;
      case "tracking":
        return <TrackingPage />;
      case "bundles":
        return <BundlesPage />;
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
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate("home")}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
              >
                Back to Home
              </button>
              <button
                onClick={() => navigate("shop")}
                className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Browse Shop
              </button>
            </div>
          </div>
        );
    }
  }, [page, navigate, initialData]);

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
          <Suspense fallback={<PageSkeleton />}>
            <ErrorBoundary>{renderPage()}</ErrorBoundary>
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </StoreLayout>
  );
}
