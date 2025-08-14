import { NextResponse } from "next/server";
import { productService } from "@/lib/firebase-db";
import { getAuth } from "@/lib/auth";

export async function POST() {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Get all products and filter for those with localhost:5000 in their image URLs
    const allProducts = await productService.getAllProducts();
    const productsToFix = allProducts.filter(product => 
      product.image && product.image.includes('localhost:5000')
    );

    let fixedCount = 0;
    for (const product of productsToFix) {
      if (!product.id) continue; // Skip products without ID
      // Replace localhost:5000 with localhost:3000
      const updatedImage = product.image.replace(/localhost:5000/g, 'localhost:3000');
      await productService.updateProduct(product.id, { image: updatedImage });
      fixedCount++;
    }

    return NextResponse.json({ 
      message: `Fixed ${fixedCount} product image URLs`,
      fixedCount 
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      message: 'Failed to fix image URLs', 
      error: errorMessage 
    }, { status: 500 });
  }
}
