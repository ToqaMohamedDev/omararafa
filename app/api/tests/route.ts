import { NextRequest, NextResponse } from "next/server";
import { adminFirestore, adminAuth, FieldValue, checkFirebaseAdmin } from "@/lib/firebase-admin";

// GET - جلب جميع الاختبارات
export async function GET(request: NextRequest) {
  try {
    if (!adminFirestore) {
      // في development، إرجاع بيانات فارغة بدلاً من 503
      return NextResponse.json({ tests: [] });
    }
    const testsSnapshot = await adminFirestore.collection("tests").orderBy("createdAt", "desc").get();
    
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

// POST - إضافة اختبار جديد
export async function POST(request: NextRequest) {
  try {
    if (!checkFirebaseAdmin() || !adminAuth || !adminFirestore || !FieldValue) {
      return NextResponse.json(
        { error: "Firebase Admin not initialized" },
        { status: 503 }
      );
    }
    const { idToken, title, description, questionsData, category } = await request.json();

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

    if (!title || !description || !questionsData || !Array.isArray(questionsData)) {
      return NextResponse.json(
        { error: "Title, description, and questions data are required" },
        { status: 400 }
      );
    }

    const testRef = await adminFirestore.collection("tests").add({
      title,
      description,
      questionsData,
      category: category || "",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      id: testRef.id,
      message: "Test added successfully",
    });
  } catch (error: any) {
    console.error("Add test error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add test" },
      { status: 500 }
    );
  }
}

