import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Firebase Admin SDK تم إزالته - استخدم Firebase Client SDK في العميل
      return NextResponse.json(
      { error: "This endpoint requires Firebase Client SDK. Please use Firebase Client SDK for authentication.", fallback: true },
        { status: 503 }
      );
  } catch (error: any) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: error.message || "Invalid token" },
      { status: 401 }
    );
  }
}

