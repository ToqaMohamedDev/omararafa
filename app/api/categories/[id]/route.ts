import { NextRequest, NextResponse } from "next/server";
import { adminFirestore, adminAuth, FieldValue } from "@/lib/firebase-admin";

// PUT - تحديث تصنيف
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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

    // التحقق من عدم وجود تصنيف آخر بنفس الاسم
    const existingCategories = await adminFirestore
      .collection("categories")
      .where("name", "==", name.trim())
      .get();

    const hasDuplicate = existingCategories.docs.some(
      (doc: any) => doc.id !== id
    );

    if (hasDuplicate) {
      return NextResponse.json(
        { error: "Category name already exists" },
        { status: 400 }
      );
    }

    await adminFirestore.collection("categories").doc(id).update({
      name: name.trim(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updatedDoc = await adminFirestore.collection("categories").doc(id).get();

    return NextResponse.json({
      id,
      ...updatedDoc.data(),
    });
  } catch (error: any) {
    console.error("Update category error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE - حذف تصنيف
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // التحقق من وجود فيديوهات أو دورات تستخدم هذا التصنيف
    const videosWithCategory = await adminFirestore
      .collection("videos")
      .where("category", "==", id)
      .get();

    const coursesWithCategory = await adminFirestore
      .collection("courses")
      .where("category", "==", id)
      .get();

    if (!videosWithCategory.empty || !coursesWithCategory.empty) {
      const items = [];
      if (!videosWithCategory.empty) items.push("فيديوهات");
      if (!coursesWithCategory.empty) items.push("دورات");
      return NextResponse.json(
        { error: `لا يمكن حذف التصنيف: يوجد ${items.join(" و ")} تستخدم هذا التصنيف` },
        { status: 400 }
      );
    }

    await adminFirestore.collection("categories").doc(id).delete();

    return NextResponse.json({
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}

