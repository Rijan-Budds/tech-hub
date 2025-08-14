const { MongoClient } = require('mongodb');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAnLUzK9h8jR9pYvrajHsOu4kvCoihki6o",
  authDomain: "ecommerce-app-da180.firebaseapp.com",
  projectId: "ecommerce-app-da180",
  storageBucket: "ecommerce-app-da180.firebasestorage.app",
  messagingSenderId: "720943276086",
  appId: "1:720943276086:web:df8451e08a59923ca3b897",
  measurementId: "G-1V37XLN5JV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// MongoDB connection
const MONGO_URI = process.env.MONGODB_URI;

async function migrateData() {
  const mongoClient = new MongoClient(MONGO_URI);
  
  try {
    console.log('Connecting to MongoDB...');
    await mongoClient.connect();
    const mongoDb = mongoClient.db();
    
    console.log('Starting migration...');
    
    // Migrate Products
    console.log('Migrating products...');
    const products = await mongoDb.collection('products').find({}).toArray();
    for (const product of products) {
      const productData = {
        name: product.name,
        slug: product.slug,
        price: product.price,
        category: product.category,
        image: product.image,
        discountPercentage: product.discountPercentage || 0,
        inStock: product.inStock !== false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await addDoc(collection(db, 'products'), productData);
      console.log(`Migrated product: ${product.name}`);
    }
    
    // Migrate Users
    console.log('Migrating users...');
    const users = await mongoDb.collection('users').find({}).toArray();
    for (const user of users) {
      const userData = {
        username: user.username,
        email: user.email,
        wishlist: user.wishlist || [],
        cart: user.cart || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await addDoc(collection(db, 'users'), userData);
      console.log(`Migrated user: ${user.username}`);
    }
    
    // Migrate Orders (if they exist as separate collection)
    console.log('Migrating orders...');
    const orders = await mongoDb.collection('orders').find({}).toArray();
    for (const order of orders) {
      const orderData = {
        items: order.items || [],
        status: order.status || 'pending',
        subtotal: order.subtotal || 0,
        deliveryFee: order.deliveryFee || 0,
        grandTotal: order.grandTotal || 0,
        customer: order.customer || {},
        userId: order.userId || '',
        createdAt: serverTimestamp(),
      };
      
      await addDoc(collection(db, 'orders'), orderData);
      console.log(`Migrated order: ${order._id}`);
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoClient.close();
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateData();
}

module.exports = { migrateData };
