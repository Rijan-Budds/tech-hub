import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS, IUser, IProduct, IOrder, ICartItem, timestampToDate } from './firebase-models';

// User operations
export const userService = {
  // Create a new user
  async createUser(userData: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const userRef = await addDoc(collection(db, COLLECTIONS.USERS), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return userRef.id;
  },

  // Get user by ID
  async getUserById(userId: string): Promise<IUser | null> {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        id: userDoc.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      } as IUser;
    }
    return null;
  },

  // Get user by email
  async getUserByEmail(email: string): Promise<IUser | null> {
    const q = query(collection(db, COLLECTIONS.USERS), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const data = userDoc.data();
      return {
        id: userDoc.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      } as IUser;
    }
    return null;
  },

  // Update user
  async updateUser(userId: string, updates: Partial<IUser>): Promise<void> {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  // Update user cart
  async updateUserCart(userId: string, cart: ICartItem[]): Promise<void> {
    await this.updateUser(userId, { cart });
  },

  // Update user wishlist
  async updateUserWishlist(userId: string, wishlist: string[]): Promise<void> {
    await this.updateUser(userId, { wishlist });
  },

  // Get all users (for admin)
  async getAllUsers(): Promise<IUser[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      } as IUser;
    });
  },

  // Delete user
  async deleteUser(userId: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.USERS, userId));
  },
};

