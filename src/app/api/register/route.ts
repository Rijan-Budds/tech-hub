import { NextResponse } from "next/server";
import { userService } from "@/lib/firebase-db";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { username, email, password } = await req.json();
  if (!username || !email || !password) {
    return NextResponse.json({ message: "Please provide username, email, and password" }, { status: 400 });
  }
  
  // Check if user already exists
  const existingUser = await userService.getUserByEmail(email);
  if (existingUser) return NextResponse.json({ message: "Email already taken" }, { status: 400 });
  
  // Check if username already exists (get all users and check)
  const allUsers = await userService.getAllUsers();
  const existingUsername = allUsers.find(user => user.username === username);
  if (existingUsername) return NextResponse.json({ message: "Username already taken" }, { status: 400 });
  
  const hashed = await bcrypt.hash(password, 10);
  const userId = await userService.createUser({ username, email, password: hashed, cart: [], wishlist: [] });
  const user = await userService.getUserById(userId);
  
  if (!user || !user.id) return NextResponse.json({ message: "Failed to create user" }, { status: 500 });
  
  const token = signToken({ sub: user.id, email: user.email, username: user.username, role: 'user' });
  const res = NextResponse.json({ message: 'User registered successfully', user: { id: user.id, email: user.email, username: user.username, role: 'user' } }, { status: 201 });
  res.cookies.set('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 });
  return res;
}


