import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Firebase Admin SDK تم إزالته - استخدم Firebase Client SDK في العميل
      return NextResponse.json(
      { error: "This endpoint requires Firebase Client SDK. Please use Firebase Client SDK for user creation." },
        { status: 503 }
      );
  } catch (error: any) {
    console.error("User creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 400 }
    );
  }
}

