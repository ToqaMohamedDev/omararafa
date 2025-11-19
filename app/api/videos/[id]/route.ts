import { NextRequest, NextResponse } from "next/server";
import { adminFirestore, adminAuth, FieldValue, checkFirebaseAdmin } from "@/lib/firebase-admin";

// PUT - تحديث فيديو
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
    const { idToken, title, videoUrl, thumbnailUrl, description, category, level } = await request.json();

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

    const updateData: any = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (title) updateData.title = title;
    if (videoUrl) updateData.videoUrl = videoUrl;
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;
    if (description) updateData.description = description;
    if (category) {
      // التحقق من وجود التصنيف
      const categoryDoc = await adminFirestore.collection("categories").doc(category).get();
      if (!categoryDoc.exists) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 400 }
        );
      }
      updateData.category = category;
    }
    if (level) updateData.level = level;

    await adminFirestore.collection("videos").doc(id).update(updateData);

    const updatedDoc = await adminFirestore.collection("videos").doc(id).get();

    return NextResponse.json({
      id,
      ...updatedDoc.data(),
    });
  } catch (error: any) {
    console.error("Update video error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update video" },
      { status: 500 }
    );
  }
}

// DELETE - حذف فيديو
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

    await adminFirestore.collection("videos").doc(id).delete();

    return NextResponse.json({
      message: "Video deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete video error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete video" },
      { status: 500 }
    );
  }
}

