import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, categories } from "@/lib/schema";
import { eq, or, and } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

function slugify(text: string) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueSlugFromName(name: string) {
  const base = slugify(name || "item");
  let counter = 1;
  let candidate = base;

  while (true) {
    const result = await db.select().from(products).where(eq(products.slug, candidate)).limit(1);
    if (result.length === 0) return candidate;
    candidate = `${base}-${counter++}`;
  }
}

async function saveBase64Image(base64Data: string): Promise<string> {
  if (base64Data.startsWith("http") || base64Data.startsWith("/")) return base64Data;

  try {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64Data;
    }

    const type = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    let ext = ".jpg";
    if (type === "image/png") ext = ".png";
    else if (type === "image/jpeg") ext = ".jpg";
    else if (type === "image/gif") ext = ".gif";
    else if (type === "image/webp") ext = ".webp";

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const uploadDir = path.join(process.cwd(), "public", "uploads", String(year), month);

    console.log(`[DEBUG] Attempting to save image to: ${uploadDir}`);
    await mkdir(uploadDir, { recursive: true });

    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);
    console.log(`[DEBUG] Image saved successfully: /uploads/${year}/${month}/${filename}`);

    return `/uploads/${year}/${month}/${filename}`;
  } catch (e) {
    console.error("[DEBUG] Error saving base64 image", e);
    return base64Data;
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const {
      name,
      slug: incomingSlug,
      price,
      category,
      image,
      images,
      description,
      stockQuantity,
    } = await req.json();

    if (
      !name ||
      price == null ||
      !category ||
      !image ||
      stockQuantity == null
    ) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    let slug = (incomingSlug || "").toString().trim();
    if (!slug) {
      slug = await generateUniqueSlugFromName(name);
    } else {
      const existingBySlug = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
      if (existingBySlug.length > 0) {
        slug = await generateUniqueSlugFromName(name);
      }
    }

    let mainImageUrl = await saveBase64Image(image);

    let secondaryImageUrls = images;
    if (images && Array.isArray(images)) {
      secondaryImageUrls = await Promise.all(
        images.map(async (img) => saveBase64Image(img))
      );
    }

    // Category handling
    let catResult = await db.select().from(categories).where(
      or(
        eq(categories.id, category),
        eq(categories.slug, category),
        eq(categories.name, category)
      )
    ).limit(1);

    let cat = catResult[0];

    if (!cat) {
      const catSlug = slugify(category);
      await db.insert(categories).values({
        name: category,
        slug: catSlug,
        image: ""
      });
      const newCatResult = await db.select().from(categories).where(eq(categories.slug, catSlug)).limit(1);
      cat = newCatResult[0];
    }

    const productId = crypto.randomUUID();
    await db.insert(products).values({
      id: productId,
      name: name.trim(),
      slug,
      price: Number(price),
      categoryId: cat.id,
      image: mainImageUrl,
      images: JSON.stringify(secondaryImageUrls),
      description: description?.trim() || undefined,
      discountPercentage: 0,
      stockQuantity: Number(stockQuantity),
    });

    const [created] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    console.log(`[DEBUG] Product created successfully with ID: ${productId}`);

    return NextResponse.json(
      {
        message: "Product added",
        product: {
          id: created.id,
          slug: created.slug,
          name: created.name,
          price: created.price,
          category: cat.name,
          image: created.image,
          images: secondaryImageUrls,
          description: created.description,
          stockQuantity: created.stockQuantity,
          discountPercentage: created.discountPercentage,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[DEBUG] Error creating product:", error);
    return NextResponse.json(
      { message: "Failed to create product", error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
