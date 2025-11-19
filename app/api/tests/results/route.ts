import { NextRequest, NextResponse } from "next/server";
import { adminFirestore, FieldValue } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { userId, testId, score, answers, percentage } = await request.json();

    if (!userId || !testId || score === undefined) {
      return NextResponse.json(
        { error: "userId, testId, and score are required" },
        { status: 400 }
      );
    }

    const resultRef = await adminFirestore.collection("testResults").add({
      userId,
      testId,
      score,
      percentage,
      answers,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      id: resultRef.id,
      userId,
      testId,
      score,
      percentage,
    });
  } catch (error: any) {
    console.error("Save test result error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save test result" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const resultsSnapshot = await adminFirestore
      .collection("testResults")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const results = resultsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Get test results error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get test results" },
      { status: 500 }
    );
  }
}

