import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { message: "No images provided" },
        { status: 400 },
      );
    }

    const imageUrls: string[] = [];
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const uploadDir = path.join(process.cwd(), "public", "uploads", String(year), month);

    await mkdir(uploadDir, { recursive: true });

    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name) || ".jpg";
      const filename = `${uuidv4()}${ext}`;
      const filePath = path.join(uploadDir, filename);

      await writeFile(filePath, buffer);
      imageUrls.push(`/uploads/${year}/${month}/${filename}`);
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
