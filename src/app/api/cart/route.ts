import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, products, categories } from "@/lib/schema";
import { eq, inArray } from "drizzle-orm";
import { getAuth } from "@/lib/auth";

interface CartItem {
  productId: string;
  quantity: number;
}

export async function GET() {
  try {
    const auth = await getAuth();
    if (!auth || auth.role === "admin") {
      return NextResponse.json({ items: [] });
    }

    const result = await db.select().from(users).where(eq(users.id, auth.sub)).limit(1);
    const user = result[0];

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    let cart: CartItem[] = [];
    try { cart = JSON.parse(user.cart || "[]"); } catch { cart = []; }

    const productIds = cart.map(c => c.productId);

    if (productIds.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const productList = await db.select({
      product: products,
      category: categories,
    })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(inArray(products.id, productIds));

    const productMap = new Map(productList.map(p => [p.product.id, p]));

    const detailed = cart.map(ci => {
      const p = productMap.get(ci.productId);
      return {
        productId: ci.productId,
        quantity: ci.quantity,
        product: p ? {
          id: p.product.id,
          slug: p.product.slug,
          name: p.product.name,
          price: p.product.price,
          category: p.category?.name,
          image: p.product.image,
          stockQuantity: p.product.stockQuantity
        } : null
      };
    });

    return NextResponse.json({ items: detailed });
  } catch (error) {
    console.error("GET /api/cart - Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getAuth();
    if (!auth || auth.role === "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body || {};

    const result = await db.select().from(users).where(eq(users.id, auth.sub)).limit(1);
    const user = result[0];
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    let cart: CartItem[] = [];
    try { cart = JSON.parse(user.cart || "[]"); } catch { cart = []; }

    if (action === "add") {
      const { productId, quantity = 1 } = body;
      if (!productId) return NextResponse.json({ message: "productId required" }, { status: 400 });

      const productResult = await db.select().from(products).where(eq(products.id, productId)).limit(1);
      const product = productResult[0];
      if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });

      const existingIndex = cart.findIndex(c => c.productId === productId);
      const currentQty = existingIndex >= 0 ? cart[existingIndex].quantity : 0;
      const newTotal = currentQty + Number(quantity);

      if (newTotal > product.stockQuantity) {
        return NextResponse.json({
          message: `Cannot add more. Stock limit: ${product.stockQuantity}`,
          availableStock: product.stockQuantity
        }, { status: 400 });
      }

      if (existingIndex >= 0) {
        cart[existingIndex].quantity = newTotal;
      } else {
        cart.push({ productId, quantity: Number(quantity) });
      }
    }

    if (action === "update") {
      const { productId, quantity } = body;
      if (!productId || typeof quantity !== "number") return NextResponse.json({ message: "Invalid input" }, { status: 400 });

      const existingIndex = cart.findIndex(c => c.productId === productId);
      if (existingIndex === -1) return NextResponse.json({ message: "Item not found" }, { status: 404 });

      if (quantity <= 0) {
        cart = cart.filter(c => c.productId !== productId);
      } else {
        const productResult = await db.select().from(products).where(eq(products.id, productId)).limit(1);
        const product = productResult[0];
        if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });

        if (quantity > product.stockQuantity) {
          return NextResponse.json({
            message: `Stock limit exceeded. Only ${product.stockQuantity} available.`,
            availableStock: product.stockQuantity
          }, { status: 400 });
        }
        cart[existingIndex].quantity = quantity;
      }
    }

    if (action === "remove") {
      const { productId } = body;
      cart = cart.filter(c => c.productId !== productId);
    }

    await db.update(users)
      .set({ cart: JSON.stringify(cart) })
      .where(eq(users.id, user.id));

    return NextResponse.json({ message: "Cart updated" });

  } catch (error) {
    console.error("POST /api/cart - Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
