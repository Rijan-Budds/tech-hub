"use client";

import React from "react";
import { FaBalanceScale, FaTimes } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { useCompareStore } from "@/store/useCompareStore";

export default function CompareIndicator() {
  const { compareProducts, removeFromCompare, openCompareModal, clearCompare } =
    useCompareStore();

  if (compareProducts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] rounded-lg">
              <FaBalanceScale className="text-white text-sm" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                Comparison ({compareProducts.length}/2)
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {compareProducts.length === 1
                  ? "Add another product to compare"
                  : "Ready to compare products"}
              </p>
            </div>
          </div>

          <button
            onClick={clearCompare}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Clear all"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Product List */}
        <div className="space-y-2 mb-4">
          {compareProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-2"
            >
              <div className="flex items-center space-x-2 flex-1">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 object-cover rounded"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {product.name}
                </span>
              </div>
              <button
                onClick={() => removeFromCompare(product.id)}
                className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                title="Remove"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {compareProducts.length === 2 ? (
            <>
              <button
                onClick={openCompareModal}
                className="w-full bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-4 py-2 rounded-xl font-semibold text-sm hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all duration-200"
              >
                Quick Compare
              </button>
              <Link
                href="/compare"
                className="block w-full text-center border-2 border-[#0D3B66] text-[#0D3B66] px-4 py-2 rounded-xl font-semibold text-sm hover:bg-gradient-to-r hover:from-[#0D3B66] hover:to-[#1E5CAF] hover:text-white transition-all duration-200"
              >
                Full Comparison
              </Link>
            </>
          ) : (
            <Link
              href="/all"
              className="block w-full text-center bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-4 py-2 rounded-xl font-semibold text-sm hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all duration-200"
            >
              Add Product
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
