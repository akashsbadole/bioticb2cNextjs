"use client";

import dynamic from "next/dynamic";

const ThemeInjector = dynamic(
  () => import("./ThemeInjector").then((m) => m.ThemeInjector),
  { ssr: false }
);

export function ThemeInjectorWrapper() {
  return <ThemeInjector />;
}
