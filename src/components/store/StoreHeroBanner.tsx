"use client";

import React from "react";

interface RequirementType {
  id: string;
  label: string;
}

interface StoreHeroBannerProps {
  hero: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
  selectedType?: string;
  onSelectType?: (id: string) => void;
  requirementTypes?: RequirementType[];
  backgroundImage?: string;
}

function getPatternStyle(pattern: string): React.CSSProperties | undefined {
  switch (pattern) {
    case "dots":
      return {
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      };
    case "diagonal":
      return {
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 12px)",
      };
    case "waves":
      return {
        backgroundImage: [
          "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 2px, transparent 2px, transparent 8px)",
          "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 10px)",
        ].join(", "),
      };
    default:
      return undefined;
  }
}

export function StoreHeroBanner({
  hero,
  onNavigate,
  selectedType,
  onSelectType,
  requirementTypes,
  backgroundImage: propBackgroundImage,
}: StoreHeroBannerProps) {
  const backgroundColor = (hero.backgroundColor as string) || "#78350f";
  const overlayColor = (hero.overlayColor as string) || "#1c1917";
  const overlayOpacity = (hero.overlayOpacity as string) || "0.45";
  const pattern = (hero.pattern as string) || "none";

  const title = (hero.title as string) || "";
  const subtitle = (hero.subtitle as string) || "";
  const estYear = (hero.estYear as string) || "";
  const heroBgImage = (hero.backgroundImage as string) || "";
  const resolvedBackgroundImage = heroBgImage || propBackgroundImage || "";
  const badge = (hero.badge as string) || "";
  const topLabel = (hero.topLabel as string) || "";
  const buttons =
    (hero.buttons as Array<{ text: string; page?: string; variant?: string }>) ||
    [];

  const patternStyle = getPatternStyle(pattern);

  return (
    <section
      className="relative overflow-hidden py-24 md:py-32 px-4"
      style={{ backgroundColor }}
    >
      {resolvedBackgroundImage && (
        <img
          src={resolvedBackgroundImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {resolvedBackgroundImage && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: overlayColor,
            opacity: parseFloat(overlayOpacity),
          }}
        />
      )}

      {patternStyle && (
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={patternStyle}
        />
      )}

      <div className="relative container mx-auto max-w-5xl text-center text-white">
        {topLabel && (
          <p className="text-xs uppercase tracking-[0.2em] text-amber-200/80 mb-4">
            {topLabel}
          </p>
        )}

        {estYear && (
          <p className="text-xs uppercase tracking-[0.2em] text-amber-200/80 mb-3">
            {estYear}
          </p>
        )}

        {badge && (
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs text-amber-100 mb-6">
            {badge}
          </div>
        )}

        {title && (
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-white drop-shadow-lg">
            {title}
          </h1>
        )}

        {subtitle && (
          <p className="text-amber-100/90 max-w-2xl mx-auto leading-relaxed mb-8 text-sm md:text-base">
            {subtitle}
          </p>
        )}

        {requirementTypes && requirementTypes.length > 0 && (
          <div className="flex gap-2 justify-center flex-wrap mb-4">
            {requirementTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => onSelectType?.(type.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                  selectedType === type.id
                    ? "bg-black/40 text-amber-200 border-white"
                    : "bg-black/40 border-white/20 text-white hover:bg-black/40"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        )}

        {buttons.length > 0 && (
          <div className="flex gap-4 justify-center flex-wrap">
            {buttons.map((btn, i) => {
              const isPrimary = btn.variant === "primary";
              return (
                <button
                  key={i}
                  onClick={() => btn.page && onNavigate?.(btn.page)}
                  className={
                    isPrimary
                      ? "bg-white text-amber-900 font-semibold rounded-full px-7 py-2.5 hover:bg-amber-50 transition shadow-lg"
                      : "bg-white/10 border border-white/30 text-white rounded-full px-7 py-2.5 hover:bg-white/20 transition"
                  }
                >
                  {btn.text}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
