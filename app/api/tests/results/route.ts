import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";

// تهيئة Firebase
let db: any = null;

try {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
  db = getFirestore();
} catch (error) {
  console.error("Firebase initialization error:", error);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, testId, score, percentage, answers, totalQuestions } = body;

    // التحقق من البيانات المطلوبة
    if (!userId || !testId || score === undefined || percentage === undefined) {
      return NextResponse.json(
        { error: "بيانات ناقصة" },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: "Firebase غير مهيأ" },
        { status: 500 }
      );
    }

    // حفظ النتيجة في Firestore
    const resultRef = await addDoc(collection(db, "testResults"), {
      userId,
      testId,
      score,
      percentage,
      totalQuestions: totalQuestions || score + (totalQuestions - score || 0),
      answers: answers || {},
      createdAt: serverTimestamp(),
    });

    // حساب المستوى الجديد بناءً على جميع النتائج
    await calculateAndUpdateUserLevel(userId);

    return NextResponse.json({
      success: true,
      resultId: resultRef.id,
    });
  } catch (error: any) {
    console.error("Error saving test result:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء حفظ النتيجة" },
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
        { error: "userId مطلوب" },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: "Firebase غير مهيأ" },
        { status: 500 }
      );
    }

    // جلب جميع نتائج المستخدم
    const resultsQuery = query(
      collection(db, "testResults"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const resultsSnapshot = await getDocs(resultsQuery);
    const results = resultsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Error fetching test results:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء جلب النتائج" },
      { status: 500 }
    );
  }
}

// دالة لحساب المستوى بناءً على النتائج
async function calculateAndUpdateUserLevel(userId: string) {
  try {
    if (!db) return;

    // جلب جميع نتائج المستخدم
    const resultsQuery = query(
      collection(db, "testResults"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const resultsSnapshot = await getDocs(resultsQuery);
    const results = resultsSnapshot.docs.map((doc) => doc.data());

    if (results.length === 0) {
      // إذا لم تكن هناك نتائج، المستوى هو "مبتدئ"
      await updateUserLevel(userId, "مبتدئ", 0, 0);
      return;
    }

    // حساب المعدل العام
    const totalPercentage = results.reduce((sum, result) => sum + (result.percentage || 0), 0);
    const averagePercentage = Math.round(totalPercentage / results.length);

    // حساب عدد الاختبارات المكتملة
    const completedTests = results.length;

    // تحديد المستوى بناءً على المعدل وعدد الاختبارات
    let level = "مبتدئ";
    let levelScore = 0;

    if (completedTests >= 20 && averagePercentage >= 90) {
      level = "ممتاز";
      levelScore = 5;
    } else if (completedTests >= 15 && averagePercentage >= 80) {
      level = "متقدم";
      levelScore = 4;
    } else if (completedTests >= 10 && averagePercentage >= 70) {
      level = "متوسط";
      levelScore = 3;
    } else if (completedTests >= 5 && averagePercentage >= 60) {
      level = "مبتدئ متقدم";
      levelScore = 2;
    } else {
      level = "مبتدئ";
      levelScore = 1;
    }

    // تحديث مستوى المستخدم في Firestore
    await updateUserLevel(userId, level, averagePercentage, completedTests, levelScore);
  } catch (error) {
    console.error("Error calculating user level:", error);
  }
}

// دالة لتحديث مستوى المستخدم
async function updateUserLevel(
  userId: string,
  level: string,
  averagePercentage: number,
  completedTests: number,
  levelScore: number = 0
) {
  try {
    if (!db) return;

    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      await updateDoc(userRef, {
        level: level,
        levelScore: levelScore,
        averageScore: averagePercentage,
        completedTests: completedTests,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error updating user level:", error);
  }
}
