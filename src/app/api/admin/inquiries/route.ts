import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inquiries as inquiriesTable } from "@/lib/schema";
import { eq, sql, desc, asc, and } from "drizzle-orm";
import { getAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
    const statusFilter = searchParams.get("status");

    const offset = (page - 1) * pageSize;

    let whereCondition = undefined;
    if (statusFilter && statusFilter !== "all") {
      whereCondition = eq(inquiriesTable.status, statusFilter);
    }

    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(inquiriesTable).where(whereCondition);
    const totalCount = Number(countResult?.count || 0);

    const orderBy = sortOrder === "desc"
      ? (sortBy === "status" ? desc(inquiriesTable.status) : desc(inquiriesTable.createdAt))
      : (sortBy === "status" ? asc(inquiriesTable.status) : asc(inquiriesTable.createdAt));

    const inquiries = await db.select().from(inquiriesTable)
      .where(whereCondition)
      .orderBy(orderBy)
      .limit(pageSize)
      .offset(offset);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(totalCount / pageSize),
      totalInquiries: totalCount,
      pageSize
    };

    return NextResponse.json({
      inquiries,
      pagination
    });

  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}