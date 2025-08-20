import { NextResponse } from "next/server";
import { orderService } from "@/lib/firebase-db";
import { getAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    
    const result = await orderService.getAllOrdersWithPagination(page, limit, sortBy, sortOrder);
    
    const orderList = result.orders.map(order => ({
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
    
    return NextResponse.json({ 
      orders: orderList,
      pagination: {
        page,
        limit,
        totalCount: result.totalCount,
        totalPages: Math.ceil(result.totalCount / limit),
        hasNextPage: page < Math.ceil(result.totalCount / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ message: 'Failed to fetch orders' }, { status: 500 });
  }
}