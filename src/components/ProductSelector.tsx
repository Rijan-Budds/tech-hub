"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FaTimes, FaSearch, FaBox } from "react-icons/fa";
import Image from "next/image";
import { useCompareStore } from "@/store/useCompareStore";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  image: string;
  description?: string;
  discountPercentage?: number;
  stockQuantity: number;
}

export default function ProductSelector() {
  const {
    isProductSelectorOpen,
    selectedProductForComparison,
    closeProductSelector,
    addToCompare,
    compareProducts,
  } = useCompareStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/products?limit=50");
      const data = await response.json();
      if (response.ok) {
        // Filter out the current product and products already in comparison
        const filteredProducts = data.products.filter(
          (p: Product) =>
            p.id !== selectedProductForComparison?.id &&
            !compareProducts.some(cp => cp.id === p.id)
        );
        setProducts(filteredProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [selectedProductForComparison, compareProducts]);

  useEffect(() => {
    if (isProductSelectorOpen && selectedProductForComparison) {
      fetchProducts();
    }
  }, [isProductSelectorOpen, selectedProductForComparison, fetchProducts]);

  const handleProductSelect = (product: Product) => {
    if (selectedProductForComparison) {
      // Add both products to compare
      addToCompare(selectedProductForComparison);
      addToCompare(product);
      toast.success("Products added to comparison!");
      closeProductSelector();
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(products.map(p => p.category)));

  if (!isProductSelectorOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Choose Product to Compare</h2>
            <button
              onClick={closeProductSelector}
              className="text-white hover:text-gray-200 p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
          
          {selectedProductForComparison && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-sm text-blue-100 mb-1">Comparing with:</p>
              <p className="font-semibold">{selectedProductForComparison.name}</p>
            </div>
          )}
        </div>

        {/* Search and Filter */}
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="p-6 overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading products...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <FaBox className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300 dark:hover:border-blue-600"
                  onClick={() => handleProductSelect(product)}
                >
                  <div className="relative mb-3">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={200}
                      height={150}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    {product.discountPercentage && product.discountPercentage > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                        -{product.discountPercentage}%
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {product.discountPercentage && product.discountPercentage > 0 ? (
                        <>
                          <span className="text-lg font-bold text-red-600">
                            रु{(product.price * (1 - product.discountPercentage / 100)).toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            रु{product.price.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          रु{product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Stock: {product.stockQuantity}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Click on a product to add it to the comparison with <strong>{selectedProductForComparison?.name}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}