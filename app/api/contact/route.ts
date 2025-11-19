import { NextRequest, NextResponse } from "next/server";
import { adminFirestore, FieldValue, checkFirebaseAdmin } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    checkFirebaseAdmin();
    const { name, email, phone, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    const contactRef = await adminFirestore.collection("contacts").add({
      name,
      email,
      phone: phone || null,
      subject: subject || null,
      message,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      id: contactRef.id,
      message: "Contact form submitted successfully",
    });
  } catch (error: any) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit contact form" },
      { status: 500 }
    );
  }
}

