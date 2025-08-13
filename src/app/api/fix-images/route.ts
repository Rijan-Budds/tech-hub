import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/lib/models";
import { getAuth } from "@/lib/auth";

export async function POST() {
  try {
    await connectToDatabase();
    const auth = await getAuth();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Find all products with localhost:5000 in their image URLs
    const products = await Product.find({
      image: { $regex: /localhost:5000/, $options: 'i' }
    });

    let fixedCount = 0;
    for (const product of products) {
      // Replace localhost:5000 with localhost:3000
      product.image = product.image.replace(/localhost:5000/g, 'localhost:3000');
      await product.save();
      fixedCount++;
    }

    return NextResponse.json({ 
      message: `Fixed ${fixedCount} product image URLs`,
      fixedCount 
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      message: 'Failed to fix image URLs', 
      error: errorMessage 
    }, { status: 500 });
  }
}
