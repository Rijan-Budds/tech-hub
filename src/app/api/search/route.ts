import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/lib/models";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  try {
    await connectToDatabase();
    if (!q) return NextResponse.json({ products: [] });
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const docs = await Product.find({ $or: [{ name: regex }, { slug: regex }, { category: regex }] }).lean();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = docs.map((d: any) => ({ 
      id: (d._id as { toString(): string }).toString(), 
      slug: d.slug, 
      name: d.name, 
      price: d.price, 
      category: d.category, 
      image: d.image,
      discountPercentage: d.discountPercentage && d.discountPercentage > 0 ? d.discountPercentage : undefined,
      inStock: d.inStock !== false, // default to true if not set
    }));
    return NextResponse.json({ products });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ products: [], error: errorMessage }, { status: 200 });
  }
}


