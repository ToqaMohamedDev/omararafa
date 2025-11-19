import { NextRequest, NextResponse } from "next/server";
import { adminFirestore, adminAuth, FieldValue, checkFirebaseAdmin } from "@/lib/firebase-admin";

// GET - جلب جميع التصنيفات
export async function GET(request: NextRequest) {
  try {
    if (!adminFirestore) {
      return NextResponse.json(
        { categories: [], error: "Firebase Admin not initialized" },
        { status: 503 }
      );
    }
    const categoriesSnapshot = await adminFirestore.collection("categories").orderBy("name").get();
    const categories = categoriesSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get categories" },
      { status: 500 }
    );
  }
}

// POST - إضافة تصنيف جديد
export async function POST(request: NextRequest) {
  try {
    if (!checkFirebaseAdmin()) {
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

    // التحقق من Admin
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    if (decodedToken.email !== "dzggghjg@gmail.com") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access only" },
        { status: 403 }
      );
    }

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // التحقق من عدم وجود تصنيف بنفس الاسم
    const existingCategories = await adminFirestore
      .collection("categories")
      .where("name", "==", name.trim())
      .get();

    if (!existingCategories.empty) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 400 }
      );
    }

    const categoryRef = await adminFirestore.collection("categories").add({
      name: name.trim(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      id: categoryRef.id,
      name: name.trim(),
      message: "Category added successfully",
    });
  } catch (error: any) {
    console.error("Add category error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add category" },
      { status: 500 }
    );
  }
}

