const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc } = require('firebase/firestore');

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

async function cleanupTestData() {
  try {
    console.log('🧹 Cleaning up test data...');
    
    // Clean up test products
    console.log('📦 Cleaning test products...');
    const productsSnapshot = await getDocs(collection(db, 'products'));
    let deletedProducts = 0;
    
    for (const doc of productsSnapshot.docs) {
      const data = doc.data();
      // Delete products with placeholder images or test names
      if (data.image && data.image.includes('via.placeholder.com') || 
          data.name === 'Test Product' || 
          data.slug === 'test-product') {
        await deleteDoc(doc.ref);
        deletedProducts++;
        console.log(`🗑️ Deleted test product: ${data.name}`);
      }
    }
    
    // Clean up test users
    console.log('👤 Cleaning test users...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    let deletedUsers = 0;
    
    for (const doc of usersSnapshot.docs) {
      const data = doc.data();
      // Delete test users
      if (data.username === 'testuser' || 
          data.email === 'test@example.com') {
        await deleteDoc(doc.ref);
        deletedUsers++;
        console.log(`🗑️ Deleted test user: ${data.username}`);
      }
    }
    
    console.log('\n✅ Cleanup completed!');
    console.log(`📦 Deleted ${deletedProducts} test products`);
    console.log(`👤 Deleted ${deletedUsers} test users`);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

// Run cleanup if this script is executed directly
if (require.main === module) {
  cleanupTestData();
}

module.exports = { cleanupTestData };
