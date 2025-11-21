import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Admin verification is now handled client-side using Firestore roles collection
    // This endpoint is no longer used
      return NextResponse.json(
      { error: "Admin verification is now handled client-side using Firestore roles collection." },
        { status: 503 }
      );
  } catch (error: any) {
    console.error("Admin check error:", error);
    return NextResponse.json(
      { error: error.message || "Invalid token" },
      { status: 401 }
    );
  }
}

