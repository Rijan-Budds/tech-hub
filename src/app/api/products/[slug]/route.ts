import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/lib/models";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  try {
    await connectToDatabase();
    const doc = await Product.findOne({ slug: params.slug }).lean();
    if (!doc) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ product: {
      id: doc._id.toString(), slug: doc.slug, name: doc.name, price: doc.price, category: doc.category, image: doc.image,
    }});
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}


