const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, serverTimestamp } = require('firebase/firestore');

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

async function testFirebaseConnection() {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Test 1: Add a test product
    console.log('📝 Adding test product...');
    const testProduct = {
      name: 'Test Product',
      slug: 'test-product',
      price: 99.99,
      category: 'Electronics',
      image: 'https://via.placeholder.com/300x300',
      discountPercentage: 0,
      inStock: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const productRef = await addDoc(collection(db, 'products'), testProduct);
    console.log(`✅ Test product added with ID: ${productRef.id}`);
    
    // Test 2: Read products
    console.log('📖 Reading products...');
    const productsSnapshot = await getDocs(collection(db, 'products'));
    console.log(`✅ Found ${productsSnapshot.size} products in database`);
    
    // Test 3: Add a test user
    console.log('👤 Adding test user...');
    const testUser = {
      username: 'testuser',
      email: 'test@example.com',
      wishlist: [],
      cart: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const userRef = await addDoc(collection(db, 'users'), testUser);
    console.log(`✅ Test user added with ID: ${userRef.id}`);
    
    // Test 4: Read users
    console.log('👥 Reading users...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log(`✅ Found ${usersSnapshot.size} users in database`);
    
    console.log('\n🎉 All Firebase tests passed! Your setup is working correctly.');
    console.log('\n📊 Database Collections:');
    console.log(`   - Products: ${productsSnapshot.size} documents`);
    console.log(`   - Users: ${usersSnapshot.size} documents`);
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    console.error('Error details:', error.message);
  }
}

// Run test if this script is executed directly
if (require.main === module) {
  testFirebaseConnection();
}

module.exports = { testFirebaseConnection };
