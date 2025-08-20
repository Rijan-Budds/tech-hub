"use client";
import { create } from "zustand";

interface Product {
  id: string; 
  slug: string; 
  name: string; 
  price: number; 
  image: string; 
  category: string  
}

interface CartItem { 
  productId: string; 
  quantity: number; 
  product?: Product | null;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  fetchCart: () => Promise<void>;
  add: (productId: string, quantity?: number) => Promise<void>;
  update: (productId: string, quantity: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  fetchCart: async () => {
    // Prevent multiple simultaneous calls
    if (get().loading) {
      console.log('Cart fetch already in progress, skipping...');
      return;
    }
    
    set({ loading: true });
    try {
      const res = await fetch(`/api/cart`, { credentials: "include" });
      const data = await res.json();
      set({ items: data.items ?? [] });
    } catch (error) {
      console.error('Error fetching cart:', error);
      // Don't update state on error to prevent infinite loops
    } finally {
      set({ loading: false });
    }
  },
  add: async (productId, quantity = 1) => {
    const res = await fetch(`/api/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: 'add', productId, quantity }),
    });
    if (res.ok) {
      // Update local state instead of refetching
      const currentItems = get().items;
      const existingItem = currentItems.find(item => item.productId === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
        set({ items: [...currentItems] });
      } else {
        // Add placeholder item - will be filled with product details on next fetchCart
        set({ items: [...currentItems, { productId, quantity, product: null }] });
      }
    }
  },
  update: async (productId, quantity) => {
    const res = await fetch(`/api/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: 'update', productId, quantity }),
    });
    if (res.ok) {
      // Update local state instead of refetching
      const currentItems = get().items;
      if (quantity <= 0) {
        set({ items: currentItems.filter(item => item.productId !== productId) });
      } else {
        const existingItem = currentItems.find(item => item.productId === productId);
        if (existingItem) {
          existingItem.quantity = quantity;
          set({ items: [...currentItems] });
        }
      }
    }
  },
  remove: async (productId) => {
    const res = await fetch(`/api/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: 'remove', productId }),
    });
    if (res.ok) {
      // Update local state instead of refetching
      const currentItems = get().items;
      set({ items: currentItems.filter(item => item.productId !== productId) });
    }
  },
  clearCart: async () => {
    const res = await fetch(`/api/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: 'clear' }),
    });
    if (res.ok) {
      // Clear local state
      set({ items: [] });
    }
  },
}));