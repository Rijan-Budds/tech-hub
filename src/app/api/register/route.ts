import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { User } from "@/lib/models";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  await connectToDatabase();
  const { username, email, password } = await req.json();
  if (!username || !email || !password) {
    return NextResponse.json({ message: "Please provide username, email, and password" }, { status: 400 });
  }
  const existing = await User.findOne({ $or: [{ username }, { email }] });
  if (existing) return NextResponse.json({ message: "Username or email already taken" }, { status: 400 });
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, password: hashed });
  const token = signToken({ sub: user._id.toString(), email: user.email, username: user.username, role: 'user' });
  const res = NextResponse.json({ message: 'User registered successfully', user: { id: user._id, email: user.email, username: user.username, role: 'user' } }, { status: 201 });
  res.cookies.set('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 });
  return res;
}


