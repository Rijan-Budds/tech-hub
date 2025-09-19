// Simple script to seed categories via the API
// Run with: node seed-categories.js
// Make sure your dev server is running on localhost:3000 or localhost:3001

const initialCategories = [
  {
    name: "CPUs",
    description: "High-performance processors for gaming and professional workloads",
    image: "/home/category1.jpg"
  },
  {
    name: "Keyboards", 
    description: "Mechanical & wireless keyboards for productivity and gaming",
    image: "/home/category2.jpg"
  },
  {
    name: "Monitors",
    description: "4K & gaming monitors with stunning display quality",
    image: "/home/category3.jpg"
  },
  {
    name: "Speakers",
    description: "Premium audio systems for immersive sound experience",
    image: "/home/category4.jpg"
  },
  {
    name: "Mice",
    description: "Gaming & wireless mice with precision and speed",
    image: "/home/category5.jpg"
  },
  {
    name: "Graphics Cards",
    description: "High-performance GPUs for gaming and rendering",
    image: "/home/category6.jpg"
  }
];

async function seedCategories() {
  console.log('🌱 Starting category seeding...');
  
  // Try different ports
  const ports = [3000, 3001, 3002];
  let baseUrl = null;
  
  for (const port of ports) {
    try {
      const testUrl = `http://localhost:${port}/api/categories`;
      const response = await fetch(testUrl);
      if (response.ok) {
        baseUrl = `http://localhost:${port}`;
        console.log(`✅ Found server running on port ${port}`);
        break;
      }
    } catch (error) {
      // Continue to next port
    }
  }
  
  if (!baseUrl) {
    console.error('❌ No server found on ports 3000, 3001, or 3002. Make sure your dev server is running.');
    return;
  }

  // First, check existing categories
  try {
    const response = await fetch(`${baseUrl}/api/categories`);
    const data = await response.json();
    console.log(`📊 Found ${data.categories?.length || 0} existing categories`);
  } catch (error) {
    console.log('⚠️ Could not fetch existing categories, continuing...');
  }

  let added = 0;
  let errors = 0;

  for (const category of initialCategories) {
    try {
      console.log(`🔄 Adding category: ${category.name}`);
      
      const response = await fetch(`${baseUrl}/api/admin/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      });

      const result = await response.json();

      if (response.ok) {
        console.log(`✅ Added: ${category.name} (${result.category?.slug || 'unknown-slug'})`);
        added++;
      } else {
        if (result.error && result.error.includes('already exists')) {
          console.log(`⚠️ Already exists: ${category.name}`);
        } else {
          console.log(`❌ Failed to add ${category.name}: ${result.error || result.message}`);
          errors++;
        }
      }
    } catch (error) {
      console.log(`❌ Error adding ${category.name}:`, error.message);
      errors++;
    }
  }

  console.log('\n🎉 Seeding completed!');
  console.log(`📈 Results: ${added} added, ${errors} errors`);
  console.log('\n💡 You can now see these categories in your admin panel and on the frontend!');
}

// Check if running directly
if (typeof require !== 'undefined' && require.main === module) {
  seedCategories().catch(console.error);
}

module.exports = { seedCategories };