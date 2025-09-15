"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaUsers, FaShoppingCart, FaBox, FaPlus, FaTrash, FaSignOutAlt, FaEye, FaSync } from "react-icons/fa";
import AdminHeader from "@/components/layout/AdminHeader";
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
  status: "pending" | "processing" | "shipped" | "out-for-delivery" | "delivered" | "returned" | "canceled";
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
  const [productsPerPage, setProductsPerPage] = useState(5);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination state for orders
  const [currentOrdersPage, setCurrentOrdersPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(5);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalOrdersPages, setTotalOrdersPages] = useState(0);
  const [ordersSortBy, setOrdersSortBy] = useState('createdAt');
  const [ordersSortOrder, setOrdersSortOrder] = useState('desc');
  
  // Pagination state for users
  const [currentUsersPage, setCurrentUsersPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(5);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalUsersPages, setTotalUsersPages] = useState(0);
  const [usersSortBy, setUsersSortBy] = useState('createdAt');
  const [usersSortOrder, setUsersSortOrder] = useState('desc');
  
  // Order filtering
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'others'>('all');
  
  // Product search
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [searchedProducts, setSearchedProducts] = useState<typeof products>([]);
  
  // Individual order expansion state
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  
  // Toggle individual order expansion
  const toggleOrderExpansion = (orderId: string) => {
    const newExpandedOrders = new Set(expandedOrders);
    if (newExpandedOrders.has(orderId)) {
      newExpandedOrders.delete(orderId);
    } else {
      newExpandedOrders.add(orderId);
    }
    setExpandedOrders(newExpandedOrders);
  };

  const router = useRouter();
  
  // Filter orders based on status filter
  const filteredOrders = orders.filter(order => {
    if (orderStatusFilter === 'all') return true;
    if (orderStatusFilter === 'pending') return order.status === 'pending';
    if (orderStatusFilter === 'others') return order.status !== 'pending';
    return true;
  });
  
  // Search products function
  const searchProducts = async () => {
    if (!productSearchTerm.trim()) {
      setSearchedProducts([]);
      return;
    }
    
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(productSearchTerm)}`, {
        credentials: "include",
      });
      const data = await res.json();
      setSearchedProducts(data.products || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchedProducts([]);
    }
  };
  
  // Get displayed products (search results or regular products)
  const displayedProducts = productSearchTerm.trim() ? searchedProducts : products;

  useEffect(() => {
    const load = async () => {
      try {
        const [uRes, oRes, pRes] = await Promise.all([
          fetch(`/api/admin/users?page=${currentUsersPage}&limit=${usersPerPage}&sortBy=${usersSortBy}&sortOrder=${usersSortOrder}`, {
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
        
        // Set pagination data for users
        if (uData.pagination) {
          setTotalUsers(uData.pagination.totalCount);
          setTotalUsersPages(uData.pagination.totalPages);
        }
        
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
  }, [currentPage, productsPerPage, sortBy, sortOrder, currentOrdersPage, ordersPerPage, ordersSortBy, ordersSortOrder, currentUsersPage, usersPerPage, usersSortBy, usersSortOrder]);

  const reloadUsers = async () => {
    try {
      setReloadingUsers(true);
      const res = await fetch(`/api/admin/users?page=${currentUsersPage}&limit=${usersPerPage}&sortBy=${usersSortBy}&sortOrder=${usersSortOrder}`, {
        credentials: "include",
      });
      const data = await res.json();
      setUsers(data.users || []);
      
      // Set pagination data for users
      if (data.pagination) {
        setTotalUsers(data.pagination.totalCount);
        setTotalUsersPages(data.pagination.totalPages);
      }
      
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
        fetch(`/api/admin/users?page=${currentUsersPage}&limit=${usersPerPage}&sortBy=${usersSortBy}&sortOrder=${usersSortOrder}`, {
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
      
      // Set pagination data for users
      if (uData.pagination) {
        setTotalUsers(uData.pagination.totalCount);
        setTotalUsersPages(uData.pagination.totalPages);
      }
      
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
    status: "pending" | "processing" | "shipped" | "out-for-delivery" | "delivered" | "returned" | "canceled"
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
    if (tab === 'users') {
      setCurrentUsersPage(1);
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
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'out-for-delivery': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'returned': return 'bg-orange-100 text-orange-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };



  if (loading)
    return (
      <>
        <AdminHeader />
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
      {/* Custom CSS Animations */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes expandHeight {
          from {
            max-height: 80px;
            opacity: 0.8;
          }
          to {
            max-height: 1000px;
            opacity: 1;
          }
        }
        
        @keyframes collapseHeight {
          from {
            max-height: 1000px;
            opacity: 1;
          }
          to {
            max-height: 80px;
            opacity: 0.8;
          }
        }
        
        .order-expand {
          animation: expandHeight 0.5s ease-out forwards;
        }
        
        .order-collapse {
          animation: collapseHeight 0.5s ease-out forwards;
        }
      `}</style>
      <AdminHeader />
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
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border-b">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">User Management</h3>
                    <p className="text-sm text-gray-600 mt-1">Total Users: {totalUsers}</p>
                  </div>
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
                
                {/* Pagination and Sorting Controls for Users */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Show:</label>
                      <select
                        value={usersPerPage}
                        onChange={(e) => {
                          setUsersPerPage(Number(e.target.value));
                          setCurrentUsersPage(1); // Reset to first page
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
                        value={usersSortBy}
                        onChange={(e) => {
                          setUsersSortBy(e.target.value);
                          setCurrentUsersPage(1); // Reset to first page
                        }}
                        className="border rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent"
                      >
                        <option value="createdAt">Date Created</option>
                        <option value="username">Username</option>
                        <option value="email">Email</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Order:</label>
                      <select
                        value={usersSortOrder}
                        onChange={(e) => {
                          setUsersSortOrder(e.target.value);
                          setCurrentUsersPage(1); // Reset to first page
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
              
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
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
              
              {/* Pagination Controls for Users */}
              {totalUsersPages > 1 && (
                <div className="p-6 border-t bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {((currentUsersPage - 1) * usersPerPage) + 1} to {Math.min(currentUsersPage * usersPerPage, totalUsers)} of {totalUsers} users
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentUsersPage(currentUsersPage - 1)}
                        disabled={currentUsersPage === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {/* Page Numbers */}
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalUsersPages) }, (_, i) => {
                          let pageNum;
                          if (totalUsersPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentUsersPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentUsersPage >= totalUsersPages - 2) {
                            pageNum = totalUsersPages - 4 + i;
                          } else {
                            pageNum = currentUsersPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentUsersPage(pageNum)}
                              className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                currentUsersPage === pageNum
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
                        onClick={() => setCurrentUsersPage(currentUsersPage + 1)}
                        disabled={currentUsersPage === totalUsersPages}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-8">
              {/* Header Section with Gradient */}
              <div className="bg-gradient-to-r from-[#0D3B66] via-[#1E5CAF] to-[#2E7DD2] rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute -top-4 -right-4 w-32 h-32 bg-white rounded-full"></div>
                  <div className="absolute top-10 -left-8 w-24 h-24 bg-white rounded-full"></div>
                  <div className="absolute bottom-4 right-20 w-16 h-16 bg-white rounded-full"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-3xl font-bold mb-2 flex items-center space-x-3">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                          <FaShoppingCart className="text-2xl" />
                        </div>
                        <span>Order Command Center</span>
                      </h3>
                      <p className="text-white/80 text-lg">
                        Manage and track all customer orders
                      </p>
                    </div>
                    <button
                      onClick={reloadOrders}
                      className="group p-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-300 transform hover:scale-105"
                      disabled={reloadingOrders}
                      title="Refresh orders"
                    >
                      {reloadingOrders ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <FaSync className="text-xl group-hover:rotate-180 transition-transform duration-500" />
                      )}
                    </button>
                  </div>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-2xl font-bold">{totalOrders}</div>
                      <div className="text-white/80 text-sm">Total Orders</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-2xl font-bold text-yellow-300">{orders.filter(o => o.status === 'pending').length}</div>
                      <div className="text-white/80 text-sm">Pending</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-2xl font-bold text-green-300">{orders.filter(o => o.status === 'delivered').length}</div>
                      <div className="text-white/80 text-sm">Delivered</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-2xl font-bold text-emerald-300">
                        रु{orders.reduce((sum, order) => sum + (order.grandTotal || 0), 0).toFixed(0)}
                      </div>
                      <div className="text-white/80 text-sm">Total Revenue</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Advanced Controls Panel */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center space-x-6">
                    {/* Items per page */}
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] rounded-lg">
                        <FaEye className="text-white text-sm" />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Show</label>
                        <select
                          value={ordersPerPage}
                          onChange={(e) => {
                            setOrdersPerPage(Number(e.target.value));
                            setCurrentOrdersPage(1);
                          }}
                          className="ml-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all duration-200 hover:border-[#1E5CAF]"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                        <span className="text-sm text-gray-500 ml-1">orders</span>
                      </div>
                    </div>
                    
                    {/* Status Filter */}
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Filter</label>
                        <select
                          value={orderStatusFilter}
                          onChange={(e) => {
                            setOrderStatusFilter(e.target.value as 'all' | 'pending' | 'others');
                          }}
                          className="ml-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-pink-500"
                        >
                          <option value="all">All Orders</option>
                          <option value="pending">🟡 Pending Only</option>
                          <option value="others">🔄 Others (Non-Pending)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    {/* Sort By */}
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                        <div className="w-4 h-4 bg-white rounded-sm transform rotate-45"></div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Sort by</label>
                        <select
                          value={ordersSortBy}
                          onChange={(e) => {
                            setOrdersSortBy(e.target.value);
                            setCurrentOrdersPage(1);
                          }}
                          className="ml-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 hover:border-teal-500"
                        >
                          <option value="createdAt">📅 Date Created</option>
                          <option value="grandTotal">💰 Total Amount</option>
                          <option value="status">⚡ Status</option>
                          <option value="customer.name">👤 Customer Name</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Sort Order */}
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                        <div className="w-4 h-4 bg-white transform rotate-12">
                          <div className="w-full h-0.5 bg-orange-500 mt-1.5"></div>
                          <div className="w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-orange-500 ml-auto mr-1 -mt-1"></div>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Order</label>
                        <select
                          value={ordersSortOrder}
                          onChange={(e) => {
                            setOrdersSortOrder(e.target.value);
                            setCurrentOrdersPage(1);
                          }}
                          className="ml-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-red-500"
                        >
                          <option value="desc">📈 Latest First</option>
                          <option value="asc">📉 Oldest First</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Cool Empty State */}
              {filteredOrders.length === 0 ? (
                <div className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 rounded-3xl shadow-xl border border-gray-200/50 p-12 text-center">
                  <div className="max-w-md mx-auto">
                    {/* Animated Icon */}
                    <div className="relative mb-8">
                      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-inner">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#0D3B66] to-[#1E5CAF] rounded-2xl flex items-center justify-center transform rotate-12 shadow-lg">
                          <FaShoppingCart className="text-white text-2xl" />
                        </div>
                      </div>
                      {/* Floating elements */}
                      <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce opacity-70"></div>
                      <div className="absolute -bottom-2 -left-6 w-6 h-6 bg-pink-400 rounded-full animate-pulse opacity-60"></div>
                      <div className="absolute top-8 -left-8 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-50"></div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {orderStatusFilter === 'pending' ? 'No Pending Orders' : 
                       orderStatusFilter === 'others' ? 'No Other Orders' : 
                       'No Orders Found'}
                    </h3>
                    <p className="text-gray-600 text-lg mb-6">
                      {orderStatusFilter === 'pending' ? 'All caught up! No pending orders to process.' : 
                       orderStatusFilter === 'others' ? 'Only pending orders are available.' : 
                       'Orders will appear here once customers start placing them.'}
                    </p>
                    
                    {orderStatusFilter !== 'all' && (
                      <button
                        onClick={() => setOrderStatusFilter('all')}
                        className="px-8 py-4 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto"
                      >
                        <span>🔄</span>
                        <span>Show All Orders</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {filteredOrders.map((order, index) => {
                    const isExpanded = expandedOrders.has(order.orderId);
                    
                    return (
                <div 
                  key={order.orderId} 
                  className="group bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-200/50 hover:shadow-2xl hover:border-[#0D3B66]/30 transition-all duration-500 transform hover:-translate-y-1 relative overflow-hidden animate-fade-in-up p-6"
                  style={{ 
                    animationDelay: `${index * 150}ms`,
                    opacity: 0,
                    animation: `fadeInUp 0.8s ease-out ${index * 150}ms forwards`
                  }}
                >
                  {/* Gradient overlay */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#0D3B66]/10 to-transparent rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                  
                  {/* Compact Header - Always Visible */}
                  <div className="relative z-10 flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="p-3 bg-gradient-to-br from-[#0D3B66] to-[#1E5CAF] rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <FaUsers className="text-white text-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-xl font-bold text-gray-900 group-hover:text-[#0D3B66] transition-colors duration-300">
                            {order.username}
                          </h4>
                          <span className={`px-3 py-1 rounded-xl text-xs font-bold shadow-md ${getStatusColor(order.status)}`}>
                            {order.status === 'out-for-delivery' ? 'Out for Delivery' : 
                             order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <span>🎯</span>
                            <span>#{order.orderId.slice(-6).toUpperCase()}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <span>📦</span>
                            <span>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                          </span>
                          <span>•</span>
                          <span className="font-bold text-[#0D3B66]">रु{order.grandTotal?.toFixed(2)}</span>
                          <span>•</span>
                          <span className="text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleOrderExpansion(order.orderId)}
                      className={`p-3 rounded-xl font-bold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
                        isExpanded 
                          ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700' 
                          : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                      }`}
                      title={isExpanded ? 'Collapse details' : 'Expand details'}
                    >
                      {isExpanded ? (
                        <>
                          <span className="text-sm hidden sm:inline">Collapse</span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm hidden sm:inline">Expand</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Expandable Details Section */}
                  {isExpanded && (
                    <div className="mt-4 space-y-6 animate-fade-in-up">
                      {/* Order Items with Premium Styling */}
                      <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                            <FaBox className="text-white text-lg" />
                          </div>
                          <h5 className="text-lg font-bold text-gray-800">Order Items</h5>
                      <div className="h-px bg-gradient-to-r from-gray-300 to-transparent flex-1"></div>
                      <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {order.items.map((item, index) => {
                        const hasProductDetails = item.name && item.image && item.price;
                        
                        return (
                          <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 hover:border-indigo-300 transition-all duration-300 transform hover:scale-105 group">
                            <div className="flex items-center space-x-4">
                              {hasProductDetails && item.image ? (
                                <div className="relative">
                                  <Image
                                    src={item.image}
                                    alt={item.name!}
                                    width={60}
                                    height={60}
                                    className="w-15 h-15 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300"
                                  />
                                  <div className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                    {item.quantity}
                                  </div>
                                </div>
                              ) : (
                                <div className="relative">
                                  <div className="w-15 h-15 bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl shadow-md flex items-center justify-center group-hover:shadow-lg transition-shadow duration-300">
                                    <FaBox className="text-gray-600 text-lg" />
                                  </div>
                                  <div className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                    {item.quantity}
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors duration-300">
                                  {item.name || `Product #${item.productId.slice(-6)}`}
                                </p>
                                <div className="flex items-center justify-between mt-1">
                                  <p className="text-sm text-gray-600 flex items-center space-x-1">
                                    <span>📦</span>
                                    <span>Qty: {item.quantity}</span>
                                  </p>
                                  {item.price && (
                                    <div className="text-right">
                                      <p className="text-sm text-gray-600">रु{item.price.toFixed(2)} each</p>
                                      <p className="font-bold text-[#0D3B66] text-lg">
                                        रु{(item.price * item.quantity).toFixed(2)}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Summary & Actions */}
                  <div className="relative z-10 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-2xl p-6 border border-gray-200/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Delivery Information */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                            <span className="text-white text-lg">🚚</span>
                          </div>
                          <h6 className="font-bold text-gray-800">Delivery Address</h6>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/30">
                          <p className="font-medium text-gray-900 flex items-center space-x-2">
                            <span>📍</span>
                            <span>{order.customer?.address?.street}</span>
                          </p>
                          <p className="text-gray-600 ml-6">{order.customer?.address?.city}</p>
                        </div>
                      </div>
                      
                      {/* Order Financial Summary */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                            <span className="text-white text-lg">💰</span>
                          </div>
                          <h6 className="font-bold text-gray-800">Order Summary</h6>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/30 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium">रु{order.subtotal?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Delivery:</span>
                            <span className="font-medium">रु{order.deliveryFee?.toFixed(2)}</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between items-center">
                            <span className="font-bold text-gray-900">Grand Total:</span>
                            <span className="font-bold text-2xl bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent">
                              रु{order.grandTotal?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200/50">
                      <div className="flex-1">
                        <StatusDropdown
                          currentStatus={order.status}
                          orderId={order.orderId}
                          onStatusChange={updateStatus}
                        />
                      </div>
                      <button
                        onClick={() => deleteOrder(order.orderId)}
                        className="group px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                      >
                        <FaTrash className="group-hover:animate-bounce" />
                        <span>Delete Order</span>
                      </button>
                    </div>
                  </div>
                    </div>
                  )}
                </div>
                    );
                  })}
                </>
              )}
              
              {/* Premium Pagination Controls */}
              {totalOrdersPages > 1 && (
                <div className="bg-gradient-to-r from-white via-blue-50/30 to-white backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200/50 p-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Pagination Info */}
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] rounded-2xl shadow-lg">
                        <span className="text-white text-lg font-bold">#</span>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">
                          Page {currentOrdersPage} of {totalOrdersPages}
                        </p>
                        <p className="text-sm text-gray-600">
                          Showing {((currentOrdersPage - 1) * ordersPerPage) + 1}-{Math.min(currentOrdersPage * ordersPerPage, totalOrders)} of {totalOrders} orders
                        </p>
                      </div>
                    </div>
                    
                    {/* Pagination Buttons */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setCurrentOrdersPage(currentOrdersPage - 1)}
                        disabled={currentOrdersPage === 1}
                        className="group px-6 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl font-bold text-gray-700 hover:border-[#0D3B66] hover:text-[#0D3B66] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                      >
                        <span className="text-lg group-hover:-translate-x-1 transition-transform duration-300">←</span>
                        <span>Previous</span>
                      </button>
                      
                      {/* Page Numbers with Cool Design */}
                      <div className="flex items-center space-x-2">
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
                              className={`w-12 h-12 rounded-2xl font-bold transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl ${
                                currentOrdersPage === pageNum
                                  ? 'bg-gradient-to-br from-[#0D3B66] to-[#1E5CAF] text-white shadow-2xl scale-110'
                                  : 'bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 hover:border-[#0D3B66] hover:text-[#0D3B66]'
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
                        className="group px-6 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl font-bold text-gray-700 hover:border-[#0D3B66] hover:text-[#0D3B66] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                      >
                        <span>Next</span>
                        <span className="text-lg group-hover:translate-x-1 transition-transform duration-300">→</span>
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
                      
                      {/* Admin Search Bar */}
                      <div className="mt-4 flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Search products by name, category, or slug..."
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && searchProducts()}
                          className="flex-1 max-w-md border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent"
                        />
                        <button
                          onClick={searchProducts}
                          className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-4 py-2 rounded-lg font-medium hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all duration-200"
                        >
                          Search
                        </button>
                        {productSearchTerm.trim() && (
                          <button
                            onClick={() => {
                              setProductSearchTerm('');
                              setSearchedProducts([]);
                            }}
                            className="text-gray-600 hover:text-gray-800 px-2 py-2"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      
                      {productSearchTerm.trim() && (
                        <p className="text-sm text-gray-600 mt-2">
                          Search results for &ldquo;{productSearchTerm}&rdquo;: {searchedProducts.length} products found
                        </p>
                      )}
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
                      {displayedProducts.map((product) => (
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