"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { FaSearchPlus, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface ImageGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  productName,
  className = "",
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  
  // Use first image if images array is empty, fallback to placeholder
  const displayImages = images.length > 0 ? images : ['/placeholder-product.jpg'];
  const currentImage = displayImages[currentImageIndex];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHovering) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setIsZoomed(false);
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
    setIsZoomed(false);
    setIsHovering(false);
  };

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => 
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  }, [displayImages.length]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  }, [displayImages.length]);

  const openFullscreen = () => {
    setShowFullscreen(true);
  };

  const closeFullscreen = useCallback(() => {
    setShowFullscreen(false);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showFullscreen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          prevImage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextImage();
          break;
        case 'Escape':
          e.preventDefault();
          closeFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFullscreen, nextImage, prevImage, closeFullscreen]);

  return (
    <div className={className}>
      {/* Main Image Display */}
      <div className="space-y-4">
        <div 
          ref={imageRef}
          className="relative overflow-hidden rounded-2xl shadow-2xl bg-gray-100 group cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={openFullscreen}
        >
          {/* Main Image */}
          <div className="relative w-full h-[500px]">
            <Image
              src={currentImage}
              alt={`${productName} - Image ${currentImageIndex + 1}`}
              fill
              className={`object-cover transition-transform duration-200 ${
                isZoomed ? 'scale-150' : 'scale-100 group-hover:scale-105'
              }`}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    }
                  : {}
              }
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={currentImageIndex === 0}
            />
            
            {/* Zoom Icon Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black bg-opacity-50 text-white p-3 rounded-full">
                <FaSearchPlus className="text-xl" />
              </div>
            </div>
            
            {/* Image Counter */}
            {displayImages.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {displayImages.length}
              </div>
            )}
          </div>
        </div>

        {/* Zoom Instruction */}
        <div className="text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center space-x-2">
            <FaSearchPlus className="text-xs" />
            <span>Hover to zoom • Click for fullscreen</span>
          </p>
        </div>
      </div>

      {/* Thumbnail Navigation (only show if multiple images) */}
      {displayImages.length > 1 && (
        <div className="mt-6">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {displayImages.map((imageUrl, index) => (
              <button
                key={index}
                onClick={() => selectImage(index)}
                className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  index === currentImageIndex
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Image
                  src={imageUrl}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
                {index === currentImageIndex && (
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-20"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
          <div className="relative w-full h-full max-w-6xl max-h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 p-2 rounded-full"
            >
              <FaTimes className="text-xl" />
            </button>

            {/* Main Fullscreen Image */}
            <div className="relative w-full h-full">
              <Image
                src={currentImage}
                alt={`${productName} - Fullscreen view`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {/* Navigation in Fullscreen */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 p-3 rounded-full"
                >
                  <FaChevronLeft className="text-xl" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 p-3 rounded-full"
                >
                  <FaChevronRight className="text-xl" />
                </button>
              </>
            )}

            {/* Fullscreen Image Counter */}
            {displayImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full">
                {currentImageIndex + 1} of {displayImages.length}
              </div>
            )}

            {/* Fullscreen Thumbnails */}
            {displayImages.length > 1 && (
              <div className="absolute bottom-4 right-4 flex space-x-2 max-w-xs overflow-x-auto">
                {displayImages.map((imageUrl, index) => (
                  <button
                    key={index}
                    onClick={() => selectImage(index)}
                    className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 ${
                      index === currentImageIndex
                        ? 'border-blue-400'
                        : 'border-gray-400 hover:border-gray-200'
                    }`}
                  >
                    <Image
                      src={imageUrl}
                      alt={`Thumbnail ${index + 1}`}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;