"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { FaMoneyBillWave } from "react-icons/fa";

interface OrderItem {
  productId: string;
  quantity: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  createdAt: string;
  status: "pending" | "canceled" | "delivered";
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  paymentMethod?: "khalti" | "esewa" | "cod";
  customer?: {
    name?: string;
    email?: string;
    address?: { street?: string; city?: string };
  };
}

export default function OrderConfirmationPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const orderId = params?.orderId;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [isAuthed, setIsAuthed] = useState<boolean>(true);

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
        const found = (data.orders || []).find((o: Order) => o._id === orderId) || null;
        setOrder(found);
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
          <div className="font-mono">{order._id}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">Placed</div>
          <div>{new Date(order.createdAt).toLocaleString()}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
          <div className="capitalize font-medium">{order.status}</div>
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

      <div className="text-center">
        <button
          onClick={() => router.push("/profile")}
          className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-8 py-3 rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all duration-200 shadow-lg"
        >
          View your orders
        </button>
      </div>
      </div>
    </div>
  );
}


