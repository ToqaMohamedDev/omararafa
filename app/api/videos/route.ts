import { NextRequest, NextResponse } from "next/server";

// GET - جلب جميع الفيديوهات
export async function GET(request: NextRequest) {
  try {
    // Firebase Admin SDK تم إزالته - استخدم Firebase Client SDK في العميل
    return NextResponse.json({ videos: [] });
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
    // Firebase Admin SDK تم إزالته - استخدم Firebase Client SDK في العميل
    return NextResponse.json(
      { error: "This endpoint requires Firebase Client SDK. Please use Firebase Client SDK to add videos." },
      { status: 503 }
    );
  } catch (error: any) {
    console.error("Add video error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add video" },
      { status: 500 }
    );
  }
}

