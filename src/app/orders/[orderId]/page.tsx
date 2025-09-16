"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { FaMoneyBillWave, FaUndo, FaBox } from "react-icons/fa";
import ReturnRequestForm from "@/components/ReturnRequestForm";
import { toast } from "sonner";

interface OrderItem {
  productId: string;
  quantity: number;
  name?: string;
  image?: string;
  price?: number;
}

interface Order {
  id: string;
  _id?: string; // Legacy support
  items: OrderItem[];
  createdAt: string;
  status: "pending" | "processing" | "shipped" | "out-for-delivery" | "delivered" | "returned" | "canceled" | "return-requested";
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  paymentMethod?: "khalti" | "esewa" | "cod";
  customer?: {
    name?: string;
    email?: string;
    address?: { street?: string; city?: string };
  };
  returnRequestId?: string;
  deliveredAt?: string;
}

export default function OrderConfirmationPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const orderId = params?.orderId;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [isAuthed, setIsAuthed] = useState<boolean>(true);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnRequest, setReturnRequest] = useState<{
    id: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'refunded';
    reason: string;
    description?: string;
    requestedAt: Date;
    processedAt?: Date;
    adminNote?: string;
    refundAmount?: number;
    items?: { productId: string; quantity: number; name?: string }[];
  } | null>(null);
  const [loadingReturn, setLoadingReturn] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const meRes = await fetch("/api/me", {
          credentials: "include",
        });
        const me = await meRes.json();
        if (!me.user) {
          setIsAuthed(false);
          setLoading(false);
          return;
        }

        const ordersRes = await fetch("/api/orders", {
          credentials: "include",
        });
        const data = await ordersRes.json();
        const found = (data.orders || []).find((o: Order) => 
          (o.id === orderId) || (o._id === orderId)
        ) || null;
        setOrder(found);
        
        // If order has a return request, fetch it
        if (found?.returnRequestId) {
          try {
            const returnsRes = await fetch('/api/returns', {
              credentials: 'include',
            });
            const returnsData = await returnsRes.json();
            const foundReturn = returnsData.returnRequests?.find(
              (r: { id: string }) => r.id === found.returnRequestId
            );
            setReturnRequest(foundReturn || null);
          } catch (error) {
            console.error('Error fetching return request:', error);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    if (orderId) load();
  }, [orderId]);

  const itemCount = useMemo(
    () => order?.items?.reduce((sum, it) => sum + (it?.quantity || 0), 0) || 0,
    [order]
  );

  // Helper function to check if order is eligible for return
  const isOrderEligibleForReturn = (order: Order) => {
    if (order.status !== 'delivered') return false;
    if (order.returnRequestId) return false; // Already has a return request
    
    // For demo purposes, assume all delivered orders are within return window
    // In real implementation, you'd check deliveredAt date
    const deliveredDate = new Date(order.deliveredAt || order.createdAt);
    const now = new Date();
    const daysDifference = Math.floor((now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysDifference <= 7;
  };

  // Handle return request submission
  const handleReturnRequest = async (returnData: {
    orderId: string;
    items: OrderItem[];
    reason: string;
    description?: string;
    images?: string[];
  }) => {
    setLoadingReturn(true);
    
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
        // Refresh the order data
        window.location.reload();
      } else {
        toast.error(result.message || 'Failed to submit return request');
      }
    } catch (error) {
      console.error('Error submitting return request:', error);
      toast.error('Failed to submit return request. Please try again.');
    } finally {
      setLoadingReturn(false);
      setShowReturnForm(false);
    }
  };

  // Get status display info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending': return { color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Pending' };
      case 'processing': return { color: 'text-blue-600', bg: 'bg-blue-100', text: 'Processing' };
      case 'shipped': return { color: 'text-purple-600', bg: 'bg-purple-100', text: 'Shipped' };
      case 'out-for-delivery': return { color: 'text-indigo-600', bg: 'bg-indigo-100', text: 'Out for Delivery' };
      case 'delivered': return { color: 'text-green-600', bg: 'bg-green-100', text: 'Delivered' };
      case 'return-requested': return { color: 'text-orange-600', bg: 'bg-orange-100', text: 'Return Requested' };
      case 'returned': return { color: 'text-orange-600', bg: 'bg-orange-100', text: 'Returned' };
      case 'canceled': return { color: 'text-red-600', bg: 'bg-red-100', text: 'Canceled' };
      default: return { color: 'text-gray-600', bg: 'bg-gray-100', text: status };
    }
  };

  const getReturnStatusInfo = (status: string) => {
    switch (status) {
      case 'pending': return { color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Pending Review' };
      case 'approved': return { color: 'text-green-600', bg: 'bg-green-100', text: 'Approved' };
      case 'rejected': return { color: 'text-red-600', bg: 'bg-red-100', text: 'Rejected' };
      case 'completed': return { color: 'text-blue-600', bg: 'bg-blue-100', text: 'Completed' };
      case 'refunded': return { color: 'text-purple-600', bg: 'bg-purple-100', text: 'Refunded' };
      default: return { color: 'text-gray-600', bg: 'bg-gray-100', text: status };
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D3B66] mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading order details...</p>
      </div>
    </div>
  );

  if (!isAuthed)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Please log in</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">You need to log in to view your order.</p>
            <button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-6 py-3 rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all duration-200"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );

  if (!order)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Order not found</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">The order you&apos;re looking for doesn&apos;t exist.</p>
            <button
              onClick={() => router.push("/profile")}
              className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-6 py-3 rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all duration-200"
            >
              Go to Profile
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order confirmed</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Thank you{order.customer?.name ? `, ${order.customer.name}` : ""}! Your order has been placed.
          </p>
        </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">Order ID</div>
          <div className="font-mono">{order.id || order._id}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">Placed</div>
          <div>{new Date(order.createdAt).toLocaleString()}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(order.status).bg} ${getStatusInfo(order.status).color}`}>
            {getStatusInfo(order.status).text}
          </div>
        </div>
        {order.paymentMethod && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">Payment Method</div>
            <div className="flex items-center capitalize font-medium">
              {order.paymentMethod === "khalti" && (
                <>
                  <Image
                    src="/home/khalti.png"
                    alt="Khalti"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  Khalti
                </>
              )}
              {order.paymentMethod === "esewa" && (
                <>
                  <Image
                    src="/home/esewa.png"
                    alt="eSewa"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  eSewa
                </>
              )}
              {order.paymentMethod === "cod" && (
                <>
                  <FaMoneyBillWave className="mr-2 text-green-600" />
                  Cash on Delivery
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Return Request Section */}
      {returnRequest && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <FaUndo className="mr-2 text-orange-500" />
              Return Request
            </h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getReturnStatusInfo(returnRequest.status).bg} ${getReturnStatusInfo(returnRequest.status).color}`}>
              {getReturnStatusInfo(returnRequest.status).text}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Return ID:</span>
              <span className="ml-2 font-medium">{returnRequest.id?.slice(-8).toUpperCase()}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Requested:</span>
              <span className="ml-2 font-medium">{new Date(returnRequest.requestedAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Reason:</span>
              <span className="ml-2 font-medium capitalize">{returnRequest.reason.replace('-', ' ')}</span>
            </div>
            {returnRequest.processedAt && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">Processed:</span>
                <span className="ml-2 font-medium">{new Date(returnRequest.processedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          
          {returnRequest.description && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Details:</strong> {returnRequest.description}
              </p>
            </div>
          )}
          
          {returnRequest.adminNote && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Admin Note:</strong> {returnRequest.adminNote}
              </p>
            </div>
          )}
          
          {returnRequest.refundAmount && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
              <p className="text-sm text-green-800 dark:text-green-300">
                <strong>Refund Amount:</strong> रु{returnRequest.refundAmount.toFixed(2)}
              </p>
            </div>
          )}
          
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Items being returned:</h4>
            <div className="space-y-2">
              {returnRequest.items?.map((item: { productId: string; quantity: number; name?: string }, index: number) => (
                <div key={index} className="flex items-center space-x-3 text-sm">
                  <FaBox className="text-gray-400" />
                  <span>{item.name || `Product #${item.productId.slice(-6)}`}</span>
                  <span className="text-gray-600 dark:text-gray-400">Qty: {item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-3 border border-gray-200 dark:border-gray-700">
          <div className="font-semibold">Shipping to</div>
          <div>{order.customer?.name || ""}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {order.customer?.address?.street || ""}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {order.customer?.address?.city || ""}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-3 border border-gray-200 dark:border-gray-700">
          <div className="font-semibold">Summary</div>
          <div className="flex items-center justify-between text-sm">
            <span>Items</span>
            <span>{itemCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span>रु{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Delivery</span>
            <span>रु{order.deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between font-semibold">
            <span>Total</span>
            <span>रु{order.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={() => router.push("/orders")}
          className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-8 py-3 rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
        >
          <FaBox className="text-sm" />
          <span>View All Orders</span>
        </button>
        
        {order && isOrderEligibleForReturn(order) && (
          <button
            onClick={() => setShowReturnForm(true)}
            disabled={loadingReturn}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <FaUndo className="text-sm" />
            <span>{loadingReturn ? 'Processing...' : 'Request Return'}</span>
          </button>
        )}
      </div>
      </div>
      
      {/* Return Request Form Modal */}
      {showReturnForm && order && (
        <ReturnRequestForm
          order={order}
          onClose={() => setShowReturnForm(false)}
          onSubmit={handleReturnRequest}
        />
      )}
    </div>
  );
}


