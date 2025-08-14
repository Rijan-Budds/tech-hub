import { NextResponse } from "next/server";
import { productService } from "@/lib/firebase-db";
import { IProduct } from "@/lib/firebase-models";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q");
    
    let products;
    
    if (category === "trending") {
      // Get trending products based on purchase count
      products = await productService.getTrendingProducts(4);
    } else if (category) {
      // Get products by category (simplified query)
      products = await productService.getProductsByCategory(category);
    } else if (q) {
      // Search products (simplified query)
      products = await productService.searchProducts(q);
    } else {
      // Get all products (simplified query)
      products = await productService.getAllProducts();
    }
    
    // Transform products to match the expected format
    const transformedProducts = products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
      discountPercentage: product.discountPercentage && product.discountPercentage > 0 ? product.discountPercentage : undefined,
      inStock: product.inStock !== false, // default to true if not set
      purchaseCount: (product as IProduct & { purchaseCount?: number }).purchaseCount, // Include purchase count for trending products
    }));
    
    return NextResponse.json({ products: transformedProducts });
  } catch (error) {
    console.error('Error fetching products:', error);
    
    // If it's an index error, provide helpful message
    if (error instanceof Error && error.message.includes('index')) {
      return NextResponse.json(
        { 
          error: 'Database index required. Please create the required index in Firebase Console.',
          details: error.message
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}