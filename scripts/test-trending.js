// Test script for trending products functionality
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');
require('dotenv').config();

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testTrendingProducts() {
  try {
    console.log('Testing trending products functionality...\n');
    
    // Get all orders
    console.log('1. Fetching all orders...');
    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    const orders = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(`   Found ${orders.length} orders`);
    
    // Count purchases for each product
    console.log('\n2. Counting purchases for each product...');
    const purchaseCounts = {};
    
    orders.forEach(order => {
      if (order.status === 'delivered') {
        order.items.forEach(item => {
          const productId = item.productId;
          purchaseCounts[productId] = (purchaseCounts[productId] || 0) + item.quantity;
        });
      }
    });
    
    console.log('   Purchase counts:', purchaseCounts);
    
    // Get all products
    console.log('\n3. Fetching all products...');
    const productsSnapshot = await getDocs(collection(db, 'products'));
    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(`   Found ${products.length} products`);
    
    // Add purchase count to each product and sort
    console.log('\n4. Calculating trending products...');
         const productsWithCounts = products
       .map(product => ({
         ...product,
         purchaseCount: purchaseCounts[product.id] || 0
       }))
       .filter(product => product.purchaseCount > 0)
       .sort((a, b) => b.purchaseCount - a.purchaseCount)
       .slice(0, 4);
    
    console.log('   Top trending products:');
    productsWithCounts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - ${product.purchaseCount} sold`);
    });
    
    console.log('\n✅ Trending products test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing trending products:', error);
  }
}

// Run the test
testTrendingProducts();
