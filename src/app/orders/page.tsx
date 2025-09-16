"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfileStore } from "@/store/useProfileStore";
import { FaArrowLeft, FaShoppingBag, FaCalendarAlt, FaBox, FaEye, FaUndo } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ReturnRequestForm from "@/components/ReturnRequestForm";
import { toast } from "sonner";

export default function OrdersPage() {
  const router = useRouter();
  const { loading, user, orders, loadProfile, refreshOrders } = useProfileStore();
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<{
    id: string;
    items: { productId: string; quantity: number; name?: string; image?: string; price?: number }[];
    grandTotal: number;
    status: string;
    createdAt: string;
    customer?: { name?: string; email?: string; address?: { street?: string; city?: string } };
  } | null>(null);
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  // Helper function to check if an order is eligible for return
  const isOrderEligibleForReturn = (order: { 
    status: string; 
    createdAt: string; 
    returnRequestId?: string;
  }) => {
    if (order.status !== 'delivered') return false;
    
    // For demo purposes, assume all delivered orders have a deliveredAt date
    // In a real implementation, you'd track when orders are marked as delivered
    const deliveredDate = new Date(order.createdAt);
    const now = new Date();
    const daysDifference = Math.floor((now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysDifference <= 7 && !order.returnRequestId;
  };

  // Handle return request submission
  const handleReturnRequest = async (returnData: {
    orderId: string;
    items: { productId: string; quantity: number }[];
    reason: string;
    description?: string;
    images?: string[];
  }) => {
    setIsSubmittingReturn(true);
    
    try {
      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(returnData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Return request submitted successfully!');
        refreshOrders(); // Refresh to get updated order status
        setSelectedOrderForReturn(null);
      } else {
        toast.error(result.message || 'Failed to submit return request');
      }
    } catch (error) {
      console.error('Error submitting return request:', error);
      toast.error('Failed to submit return request. Please try again.');
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  if (loading)
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D3B66] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading your orders...</p>
          </div>
        </div>
        <Footer />
      </>
    );

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0D3B66] to-[#1E5CAF] rounded-full flex items-center justify-center mx-auto mb-6">
                <FaShoppingBag className="text-white text-2xl" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Not Logged In</h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Please log in to view your orders.
              </p>
              <button
                onClick={() => router.push("/")}
                className="w-full bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-6 py-3 rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all duration-200"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'out-for-delivery': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'return-requested': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400';
      case 'returned': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'canceled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };
  
  const getStatusDisplayText = (status: string) => {
    switch (status) {
      case 'out-for-delivery': return 'Out for Delivery';
      case 'return-requested': return 'Return Requested';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

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
                  <Link href="/" className="hover:text-blue-600 transition-colors flex items-center space-x-1">
                    <FaArrowLeft className="text-xs" />
                    <span>Back to Home</span>
                  </Link>
                </li>
                <li>/</li>
                <li className="text-gray-900 dark:text-white font-medium">My Orders</li>
              </ol>
            </nav>

            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                My <span className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent">Orders</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Track your order history and current orders
              </p>
            </div>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaShoppingBag className="text-white text-3xl" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">No Orders Yet</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                  You haven&apos;t placed any orders yet. Start shopping to see your orders here!
                </p>
                <Link 
                  href="/all" 
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-8 py-4 rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all duration-200"
                >
                  <FaBox className="text-sm" />
                  <span>Start Shopping</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Order #{order.id?.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <FaCalendarAlt className="inline w-3 h-3 mr-1" />
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusDisplayText(order.status)}
                      </span>
                      <p className="text-lg font-bold text-[#0D3B66] mt-1">
                        रु{order.grandTotal?.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Ordered Items:</p>
                    <div className="space-y-2">
                      {order.items.map((item, index) => {
                        const hasProductDetails = item.name && item.image && item.price;
                        
                        return (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            {hasProductDetails && item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name || 'Product'}
                                width={48}
                                height={48}
                                className="w-12 h-12 object-cover rounded-lg"
                                onError={() => {
                                  // Handle error if needed
                                }}
                              />
                            ) : null}
                            <div className={`w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center ${hasProductDetails && item.image ? 'hidden' : ''}`}>
                              <FaBox className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-gray-900 dark:text-white">
                                {item.name || `Product ID: ${item.productId}`}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Quantity: {item.quantity}
                                {item.price && ` • रु${item.price.toFixed(2)} each`}
                              </p>
                              {item.price && (
                                <p className="text-sm font-medium text-[#0D3B66] dark:text-blue-400">
                                  Total: रु{(item.price * item.quantity).toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Address</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {order.customer?.address?.street}, {order.customer?.address?.city}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Order Total</p>
                      <p className="font-bold text-lg text-[#0D3B66]">
                        रु{order.grandTotal?.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3">
                    {/* Return Button */}
                    {isOrderEligibleForReturn(order) && (
                      <button
                        onClick={() => setSelectedOrderForReturn(order)}
                        disabled={isSubmittingReturn}
                        className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                      >
                        <FaUndo className="text-sm" />
                        <span>{isSubmittingReturn ? 'Returning...' : 'Return'}</span>
                      </button>
                    )}
                    
                    {/* View Details Button */}
                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-6 py-3 rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all duration-200"
                    >
                      <FaEye className="text-sm" />
                      <span>View Details</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
      
      {/* Return Request Form Modal */}
      {selectedOrderForReturn && (
        <ReturnRequestForm
          order={selectedOrderForReturn}
          onClose={() => setSelectedOrderForReturn(null)}
          onSubmit={handleReturnRequest}
        />
      )}
    </>
  );
}
