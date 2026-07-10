"use client";

import { useEffect, ReactNode } from "react";
import { useAppStore } from "@/lib/store";
import { StoreLayout } from "./StoreLayout";

interface StorePageShellProps {
  pageType: string;
  children: ReactNode;
}

export function StorePageShell({ pageType, children }: StorePageShellProps) {
  const navigate = useAppStore((s) => s.navigate);

  useEffect(() => {
    const state = useAppStore.getState();
    if (state.currentPage.type !== pageType) {
      state.navigate(pageType);
    }
  }, [pageType]);

  return (
    <StoreLayout currentPage={pageType} onNavigate={navigate}>
      {children}
    </StoreLayout>
  );
}
