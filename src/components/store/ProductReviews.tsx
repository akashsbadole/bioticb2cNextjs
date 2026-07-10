"use client";

import { useState, useEffect } from "react";
import { Star, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { format } from "date-fns";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  User: {
    name: string;
    avatar: string | null;
  };
}

export function ProductReviews({ productId }: { productId: string }) {
  const { auth, navigate } = useAppStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user) {
      toast.error("Please log in to leave a review");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: auth.user.id,
          rating,
          comment,
        }),
      });

      if (res.ok) {
        toast.success("Review submitted for moderation");
        setComment("");
        setRating(5);
      } else {
        toast.error("Failed to submit review");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-full text-sm font-bold border border-amber-200">
            <Star className="h-4 w-4 fill-current" />
            {averageRating.toFixed(1)} ({reviews.length})
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Review List */}
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-muted-foreground italic text-center py-8">
              No reviews yet. Be the first to review!
            </p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="space-y-2 border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {review.User.avatar ? (
                        <img src={review.User.avatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <span className="font-bold text-sm">{review.User.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(review.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < review.rating ? "fill-current" : ""}`}
                    />
                  ))}
                </div>
                {review.comment && (
                  <p className="text-sm leading-relaxed">{review.comment}</p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Review Form */}
        <div className="bg-muted/30 rounded-xl p-6 h-fit border">
          <h3 className="font-bold mb-4">Write a Review</h3>
          {auth.user ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          i <= rating ? "text-amber-500 fill-current" : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Comment</label>
                <Textarea
                  placeholder="Share your thoughts about this product..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="bg-background"
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Post Review"
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-4">
                Please log in to share your experience with this product.
              </p>
              <Button variant="outline" onClick={() => navigate("home")}>
                Log In
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
