import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ message: "No images provided" }, { status: 400 });
    }

    // Limit to 5 images max
    if (files.length > 5) {
      return NextResponse.json({ message: "Maximum 5 images allowed" }, { status: 400 });
    }

    const imageUrls: string[] = [];

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ message: `Invalid file type: ${file.type}` }, { status: 400 });
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ message: `File too large: ${file.name}` }, { status: 400 });
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
    return NextResponse.json({ message: "Failed to upload images" }, { status: 500 });
  }
}