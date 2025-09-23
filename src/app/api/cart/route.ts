import { NextResponse } from "next/server";
import { userService, productService } from "@/lib/firebase-db";
import { getAuth } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await getAuth();

    if (!auth || auth.role === "admin") {
      return NextResponse.json({ items: [] });
    }

    const user = await userService.getUserById(auth.sub);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const productIds = user.cart.map((ci) => ci.productId);

    // Get products from Firebase - optimized batch fetch
    const products = [];
    if (productIds.length > 0) {
      // Get all products at once instead of individual calls
      const allProducts = await productService.getAllProducts();
      const productMap = new Map(allProducts.map((p) => [p.id, p]));

      for (const productId of productIds) {
        const product = productMap.get(productId);
        if (product) {
          products.push({
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: Number(product.price) || 0,
            category: product.category,
            image: product.image,
            stockQuantity: product.stockQuantity || 0,
          });
        }
      }
    }

    // Create a map for quick lookup
    const productMap = new Map(products.map((p) => [p.id, p]));

    const detailed = user.cart.map((ci) => {
      const product = productMap.get(ci.productId);
      return {
        productId: ci.productId,
        quantity: ci.quantity,
        product: product || null,
      };
    });

    return NextResponse.json({ items: detailed });
  } catch (error) {
    console.error("GET /api/cart - Error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
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

    const user = await userService.getUserById(auth.sub);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    let updatedCart = [...user.cart];

    if (action === "add") {
      const { productId, quantity = 1 } = body;
      if (!productId)
        return NextResponse.json(
          { message: "productId required" },
          { status: 400 },
        );

      // Get product to check stock
      const product = await productService.getProductById(productId);
      if (!product) {
        return NextResponse.json(
          { message: "Product not found" },
          { status: 404 },
        );
      }

      const existing = updatedCart.find((ci) => ci.productId === productId);
      const currentCartQuantity = existing ? existing.quantity : 0;
      const newTotalQuantity = currentCartQuantity + Number(quantity);

      // Check if the new total quantity exceeds available stock
      if (newTotalQuantity > product.stockQuantity) {
        return NextResponse.json(
          {
            message: `Cannot add ${quantity} items. Only ${product.stockQuantity - currentCartQuantity} more items available in stock.`,
            availableStock: product.stockQuantity,
            currentInCart: currentCartQuantity,
            maxCanAdd: Math.max(0, product.stockQuantity - currentCartQuantity),
          },
          { status: 400 },
        );
      }

      if (existing) {
        existing.quantity += Number(quantity);
      } else {
        updatedCart.push({ productId, quantity: Number(quantity) });
      }
    }

    if (action === "update") {
      const { productId, quantity } = body;
      if (!productId || typeof quantity !== "number") {
        return NextResponse.json(
          { message: "productId and quantity required" },
          { status: 400 },
        );
      }

      const existing = updatedCart.find((ci) => ci.productId === productId);
      if (!existing) {
        return NextResponse.json(
          { message: "Item not found" },
          { status: 404 },
        );
      }

      if (quantity <= 0) {
        updatedCart = updatedCart.filter((ci) => ci.productId !== productId);
      } else {
        // Get product to check stock when updating quantity
        const product = await productService.getProductById(productId);
        if (!product) {
          return NextResponse.json(
            { message: "Product not found" },
            { status: 404 },
          );
        }

        // Check if the updated quantity exceeds available stock
        if (quantity > product.stockQuantity) {
          return NextResponse.json(
            {
              message: `Cannot update to ${quantity} items. Only ${product.stockQuantity} items available in stock.`,
              availableStock: product.stockQuantity,
              maxQuantity: product.stockQuantity,
            },
            { status: 400 },
          );
        }

        existing.quantity = quantity;
      }
    }

    if (action === "remove") {
      const { productId } = body;
      if (!productId)
        return NextResponse.json(
          { message: "productId required" },
          { status: 400 },
        );
      updatedCart = updatedCart.filter((ci) => ci.productId !== productId);
    }

    // Update user cart in Firebase
    await userService.updateUserCart(auth.sub, updatedCart);

    const actionMessages = {
      add: "Added to cart",
      update: "Cart updated",
      remove: "Item removed",
    };

    return NextResponse.json({
      message:
        actionMessages[action as keyof typeof actionMessages] || "Cart updated",
    });
  } catch (error) {
    console.error("POST /api/cart - Error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
