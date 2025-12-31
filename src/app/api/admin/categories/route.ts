import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/schema";
import { eq, sql, desc, asc } from "drizzle-orm";
import { getAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(req: Request) {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

    const offset = (page - 1) * limit;

    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(categories);
    const totalCount = Number(countResult?.count || 0);

    const orderBy = sortOrder === "desc"
      ? (sortBy === "name" ? desc(categories.name) : desc(categories.createdAt))
      : (sortBy === "name" ? asc(categories.name) : asc(categories.createdAt));

    const result = await db.select().from(categories)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      categories: result,
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
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, image } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const slug = generateSlug(name);

    const existingCategoryResult = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    if (existingCategoryResult.length > 0) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 400 },
      );
    }

    const categoryId = crypto.randomUUID();
    await db.insert(categories).values({
      id: categoryId,
      name: name.trim(),
      slug,
      description: description?.trim() || "",
      image: image || "",
    });

    const [newCategory] = await db.select().from(categories).where(eq(categories.id, categoryId)).limit(1);

    return NextResponse.json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}
