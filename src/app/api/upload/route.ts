import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { uploadImageToCloudinary } from "@/lib/cloudinary-utils";

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const auth = await getAuth();
  if (!auth || auth.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get('image');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
  }

  try {
    // Upload to Cloudinary using utility function
    const result = await uploadImageToCloudinary(file, 'ecommerce');

    return NextResponse.json({ 
      url: result.secure_url, 
      path: result.secure_url,
      public_id: result.public_id 
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Cloudinary upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}


