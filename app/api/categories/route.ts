import { NextRequest, NextResponse } from "next/server";

// GET - جلب جميع التصنيفات
export async function GET(request: NextRequest) {
  try {
    // Firebase Admin SDK تم إزالته - استخدم Firebase Client SDK في العميل
      return NextResponse.json({ categories: [] });
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
    // Firebase Admin SDK تم إزالته - استخدم Firebase Client SDK في العميل
      return NextResponse.json(
      { error: "This endpoint requires Firebase Client SDK. Please use Firebase Client SDK to add categories." },
        { status: 503 }
      );
  } catch (error: any) {
    console.error("Add category error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add category" },
      { status: 500 }
    );
  }
}

