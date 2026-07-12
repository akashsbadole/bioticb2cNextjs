"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Search, X, DollarSign, Trash2, Plus } from "lucide-react";

interface CustomerPrice {
  id: string;
  productId: string;
  userId: string;
  price: number;
  User: { id: string; name: string; email: string };
  Product: { id: string; name: string };
}

export function AdminCustomerPrices() {
  const [prices, setPrices] = useState<CustomerPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchProduct, setSearchProduct] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formProductId, setFormProductId] = useState("");
  const [formUserId, setFormUserId] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchProduct) params.set("productId", searchProduct);
      if (searchUser) params.set("userId", searchUser);
      const res = await fetch(`/api/customer-prices?${params}`);
      const data = await res.json();
      setPrices(data.prices || []);
    } catch {
      toast.error("Failed to load customer prices");
    } finally {
      setLoading(false);
    }
  }, [searchProduct, searchUser]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const savePrice = async () => {
    if (!formProductId || !formUserId || !formPrice) {
      toast.error("All fields are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/customer-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: formProductId,
          userId: formUserId,
          price: parseFloat(formPrice),
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Price saved");
      setShowAddForm(false);
      setFormProductId("");
      setFormUserId("");
      setFormPrice("");
      fetchPrices();
    } catch {
      toast.error("Failed to save price");
    } finally {
      setSaving(false);
    }
  };

  const deletePrice = async (id: string) => {
    try {
      const res = await fetch("/api/customer-prices", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Price removed");
      setPrices((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error("Failed to delete price");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Customer Pricing
          </h2>
          <p className="text-sm text-muted-foreground">
            Set custom prices for specific customers on specific products.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Price
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">New Customer Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="space-y-1">
                <Label className="text-xs">Product ID</Label>
                <Input
                  value={formProductId}
                  onChange={(e) => setFormProductId(e.target.value)}
                  placeholder="product_..."
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">User ID</Label>
                <Input
                  value={formUserId}
                  onChange={(e) => setFormUserId(e.target.value)}
                  placeholder="user_..."
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Custom Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="99.99"
                  className="text-xs"
                />
              </div>
              <div className="flex items-end gap-1">
                <Button size="sm" onClick={savePrice} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowAddForm(false)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by product ID..."
            value={searchProduct}
            onChange={(e) => setSearchProduct(e.target.value)}
            className="pl-8 text-xs"
          />
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by user ID..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            className="pl-8 text-xs"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : prices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No custom prices configured.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {prices.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">
                    {p.Product.name}
                  </p>
                  <Badge variant="outline" className="text-[10px]">
                    {p.Product.id.slice(0, 8)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  Customer: {p.User.name} ({p.User.email})
                </p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <span className="text-sm font-bold text-primary">
                  ${p.price.toFixed(2)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deletePrice(p.id)}
                  className="text-rose-500 hover:text-rose-700 h-8 w-8 p-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