// Product operations
export const productService = {
  // Create a new product
  async createProduct(productData: Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const productRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return productRef.id;
  },

  // Get all products (simplified - no ordering to avoid index requirements)
  async getAllProducts(): Promise<IProduct[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      } as IProduct;
    });
  },

  // Get all products with pagination and sorting
  async getAllProductsWithPagination(page: number, limit: number, sortBy: string = 'createdAt', sortOrder: string = 'desc'): Promise<{ products: IProduct[], totalCount: number }> {
    try {
      // First get total count
      const allProducts = await this.getAllProducts();
      const totalCount = allProducts.length;
      
      // Sort products
      const sortedProducts = allProducts.sort((a, b) => {
        let aValue: unknown = a[sortBy as keyof IProduct];
        let bValue: unknown = b[sortBy as keyof IProduct];
        
        // Handle date sorting
        if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
          aValue = aValue ? new Date(aValue as string | Date).getTime() : 0;
          bValue = bValue ? new Date(bValue as string | Date).getTime() : 0;
        }
        
        // Handle string sorting
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = (bValue as string).toLowerCase();
        }
        
        if (sortOrder === 'desc') {
          return (bValue as number) > (aValue as number) ? 1 : (bValue as number) < (aValue as number) ? -1 : 0;
        } else {
          return (aValue as number) > (bValue as number) ? 1 : (aValue as number) < (bValue as number) ? -1 : 0;
        }
      });
      
      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = sortedProducts.slice(startIndex, endIndex);
      
      return {
        products: paginatedProducts,
        totalCount
      };
    } catch (error) {
      console.error('Error in getAllProductsWithPagination:', error);
      // Fallback to simple getAllProducts
      const products = await this.getAllProducts();
      return {
        products: products.slice((page - 1) * limit, page * limit),
        totalCount: products.length
      };
    }
  },

  // Get product by ID
  async getProductById(productId: string): Promise<IProduct | null> {
    const productDoc = await getDoc(doc(db, COLLECTIONS.PRODUCTS, productId));
    if (productDoc.exists()) {
      const data = productDoc.data();
      return {
        id: productDoc.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      } as IProduct;
    }
    return null;
  },

  // Get product by slug
  async getProductBySlug(slug: string): Promise<IProduct | null> {
    const q = query(collection(db, COLLECTIONS.PRODUCTS), where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const productDoc = querySnapshot.docs[0];
      const data = productDoc.data();
      return {
        id: productDoc.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      } as IProduct;
    }
    return null;
  },

  // Get products by category (simplified - no ordering to avoid index requirements)
  async getProductsByCategory(category: string): Promise<IProduct[]> {
    const q = query(collection(db, COLLECTIONS.PRODUCTS), where('category', '==', category));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      } as IProduct;
    });
  },

  // Get products by category with pagination and sorting
  async getProductsByCategoryWithPagination(category: string, page: number, limit: number, sortBy: string = 'createdAt', sortOrder: string = 'desc'): Promise<{ products: IProduct[], totalCount: number }> {
    try {
      // Get all products in category
      const categoryProducts = await this.getProductsByCategory(category);
      const totalCount = categoryProducts.length;
      
      // Sort products
      const sortedProducts = categoryProducts.sort((a, b) => {
        let aValue: unknown = a[sortBy as keyof IProduct];
        let bValue: unknown = b[sortBy as keyof IProduct];
        
        // Handle date sorting
        if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
          aValue = aValue ? new Date(aValue as string | Date).getTime() : 0;
          bValue = bValue ? new Date(bValue as string | Date).getTime() : 0;
        }
        
        // Handle string sorting
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = (bValue as string).toLowerCase();
        }
        
        if (sortOrder === 'desc') {
          return (bValue as number) > (aValue as number) ? 1 : (bValue as number) < (aValue as number) ? -1 : 0;
        } else {
          return (aValue as number) > (bValue as number) ? 1 : (aValue as number) < (bValue as number) ? -1 : 0;
        }
      });
      
      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = sortedProducts.slice(startIndex, endIndex);
      
      return {
        products: paginatedProducts,
        totalCount
      };
    } catch (error) {
      console.error('Error in getProductsByCategoryWithPagination:', error);
      // Fallback to simple getProductsByCategory
      const products = await this.getProductsByCategory(category);
      return {
        products: products.slice((page - 1) * limit, page * limit),
        totalCount: products.length
      };
    }
  },

  // Search products (simplified - basic search without complex queries)
  async searchProducts(searchTerm: string): Promise<IProduct[]> {
    // Simple approach: get all products and filter in memory
    // This avoids complex Firestore queries that require indexes
    const allProducts = await this.getAllProducts();
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(lowerSearchTerm) ||
      product.slug.toLowerCase().includes(lowerSearchTerm) ||
      product.category.toLowerCase().includes(lowerSearchTerm)
    );
  },

  // Search products with pagination and sorting
  async searchProductsWithPagination(searchTerm: string, page: number, limit: number, sortBy: string = 'createdAt', sortOrder: string = 'desc'): Promise<{ products: IProduct[], totalCount: number }> {
    try {
      // Get all products and filter
      const allProducts = await this.getAllProducts();
      const lowerSearchTerm = searchTerm.toLowerCase();
      
      const filteredProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(lowerSearchTerm) ||
        product.slug.toLowerCase().includes(lowerSearchTerm) ||
        product.category.toLowerCase().includes(lowerSearchTerm)
      );
      
      const totalCount = filteredProducts.length;
      
      // Sort products
      const sortedProducts = filteredProducts.sort((a, b) => {
        let aValue: unknown = a[sortBy as keyof IProduct];
        let bValue: unknown = b[sortBy as keyof IProduct];
        
        // Handle date sorting
        if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
          aValue = aValue ? new Date(aValue as string | Date).getTime() : 0;
          bValue = bValue ? new Date(bValue as string | Date).getTime() : 0;
        }
        
        // Handle string sorting
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = (bValue as string).toLowerCase();
        }
        
        if (sortOrder === 'desc') {
          return (bValue as number) > (aValue as number) ? 1 : (bValue as number) < (aValue as number) ? -1 : 0;
        } else {
          return (aValue as number) > (bValue as number) ? 1 : (aValue as number) < (bValue as number) ? -1 : 0;
        }
      });
      
      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = sortedProducts.slice(startIndex, endIndex);
      
      return {
        products: paginatedProducts,
        totalCount
      };
    } catch (error) {
      console.error('Error in searchProductsWithPagination:', error);
      // Fallback to simple searchProducts
      const products = await this.searchProducts(searchTerm);
      return {
        products: products.slice((page - 1) * limit, page * limit),
        totalCount: products.length
      };
    }
  },

  // Update product
  async updateProduct(productId: string, updates: Partial<IProduct>): Promise<void> {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    await updateDoc(productRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  // Delete product
  async deleteProduct(productId: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, productId));
  },

  // Get trending products based on purchase count
  async getTrendingProducts(limit: number = 8): Promise<IProduct[]> {
    try {
      // Get all orders
      const allOrders = await orderService.getAllOrders();
      
      // Count purchases for each product
      const purchaseCounts: { [productId: string]: number } = {};
      
      allOrders.forEach(order => {
        // Only count delivered orders to ensure they were actually purchased
        if (order.status === 'delivered') {
          order.items.forEach(item => {
            const productId = item.productId;
            purchaseCounts[productId] = (purchaseCounts[productId] || 0) + item.quantity;
          });
        }
      });
      
      // Get all products
      const allProducts = await this.getAllProducts();
      
      // Add purchase count to each product and filter out products with less than 15 sales
      const productsWithCounts = allProducts
        .map(product => ({
          ...product,
          purchaseCount: purchaseCounts[product.id!] || 0
        }))
        .filter(product => product.purchaseCount >= 15) // Only products with 15+ sales
        .sort((a, b) => b.purchaseCount - a.purchaseCount) // Sort by purchase count (descending)
        .slice(0, limit); // Get top N products
      
      return productsWithCounts;
    } catch (error) {
      console.error('Error getting trending products:', error);
      // Fallback to random products if there's an error
      const allProducts = await this.getAllProducts();
      return allProducts.slice(0, limit);
    }
  },
};

