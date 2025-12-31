import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inquiries as inquiriesTable } from "@/lib/schema";

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    const inquiryId = crypto.randomUUID();
    await db.insert(inquiriesTable).values({
      id: inquiryId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      status: "pending"
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for your inquiry! We'll get back to you soon.",
        inquiryId: inquiryId
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating contact inquiry:", error);
    return NextResponse.json(
      { error: "Failed to submit inquiry. Please try again." },
      { status: 500 }
    );
  }
}