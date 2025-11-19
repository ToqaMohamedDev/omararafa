import { NextRequest, NextResponse } from "next/server";
import { adminAuth, checkFirebaseAdmin } from "@/lib/firebase-admin";

const ADMIN_EMAIL = "dzggghjg@gmail.com";

export async function POST(request: NextRequest) {
  try {
    if (!checkFirebaseAdmin() || !adminAuth) {
      return NextResponse.json(
        { error: "Firebase Admin not initialized" },
        { status: 503 }
      );
    }

    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 }
      );
    }

    // التحقق من الـ token
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // التحقق من أن المستخدم هو Admin
    if (decodedToken.email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access only" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      isAdmin: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
    });
  } catch (error: any) {
    console.error("Admin check error:", error);
    return NextResponse.json(
      { error: error.message || "Invalid token" },
      { status: 401 }
    );
  }
}

