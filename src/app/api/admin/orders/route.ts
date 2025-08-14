import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { User } from "@/lib/models";
import { getAuth } from "@/lib/auth";
import { Document, FlattenMaps } from "mongoose";

// Define your Order interface
interface IOrder {
  _id?: string;
  status: string;
  createdAt: Date;
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  customer: Record<string, unknown>; // Better than 'any'
  items: Array<Record<string, unknown>>;
}

// Define your User document interface
interface IUser {
  _id: string;
  username: string;
  email: string;
  orders?: IOrder[];
  __v?: number; // Mongoose version key
}

// Type for the lean result
type LeanUser = FlattenMaps<IUser & Document>;

// Response type for orders
interface OrderResponse {
  orderId: string;
  userId: string;
  username: string;
  email: string;
  status: string;
  createdAt: Date;
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  customer: Record<string, unknown>;
  items: Array<Record<string, unknown>>;
}

export async function GET() {
  await connectToDatabase();
  const auth = await getAuth();
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  
  // Fetch users with proper typing
  const users = await User.find({}).lean<LeanUser[]>();
  
  const allOrders: OrderResponse[] = [];
  
  for (const u of users) {
    (u.orders || []).forEach((o) => {
      allOrders.push({
        orderId: o._id?.toString() || '',
        userId: u._id.toString(),
        username: u.username,
        email: u.email,
        status: o.status,
        createdAt: o.createdAt,
        subtotal: o.subtotal,
        deliveryFee: o.deliveryFee,
        grandTotal: o.grandTotal,
        customer: o.customer,
        items: o.items,
      });
    });
  }
  
  return NextResponse.json({ orders: allOrders });
}