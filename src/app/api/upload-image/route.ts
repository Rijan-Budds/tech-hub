import { NextResponse } from "next/server";

// Increase the body size limit for this route
export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds timeout

export async function POST(req: Request) {
  try {
    console.log('Upload request received');
    
    // Log the content-length header to debug
    const contentLength = req.headers.get('content-length');
    console.log('Content-Length:', contentLength);
    
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { message: "No images provided" },
        { status: 400 },
      );
    }

    // Limit to 10 images max
    if (files.length > 10) {
      return NextResponse.json(
        { message: "Maximum 10 images allowed" },
        { status: 400 },
      );
    }

    const imageUrls: string[] = [];

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { message: `Invalid file type: ${file.type}` },
          { status: 400 },
        );
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { 
            message: `File too large: ${file.name}. Maximum size allowed is 10MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB` 
          },
          { status: 400 },
        );
      }

      // Convert to base64 data URL
      const buffer = await file.arrayBuffer();
      const base64String = Buffer.from(buffer).toString("base64");
      const dataUrl = `data:${file.type};base64,${base64String}`;

      imageUrls.push(dataUrl);
    }

    return NextResponse.json({ imageUrls });
  } catch (error) {
    console.error("Error uploading images:", error);
    return NextResponse.json(
      { message: "Failed to upload images" },
      { status: 500 },
    );
  }
}
