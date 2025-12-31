import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users as usersTable } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getAuth } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { userId } = await params;
    if (!userId || userId === "admin") {
      return NextResponse.json({ message: "Invalid userId" }, { status: 400 });
    }

    const result = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const user = result[0];
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await db.delete(usersTable).where(eq(usersTable.id, userId));
    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Failed to delete user" },
      { status: 500 },
    );
  }
}
