"use client";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getAuth } from "@/lib/auth";

export async function POST() {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const allProducts = await db.select().from(products);
    const productsToFix = allProducts.filter(
      (product) => product.image && product.image.includes("localhost:5000"),
    );

    let fixedCount = 0;
    for (const product of productsToFix) {
      if (!product.id) continue;
      const updatedImage = product.image.replace(
        /localhost:5000/g,
        "localhost:3000",
      );
      await db.update(products)
        .set({ image: updatedImage })
        .where(eq(products.id, product.id));
      fixedCount++;
    }

    return NextResponse.json({
      message: `Fixed ${fixedCount} product image URLs`,
      fixedCount,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        message: "Failed to fix image URLs",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
