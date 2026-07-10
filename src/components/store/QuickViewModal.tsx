'use client';

import Image from 'next/image';
import { Eye, Send, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { getFirstImage } from '@/lib/utils';
import { formatPrice } from '@/lib/pricing';

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  price: number;
  comparePrice: number | null;
  wholesalePrice: number | null;
  minOrderQty: number;
  images: string;
  Category: { id: string; name: string; slug?: string } | null;
  isFeatured: boolean;
}

interface QuickViewModalProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (page: string, data?: unknown) => void;
}

export function QuickViewModal({
  product,
  open,
  onOpenChange,
  onNavigate,
}: QuickViewModalProps) {
  const { settings, addToCart } = useAppStore();
  const isB2C = settings?.store_mode === "b2c";
  const image = getFirstImage(product.images);
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0;

  const handleViewDetails = () => {
    onOpenChange(false);
    onNavigate('product-page', product.slug);
  };

  const handleAddToCart = () => {
    addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: image || undefined
    });
    toast.success("Added to cart");
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Quick View
            </DialogTitle>
            <DialogDescription className="sr-only">
              Quick preview of {product.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              {image ? (
                <Image
                  src={image}
                  alt={product.name}
                  fill
                  className="object-cover"

                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <ShoppingCart className="h-10 w-10 text-gray-400" />
                </div>
              )}
              {hasDiscount && (
                <Badge className="absolute top-3 left-3 bg-rose-500 text-white">
                  -{discountPercent}%
                </Badge>
              )}
            </div>

            {/* Category */}
            {product.Category && (
              <span className="text-xs text-primary uppercase tracking-wider font-medium">
                {product.Category.name}
              </span>
            )}

            {/* Product Name */}
            <h3 className="text-xl font-bold tracking-tight">{product.name}</h3>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            <Separator />

            {/* Pricing */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-base text-muted-foreground line-through">
                    {formatPrice(product.comparePrice!)}
                  </span>
                )}
              </div>
              {product.wholesalePrice && (
                <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                  Wholesale: {formatPrice(product.wholesalePrice)}
                  <span className="text-muted-foreground font-normal">
                    {' '}· Min. {product.minOrderQty} units
                  </span>
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col pt-4">
            {isB2C ? (
                <Button
                    className="w-full bg-primary hover:bg-primary/80 text-white h-11 rounded-xl font-bold"
                    onClick={handleAddToCart}
                >
                    <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                </Button>
            ) : (
                <Button
                    variant="default"
                    className="w-full h-11 rounded-xl font-bold"
                    onClick={() => {
                        onOpenChange(false);
                        useAppStore.getState().openEnquiryModal(product.name, product.id);
                    }}
                >
                    <Send className="mr-2 h-4 w-4" /> Enquire Now
                </Button>
            )}
            <Button
              variant="outline"
              className="w-full h-11 rounded-xl font-bold"
              onClick={handleViewDetails}
            >
              View Full Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
