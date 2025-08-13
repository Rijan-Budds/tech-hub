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

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Free Shipping</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">On orders over रु5000</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 text-lg">↻</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Easy Returns</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">30-day return policy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
