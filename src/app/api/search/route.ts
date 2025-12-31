import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, categories } from "@/lib/schema";
import { eq, or, like } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  try {
    if (!q) return NextResponse.json({ products: [] });

    const productList = await db.select({
      product: products,
      category: categories,
    })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(
        or(
          like(products.name, `%${q}%`),
          like(products.slug, `%${q}%`),
          like(categories.name, `%${q}%`)
        )
      );

    const transformedProducts = productList.map(({ product, category }) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      category: category?.name || "Uncategorized",
      image: product.image,
      discountPercentage: product.discountPercentage > 0 ? product.discountPercentage : undefined,
      stockQuantity: product.stockQuantity,
      inStock: product.stockQuantity > 0,
    }));

    return NextResponse.json({ products: transformedProducts });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Search failed";
    console.error("Search error:", error);
    return NextResponse.json(
      { products: [], error: errorMessage },
      { status: 200 },
    );
  }
}
