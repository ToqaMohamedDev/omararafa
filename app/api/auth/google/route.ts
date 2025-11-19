import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminFirestore, FieldValue, checkFirebaseAdmin } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    if (!checkFirebaseAdmin() || !adminAuth || !adminFirestore || !FieldValue) {
      return NextResponse.json(
        { error: "Firebase Admin not initialized" },
        { status: 503 }
      );
    }

    const { idToken, name } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 }
      );
    }

    // التحقق من الـ token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // التحقق من وجود المستخدم في Firestore
    const userDoc = await adminFirestore.collection("users").doc(decodedToken.uid).get();
    
    const userName = name || decodedToken.name || decodedToken.email?.split("@")[0] || "مستخدم";
    
    if (!userDoc.exists) {
      // إنشاء مستخدم جديد في Firestore
      await adminFirestore.collection("users").doc(decodedToken.uid).set({
        name: userName,
        email: decodedToken.email,
        photoURL: decodedToken.picture,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      // تحديث بيانات المستخدم
      await adminFirestore.collection("users").doc(decodedToken.uid).update({
        name: userName,
        email: decodedToken.email,
        photoURL: decodedToken.picture || userDoc.data()?.photoURL,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    
    return NextResponse.json({
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: userName,
      photoURL: decodedToken.picture,
    });
  } catch (error: any) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: error.message || "Invalid token" },
      { status: 401 }
    );
  }
}

