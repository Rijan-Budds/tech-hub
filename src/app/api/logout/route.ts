import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: 'Logged out' });
  res.cookies.set('token', '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 0 });
  return res;
}


