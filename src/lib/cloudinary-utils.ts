import cloudinary from './cloudinary';

export interface CloudinaryUploadResult {
  url: string;
  public_id: string;
  secure_url: string;
}

export async function uploadImageToCloudinary(
  file: File,
  folder: string = 'ecommerce'
): Promise<CloudinaryUploadResult> {
  // Convert file to buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Convert buffer to base64 string
  const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;
  
  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(base64String, {
    folder,
    resource_type: 'auto',
    transformation: [
      { width: 800, height: 600, crop: 'limit' },
      { quality: 'auto' }
    ]
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
    secure_url: result.secure_url
  };
}

export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    // Don't throw error to prevent breaking the application
  }
}

export function getCloudinaryUrl(publicId: string, options: {
  width?: number;
  height?: number;
  crop?: string;
  quality?: string;
} = {}): string {
  const transformations = [];
  
  if (options.width || options.height) {
    transformations.push(`w_${options.width || 'auto'},h_${options.height || 'auto'}`);
  }
  
  if (options.crop) {
    transformations.push(`c_${options.crop}`);
  }
  
  if (options.quality) {
    transformations.push(`q_${options.quality}`);
  }
  
  const transformationString = transformations.length > 0 ? transformations.join(',') + '/' : '';
  
  return `https://res.cloudinary.com/dgjliothg/image/upload/${transformationString}${publicId}`;
}
