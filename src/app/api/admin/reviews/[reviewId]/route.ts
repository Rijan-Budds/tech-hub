import { NextResponse } from "next/server";
import { reviewService } from "@/lib/firebase-db";
import { getAuth } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { reviewId } = await params;
    if (!reviewId) {
      return NextResponse.json({ message: "Invalid reviewId" }, { status: 400 });
    }

    const review = await reviewService.getReviewById(reviewId);
    if (!review) {
      return NextResponse.json({ message: "Review not found" }, { status: 404 });
    }

    await reviewService.deleteReview(reviewId);
    return NextResponse.json({ message: "Review deleted" });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { message: "Failed to delete review" },
      { status: 500 }
    );
  }
}