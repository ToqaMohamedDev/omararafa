import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebase-admin";
import admin from "firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // إنشاء مستخدم في Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: false,
    });

    // حفظ بيانات إضافية في Firestore
    await adminFirestore.collection("users").doc(userRecord.uid).set({
      name,
      email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      uid: userRecord.uid,
      email: userRecord.email,
      name: userRecord.displayName,
    });
  } catch (error: any) {
    console.error("User creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 400 }
    );
  }
}