// Order operations
export const orderService = {
  // Create a new order
  async createOrder(orderData: Omit<IOrder, 'id' | 'createdAt'>): Promise<string> {
    const orderRef = await addDoc(collection(db, COLLECTIONS.ORDERS), {
      ...orderData,
      createdAt: serverTimestamp(),
    });
    return orderRef.id;
  },

  // Get order by ID
  async getOrderById(orderId: string): Promise<IOrder | null> {
    const orderDoc = await getDoc(doc(db, COLLECTIONS.ORDERS, orderId));
    if (orderDoc.exists()) {
      const data = orderDoc.data();
      return {
        id: orderDoc.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
      } as IOrder;
    }
    return null;
  },

  // Get orders by user ID (simplified - no ordering to avoid index requirements)
  async getOrdersByUserId(userId: string): Promise<IOrder[]> {
    const q = query(collection(db, COLLECTIONS.ORDERS), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
      } as IOrder;
    });
  },

  // Get all orders (for admin) - simplified
  async getAllOrders(): Promise<IOrder[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.ORDERS));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
      } as IOrder;
    });
  },

  // Get all orders with pagination and sorting
  async getAllOrdersWithPagination(page: number, limit: number, sortBy: string = 'createdAt', sortOrder: string = 'desc'): Promise<{ orders: IOrder[], totalCount: number }> {
    try {
      // First get total count
      const allOrders = await this.getAllOrders();
      const totalCount = allOrders.length;
      
      // Sort orders
      const sortedOrders = allOrders.sort((a, b) => {
        let aValue: unknown = a[sortBy as keyof IOrder];
        let bValue: unknown = b[sortBy as keyof IOrder];
        
        // Handle date sorting
        if (sortBy === 'createdAt') {
          aValue = aValue ? new Date(aValue as string | Date).getTime() : 0;
          bValue = bValue ? new Date(bValue as string | Date).getTime() : 0;
        }
        
        // Handle string sorting
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = (bValue as string).toLowerCase();
        }
        
        // Handle number sorting
        if (typeof aValue === 'number') {
          // Keep as is for number comparison
        }
        
        if (sortOrder === 'desc') {
          return (bValue as number) > (aValue as number) ? 1 : (bValue as number) < (aValue as number) ? -1 : 0;
        } else {
          return (aValue as number) > (bValue as number) ? 1 : (aValue as number) < (bValue as number) ? -1 : 0;
        }
      });
      
      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedOrders = sortedOrders.slice(startIndex, endIndex);
      
      return {
        orders: paginatedOrders,
        totalCount
      };
    } catch (error) {
      console.error('Error in getAllOrdersWithPagination:', error);
      // Fallback to simple getAllOrders
      const orders = await this.getAllOrders();
      return {
        orders: orders.slice((page - 1) * limit, page * limit),
        totalCount: orders.length
      };
    }
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: IOrder['status']): Promise<void> {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
    await updateDoc(orderRef, { status });
  },

  // Update order (general)
  async updateOrder(orderId: string, updates: Partial<IOrder>): Promise<void> {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
    await updateDoc(orderRef, updates);
  },

  // Delete order
  async deleteOrder(orderId: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.ORDERS, orderId));
  },
};

// Batch operations for complex transactions
export const batchService = {
  // Create order and clear user cart in one transaction
  async createOrderAndClearCart(orderData: Omit<IOrder, 'id' | 'createdAt'>, userId: string): Promise<string> {
    const batch = writeBatch(db);
    
    // Add order
    const orderRef = doc(collection(db, COLLECTIONS.ORDERS));
    batch.set(orderRef, {
      ...orderData,
      createdAt: serverTimestamp(),
    });
    
    // Clear user cart
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    batch.update(userRef, {
      cart: [],
      updatedAt: serverTimestamp(),
    });
    
    // Reduce stock quantities for each product in the order
    for (const item of orderData.items) {
      const productRef = doc(db, COLLECTIONS.PRODUCTS, item.productId);
      batch.update(productRef, {
        stockQuantity: increment(-item.quantity),
        updatedAt: serverTimestamp(),
      });
    }
    
    await batch.commit();
    return orderRef.id;
  },

  // Cancel order and restore stock quantities
  async cancelOrderAndRestoreStock(orderId: string): Promise<void> {
    const batch = writeBatch(db);
    
    // Get the order to restore stock
    const order = await orderService.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    
    // Update order status to canceled
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
    batch.update(orderRef, { 
      status: 'canceled',
      updatedAt: serverTimestamp(),
    });
    
    // Restore stock quantities for each product in the order
    for (const item of order.items) {
      const productRef = doc(db, COLLECTIONS.PRODUCTS, item.productId);
      batch.update(productRef, {
        stockQuantity: increment(item.quantity),
        updatedAt: serverTimestamp(),
      });
    }
    
    await batch.commit();
  },
};
