import { NextRequest, NextResponse } from "next/server";
import { getFirestore, doc, updateDoc, getDoc, Timestamp, deleteDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/firebase-models";

interface RouteParams {
  params: Promise<{
    inquiryId: string;
  }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check if user is admin (you should implement proper admin auth check)
    const isAdmin = true; // Replace with actual admin check
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { inquiryId } = await params;
    const { status, adminResponse, respondedBy } = await request.json();

    if (!inquiryId) {
      return NextResponse.json(
        { error: "Inquiry ID is required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["pending", "in-progress", "resolved", "closed"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: pending, in-progress, resolved, closed" },
        { status: 400 }
      );
    }

    const db = getFirestore(app);
    const inquiryRef = doc(db, COLLECTIONS.INQUIRIES, inquiryId);

    // Check if inquiry exists
    const inquiryDoc = await getDoc(inquiryRef);
    if (!inquiryDoc.exists()) {
      return NextResponse.json(
        { error: "Inquiry not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, string | Timestamp> = {};
    
    if (status) {
      updateData.status = status;
    }
    
    if (adminResponse !== undefined) {
      updateData.adminResponse = adminResponse;
      updateData.respondedAt = Timestamp.now();
      if (respondedBy) {
        updateData.respondedBy = respondedBy;
      }
    }

    // Update the inquiry
    await updateDoc(inquiryRef, updateData);

    return NextResponse.json({
      success: true,
      message: "Inquiry updated successfully"
    });

  } catch (error) {
    console.error("Error updating inquiry:", error);
    return NextResponse.json(
      { error: "Failed to update inquiry" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check if user is admin (you should implement proper admin auth check)
    const isAdmin = true; // Replace with actual admin check
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { inquiryId } = await params;

    if (!inquiryId) {
      return NextResponse.json(
        { error: "Inquiry ID is required" },
        { status: 400 }
      );
    }

    const db = getFirestore(app);
    const inquiryRef = doc(db, COLLECTIONS.INQUIRIES, inquiryId);

    // Check if inquiry exists
    const inquiryDoc = await getDoc(inquiryRef);
    if (!inquiryDoc.exists()) {
      return NextResponse.json(
        { error: "Inquiry not found" },
        { status: 404 }
      );
    }

    // Delete the inquiry
    await deleteDoc(inquiryRef);

    return NextResponse.json({
      success: true,
      message: "Inquiry deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting inquiry:", error);
    return NextResponse.json(
      { error: "Failed to delete inquiry" },
      { status: 500 }
    );
  }
}