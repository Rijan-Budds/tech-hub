"use client";
import { create } from "zustand";

type User = { id: string; email: string; username: string; role?: string } | null;
type WishlistItem = { id: string; slug: string; name: string; price: number; image: string; category: string };
type OrderItem = { productId: string; quantity: number; name?: string; image?: string; price?: number };
type Order = {
  id?: string;
  items: OrderItem[];
  createdAt: string;
  status: "pending" | "canceled" | "delivered";
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  paymentMethod?: "khalti" | "esewa" | "cod";
  customer: {
    name: string;
    email: string;
    address: { street: string; city: string };
  };
};

interface ProfileState {
  loading: boolean;
  user: User;
  wishlist: WishlistItem[];
  orders: Order[];
  loadProfile: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  removeFromWishlistLocal: (productId: string) => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  loading: false,
  user: null,
  wishlist: [],
  orders: [],
  loadProfile: async () => {
    set({ loading: true });
    try {
      const [meRes, wlRes, ordersRes] = await Promise.all([
        fetch(`/api/me`, { credentials: "include" }),
        fetch(`/api/wishlist`, { credentials: "include" }),
        fetch(`/api/orders`, { credentials: "include" }),
      ]);
      const me = await meRes.json();
      const user = me?.user ?? null;
      const wl = wlRes.ok ? await wlRes.json() : { items: [] };
      const or = ordersRes.ok ? await ordersRes.json() : { orders: [] };
      set({ user, wishlist: wl.items ?? [], orders: or.orders ?? [] });
    } catch {
      set({ user: null, wishlist: [], orders: [] });
    } finally {
      set({ loading: false });
    }
  },
  refreshOrders: async () => {
    try {
      const ordersRes = await fetch(`/api/orders`, { credentials: "include" });
      const or = ordersRes.ok ? await ordersRes.json() : { orders: [] };
      set({ orders: or.orders ?? [] });
      console.log("Orders refreshed:", or.orders);
    } catch (error) {
      console.error("Failed to refresh orders:", error);
    }
  },
  removeFromWishlistLocal: (productId) =>
    set({ wishlist: get().wishlist.filter((p) => p.id !== productId) }),
}));


