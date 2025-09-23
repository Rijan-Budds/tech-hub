"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa';

interface DragDropUploadProps {
  onFileUpload: (file: File) => void;
  onImageUrl: (url: string) => void;
  currentImage?: string;
  uploading?: boolean;
  className?: string;
}

const DragDropUpload: React.FC<DragDropUploadProps> = ({
  onFileUpload,
  onImageUrl,
  currentImage,
  uploading = false,
  className = "",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState('');
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
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      onFileUpload(imageFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleUrlSubmit = () => {
    if (urlValue.trim()) {
      onImageUrl(urlValue.trim());
      setUrlValue('');
      setShowUrlInput(false);
    }
  };

  const clearImage = () => {
    onImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      {currentImage ? (
        // Show current image with option to change
        <div className="relative">
          <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
            <Image
              src={currentImage}
              alt="Product preview"
              width={400}
              height={192}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white text-gray-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                  disabled={uploading}
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(true)}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  disabled={uploading}
                >
                  URL
                </button>
                <button
                  type="button"
                  onClick={clearImage}
                  className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  disabled={uploading}
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl">
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-sm font-medium">Uploading...</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Show upload area
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
              <p className="text-sm text-gray-600">Uploading image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <FaCloudUploadAlt className="text-4xl text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-700">
                  Drop image here or click to browse
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supports: JPG, PNG, GIF (max 10MB)
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
                Use URL
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
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default DragDropUpload;