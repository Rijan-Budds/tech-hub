# Cloudinary Setup Guide

## Installation

First, install the Cloudinary package:

```bash
npm install cloudinary
```

## Environment Variables

Create a `.env.local` file in your project root with the following variables:



## Features

### Image Upload
- Images are uploaded to Cloudinary instead of local storage
- Automatic image optimization and resizing
- Images are stored in the 'ecommerce' folder on Cloudinary
- Secure HTTPS URLs are returned

### Image Transformations
- Automatic resizing to max 800x600 pixels
- Quality optimization
- Support for various image formats

### Utility Functions
- `uploadImageToCloudinary()` - Upload images to Cloudinary
- `deleteImageFromCloudinary()` - Delete images from Cloudinary
- `getCloudinaryUrl()` - Generate optimized URLs with transformations

## Usage

The upload API endpoint (`/api/upload`) now automatically uploads images to Cloudinary and returns the secure URL.

### Example Response
```json
{
  "url": "https://res.cloudinary.com/dgjliothg/image/upload/v1234567890/ecommerce/image.jpg",
  "path": "https://res.cloudinary.com/dgjliothg/image/upload/v1234567890/ecommerce/image.jpg",
  "public_id": "ecommerce/image"
}
```

## Benefits

1. **Scalability**: No local storage limitations
2. **Performance**: CDN delivery for faster image loading
3. **Optimization**: Automatic image compression and resizing
4. **Security**: Secure HTTPS URLs
5. **Backup**: Cloudinary handles image backups
6. **Transformations**: On-the-fly image transformations

## Migration from Local Storage

If you have existing images in the `public/uploads/` folder, you'll need to:
1. Upload them to Cloudinary manually or via script
2. Update the database records with the new Cloudinary URLs
3. Remove the local uploads folder (optional)
