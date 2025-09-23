import { NextResponse } from "next/server";
import { reviewService } from "@/lib/firebase-db";
import { getAuth } from "@/lib/auth";

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
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const result = await reviewService.getAllReviewsWithPagination(
      page,
      limit,
      sortBy,
      sortOrder
    );

    return NextResponse.json({
      reviews: result.reviews,
      pagination: {
        page,
        limit,
        totalCount: result.totalCount,
        totalPages: Math.ceil(result.totalCount / limit),
        hasNextPage: page < Math.ceil(result.totalCount / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}