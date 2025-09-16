import { NextResponse } from "next/server";
import { returnService, orderService } from "@/lib/firebase-db";
import { getAuth } from "@/lib/auth";
import { sendReturnRequestEmail } from "@/lib/email";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ returnId: string }> }
) {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { returnId } = await params;
    const { status, adminNote, refundAmount, refundMethod } = await req.json();
    
    // Validate status
    const validStatuses = ["pending", "approved", "rejected", "completed", "refunded"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const returnRequest = await returnService.getReturnRequestById(returnId);
    if (!returnRequest) {
      return NextResponse.json({ message: "Return request not found" }, { status: 404 });
    }

    const oldStatus = returnRequest.status;
    
    // Build update data
    const updateData: {
      status?: "pending" | "approved" | "rejected" | "completed" | "refunded";
      adminNote?: string;
      refundAmount?: number;
      refundMethod?: "original" | "store-credit";
    } = {};
    if (status) updateData.status = status as "pending" | "approved" | "rejected" | "completed" | "refunded";
    if (adminNote !== undefined) updateData.adminNote = adminNote;
    if (refundAmount !== undefined) updateData.refundAmount = refundAmount;
    if (refundMethod) updateData.refundMethod = refundMethod as "original" | "store-credit";
    
    // Update the return request
    await returnService.updateReturnRequest(returnId, updateData);
    
    // Update related order status based on return request status
    const order = await orderService.getOrderById(returnRequest.orderId);
    if (order) {
      let newOrderStatus = order.status;
      
      switch (status) {
        case 'approved':
          // Keep current status but could add specific handling if needed
          break;
        case 'rejected':
          newOrderStatus = 'delivered'; // Return to delivered status
          await orderService.updateOrder(returnRequest.orderId, { 
            status: newOrderStatus,
            returnRequestId: undefined // Clear return request reference
          });
          break;
        case 'completed':
          newOrderStatus = 'returned';
          await orderService.updateOrder(returnRequest.orderId, { status: newOrderStatus });
          break;
        case 'refunded':
          newOrderStatus = 'returned';
          await orderService.updateOrder(returnRequest.orderId, { status: newOrderStatus });
          break;
      }
    }
    
    console.log(`Return request ${returnId} status updated from ${oldStatus} to ${status}`);
    
    // Send status update email if status changed
    if (oldStatus !== status) {
      try {
        const updatedReturnRequest = await returnService.getReturnRequestById(returnId);
        if (updatedReturnRequest) {
          // Map status to email type
          const emailType = status === 'approved' ? 'approved' :
                          status === 'rejected' ? 'rejected' :
                          status === 'completed' ? 'completed' :
                          status === 'refunded' ? 'refunded' : null;
                          
          if (emailType && order) {
            await sendReturnRequestEmail(updatedReturnRequest, order, emailType as 'approved' | 'rejected' | 'completed' | 'refunded');
          }
        }
      } catch (emailError) {
        console.error('Failed to send return status update email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ 
      message: "Return request updated successfully",
      returnRequest: await returnService.getReturnRequestById(returnId)
    });
  } catch (error) {
    console.error('Error updating return request:', error);
    return NextResponse.json({ message: 'Failed to update return request' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ returnId: string }> }
) {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { returnId } = await params;
    const returnRequest = await returnService.getReturnRequestById(returnId);
    if (!returnRequest) {
      return NextResponse.json({ message: "Return request not found" }, { status: 404 });
    }

    // Update related order to remove return request reference
    const order = await orderService.getOrderById(returnRequest.orderId);
    if (order) {
      await orderService.updateOrder(returnRequest.orderId, { 
        status: 'delivered', // Reset to delivered
        returnRequestId: undefined // Clear return request reference
      });
    }
    
    await returnService.deleteReturnRequest(returnId);
    return NextResponse.json({ message: "Return request deleted successfully" });
  } catch (error) {
    console.error('Error deleting return request:', error);
    return NextResponse.json({ message: 'Failed to delete return request' }, { status: 500 });
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ returnId: string }> }
) {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { returnId } = await params;
    const returnRequest = await returnService.getReturnRequestById(returnId);
    if (!returnRequest) {
      return NextResponse.json({ message: "Return request not found" }, { status: 404 });
    }

    // Get additional details
    const order = await orderService.getOrderById(returnRequest.orderId);
    
    return NextResponse.json({ 
      returnRequest,
      orderDetails: order ? {
        orderNumber: order.id?.slice(-8).toUpperCase(),
        grandTotal: order.grandTotal,
        customer: order.customer,
        createdAt: order.createdAt,
        items: order.items,
      } : null
    });
  } catch (error) {
    console.error('Error fetching return request details:', error);
    return NextResponse.json({ message: 'Failed to fetch return request details' }, { status: 500 });
  }
}