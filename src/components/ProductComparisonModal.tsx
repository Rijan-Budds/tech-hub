"use client";

import React from "react";
import { FaTimes, FaShoppingCart, FaHeart, FaCheck, FaTimes as FaXMark, FaStar } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { useCompareStore } from "@/store/useCompareStore";
import { toast } from "sonner";

export default function ProductComparisonModal() {
  const {
    isCompareModalOpen,
    compareProducts,
    closeCompareModal,
    removeFromCompare,
    clearCompare,
  } = useCompareStore();

  if (!isCompareModalOpen || compareProducts.length === 0) return null;

  const handleAddToCart = async (productId: string, productName: string) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "add", productId, quantity: 1 }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Please log in to add items to your cart");
          return;
        }
        throw new Error(data.message || "Failed to add to cart");
      }
      toast.success(`${productName} added to cart`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add to cart";
      toast.error(errorMessage);
    }
  };

  const handleAddToWishlist = async (productId: string, productName: string) => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Please log in to add items to your wishlist");
          return;
        }
        throw new Error(data.message || "Failed to update wishlist");
      }
      toast.success(`${productName} wishlist updated`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update wishlist";
      toast.error(errorMessage);
    }
  };

  const getDiscountedPrice = (price: number, discountPercentage?: number) => {
    if (!discountPercentage || discountPercentage <= 0) return price;
    return price * (1 - discountPercentage / 100);
  };

  // Comparison features
  const comparisonFeatures = [
    { key: 'price', label: 'Price' },
    { key: 'category', label: 'Category' },
    { key: 'stock', label: 'Stock Status' },
    { key: 'discount', label: 'Discount' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Product Comparison</h2>
              <p className="text-blue-100">Compare products side by side</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={clearCompare}
                className="text-white hover:text-gray-200 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
              >
                Clear All
              </button>
              <button
                onClick={closeCompareModal}
                className="text-white hover:text-gray-200 p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[80vh]">
          {compareProducts.length === 1 ? (
            /* Single Product View */
            <div className="p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
                  <div className="text-yellow-600 dark:text-yellow-400 mb-4">
                    <FaStar className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Add Another Product
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You need at least 2 products to compare. Add another product to start comparing.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Current product: <strong>{compareProducts[0].name}</strong>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Two Products Comparison */
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {compareProducts.map((product) => (
                  <div key={product.id} className="space-y-6">
                    {/* Product Header */}
                    <div className="relative">
                      <button
                        onClick={() => removeFromCompare(product.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                        title="Remove from comparison"
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
                        <div className="relative mb-4">
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={300}
                            height={200}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          {product.discountPercentage && product.discountPercentage > 0 && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-md text-sm font-semibold">
                              -{product.discountPercentage}%
                            </div>
                          )}
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {product.name}
                        </h3>
                        
                        <Link
                          href={`/product/${product.slug}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>

                    {/* Comparison Features */}
                    <div className="space-y-4">
                      {comparisonFeatures.map((feature) => (
                        <div key={feature.key} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            {feature.label}
                          </div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {feature.key === 'price' && (
                              <div className="flex items-center space-x-2">
                                {product.discountPercentage && product.discountPercentage > 0 ? (
                                  <>
                                    <span className="text-red-600 font-bold">
                                      रु{getDiscountedPrice(product.price, product.discountPercentage).toFixed(2)}
                                    </span>
                                    <span className="text-gray-500 text-base line-through">
                                      रु{product.price.toFixed(2)}
                                    </span>
                                  </>
                                ) : (
                                  <span>रु{product.price.toFixed(2)}</span>
                                )}
                              </div>
                            )}
                            {feature.key === 'category' && (
                              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                                {product.category}
                              </span>
                            )}
                            {feature.key === 'stock' && (
                              <div className="flex items-center space-x-2">
                                {product.stockQuantity > 0 ? (
                                  <>
                                    <FaCheck className="text-green-600 w-4 h-4" />
                                    <span className="text-green-600">In Stock ({product.stockQuantity})</span>
                                  </>
                                ) : (
                                  <>
                                    <FaXMark className="text-red-600 w-4 h-4" />
                                    <span className="text-red-600">Out of Stock</span>
                                  </>
                                )}
                              </div>
                            )}
                            {feature.key === 'discount' && (
                              <div>
                                {product.discountPercentage && product.discountPercentage > 0 ? (
                                  <span className="text-green-600 font-semibold">
                                    {product.discountPercentage}% OFF
                                  </span>
                                ) : (
                                  <span className="text-gray-500">No discount</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {/* Description */}
                      {product.description && (
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Description
                          </div>
                          <p className="text-gray-900 dark:text-white text-sm leading-relaxed">
                            {product.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={() => handleAddToCart(product.id, product.name)}
                        disabled={product.stockQuantity === 0}
                        className="w-full bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-6 py-3 rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <FaShoppingCart />
                        <span>{product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                      </button>
                      
                      <button
                        onClick={() => handleAddToWishlist(product.id, product.name)}
                        className="w-full border-2 border-[#0D3B66] text-[#0D3B66] px-6 py-3 rounded-xl font-semibold hover:bg-gradient-to-r hover:from-[#0D3B66] hover:to-[#1E5CAF] hover:text-white transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <FaHeart />
                        <span>Add to Wishlist</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Winner Indication */}
              {compareProducts.length === 2 && (
                <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">
                    Price Comparison Winner
                  </h4>
                  <div className="text-center">
                    {(() => {
                      const product1Price = getDiscountedPrice(compareProducts[0].price, compareProducts[0].discountPercentage);
                      const product2Price = getDiscountedPrice(compareProducts[1].price, compareProducts[1].discountPercentage);
                      
                      if (product1Price < product2Price) {
                        return (
                          <div className="text-green-600 dark:text-green-400 font-semibold">
                            🏆 {compareProducts[0].name} offers better value at रु{product1Price.toFixed(2)}
                          </div>
                        );
                      } else if (product2Price < product1Price) {
                        return (
                          <div className="text-green-600 dark:text-green-400 font-semibold">
                            🏆 {compareProducts[1].name} offers better value at रु{product2Price.toFixed(2)}
                          </div>
                        );
                      } else {
                        return (
                          <div className="text-blue-600 dark:text-blue-400 font-semibold">
                            🤝 Both products have the same price at रु{product1Price.toFixed(2)}
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}