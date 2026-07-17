"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface PopupData {
  id: string;
  title: string;
  subtitle: string | null;
  content: string | null;
  image: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  triggerType: string;
  delayMs: number;
  displayFrequency: string;
  position: string;
  backgroundColor: string | null;
}

const DISMISSED_KEY = "wcommerce_dismissed_popups";
const DAILY_KEY = "wcommerce_daily_popups";

function getDismissed(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || "{}");
  } catch {
    return {};
  }
}

function getDaily(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(DAILY_KEY) || "{}");
  } catch {
    return {};
  }
}

function isEligible(p: PopupData): boolean {
  if (sessionStorage.getItem(`popup_shown_${p.id}`)) return false;
  const today = new Date().toISOString().slice(0, 10);
  if (p.displayFrequency === "once" && getDismissed()[p.id]) return false;
  if (p.displayFrequency === "daily" && getDaily()[p.id] === today) return false;
  return true;
}

function markDismissed(id: string, frequency: string) {
  if (typeof window === "undefined") return;
  const today = new Date().toISOString().slice(0, 10);
  if (frequency === "daily") {
    const daily = getDaily();
    daily[id] = today;
    localStorage.setItem(DAILY_KEY, JSON.stringify(daily));
  } else {
    const dismissed = getDismissed();
    dismissed[id] = new Date().toISOString();
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
  }
}

export function Popup() {
  const [popups, setPopups] = useState<PopupData[]>([]);
  const [index, setIndex] = useState(-1);

  const isDisabled = process.env.NEXT_PUBLIC_DISABLE_POPUPS === "true" || process.env.NODE_ENV === "test";

  useEffect(() => {
    if (isDisabled) return;

    let cancelled = false;
    fetch("/api/popups")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const list: PopupData[] = (data.popups || []).filter(isEligible);
        if (list.length === 0) return;
        setPopups(list);

        const first = list[0];
        if (first.triggerType === "immediate") {
          setIndex(0);
        } else if (first.triggerType === "delay") {
          const t = setTimeout(() => setIndex(0), Math.max(500, first.delayMs));
          cleanup = () => clearTimeout(t);
        } else if (first.triggerType === "scroll") {
          const onScroll = () => {
            const denom = document.body.scrollHeight - window.innerHeight || 1;
            if (window.scrollY / denom > 0.5) {
              setIndex(0);
              window.removeEventListener("scroll", onScroll);
            }
          };
          window.addEventListener("scroll", onScroll);
          cleanup = () => window.removeEventListener("scroll", onScroll);
        } else if (first.triggerType === "on_exit") {
          const onExit = (e: MouseEvent) => {
            if (e.clientY <= 0) {
              setIndex(0);
              document.removeEventListener("mouseout", onExit);
            }
          };
          document.addEventListener("mouseout", onExit);
          cleanup = () => document.removeEventListener("mouseout", onExit);
        }
      })
      .catch(() => {});

    let cleanup: (() => void) | undefined;
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [isDisabled]);

  if (isDisabled) {
    return null;
  }

  const active = index >= 0 && index < popups.length ? popups[index] : null;

  const dismiss = () => {
    if (!active) return;
    markDismissed(active.id, active.displayFrequency);
    sessionStorage.setItem(`popup_shown_${active.id}`, "1");
    setIndex(index + 1);
  };

  if (!active) return null;

  const isBanner = active.position === "top";
  const corner =
    active.position === "bottom-left"
      ? "bottom-4 left-4"
      : active.position === "bottom-right"
        ? "bottom-4 right-4"
        : "";

  const cardStyle = active.backgroundColor
    ? { backgroundColor: active.backgroundColor }
    : undefined;

  if (isBanner) {
    return (
      <div
        className="fixed top-0 inset-x-0 z-[100] bg-primary text-primary-foreground"
        style={cardStyle}
      >
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="font-semibold">{active.title}</p>
            {active.subtitle && <p className="text-sm opacity-90">{active.subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            {active.ctaLink && (
              <a
                href={active.ctaLink}
                className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-primary hover:bg-white/90"
              >
                {active.ctaText || "Learn more"}
              </a>
            )}
            <button onClick={dismiss} aria-label="Dismiss">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const positionClass = corner || "inset-0 flex items-center justify-center";

  return (
    <div className={`fixed inset-0 z-[100] ${corner ? "" : "bg-black/50"}`}>
      <div className={`absolute ${positionClass} p-4`}>
        <div
          className="relative w-full max-w-md rounded-xl bg-card p-6 shadow-2xl"
          style={cardStyle}
        >
          <button
            onClick={dismiss}
            aria-label="Close"
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
          {active.image && (
            <img
              src={active.image}
              alt={active.title}
              className="mb-4 max-h-48 w-full rounded-lg object-cover"
            />
          )}
          <h3 className="text-xl font-bold tracking-tight">{active.title}</h3>
          {active.subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{active.subtitle}</p>
          )}
          {active.content && (
            <p className="mt-3 text-sm text-muted-foreground whitespace-pre-line">
              {active.content}
            </p>
          )}
          {active.ctaLink && (
            <a
              href={active.ctaLink}
              className="mt-5 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {active.ctaText || "Learn more"}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
