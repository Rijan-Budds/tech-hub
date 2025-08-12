"use client";
import { create } from "zustand";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

type CartItem = { productId: string; quantity: number; product?: any };

interface CartState {
  items: CartItem[];
  fetchCart: () => Promise<void>;
  add: (productId: string, quantity?: number) => Promise<void>;
  update: (productId: string, quantity: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  fetchCart: async () => {
    const res = await fetch(`${API}/cart`, { credentials: "include" });
    const data = await res.json();
    set({ items: data.items ?? [] });
  },
  add: async (productId, quantity = 1) => {
    await fetch(`${API}/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ productId, quantity }),
    });
    await get().fetchCart();
  },
  update: async (productId, quantity) => {
    await fetch(`${API}/cart/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ productId, quantity }),
    });
    await get().fetchCart();
  },
  remove: async (productId) => {
    await fetch(`${API}/cart/remove`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ productId }),
    });
    await get().fetchCart();
  },
}));


