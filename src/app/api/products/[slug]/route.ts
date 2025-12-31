import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products as productsTable, categories } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const result = await db.select({
      product: productsTable,
      category: categories,
    })
      .from(productsTable)
      .leftJoin(categories, eq(productsTable.categoryId, categories.id))
      .where(eq(productsTable.slug, slug))
      .limit(1);

    const product = result[0];

    if (!product)
      return NextResponse.json({ message: "Not found" }, { status: 404 });

    let images: string[] = [];
    try {
      images = JSON.parse(product.product.images);
    } catch {
      images = [];
    }

    return NextResponse.json({
      product: {
        id: product.product.id,
        slug: product.product.slug,
        name: product.product.name,
        price: product.product.price,
        category: product.category?.name || "Uncategorized",
        categoryName: product.category?.name,
        image: product.product.image,
        images: images,
        description: product.product.description,
        discountPercentage:
          product.product.discountPercentage > 0 ? product.product.discountPercentage : undefined,
        stockQuantity: product.product.stockQuantity,
        inStock: product.product.stockQuantity > 0,
      },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
