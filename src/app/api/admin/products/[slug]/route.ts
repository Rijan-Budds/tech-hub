import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, categories } from "@/lib/schema";
import { eq, or, and, ne } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

async function saveBase64Image(base64Data: string): Promise<string> {
  if (base64Data.startsWith("http")) return base64Data;
  try {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return base64Data;
    const type = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    let ext = ".jpg";
    if (type === "image/png") ext = ".png";
    else if (type === "image/jpeg") ext = ".jpg";
    else if (type === "image/webp") ext = ".webp";
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const uploadDir = path.join(process.cwd(), "public", "uploads", String(year), month);
    await mkdir(uploadDir, { recursive: true });
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    return `/uploads/${year}/${month}/${filename}`;
  } catch (e) {
    console.error("Error saving base64 image", e);
    return base64Data;
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { slug } = await params;
    const body = await req.json();
    const { name, price, category, image, images, description, discountPercentage, stockQuantity } = body;

    const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    const product = result[0];
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    if (name && name.trim().toLowerCase() !== product.name.trim().toLowerCase()) {
      const existingByName = await db.select().from(products).where(
        and(
          eq(products.name, name.trim()),
          ne(products.id, product.id)
        )
      ).limit(1);
      if (existingByName.length > 0) {
        return NextResponse.json({ message: "Product name already exists" }, { status: 400 });
      }
    }

    const updates: any = {};
    if (name != null) updates.name = String(name).trim();
    if (price != null) updates.price = Number(price);

    if (category != null) {
      const catResult = await db.select().from(categories).where(
        or(
          eq(categories.id, category),
          eq(categories.name, category),
          eq(categories.slug, category)
        )
      ).limit(1);
      const cat = catResult[0];
      if (cat) {
        updates.categoryId = cat.id;
      }
    }

    if (description != null) updates.description = String(description).trim() || null;
    if (discountPercentage != null) updates.discountPercentage = Number(discountPercentage);
    if (stockQuantity != null) updates.stockQuantity = Number(stockQuantity);

    if (image) {
      updates.image = await saveBase64Image(image);
    }
    if (images && Array.isArray(images)) {
      updates.images = JSON.stringify(await Promise.all(images.map((img: string) => saveBase64Image(img))));
    }

    await db.update(products)
      .set(updates)
      .where(eq(products.id, product.id));

    const updatedResult = await db.select({
      product: products,
      category: categories,
    })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, product.id))
      .limit(1);

    const updatedProduct = updatedResult[0];

    let resultImages: string[] = [];
    try { resultImages = JSON.parse(updatedProduct.product.images); } catch { resultImages = []; }

    return NextResponse.json({
      message: "Product updated",
      product: {
        id: updatedProduct.product.id,
        slug: updatedProduct.product.slug,
        name: updatedProduct.product.name,
        price: updatedProduct.product.price,
        category: updatedProduct.category?.name,
        image: updatedProduct.product.image,
        images: resultImages,
        description: updatedProduct.product.description,
        discountPercentage: updatedProduct.product.discountPercentage > 0 ? updatedProduct.product.discountPercentage : undefined,
        stockQuantity: updatedProduct.product.stockQuantity,
      },
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { slug } = await params;
    const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    const product = result[0];
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    await db.delete(products).where(eq(products.id, product.id));
    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 },
    );
  }
}
