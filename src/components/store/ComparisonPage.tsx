"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { X, ShoppingCart, ArrowLeft, Trash2 } from "lucide-react";
import { getFirstImage } from "@/lib/utils";
import { formatPrice } from "@/lib/pricing";

export function ComparisonPage() {
  const { compareList, removeFromCompare, navigate, settings, addToCart } = useAppStore();
  const currency = settings?.currency || "INR";

  if (compareList.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">No products to compare</h1>
        <Button onClick={() => navigate("products")}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <button onClick={() => navigate("products")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Shop
      </button>

      <h1 className="text-3xl font-black mb-12">Compare Products</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-48 p-4 text-left font-bold text-muted-foreground uppercase text-xs border-b">Feature</th>
              {compareList.map((p) => (
                <th key={p.id} className="p-4 border-b min-w-[250px]">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="relative group">
                        <div className="h-32 w-32 rounded-2xl bg-muted overflow-hidden border">
                            <img src={getFirstImage(p.images) || ''} alt={p.name} className="h-full w-full object-cover" />
                        </div>
                        <button
                            onClick={() => removeFromCompare(p.id)}
                            className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-white rounded-full flex items-center justify-center shadow-lg"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                    <h3 className="font-bold text-sm h-10 line-clamp-2">{p.name}</h3>
                    <p className="text-primary font-black">{formatPrice(p.price, currency)}</p>
                    <Button size="sm" className="w-full rounded-xl" onClick={() => addToCart({ productId: p.id, name: p.name, price: p.price, quantity: 1, image: getFirstImage(p.images) || undefined })}>
                        Add to Cart
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-4 border-b font-bold text-sm bg-muted/30">Category</td>
              {compareList.map((p) => <td key={p.id} className="p-4 border-b text-sm text-center">{p.Category?.name || 'General'}</td>)}
            </tr>
            <tr>
              <td className="p-4 border-b font-bold text-sm bg-muted/30">Stock Status</td>
              {compareList.map((p) => <td key={p.id} className="p-4 border-b text-sm text-center">{p.stock > 0 ? 'In Stock' : 'Out of Stock'}</td>)}
            </tr>
            <tr>
              <td className="p-4 border-b font-bold text-sm bg-muted/30">Description</td>
              {compareList.map((p) => <td key={p.id} className="p-4 border-b text-xs text-center text-muted-foreground leading-relaxed max-w-xs">{p.shortDescription}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
