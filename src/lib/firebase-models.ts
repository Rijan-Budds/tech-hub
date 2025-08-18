import { Timestamp } from 'firebase/firestore';

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

export interface IOrder {
  id?: string;
  items: IOrderItem[];
  createdAt: Timestamp | Date;
  status: "pending" | "canceled" | "delivered";
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
  USERS: 'users',
  PRODUCTS: 'products',
  ORDERS: 'orders',
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
