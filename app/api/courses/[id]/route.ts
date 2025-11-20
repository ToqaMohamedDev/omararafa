import { NextRequest, NextResponse } from "next/server";

// PUT - تحديث دورة
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Firebase Admin SDK تم إزالته - استخدم Firebase Client SDK في العميل
    return NextResponse.json(
      { error: "This endpoint requires Firebase Client SDK. Please use Firebase Client SDK to update courses." },
      { status: 503 }
    );
  } catch (error: any) {
    console.error("Update course error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update course" },
      { status: 500 }
    );
  }
}

// DELETE - حذف دورة
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Firebase Admin SDK تم إزالته - استخدم Firebase Client SDK في العميل
    return NextResponse.json(
      { error: "This endpoint requires Firebase Client SDK. Please use Firebase Client SDK to delete courses." },
      { status: 503 }
    );
  } catch (error: any) {
    console.error("Delete course error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete course" },
      { status: 500 }
    );
  }
}

