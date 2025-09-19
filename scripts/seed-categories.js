const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, where } = require('firebase/firestore');

// Firebase configuration (same as in your app)
const firebaseConfig = {
  apiKey: "AIzaSyDhTJBRlkn8xJ0eHbdMfzWwAO9o2HS8-7Y",
  authDomain: "tech-hub-28c48.firebaseapp.com",
  projectId: "tech-hub-28c48",
  storageBucket: "tech-hub-28c48.firebasestorage.app",
  messagingSenderId: "1038924127094",
  appId: "1:1038924127094:web:cf0e2e96b1e69e8b0b7e4b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const initialCategories = [
  {
    name: "CPUs",
    slug: "cpus",
    image: "/home/category1.jpg",
    description: "High-performance processors for gaming and professional workloads",
  },
  {
    name: "Keyboards",
    slug: "keyboards", 
    image: "/home/category2.jpg",
    description: "Mechanical & wireless keyboards for productivity and gaming",
  },
  {
    name: "Monitors",
    slug: "monitors",
    image: "/home/category3.jpg",
    description: "4K & gaming monitors with stunning display quality",
  },
  {
    name: "Speakers",
    slug: "speakers",
    image: "/home/category4.jpg",
    description: "Premium audio systems for immersive sound experience",
  },
  {
    name: "Mice",
    slug: "mice",
    image: "/home/category5.jpg",
    description: "Gaming & wireless mice with precision and speed",
  },
  {
    name: "Graphics Cards",
    slug: "graphics-cards",
    image: "/home/category6.jpg",
    description: "High-performance GPUs for gaming and rendering",
  },
];

async function seedCategories() {
  try {
    console.log('Starting category seeding...');
    
    for (const categoryData of initialCategories) {
      // Check if category with this slug already exists
      const q = query(collection(db, 'categories'), where('slug', '==', categoryData.slug));
      const existingCategories = await getDocs(q);
      
      if (existingCategories.empty) {
        // Add new category
        const docRef = await addDoc(collection(db, 'categories'), {
          ...categoryData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`✓ Added category: ${categoryData.name} (ID: ${docRef.id})`);
      } else {
        console.log(`⚠ Category already exists: ${categoryData.name}`);
      }
    }
    
    console.log('Category seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();