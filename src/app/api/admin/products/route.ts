import { NextResponse } from "next/server";
import { productService } from "@/lib/firebase-db";
import { getAuth } from "@/lib/auth";

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
    const exists = await productService.getProductBySlug(candidate);
    if (!exists) return candidate;
    candidate = `${base}-${counter++}`;
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    
    const { name, slug: incomingSlug, price, category, image, stockQuantity } = await req.json();
    if (!name || price == null || !category || !image || stockQuantity == null) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }
    
    // Check if product name already exists (get all products and check in memory)
    const allProducts = await productService.getAllProducts();
    const existingByName = allProducts.find(p => p.name.toLowerCase() === name.trim().toLowerCase());
    if (existingByName) {
      return NextResponse.json(
        { message: "Product name already exists" },
        { status: 400 }
      );
    }
    
    let slug = (incomingSlug || "").toString().trim();
    if (!slug) {
      slug = await generateUniqueSlugFromName(name);
    } else {
      const existingBySlug = await productService.getProductBySlug(slug);
      if (existingBySlug) {
        slug = await generateUniqueSlugFromName(name);
      }
    }
    
    const productData = {
      name: name.trim(),
      slug,
      price: Number(price),
      category: String(category).toLowerCase().trim(),
      image: String(image).trim(),
      discountPercentage: 0,
      stockQuantity: Number(stockQuantity),
      createdAt: new Date()
    };
    
    const productId = await productService.createProduct(productData);
    const created = await productService.getProductById(productId);
    
    return NextResponse.json(
      {
        message: "Product added",
        product: {
          id: created?.id || productId,
          slug: created?.slug || slug,
          name: created?.name || name.trim(),
          price: created?.price || Number(price),
          category: created?.category || String(category).toLowerCase().trim(),
          image: created?.image || String(image).trim(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ message: 'Failed to create product' }, { status: 500 });
  }
}
