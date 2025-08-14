import { NextResponse } from "next/server";
import { productService } from "@/lib/firebase-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  try {
    if (!q) return NextResponse.json({ products: [] });
    
    const allProducts = await productService.getAllProducts();
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    
    const products = allProducts
      .filter(product => 
        regex.test(product.name) || 
        regex.test(product.slug) || 
        regex.test(product.category)
      )
      .map(product => ({ 
        id: product.id, 
        slug: product.slug, 
        name: product.name, 
        price: product.price, 
        category: product.category, 
        image: product.image,
        discountPercentage: product.discountPercentage && product.discountPercentage > 0 ? product.discountPercentage : undefined,
        inStock: product.inStock !== false, // default to true if not set
      }));
    
    return NextResponse.json({ products });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ products: [], error: errorMessage }, { status: 200 });
  }
}


