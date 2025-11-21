import { NextRequest, NextResponse } from "next/server";

// PUT - تحديث فيديو
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Firebase Admin SDK تم إزالته - استخدم Firebase Client SDK في العميل
      return NextResponse.json(
      { error: "This endpoint requires Firebase Client SDK. Please use Firebase Client SDK to update videos." },
        { status: 503 }
      );
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
    // Firebase Admin SDK تم إزالته - استخدم Firebase Client SDK في العميل
      return NextResponse.json(
      { error: "This endpoint requires Firebase Client SDK. Please use Firebase Client SDK to delete videos." },
        { status: 503 }
      );
  } catch (error: any) {
    console.error("Delete video error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete video" },
      { status: 500 }
    );
  }
}

