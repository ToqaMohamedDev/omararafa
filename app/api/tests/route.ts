import { NextRequest, NextResponse } from "next/server";

// GET - جلب جميع الاختبارات
export async function GET(request: NextRequest) {
  try {
    // Firebase Admin SDK تم إزالته - استخدم Firebase Client SDK في العميل
    return NextResponse.json({ tests: [] });
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
    // Firebase Admin SDK تم إزالته - استخدم Firebase Client SDK في العميل
    return NextResponse.json(
      { error: "This endpoint requires Firebase Client SDK. Please use Firebase Client SDK to add tests." },
      { status: 503 }
    );
  } catch (error: any) {
    console.error("Add test error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add test" },
      { status: 500 }
    );
  }
}

