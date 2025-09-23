"use client";

import React from "react";
import { FaMinus, FaPlus } from "react-icons/fa";

interface QuantityInputProps {
  quantity: number;
  maxQuantity: number;
  onQuantityChange: (quantity: number) => void;
  disabled?: boolean;
  showStock?: boolean;
}

export default function QuantityInput({
  quantity,
  maxQuantity,
  onQuantityChange,
  disabled = false,
  showStock = true,
}: QuantityInputProps) {
  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value) || 1;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      onQuantityChange(newQuantity);
    }
  };

  const isMaxReached = quantity >= maxQuantity;
  const isMinReached = quantity <= 1;

  return (
    <div className="space-y-2">
      <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || isMinReached}
          className="w-8 h-8 rounded-md bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-[#0D3B66] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaMinus className="text-sm" />
        </button>
        
        <input
          type="number"
          min={1}
          max={maxQuantity}
          value={quantity}
          onChange={handleInputChange}
          disabled={disabled}
          className="min-w-[60px] text-center font-semibold text-gray-900 dark:text-white bg-transparent border-none outline-none disabled:opacity-50"
        />
        
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || isMaxReached}
          className="w-8 h-8 rounded-md bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-[#0D3B66] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaPlus className="text-sm" />
        </button>
      </div>
      
      {showStock && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {isMaxReached && (
            <span className="text-orange-600 dark:text-orange-400">
              Maximum quantity reached
            </span>
          )}
          {!isMaxReached && (
            <span>
              {maxQuantity - quantity} more available
            </span>
          )}
        </div>
      )}
    </div>
  );
}