import { NextResponse } from "next/server";
import { orderService, batchService } from "@/lib/firebase-db";
import { getAuth } from "@/lib/auth";
import { sendOrderStatusUpdateEmail } from "@/lib/email";
import { serverTimestamp, FieldValue } from "firebase/firestore";

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
    if (
      ![
        "pending",
        "processing",
        "shipped",
        "out-for-delivery",
        "delivered",
        "returned",
        "canceled",
      ].includes(status)
    ) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const order = await orderService.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const oldStatus = order.status;

    // Validate status transitions - prevent canceling delivered, returned orders
    if (
      (oldStatus === "delivered" || oldStatus === "returned") &&
      status === "canceled"
    ) {
      return NextResponse.json(
        {
          message: "Cannot cancel a delivered or returned order",
        },
        { status: 400 },
      );
    }

    // Prevent changing from delivered to anything except returned
    if (
      oldStatus === "delivered" &&
      !["delivered", "returned"].includes(status)
    ) {
      return NextResponse.json(
        {
          message: "Delivered orders can only be marked as returned",
        },
        { status: 400 },
      );
    }

    // If canceling an order, use batch service to restore stock
    if (status === "canceled" && oldStatus !== "canceled") {
      await batchService.cancelOrderAndRestoreStock(orderId);
    } else {
      // For other status changes, update the status
      const updateData: {
        status:
          | "pending"
          | "processing"
          | "shipped"
          | "out-for-delivery"
          | "delivered"
          | "returned"
          | "canceled"
          | "return-requested";
        deliveredAt?: FieldValue;
      } = {
        status: status as
          | "pending"
          | "processing"
          | "shipped"
          | "out-for-delivery"
          | "delivered"
          | "returned"
          | "canceled"
          | "return-requested",
      };

      // Set deliveredAt timestamp when marking as delivered
      if (status === "delivered" && oldStatus !== "delivered") {
        updateData.deliveredAt = serverTimestamp();
      }

      await orderService.updateOrder(orderId, updateData);
    }

    // Send status update email if status actually changed
    if (oldStatus !== status) {
      try {
        await sendOrderStatusUpdateEmail(order, orderId, status);
      } catch (emailError) {
        console.error("Failed to send status update email:", emailError);
        // Don't fail the request if email fails
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
    const order = await orderService.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // If order is not canceled, restore stock before deleting
    if (order.status !== "canceled") {
      await batchService.cancelOrderAndRestoreStock(orderId);
    }

    await orderService.deleteOrder(orderId);
    return NextResponse.json({ message: "Order deleted" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { message: "Failed to delete order" },
      { status: 500 },
    );
  }
}
