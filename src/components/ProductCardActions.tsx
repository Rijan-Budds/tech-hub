"use client";

import React from "react";
import { toast } from "sonner";
import { FaShoppingCart, FaHeart } from "react-icons/fa";

export function ProductCardActions({ productId, inStock = true }: { productId: string; inStock?: boolean }) {
  const testToast = () => {
    console.log("Testing toast notification");
    toast.error("This is a test error message");
  };

  const checkAuthStatus = async () => {
    try {
      const res = await fetch("/api/me", { credentials: "include" });
      const data = await res.json();
      console.log("Current auth status:", data);
      if (data.user) {
        toast.info(`Currently logged in as: ${data.user.username}`);
      } else {
        toast.info("Not currently logged in");
      }
    } catch (error) {
      console.log("Auth check error:", error);
      toast.error("Failed to check auth status");
    }
  };

  const handleAddToCart = async () => {
    if (!inStock) {
      toast.error("This product is out of stock");
      return;
    }
    
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

  const handleToggleWishlist = async () => {
    try {
      console.log("Toggling wishlist for product:", productId);
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
    <div className="mt-3 space-y-2">
      {/* Debug buttons */}
   
      
      {/* Main action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`w-full py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm font-medium ${
            inStock
              ? 'bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <FaShoppingCart className="text-sm" />
          <span>{inStock ? 'Add to Cart' : 'Out of Stock'}</span>
        </button>
        <button
          onClick={handleToggleWishlist}
          className="w-full border border-[#0D3B66] text-[#0D3B66] py-2 px-3 rounded-lg hover:bg-[#0D3B66] hover:text-white transition-all duration-200 flex items-center justify-center space-x-2 text-sm font-medium"
        >
          <FaHeart className="text-sm" />
          <span>Wishlist</span>
        </button>
      </div>
    </div>
  );
}


