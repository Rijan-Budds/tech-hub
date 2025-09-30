"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { FaTimes, FaPlus, FaGripVertical } from 'react-icons/fa';
import { toast } from 'sonner';
import { compressImages, validateImageFile, formatFileSize } from '@/utils/imageCompression';

interface MultipleImagesUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  uploading?: boolean;
  setUploading: (uploading: boolean) => void;
  maxImages?: number;
  className?: string;
}

const MultipleImagesUpload: React.FC<MultipleImagesUploadProps> = ({
  images,
  onImagesChange,
  uploading = false,
  maxImages = 10,
  className = "",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      handleFileUpload(imageFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (images.length + files.length > maxImages) {
      toast.error(`Cannot add more than ${maxImages} images`);
      return;
    }

    // Validate files first
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    files.forEach(file => {
      const validation = validateImageFile(file, 5); // 5MB limit before compression
      if (validation.valid) {
        validFiles.push(file);
      } else {
        validationErrors.push(validation.error!);
      }
    });

    if (validationErrors.length > 0) {
      toast.error(validationErrors.join('\n'));
      return;
    }

    if (validFiles.length === 0) {
      toast.error('No valid images to upload');
      return;
    }

    try {
      toast.info('Compressing and uploading images...');
      
      // Compress images to reduce size
      const compressedFiles = await compressImages(validFiles, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.85,
        format: 'jpeg',
      });

      // Log compression results
      const originalSize = validFiles.reduce((sum, file) => sum + file.size, 0);
      const compressedSize = compressedFiles.reduce((sum, file) => sum + file.size, 0);
      const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
      
      console.log(`Compressed ${validFiles.length} images:`);
      console.log(`Original size: ${formatFileSize(originalSize)}`);
      console.log(`Compressed size: ${formatFileSize(compressedSize)}`);
      console.log(`Compression: ${compressionRatio}%`);

      const formData = new FormData();
      compressedFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const newImages = [...images, ...data.imageUrls];
        onImagesChange(newImages);
        toast.success(
          `${files.length} image(s) uploaded successfully! ` +
          `(Compressed by ${compressionRatio}%)`
        );
      } else {
        throw new Error(data.message || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload images');
    }
  };

  const handleUrlSubmit = () => {
    if (!urlValue.trim()) return;

    if (images.length >= maxImages) {
      toast.error(`Cannot add more than ${maxImages} images`);
      return;
    }

    const newImages = [...images, urlValue.trim()];
    onImagesChange(newImages);
    setUrlValue('');
    setShowUrlInput(false);
    toast.success('Image URL added successfully');
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    toast.success('Image removed');
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  };

  const handleImageDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      moveImage(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleImageDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className={className}>
      {/* Current Images Grid */}
      {images.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Product Images ({images.length}/{maxImages})
            </h3>
            <p className="text-sm text-gray-500">
              {images.length === 0 ? 'First image will be the primary image' : 'Drag to reorder'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((imageUrl, index) => (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleImageDragStart(e, index)}
                onDragOver={(e) => handleImageDragOver(e, index)}
                onDragEnd={handleImageDragEnd}
                className={`relative group cursor-move rounded-xl overflow-hidden border-2 ${
                  index === 0 ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                } ${draggedIndex === index ? 'opacity-50' : ''}`}
              >
                {/* Primary Image Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-semibold z-10">
                    Primary
                  </div>
                )}
                
                {/* Drag Handle */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <FaGripVertical className="text-xs" />
                </div>

                {/* Image */}
                <Image
                  src={imageUrl}
                  alt={`Product image ${index + 1}`}
                  width={200}
                  height={200}
                  className="w-full h-32 object-cover"
                />

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute bottom-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  disabled={uploading}
                >
                  <FaTimes className="text-xs" />
                </button>

                {/* Image Order Number */}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add More Images Section */}
      {images.length < maxImages && (
        <div>
          {images.length > 0 && (
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
              Add More Images
            </h4>
          )}
          
          <div
            className={`
              border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
              ${isDragging 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-300 hover:border-gray-400'
              }
              ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:bg-gray-50'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            {uploading ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-600">Uploading images...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <FaPlus className="text-3xl text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    {images.length === 0 ? 'Add Product Images' : `Add More Images (${maxImages - images.length} remaining)`}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Drop images here or click to browse
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-400">OR</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUrlInput(true);
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
                  >
                    Enter image URL
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* URL Input Modal */}
      {showUrlInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Enter Image URL</h3>
            <input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowUrlInput(false);
                  setUrlValue('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUrlSubmit}
                disabled={!urlValue.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add URL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Helper Text */}
      {images.length === 0 && (
        <p className="text-sm text-gray-500 mt-4 text-center">
          The first image you add will be used as the primary product image displayed in listings.
        </p>
      )}
    </div>
  );
};

export default MultipleImagesUpload;