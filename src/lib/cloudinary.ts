import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dgjliothg',
  api_key: process.env.CLOUDINARY_API_KEY || '731944593645963',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'V6iA7bQLaRszHeyLnvilBPVS4U8',
});

export default cloudinary;
