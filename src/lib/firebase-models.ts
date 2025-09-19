import { Timestamp, FieldValue } from "firebase/firestore";

// TypeScript interfaces for Firebase
export interface ICartItem {
  productId: string;
  quantity: number;
}

export interface IOrderItem {
  productId: string;
  quantity: number;
  name?: string;
  image?: string;
  price?: number;
}

export interface IReturnRequest {
  id?: string;
  orderId: string;
  userId: string;
  items: IOrderItem[]; // Items being returned
  reason:
    | "damaged"
    | "wrong-item"
    | "size-issue"
    | "defective"
    | "not-as-described"
    | "other";
  description?: string;
  images?: string[]; // URLs of uploaded images
  status: "pending" | "approved" | "rejected" | "completed" | "refunded";
  adminNote?: string;
  requestedAt: Timestamp | Date;
  processedAt?: Timestamp | Date | FieldValue;
  refundAmount?: number;
  refundMethod?: "original" | "store-credit";
}

export interface IOrder {
  id?: string;
  items: IOrderItem[];
  createdAt: Timestamp | Date;
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "out-for-delivery"
    | "delivered"
    | "returned"
    | "canceled"
    | "return-requested";
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  paymentMethod: "khalti" | "esewa" | "cod";
  customer: {
    name: string;
    email: string;
    address: { street: string; city: string };
  };
  userId: string;
  returnRequestId?: string; // Reference to return request if exists
  deliveredAt?: Timestamp | Date | FieldValue; // Track when order was delivered for return window
}

export interface IUser {
  id?: string;
  username: string;
  email: string;
  password?: string; // Not stored in Firebase Auth
  wishlist: string[];
  cart: ICartItem[];
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface ICategory {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface IProduct {
  id?: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  image: string;
  description?: string;
  discountPercentage?: number;
  stockQuantity: number;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// Firebase collection names
export const COLLECTIONS = {
  USERS: "users",
  PRODUCTS: "products",
  ORDERS: "orders",
  RETURN_REQUESTS: "return_requests",
  CATEGORIES: "categories",
} as const;

// Helper function to convert Firestore Timestamp to Date
export const timestampToDate = (timestamp: Timestamp | Date): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return timestamp;
};

// Helper function to convert Date to Firestore Timestamp
export const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};
