import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, products, orders as ordersTable } from "@/lib/schema";
import { eq, inArray, sql, desc } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { sendOrderConfirmationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const cityFees: Record<string, number> = {
  Kathmandu: 3.5,
  Pokhara: 4.5,
  Lalitpur: 3.0,
  Bhaktapur: 3.0,
  Biratnagar: 5.0,
  Butwal: 4.0,
};

interface CartItem {
  productId: string;
  quantity: number;
}

export async function GET() {
  try {
    const auth = await getAuth();
    if (!auth || auth.role === "admin") {
      return NextResponse.json({ orders: [] });
    }

    const orders = await db.select().from(ordersTable)
      .where(eq(ordersTable.userId, auth.sub))
      .orderBy(desc(ordersTable.createdAt));

    const parsedOrders = orders.map(order => ({
      ...order,
      items: JSON.parse(order.items),
      customer: JSON.parse(order.customer)
    }));

    return NextResponse.json({ orders: parsedOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Failed to fetch orders" },
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
    const { name, email, address, paymentMethod } = body || {};
    if (!name || !email || !address?.city || !paymentMethod) {
      return NextResponse.json(
        { message: "name, email, city, and paymentMethod are required" },
        { status: 400 },
      );
    }

    // Validate payment method
    if (!["khalti", "esewa", "cod"].includes(paymentMethod)) {
      return NextResponse.json(
        { message: "Invalid payment method" },
        { status: 400 },
      );
    }

    const userResult = await db.select().from(users).where(eq(users.id, auth.sub)).limit(1);
    const user = userResult[0];
    let cart: CartItem[] = [];
    try { cart = JSON.parse(user?.cart || "[]"); } catch { cart = []; }

    if (!user || cart.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    const productIds = cart.map(c => c.productId);
    const productsInCart = await db.select().from(products).where(inArray(products.id, productIds));
    const productMap = new Map(productsInCart.map((p) => [p.id, p]));

    // Validate stock and prepare items
    const orderItems: any[] = [];
    let subtotal = 0;

    for (const cartItem of cart) {
      const product = productMap.get(cartItem.productId);
      if (!product) {
        return NextResponse.json(
          { message: `Product not found: ${cartItem.productId}` },
          { status: 400 },
        );
      }

      if (product.stockQuantity < cartItem.quantity) {
        return NextResponse.json(
          {
            message: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${cartItem.quantity}`,
          },
          { status: 400 },
        );
      }

      orderItems.push({
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        name: product.name,
        image: product.image,
        price: product.price
      });
      subtotal += product.price * cartItem.quantity;
    }

    const deliveryFee = cityFees[address.city] ?? 5.0;
    const grandTotal = subtotal + deliveryFee;

    const customerData = {
      name,
      email,
      address: { street: address?.street || "", city: address.city }
    };

    // Transaction: Create Order, Deduct Stock, Clear Cart
    const order = await db.transaction(async (tx) => {
      // Create Order
      const orderId = crypto.randomUUID();
      await tx.insert(ordersTable).values({
        id: orderId,
        userId: auth.sub,
        items: JSON.stringify(orderItems),
        status: "pending",
        subtotal,
        deliveryFee,
        grandTotal,
        paymentMethod,
        customer: JSON.stringify(customerData),
      });

      // Clear Cart
      await tx.update(users)
        .set({ cart: "[]" })
        .where(eq(users.id, auth.sub));

      // Deduct Stock
      for (const item of cart) {
        await tx.update(products)
          .set({ stockQuantity: sql`${products.stockQuantity} - ${item.quantity}` })
          .where(eq(products.id, item.productId));
      }

      const [newOrder] = await tx.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
      return newOrder;
    });

    console.log("POST /api/orders - Order created with ID:", order.id);

    // Send order confirmation email
    const emailData = {
      ...order,
      items: orderItems,
      customer: customerData,
      createdAt: order.createdAt
    };

    const emailResult = await sendOrderConfirmationEmail(emailData as any, order.id);

    if (!emailResult.success) {
      console.error(
        "Failed to send order confirmation email:",
        emailResult.error,
      );
    }

    const updatedOrders = await db.select().from(ordersTable)
      .where(eq(ordersTable.userId, auth.sub))
      .orderBy(desc(ordersTable.createdAt));

    const parsedUpdatedOrders = updatedOrders.map(o => ({
      ...o,
      items: JSON.parse(o.items),
      customer: JSON.parse(o.customer)
    }));

    return NextResponse.json({
      message: "Order placed",
      orders: parsedUpdatedOrders,
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { message: "Failed to create order" },
      { status: 500 },
    );
  }
}
