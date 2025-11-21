import { NextRequest, NextResponse } from "next/server";

// GET - جلب جميع الدورات
export async function GET(request: NextRequest) {
  try {
    // Firebase Admin SDK تم إزالته - استخدم Firebase Client SDK في العميل
      return NextResponse.json({ courses: [] });
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
    // Firebase Admin SDK تم إزالته - استخدم Firebase Client SDK في العميل
      return NextResponse.json(
      { error: "This endpoint requires Firebase Client SDK. Please use Firebase Client SDK to add courses." },
        { status: 503 }
      );
  } catch (error: any) {
    console.error("Add course error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add course" },
      { status: 500 }
    );
  }
}

