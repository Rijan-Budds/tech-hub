import { NextResponse } from "next/server";
import { orderService } from "@/lib/firebase-db";
import { getAuth } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    const orders = await orderService.getAllOrders();
    const orderList = orders.map(order => ({
      orderId: order.id,
      userId: order.userId,
      username: order.customer?.name || 'Unknown',
      email: order.customer?.email || 'Unknown',
      status: order.status,
      createdAt: order.createdAt,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      grandTotal: order.grandTotal,
      customer: order.customer,
      items: order.items
    }));
    
    return NextResponse.json({ orders: orderList });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ message: 'Failed to fetch orders' }, { status: 500 });
  }
}