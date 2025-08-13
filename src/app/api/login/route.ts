import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

const ADMIN_EMAIL = "admin@admin.com";
const ADMIN_PASSWORD = "Admin/1234";

export async function POST(req: Request) {
  await dbConnect();
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });

  // Admin hard-coded login
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = signToken({ sub: 'admin', email: ADMIN_EMAIL, username: 'admin', role: 'admin' });
    const res = NextResponse.json({ message: 'Admin login successful', user: { id: 'admin', email: ADMIN_EMAIL, username: 'admin', role: 'admin' } });
    res.cookies.set('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 });
    return res;
  }

  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
  const token = signToken({ sub: user._id.toString(), email: user.email, username: user.username, role: 'user' });
  const res = NextResponse.json({ message: 'Login successful', user: { id: user._id, email: user.email, username: user.username, role: 'user' } });
  res.cookies.set('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 });
  return res;
}


