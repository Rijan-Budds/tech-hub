"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  username: string;
  email: string;
}

interface Order {
  orderId: string;
  userId: string;
  username: string;
  email: string;
  status: "pending" | "canceled" | "delivered";
  createdAt: string;
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  customer: {
    name: string;
    email: string;
    address: { street: string; city: string };
  };
  items: { productId: string; quantity: number }[];
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("electronics");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const [uRes, oRes] = await Promise.all([
          fetch("http://localhost:5000/admin/users", {
            credentials: "include",
          }),
          fetch("http://localhost:5000/admin/orders", {
            credentials: "include",
          }),
        ]);

        if (uRes.status === 403) {
          toast.error("Forbidden: Admin only");
          setLoading(false);
          return;
        }

        const uData = await uRes.json();
        const oData = await oRes.json();
        setUsers(uData.users || []);
        setOrders(oData.orders || []);
      } catch (e: any) {
        toast.error(e.message || "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateStatus = async (
    orderId: string,
    status: "pending" | "canceled" | "delivered"
  ) => {
    try {
      const res = await fetch(`http://localhost:5000/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");

      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status } : o))
      );
      toast.success("Order status updated");
    } catch (e: any) {
      toast.error(e.message || "Failed to update status");
    }
  };

  const addProduct = async () => {
    if (!name || !price || !category || !image) {
      toast.error("Fill all fields");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          price: Number(price),
          category,
          image,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add product");
      toast.success("Product added");
      setName("");
      setPrice("");
      setCategory("electronics");
      setImage("");
    } catch (e: any) {
      toast.error(e.message || "Failed to add product");
    }
  };

  const handleLogout = async () => {
    await fetch("http://localhost:5000/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      setImage(data.url);
      toast.success("Image uploaded successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  if (loading)
    return <div className="max-w-6xl mx-auto px-4 py-8">Loading...</div>;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <button
        onClick={handleLogout}
        className="bg-[#f85606] text-white px-4 py-2 rounded hover:bg-[#e14e00]"
      >
        Logout
      </button>

      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Users Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Users</h2>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="text-left p-2">Username</th>
                <th className="text-left p-2">Email</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t">
                  <td className="p-2">{u.username}</td>
                  <td className="p-2">{u.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Orders Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Orders</h2>
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.orderId}
              className="border rounded p-4 bg-white dark:bg-gray-900 dark:text-white"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold">
                  {o.username} ({o.email})
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(o.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="text-sm">
                Status:{" "}
                <span className="font-medium capitalize">{o.status}</span>
              </div>
              <div className="text-sm">
                Address: {o.customer?.address?.street},{" "}
                {o.customer?.address?.city}
              </div>
              <div className="text-sm">
                Totals: Subtotal $
                {o.subtotal !== undefined ? o.subtotal.toFixed(2) : "0.00"} +
                Delivery $
                {o.deliveryFee !== undefined
                  ? o.deliveryFee.toFixed(2)
                  : "0.00"}{" "}
                ={" "}
                <span className="font-semibold">
                  $
                  {o.grandTotal !== undefined
                    ? o.grandTotal.toFixed(2)
                    : "0.00"}
                </span>
              </div>

              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => updateStatus(o.orderId, "pending")}
                  className="px-3 py-1 rounded border"
                >
                  Pending
                </button>
                <button
                  onClick={() => updateStatus(o.orderId, "canceled")}
                  className="px-3 py-1 rounded border"
                >
                  Canceled
                </button>
                <button
                  onClick={() => updateStatus(o.orderId, "delivered")}
                  className="px-3 py-1 rounded border"
                >
                  Delivered
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add Product Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Add Product</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border rounded p-4 bg-white dark:bg-gray-900 dark:text-white">
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded px-3 py-2 bg-white dark:bg-gray-800"
          />
          {/* Slug is auto-generated on the server from the product name */}
          <input
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border rounded px-3 py-2 bg-white dark:bg-gray-800"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded px-3 py-2 bg-white dark:bg-gray-800"
          >
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="books-media">Books & Media</option>
            <option value="home-kitchen">Home Kitchen</option>
            <option value="sports-fitness">Sports-Fitness</option>
            <option value="toys-games">Toys</option>
            <option value="beauty-health">Beauty & health</option>
            <option value="automotive">Automotive</option>
            {/* Add or modify options as needed */}
          </select>

          {/* File input for image upload */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="border rounded px-3 py-2 bg-white dark:bg-gray-800 md:col-span-2"
            disabled={uploading}
          />

          {/* Image preview */}
          {image && (
            <img
              src={image}
              alt="Uploaded preview"
              className="w-40 h-40 object-cover rounded mt-2 md:col-span-2"
            />
          )}

          {/* Add product button */}
          <div className="md:col-span-2">
            <button
              onClick={addProduct}
              disabled={uploading}
              className="bg-[#f85606] text-white px-4 py-2 rounded hover:bg-[#e14e00] disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Add Product"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
