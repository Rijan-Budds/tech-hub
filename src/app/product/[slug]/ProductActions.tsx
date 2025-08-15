"use client";

import React from "react";
import { toast } from "sonner";
import { FaShoppingCart, FaHeart } from "react-icons/fa";

export default function ProductActions({ productId }: { productId: string }) {
  const handleAddToCart = async () => {
    try {
      console.log("Adding to cart for product:", productId);
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: 'add', productId, quantity: 1 }),
      });
      const data = await res.json();
      console.log("Cart response status:", res.status);
      console.log("Cart response data:", data);
      if (!res.ok) {
        if (res.status === 401) {
          console.log("User not authenticated, showing login message");
          toast.error("Please log in to add items to your cart");
          return;
        }
        throw new Error(data.message || "Failed to add to cart");
      }
      toast.success("Added to cart");
    } catch (error: unknown) {
      console.log("Cart error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to add to cart";
      toast.error(errorMessage);
    }
  };

  const handleAddToWishlist = async () => {
    try {
      console.log("Adding to wishlist for product:", productId);
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      console.log("Wishlist response status:", res.status);
      console.log("Wishlist response data:", data);
      if (!res.ok) {
        if (res.status === 401) {
          console.log("User not authenticated, showing login message");
          toast.error("Please log in to add items to your wishlist");
          return;
        }
        throw new Error(data.message || "Failed to update wishlist");
      }
      toast.success("Wishlist updated");
    } catch (error: unknown) {
      console.log("Wishlist error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update wishlist";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add to Cart Button */}
      <button 
        onClick={handleAddToCart} 
        className="w-full bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
      >
        <FaShoppingCart className="text-xl" />
        <span>Add to Cart</span>
      </button>

      {/* Add to Wishlist Button */}
      <button 
        onClick={handleAddToWishlist} 
        className="w-full border-2 border-[#0D3B66] text-[#0D3B66] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gradient-to-r hover:from-[#0D3B66] hover:to-[#1E5CAF] hover:text-white transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-3"
      >
        <FaHeart className="text-xl" />
        <span>Add to Wishlist</span>
      </button>
    </div>
  );
}
