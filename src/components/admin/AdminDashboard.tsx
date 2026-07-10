"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import {
  ShoppingBag,
  LayoutDashboard,
  Package,
  FolderOpen,
  MessageSquare,
  Image as ImageIcon,
  FileText,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  TrendingUp,
  ShoppingCart,
  Mail,
  Search,
  KeyRound,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { AdminDashboardHome } from "@/components/admin/AdminDashboardHome";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminProducts } from "@/components/admin/AdminProducts";
import { AdminCategories } from "@/components/admin/AdminCategories";
import { AdminBrands } from "@/components/admin/AdminBrands";
import { AdminEnquiries } from "@/components/admin/AdminEnquiries";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { AdminCoupons } from "@/components/admin/AdminCoupons";
import { AdminReviews } from "@/components/admin/AdminReviews";
import { AdminQuotes } from "@/components/admin/AdminQuotes";
import { AdminBanners } from "@/components/admin/AdminBanners";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { AdminMedia } from "@/components/admin/AdminMedia";
import { AdminPages } from "@/components/admin/AdminPages";
import { AdminSearchDialog } from "@/components/admin/AdminSearchDialog";
import { AdminMenus } from "@/components/admin/AdminMenus";
import { AdminNewsletter } from "@/components/admin/AdminNewsletter";
import { AdminAbandonedCarts } from "@/components/admin/AdminAbandonedCarts";
import { AdminBlog } from "@/components/admin/AdminBlog";
import { NotificationBell } from "@/components/admin/NotificationBell";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Ticket, Star } from "lucide-react";

interface AdminDashboardProps {
  user: { id: string; email: string; name: string; role: string } | null;
  activeTab: string;
  onNavigate: (page: string, data?: unknown) => void;
  onLogout: () => void;
}

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "products", label: "Products", icon: Package },
  { id: "categories", label: "Categories", icon: FolderOpen },
  { id: "brands", label: "Brands", icon: ShoppingBag },
  { id: "blog", label: "Blog", icon: BookOpen },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "abandoned-carts", label: "Abandoned Carts", icon: ShoppingCart },
  { id: "coupons", label: "Coupons", icon: Ticket },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "quotes", label: "Quotes", icon: FileText },
  { id: "enquiries", label: "Enquiries", icon: MessageSquare },
  { id: "media", label: "Media", icon: ImageIcon },
  { id: "pages", label: "Pages", icon: FileText },
  { id: "banners", label: "Banners", icon: ImageIcon },
  { id: "newsletter", label: "Newsletter", icon: Mail },
  { id: "menus", label: "Menus", icon: Menu },
  { id: "settings", label: "Settings", icon: Settings },
];

