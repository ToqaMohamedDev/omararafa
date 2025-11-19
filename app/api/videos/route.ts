import { NextRequest, NextResponse } from "next/server";
import { adminFirestore, adminAuth, FieldValue, checkFirebaseAdmin } from "@/lib/firebase-admin";

// GET - جلب جميع الفيديوهات
export async function GET(request: NextRequest) {
  try {
    if (!adminFirestore) {
      return NextResponse.json(
        { videos: [], error: "Firebase Admin not initialized" },
        { status: 503 }
      );
    }
    const videosSnapshot = await adminFirestore.collection("videos").orderBy("createdAt", "desc").get();
    
    // جلب جميع التصنيفات
    const categoriesSnapshot = await adminFirestore.collection("categories").get();
    const categoriesMap = new Map();
    categoriesSnapshot.docs.forEach((doc: any) => {
      categoriesMap.set(doc.id, doc.data().name);
    });

    // إضافة اسم التصنيف لكل فيديو
    const videos = videosSnapshot.docs.map((doc: any) => {
      const videoData = doc.data();
      const categoryId = videoData.category;
      return {
        id: doc.id,
        ...videoData,
        categoryName: categoryId ? categoriesMap.get(categoryId) || "" : "",
      };
    });

    return NextResponse.json({ videos });
  } catch (error: any) {
    console.error("Get videos error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get videos" },
      { status: 500 }
    );
  }
}

// POST - إضافة فيديو جديد
export async function POST(request: NextRequest) {
  try {
    checkFirebaseAdmin();
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

    if (!title || !videoUrl || !description || !category) {
      return NextResponse.json(
        { error: "Title, video URL, description, and category are required" },
        { status: 400 }
      );
    }

    // التحقق من وجود التصنيف
    const categoryDoc = await adminFirestore.collection("categories").doc(category).get();
    if (!categoryDoc.exists) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 }
      );
    }

    const videoRef = await adminFirestore.collection("videos").add({
      title,
      videoUrl,
      thumbnailUrl: thumbnailUrl || "",
      description,
      category, // category ID
      level: level || "مبتدئ",
      views: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      id: videoRef.id,
      message: "Video added successfully",
    });
  } catch (error: any) {
    console.error("Add video error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add video" },
      { status: 500 }
    );
  }
}

