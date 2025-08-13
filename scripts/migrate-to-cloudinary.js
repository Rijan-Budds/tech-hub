const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dgjliothg',
  api_key: '731944593645963',
  api_secret: 'V6iA7bQLaRszHeyLnvilBPVS4U8',
});

async function migrateImagesToCloudinary() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  
  try {
    // Check if uploads directory exists
    await fs.access(uploadsDir);
  } catch (error) {
    console.log('No uploads directory found. Nothing to migrate.');
    return;
  }

  try {
    const files = await fs.readdir(uploadsDir);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );

    if (imageFiles.length === 0) {
      console.log('No image files found in uploads directory.');
      return;
    }

    console.log(`Found ${imageFiles.length} images to migrate...`);

    for (const file of imageFiles) {
      const filePath = path.join(uploadsDir, file);
      console.log(`Uploading ${file}...`);

      try {
        const result = await cloudinary.uploader.upload(filePath, {
          folder: 'ecommerce',
          public_id: path.parse(file).name,
          resource_type: 'auto',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' }
          ]
        });

        console.log(`✅ ${file} uploaded successfully: ${result.secure_url}`);
        
        // Optionally delete the local file after successful upload
        // await fs.unlink(filePath);
        // console.log(`🗑️  Deleted local file: ${file}`);
        
      } catch (uploadError) {
        console.error(`❌ Failed to upload ${file}:`, uploadError.message);
      }
    }

    console.log('Migration completed!');
    console.log('\nNext steps:');
    console.log('1. Update your database records with the new Cloudinary URLs');
    console.log('2. Remove the local uploads folder (optional)');
    console.log('3. Test the application to ensure images load correctly');

  } catch (error) {
    console.error('Error during migration:', error);
  }
}

// Run the migration
migrateImagesToCloudinary();
