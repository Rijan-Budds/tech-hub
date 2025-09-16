"use client";

import React, { useState } from "react";
import { FaTimes, FaUpload, FaBox, FaExclamationTriangle } from "react-icons/fa";
import Image from "next/image";

interface OrderItem {
  productId: string;
  quantity: number;
  name?: string;
  image?: string;
  price?: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  grandTotal: number;
  status: string;
  createdAt: string;
  customer?: {
    name?: string;
    email?: string;
    address?: { street?: string; city?: string };
  };
}

interface ReturnRequestFormProps {
  order: Order;
  onClose: () => void;
  onSubmit: (data: {
    orderId: string;
    items: OrderItem[];
    reason: string;
    description?: string;
    images?: string[];
  }) => Promise<void>;
}

const returnReasons = [
  { value: "damaged", label: "Item was damaged" },
  { value: "wrong-item", label: "Wrong item received" },
  { value: "defective", label: "Item is defective" },
  { value: "not-as-described", label: "Not as described" },
  { value: "other", label: "Other reason" },
];

export default function ReturnRequestForm({ order, onClose, onSubmit }: ReturnRequestFormProps) {
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const handleItemToggle = (item: OrderItem, quantity?: number) => {
    const existingIndex = selectedItems.findIndex(si => si.productId === item.productId);
    
    if (existingIndex >= 0) {
      if (quantity && quantity > 0) {
        // Update quantity
        setSelectedItems(prev => prev.map((si, index) => 
          index === existingIndex ? { ...si, quantity: quantity } : si
        ));
      } else {
        // Remove item
        setSelectedItems(prev => prev.filter((_, index) => index !== existingIndex));
      }
    } else if (quantity && quantity > 0) {
      // Add item
      setSelectedItems(prev => [...prev, { ...item, quantity: quantity }]);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 5 - imageFiles.length); // Max 5 images
    
    try {
      // Upload images to API
      const formData = new FormData();
      newFiles.forEach(file => {
        formData.append('images', file);
      });
      
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload images');
      }
      
      const { imageUrls } = await response.json();
      
      // Update state with uploaded image URLs
      setImageFiles(prev => [...prev, ...newFiles]);
      setImages(prev => [...prev, ...imageUrls]);
    } catch (error) {
      console.error('Failed to upload images:', error);
      alert('Failed to upload images. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || selectedItems.length === 0) return;

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        orderId: order.id,
        items: selectedItems,
        reason,
        description,
        images,
      });
      onClose();
    } catch (error) {
      console.error('Failed to submit return request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = reason && selectedItems.length > 0;
  const selectedItem = (itemId: string) => selectedItems.find(si => si.productId === itemId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Return Request
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Order #{order.id?.slice(-8).toUpperCase()}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Select Items to Return */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Select items to return
            </h3>
            <div className="space-y-3">
              {order.items.map((item, index) => {
                const selected = selectedItem(item.productId);
                return (
                  <div key={index} className="border dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name || 'Product'}
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                          <FaBox className="text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {item.name || `Product ID: ${item.productId}`}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Ordered quantity: {item.quantity}
                          {item.price && ` • रु${item.price.toFixed(2)} each`}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={!!selected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleItemToggle(item, 1);
                            } else {
                              handleItemToggle(item);
                            }
                          }}
                          className="w-4 h-4 text-blue-600"
                        />
                        {selected && (
                          <input
                            type="number"
                            min="1"
                            max={item.quantity}
                            value={selected.quantity}
                            onChange={(e) => handleItemToggle(item, parseInt(e.target.value))}
                            className="w-16 px-2 py-1 border rounded text-center"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Return Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for return *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a reason</option>
              {returnReasons.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional details (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Please provide any additional details about the return..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload photos (optional)
            </label>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FaUpload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> photos
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG up to 5 images
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={imageFiles.length >= 5}
                  />
                </label>
              </div>

              {/* Image Previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={image}
                        alt={`Return image ${index + 1}`}
                        width={100}
                        height={100}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <div className="flex items-start">
              <FaExclamationTriangle className="w-5 h-5 text-yellow-500 mt-0.5 mr-3" />
              <div className="text-sm">
                <p className="text-yellow-700 dark:text-yellow-300 font-medium">
                  Important Return Information
                </p>
                <ul className="text-yellow-600 dark:text-yellow-400 mt-1 space-y-1">
                  <li>• Returns are processed within 3-5 business days</li>
                  <li>• Items must be in original condition</li>
                  <li>• Refunds will be processed to your original payment method</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white rounded-lg hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Return Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}