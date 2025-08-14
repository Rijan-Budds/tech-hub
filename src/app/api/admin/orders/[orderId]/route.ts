import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models";
import { getAuth } from "@/lib/auth";
import { sendOrderStatusUpdateEmail } from "@/lib/email";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  await dbConnect();
  const auth = await getAuth();
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { orderId } = await params;
  const { status } = await req.json();
  if (!["pending", "canceled", "delivered"].includes(status)) {
    return NextResponse.json({ message: "Invalid status" }, { status: 400 });
  }

  const users = await User.find({});
  for (const u of users) {
    const order = u.orders.id(orderId);
    if (order) {
      const oldStatus = order.status;
      order.status = status;
      await u.save();
      
      // Send status update email if status actually changed
      if (oldStatus !== status) {
        const emailResult = await sendOrderStatusUpdateEmail(order, orderId, status);
        if (!emailResult.success) {
          console.error('Failed to send status update email:', emailResult.error);
          // Don't fail the status update if email fails, but log it
        }
      }
      
      return NextResponse.json({ 
        message: "Order updated", 
        emailSent: oldStatus !== status 
      });
    }
  }
  return NextResponse.json({ message: "Order not found" }, { status: 404 });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  await dbConnect();
  const auth = await getAuth();
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { orderId } = await params;
  const users = await User.find({});
  for (const u of users) {
    const order = u.orders.id(orderId);
    if (order) {
      order.deleteOne();
      await u.save();
      return NextResponse.json({ message: "Order deleted" });
    }
  }
  return NextResponse.json({ message: "Order not found" }, { status: 404 });
}
