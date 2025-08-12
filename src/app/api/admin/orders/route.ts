import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models";
import { getAuth } from "@/lib/auth";

export async function GET() {
  await connectToDatabase();
  const auth = await getAuth();
  if (!auth || auth.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const users = await User.find({}).lean();
  const allOrders: any[] = [];
  for (const u of users as any[]) {
    (u.orders || []).forEach((o: any) => {
      allOrders.push({
        orderId: o._id?.toString(),
        userId: u._id.toString(),
        username: u.username,
        email: u.email,
        status: o.status,
        createdAt: o.createdAt,
        subtotal: o.subtotal,
        deliveryFee: o.deliveryFee,
        grandTotal: o.grandTotal,
        customer: o.customer,
        items: o.items,
      });
    });
  }
  return NextResponse.json({ orders: allOrders });
}


