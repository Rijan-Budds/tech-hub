import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/schema";
import { eq, ne, and } from "drizzle-orm";
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

export async function PATCH(
  req: Request,
  context: { params: Promise<{ categoryId: string }> },
) {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { categoryId } = await context.params;
    const body = await req.json();

    const result = await db.select().from(categories).where(eq(categories.id, categoryId)).limit(1);
    const existingCategory = result[0];
    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const updates: any = {};

    if (body.name && body.name.trim() !== existingCategory.name) {
      const newSlug = generateSlug(body.name);
      const categoryWithNewSlugResult = await db.select().from(categories).where(eq(categories.slug, newSlug)).limit(1);
      const categoryWithNewSlug = categoryWithNewSlugResult[0];

      if (categoryWithNewSlug && categoryWithNewSlug.id !== categoryId) {
        return NextResponse.json({ error: "Category with this name already exists" }, { status: 400 });
      }

      updates.name = body.name.trim();
      updates.slug = newSlug;
    }

    if (body.description !== undefined) updates.description = body.description?.trim() || null;
    if (body.image !== undefined) updates.image = body.image || null;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No changes provided" }, { status: 400 });
    }

    await db.update(categories)
      .set(updates)
      .where(eq(categories.id, categoryId));

    const [updatedCategory] = await db.select().from(categories).where(eq(categories.id, categoryId)).limit(1);

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
    const auth = await getAuth();
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { categoryId } = await context.params;
    const result = await db.select().from(categories).where(eq(categories.id, categoryId)).limit(1);
    const existingCategory = result[0];
    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await db.delete(categories).where(eq(categories.id, categoryId));

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
