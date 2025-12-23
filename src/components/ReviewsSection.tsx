// "use client";

// import React, { useState, useEffect } from "react";
// import { FaStar } from "react-icons/fa";
// import StarRating from "./StarRating";
// import ReviewForm from "./ReviewForm";
// import ReviewList from "./ReviewList";

// interface ReviewsSectionProps {
//   productId: string;
//   productName?: string;
//   productImage?: string;
//   averageRating?: number;
//   totalReviews?: number;
//   className?: string;
// }

// interface RatingDistribution {
//   [key: number]: number;
// }

// const ReviewsSection: React.FC<ReviewsSectionProps> = ({
//   productId,
//   productName,
//   averageRating = 0,
//   totalReviews = 0,
//   className = "",
// }) => {
//   const [ratingDistribution, setRatingDistribution] = useState<RatingDistribution>({
//     5: 0,
//     4: 0,
//     3: 0,
//     2: 0,
//     1: 0,
//   });
//   const [showReviewForm, setShowReviewForm] = useState(false);
//   const [currentUser, setCurrentUser] = useState<{ id: string; username: string; email: string } | null>(null);
//   const [hasReviewed, setHasReviewed] = useState(false);
//   const [refreshKey, setRefreshKey] = useState(0);

//   useEffect(() => {
//     // Check if user is logged in
//     const checkAuth = async () => {
//       try {
//         const response = await fetch("/api/me", { credentials: "include" });
//         if (response.ok) {
//           const data = await response.json();
//           setCurrentUser(data.user);
          
//           // Check if user has already reviewed this product
//           if (data.user) {
//             const reviewResponse = await fetch(
//               `/api/reviews?userId=${data.user.id}&productId=${productId}`,
//               { credentials: "include" }
//             );
//             if (reviewResponse.ok) {
//               const reviewData = await reviewResponse.json();
//               setHasReviewed(reviewData.reviews && reviewData.reviews.length > 0);
//             }
//           }
//         }
//       } catch (error) {
//         console.error("Error checking auth:", error);
//       }
//     };

//     checkAuth();
//   }, [productId, refreshKey]);

//   useEffect(() => {
//     // Fetch rating distribution
//     const fetchRatingDistribution = async () => {
//       try {
//         const response = await fetch(`/api/reviews?productId=${productId}`, {
//           credentials: "include",
//         });
        
//         if (response.ok) {
//           const data = await response.json();
//           const reviews = data.reviews || [];
          
//           // Calculate distribution
//           const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
//           reviews.forEach((review: { rating: number }) => {
//             const rating = Math.round(review.rating);
//             if (rating >= 1 && rating <= 5) {
//               distribution[rating as keyof typeof distribution]++;
//             }
//           });
          
//           setRatingDistribution(distribution);
//         }
//       } catch (error) {
//         console.error("Error fetching rating distribution:", error);
//       }
//     };

//     fetchRatingDistribution();
//   }, [productId, refreshKey]);

//   const handleReviewSubmitted = () => {
//     setShowReviewForm(false);
//     setHasReviewed(true);
//     setRefreshKey(prev => prev + 1); // Trigger refresh of all review-related data
//   };

//   const getPercentage = (count: number) => {
//     if (totalReviews === 0) return 0;
//     return Math.round((count / totalReviews) * 100);
//   };

//   return (
//     <div className={`space-y-8 ${className}`}>
//       {/* Rating Summary */}
//       <div className="bg-white rounded-xl shadow-lg p-6">
//         <h3 className="text-xl font-bold text-gray-900 mb-6">
//           {productName ? "Customer Reviews" : "Reviews & Ratings"}
//         </h3>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//           {/* Overall Rating */}
//           <div className="text-center">
//             <div className="mb-4">
//               <div className="text-5xl font-bold text-gray-900 mb-2">
//                 {averageRating ? averageRating.toFixed(1) : "0.0"}
//               </div>
//               <StarRating
//                 rating={averageRating || 0}
//                 size="lg"
//                 className="justify-center mb-2"
//               />
//               <p className="text-gray-600">
//                 Based on {totalReviews} review{totalReviews !== 1 ? "s" : ""}
//               </p>
//             </div>
            
//             {/* Write Review Button */}
//             {currentUser && !hasReviewed && (
//               <button
//                 onClick={() => setShowReviewForm(true)}
//                 className="bg-gradient-to-r from-[#0D3B66] via-[#1E5CAF] to-[#2E7DD2] text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-900 transition-all duration-200 shadow-lg hover:shadow-xl"
//               >
//                 Write a Review
//               </button>
//             )}
            
//             {!currentUser && (
//               <p className="text-gray-500 text-sm">
//                 <a href="#" className="text-blue-600 hover:underline">Sign in</a> to write a review
//               </p>
//             )}
            
//             {hasReviewed && (
//               <p className="text-green-600 text-sm font-medium">
//                 Thank you for your review!
//               </p>
//             )}
//           </div>

//           {/* Rating Breakdown */}
//           <div>
//             <h4 className="font-semibold text-gray-900 mb-4">Rating Breakdown</h4>
//             <div className="space-y-3">
//               {[5, 4, 3, 2, 1].map((rating) => (
//                 <div key={rating} className="flex items-center space-x-3">
//                   <div className="flex items-center space-x-1">
//                     <span className="text-sm font-medium text-gray-700 w-2">
//                       {rating}
//                     </span>
//                     <FaStar className="text-yellow-400 text-sm" />
//                   </div>
//                   <div className="flex-1 bg-gray-200 rounded-full h-2">
//                     <div
//                       className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
//                       style={{
//                         width: `${getPercentage(ratingDistribution[rating])}%`,
//                       }}
//                     ></div>
//                   </div>
//                   <span className="text-sm text-gray-600 w-12">
//                     {getPercentage(ratingDistribution[rating])}%
//                   </span>
//                   <span className="text-sm text-gray-400 w-6">
//                     ({ratingDistribution[rating]})
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Review Form */}
//       {showReviewForm && (
//         <ReviewForm
//           productId={productId}
//           onReviewSubmitted={handleReviewSubmitted}
//         />
//       )}

//       {/* Reviews List */}
//       <ReviewList key={refreshKey} productId={productId} />
//     </div>
//   );
// };

// export default ReviewsSection;
