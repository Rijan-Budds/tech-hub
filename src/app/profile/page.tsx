"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

interface WishlistItem extends Product {}

interface OrderItem {
  productId: string;
  quantity: number;
}

interface Order {
  items: OrderItem[];
  createdAt: string;
  total: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    id: string;
    email: string;
    username: string;
  } | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [meRes, wlRes, ordersRes] = await Promise.all([
          fetch("http://localhost:5000/me", { credentials: "include" }),
          fetch("http://localhost:5000/wishlist", { credentials: "include" }),
          fetch("http://localhost:5000/orders", { credentials: "include" }),
        ]);
        const me = await meRes.json();
        if (!me.user) {
          setUser(null);
        } else {
          setUser(me.user);
        }
        const wl = wlRes.ok ? await wlRes.json() : { items: [] };
        const or = ordersRes.ok ? await ordersRes.json() : { orders: [] };
        setWishlist(wl.items || []);
        setOrders(or.orders || []);
      } catch {
        setUser(null);
        setWishlist([]);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLogout = async () => {
    await fetch("http://localhost:5000/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/");
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      const res = await fetch("http://localhost:5000/wishlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update wishlist");
      setWishlist((prev) => prev.filter((p) => p.id !== productId));
      toast.success("Removed from wishlist");
    } catch (e: any) {
      toast.error(e.message || "Failed to update wishlist");
    }
  };

  if (loading)
    return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>;

  if (!user) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">You are not logged in</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Please log in to view your profile.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hi, {user.username}</h1>
          <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-[#f85606] text-white px-4 py-2 rounded hover:bg-[#e14e00]"
        >
          Logout
        </button>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Wishlist</h2>
        {wishlist.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">
            No items in wishlist yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {wishlist.map((p) => (
              <div
                key={p.id}
                className="border rounded-lg p-4 shadow bg-white dark:bg-gray-900 dark:text-white"
              >
                <Image
                  src={p.image}
                  alt={p.name}
                  width={300}
                  height={192}
                  className="w-full h-40 object-cover rounded mb-3"
                />
                <div className="font-semibold">{p.name}</div>
                <div className="text-orange-600 font-bold mb-3">
                  ${p.price.toFixed(2)}
                </div>
                <button
                  onClick={() => handleRemoveFromWishlist(p.id)}
                  className="w-full border border-gray-300 dark:border-gray-700 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Orders</h2>
        {orders.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">No orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((o, idx) => (
              <div
                key={idx}
                className="border rounded-lg p-4 shadow bg-white dark:bg-gray-900 dark:text-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">Order #{idx + 1}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(o.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Items: {o.items.reduce((s, it) => s + it.quantity, 0)}
                </div>
                <div className="text-orange-600 font-bold mt-1">
                  Total: $
                  {typeof o.total === "number" ? o.total.toFixed(2) : "N/A"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
