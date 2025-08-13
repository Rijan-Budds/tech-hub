const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

// Product Schema
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);

// Mapping of old local paths to new Cloudinary URLs
const imageMapping = {
  '/uploads/1754982358819-3ce2fb262f3c.jpeg': 'https://res.cloudinary.com/dgjliothg/image/upload/v1755064524/ecommerce/1754982358819-3ce2fb262f3c.jpg',
  '/uploads/1754982718697-7fda08f0d6c7.jpeg': 'https://res.cloudinary.com/dgjliothg/image/upload/v1755064525/ecommerce/1754982718697-7fda08f0d6c7.jpg',
  '/uploads/1755006843174-5a3162a56ef0.jpeg': 'https://res.cloudinary.com/dgjliothg/image/upload/v1755064526/ecommerce/1755006843174-5a3162a56ef0.jpg',
  '/uploads/1755007217009-bde8a759006a.jpeg': 'https://res.cloudinary.com/dgjliothg/image/upload/v1755064527/ecommerce/1755007217009-bde8a759006a.jpg',
  '/uploads/1755007445694-684c4ba20620.jpeg': 'https://res.cloudinary.com/dgjliothg/image/upload/v1755064528/ecommerce/1755007445694-684c4ba20620.jpg',
  '/uploads/1755007542142-54de4c0dc55b.jpeg': 'https://res.cloudinary.com/dgjliothg/image/upload/v1755064530/ecommerce/1755007542142-54de4c0dc55b.jpg',
  '/uploads/1755051979303-97b40c7b9d20.jpeg': 'https://res.cloudinary.com/dgjliothg/image/upload/v1755064531/ecommerce/1755051979303-97b40c7b9d20.jpg',
  '/uploads/1755056442159-2e91f4f6a50d.jpeg': 'https://res.cloudinary.com/dgjliothg/image/upload/v1755064532/ecommerce/1755056442159-2e91f4f6a50d.jpg',
  '/uploads/1755056747584-013c936c10e3.jpeg': 'https://res.cloudinary.com/dgjliothg/image/upload/v1755064535/ecommerce/1755056747584-013c936c10e3.jpg',
  '/uploads/1755057032793-1b3129ec5065.jpeg': 'https://res.cloudinary.com/dgjliothg/image/upload/v1755064537/ecommerce/1755057032793-1b3129ec5065.jpg',
  '/uploads/1755057127317-9e722dd1cf0b.jpeg': 'https://res.cloudinary.com/dgjliothg/image/upload/v1755064539/ecommerce/1755057127317-9e722dd1cf0b.jpg',
  '/uploads/1755057939245-d9fa103b2466.jpeg': 'https://res.cloudinary.com/dgjliothg/image/upload/v1755064542/ecommerce/1755057939245-d9fa103b2466.jpg'
};

async function updateDatabaseUrls() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to update`);

    let updatedCount = 0;

    for (const product of products) {
      const oldImageUrl = product.image;
      
      // Check if this product has a local upload URL that needs updating
      if (oldImageUrl && oldImageUrl.startsWith('/uploads/')) {
        const newImageUrl = imageMapping[oldImageUrl];
        
        if (newImageUrl) {
          product.image = newImageUrl;
          await product.save();
          console.log(`✅ Updated product "${product.name}": ${oldImageUrl} → ${newImageUrl}`);
          updatedCount++;
        } else {
          console.log(`⚠️  No mapping found for: ${oldImageUrl}`);
        }
      } else {
        console.log(`ℹ️  Product "${product.name}" already has external URL: ${oldImageUrl}`);
      }
    }

    console.log(`\n✅ Database update completed! Updated ${updatedCount} products.`);
    console.log('\nYou can now safely delete the uploads folder.');

  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the update
updateDatabaseUrls();
