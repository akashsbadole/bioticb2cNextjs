"use client";

import { useEffect, useState } from "react";
import { buildCssVariables, DEFAULT_THEME } from "@/lib/themes";

export function ThemeInjector() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const applyStoredTheme = () => {
      try {
        const stored = localStorage.getItem("wcommerce-active-theme");
        if (stored) {
          const config = JSON.parse(stored);
          const vars = buildCssVariables(config);
          const root = document.documentElement;
          for (const [key, value] of Object.entries(vars)) {
            root.style.setProperty(key, value);
          }
        }
      } catch {
        // Fall through
      }
    };

    const fetchActiveTheme = async () => {
      try {
        const res = await fetch("/api/settings/public");
        const data = await res.json();
        const settings = data.settings || {};

        if (settings.active_theme) {
          const config = JSON.parse(settings.active_theme);
          const vars = buildCssVariables(config);
          const root = document.documentElement;
          for (const [key, value] of Object.entries(vars)) {
            root.style.setProperty(key, value);
          }
          localStorage.setItem("wcommerce-active-theme", settings.active_theme);
        } else {
          applyStoredTheme();
        }
      } catch {
        applyStoredTheme();
      }
      setReady(true);
    };

    fetchActiveTheme();
  }, []);

  return null;
}
