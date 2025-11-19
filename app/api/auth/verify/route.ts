import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { idToken, email, password } = await request.json();

    // إذا كان هناك idToken (من Google أو Firebase Auth)
    if (idToken) {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      
      // جلب بيانات المستخدم من Firestore
      const userDoc = await adminFirestore.collection("users").doc(decodedToken.uid).get();
      const userData = userDoc.exists ? userDoc.data() : null;
      
      return NextResponse.json({
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || userData?.name || decodedToken.email?.split("@")[0] || "مستخدم",
      });
    }

    // إذا كان هناك email و password (تسجيل دخول عادي)
    if (email && password) {
      // هنا يمكن إضافة منطق التحقق من البريد الإلكتروني وكلمة المرور
      // لكن Firebase Client SDK يتعامل مع هذا
      // يمكن استخدام Firebase Admin SDK للتحقق من المستخدم
      return NextResponse.json(
        { error: "Use Firebase Client SDK for email/password authentication" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "ID token or email/password is required" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: error.message || "Invalid token" },
      { status: 401 }
    );
  }
}

