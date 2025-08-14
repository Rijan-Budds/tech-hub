import { NextResponse } from "next/server";
import { userService } from "@/lib/firebase-db";
import { getAuth } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    const users = await userService.getAllUsers();
    const userList = users.map(user => ({
      _id: user.id,
      username: user.username,
      email: user.email
    }));
    
    return NextResponse.json({ users: userList });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Failed to fetch users' }, { status: 500 });
  }
}


