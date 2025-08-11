"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
        const meRes = await fetch("http://localhost:5000/me", {
          credentials: "include",
        });
        const me = await meRes.json();
        if (!me.user) {
          setIsAuthed(false);
          setLoading(false);
          return;
        }

        const ordersRes = await fetch("http://localhost:5000/orders", {
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

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-10">Loading...</div>;

  if (!isAuthed)
    return (
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        <h1 className="text-2xl font-bold">Please log in</h1>
        <p>You need to log in to view your order.</p>
      </main>
    );

  if (!order)
    return (
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        <h1 className="text-2xl font-bold">Order not found</h1>
        <button
          onClick={() => router.push("/profile")}
          className="bg-[#f85606] text-white px-4 py-2 rounded"
        >
          Go to profile
        </button>
      </main>
    );

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Order confirmed</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Thank you{order.customer?.name ? `, ${order.customer.name}` : ""}! Your order has been placed.
        </p>
      </div>

      <div className="border rounded p-4 bg-white dark:bg-gray-900 dark:text-white space-y-2">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-4 bg-white dark:bg-gray-900 dark:text-white space-y-1">
          <div className="font-semibold">Shipping to</div>
          <div>{order.customer?.name || ""}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {order.customer?.address?.street || ""}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {order.customer?.address?.city || ""}
          </div>
        </div>
        <div className="border rounded p-4 bg-white dark:bg-gray-900 dark:text-white space-y-1">
          <div className="font-semibold">Summary</div>
          <div className="flex items-center justify-between text-sm">
            <span>Items</span>
            <span>{itemCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Delivery</span>
            <span>${order.deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between font-semibold">
            <span>Total</span>
            <span>${order.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div>
        <button
          onClick={() => router.push("/profile")}
          className="bg-[#f85606] text-white px-4 py-2 rounded hover:bg-[#e14e00]"
        >
          View your orders
        </button>
      </div>
    </main>
  );
}


