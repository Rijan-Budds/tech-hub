import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export async function getAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    return payload as { sub: string; email: string; username: string; role?: string };
  } catch {
    return null;
  }
}

export function signToken(payload: { sub: string; email: string; username: string; role?: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}


