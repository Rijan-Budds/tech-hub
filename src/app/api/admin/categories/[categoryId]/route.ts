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

export async function PATCH(
  req: Request,
  context: { params: Promise<{ categoryId: string }> },
) {
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

    const params = await context.params;
    const { categoryId } = params;
    const body = await req.json();

    // Check if category exists
    const existingCategory = await categoryService.getCategoryById(categoryId);
    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    const updates: Partial<{
      name: string;
      slug: string;
      description: string;
      image: string;
    }> = {};

    // Handle name update (and generate new slug if name changed)
    if (body.name && body.name.trim() !== existingCategory.name) {
      const newSlug = generateSlug(body.name);

      // Check if another category with this slug already exists
      const categoryWithNewSlug =
        await categoryService.getCategoryBySlug(newSlug);
      if (categoryWithNewSlug && categoryWithNewSlug.id !== categoryId) {
        return NextResponse.json(
          { error: "Category with this name already exists" },
          { status: 400 },
        );
      }

      updates.name = body.name.trim();
      updates.slug = newSlug;
    }

    // Handle description update
    if (body.description !== undefined) {
      updates.description = body.description?.trim() || "";
    }

    // Handle image update
    if (body.image !== undefined) {
      updates.image = body.image || "";
    }

    // Only update if there are actual changes
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No changes provided" },
        { status: 400 },
      );
    }

    // Update the category
    await categoryService.updateCategory(categoryId, updates);

    // Get the updated category to return it
    const updatedCategory = await categoryService.getCategoryById(categoryId);

    return NextResponse.json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ categoryId: string }> },
) {
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

    const params = await context.params;
    const { categoryId } = params;

    // Check if category exists
    const existingCategory = await categoryService.getCategoryById(categoryId);
    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    // TODO: You might want to check if there are products using this category
    // and prevent deletion or reassign them to a default category

    // Delete the category
    await categoryService.deleteCategory(categoryId);

    return NextResponse.json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 },
    );
  }
}
