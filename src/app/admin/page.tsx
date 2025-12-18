"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaUsers,
  FaShoppingCart,
  FaBox,
  FaTrash,
  FaSignOutAlt,
  FaEye,
  FaSync,
  FaUndo,
  FaTags,
  FaStar,
  FaComment,
  FaQuestionCircle,
} from "react-icons/fa";
import AdminHeader from "@/components/layout/AdminHeader";
import StatusDropdown from "@/components/StatusDropdown";
import AdminReturnsSection from "@/components/admin/AdminReturnsSection";
import DragDropUpload from "@/components/DragDropUpload";
import MultipleImagesUpload from "@/components/MultipleImagesUpload";
import dynamic from "next/dynamic";
import { IInquiry } from "@/lib/firebase-models";

// Dynamically import QuillEditor to avoid SSR issues
const QuillEditor = dynamic(() => import("@/components/QuillEditor"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-200 rounded mb-2"></div>
      <div className="h-72 bg-gray-200 rounded"></div>
    </div>
  ),
});

// Dynamically import InlineQuillEditor for editing descriptions
const InlineQuillEditor = dynamic(
  () => import("@/components/InlineQuillEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse">
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    ),
  }
);

interface User {
  _id: string;
  username: string;
  email: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

// Collapsible cell for long descriptions in categories table
function CategoryDescriptionCell({ description }: { description?: string }) {
  const [expanded, setExpanded] = React.useState(false);
  if (!description || description.trim().length === 0) {
    return <span className="text-gray-400">No description</span>;
  }
  const isLong = description.length > 120;
  const shown =
    expanded || !isLong ? description : description.slice(0, 120) + "…";
  return (
    <div className="space-y-1">
      <div className={expanded ? "" : "line-clamp-3"}>{shown}</div>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

// Collapsible editor for product descriptions
function ProductDescriptionSection({
  productId,
  productSlug,
  description,
  onSave,
}: {
  productId: string;
  productSlug: string;
  description?: string;
  onSave: (content: string) => void;
}) {
  const [expanded, setExpanded] = React.useState(false);

  const getPlainText = (html: string) =>
    html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const plain = description ? getPlainText(description) : "";
  const isLong = plain.length > 160;
  const preview = isLong ? plain.slice(0, 160) + "…" : plain;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-gray-700 block">
          Description
        </label>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {expanded ? "Minimize" : isLong ? "Show more" : "Edit"}
        </button>
      </div>

      {expanded ? (
        <InlineQuillEditor
          key={`desc-${productId}-${productSlug}`}
          initialValue={description || ""}
          onSave={(content) => onSave(content)}
          placeholder="Click to add product description..."
          className="w-full bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl p-2"
        />
      ) : (
        <div className="w-full bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl p-3 text-sm text-gray-700">
          {preview || "No description"}
        </div>
      )}
    </div>
  );
}

interface Order {
  orderId: string;
  userId: string;
  username: string;
  email: string;
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "out-for-delivery"
    | "delivered"
    | "returned"
    | "canceled";
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
  const [products, setProducts] = useState<
    {
      id: string;
      slug: string;
      name: string;
      price: number;
      category: string;
      image: string;
      description?: string;
      discountPercentage?: number;
      stockQuantity: number;
    }[]
  >([]);

  const [allProducts, setAllProducts] = useState<
    {
      id: string;
      slug: string;
      name: string;
      price: number;
      category: string;
      image: string;
      description?: string;
      discountPercentage?: number;
      stockQuantity: number;
    }[]
  >([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("cpu");
  const [image, setImage] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [reloadingUsers, setReloadingUsers] = useState(false);
  const [reloadingOrders, setReloadingOrders] = useState(false);
  const [reloadingProducts, setReloadingProducts] = useState(false);
  const [reloadingAll, setReloadingAll] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "users"
    | "orders"
    | "products"
    | "returns"
    | "categories"
    | "reviews"
    | "chat"
    | "inquiries"
    >("overview");
  
    const [categories, setCategories] = useState<Category[]>([]);
    const [currentCategoriesPage, setCurrentCategoriesPage] = useState(1);
    const [categoriesPerPage, setCategoriesPerPage] = useState(5);
    const [totalCategories, setTotalCategories] = useState(0);
    const [totalCategoriesPages, setTotalCategoriesPages] = useState(0);
    const [categoriesSortBy, setCategoriesSortBy] = useState("createdAt");
    const [categoriesSortOrder, setCategoriesSortOrder] = useState("desc");
    const [reloadingCategories, setReloadingCategories] = useState(false);
  
    const [categoryName, setCategoryName] = useState("");
    const [categoryDescription, setCategoryDescription] = useState("");
    const [categoryImage, setCategoryImage] = useState("");
    const [uploadingCategoryImage, setUploadingCategoryImage] = useState(false);
  
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
    const [availableCategories, setAvailableCategories] = useState<Category[]>([]
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(4);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [currentOrdersPage, setCurrentOrdersPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(5);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalOrdersPages, setTotalOrdersPages] = useState(0);
  const [ordersSortBy, setOrdersSortBy] = useState("createdAt");
  const [ordersSortOrder, setOrdersSortOrder] = useState("desc");

  const [currentUsersPage, setCurrentUsersPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(5);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalUsersPages, setTotalUsersPages] = useState(0);
  const [usersSortBy, setUsersSortBy] = useState("createdAt");
  const [usersSortOrder, setUsersSortOrder] = useState("desc");

  const [orderStatusFilter, setOrderStatusFilter] = useState<
    "all" | "pending" | "others"
  >("all");

  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [searchedProducts, setSearchedProducts] = useState<typeof products>([]);

  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleOrderExpansion = (orderId: string) => {
    const newExpandedOrders = new Set(expandedOrders);
    if (newExpandedOrders.has(orderId)) {
      newExpandedOrders.delete(orderId);
    } else {
      newExpandedOrders.add(orderId);
    }
    setExpandedOrders(newExpandedOrders);
  };

  const [returnRequests, setReturnRequests] = useState<
    {
      id: string;
      orderId: string;
      userId: string;
      items: {
        productId: string;
        quantity: number;
        name?: string;
        image?: string;
        price?: number;
      }[];
      reason: string;
      description?: string;
      images?: string[];
      status: "pending" | "approved" | "rejected" | "completed" | "refunded";
      adminNote?: string;
      requestedAt: Date;
      processedAt?: Date;
      refundAmount?: number;
      refundMethod?: "original" | "store-credit";
      orderDetails?: {
        orderNumber: string;
        grandTotal: number;
        customer: { name: string; email: string };
      };
      userDetails?: {
        username: string;
      };
    }[]
  >([]);
  const [currentReturnsPage, setCurrentReturnsPage] = useState(1);
  const [returnsPerPage, setReturnsPerPage] = useState(5);
  const [totalReturns, setTotalReturns] = useState(0);
  const [totalReturnsPages, setTotalReturnsPages] = useState(0);
  const [returnsSortBy, setReturnsSortBy] = useState("requestedAt");
  const [returnsSortOrder, setReturnsSortOrder] = useState("desc");
  const [returnsStatusFilter, setReturnsStatusFilter] = useState("all");
  const [reloadingReturns, setReloadingReturns] = useState(false);
  const [expandedReturns, setExpandedReturns] = useState<Set<string>>(
    new Set()
  );

  const [inquiries, setInquiries] = useState<(IInquiry & { id: string })[]>([]);
  const [currentInquiriesPage, setCurrentInquiriesPage] = useState(1);
  const [inquiriesPerPage] = useState(10);
  const [totalInquiries, setTotalInquiries] = useState(0);
  const [totalInquiriesPages, setTotalInquiriesPages] = useState(0);
  const [inquiriesSortBy] = useState("createdAt");
  const [inquiriesSortOrder] = useState("desc");
  const [inquiriesStatusFilter] = useState("all");
  const [reloadingInquiries, setReloadingInquiries] = useState(false);

  const [reviews, setReviews] = useState<
    {
      id: string;
      productId: string;
      userId: string;
      userName: string;
      userEmail: string;
      rating: number;
      comment: string;
      createdAt: string | Date;
      isVerifiedPurchase?: boolean;
    }[]
  >([]);
  const [currentReviewsPage, setCurrentReviewsPage] = useState(1);
  const [reviewsPerPage] = useState(5);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalReviewsPages, setTotalReviewsPages] = useState(0);
  const [reviewsSortBy] = useState("createdAt");
  const [reviewsSortOrder] = useState("desc");
  const [reloadingReviews] = useState(false);

  const toggleReturnExpansion = (returnId: string) => {
    const newExpandedReturns = new Set(expandedReturns);
    if (newExpandedReturns.has(returnId)) {
      newExpandedReturns.delete(returnId);
    } else {
      newExpandedReturns.add(returnId);
    }
    setExpandedReturns(newExpandedReturns);
  };

  const router = useRouter();

  const filteredOrders = orders.filter((order) => {
    if (orderStatusFilter === "all") return true;
    if (orderStatusFilter === "pending") return order.status === "pending";
    if (orderStatusFilter === "others") return order.status !== "pending";
    return true;
  });

  const searchProducts = async () => {
    if (!productSearchTerm.trim()) {
      setSearchedProducts([]);
      return;
    }

    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(productSearchTerm)}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      setSearchedProducts(data.products || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchedProducts([]);
    }
  };

  const displayedProducts = productSearchTerm.trim()
    ? searchedProducts
    : products;

  useEffect(() => {
    const load = async () => {
      try {
        const [uRes, oRes, pRes, rRes, cRes, reviewsRes, iRes, pAllRes] =
          await Promise.all([
            fetch(
              `/api/admin/users?page=${currentUsersPage}&limit=${usersPerPage}&sortBy=${usersSortBy}&sortOrder=${usersSortOrder}`,
              {
                credentials: "include",
              }
            ),
            fetch(
              `/api/admin/orders?page=${currentOrdersPage}&limit=${ordersPerPage}&sortBy=${ordersSortBy}&sortOrder=${ordersSortOrder}`,
              {
                credentials: "include",
              }
            ),
            fetch(
              `/api/products?page=${currentPage}&limit=${productsPerPage}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
              {
                credentials: "include",
              }
            ),
            fetch(
              `/api/admin/returns?page=${currentReturnsPage}&limit=${returnsPerPage}&sortBy=${returnsSortBy}&sortOrder=${returnsSortOrder}&status=${returnsStatusFilter}`,
              {
                credentials: "include",
              }
            ),
            fetch(
              `/api/admin/categories?page=${currentCategoriesPage}&limit=${categoriesPerPage}&sortBy=${categoriesSortBy}&sortOrder=${categoriesSortOrder}`,
              {
                credentials: "include",
              }
            ),
            fetch(
              `/api/admin/reviews?page=${currentReviewsPage}&limit=${reviewsPerPage}&sortBy=${reviewsSortBy}&sortOrder=${reviewsSortOrder}`,
              {
                credentials: "include",
              }
            ),
            fetch(
              `/api/admin/inquiries?page=${currentInquiriesPage}&limit=${inquiriesPerPage}&sortBy=${inquiriesSortBy}&sortOrder=${inquiriesSortOrder}&status=${inquiriesStatusFilter}`,
              {
                credentials: "include",
              }
            ),
            fetch(`/api/products?all=true`, {
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
        const rData = await rRes.json();
        const cData = await cRes.json();
        const reviewsData = await reviewsRes.json();
        const iData = await iRes.json();
        const pAllData = await pAllRes.json();
        setUsers(uData.users || []);
        setOrders(oData.orders || []);
        setProducts(pData.products || []);
        setAllProducts(pAllData.products || []);
        setReturnRequests(rData.returnRequests || []);
        setCategories(cData.categories || []);
        setReviews(reviewsData.reviews || []);
        setInquiries(iData.inquiries || []);

        if (uData.pagination) {
          setTotalUsers(uData.pagination.totalCount);
          setTotalUsersPages(uData.pagination.totalPages);
        }

        if (pData.pagination) {
          setTotalProducts(pData.pagination.totalCount);
          setTotalPages(pData.pagination.totalPages);
        }

        if (oData.pagination) {
          setTotalOrders(oData.pagination.totalCount);
          setTotalOrdersPages(oData.pagination.totalPages);
        }

        if (rData.pagination) {
          setTotalReturns(rData.pagination.totalCount);
          setTotalReturnsPages(rData.pagination.totalPages);
        }

        if (cData.pagination) {
          setTotalCategories(cData.pagination.totalCount);
          setTotalCategoriesPages(cData.pagination.totalPages);
        }

        if (reviewsData.pagination) {
          setTotalReviews(reviewsData.pagination.totalCount);
          setTotalReviewsPages(reviewsData.pagination.totalPages);
        }

        if (iData.pagination) {
          setTotalInquiries(iData.pagination.totalInquiries);
          setTotalInquiriesPages(iData.pagination.totalPages);
        }

        await loadAvailableCategories();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load admin data";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [
    currentPage,
    productsPerPage,
    sortBy,
    sortOrder,
    currentOrdersPage,
    ordersPerPage,
    ordersSortBy,
    ordersSortOrder,
    currentUsersPage,
    usersPerPage,
    usersSortBy,
    usersSortOrder,
    currentReturnsPage,
    returnsPerPage,
    returnsSortBy,
    returnsSortOrder,
    returnsStatusFilter,
    currentCategoriesPage,
    categoriesPerPage,
    categoriesSortBy,
    categoriesSortOrder,
    currentReviewsPage,
    reviewsPerPage,
    reviewsSortBy,
    reviewsSortOrder,
    currentInquiriesPage,
    inquiriesPerPage,
    inquiriesSortBy,
    inquiriesSortOrder,
    inquiriesStatusFilter,
  ]);

  const reloadUsers = async () => {
    try {
      setReloadingUsers(true);
      const res = await fetch(
        `/api/admin/users?page=${currentUsersPage}&limit=${usersPerPage}&sortBy=${usersSortBy}&sortOrder=${usersSortOrder}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      setUsers(data.users || []);

      if (data.pagination) {
        setTotalUsers(data.pagination.totalCount);
        setTotalUsersPages(data.pagination.totalPages);
      }

      toast.success("Users refreshed successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reload users";
      toast.error(errorMessage);
    } finally {
      setReloadingUsers(false);
    }
  };

  const reloadOrders = async () => {
    try {
      setReloadingOrders(true);
      const res = await fetch(
        `/api/admin/orders?page=${currentOrdersPage}&limit=${ordersPerPage}&sortBy=${ordersSortBy}&sortOrder=${ordersSortOrder}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      setOrders(data.orders || []);

      if (data.pagination) {
        setTotalOrders(data.pagination.totalCount);
        setTotalOrdersPages(data.pagination.totalPages);
      }

      toast.success("Orders refreshed successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reload orders";
      toast.error(errorMessage);
    } finally {
      setReloadingOrders(false);
    }
  };

  const reloadProducts = async () => {
    try {
      setReloadingProducts(true);
      const [pRes, pAllRes] = await Promise.all([
        fetch(
          `/api/products?page=${currentPage}&limit=${productsPerPage}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
          {
            credentials: "include",
          }
        ),
        fetch(`/api/products?all=true`, {
          credentials: "include",
        }),
      ]);
      const pData = await pRes.json();
      const pAllData = await pAllRes.json();
      setProducts(pData.products || []);
      setAllProducts(pAllData.products || []);

      if (pData.pagination) {
        setTotalProducts(pData.pagination.totalCount);
        setTotalPages(pData.pagination.totalPages);
      }

      toast.success("Products refreshed successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reload products";
      toast.error(errorMessage);
    } finally {
      setReloadingProducts(false);
    }
  };

  const reloadReturns = async () => {
    try {
      setReloadingReturns(true);
      const res = await fetch(
        `/api/admin/returns?page=${currentReturnsPage}&limit=${returnsPerPage}&sortBy=${returnsSortBy}&sortOrder=${returnsSortOrder}&status=${returnsStatusFilter}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      setReturnRequests(data.returnRequests || []);

      if (data.pagination) {
        setTotalReturns(data.pagination.totalCount);
        setTotalReturnsPages(data.pagination.totalPages);
      }

      toast.success("Return requests refreshed successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to reload return requests";
      toast.error(errorMessage);
    } finally {
      setReloadingReturns(false);
    }
  };

  const reloadInquiries = async () => {
    try {
      setReloadingInquiries(true);
      const res = await fetch(
        `/api/admin/inquiries?page=${currentInquiriesPage}&limit=${inquiriesPerPage}&sortBy=${inquiriesSortBy}&sortOrder=${inquiriesSortOrder}&status=${inquiriesStatusFilter}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      setInquiries(data.inquiries || []);

      if (data.pagination) {
        setTotalInquiries(data.pagination.totalInquiries);
        setTotalInquiriesPages(data.pagination.totalPages);
      }

      toast.success("Inquiries refreshed successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reload inquiries";
      toast.error(errorMessage);
    } finally {
      setReloadingInquiries(false);
    }
  };

  const deleteInquiry = async (inquiryId: string) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const response = await res.json();
      if (!res.ok)
        throw new Error(response.error || "Failed to delete inquiry");

      setInquiries((prev) =>
        prev.filter((inquiry) => inquiry.id !== inquiryId)
      );
      setTotalInquiries((prev) => prev - 1);
    } catch (error) {
      throw error;
    }
  };

  const reloadAll = async () => {
    try {
      setReloadingAll(true);
      const [uRes, oRes, pRes, rRes, iRes, pAllRes] = await Promise.all([
        fetch(
          `/api/admin/users?page=${currentUsersPage}&limit=${usersPerPage}&sortBy=${usersSortBy}&sortOrder=${usersSortOrder}`,
          {
            credentials: "include",
          }
        ),
        fetch(
          `/api/admin/orders?page=${currentOrdersPage}&limit=${ordersPerPage}&sortBy=${ordersSortBy}&sortOrder=${ordersSortOrder}`,
          {
            credentials: "include",
          }
        ),
        fetch(
          `/api/products?page=${currentPage}&limit=${productsPerPage}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
          {
            credentials: "include",
          }
        ),
        fetch(
          `/api/admin/returns?page=${currentReturnsPage}&limit=${returnsPerPage}&sortBy=${returnsSortBy}&sortOrder=${returnsSortOrder}&status=${returnsStatusFilter}`,
          {
            credentials: "include",
          }
        ),
        fetch(
          `/api/admin/inquiries?page=${currentInquiriesPage}&limit=${inquiriesPerPage}&sortBy=${inquiriesSortBy}&sortOrder=${inquiriesSortOrder}&status=${inquiriesStatusFilter}`,
          {
            credentials: "include",
          }
        ),
        fetch(`/api/products?all=true`, {
          credentials: "include",
        }),
      ]);

      const uData = await uRes.json();
      const oData = await oRes.json();
      const pData = await pRes.json();
      const rData = await rRes.json();
      const iData = await iRes.json();
      const pAllData = await pAllRes.json();
      setUsers(uData.users || []);
      setOrders(oData.orders || []);
      setProducts(pData.products || []);
      setAllProducts(pAllData.products || []);
      setReturnRequests(rData.returnRequests || []);
      setInquiries(iData.inquiries || []);

      if (uData.pagination) {
        setTotalUsers(uData.pagination.totalCount);
        setTotalUsersPages(uData.pagination.totalPages);
      }

      if (pData.pagination) {
        setTotalProducts(pData.pagination.totalCount);
        setTotalPages(pData.pagination.totalPages);
      }

      if (oData.pagination) {
        setTotalOrders(oData.pagination.totalCount);
        setTotalOrdersPages(oData.pagination.totalPages);
      }

      if (rData.pagination) {
        setTotalReturns(rData.pagination.totalCount);
        setTotalReturnsPages(rData.pagination.totalPages);
      }

      if (iData.pagination) {
        setTotalInquiries(iData.pagination.totalInquiries);
        setTotalInquiriesPages(iData.pagination.totalPages);
      }

      toast.success("All data refreshed successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reload data";
      toast.error(errorMessage);
    } finally {
      setReloadingAll(false);
    }
  };

  const updateStatus = async (
    orderId: string,
    status:
      | "pending"
      | "processing"
      | "shipped"
      | "out-for-delivery"
      | "delivered"
      | "returned"
      | "canceled"
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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update status";
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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete order";
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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete user";
      toast.error(errorMessage);
    }
  };

  const addProduct = async () => {
    if (
      !name ||
      !price ||
      !category ||
      (images.length === 0 && !image) ||
      !stockQuantity
    ) {
      toast.error("Fill all required fields");
      return;
    }

    const primaryImage = images.length > 0 ? images[0] : image;

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          price: Number(price),
          category,
          image: primaryImage,
          images: images.length > 0 ? images : undefined,
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
      setImages([]);
      setDescription("");
      setStockQuantity("");
      await reloadProducts();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add product";
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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete product";
      toast.error(errorMessage);
    }
  };

  const updateProduct = async (
    slug: string,
    updates: Partial<{
      name: string;
      price: number;
      category: string;
      image: string;
      description?: string;
      discountPercentage: number;
      stockQuantity: number;
    }>
  ) => {
    try {
      const res = await fetch(`/api/admin/products/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");
      setProducts((prev) =>
        prev.map((p) => (p.slug === slug ? data.product : p))
      );

      toast.success("Product updated");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update product";
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

  const reloadCategories = async () => {
    try {
      setReloadingCategories(true);
      const res = await fetch(
        `/api/admin/categories?page=${currentCategoriesPage}&limit=${categoriesPerPage}&sortBy=${categoriesSortBy}&sortOrder=${categoriesSortOrder}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      setCategories(data.categories || []);

      if (data.pagination) {
        setTotalCategories(data.pagination.totalCount);
        setTotalCategoriesPages(data.pagination.totalPages);
      }

      toast.success("Categories refreshed successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reload categories";
      toast.error(errorMessage);
    } finally {
      setReloadingCategories(false);
    }
  };

  const addCategory = async () => {
    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: categoryName,
          description: categoryDescription,
          image: categoryImage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add category");
      toast.success("Category added successfully");
      setCategoryName("");
      setCategoryDescription("");
      setCategoryImage("");
      await reloadCategories();
      await loadAvailableCategories();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add category";
      toast.error(errorMessage);
    }
  };

  const updateCategory = async (
    categoryId: string,
    updates: Partial<{
      name: string;
      description: string;
      image: string;
    }>
  ) => {
    try {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update category");
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? data.category : c))
      );
      toast.success("Category updated successfully");
      setEditingCategory(null);
      await loadAvailableCategories();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update category";
      toast.error(errorMessage);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete category");
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      toast.success("Category deleted successfully");
      await loadAvailableCategories();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete category";
      toast.error(errorMessage);
    }
  };

  const uploadImageAndGetUrl = async (file: File): Promise<string | null> => {
    try {
      setUploadingCategoryImage(true);
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      toast.success("Image uploaded successfully");
      return data.url as string;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload image";
      toast.error(errorMessage);
      return null;
    } finally {
      setUploadingCategoryImage(false);
    }
  };

  const loadAvailableCategories = async () => {
    try {
      const res = await fetch("/api/categories", {
        credentials: "include",
      });
      const data = await res.json();
      setAvailableCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const updateReturnStatus = async (
    returnId: string,
    status: "pending" | "approved" | "rejected" | "completed" | "refunded",
    adminNote?: string,
    refundAmount?: number
  ) => {
    try {
      const res = await fetch(`/api/admin/returns/${returnId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, adminNote, refundAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");

      setReturnRequests((prev) =>
        prev.map((r) => (r.id === returnId ? { ...r, status, adminNote } : r))
      );
      toast.success("Return request status updated");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update return status";
      toast.error(errorMessage);
    }
  };

  const deleteReturnRequest = async (returnId: string) => {
    try {
      const res = await fetch(`/api/admin/returns/${returnId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to delete return request");
      setReturnRequests((prev) => prev.filter((r) => r.id !== returnId));
      toast.success("Return request deleted");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete return request";
      toast.error(errorMessage);
    }
  };

  const handleTabChange = (
    tab:
      | "overview"
      | "users"
      | "orders"
      | "products"
      | "returns"
      | "categories"
      | "reviews"
      | "chat"
      | "inquiries"
  ) => {
    setActiveTab(tab);
    if (tab === "products") {
      setCurrentPage(1);
    }
    if (tab === "orders") {
      setCurrentOrdersPage(1);
    }
    if (tab === "users") {
      setCurrentUsersPage(1);
    }
    if (tab === "returns") {
      setCurrentReturnsPage(1);
    }
    if (tab === "categories") {
      setCurrentCategoriesPage(1);
    }
    if (tab === "reviews") {
      setCurrentReviewsPage(1);
    }
    if (tab === "inquiries") {
      setCurrentInquiriesPage(1);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "out-for-delivery":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "returned":
        return "bg-orange-100 text-orange-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getReturnStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "refunded":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
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
          0%,
          100% {
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
                Admin{" "}
                <span className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent">
                  Dashboard
                </span>
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
                  <p className="text-3xl font-bold text-gray-900">
                    {totalUsers}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {totalOrders}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Products</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {totalProducts}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">
                    रु
                    {orders
                      .reduce((sum, order) => sum + (order.grandTotal || 0), 0)
                      .toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-2xl shadow-lg mb-8">
            <div className="flex border-b">
              {[
                { id: "overview", label: "Overview", icon: FaEye },
                { id: "users", label: "Users", icon: FaUsers },
                { id: "orders", label: "Orders", icon: FaShoppingCart },
                { id: "products", label: "Products", icon: FaBox },
                { id: "categories", label: "Categories", icon: FaTags },
                { id: "reviews", label: "Reviews", icon: FaStar },
                { id: "returns", label: "Returns", icon: FaUndo },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() =>
                    handleTabChange(
                      id as
                        | "overview"
                        | "users"
                        | "orders"
                        | "products"
                        | "returns"
                        | "categories"
                        | "reviews"
                        | "chat"
                        | "inquiries"
                    )
                  }
                  className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-colors ${
                    activeTab === id
                      ? "text-[#0D3B66] border-b-2 border-[#0D3B66]"
                      : "text-gray-600 hover:text-[#0D3B66]"
                  }`}
                >
                  <Icon />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Sections */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Overview Header with Gradient */}
              <div className="bg-gradient-to-br from-[#0D3B66] via-[#154A8A] to-[#1E5CAF] rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-3xl font-bold mb-2 flex items-center space-x-3">
                        <span>Dashboard Overview</span>
                      </h3>
                      <p className="text-white/80 text-lg">
                        Complete system overview and key metrics
                      </p>
                    </div>
                    <button
                      onClick={reloadAll}
                      className="group p-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-300 transform hover:scale-105"
                      disabled={reloadingAll}
                      title="Refresh all data"
                    >
                      {reloadingAll ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <FaSync className="text-xl" />
                      )}
                    </button>
                  </div>

                  {/* Quick Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-2xl font-bold">{totalUsers}</div>
                      <div className="text-white/80 text-sm">Total Users</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-2xl font-bold">{totalOrders}</div>
                      <div className="text-white/80 text-sm">Total Orders</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-2xl font-bold">{totalProducts}</div>
                      <div className="text-white/80 text-sm">
                        Total Products
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-2xl font-bold text-green-500">
                        रु
                        {orders
                          .reduce(
                            (sum, order) => sum + (order.grandTotal || 0),
                            0
                          )
                          .toFixed(0)}
                      </div>
                      <div className="text-white/80 text-sm">Total Revenue</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Recent Orders
                </h3>
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order.orderId}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div>
                        <p className="font-semibold">{order.username}</p>
                        <p className="text-sm text-gray-600">
                          रु{order.grandTotal?.toFixed(2)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-8">
              {/* Overview Header with Gradient */}
              <div className="bg-gradient-to-br from-[#0D3B66] via-[#154A8A] to-[#1E5CAF] rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-3xl font-bold mb-2 flex items-center space-x-3">
                        <span>User Management Center</span>
                      </h3>
                      <p className="text-white/80 text-lg">
                        Manage and monitor all registered users
                      </p>
                    </div>
                    <button
                      onClick={reloadUsers}
                      className="group p-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-300 transform hover:scale-105"
                      disabled={reloadingUsers}
                      title="Refresh users"
                    >
                      {reloadingUsers ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <FaSync className="text-xl" />
                      )}
                    </button>
                  </div>

                  {/* Stats Card */}
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-2xl font-bold">{totalUsers}</div>
                      <div className="text-white/80 text-sm">
                        Total Registered Users
                      </div>
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
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Show
                        </label>
                        <select
                          value={usersPerPage}
                          onChange={(e) => {
                            setUsersPerPage(Number(e.target.value));
                            setCurrentUsersPage(1);
                          }}
                          className="ml-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all duration-200 hover:border-[#1E5CAF]"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    {/* Sort By */}
                    <div className="flex items-center space-x-3">
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Sort by
                        </label>
                        <select
                          value={usersSortBy}
                          onChange={(e) => {
                            setUsersSortBy(e.target.value);
                            setCurrentUsersPage(1);
                          }}
                          className="ml-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-500"
                        >
                          <option value="createdAt">Date Created</option>
                          <option value="username">Username</option>
                          <option value="email">Email</option>
                        </select>
                      </div>
                    </div>

                    {/* Sort Order */}
                    <div className="flex items-center space-x-3">
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Order
                        </label>
                        <select
                          value={usersSortOrder}
                          onChange={(e) => {
                            setUsersSortOrder(e.target.value);
                            setCurrentUsersPage(1);
                          }}
                          className="ml-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-500"
                        >
                          <option value="desc">Latest First</option>
                          <option value="asc">Oldest First</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-900">
                          Username
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-900">
                          Email
                        </th>
                        <th className="text-center p-4 font-semibold text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr
                          key={user._id}
                          className="border-t hover:bg-gray-50"
                        >
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
                        Showing {(currentUsersPage - 1) * usersPerPage + 1} to{" "}
                        {Math.min(currentUsersPage * usersPerPage, totalUsers)}{" "}
                        of {totalUsers} users
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            setCurrentUsersPage(currentUsersPage - 1)
                          }
                          disabled={currentUsersPage === 1}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center space-x-1">
                          {Array.from(
                            { length: Math.min(5, totalUsersPages) },
                            (_, i) => {
                              let pageNum;
                              if (totalUsersPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentUsersPage <= 3) {
                                pageNum = i + 1;
                              } else if (
                                currentUsersPage >=
                                totalUsersPages - 2
                              ) {
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
                                      ? "bg-[#0D3B66] text-white"
                                      : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            }
                          )}
                        </div>

                        <button
                          onClick={() =>
                            setCurrentUsersPage(currentUsersPage + 1)
                          }
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

          {activeTab === "orders" && (
            <div className="space-y-8">
              {/* Header Section with Gradient */}
              <div className="bg-gradient-to-br from-[#0D3B66] via-[#154A8A] to-[#1E5CAF] rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-3xl font-bold mb-2 flex items-center space-x-3">
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
                        <FaSync className="text-xl" />
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
                      <div className="text-2xl font-bold text-yellow-300">
                        {orders.filter((o) => o.status === "pending").length}
                      </div>
                      <div className="text-white/80 text-sm">Pending</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-2xl font-bold text-green-300">
                        {orders.filter((o) => o.status === "delivered").length}
                      </div>
                      <div className="text-white/80 text-sm">Delivered</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-2xl font-bold text-emerald-300">
                        रु
                        {orders
                          .reduce(
                            (sum, order) => sum + (order.grandTotal || 0),
                            0
                          )
                          .toFixed(0)}
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
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Show
                        </label>
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
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center space-x-3">
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Filter
                        </label>
                        <select
                          value={orderStatusFilter}
                          onChange={(e) => {
                            setOrderStatusFilter(
                              e.target.value as "all" | "pending" | "others"
                            );
                          }}
                          className="ml-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-900 focus:border-blue-500 transition-all duration-200 hover:border-blue-500"
                        >
                          <option value="all">All Orders</option>
                          <option value="pending">Pending Only</option>
                          <option value="others">Others (Non-Pending)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    {/* Sort By */}
                    <div className="flex items-center space-x-3">
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Sort by
                        </label>
                        <select
                          value={ordersSortBy}
                          onChange={(e) => {
                            setOrdersSortBy(e.target.value);
                            setCurrentOrdersPage(1);
                          }}
                          className="ml-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-500"
                        >
                          <option value="createdAt">Date Created</option>
                          <option value="grandTotal">Total Amount</option>
                          <option value="status">Status</option>
                          <option value="customer.name">Customer Name</option>
                        </select>
                      </div>
                    </div>

                    {/* Sort Order */}
                    <div className="flex items-center space-x-3">
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Order
                        </label>
                        <select
                          value={ordersSortOrder}
                          onChange={(e) => {
                            setOrdersSortOrder(e.target.value);
                            setCurrentOrdersPage(1);
                          }}
                          className="ml-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-500"
                        >
                          <option value="desc">Latest First</option>
                          <option value="asc">Oldest First</option>
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
                      {orderStatusFilter === "pending"
                        ? "No Pending Orders"
                        : orderStatusFilter === "others"
                        ? "No Other Orders"
                        : "No Orders Found"}
                    </h3>
                    <p className="text-gray-600 text-lg mb-6">
                      {orderStatusFilter === "pending"
                        ? "All caught up! No pending orders to process."
                        : orderStatusFilter === "others"
                        ? "Only pending orders are available."
                        : "Orders will appear here once customers start placing them."}
                    </p>

                    {orderStatusFilter !== "all" && (
                      <button
                        onClick={() => setOrderStatusFilter("all")}
                        className="px-8 py-4 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto"
                      >
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
                          animation: `fadeInUp 0.8s ease-out ${
                            index * 150
                          }ms forwards`,
                        }}
                      >
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
                                <span
                                  className={`px-3 py-1 rounded-xl text-xs font-bold shadow-md ${getStatusColor(
                                    order.status
                                  )}`}
                                >
                                  {order.status === "out-for-delivery"
                                    ? "Out for Delivery"
                                    : order.status.charAt(0).toUpperCase() +
                                      order.status.slice(1)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span className="flex items-center space-x-1">
                                  <span>
                                    #{order.orderId.slice(-6).toUpperCase()}
                                  </span>
                                </span>
                                <span>•</span>
                                <span className="flex items-center space-x-1">
                                  <span>
                                    {order.items.length} item
                                    {order.items.length > 1 ? "s" : ""}
                                  </span>
                                </span>
                                <span>•</span>
                                <span className="font-bold text-[#0D3B66]">
                                  रु{order.grandTotal?.toFixed(2)}
                                </span>
                                <span>•</span>
                                <span className="text-gray-500">
                                  {new Date(order.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleOrderExpansion(order.orderId)}
                            className={`p-3 rounded-xl font-bold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
                              isExpanded
                                ? "bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700"
                                : "bg-gradient-to-br from-[#0D3B66] to-[#1E5CAF] text-white hover:from-blue-600 hover:to-[#0D3B66]"
                            }`}
                            title={
                              isExpanded ? "Collapse details" : "Expand details"
                            }
                          >
                            {isExpanded ? (
                              <>
                                <span className="text-sm hidden sm:inline">
                                  Collapse
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="text-sm hidden sm:inline">
                                  Expand
                                </span>
                              </>
                            )}
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="mt-4 space-y-6 animate-fade-in-up">
                            <div className="relative z-10">
                              <div className="flex items-center space-x-3 mb-4">
                                <h5 className="text-lg font-bold text-gray-800">
                                  Order Items
                                </h5>
                                <div className="h-px bg-gradient-to-r from-gray-300 to-transparent flex-1"></div>
                                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                  {order.items.length} item
                                  {order.items.length > 1 ? "s" : ""}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {order.items.map((item, index) => {
                                  const hasProductDetails =
                                    item.name && item.image && item.price;

                                  return (
                                    <div
                                      key={index}
                                      className="bg-gradient-to-br from-gray-50 to-gray-100/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 group"
                                    >
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
                                            <div className="absolute -top-2 -right-2 bg-blue-700 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                              {item.quantity}
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="relative">
                                            <div className="w-15 h-15 bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl shadow-md flex items-center justify-center group-hover:shadow-lg transition-shadow duration-300">
                                              <FaBox className="text-gray-600 text-lg" />
                                            </div>
                                            <div className="absolute -top-2 -right-2 bg-blue-700 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                              {item.quantity}
                                            </div>
                                          </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                          <p className="font-bold text-gray-900 group-hover:text-blue-900">
                                            {item.name ||
                                              `Product #${item.productId.slice(
                                                -6
                                              )}`}
                                          </p>
                                          <div className="flex items-center justify-between mt-1">
                                            <p className="text-sm text-gray-600 flex items-center space-x-1">
                                              <span>Qty: {item.quantity}</span>
                                            </p>
                                            {item.price && (
                                              <div className="text-right">
                                                <p className="text-sm text-gray-600">
                                                  रु{item.price.toFixed(2)} each
                                                </p>
                                                <p className="font-bold text-[#0D3B66] text-lg">
                                                  रु
                                                  {(
                                                    item.price * item.quantity
                                                  ).toFixed(2)}
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
                                    <h6 className="font-bold text-gray-800">
                                      Delivery Address
                                    </h6>
                                  </div>
                                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/30">
                                    <p className="font-medium text-gray-900 flex items-center space-x-2 mb-2">
                                      <span>
                                        {order.customer?.address?.street}
                                      </span>
                                    </p>
                                    <p className="text-gray-600 ml-6 mb-2">
                                      {order.customer?.address?.city}
                                    </p>
                                    <p className="text-gray-700 flex items-center space-x-2 ml-6">
                                      <span className="font-medium">
                                        {order.customer?.email || order.email}
                                      </span>
                                    </p>
                                  </div>
                                </div>

                                {/* Order Financial Summary */}
                                <div className="space-y-3">
                                  <div className="flex items-center space-x-3">
                                    <h6 className="font-bold text-gray-800">
                                      Order Summary
                                    </h6>
                                  </div>
                                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/30 space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-600">
                                        Subtotal:
                                      </span>
                                      <span className="font-medium">
                                        रु{order.subtotal?.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-600">
                                        Delivery:
                                      </span>
                                      <span className="font-medium">
                                        रु{order.deliveryFee?.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="border-t pt-2 flex justify-between items-center">
                                      <span className="font-bold text-gray-900">
                                        Grand Total:
                                      </span>
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
                                  className="group px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                                >
                                  <FaTrash />
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

              {totalOrdersPages > 1 && (
                <div className="bg-gradient-to-r from-white via-blue-50/30 to-white backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200/50 p-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-lg font-bold text-gray-900">
                          Page {currentOrdersPage} of {totalOrdersPages}
                        </p>
                        <p className="text-sm text-gray-600">
                          Showing {(currentOrdersPage - 1) * ordersPerPage + 1}-
                          {Math.min(
                            currentOrdersPage * ordersPerPage,
                            totalOrders
                          )}{" "}
                          of {totalOrders} orders
                        </p>
                      </div>
                    </div>

                    {/* Pagination Buttons */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() =>
                          setCurrentOrdersPage(currentOrdersPage - 1)
                        }
                        disabled={currentOrdersPage === 1}
                        className="group px-6 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl font-bold text-gray-700 hover:border-[#0D3B66] hover:text-[#0D3B66] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                      >
                        <span className="text-lg group-hover:-translate-x-1 transition-transform duration-300">
                          ←
                        </span>
                        <span>Previous</span>
                      </button>

                      {/* Page Numbers with Cool Design */}
                      <div className="flex items-center space-x-2">
                        {Array.from(
                          { length: Math.min(5, totalOrdersPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalOrdersPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentOrdersPage <= 3) {
                              pageNum = i + 1;
                            } else if (
                              currentOrdersPage >=
                              totalOrdersPages - 2
                            ) {
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
                                    ? "bg-gradient-to-br from-[#0D3B66] to-[#1E5CAF] text-white shadow-2xl scale-110"
                                    : "bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 hover:border-[#0D3B66] hover:text-[#0D3B66]"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}
                      </div>

                      <button
                        onClick={() =>
                          setCurrentOrdersPage(currentOrdersPage + 1)
                        }
                        disabled={currentOrdersPage === totalOrdersPages}
                        className="group px-6 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl font-bold text-gray-700 hover:border-[#0D3B66] hover:text-[#0D3B66] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                      >
                        <span>Next</span>
                        <span className="text-lg group-hover:translate-x-1 transition-transform duration-300">
                          →
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "products" && (
            <div className="space-y-8">
              {/* Premium Products Header */}
              <div className="bg-gradient-to-br from-[#0D3B66] via-[#154A8A] to-[#1E5CAF] rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-3xl font-bold mb-2 flex items-center space-x-3">
                        <span>Product Command Center</span>
                      </h3>
                      <p className="text-white/80 text-lg">
                        Manage your product inventory and catalog
                      </p>
                    </div>
                    <button
                      onClick={reloadProducts}
                      className="group p-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl "
                      disabled={reloadingProducts}
                      title="Refresh products"
                    >
                      {reloadingProducts ? (
                        <div className=""></div>
                      ) : (
                        <FaSync className="text-xl" />
                      )}
                    </button>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-2xl font-bold">{totalProducts}</div>
                      <div className="text-white/80 text-sm">
                        Total Products
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-2xl font-bold text-yellow-300">
                        {
                          allProducts.filter(
                            (p) => p.stockQuantity <= 5 && p.stockQuantity > 0
                          ).length
                        }
                      </div>
                      <div className="text-white/80 text-sm">Low Stock</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-2xl font-bold text-red-300">
                        {
                          allProducts.filter((p) => p.stockQuantity === 0)
                            .length
                        }
                      </div>
                      <div className="text-white/80 text-sm">Out of Stock</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-2xl font-bold text-emerald-300">
                        {
                          [...new Set(allProducts.map((p) => p.category))]
                            .length
                        }
                      </div>
                      <div className="text-white/80 text-sm">Categories</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Search & Controls Panel */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Search Section */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <h4 className="text-lg font-bold text-gray-800">
                        Product Search
                      </h4>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        placeholder="Search by name, category, or slug..."
                        value={productSearchTerm}
                        onChange={(e) => setProductSearchTerm(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && searchProducts()
                        }
                        className="flex-1 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all duration-200 hover:border-[#1E5CAF]"
                      />
                      <button
                        onClick={searchProducts}
                        className="px-6 py-3 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all duration-300 transform hover:scale-105"
                      >
                        <span className="flex items-center space-x-2">
                          <span>Search</span>
                        </span>
                      </button>
                      {productSearchTerm.trim() && (
                        <button
                          onClick={() => {
                            setProductSearchTerm("");
                            setSearchedProducts([]);
                          }}
                          className="p-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                          title="Clear search"
                        >
                          <span className="text-lg">✕</span>
                        </button>
                      )}
                    </div>

                    {productSearchTerm.trim() && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-sm text-blue-800 font-medium">
                          Search results for &ldquo;{productSearchTerm}
                          &rdquo;: {searchedProducts.length} products found
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Controls Section */}
                  <div className="flex-1 lg:max-w-md">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Items per page */}
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Show
                        </label>
                        <select
                          value={productsPerPage}
                          onChange={(e) => {
                            setProductsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="w-full bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all duration-200"
                        >
                          <option value={4}>4 items</option>
                          <option value={10}>10 items</option>
                          <option value={20}>20 items</option>
                          <option value={50}>50 items</option>
                        </select>
                      </div>

                      {/* Sort by */}
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Sort by
                        </label>
                        <select
                          value={sortBy}
                          onChange={(e) => {
                            setSortBy(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="w-full bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all duration-200"
                        >
                          <option value="createdAt">Date Created</option>
                          <option value="name">Name</option>
                          <option value="price">Price</option>
                          <option value="category">Category</option>
                          <option value="stockQuantity">Stock</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Order
                        </label>
                        <select
                          value={sortOrder}
                          onChange={(e) => {
                            setSortOrder(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="w-full bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all duration-200"
                        >
                          <option value="desc">Newest First</option>
                          <option value="asc">Oldest First</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Premium Product Cards */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {displayedProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="group bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl hover:border-purple-300/50 transition-all duration-500 transform hover:-translate-y-1 relative overflow-hidden animate-fade-in-up"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      opacity: 0,
                      animation: `fadeInUp 0.8s ease-out ${
                        index * 100
                      }ms forwards`,
                    }}
                  >
                    {/* Gradient overlay */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-400/10 to-transparent rounded-full transform translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-700"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row gap-6">
                      {/* Product Image & Basic Info */}
                      <div className="lg:w-1/3 space-y-4">
                        <div className="relative">
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={200}
                            height={200}
                            className="w-full h-48 object-cover rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                          />
                          <div
                            className={`absolute top-3 right-3 px-3 py-1 rounded-xl text-xs font-bold shadow-lg ${
                              product.stockQuantity === 0
                                ? "bg-red-500 text-white"
                                : product.stockQuantity <= 5
                                ? "bg-yellow-500 text-white"
                                : "bg-green-500 text-white"
                            }`}
                          >
                            {product.stockQuantity === 0
                              ? "Out of Stock"
                              : product.stockQuantity <= 5
                              ? "Low Stock"
                              : "In Stock"}
                          </div>
                        </div>

                        {/* Stock Quantity */}
                        <div className="text-center">
                          <label className="text-sm font-semibold text-gray-700 block mb-2">
                            Stock Quantity
                          </label>
                          <input
                            type="number"
                            min="0"
                            defaultValue={product.stockQuantity}
                            onBlur={(e) =>
                              updateProduct(product.slug, {
                                stockQuantity: Number(e.target.value),
                              })
                            }
                            className="w-full bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-3 text-center font-bold text-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all duration-200"
                          />
                        </div>
                      </div>

                      {/* Product Details & Controls */}
                      <div className="lg:w-2/3 space-y-6">
                        {/* Name & Category Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-2">
                              Product Name
                            </label>
                            <input
                              defaultValue={product.name}
                              onBlur={(e) =>
                                updateProduct(product.slug, {
                                  name: e.target.value,
                                })
                              }
                              className="w-full bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-2">
                              Category
                            </label>
                            <select
                              defaultValue={product.category}
                              onChange={(e) =>
                                updateProduct(product.slug, {
                                  category: e.target.value,
                                })
                              }
                              className="w-full bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all duration-200"
                            >
                              <option value="">Select a category</option>
                              {availableCategories.map((cat) => (
                                <option key={cat.id} value={cat.slug}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Description (collapsible) */}
                        <ProductDescriptionSection
                          productId={product.id}
                          productSlug={product.slug}
                          description={product.description}
                          onSave={(content) =>
                            updateProduct(product.slug, {
                              description: content.trim() || undefined,
                            })
                          }
                        />

                        {/* Price & Discount Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-2">
                              Price (रु)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              defaultValue={product.price}
                              onBlur={(e) =>
                                updateProduct(product.slug, {
                                  price: Number(e.target.value),
                                })
                              }
                              className="w-full bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-3 font-bold text-lg text-[#0D3B66] focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-2">
                              Discount (%)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              defaultValue={product.discountPercentage || 0}
                              onBlur={(e) =>
                                updateProduct(product.slug, {
                                  discountPercentage: Number(e.target.value),
                                })
                              }
                              className="w-full bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-200/50">
                          <button
                            onClick={() => deleteProduct(product.slug)}
                            className="group px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-blue-500 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                          >
                            <FaTrash />
                            <span>Delete Product</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          Page {currentPage} of {totalPages}
                        </p>
                        <p className="text-xs text-gray-600">
                          Showing {(currentPage - 1) * productsPerPage + 1}-
                          {Math.min(
                            currentPage * productsPerPage,
                            totalProducts
                          )}{" "}
                          of {totalProducts} products
                        </p>
                      </div>
                    </div>

                    {/* Pagination Buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-[#0D3B66] hover:text-white hover:border-[#0D3B66] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-1"
                      >
                        <span>←</span>
                        <span>Previous</span>
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center space-x-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
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
                                className={`w-10 h-10 rounded-lg text-sm font-bold transition-all duration-200 ${
                                  currentPage === pageNum
                                    ? "bg-[#0D3B66] text-white shadow-lg"
                                    : "bg-white border border-gray-300 text-gray-700 hover:bg-[#0D3B66] hover:text-white hover:border-[#0D3B66]"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}
                      </div>

                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-[#0D3B66] hover:text-white hover:border-[#0D3B66] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-1"
                      >
                        <span>Next</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Product Section */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center space-x-2">
                    <span>Add New Product</span>
                  </h3>
                  <p className="text-gray-600">
                    Create and add new products to your inventory
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    placeholder="Product Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition-all duration-200"
                  />
                  <input
                    placeholder="Price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="border rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition-all duration-200"
                  />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="border rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select a category</option>
                    {availableCategories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>

                  <input
                    placeholder="Stock Quantity"
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="border rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition-all duration-200"
                  />

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Images
                    </label>
                    <MultipleImagesUpload
                      images={images}
                      onImagesChange={setImages}
                      uploading={uploading}
                      setUploading={setUploading}
                      maxImages={10}
                      className="w-full"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Description
                    </label>
                    <QuillEditor
                      value={description}
                      onChange={setDescription}
                      placeholder="Enter detailed product description..."
                      height="200px"
                      className="w-full"
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end">
                    <button
                      onClick={addProduct}
                      disabled={uploading}
                      className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-8 py-4 rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Add Product</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "categories" && (
            <div className="space-y-8">
              {/* Categories Header */}
              <div className="bg-gradient-to-br from-[#0D3B66] via-[#154A8A] to-[#1E5CAF] rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-3xl font-bold mb-2 flex items-center space-x-3">
                        <span>Category Management</span>
                      </h3>
                      <p className="text-white/80 text-lg">
                        Organize categories
                      </p>
                    </div>
                    <button
                      onClick={reloadCategories}
                      className="group p-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-300 transform hover:scale-105"
                      disabled={reloadingCategories}
                      title="Refresh categories"
                    >
                      {reloadingCategories ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <FaSync className="text-xl" />
                      )}
                    </button>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-2xl font-bold">
                        {totalCategories}
                      </div>
                      <div className="text-white/80 text-sm">
                        Total Categories
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories Controls */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-3">
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Show
                        </label>
                        <select
                          value={categoriesPerPage}
                          onChange={(e) => {
                            setCategoriesPerPage(Number(e.target.value));
                            setCurrentCategoriesPage(1);
                          }}
                          className="ml-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all duration-200"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-3">
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Sort by
                        </label>
                        <select
                          value={categoriesSortBy}
                          onChange={(e) => {
                            setCategoriesSortBy(e.target.value);
                            setCurrentCategoriesPage(1);
                          }}
                          className="ml-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        >
                          <option value="createdAt">Date Created</option>
                          <option value="name">Name</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Order
                        </label>
                        <select
                          value={categoriesSortOrder}
                          onChange={(e) => {
                            setCategoriesSortOrder(e.target.value);
                            setCurrentCategoriesPage(1);
                          }}
                          className="ml-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        >
                          <option value="desc">Latest First</option>
                          <option value="asc">Oldest First</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories Table */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-900">
                          Image
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-900">
                          Name
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-900">
                          Slug
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-900">
                          Description
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-900">
                          Created
                        </th>
                        <th className="text-center p-4 font-semibold text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <tr
                          key={category.id}
                          className="border-t hover:bg-gray-50"
                        >
                          <td className="p-4">
                            {category.image ? (
                              <Image
                                src={category.image}
                                alt={category.name}
                                width={48}
                                height={48}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <FaTags className="text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="p-4 font-semibold">{category.name}</td>
                          <td className="p-4 text-gray-600">{category.slug}</td>
                          <td className="p-4 text-gray-600 max-w-xs">
                            <CategoryDescriptionCell
                              description={category.description}
                            />
                          </td>
                          <td className="p-4 text-gray-600">
                            {new Date(category.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => setEditingCategory(category)}
                                className="px-3 py-2 bg-[#0D3B66] text-white rounded-lg hover:brightness-110 transition-colors flex items-center space-x-1 text-sm"
                              >
                                <FaEye />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => deleteCategory(category.id)}
                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-1 text-sm"
                              >
                                <FaTrash />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls for Categories */}
                {totalCategoriesPages > 1 && (
                  <div className="p-6 border-t bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing{" "}
                        {(currentCategoriesPage - 1) * categoriesPerPage + 1} to{" "}
                        {Math.min(
                          currentCategoriesPage * categoriesPerPage,
                          totalCategories
                        )}{" "}
                        of {totalCategories} categories
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            setCurrentCategoriesPage(currentCategoriesPage - 1)
                          }
                          disabled={currentCategoriesPage === 1}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>

                        <div className="flex items-center space-x-1">
                          {Array.from(
                            { length: Math.min(5, totalCategoriesPages) },
                            (_, i) => {
                              let pageNum;
                              if (totalCategoriesPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentCategoriesPage <= 3) {
                                pageNum = i + 1;
                              } else if (
                                currentCategoriesPage >=
                                totalCategoriesPages - 2
                              ) {
                                pageNum = totalCategoriesPages - 4 + i;
                              } else {
                                pageNum = currentCategoriesPage - 2 + i;
                              }

                              return (
                                <button
                                  key={pageNum}
                                  onClick={() =>
                                    setCurrentCategoriesPage(pageNum)
                                  }
                                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                    currentCategoriesPage === pageNum
                                      ? "bg-[#0D3B66] text-white"
                                      : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            }
                          )}
                        </div>

                        <button
                          onClick={() =>
                            setCurrentCategoriesPage(currentCategoriesPage + 1)
                          }
                          disabled={
                            currentCategoriesPage === totalCategoriesPages
                          }
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Add Category Section */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center space-x-2">
                    <span>Add New Category</span>
                  </h3>
                  <p className="text-gray-600">
                    Create new categories to organize your products
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    placeholder="Category Name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="border rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition-all duration-200"
                  />
                  <input
                    placeholder="Description (optional)"
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    className="border rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition-all duration-200"
                  />

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Image (optional) max: 10mb
                    </label>
                    <DragDropUpload
                      className=""
                      currentImage={categoryImage}
                      uploading={uploadingCategoryImage}
                      onFileUpload={async (file) => {
                        const url = await uploadImageAndGetUrl(file);
                        if (url) setCategoryImage(url);
                      }}
                      onImageUrl={(url) => setCategoryImage(url)}
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end">
                    <button
                      onClick={addCategory}
                      disabled={uploadingCategoryImage || !categoryName.trim()}
                      className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-8 py-4 rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                      {uploadingCategoryImage ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Add Category</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Edit Category Modal */}
              {editingCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900">
                        Edit Category
                      </h3>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-4">
                      <input
                        placeholder="Category Name"
                        value={editingCategory.name}
                        onChange={(e) =>
                          setEditingCategory({
                            ...editingCategory,
                            name: e.target.value,
                          })
                        }
                        className="w-full border rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent"
                      />
                      <input
                        placeholder="Description (optional)"
                        value={editingCategory.description || ""}
                        onChange={(e) =>
                          setEditingCategory({
                            ...editingCategory,
                            description: e.target.value,
                          })
                        }
                        className="w-full border rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent"
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category Image (optional)
                        </label>
                        <DragDropUpload
                          className=""
                          currentImage={editingCategory.image || ""}
                          uploading={uploadingCategoryImage}
                          onFileUpload={async (file) => {
                            const url = await uploadImageAndGetUrl(file);
                            if (url)
                              setEditingCategory({
                                ...editingCategory,
                                image: url,
                              });
                          }}
                          onImageUrl={(url) =>
                            setEditingCategory({
                              ...editingCategory,
                              image: url,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 mt-6">
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() =>
                          updateCategory(editingCategory.id, {
                            name: editingCategory.name,
                            description: editingCategory.description,
                            image: editingCategory.image,
                          })
                        }
                        className="px-6 py-3 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white rounded-xl hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-colors"
                      >
                        Update Category
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "returns" && (
            <AdminReturnsSection
              returnRequests={returnRequests}
              currentReturnsPage={currentReturnsPage}
              returnsPerPage={returnsPerPage}
              totalReturns={totalReturns}
              totalReturnsPages={totalReturnsPages}
              returnsSortBy={returnsSortBy}
              returnsSortOrder={returnsSortOrder}
              returnsStatusFilter={returnsStatusFilter}
              reloadingReturns={reloadingReturns}
              expandedReturns={expandedReturns}
              setCurrentReturnsPage={setCurrentReturnsPage}
              setReturnsPerPage={setReturnsPerPage}
              setReturnsSortBy={setReturnsSortBy}
              setReturnsSortOrder={setReturnsSortOrder}
              setReturnsStatusFilter={setReturnsStatusFilter}
              toggleReturnExpansion={toggleReturnExpansion}
              updateReturnStatus={updateReturnStatus}
              deleteReturnRequest={deleteReturnRequest}
              reloadReturns={reloadReturns}
              getReturnStatusColor={getReturnStatusColor}
            />
          )}

          {activeTab === "reviews" && (
            <div className="space-y-8">
              {/* Reviews Header with Gradient */}
              <div className="bg-gradient-to-br from-[#0D3B66] via-[#154A8A] to-[#1E5CAF] rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-3xl font-bold mb-2 flex items-center space-x-3">
                        <span>Review Management</span>
                      </h3>
                      <p className="text-white/80 text-lg">
                        Reviews left by customers
                      </p>
                    </div>
                    <button
                      onClick={() => window.location.reload()}
                      className="group p-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-300 transform hover:scale-105"
                      disabled={reloadingReviews}
                      title="Refresh reviews"
                    >
                      {reloadingReviews ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <FaSync className="text-xl" />
                      )}
                    </button>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-2xl font-bold">{totalReviews}</div>
                      <div className="text-white/80 text-sm">Total Reviews</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews Table */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-900">
                          User
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-900">
                          Product
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-900">
                          Rating
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-900">
                          Comment
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-900">
                          Date
                        </th>
                        <th className="text-right p-4 font-semibold text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((review) => (
                        <tr
                          key={review.id}
                          className="border-t hover:bg-gray-50"
                        >
                          <td className="p-4">
                            <div>
                              <div className="font-medium">
                                {review.userName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {review.userEmail}
                              </div>
                              {review.isVerifiedPurchase && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Verified Purchase
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            {(() => {
                              const prod = allProducts.find(
                                (p) => p.id === review.productId
                              );
                              return prod ? (
                                <div className="flex items-center space-x-3">
                                  {prod.image ? (
                                    <Image
                                      src={prod.image}
                                      alt={prod.name}
                                      width={40}
                                      height={40}
                                      className="w-10 h-10 object-cover rounded-md"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 bg-gray-200 rounded-md" />
                                  )}
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {prod.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {prod.slug}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500">
                                  Product ID: {review.productId}
                                </div>
                              );
                            })()}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  className={`text-sm ${
                                    i < review.rating
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="ml-2 text-sm font-medium">
                                {review.rating}/5
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="max-w-xs">
                              <p className="text-sm text-gray-900 line-clamp-3">
                                {review.comment}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    "Are you sure you want to delete this review?"
                                  )
                                ) {
                                  fetch(`/api/admin/reviews/${review.id}`, {
                                    method: "DELETE",
                                    credentials: "include",
                                  }).then(() => {
                                    window.location.reload();
                                  });
                                }
                              }}
                              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalReviewsPages > 1 && (
                  <div className="p-6 border-t bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing {(currentReviewsPage - 1) * reviewsPerPage + 1}{" "}
                        to{" "}
                        {Math.min(
                          currentReviewsPage * reviewsPerPage,
                          totalReviews
                        )}{" "}
                        of {totalReviews} reviews
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            setCurrentReviewsPage(currentReviewsPage - 1)
                          }
                          disabled={currentReviewsPage === 1}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        {Array.from(
                          { length: Math.min(5, totalReviewsPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalReviewsPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentReviewsPage <= 3) {
                              pageNum = i + 1;
                            } else if (
                              currentReviewsPage >=
                              totalReviewsPages - 2
                            ) {
                              pageNum = totalReviewsPages - 4 + i;
                            } else {
                              pageNum = currentReviewsPage - 2 + i;
                            }
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentReviewsPage(pageNum)}
                                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                  currentReviewsPage === pageNum
                                    ? "bg-[#0D3B66] text-white"
                                    : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}
                        <button
                          onClick={() =>
                            setCurrentReviewsPage(currentReviewsPage + 1)
                          }
                          disabled={currentReviewsPage === totalReviewsPages}
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

          {activeTab === "chat" && (
            <div className="space-y-8">
              {/* Chat Header with Gradient */}
              <div className="bg-gradient-to-br from-[#0D3B66] via-[#154A8A] to-[#1E5CAF] rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-3xl font-bold mb-2 flex items-center space-x-3">
                        <span>Customer Support Chat</span>
                      </h3>
                      <p className="text-white/80 text-lg">
                        Chat with customers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Interface */}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
