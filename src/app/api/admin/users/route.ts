import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models";
import { getAuth } from "@/lib/auth";

export async function GET() {
  await dbConnect();
  const auth = await getAuth();
  if (!auth || auth.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const users = await User.find({}, { username: 1, email: 1 }).lean();
  return NextResponse.json({ users });
}


