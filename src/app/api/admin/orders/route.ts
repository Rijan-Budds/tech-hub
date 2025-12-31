import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders as ordersTable } from "@/lib/schema";
import { sql, desc, asc } from "drizzle-orm";
import { getAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

    const offset = (page - 1) * limit;

    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(ordersTable);
    const totalCount = Number(countResult?.count || 0);

    const orderBy = sortOrder === "desc"
      ? (sortBy === "grandTotal" ? desc(ordersTable.grandTotal) : sortBy === "status" ? desc(ordersTable.status) : desc(ordersTable.createdAt))
      : (sortBy === "grandTotal" ? asc(ordersTable.grandTotal) : sortBy === "status" ? asc(ordersTable.status) : asc(ordersTable.createdAt));

    const orders = await db.select().from(ordersTable)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    const orderList = orders.map((order) => {
      let items: any[] = [];
      let customer: any = {};
      try { items = JSON.parse(order.items); } catch { }
      try { customer = JSON.parse(order.customer); } catch { }

      return {
        orderId: order.id,
        userId: order.userId,
        username: customer.name || "Unknown",
        email: customer.email || "Unknown",
        status: order.status,
        createdAt: order.createdAt,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        grandTotal: order.grandTotal,
        customer: customer,
        items: items,
      };
    });

    return NextResponse.json({
      orders: orderList,
      pagination: {
        page,
        limit,
        totalCount: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
