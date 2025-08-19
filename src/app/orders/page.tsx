"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfileStore } from "@/store/useProfileStore";
import { FaArrowLeft, FaShoppingBag, FaCalendarAlt, FaBox, FaEye } from "react-icons/fa";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function OrdersPage() {
  const router = useRouter();
  const { loading, user, orders, loadProfile, refreshOrders } = useProfileStore();

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

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
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'canceled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
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
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
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
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                            <FaBox className="text-gray-500 dark:text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-gray-900 dark:text-white">
                              Product ID: {item.productId}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
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

                  {/* Action Button */}
                  <div className="flex justify-end">
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
    </>
  );
}
