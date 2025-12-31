import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { username, email, password } = await req.json();
  if (!username || !email || !password) {
    return NextResponse.json(
      { message: "Please provide username, email, and password" },
      { status: 400 },
    );
  }

  // Check if user already exists
  const existingUsers = await db.select().from(users).where(
    or(eq(users.email, email), eq(users.username, username))
  ).limit(1);

  const existingUser = existingUsers[0];

  if (existingUser) {
    if (existingUser.email === email) {
      return NextResponse.json(
        { message: "Email already taken" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: "Username already taken" },
      { status: 400 },
    );
  }

  const hashed = await bcrypt.hash(password, 10);
  try {
    const [result] = await db.insert(users).values({
      username,
      email,
      password: hashed,
      cart: "[]",
      wishlist: "[]",
    });

    // Since we use randomUUID in Drizzle, we might need to fetch the user back if we want the ID 
    // but Drizzle returns information about the insertion.
    // Actually our schema says id is primary key with default randomUUID.
    // Let's refetch to be sure or just use the one we inserted if we had it.
    // Better: we can specify the ID ourselves to be sure.

    const newUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = newUser[0];

    const token = signToken({
      sub: user.id,
      email: user.email,
      username: user.username,
      role: "user",
    });
    const res = NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: "user",
        },
      },
      { status: 201 },
    );
    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
    });
    return res;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Failed to create user" },
      { status: 500 },
    );
  }
}
