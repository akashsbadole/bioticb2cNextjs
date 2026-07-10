"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { X, ArrowRightLeft, Trash2 } from "lucide-react";
import { getFirstImage } from "@/lib/utils";

export function CompareBar() {
  const { compareList, removeFromCompare, navigate, clearCompare } = useAppStore();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-background border shadow-2xl rounded-2xl p-4 animate-in slide-in-from-bottom-10">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-hide">
          {compareList.map((p) => (
            <div key={p.id} className="relative group shrink-0">
              <div className="h-14 w-14 rounded-lg bg-muted border overflow-hidden">
                <img src={getFirstImage(p.images) || ''} alt="" className="h-full w-full object-cover" />
              </div>
              <button
                onClick={() => removeFromCompare(p.id)}
                className="absolute -top-2 -right-2 h-5 w-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 2 - compareList.length) }).map((_, i) => (
              <div key={i} className="h-14 w-14 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center text-muted-foreground/20">
                  <ArrowRightLeft className="h-6 w-6" />
              </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={clearCompare} className="text-xs uppercase font-bold text-muted-foreground">
                Clear
            </Button>
            <Button size="sm" className="rounded-xl px-6 font-bold" onClick={() => navigate("compare")}>
                Compare ({compareList.length})
            </Button>
        </div>
      </div>
    </div>
  );
}
