import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Firebase Admin SDK تم إزالته - استخدم Firebase Client SDK في العميل
      return NextResponse.json(
      { error: "This endpoint requires Firebase Client SDK. Please use Firebase Client SDK to submit contact forms." },
        { status: 503 }
      );
  } catch (error: any) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit contact form" },
      { status: 500 }
    );
  }
}

