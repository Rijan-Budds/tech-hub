"use client";

import React from "react";

interface ProductActionsProps {
  productId: string;
  slug: string;
}

export default function ProductActions({ productId, slug }: ProductActionsProps) {
  const handleAddToCart = async () => {
    // your add to cart logic here
    alert(`Add to cart: ${productId}`);
  };

  const handleAddToWishlist = async () => {
    // your wishlist logic here
    alert(`Add to wishlist: ${productId}`);
  };

  return (
    <div className="flex space-x-4 mt-4">
      <button onClick={handleAddToCart} className="btn-primary">Add to Cart</button>
      <button onClick={handleAddToWishlist} className="btn-secondary">Add to Wishlist</button>
    </div>
  );
}
