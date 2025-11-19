import { NextRequest, NextResponse } from "next/server";
import { adminFirestore, adminAuth, FieldValue, checkFirebaseAdmin } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    if (!adminFirestore) {
      return NextResponse.json(
        { tests: [], error: "Firebase Admin not initialized" },
        { status: 503 }
      );
    }
    const testsSnapshot = await adminFirestore.collection("tests").get();
    const tests = testsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ tests });
  } catch (error: any) {
    console.error("Get tests error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get tests" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!checkFirebaseAdmin() || !adminAuth || !adminFirestore || !FieldValue) {
      return NextResponse.json(
        { error: "Firebase Admin not initialized" },
        { status: 503 }
      );
    }
    const { idToken, ...testData } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 }
      );
    }

    // التحقق من Admin
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    if (decodedToken.email !== "dzggghjg@gmail.com") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access only" },
        { status: 403 }
      );
    }

    const docRef = await adminFirestore.collection("tests").add({
      ...testData,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      id: docRef.id,
      ...testData,
    });
  } catch (error: any) {
    console.error("Create test error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create test" },
      { status: 500 }
    );
  }
}

