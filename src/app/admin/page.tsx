"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaUsers, FaShoppingCart, FaBox, FaPlus, FaTrash, FaSignOutAlt, FaEye, FaSync } from "react-icons/fa";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StatusDropdown from "@/components/StatusDropdown";

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
  items: { 
    productId: string; 
    quantity: number; 
    name?: string; 
    image?: string; 
    price?: number; 
  }[];
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<{
    id: string;
    slug: string;
    name: string;
    price: number;
    category: string;
    image: string;
    description?: string;
    discountPercentage?: number;
    stockQuantity: number;
  }[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("cpu");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [reloadingUsers, setReloadingUsers] = useState(false);
  const [reloadingOrders, setReloadingOrders] = useState(false);
  const [reloadingProducts, setReloadingProducts] = useState(false);
  const [reloadingAll, setReloadingAll] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'orders' | 'products'>('overview');
  
  // Pagination state for products
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination state for orders
  const [currentOrdersPage, setCurrentOrdersPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalOrdersPages, setTotalOrdersPages] = useState(0);
  const [ordersSortBy, setOrdersSortBy] = useState('createdAt');
  const [ordersSortOrder, setOrdersSortOrder] = useState('desc');

  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const [uRes, oRes, pRes] = await Promise.all([
          fetch("/api/admin/users", {
            credentials: "include",
          }),
          fetch(`/api/admin/orders?page=${currentOrdersPage}&limit=${ordersPerPage}&sortBy=${ordersSortBy}&sortOrder=${ordersSortOrder}`, {
            credentials: "include",
          }),
          fetch(`/api/products?page=${currentPage}&limit=${productsPerPage}&sortBy=${sortBy}&sortOrder=${sortOrder}`, {
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
        const pData = await pRes.json();
        setUsers(uData.users || []);
        setOrders(oData.orders || []);
        setProducts(pData.products || []);
        
        // Set pagination data for products
        if (pData.pagination) {
          setTotalProducts(pData.pagination.totalCount);
          setTotalPages(pData.pagination.totalPages);
        }
        
        // Set pagination data for orders
        if (oData.pagination) {
          setTotalOrders(oData.pagination.totalCount);
          setTotalOrdersPages(oData.pagination.totalPages);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load admin data";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentPage, productsPerPage, sortBy, sortOrder, currentOrdersPage, ordersPerPage, ordersSortBy, ordersSortOrder]);

  const reloadUsers = async () => {
    try {
      setReloadingUsers(true);
      const res = await fetch("/api/admin/users", {
        credentials: "include",
      });
      const data = await res.json();
      setUsers(data.users || []);
      toast.success("Users refreshed successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to reload users";
      toast.error(errorMessage);
    } finally {
      setReloadingUsers(false);
    }
  };

  const reloadOrders = async () => {
    try {
      setReloadingOrders(true);
      const res = await fetch(`/api/admin/orders?page=${currentOrdersPage}&limit=${ordersPerPage}&sortBy=${ordersSortBy}&sortOrder=${ordersSortOrder}`, {
        credentials: "include",
      });
      const data = await res.json();
      setOrders(data.orders || []);
      
      // Set pagination data for orders
      if (data.pagination) {
        setTotalOrders(data.pagination.totalCount);
        setTotalOrdersPages(data.pagination.totalPages);
      }
      
      toast.success("Orders refreshed successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to reload orders";
      toast.error(errorMessage);
    } finally {
      setReloadingOrders(false);
    }
  };

  const reloadProducts = async () => {
    try {
      setReloadingProducts(true);
      const res = await fetch(`/api/products?page=${currentPage}&limit=${productsPerPage}&sortBy=${sortBy}&sortOrder=${sortOrder}`, {
        credentials: "include",
      });
      const data = await res.json();
      setProducts(data.products || []);
      
      // Set pagination data
      if (data.pagination) {
        setTotalProducts(data.pagination.totalCount);
        setTotalPages(data.pagination.totalPages);
      }
      
      toast.success("Products refreshed successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to reload products";
      toast.error(errorMessage);
    } finally {
      setReloadingProducts(false);
    }
  };

  const reloadAll = async () => {
    try {
      setReloadingAll(true);
      const [uRes, oRes, pRes] = await Promise.all([
        fetch("/api/admin/users", {
          credentials: "include",
        }),
        fetch(`/api/admin/orders?page=${currentOrdersPage}&limit=${ordersPerPage}&sortBy=${ordersSortBy}&sortOrder=${ordersSortOrder}`, {
          credentials: "include",
        }),
        fetch(`/api/products?page=${currentPage}&limit=${productsPerPage}&sortBy=${sortBy}&sortOrder=${sortOrder}`, {
          credentials: "include",
        }),
      ]);

      const uData = await uRes.json();
      const oData = await oRes.json();
      const pData = await pRes.json();
      setUsers(uData.users || []);
      setOrders(oData.orders || []);
      setProducts(pData.products || []);
      
      // Set pagination data for products
      if (pData.pagination) {
        setTotalProducts(pData.pagination.totalCount);
        setTotalPages(pData.pagination.totalPages);
      }
      
      // Set pagination data for orders
      if (oData.pagination) {
        setTotalOrders(oData.pagination.totalCount);
        setTotalOrdersPages(oData.pagination.totalPages);
      }
      
      toast.success("All data refreshed successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to reload data";
      toast.error(errorMessage);
    } finally {
      setReloadingAll(false);
    }
  };

  const updateStatus = async (
    orderId: string,
    status: "pending" | "canceled" | "delivered"
  ) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update status";
      toast.error(errorMessage);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete order");
      setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
      toast.success("Order deleted");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete order";
      toast.error(errorMessage);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete user");
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success("User deleted");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete user";
      toast.error(errorMessage);
    }
  };

  const addProduct = async () => {
    if (!name || !price || !category || !image || !stockQuantity) {
      toast.error("Fill all required fields");
      return;
    }
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          price: Number(price),
          category,
          image,
          description: description.trim() || undefined,
          stockQuantity: Number(stockQuantity),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add product");
      toast.success("Product added");
      setName("");
      setPrice("");
      setCategory("cpu");
      setImage("");
      setDescription("");
      setStockQuantity("");
      await reloadProducts();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add product";
      toast.error(errorMessage);
    }
  };

  const deleteProduct = async (slug: string) => {
    try {
      const res = await fetch(`/api/admin/products/${slug}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete");
      setProducts((prev) => prev.filter((p) => p.slug !== slug));
      toast.success("Product deleted");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete product";
      toast.error(errorMessage);
    }
  };

  const updateProduct = async (slug: string, updates: Partial<{ name: string; price: number; category: string; image: string; description?: string; discountPercentage: number; stockQuantity: number }>) => {
    try {
      const res = await fetch(`/api/admin/products/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");
      setProducts((prev) => prev.map((p) => (p.slug === slug ? data.product : p)));
      toast.success("Product updated");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update product";
      toast.error(errorMessage);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/");
  };

  // Reset pagination when switching tabs
  const handleTabChange = (tab: 'overview' | 'users' | 'orders' | 'products') => {
    setActiveTab(tab);
    if (tab === 'products') {
      setCurrentPage(1);
    }
    if (tab === 'orders') {
      setCurrentOrdersPage(1);
    }
  };



  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      setImage(data.url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };



  if (loading)
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D3B66] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
        <Footer />
      </>
    );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Admin <span className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent">Dashboard</span>
              </h1>
              <p className="text-gray-600">Manage your ecommerce platform</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] rounded-xl flex items-center justify-center">
                  <FaUsers className="text-white text-xl" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] rounded-xl flex items-center justify-center">
                  <FaShoppingCart className="text-white text-xl" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Products</p>
                  <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] rounded-xl flex items-center justify-center">
                  <FaBox className="text-white text-xl" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">
                    रु{orders.reduce((sum, order) => sum + (order.grandTotal || 0), 0).toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl font-bold">रु</span>
                </div>
              </div>
            </div>
          </div>



          {/* Navigation Tabs */}
          <div className="bg-white rounded-2xl shadow-lg mb-8">
            <div className="flex border-b">
              {[
                { id: 'overview', label: 'Overview', icon: FaEye },
                { id: 'users', label: 'Users', icon: FaUsers },
                { id: 'orders', label: 'Orders', icon: FaShoppingCart },
                { id: 'products', label: 'Products', icon: FaBox }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleTabChange(id as 'overview' | 'users' | 'orders' | 'products')}
                  className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-colors ${
                    activeTab === id
                      ? 'text-[#0D3B66] border-b-2 border-[#0D3B66]'
                      : 'text-gray-600 hover:text-[#0D3B66]'
                  }`}
                >
                  <Icon />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Sections */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Overview Header */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-b flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Dashboard Overview</h3>
                <button
                  onClick={reloadAll}
                  className="text-gray-600 hover:text-[#0D3B66] transition-colors"
                  disabled={reloadingAll}
                >
                  {reloadingAll ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                  ) : (
                    <FaSync />
                  )}
                </button>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h3>
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.orderId} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-semibold">{order.username}</p>
                        <p className="text-sm text-gray-600">रु{order.grandTotal?.toFixed(2)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Products */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Products</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {products.slice(0, 6).map((product) => (
                    <div key={product.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-semibold text-sm">{product.name}</p>
                        <p className="text-sm text-gray-600">रु{product.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">User Management</h3>
                <button
                  onClick={reloadUsers}
                  className="text-gray-600 hover:text-[#0D3B66] transition-colors"
                  disabled={reloadingUsers}
                >
                  {reloadingUsers ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                  ) : (
                    <FaSync />
                  )}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-900">Username</th>
                      <th className="text-left p-4 font-semibold text-gray-900">Email</th>
                      <th className="text-right p-4 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-t hover:bg-gray-50">
                        <td className="p-4">{user.username}</td>
                        <td className="p-4">{user.email}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => deleteUser(user._id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2 mx-auto"
                          >
                            <FaTrash />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border-b">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Order Management</h3>
                    <p className="text-sm text-gray-600 mt-1">Total Orders: {totalOrders}</p>
                  </div>
                  <button
                    onClick={reloadOrders}
                    className="text-gray-600 hover:text-[#0D3B66] transition-colors"
                    disabled={reloadingOrders}
                  >
                    {reloadingOrders ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                    ) : (
                      <FaSync />
                    )}
                  </button>
                </div>
                
                {/* Pagination and Sorting Controls for Orders */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Show:</label>
                      <select
                        value={ordersPerPage}
                        onChange={(e) => {
                          setOrdersPerPage(Number(e.target.value));
                          setCurrentOrdersPage(1); // Reset to first page
                        }}
                        className="border rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-sm text-gray-600">per page</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Sort by:</label>
                      <select
                        value={ordersSortBy}
                        onChange={(e) => {
                          setOrdersSortBy(e.target.value);
                          setCurrentOrdersPage(1); // Reset to first page
                        }}
                        className="border rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent"
                      >
                        <option value="createdAt">Date Created</option>
                        <option value="grandTotal">Total Amount</option>
                        <option value="status">Status</option>
                        <option value="customer.name">Customer Name</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Order:</label>
                      <select
                        value={ordersSortOrder}
                        onChange={(e) => {
                          setOrdersSortOrder(e.target.value);
                          setCurrentOrdersPage(1); // Reset to first page
                        }}
                        className="border rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent"
                      >
                        <option value="desc">Latest First</option>
                        <option value="asc">Oldest First</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              {orders.map((order) => (
                <div key={order.orderId} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">{order.username}</h4>
                      <p className="text-gray-600">{order.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Order Items */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Ordered Items:</p>
                    <div className="space-y-2">
                      {order.items.map((item, index) => {
                        // Use product details from the order item itself (stored when order was created)
                        const hasProductDetails = item.name && item.image && item.price;
                        
                        return hasProductDetails ? (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Image
                              src={item.image!}
                              alt={item.name!}
                              width={48}
                              height={48}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{item.name}</p>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                              <p className="text-sm text-gray-600">रु{item.price!.toFixed(2)} each</p>
                            </div>
                          </div>
                        ) : (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Product details not available (ID: {item.productId})</p>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">{order.customer?.address?.street}, {order.customer?.address?.city}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="font-bold text-lg text-[#0D3B66]">रु{order.grandTotal?.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <StatusDropdown
                      currentStatus={order.status}
                      orderId={order.orderId}
                      onStatusChange={updateStatus}
                    />
                    <button
                      onClick={() => deleteOrder(order.orderId)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                    >
                      <FaTrash />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Pagination Controls for Orders */}
              {totalOrdersPages > 1 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {((currentOrdersPage - 1) * ordersPerPage) + 1} to {Math.min(currentOrdersPage * ordersPerPage, totalOrders)} of {totalOrders} orders
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentOrdersPage(currentOrdersPage - 1)}
                        disabled={currentOrdersPage === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {/* Page Numbers */}
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalOrdersPages) }, (_, i) => {
                          let pageNum;
                          if (totalOrdersPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentOrdersPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentOrdersPage >= totalOrdersPages - 2) {
                            pageNum = totalOrdersPages - 4 + i;
                          } else {
                            pageNum = currentOrdersPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentOrdersPage(pageNum)}
                              className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                currentOrdersPage === pageNum
                                  ? 'bg-[#0D3B66] text-white'
                                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => setCurrentOrdersPage(currentOrdersPage + 1)}
                        disabled={currentOrdersPage === totalOrdersPages}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-8">
              {/* Products Table */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Product Management</h3>
                      <p className="text-sm text-gray-600 mt-1">Total Products: {totalProducts}</p>
                    </div>
                    <button
                      onClick={reloadProducts}
                      className="text-gray-600 hover:text-[#0D3B66] transition-colors"
                      disabled={reloadingProducts}
                    >
                      {reloadingProducts ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                      ) : (
                        <FaSync />
                      )}
                    </button>
                  </div>
                  
                  {/* Pagination and Sorting Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">Show:</label>
                        <select
                          value={productsPerPage}
                          onChange={(e) => {
                            setProductsPerPage(Number(e.target.value));
                            setCurrentPage(1); // Reset to first page
                          }}
                          className="border rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                        <span className="text-sm text-gray-600">per page</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">Sort by:</label>
                        <select
                          value={sortBy}
                          onChange={(e) => {
                            setSortBy(e.target.value);
                            setCurrentPage(1); // Reset to first page
                          }}
                          className="border rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent"
                        >
                          <option value="createdAt">Date Created</option>
                          <option value="name">Name</option>
                          <option value="price">Price</option>
                          <option value="category">Category</option>
                          <option value="stockQuantity">Stock</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">Order:</label>
                        <select
                          value={sortOrder}
                          onChange={(e) => {
                            setSortOrder(e.target.value);
                            setCurrentPage(1); // Reset to first page
                          }}
                          className="border rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent"
                        >
                          <option value="desc">Latest First</option>
                          <option value="asc">Oldest First</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-900">Image</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Name</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Category</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Description</th>
                        <th className="text-right p-4 font-semibold text-gray-900">Price</th>
                        <th className="text-center p-4 font-semibold text-gray-900">Discount %</th>
                        <th className="text-center p-4 font-semibold text-gray-900">Stock</th>
                        <th className="text-right p-4 font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-t hover:bg-gray-50">
                          <td className="p-4">
                            <Image 
                              src={product.image} 
                              alt={product.name} 
                              width={64}
                              height={64}
                              className="w-16 h-16 object-cover rounded-lg" 
                            />
                          </td>
                          <td className="p-4">
                            <input
                              defaultValue={product.name}
                              onBlur={(e) => updateProduct(product.slug, { name: e.target.value })}
                              className="border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent"
                            />
                          </td>
                          <td className="p-4">
                            <select
                              defaultValue={product.category}
                              onChange={(e) => updateProduct(product.slug, { category: e.target.value })}
                              className="border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent"
                            >
                              <option value="cpu">CPU</option>
                              <option value="keyboard">Keyboard</option>
                              <option value="monitor">Monitor</option>
                              <option value="speaker">Speaker</option>
                              <option value="mouse">Mouse</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <textarea
                              defaultValue={product.description || ""}
                              onBlur={(e) => updateProduct(product.slug, { description: e.target.value.trim() || undefined })}
                              rows={3}
                              className="border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent w-full resize-none text-sm"
                              placeholder="No description"
                            />
                          </td>
                          <td className="p-4 text-right">
                            <input
                              type="number"
                              step="0.01"
                              defaultValue={product.price}
                              onBlur={(e) => updateProduct(product.slug, { price: Number(e.target.value) })}
                              className="border rounded-lg px-3 py-2 w-32 text-right bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              defaultValue={product.discountPercentage || 0}
                              onBlur={(e) => updateProduct(product.slug, { discountPercentage: Number(e.target.value) })}
                              className="border rounded-lg px-3 py-2 w-20 text-center bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex flex-col items-center">
                              <input
                                type="number"
                                min="0"
                                defaultValue={product.stockQuantity}
                                onBlur={(e) => updateProduct(product.slug, { stockQuantity: Number(e.target.value) })}
                                className="border rounded-lg px-3 py-2 w-20 text-center bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent"
                              />
                              <span className={`text-xs mt-1 px-2 py-1 rounded-full font-medium ${
                                product.stockQuantity === 0 
                                  ? 'bg-red-100 text-red-800' 
                                  : product.stockQuantity <= 5 
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {product.stockQuantity === 0 ? 'Out of Stock' : 
                                 product.stockQuantity <= 5 ? 'Low Stock' : 'In Stock'}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => deleteProduct(product.slug)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                            >
                              <FaTrash />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="p-6 border-t bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing {((currentPage - 1) * productsPerPage) + 1} to {Math.min(currentPage * productsPerPage, totalProducts)} of {totalProducts} products
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        
                        {/* Page Numbers */}
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                  currentPage === pageNum
                                    ? 'bg-[#0D3B66] text-white'
                                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>
                        
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Add Product Section */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                  <FaPlus className="text-[#0D3B66]" />
                  <span>Add New Product</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    placeholder="Product Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent"
                  />
                  <input
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="border rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent"
                  />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="border rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent"
                  >
                    <option value="cpu">CPU</option>
                    <option value="keyboard">Keyboard</option>
                    <option value="monitor">Monitor</option>
                    <option value="speaker">Speaker</option>
                    <option value="mouse">Mouse</option>
                  </select>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      className="border rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent w-full"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Description
                    </label>
                    <textarea
                      placeholder="Enter product description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="border rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent w-full resize-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="border rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent w-full"
                      disabled={uploading}
                    />
                  </div>

                  {image && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image Preview
                      </label>
                      <Image
                        src={image}
                        alt="Uploaded preview"
                        width={200}
                        height={200}
                        className="w-48 h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <button
                      onClick={addProduct}
                      disabled={uploading}
                      className="w-full bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-6 py-3 rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <FaPlus />
                          <span>Add Product</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}