"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/pricing";
import { Loader2, ArrowLeft, ShieldCheck, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";

export function CheckoutPage() {
  const { cart, navigate, settings, clearCart, auth } = useAppStore();
  const currency = settings?.currency || "INR";
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    notes: "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const discount = appliedCoupon
    ? appliedCoupon.discountType === 'percentage'
      ? (subtotal * appliedCoupon.discountValue) / 100
      : Math.min(appliedCoupon.discountValue, subtotal)
    : 0;

  const total = subtotal - discount;

  const fetchAddresses = async () => {
    try {
        const res = await fetch("/api/account/addresses", {
            headers: { 'Authorization': `Bearer ${auth.token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setAddresses(data.addresses || []);
            const def = data.addresses.find((a: any) => a.isDefault);
            if (def) {
                setSelectedAddressId(def.id);
                setFormData(prev => ({
                    ...prev,
                    name: def.name,
                    email: auth.user?.email || '',
                    phone: def.phone,
                    address: def.address,
                    city: def.city,
                    state: def.state,
                    zipCode: def.pincode,
                }));
            }
        }
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (auth.user) {
        fetchAddresses();
    }
  }, [auth.user]);

  const handleSelectAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    setFormData({
        name: addr.name,
        email: auth.user?.email || '',
        phone: addr.phone,
        address: addr.address,
        city: addr.city,
        state: addr.state,
        zipCode: addr.pincode,
        notes: formData.notes
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setValidatingCoupon(true);
    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(couponCode)}`);
      if (res.ok) {
        const data = await res.json();
        setAppliedCoupon(data.coupon);
        toast.success("Coupon applied!");
      } else {
        const err = await res.json();
        toast.error(err.error || "Invalid coupon");
      }
    } catch {
      toast.error("Failed to validate coupon");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items,
          customer: formData,
          paymentMethod: "payu",
          couponCode: appliedCoupon?.code,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.paymentUrl && data.paymentParams) {
          // Create a hidden form and submit it to PayU
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = data.paymentUrl;

          Object.entries(data.paymentParams).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = String(value);
            form.appendChild(input);
          });

          document.body.appendChild(form);
          form.submit();
        } else {
          toast.success("Order placed successfully!");
          clearCart();
          navigate("order-success", data.orderId);
        }
      } else {
        const err = await response.json();
        toast.error(err.error || "Failed to place order");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Button onClick={() => navigate("products")}>Return to Shop</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <button
        onClick={() => navigate("cart")}
        className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Cart
      </button>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold mb-8">Shipping Information</h1>

          {addresses.length > 0 && (
            <div className="mb-8 space-y-4">
              <h2 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Saved Addresses
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {addresses.map((addr) => (
                    <div
                        key={addr.id}
                        className={`p-4 border rounded-xl cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'}`}
                        onClick={() => handleSelectAddress(addr)}
                    >
                        <p className="font-bold text-sm">{addr.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{addr.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{addr.address}</p>
                    </div>
                ))}
                <div
                    className="p-4 border border-dashed rounded-xl flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer"
                    onClick={() => { setSelectedAddressId(null); setFormData({ ...formData, address: '', city: '', state: '', zipCode: '' }); }}
                >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">Use New Address</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+91 9876543210"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main St, Apartment 4B"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  required
                  value={formData.zipCode}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Order Notes (Optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Special instructions for delivery..."
                rows={3}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay {formatPrice(total, currency)} Now
                </>
              )}
            </Button>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Your payment is secure and encrypted
            </div>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="p-6 border rounded-lg bg-card sticky top-24">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>

            <div className="mb-4 space-y-2">
              <Label htmlFor="coupon" className="text-xs uppercase text-muted-foreground font-bold">Apply Coupon</Label>
              <div className="flex gap-2">
                <Input
                  id="coupon"
                  placeholder="CODE"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={!!appliedCoupon}
                  className="h-9"
                />
                <Button
                  type="button"
                  size="sm"
                  variant={appliedCoupon ? "secondary" : "default"}
                  onClick={appliedCoupon ? () => { setAppliedCoupon(null); setCouponCode(""); } : handleApplyCoupon}
                  disabled={validatingCoupon}
                >
                  {validatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : (appliedCoupon ? "Remove" : "Apply")}
                </Button>
              </div>
            </div>

            <div className="space-y-4 max-h-[30vh] overflow-y-auto mb-4 pr-2 border-t pt-4">
              {cart.items.map((item) => (
                <div key={`${item.productId}-${item.variantId || "base"}`} className="flex gap-3 text-sm">
                  <div className="h-12 w-12 rounded bg-muted flex-shrink-0">
                    {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover rounded" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium">{formatPrice(item.price * item.quantity, currency)}</span>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal, currency)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-{formatPrice(discount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t">
                <span>Total</span>
                <span>{formatPrice(total, currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Separator({ className }: { className?: string }) {
  return <div className={`h-[1px] bg-border ${className}`} />;
}
