import { NextResponse } from "next/server";
import { userService } from "@/lib/firebase-db";
import { getAuth } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const auth = await getAuth();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    const { userId } = await params;
    if (!userId || userId === 'admin') {
      return NextResponse.json({ message: 'Invalid userId' }, { status: 400 });
    }
    
    const user = await userService.getUserById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    await userService.deleteUser(userId);
    return NextResponse.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Failed to delete user' }, { status: 500 });
  }
}


