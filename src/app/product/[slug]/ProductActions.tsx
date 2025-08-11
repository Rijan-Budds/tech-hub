"use client";

import React from "react";
import { toast } from "sonner";

interface ProductActionsProps {
  productId: string;
  slug: string;
}

export default function ProductActions({ productId, slug }: ProductActionsProps) {
  const handleAddToCart = async () => {
    try {
      const res = await fetch("http://localhost:5000/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add to cart");
      toast.success("Added to cart");
    } catch (e: any) {
      toast.error(e.message || "Failed to add to cart");
    }
  };

  const handleAddToWishlist = async () => {
    try {
      const res = await fetch("http://localhost:5000/wishlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update wishlist");
      toast.success("Wishlist updated");
    } catch (e: any) {
      toast.error(e.message || "Failed to update wishlist");
    }
  };

  return (
    <div className="flex space-x-4 mt-4">
      <button onClick={handleAddToCart} className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90">Add to Cart</button>
      <button onClick={handleAddToWishlist} className="border border-border px-4 py-2 rounded hover:bg-muted">Add to Wishlist</button>
    </div>
  );
}
