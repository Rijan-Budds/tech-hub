"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FaUserCircle, FaCheckCircle } from "react-icons/fa";
import StarRating from "./StarRating";
import { IReview } from "@/lib/firebase-models";
import { Timestamp } from "firebase/firestore";

interface ReviewListProps {
  productId: string;
  className?: string;
}

const ReviewList: React.FC<ReviewListProps> = ({ productId, className = "" }) => {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const reviewsPerPage = 5;

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/reviews?productId=${productId}&page=${currentPage}&limit=${reviewsPerPage}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();
      setReviews(data.reviews || []);
      setTotalReviews(data.totalCount || 0);
      setTotalPages(Math.ceil((data.totalCount || 0) / reviewsPerPage));
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
      setTotalReviews(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [productId, currentPage, reviewsPerPage, sortBy, sortOrder]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const formatDate = (date: Date | Timestamp | string) => {
    try {
      let dateObj: Date;
      
      if (typeof date === 'string') {
        // Handle string dates (from API serialization)
        dateObj = new Date(date);
      } else if (date instanceof Timestamp) {
        // Handle Firestore Timestamps
        dateObj = date.toDate();
      } else if (date instanceof Date) {
        // Handle Date objects
        dateObj = date;
      } else {
        // Fallback to current date if all else fails
        console.warn('Invalid date format:', date);
        dateObj = new Date();
      }
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date value:', date);
        return 'Invalid Date';
      }
      
      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Invalid Date';
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          Customer Reviews ({totalReviews})
        </h3>
        
        {/* Sort Options */}
        <div className="flex items-center space-x-4">
          <label className="text-sm text-gray-600">Sort by:</label>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split("-");
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
              setCurrentPage(1);
            }}
            className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="rating-desc">Highest Rating</option>
            <option value="rating-asc">Lowest Rating</option>
          </select>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <FaUserCircle className="mx-auto text-6xl text-gray-300 mb-4" />
          <h4 className="text-lg font-medium text-gray-600 mb-2">No Reviews Yet</h4>
          <p className="text-gray-500">
            Be the first to share your experience with this product!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <FaUserCircle className="text-3xl text-gray-400" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h5 className="font-semibold text-gray-900">
                      {review.userName}
                    </h5>
                    {review.isVerifiedPurchase && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <FaCheckCircle className="text-sm" />
                        <span className="text-xs font-medium">Verified Purchase</span>
                      </div>
                    )}
                    <span className="text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  
                  <StarRating
                    rating={review.rating}
                    size="sm"
                    className="mb-3"
                  />
                  
                  <p className="text-gray-700 leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex space-x-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white"
                      : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;