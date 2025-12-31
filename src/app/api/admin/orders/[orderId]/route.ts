import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders as ordersTable, products } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { sendOrderStatusUpdateEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { orderId } = await params;
    const { status } = await req.json();
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "out-for-delivery",
      "delivered",
      "returned",
      "canceled",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const result = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
    const order = result[0];
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const oldStatus = order.status;

    if ((oldStatus === "delivered" || oldStatus === "returned") && status === "canceled") {
      return NextResponse.json({ message: "Cannot cancel a delivered or returned order" }, { status: 400 });
    }

    if (oldStatus === "delivered" && !["delivered", "returned"].includes(status)) {
      return NextResponse.json({ message: "Delivered orders can only be marked as returned" }, { status: 400 });
    }

    if (status === "canceled" && oldStatus !== "canceled") {
      // Restore stock
      let items: any[] = [];
      try { items = JSON.parse(order.items); } catch { items = []; }

      await db.transaction(async (tx) => {
        await tx.update(ordersTable)
          .set({ status: "canceled" })
          .where(eq(ordersTable.id, orderId));

        for (const item of items) {
          await tx.update(products)
            .set({ stockQuantity: sql`${products.stockQuantity} + ${item.quantity}` })
            .where(eq(products.id, item.productId));
        }
      });
    } else {
      const updateData: any = { status };
      if (status === "delivered" && oldStatus !== "delivered") {
        updateData.deliveredAt = new Date();
      }
      await db.update(ordersTable)
        .set(updateData)
        .where(eq(ordersTable.id, orderId));
    }

    // Send email logic
    if (oldStatus !== status) {
      try {
        const [updatedOrder] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
        const emailOrder = {
          ...updatedOrder,
          items: JSON.parse(updatedOrder.items),
          customer: JSON.parse(updatedOrder.customer),
        };
        await sendOrderStatusUpdateEmail(emailOrder as any, orderId, status);
      } catch (e) {
        console.error("Failed to send status email", e);
      }
    }

    return NextResponse.json({ message: "Order status updated" });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { message: "Failed to update order status" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { orderId } = await params;
    const result = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
    const order = result[0];
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (order.status !== "canceled") {
      // Restore stock if not canceled
      let items: any[] = [];
      try { items = JSON.parse(order.items); } catch { items = []; }

      await db.transaction(async (tx) => {
        for (const item of items) {
          await tx.update(products)
            .set({ stockQuantity: sql`${products.stockQuantity} + ${item.quantity}` })
            .where(eq(products.id, item.productId));
        }
        await tx.delete(ordersTable).where(eq(ordersTable.id, orderId));
      });
    } else {
      await db.delete(ordersTable).where(eq(ordersTable.id, orderId));
    }

    return NextResponse.json({ message: "Order deleted" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { message: "Failed to delete order" },
      { status: 500 },
    );
  }
}
