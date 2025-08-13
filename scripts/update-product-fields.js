const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

async function updateProductFields() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define the Product schema (same as in models.ts)
    const ProductSchema = new mongoose.Schema({
      name: { type: String, required: true, unique: true },
      slug: { type: String, required: true, unique: true },
      price: { type: Number, required: true },
      category: { type: String, required: true },
      image: { type: String, required: true },
      discountPercentage: { type: Number, min: 0, max: 100, default: 0 },
      inStock: { type: Boolean, default: true },
    }, { timestamps: true });

    const Product = mongoose.model('Product', ProductSchema);

    // Find all products that don't have the new fields
    const productsToUpdate = await Product.find({
      $or: [
        { discountPercentage: { $exists: false } },
        { inStock: { $exists: false } }
      ]
    });

    console.log(`Found ${productsToUpdate.length} products to update`);

    if (productsToUpdate.length === 0) {
      console.log('All products already have the new fields');
      return;
    }

    // Update each product
    for (const product of productsToUpdate) {
      const updateData = {};
      
      if (product.discountPercentage === undefined) {
        updateData.discountPercentage = 0;
      }
      
      if (product.inStock === undefined) {
        updateData.inStock = true;
      }

      if (Object.keys(updateData).length > 0) {
        await Product.updateOne(
          { _id: product._id },
          { $set: updateData }
        );
        console.log(`Updated product: ${product.name}`);
      }
    }

    console.log('✅ All products updated successfully!');

    // Verify the update
    const allProducts = await Product.find({});
    console.log(`\n📊 Database Summary:`);
    console.log(`Total products: ${allProducts.length}`);
    
    const productsWithDiscount = allProducts.filter(p => p.discountPercentage > 0);
    const outOfStockProducts = allProducts.filter(p => p.inStock === false);
    
    console.log(`Products with discounts: ${productsWithDiscount.length}`);
    console.log(`Out of stock products: ${outOfStockProducts.length}`);

    if (productsWithDiscount.length > 0) {
      console.log('\n🏷️ Products with discounts:');
      productsWithDiscount.forEach(p => {
        console.log(`  - ${p.name}: ${p.discountPercentage}% off`);
      });
    }

    if (outOfStockProducts.length > 0) {
      console.log('\n❌ Out of stock products:');
      outOfStockProducts.forEach(p => {
        console.log(`  - ${p.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error updating products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
updateProductFields();
