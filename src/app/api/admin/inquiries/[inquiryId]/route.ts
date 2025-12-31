import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inquiries as inquiriesTable } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getAuth } from "@/lib/auth";

interface RouteParams {
  params: Promise<{
    inquiryId: string;
  }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { inquiryId } = await params;
    const { status, adminResponse, respondedBy } = await request.json();

    if (!inquiryId) {
      return NextResponse.json({ error: "Inquiry ID is required" }, { status: 400 });
    }

    const validStatuses = ["pending", "in-progress", "resolved", "closed"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: pending, in-progress, resolved, closed" },
        { status: 400 }
      );
    }

    const result = await db.select().from(inquiriesTable).where(eq(inquiriesTable.id, inquiryId)).limit(1);
    const inquiry = result[0];
    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (adminResponse !== undefined) {
      updates.adminResponse = adminResponse;
      updates.respondedAt = new Date();
      if (respondedBy) updates.respondedBy = respondedBy;
    }

    await db.update(inquiriesTable)
      .set(updates)
      .where(eq(inquiriesTable.id, inquiryId));

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
    const auth = await getAuth();
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { inquiryId } = await params;
    const result = await db.select().from(inquiriesTable).where(eq(inquiriesTable.id, inquiryId)).limit(1);
    const inquiry = result[0];
    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    await db.delete(inquiriesTable).where(eq(inquiriesTable.id, inquiryId));

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