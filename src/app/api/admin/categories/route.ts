import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { categoryService } from "@/lib/firebase-db";

const JWT_SECRET =
  process.env.JWT_SECRET || "fallback_secret_key_change_in_production";

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces, underscores, and hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens
}

export async function GET(req: Request) {
  try {
    // Check if user is admin
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as {
      userId: string;
      email: string;
    };

    // Check if user is admin (you might want to add a proper admin check here)
    if (!decoded.email || !decoded.email.includes("admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const result = await categoryService.getAllCategoriesWithPagination(
      page,
      limit,
      sortBy,
      sortOrder,
    );

    return NextResponse.json({
      categories: result.categories,
      pagination: {
        page,
        limit,
        totalCount: result.totalCount,
        totalPages: Math.ceil(result.totalCount / limit),
        hasNextPage: page < Math.ceil(result.totalCount / limit),
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
    // Check if user is admin
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as {
      userId: string;
      email: string;
    };

    // Check if user is admin
    if (!decoded.email || !decoded.email.includes("admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, image } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Generate slug from name
    const slug = generateSlug(name);

    // Check if category with this slug already exists
    const existingCategory = await categoryService.getCategoryBySlug(slug);
    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 400 },
      );
    }

    // Create the category
    const categoryId = await categoryService.createCategory({
      name: name.trim(),
      slug,
      description: description?.trim() || "",
      image: image || "",
    });

    // Get the created category to return it
    const newCategory = await categoryService.getCategoryById(categoryId);

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
