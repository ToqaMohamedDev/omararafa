import { NextRequest, NextResponse } from "next/server";
import { adminFirestore, adminAuth, FieldValue } from "@/lib/firebase-admin";

// GET - جلب جميع الدورات
export async function GET(request: NextRequest) {
  try {
    const coursesSnapshot = await adminFirestore.collection("courses").orderBy("createdAt", "desc").get();
    
    // جلب جميع التصنيفات
    const categoriesSnapshot = await adminFirestore.collection("categories").get();
    const categoriesMap = new Map();
    categoriesSnapshot.docs.forEach((doc: any) => {
      categoriesMap.set(doc.id, doc.data().name);
    });

    // إضافة اسم التصنيف لكل دورة
    const courses = coursesSnapshot.docs.map((doc: any) => {
      const courseData = doc.data();
      const categoryId = courseData.category;
      return {
        id: doc.id,
        ...courseData,
        categoryName: categoryId ? categoriesMap.get(categoryId) || "" : "",
      };
    });

    return NextResponse.json({ courses });
  } catch (error: any) {
    console.error("Get courses error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get courses" },
      { status: 500 }
    );
  }
}

// POST - إضافة دورة جديدة
export async function POST(request: NextRequest) {
  try {
    const { idToken, title, description, videoUrl, thumbnailUrl, duration, level, instructor, category } = await request.json();

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

    if (!title || !description || !videoUrl || !category) {
      return NextResponse.json(
        { error: "Title, description, video URL, and category are required" },
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

    const courseRef = await adminFirestore.collection("courses").add({
      title,
      description,
      videoUrl,
      thumbnailUrl: thumbnailUrl || "",
      duration: duration || "0 ساعة",
      level: level || "مبتدئ",
      instructor: instructor || "عمر عرفه",
      category, // category ID
      students: 0,
      rating: 0,
      lessons: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      id: courseRef.id,
      message: "Course added successfully",
    });
  } catch (error: any) {
    console.error("Add course error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add course" },
      { status: 500 }
    );
  }
}

