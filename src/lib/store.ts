import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";

// ── Abandoned-cart recovery: persist cart to DB for guests & users ──

function getDeviceId(): string | null {
  if (typeof window === "undefined") return null;
  let id = localStorage.getItem("cart_device_id");
  if (!id) {
    id =
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `dev_${Date.now()}_${Math.random().toString(36).slice(2)}`);
    localStorage.setItem("cart_device_id", id);
  }
  return id;
}

let cartSyncTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleCartSync() {
  if (typeof window === "undefined") return;
  if (cartSyncTimer) clearTimeout(cartSyncTimer);
  cartSyncTimer = setTimeout(() => {
    const state = useAppStore.getState();
    const items = state.cart.items.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      quantity: i.quantity,
    }));
    const deviceId = getDeviceId();
    if (!deviceId) return;
    fetch("/api/account/cart/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(state.auth.token
          ? { Authorization: `Bearer ${state.auth.token}` }
          : {}),
      },
      body: JSON.stringify({ items, guestToken: deviceId }),
    }).catch(() => { });
  }, 800);
}

export type Page =
  | { type: "home" }
  | { type: "shop" }
  | { type: "category"; slug: string }
  | { type: "products" }
  | { type: "contact" }
  | { type: "about" }
  | { type: "manufacturing" }
  | { type: "blog" }
  | { type: "blog-post"; slug: string }
  | { type: "product-page"; slug: string }
  | { type: "content-page"; slug: string }
  | { type: "admin-login" }
  | { type: "admin"; activeTab: string }
  | { type: "cart" }
  | { type: "checkout" }
  | { type: "order-success"; orderId: string }
  | { type: "orders" }
  | { type: "wishlist" }
  | { type: "login" }
  | { type: "register" }
  | { type: "faq" }
  | { type: "compare" }
  | { type: "support" }
  | { type: "tracking" }
  | { type: "bundles" };

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AppState {
  // Navigation
  currentPage: Page;
  navigate: (page: string, data?: unknown) => void;

  // Cart
  cart: {
    items: Array<{
      productId: string;
      variantId?: string;
      quantity: number;
      name: string;
      price: number;
      image?: string;
    }>;
  };
  addToCart: (item: {
    productId: string;
    variantId?: string;
    quantity: number;
    name: string;
    price: number;
    image?: string;
  }) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;

  // Auth
  isAdmin: boolean;
  adminUser: AdminUser | null;
  adminToken: string | null;
  auth: {
    user: (AdminUser & { isVerified?: boolean; phone?: string | null }) | null;
    token: string | null;
  };
  setAdminLogin: (user: AdminUser, token: string) => void;
  setAdminLogout: () => void;
  setAuthUser: (user: AdminUser) => void;
  login: (user: any, token: string) => void;
  logout: () => void;

  // Global Settings
  settings: Record<string, string> | null;
  setSettings: (settings: Record<string, string>) => void;
  fetchSettings: () => Promise<void>;

  // Comparison
  compareList: any[];
  addToCompare: (product: any) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;

  // Recently Viewed
  recentlyViewed: any[];
  addToRecentlyViewed: (product: any) => void;

  // Wishlist (IDs for instant UI feedback)
  wishlistIds: string[];
  setWishlistIds: (ids: string[]) => void;
  toggleWishlistId: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentPage: { type: "home" },
      navigate: (page: string, data?: unknown) => {
        if (typeof window !== "undefined") {
          window.scrollTo(0, 0);
        }
        switch (page) {
          case "home":
            set({ currentPage: { type: "home" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/");
            break;
          case "shop":
            set({ currentPage: { type: "shop" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/shop");
            break;
          case "category":
            set({ currentPage: { type: "category", slug: data as string } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", `/shop/${data as string}`);
            break;
          case "products":
            set({ currentPage: { type: "products" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/products");
            break;
          case "contact":
            set({ currentPage: { type: "contact" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/contact");
            break;
          case "about":
            set({ currentPage: { type: "about" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/about");
            break;
          case "manufacturing":
            set({ currentPage: { type: "manufacturing" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/manufacturing");
            break;
          case "blog":
            set({ currentPage: { type: "blog" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/blog");
            break;
          case "blog-post":
            set({ currentPage: { type: "blog-post", slug: data as string } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", `/blog/${data as string}`);
            break;
          case "product-page":
            set({ currentPage: { type: "product-page", slug: data as string } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", `/products/${data as string}`);
            break;
          case "content-page": {
            const rawSlug = (data as string) || "";
            const slug = rawSlug.replace(/^\/+/, "");
            if (!slug) break;
            // Redirect known dedicated-page slugs to their proper page type
            const SLUG_REDIRECTS: Record<string, string> = {
              "blog": "blog",
              "products": "products",
              "product": "products",
              "about": "about",
              "about-us": "about",
              "about-page-content": "about",
              "manufacturing": "manufacturing",
              "mfg-page-content": "manufacturing",
              "contact": "contact",
              "contact-us": "contact",
              "catalogue": "shop",
              "catalog": "shop",
              "home": "home",
              "homepage": "home",
            };
            const redirectPage = SLUG_REDIRECTS[slug];
            if (redirectPage) {
              get().navigate(redirectPage);
              break;
            }
            set({
              currentPage: { type: "content-page", slug },
            });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", `/${slug}`);
            break;
          }
          case "admin-login":
            set({ currentPage: { type: "admin-login" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/admin");
            break;
          case "admin":
            set({
              isAdmin: true,
              currentPage: {
                type: "admin",
                activeTab: (data as string) || "dashboard",
              },
            });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/admin");
            break;
          case "cart":
            set({ currentPage: { type: "cart" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/cart");
            break;
          case "checkout":
            set({ currentPage: { type: "checkout" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/checkout");
            break;
          case "order-success":
            set({ currentPage: { type: "order-success", orderId: data as string } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", `/order-success/${data as string}`);
            break;
          case "orders":
            set({ currentPage: { type: "orders" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/orders");
            break;
          case "bundles":
            set({ currentPage: { type: "bundles" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/bundles");
            break;
          case "wishlist":
            set({ currentPage: { type: "wishlist" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/wishlist");
            break;
          case "login":
            set({ currentPage: { type: "login" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/login");
            break;
          case "register":
            set({ currentPage: { type: "register" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/register");
            break;
          case "faq":
            set({ currentPage: { type: "faq" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/faq");
            break;
          case "compare":
            set({ currentPage: { type: "compare" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/compare");
            break;
          case "support":
            set({ currentPage: { type: "support" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/support");
            break;
          case "tracking":
            set({ currentPage: { type: "tracking" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/tracking");
            break;
        }
      },

      cart: { items: [] },
      addToCart: (item) => {
        const currentItems = get().cart.items;
        const existing = currentItems.find(
          (i) => i.productId === item.productId && i.variantId === item.variantId
        );
        if (existing) {
          set({
            cart: {
              items: currentItems.map((i) =>
                i.productId === item.productId && i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            },
          });
        } else {
          set({ cart: { items: [...currentItems, item] } });
        }
        scheduleCartSync();
      },
      removeFromCart: (productId, variantId) => {
        set({
          cart: {
            items: get().cart.items.filter(
              (i) => !(i.productId === productId && i.variantId === variantId)
            ),
          },
        });
        scheduleCartSync();
      },
      updateCartQuantity: (productId, quantity, variantId) => {
        set({
          cart: {
            items: get().cart.items.map((i) =>
              i.productId === productId && i.variantId === variantId
                ? { ...i, quantity }
                : i
            ),
          },
        });
        scheduleCartSync();
      },
      clearCart: () => {
        set({ cart: { items: [] } });
        scheduleCartSync();
      },

      isAdmin: false,
      adminUser: null,
      adminToken: null,
      auth: { user: null, token: null },
      setAdminLogin: (user, token) =>
        set({
          isAdmin: true,
          adminUser: user,
          adminToken: token,
          auth: { user, token },
        }),
      setAdminLogout: () =>
        set({
          isAdmin: false,
          adminUser: null,
          adminToken: null,
          auth: { user: null, token: null },
          currentPage: { type: "home" },
        }),
      setAuthUser: (user) =>
        set({
          auth: { user, token: null },
          isAdmin: user.role === "admin" || user.role === "editor",
          adminUser: user.role === "admin" || user.role === "editor" ? user : null,
        }),
      login: (user, token) =>
        set({
          auth: { user, token },
          isAdmin:
            user.role === "admin" || user.role === "editor",
          adminUser:
            user.role === "admin" || user.role === "editor" ? user : null,
          adminToken:
            user.role === "admin" || user.role === "editor" ? token : null,
        }),
      logout: () => {
        set({
          auth: { user: null, token: null },
          isAdmin: false,
          adminUser: null,
          adminToken: null,
          currentPage: { type: "home" },
        });
      },

      settings: null,
      setSettings: (settings) => set({ settings }),
      fetchSettings: async () => {
        try {
          const res = await fetch("/api/settings/public", { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            set({ settings: data.settings || {} });
          }
        } catch (error) {
          console.error("Failed to fetch settings:", error);
        }
      },

      compareList: [],
      addToCompare: (product) => {
        const list = get().compareList;
        if (list.length >= 4) {
          toast.error("You can compare up to 4 products");
          return;
        }
        if (!list.find((p) => p.id === product.id)) {
          set({ compareList: [...list, product] });
        }
      },
      removeFromCompare: (id) =>
        set({ compareList: get().compareList.filter((p) => p.id !== id) }),
      clearCompare: () => set({ compareList: [] }),

      recentlyViewed: [],
      addToRecentlyViewed: (product) => {
        const list = get().recentlyViewed;
        const filtered = list.filter((p) => p.id !== product.id);
        set({
          recentlyViewed: [product, ...filtered].slice(0, 10),
        });
      },

      wishlistIds: [],
      setWishlistIds: (ids) => set({ wishlistIds: ids }),
      toggleWishlistId: (id) => {
        const ids = get().wishlistIds;
        if (ids.includes(id)) {
          set({ wishlistIds: ids.filter((x) => x !== id) });
        } else {
          set({ wishlistIds: [...ids, id] });
        }
      },
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        isAdmin: state.isAdmin,
        adminUser: state.adminUser,
        adminToken: state.adminToken,
        auth: state.auth,
        cart: state.cart,
        recentlyViewed: state.recentlyViewed,
        wishlistIds: state.wishlistIds,
        compareList: state.compareList,
      }),
    },
  ),
);
