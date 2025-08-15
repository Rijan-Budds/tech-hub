import { NextResponse } from "next/server";
import { productService } from "@/lib/firebase-db";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const product = await productService.getProductBySlug(slug);
    if (!product) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ product: {
      id: product.id, 
      slug: product.slug, 
      name: product.name, 
      price: product.price, 
      category: product.category, 
      image: product.image,
      discountPercentage: product.discountPercentage && product.discountPercentage > 0 ? product.discountPercentage : undefined,
      stockQuantity: product.stockQuantity || 0,
      inStock: (product.stockQuantity || 0) > 0, // Determine inStock based on stockQuantity
    }});
  } catch (error: unknown) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}


