import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  image: string;
  description?: string;
  discountPercentage?: number;
  stockQuantity: number;
}

interface CompareStore {
  compareProducts: Product[];
  isCompareModalOpen: boolean;
  isProductSelectorOpen: boolean;
  selectedProductForComparison: Product | null;
  
  // Actions
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  openCompareModal: () => void;
  closeCompareModal: () => void;
  openProductSelector: (product: Product) => void;
  closeProductSelector: () => void;
  canAddToCompare: () => boolean;
  isProductInCompare: (productId: string) => boolean;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      compareProducts: [],
      isCompareModalOpen: false,
      isProductSelectorOpen: false,
      selectedProductForComparison: null,

      addToCompare: (product) => {
        const { compareProducts } = get();
        
        // Check if product is already in compare list
        if (compareProducts.some(p => p.id === product.id)) {
          return;
        }
        
        // Maximum 2 products for comparison
        if (compareProducts.length >= 2) {
          return;
        }
        
        set({ compareProducts: [...compareProducts, product] });
      },

      removeFromCompare: (productId) => {
        set((state) => ({
          compareProducts: state.compareProducts.filter(p => p.id !== productId)
        }));
      },

      clearCompare: () => {
        set({ compareProducts: [] });
      },

      openCompareModal: () => {
        set({ isCompareModalOpen: true });
      },

      closeCompareModal: () => {
        set({ isCompareModalOpen: false });
      },

      openProductSelector: (product) => {
        set({ 
          isProductSelectorOpen: true,
          selectedProductForComparison: product
        });
      },

      closeProductSelector: () => {
        set({ 
          isProductSelectorOpen: false,
          selectedProductForComparison: null
        });
      },

      canAddToCompare: () => {
        return get().compareProducts.length < 2;
      },

      isProductInCompare: (productId) => {
        return get().compareProducts.some(p => p.id === productId);
      },
    }),
    {
      name: 'compare-products', // localStorage key
      partialize: (state) => ({ compareProducts: state.compareProducts }), // Only persist compareProducts
    }
  )
);