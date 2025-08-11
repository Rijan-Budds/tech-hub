"use client";

import React from "react";
import { toast } from "sonner";

export function ProductCardActions({ productId }: { productId: string }) {
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

  const handleToggleWishlist = async () => {
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
    <div className="mt-3 grid grid-cols-2 gap-2">
      <button
        onClick={handleAddToCart}
        className="w-full bg-[#f85606] text-white py-2 rounded hover:bg-[#e14e00] transition"
      >
        Add to Cart
      </button>
      <button
        onClick={handleToggleWishlist}
        className="w-full border border-gray-300 dark:border-gray-700 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition"
      >
        Wishlist
      </button>
    </div>
  );
}


