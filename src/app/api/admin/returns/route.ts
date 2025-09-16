import { NextResponse } from "next/server";
import { returnService, orderService, userService } from "@/lib/firebase-db";
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
    const sortBy = searchParams.get("sortBy") || "requestedAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const statusFilter = searchParams.get("status") || "all";
    
    const result = await returnService.getAllReturnRequestsWithPagination(
      page, 
      limit, 
      sortBy, 
      sortOrder,
      statusFilter === "all" ? undefined : statusFilter
    );
    
    // Enrich return requests with order and user details
    const enrichedReturnRequests = await Promise.all(
      result.returnRequests.map(async (returnRequest) => {
        const order = await orderService.getOrderById(returnRequest.orderId);
        const user = await userService.getUserById(returnRequest.userId);
        
        return {
          ...returnRequest,
          orderDetails: order ? {
            orderNumber: order.id?.slice(-8).toUpperCase(),
            grandTotal: order.grandTotal,
            customer: order.customer,
            createdAt: order.createdAt,
          } : null,
          userDetails: user ? {
            username: user.username,
            email: user.email,
          } : null,
        };
      })
    );
    
    return NextResponse.json({ 
      returnRequests: enrichedReturnRequests,
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
    console.error('Error fetching return requests:', error);
    return NextResponse.json({ message: 'Failed to fetch return requests' }, { status: 500 });
  }
}