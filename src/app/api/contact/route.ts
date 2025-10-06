import { NextRequest, NextResponse } from "next/server";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { IInquiry, COLLECTIONS } from "@/lib/firebase-models";

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    const db = getFirestore(app);
    
    // Create inquiry object
    const inquiry: Omit<IInquiry, "id"> = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      createdAt: Timestamp.now(),
      status: "pending"
    };

    // Save to Firestore
    const docRef = await addDoc(collection(db, COLLECTIONS.INQUIRIES), inquiry);

    return NextResponse.json(
      { 
        success: true, 
        message: "Thank you for your inquiry! We'll get back to you soon.",
        inquiryId: docRef.id 
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