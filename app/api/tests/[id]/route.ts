import { NextRequest, NextResponse } from "next/server";

// PUT - تحديث اختبار
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Firebase Admin SDK تم إزالته - استخدم Firebase Client SDK في العميل
    return NextResponse.json(
      { error: "This endpoint requires Firebase Client SDK. Please use Firebase Client SDK to update tests." },
      { status: 503 }
    );
  } catch (error: any) {
    console.error("Update test error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update test" },
      { status: 500 }
    );
  }
}

// DELETE - حذف اختبار
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Firebase Admin SDK تم إزالته - استخدم Firebase Client SDK في العميل
    return NextResponse.json(
      { error: "This endpoint requires Firebase Client SDK. Please use Firebase Client SDK to delete tests." },
      { status: 503 }
    );
  } catch (error: any) {
    console.error("Delete test error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete test" },
      { status: 500 }
    );
  }
}

