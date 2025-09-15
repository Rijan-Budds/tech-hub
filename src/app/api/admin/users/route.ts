import { NextResponse } from "next/server";
import { userService } from "@/lib/firebase-db";
import { getAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    
    const result = await userService.getAllUsersWithPagination(page, limit, sortBy, sortOrder);
    
    const userList = result.users.map(user => ({
      _id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    }));
    
    return NextResponse.json({ 
      users: userList,
      pagination: {
        page,
        limit,
        totalCount: result.totalCount,
        totalPages: Math.ceil(result.totalCount / limit),
        hasNextPage: page < Math.ceil(result.totalCount / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Failed to fetch users' }, { status: 500 });
  }
}


