import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, categories } from "@/lib/schema";
import { eq, or, like, and, sql, desc, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryParam = searchParams.get("category");
    const q = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
    const all = searchParams.get("all") === "true";

    let whereConditions = [];

    if (categoryParam && categoryParam !== "trending") {
      // In Drizzle, we might need a subquery or join for this filter if it's based on category name/slug
      // Simplest is to join categories
    }

    if (q) {
      whereConditions.push(
        or(
          like(products.name, `%${q}%`),
          like(products.description, `%${q}%`)
        )
      );
    }

    const orderBy = sortOrder === "desc"
      ? (sortBy === "price" ? desc(products.price) : sortBy === "name" ? desc(products.name) : desc(products.createdAt))
      : (sortBy === "price" ? asc(products.price) : sortBy === "name" ? asc(products.name) : asc(products.createdAt));

    let query = db.select({
      product: products,
      category: categories,
    })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id));

    if (categoryParam && categoryParam !== "trending") {
      whereConditions.push(
        or(
          eq(categories.name, categoryParam),
          eq(categories.slug, categoryParam)
        )
      );
    }

    if (whereConditions.length > 0) {
      // @ts-ignore
      query = query.where(and(...whereConditions));
    }

    // @ts-ignore
    query = query.orderBy(orderBy);

    let result;
    let totalCount = 0;

    if (all) {
      result = await query;
      totalCount = result.length;
    } else {
      const offset = (page - 1) * limit;
      // For count, we need a separate query in Drizzle typically or use a common table expression

      const countResult = await db.select({ count: sql<number>`count(*)` })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

      totalCount = Number(countResult[0]?.count || 0);

      // @ts-ignore
      result = await query.limit(limit).offset(offset);
    }

    const transformedProducts = result.map(({ product, category }) => {
      let images: string[] = [];
      try { images = JSON.parse(product.images); } catch { images = []; }

      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        category: category?.name,
        image: product.image,
        description: product.description,
        discountPercentage:
          product.discountPercentage > 0 ? product.discountPercentage : undefined,
        stockQuantity: product.stockQuantity,
        inStock: product.stockQuantity > 0,
      };
    });

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
