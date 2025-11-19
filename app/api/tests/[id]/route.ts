import { NextRequest, NextResponse } from "next/server";
import { adminFirestore, adminAuth, FieldValue, checkFirebaseAdmin } from "@/lib/firebase-admin";

// PUT - تحديث اختبار
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!checkFirebaseAdmin()) {
      return NextResponse.json(
        { error: "Firebase Admin not initialized" },
        { status: 503 }
      );
    }
    const { id } = params;
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

    await adminFirestore.collection("tests").doc(id).update({
      ...testData,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updatedDoc = await adminFirestore.collection("tests").doc(id).get();

    return NextResponse.json({
      id,
      ...updatedDoc.data(),
    });
  } catch (error: any) {
    console.error("Update test error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update test" },
      { status: 500 }
    );
  }
}

// DELETE - حذف اختبار
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!checkFirebaseAdmin()) {
      return NextResponse.json(
        { error: "Firebase Admin not initialized" },
        { status: 503 }
      );
    }
    const { id } = params;
    const { idToken } = await request.json();

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

    await adminFirestore.collection("tests").doc(id).delete();

    return NextResponse.json({
      message: "Test deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete test error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete test" },
      { status: 500 }
    );
  }
}

