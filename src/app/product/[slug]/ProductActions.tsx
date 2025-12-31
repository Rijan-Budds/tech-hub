"use client";

import React from "react";
import { toast } from "sonner";
import { FaShoppingCart, FaHeart } from "react-icons/fa";


interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  image: string;
  images?: string[];
  description?: string;
  discountPercentage?: number;
  stockQuantity: number;
}

export default function ProductActions({ product }: { product: Product }) {


  const handleAddToCart = async () => {
    // Check stock before attempting to add
    if (product.stockQuantity <= 0) {
      toast.error("This product is out of stock");
      return;
    }

    try {
      console.log("Adding to cart for product:", product.id);
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "add",
          productId: product.id,
          quantity: 1,
        }),
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
        // Handle stock validation errors with detailed messages
        if (res.status === 400 && data.availableStock !== undefined) {
          console.log("Stock validation error:", data);
          toast.error(data.message);
          return;
        }
        throw new Error(data.message || "Failed to add to cart");
      }
      toast.success("Added to cart");
    } catch (error: unknown) {
      console.log("Cart error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add to cart";
      toast.error(errorMessage);
    }
  };

  const handleAddToWishlist = async () => {
    try {
      console.log("Adding to wishlist for product:", product.id);
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: product.id }),
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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update wishlist";
      toast.error(errorMessage);
    }
  };



  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;

  return (
    <div className="space-y-4">
      {/* Stock Information */}
      <div className="bg-gray-50 p-4 rounded-xl border">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-medium">Stock Status:</span>
          <div className="flex items-center space-x-2">
            {isOutOfStock ? (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
                Only {product.stockQuantity} left!
              </span>
            ) : (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                {product.stockQuantity} available
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className={`w-full px-8 py-4 rounded-xl font-semibold text-lg transform transition-all duration-200 shadow-lg flex items-center justify-center space-x-3 ${isOutOfStock
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-black text-white hover:bg-gray-900 hover:scale-[1.02] hover:shadow-xl'
          }`}
      >
        <FaShoppingCart className="text-xl" />
        <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
      </button>

      {/* Add to Wishlist Button */}
      <button
        onClick={handleAddToWishlist}
        className="w-full border-2 border-black text-black px-8 py-4 rounded-xl font-semibold text-lg hover:bg-black hover:text-white transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-3"
      >
        <FaHeart className="text-xl" />
        <span>Add to Wishlist</span>
      </button>


    </div>
  );
}
