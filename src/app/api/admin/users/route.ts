import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users as usersTable } from "@/lib/schema";
import { sql, desc, asc } from "drizzle-orm";
import { getAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

    const offset = (page - 1) * limit;

    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
    const totalCount = Number(countResult?.count || 0);

    const orderBy = sortOrder === "desc"
      ? (sortBy === "username" ? desc(usersTable.username) : sortBy === "email" ? desc(usersTable.email) : desc(usersTable.createdAt))
      : (sortBy === "username" ? asc(usersTable.username) : sortBy === "email" ? asc(usersTable.email) : asc(usersTable.createdAt));

    const users = await db.select().from(usersTable)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    const userList = users.map((user) => ({
      _id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    }));

    return NextResponse.json({
      users: userList,
      pagination: {
        page,
        limit,
        totalCount: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