function SidebarContent({
  activeTab,
  onTabChange,
  userName,
  userEmail,
  onLogout,
  onNavigate,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userName: string;
  userEmail: string;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}) {
  const { settings } = useAppStore();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4">
        {settings?.site_logo ? (
          <img
            src={settings.site_logo}
            alt={settings.site_name || "Logo"}
            className="h-6 w-auto object-contain"
          />
        ) : (
          <ShoppingBag className="h-5 w-5 text-emerald-600" />
        )}
        <span className="text-lg font-bold">{settings?.site_name}</span>
        <Badge variant="secondary" className="ml-auto text-xs">
          Admin
        </Badge>
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav
          className="flex flex-col gap-1"
          role="navigation"
          aria-label="Admin navigation"
        >
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator />

      {/* User Info & Actions */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell />
          </div>
        </div>
        <Separator />
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-sm"
            onClick={() => onNavigate("home")}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            View Store
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-sm"
            onClick={() => onNavigate("change-password")}
          >
            <KeyRound className="mr-2 h-4 w-4" />
            Change Password
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            onClick={onLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard({
  user,
  activeTab,
  onNavigate,
  onLogout,
}: AdminDashboardProps) {
  const isMobile = useIsMobile();
  const { settings } = useAppStore();
  const [currentTab, setCurrentTab] = useState(activeTab);

  // Sync activeTab prop changes
  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [changePwdOpen, setChangePwdOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    setMobileOpen(false);
  };

  const handleQuickNav = (tab: string) => {
    setCurrentTab(tab);
  };

  const handleSearchNavigate = (tab: string, data?: unknown) => {
    setCurrentTab(tab);
    // If navigating to a specific entity, trigger onNavigate for sub-components
    if (data) {
      onNavigate(tab, data);
    }
  };

  const handleChangePasswordOpen = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setChangePwdOpen(true);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("All fields are required");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSavingPwd(true);
    try {
      const { adminFetch } = await import("@/lib/admin-fetch");
      const res = await adminFetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        toast.success("Password changed successfully");
        setChangePwdOpen(false);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to change password");
      }
    } catch {
      toast.error("Failed to change password");
    } finally {
      setSavingPwd(false);
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case "dashboard":
        return <AdminDashboardHome onNavigate={handleQuickNav} />;
      case "analytics":
        return <AdminAnalytics />;
      case "products":
        return <AdminProducts />;
      case "categories":
        return <AdminCategories />;
      case "brands":
        return <AdminBrands />;
      case "enquiries":
        return <AdminEnquiries />;
      case "orders":
        return <AdminOrders />;
      case "abandoned-carts":
        return <AdminAbandonedCarts />;
      case "coupons":
        return <AdminCoupons />;
      case "reviews":
        return <AdminReviews />;
      case "quotes":
        return <AdminQuotes />;
      case "banners":
        return <AdminBanners />;
      case "media":
        return <AdminMedia />;
      case "pages":
        return <AdminPages />;
      case "blog":
        return <AdminBlog />;
      case "menus":
        return <AdminMenus />;
      case "newsletter":
        return <AdminNewsletter />;
      case "settings":
        return <AdminSettings />;
      default:
        return <AdminDashboardHome onNavigate={handleQuickNav} />;
    }
  };

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-64 shrink-0 border-r bg-background">
          <SidebarContent
            activeTab={currentTab}
            onTabChange={handleTabChange}
            userName={user?.name || "Admin"}
            userEmail={user?.email || ""}
            onLogout={onLogout}
            onNavigate={(page) => {
              if (page === "change-password") {
                handleChangePasswordOpen();
              } else {
                onNavigate(page);
              }
            }}
          />
        </aside>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        {isMobile && (
          <header className="flex h-14 items-center gap-3 border-b bg-background px-4">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SidebarContent
                  activeTab={currentTab}
                  onTabChange={handleTabChange}
                  userName={user?.name || "Admin"}
                  userEmail={user?.email || ""}
                  onLogout={onLogout}
                  onNavigate={(page) => {
                    if (page === "change-password") {
                      handleChangePasswordOpen();
                    } else {
                      onNavigate(page);
                    }
                  }}
                />
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-emerald-600" />
              <span className="font-semibold text-sm">
                {settings?.site_name}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs ml-1">
              Admin
            </Badge>
            <div className="ml-auto flex items-center gap-1">
              {/* Search Button (mobile) */}
              <Button
                variant="ghost"
                size="icon"
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-4 w-4" />
              </Button>
              <NotificationBell />
              <Button
                variant="ghost"
                size="sm"
                className="text-rose-600"
                onClick={onLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
        )}

        {/* Page Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 sm:p-6 lg:p-8">
            <ErrorBoundary>{renderContent()}</ErrorBoundary>
          </div>
        </ScrollArea>
      </div>

      {/* Global Search Dialog */}
      <AdminSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onNavigate={handleSearchNavigate}
      />

      {/* Change Password Dialog */}
      <Dialog open={changePwdOpen} onOpenChange={setChangePwdOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-pwd">Current Password</Label>
              <Input
                id="current-pwd"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pwd">New Password</Label>
              <Input
                id="new-pwd"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pwd">Confirm New Password</Label>
              <Input
                id="confirm-pwd"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePwdOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={savingPwd}>
              {savingPwd ? "Saving..." : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
