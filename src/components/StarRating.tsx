"use client";

import React, { useState } from "react";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  className = "",
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-sm";
      case "lg":
        return "text-xl";
      default:
        return "text-base";
    }
  };

  const renderStar = (index: number) => {
    const starNumber = index + 1;
    const currentRating = interactive && hoverRating > 0 ? hoverRating : rating;
    
    let StarIcon;
    if (currentRating >= starNumber) {
      StarIcon = FaStar;
    } else if (currentRating >= starNumber - 0.5) {
      StarIcon = FaStarHalfAlt;
    } else {
      StarIcon = FaRegStar;
    }

    return (
      <button
        key={index}
        type="button"
        className={`${getSizeClasses()} ${
          interactive
            ? "cursor-pointer hover:scale-110 transition-transform duration-150"
            : "cursor-default"
        } ${
          currentRating >= starNumber
            ? "text-yellow-400"
            : currentRating >= starNumber - 0.5
            ? "text-yellow-400"
            : "text-gray-300"
        }`}
        onClick={() => {
          if (interactive && onRatingChange) {
            onRatingChange(starNumber);
          }
        }}
        onMouseEnter={() => {
          if (interactive) {
            setHoverRating(starNumber);
          }
        }}
        onMouseLeave={() => {
          if (interactive) {
            setHoverRating(0);
          }
        }}
        disabled={!interactive}
      >
        <StarIcon />
      </button>
    );
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {Array.from({ length: maxRating }, (_, index) => renderStar(index))}
      {!interactive && (
        <span className="ml-2 text-sm text-gray-600">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
};

export default StarRating;