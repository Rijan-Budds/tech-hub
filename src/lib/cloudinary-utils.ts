import cloudinary from "./cloudinary";

export async function uploadImageToCloudinary(
  file: File,
  folder: string = "ecommerce",
): Promise<{ url: string; public_id: string; secure_url: string }> {
  // Convert file to buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Convert buffer to base64 string
  const base64String = `data:${file.type};base64,${buffer.toString("base64")}`;

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(base64String, {
    folder,
    resource_type: "auto",
    transformation: [
      { width: 800, height: 600, crop: "limit" },
      { quality: "auto" },
    ],
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
    secure_url: result.secure_url,
  };
}
