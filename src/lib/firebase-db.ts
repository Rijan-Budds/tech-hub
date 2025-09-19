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
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS, IUser, IProduct, IOrder, ICartItem, IReturnRequest, ICategory, timestampToDate } from './firebase-models';

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

  // Get all users with pagination and sorting
  async getAllUsersWithPagination(page: number, limit: number, sortBy: string = 'createdAt', sortOrder: string = 'desc'): Promise<{ users: IUser[], totalCount: number }> {
    try {
      // First get total count
      const allUsers = await this.getAllUsers();
      const totalCount = allUsers.length;
      
      // Sort users
      const sortedUsers = allUsers.sort((a, b) => {
        let aValue: unknown = a[sortBy as keyof IUser];
        let bValue: unknown = b[sortBy as keyof IUser];
        
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
      const paginatedUsers = sortedUsers.slice(startIndex, endIndex);
      
      return {
        users: paginatedUsers,
        totalCount
      };
    } catch (error) {
      console.error('Error in getAllUsersWithPagination:', error);
      // Fallback to simple getAllUsers
      const users = await this.getAllUsers();
      return {
        users: users.slice((page - 1) * limit, page * limit),
        totalCount: users.length
      };
    }
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

// Return Request operations
export const returnService = {
  // Create a new return request
  async createReturnRequest(returnData: Omit<IReturnRequest, 'id' | 'requestedAt'>): Promise<string> {
    const returnRef = await addDoc(collection(db, COLLECTIONS.RETURN_REQUESTS), {
      ...returnData,
      requestedAt: serverTimestamp(),
    });
    return returnRef.id;
  },

  // Get return request by ID
  async getReturnRequestById(returnId: string): Promise<IReturnRequest | null> {
    const returnDoc = await getDoc(doc(db, COLLECTIONS.RETURN_REQUESTS, returnId));
    if (returnDoc.exists()) {
      const data = returnDoc.data();
      return {
        id: returnDoc.id,
        ...data,
        requestedAt: timestampToDate(data.requestedAt),
        processedAt: data.processedAt ? timestampToDate(data.processedAt) : undefined,
      } as IReturnRequest;
    }
    return null;
  },

  // Get return requests by user ID
  async getReturnRequestsByUserId(userId: string): Promise<IReturnRequest[]> {
    const q = query(collection(db, COLLECTIONS.RETURN_REQUESTS), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        requestedAt: timestampToDate(data.requestedAt),
        processedAt: data.processedAt ? timestampToDate(data.processedAt) : undefined,
      } as IReturnRequest;
    });
  },

  // Get return request by order ID
  async getReturnRequestByOrderId(orderId: string): Promise<IReturnRequest | null> {
    const q = query(collection(db, COLLECTIONS.RETURN_REQUESTS), where('orderId', '==', orderId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const returnDoc = querySnapshot.docs[0];
      const data = returnDoc.data();
      return {
        id: returnDoc.id,
        ...data,
        requestedAt: timestampToDate(data.requestedAt),
        processedAt: data.processedAt ? timestampToDate(data.processedAt) : undefined,
      } as IReturnRequest;
    }
    return null;
  },

  // Get all return requests (for admin)
  async getAllReturnRequests(): Promise<IReturnRequest[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.RETURN_REQUESTS));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        requestedAt: timestampToDate(data.requestedAt),
        processedAt: data.processedAt ? timestampToDate(data.processedAt) : undefined,
      } as IReturnRequest;
    });
  },

  // Get all return requests with pagination and sorting
  async getAllReturnRequestsWithPagination(
    page: number, 
    limit: number, 
    sortBy: string = 'requestedAt', 
    sortOrder: string = 'desc',
    statusFilter?: string
  ): Promise<{ returnRequests: IReturnRequest[], totalCount: number }> {
    try {
      let allReturns = await this.getAllReturnRequests();
      
      // Apply status filter if provided
      if (statusFilter && statusFilter !== 'all') {
        allReturns = allReturns.filter(returnRequest => returnRequest.status === statusFilter);
      }
      
      const totalCount = allReturns.length;
      
      // Sort return requests
      const sortedReturns = allReturns.sort((a, b) => {
        let aValue: unknown = a[sortBy as keyof IReturnRequest];
        let bValue: unknown = b[sortBy as keyof IReturnRequest];
        
        // Handle date sorting
        if (sortBy === 'requestedAt' || sortBy === 'processedAt') {
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
      const paginatedReturns = sortedReturns.slice(startIndex, endIndex);
      
      return {
        returnRequests: paginatedReturns,
        totalCount
      };
    } catch (error) {
      console.error('Error in getAllReturnRequestsWithPagination:', error);
      const returnRequests = await this.getAllReturnRequests();
      return {
        returnRequests: returnRequests.slice((page - 1) * limit, page * limit),
        totalCount: returnRequests.length
      };
    }
  },

  // Update return request
  async updateReturnRequest(returnId: string, updates: Partial<IReturnRequest>): Promise<void> {
    const returnRef = doc(db, COLLECTIONS.RETURN_REQUESTS, returnId);
    const updateData = {
      ...updates,
    };
    
    // Add processedAt timestamp if status is being changed from pending
    if (updates.status && updates.status !== 'pending') {
      updateData.processedAt = serverTimestamp();
    }
    
    await updateDoc(returnRef, updateData);
  },

  // Delete return request
  async deleteReturnRequest(returnId: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.RETURN_REQUESTS, returnId));
  },

  // Check if order is eligible for return (within 7 days)
  isOrderEligibleForReturn(order: IOrder): boolean {
    if (order.status !== 'delivered') return false;
    
    // If no deliveredAt timestamp, fall back to using createdAt + reasonable delivery time
    // This handles existing delivered orders that don't have deliveredAt set
    let referenceDate: Date;
    if (order.deliveredAt && (order.deliveredAt instanceof Timestamp || order.deliveredAt instanceof Date)) {
      referenceDate = timestampToDate(order.deliveredAt);
    } else {
      // For orders without deliveredAt, assume they were delivered 3 days after creation
      // This is a reasonable fallback for existing data
      const createdDate = timestampToDate(order.createdAt);
      referenceDate = new Date(createdDate.getTime() + (3 * 24 * 60 * 60 * 1000)); // Add 3 days
    }
    
    const now = new Date();
    const daysDifference = Math.floor((now.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysDifference <= 7;
  },
};

// Category operations
export const categoryService = {
  // Create a new category
  async createCategory(categoryData: Omit<ICategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const categoryRef = await addDoc(collection(db, COLLECTIONS.CATEGORIES), {
      ...categoryData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return categoryRef.id;
  },

  // Get all categories
  async getAllCategories(): Promise<ICategory[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      } as ICategory;
    });
  },

  // Get all categories with pagination and sorting
  async getAllCategoriesWithPagination(page: number, limit: number, sortBy: string = 'createdAt', sortOrder: string = 'desc'): Promise<{ categories: ICategory[], totalCount: number }> {
    try {
      // First get total count
      const allCategories = await this.getAllCategories();
      const totalCount = allCategories.length;
      
      // Sort categories
      const sortedCategories = allCategories.sort((a, b) => {
        let aValue: unknown = a[sortBy as keyof ICategory];
        let bValue: unknown = b[sortBy as keyof ICategory];
        
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
      const paginatedCategories = sortedCategories.slice(startIndex, endIndex);
      
      return {
        categories: paginatedCategories,
        totalCount
      };
    } catch (error) {
      console.error('Error in getAllCategoriesWithPagination:', error);
      // Fallback to simple getAllCategories
      const categories = await this.getAllCategories();
      return {
        categories: categories.slice((page - 1) * limit, page * limit),
        totalCount: categories.length
      };
    }
  },

  // Get category by ID
  async getCategoryById(categoryId: string): Promise<ICategory | null> {
    const categoryDoc = await getDoc(doc(db, COLLECTIONS.CATEGORIES, categoryId));
    if (categoryDoc.exists()) {
      const data = categoryDoc.data();
      return {
        id: categoryDoc.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      } as ICategory;
    }
    return null;
  },

  // Get category by slug
  async getCategoryBySlug(slug: string): Promise<ICategory | null> {
    const q = query(collection(db, COLLECTIONS.CATEGORIES), where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const categoryDoc = querySnapshot.docs[0];
      const data = categoryDoc.data();
      return {
        id: categoryDoc.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      } as ICategory;
    }
    return null;
  },

  // Update category
  async updateCategory(categoryId: string, updates: Partial<ICategory>): Promise<void> {
    const categoryRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
    await updateDoc(categoryRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  // Delete category
  async deleteCategory(categoryId: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.CATEGORIES, categoryId));
  },
};
