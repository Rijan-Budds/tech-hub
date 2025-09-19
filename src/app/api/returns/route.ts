import { NextResponse } from "next/server";
import { returnService, orderService } from "@/lib/firebase-db";
import { getAuth } from "@/lib/auth";
import { sendReturnRequestEmail } from "@/lib/email";

export async function GET() {
  try {
    const auth = await getAuth();
    if (!auth || auth.role === "admin") {
      return NextResponse.json({ returnRequests: [] });
    }

    const returnRequests = await returnService.getReturnRequestsByUserId(
      auth.sub,
    );
    return NextResponse.json({ returnRequests });
  } catch (error) {
    console.error("Error fetching return requests:", error);
    return NextResponse.json(
      { message: "Failed to fetch return requests" },
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
    const { orderId, items, reason, description, images } = body;

    if (!orderId || !items || items.length === 0 || !reason) {
      return NextResponse.json(
        {
          message: "orderId, items, and reason are required",
        },
        { status: 400 },
      );
    }

    // Validate reason
    const validReasons = [
      "damaged",
      "wrong-item",
      "size-issue",
      "defective",
      "not-as-described",
      "other",
    ];
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { message: "Invalid return reason" },
        { status: 400 },
      );
    }

    // Get the order to validate
    const order = await orderService.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Check if user owns this order
    if (order.userId !== auth.sub) {
      return NextResponse.json(
        { message: "Unauthorized - Order does not belong to user" },
        { status: 403 },
      );
    }

    // Check if order is eligible for return
    if (!returnService.isOrderEligibleForReturn(order)) {
      return NextResponse.json(
        {
          message:
            "Order is not eligible for return. Orders can only be returned within 7 days of delivery.",
        },
        { status: 400 },
      );
    }

    // Check if return request already exists for this order
    const existingReturnRequest =
      await returnService.getReturnRequestByOrderId(orderId);
    if (existingReturnRequest) {
      return NextResponse.json(
        {
          message: "A return request already exists for this order",
        },
        { status: 400 },
      );
    }

    // Validate items are from the order
    const orderItemIds = order.items.map((item) => item.productId);
    for (const item of items) {
      if (!orderItemIds.includes(item.productId)) {
        return NextResponse.json(
          {
            message: `Item ${item.productId} is not in the order`,
          },
          { status: 400 },
        );
      }

      // Check quantity doesn't exceed order quantity
      const orderItem = order.items.find(
        (oi) => oi.productId === item.productId,
      );
      if (orderItem && item.quantity > orderItem.quantity) {
        return NextResponse.json(
          {
            message: `Return quantity for ${item.productId} exceeds order quantity`,
          },
          { status: 400 },
        );
      }
    }

    const returnRequestData = {
      orderId,
      userId: auth.sub,
      items,
      reason,
      description: description || "",
      images: images || [],
      status: "pending" as const,
    };

    const returnRequestId =
      await returnService.createReturnRequest(returnRequestData);

    // Update order status to include return request reference
    await orderService.updateOrder(orderId, {
      status: "return-requested",
      returnRequestId,
    });

    console.log(
      "POST /api/returns - Return request created with ID:",
      returnRequestId,
    );

    // Send return request submitted email
    try {
      const createdReturnRequest =
        await returnService.getReturnRequestById(returnRequestId);
      if (createdReturnRequest) {
        await sendReturnRequestEmail(createdReturnRequest, order, "submitted");
      }
    } catch (emailError) {
      console.error("Failed to send return request email:", emailError);
      // Don't fail the request if email fails
    }

    // Get updated return requests for response
    const updatedReturnRequests = await returnService.getReturnRequestsByUserId(
      auth.sub,
    );

    return NextResponse.json({
      message: "Return request submitted successfully",
      returnRequests: updatedReturnRequests,
      returnRequestId,
    });
  } catch (error) {
    console.error("Error creating return request:", error);
    return NextResponse.json(
      { message: "Failed to create return request" },
      { status: 500 },
    );
  }
}
