import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { randomBytes } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const auth = await getAuth();
  if (!auth || auth.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get('image');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = (file.type && file.type.includes('/')) ? `.${file.type.split('/')[1]}` : '';
  const filename = `${Date.now()}-${randomBytes(6).toString('hex')}${ext}`;
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, filename);
  await writeFile(filePath, buffer);

  const url = `/uploads/${filename}`;
  // Build absolute URL
  const origin = (req.headers.get('x-forwarded-proto') && req.headers.get('x-forwarded-host'))
    ? `${req.headers.get('x-forwarded-proto')}://${req.headers.get('x-forwarded-host')}`
    : new URL(req.url).origin;
  return NextResponse.json({ url: `${origin}${url}`, path: url }, { status: 201 });
}


