/**
 * Utility functions for product operations
 */

/**
 * Returns the display image for a product
 * Uses the first image from images array if available, otherwise falls back to primary image
 */
export function getProductDisplayImage(product: {
  image: string;
  images?: string[];
}): string {
  // If images array exists and has items, use the first one
  if (product.images && product.images.length > 0) {
    return product.images[0];
  }
  
  // Fallback to primary image
  return product.image;
}

/**
 * Returns all available images for a product
 * Combines images array with primary image, with primary image as fallback
 */
export function getAllProductImages(product: {
  image: string;
  images?: string[];
}): string[] {
  if (product.images && product.images.length > 0) {
    return product.images;
  }
  
  // Return primary image as single item array
  return [product.image];
}