import { NextResponse } from "next/server";
import { reviewService } from "@/lib/firebase-db";
import { getAuth } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params;
    const review = await reviewService.getReviewById(reviewId);
    
    if (!review) {
      return NextResponse.json(
        { message: "Review not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ review });
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { message: "Failed to fetch review" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const auth = await getAuth();
    if (!auth) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const { reviewId } = await params;
    const body = await req.json();
    const { rating, comment } = body;

    // Get the existing review
    const existingReview = await reviewService.getReviewById(reviewId);
    if (!existingReview) {
      return NextResponse.json(
        { message: "Review not found" },
        { status: 404 }
      );
    }

    // Check if user owns the review or is admin
    if (existingReview.userId !== auth.sub && auth.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized to update this review" },
        { status: 403 }
      );
    }

    // Validation
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (comment !== undefined && comment.trim().length < 10) {
      return NextResponse.json(
        { message: "Comment must be at least 10 characters long" },
        { status: 400 }
      );
    }

    const updates: Partial<{ rating: number; comment: string; productId: string }> = {};
    if (rating !== undefined) updates.rating = Number(rating);
    if (comment !== undefined) updates.comment = comment.trim();
    if (rating !== undefined) updates.productId = existingReview.productId;

    await reviewService.updateReview(reviewId, updates);

    return NextResponse.json({
      message: "Review updated successfully",
    });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { message: "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const auth = await getAuth();
    if (!auth) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const { reviewId } = await params;

    // Get the existing review
    const existingReview = await reviewService.getReviewById(reviewId);
    if (!existingReview) {
      return NextResponse.json(
        { message: "Review not found" },
        { status: 404 }
      );
    }

    // Check if user owns the review or is admin
    if (existingReview.userId !== auth.sub && auth.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized to delete this review" },
        { status: 403 }
      );
    }

    await reviewService.deleteReview(reviewId);

    return NextResponse.json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { message: "Failed to delete review" },
      { status: 500 }
    );
  }
}