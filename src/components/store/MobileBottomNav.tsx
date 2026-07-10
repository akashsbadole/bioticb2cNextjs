"use client";

import { Home, Search } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  onNavigate: (page: string, data?: unknown) => void;
}

export function MobileBottomNav({ onNavigate }: MobileBottomNavProps) {
  const { currentPage } = useAppStore();

  const navItems = [
    {
      label: "Home",
      icon: Home,
      page: "home",
      active: currentPage.type === "home",
    },
    {
      label: "Catalogue",
      icon: Search,
      page: "catalogue",
      active: currentPage.type === "catalogue",
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t pb-safe">
      <nav className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => onNavigate(item.page)}
            className={cn(
              "relative flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
              item.active
                ? "text-primary after:absolute after:bottom-1 after:left-1/3 after:w-1/3 after:h-0.5 after:bg-primary after:rounded-full after:content-['']"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="relative">
              <item.icon className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium leading-none">
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
