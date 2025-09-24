"use client";

import React from "react";
import {
  FaArrowLeft,
  FaBalanceScale,
  FaTrash,
  FaShoppingCart,
  FaHeart,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCompareStore } from "@/store/useCompareStore";
import { toast } from "sonner";
import { getProductDisplayImage } from "@/lib/product-utils";

export default function ComparePage() {
  const { compareProducts, removeFromCompare, clearCompare } =
    useCompareStore();

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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add to cart";
      toast.error(errorMessage);
    }
  };

  const handleAddToWishlist = async (
    productId: string,
    productName: string,
  ) => {
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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update wishlist";
      toast.error(errorMessage);
    }
  };

  const getDiscountedPrice = (price: number, discountPercentage?: number) => {
    if (!discountPercentage || discountPercentage <= 0) return price;
    return price * (1 - discountPercentage / 100);
  };

  // Comparison features
  const comparisonFeatures = [
    { key: "price", label: "Price" },
    { key: "category", label: "Category" },
    { key: "stock", label: "Stock Status" },
    { key: "discount", label: "Discount" },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-8">
            <nav className="mb-6">
              <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link
                    href="/"
                    className="hover:text-blue-600 transition-colors flex items-center space-x-1"
                  >
                    <FaArrowLeft className="text-xs" />
                    <span>Back to Home</span>
                  </Link>
                </li>
                <li>/</li>
                <li className="text-gray-900 dark:text-white font-medium">
                  Product Comparison
                </li>
              </ol>
            </nav>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] rounded-xl">
                    <FaBalanceScale className="text-white text-2xl" />
                  </div>
                  <span>
                    Product{" "}
                    <span className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent">
                      Comparison
                    </span>
                  </span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Compare products side by side to make the best choice
                </p>
              </div>

              {compareProducts.length > 0 && (
                <button
                  onClick={clearCompare}
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  <FaTrash />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          {compareProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-32 h-32 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] rounded-full flex items-center justify-center mx-auto mb-8 opacity-20">
                  <FaBalanceScale className="text-white text-4xl" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  No Products to Compare
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                  Start browsing products and click &quot;Compare&quot; to add
                  them to your comparison list.
                </p>
                <Link
                  href="/all"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-8 py-4 rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all duration-200"
                >
                  <FaBalanceScale className="text-sm" />
                  <span>Browse Products</span>
                </Link>
              </div>
            </div>
          ) : compareProducts.length === 1 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
                  <div className="text-yellow-600 dark:text-yellow-400 mb-4">
                    <FaBalanceScale className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Add Another Product
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    You need at least 2 products to compare. Browse products and
                    add another one to your comparison.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Current product: <strong>{compareProducts[0].name}</strong>
                  </p>
                  <Link
                    href="/all"
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-6 py-3 rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all duration-200"
                  >
                    <span>Browse Products</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* Two Products Comparison */
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {compareProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
                  >
                    {/* Product Header */}
                    <div className="relative">
                      <button
                        onClick={() => removeFromCompare(product.id)}
                        className="absolute top-4 right-4 bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                        title="Remove from comparison"
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>

                      <div className="relative">
                        <Image
                          src={getProductDisplayImage(product)}
                          alt={product.name}
                          width={400}
                          height={250}
                          className="w-full h-64 object-cover"
                        />
                        {product.discountPercentage &&
                          product.discountPercentage > 0 && (
                            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-2 rounded-md font-semibold">
                              -{product.discountPercentage}%
                            </div>
                          )}
                      </div>

                      <div className="p-6">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {product.name}
                        </h3>

                        <Link
                          href={`/product/${product.slug}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                          View Product Details →
                        </Link>
                      </div>
                    </div>

                    {/* Comparison Features */}
                    <div className="p-6 pt-0 space-y-4">
                      {comparisonFeatures.map((feature) => (
                        <div
                          key={feature.key}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                        >
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            {feature.label}
                          </div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {feature.key === "price" && (
                              <div className="flex items-center space-x-2">
                                {product.discountPercentage &&
                                product.discountPercentage > 0 ? (
                                  <>
                                    <span className="text-2xl font-bold text-red-600">
                                      रु
                                      {getDiscountedPrice(
                                        product.price,
                                        product.discountPercentage,
                                      ).toFixed(2)}
                                    </span>
                                    <span className="text-gray-500 text-base line-through">
                                      रु{product.price.toFixed(2)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-2xl font-bold">
                                    रु{product.price.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            )}
                            {feature.key === "category" && (
                              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                                {product.category}
                              </span>
                            )}
                            {feature.key === "stock" && (
                              <div className="flex items-center space-x-2">
                                {product.stockQuantity > 0 ? (
                                  <>
                                    <FaCheck className="text-green-600 w-4 h-4" />
                                    <span className="text-green-600">
                                      In Stock ({product.stockQuantity})
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <FaTimes className="text-red-600 w-4 h-4" />
                                    <span className="text-red-600">
                                      Out of Stock
                                    </span>
                                  </>
                                )}
                              </div>
                            )}
                            {feature.key === "discount" && (
                              <div>
                                {product.discountPercentage &&
                                product.discountPercentage > 0 ? (
                                  <span className="text-green-600 font-semibold text-lg">
                                    {product.discountPercentage}% OFF
                                  </span>
                                ) : (
                                  <span className="text-gray-500">
                                    No discount
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Description */}
                      {product.description && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Description
                          </div>
                          <div 
                            className="text-gray-900 dark:text-white text-sm leading-relaxed rich-text-content"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="p-6 pt-0 space-y-3">
                      <button
                        onClick={() =>
                          handleAddToCart(product.id, product.name)
                        }
                        disabled={product.stockQuantity === 0}
                        className="w-full bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-6 py-4 rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 text-lg"
                      >
                        <FaShoppingCart />
                        <span>
                          {product.stockQuantity === 0
                            ? "Out of Stock"
                            : "Add to Cart"}
                        </span>
                      </button>

                      <button
                        onClick={() =>
                          handleAddToWishlist(product.id, product.name)
                        }
                        className="w-full border-2 border-[#0D3B66] text-[#0D3B66] px-6 py-4 rounded-xl font-semibold hover:bg-gradient-to-r hover:from-[#0D3B66] hover:to-[#1E5CAF] hover:text-white transition-all duration-200 flex items-center justify-center space-x-2 text-lg"
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
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-8 border border-green-200 dark:border-green-700">
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                    🏆 Price Comparison Winner
                  </h4>
                  <div className="text-center">
                    {(() => {
                      const product1Price = getDiscountedPrice(
                        compareProducts[0].price,
                        compareProducts[0].discountPercentage,
                      );
                      const product2Price = getDiscountedPrice(
                        compareProducts[1].price,
                        compareProducts[1].discountPercentage,
                      );

                      if (product1Price < product2Price) {
                        return (
                          <div className="text-green-600 dark:text-green-400 font-semibold text-xl">
                            {compareProducts[0].name} offers better value at रु
                            {product1Price.toFixed(2)}
                          </div>
                        );
                      } else if (product2Price < product1Price) {
                        return (
                          <div className="text-green-600 dark:text-green-400 font-semibold text-xl">
                            {compareProducts[1].name} offers better value at रु
                            {product2Price.toFixed(2)}
                          </div>
                        );
                      } else {
                        return (
                          <div className="text-blue-600 dark:text-blue-400 font-semibold text-xl">
                            Both products have the same price at रु
                            {product1Price.toFixed(2)}
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
      <Footer />
    </>
  );
}
