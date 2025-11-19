import { NextRequest, NextResponse } from "next/server";
import { adminFirestore, FieldValue, checkFirebaseAdmin } from "@/lib/firebase-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    if (!checkFirebaseAdmin() || !adminFirestore) {
      return NextResponse.json(
        { error: "Firebase Admin not initialized" },
        { status: 503 }
      );
    }
    const { uid } = params;

    const userDoc = await adminFirestore.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      uid,
      ...userDoc.data(),
    });
  } catch (error: any) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    if (!checkFirebaseAdmin() || !adminFirestore || !FieldValue) {
      return NextResponse.json(
        { error: "Firebase Admin not initialized" },
        { status: 503 }
      );
    }
    const { uid } = params;
    const data = await request.json();

    await adminFirestore.collection("users").doc(uid).update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updatedDoc = await adminFirestore.collection("users").doc(uid).get();

    return NextResponse.json({
      uid,
      ...updatedDoc.data(),
    });
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

