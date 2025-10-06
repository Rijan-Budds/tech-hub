import { NextRequest, NextResponse } from "next/server";
import { getFirestore, collection, getDocs, orderBy, query, limit, where } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { COLLECTIONS, IInquiry, timestampToDate } from "@/lib/firebase-models";

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin (you should implement proper admin auth check)
    const isAdmin = true; // Replace with actual admin check
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const statusFilter = searchParams.get("status");

    const db = getFirestore(app);
    const inquiriesQuery = collection(db, COLLECTIONS.INQUIRIES);

    // Build query with filters
    let queryRef = query(inquiriesQuery);

    // Add status filter
    if (statusFilter && statusFilter !== "all") {
      queryRef = query(queryRef, where("status", "==", statusFilter));
    }

    // Add sorting
    queryRef = query(queryRef, orderBy(sortBy, sortOrder as "asc" | "desc"));

    // Add pagination
    if (page > 1) {
      // For pagination, we'd need to implement proper pagination with lastVisible
      // This is a simplified version
      queryRef = query(queryRef, limit(pageSize));
    } else {
      queryRef = query(queryRef, limit(pageSize));
    }

    const snapshot = await getDocs(queryRef);
    
    const inquiries: (IInquiry & { id: string })[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: timestampToDate(doc.data().createdAt),
      respondedAt: doc.data().respondedAt ? timestampToDate(doc.data().respondedAt) : undefined,
    } as IInquiry & { id: string }));

    // Get total count for pagination (this is simplified - in production you'd want to use a separate count query)
    const totalSnapshot = await getDocs(query(collection(db, COLLECTIONS.INQUIRIES)));
    const totalInquiries = totalSnapshot.size;
    const totalPages = Math.ceil(totalInquiries / pageSize);

    return NextResponse.json({
      inquiries,
      pagination: {
        currentPage: page,
        totalPages,
        totalInquiries,
        pageSize
      }
    });

  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}