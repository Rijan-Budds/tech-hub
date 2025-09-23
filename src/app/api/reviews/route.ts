import { NextResponse } from "next/server";
import { reviewService } from "@/lib/firebase-db";
import { getAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // If productId is provided, get reviews for that product
    if (productId) {
      const result = await reviewService.getReviewsByProductIdWithPagination(
        productId,
        page,
        limit,
        sortBy,
        sortOrder
      );
      return NextResponse.json(result);
    }

    // If userId is provided, get reviews by that user
    if (userId) {
      const reviews = await reviewService.getReviewsByUserId(userId);
      return NextResponse.json({ reviews });
    }

    // Default: get all reviews (for admin)
    const result = await reviewService.getAllReviewsWithPagination(
      page,
      limit,
      sortBy,
      sortOrder
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getAuth();
    if (!auth) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { productId, rating, comment } = body;

    // Validation
    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { message: "Product ID, rating, and comment are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (comment.trim().length < 10) {
      return NextResponse.json(
        { message: "Comment must be at least 10 characters long" },
        { status: 400 }
      );
    }

    // Check if user has already reviewed this product
    const hasReviewed = await reviewService.hasUserReviewedProduct(
      auth.sub,
      productId
    );

    if (hasReviewed) {
      return NextResponse.json(
        { message: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    // Check if user has purchased this product (for verified purchase badge)
    const hasPurchased = await reviewService.hasUserPurchasedProduct(
      auth.sub,
      productId
    );

    const reviewData = {
      productId,
      userId: auth.sub,
      userName: auth.username,
      userEmail: auth.email,
      rating: Number(rating),
      comment: comment.trim(),
      isVerifiedPurchase: hasPurchased,
    };

    const reviewId = await reviewService.createReview(reviewData);

    return NextResponse.json({
      message: "Review created successfully",
      reviewId,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { message: "Failed to create review" },
      { status: 500 }
    );
  }
}