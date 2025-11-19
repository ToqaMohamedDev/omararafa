import { adminFirestore, adminAuth, FieldValue, checkFirebaseAdmin } from "./firebase-admin";

// Utility functions for Firebase operations

export async function getUserData(uid: string) {
  if (!checkFirebaseAdmin() || !adminFirestore) {
    throw new Error("Firebase Admin not initialized");
  }
  try {
    const userDoc = await adminFirestore.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return null;
    }
    return { uid, ...userDoc.data() };
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
}

export async function updateUserData(uid: string, data: any) {
  if (!checkFirebaseAdmin() || !adminFirestore || !FieldValue) {
    throw new Error("Firebase Admin not initialized");
  }
  try {
    await adminFirestore.collection("users").doc(uid).update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return await getUserData(uid);
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
}

export async function saveTestResult(
  userId: string,
  testId: string,
  score: number,
  percentage: number,
  answers: any
) {
  if (!checkFirebaseAdmin() || !adminFirestore || !FieldValue) {
    throw new Error("Firebase Admin not initialized");
  }
  try {
    const resultRef = await adminFirestore.collection("testResults").add({
      userId,
      testId,
      score,
      percentage,
      answers,
      createdAt: FieldValue.serverTimestamp(),
    });
    return resultRef.id;
  } catch (error) {
    console.error("Error saving test result:", error);
    throw error;
  }
}

export async function getUserTestResults(userId: string) {
  if (!checkFirebaseAdmin() || !adminFirestore) {
    throw new Error("Firebase Admin not initialized");
  }
  try {
    const resultsSnapshot = await adminFirestore
      .collection("testResults")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    return resultsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting test results:", error);
    throw error;
  }
}

export async function createCustomToken(uid: string) {
  if (!checkFirebaseAdmin() || !adminAuth) {
    throw new Error("Firebase Admin not initialized");
  }
  try {
    const customToken = await adminAuth.createCustomToken(uid);
    return customToken;
  } catch (error) {
    console.error("Error creating custom token:", error);
    throw error;
  }
}

