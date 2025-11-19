import admin from "firebase-admin";
import serviceAccount from "../omrarafa-c6a94-firebase-adminsdk-fbsvc-fea6ce64d2.json";

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      projectId: "omrarafa-c6a94",
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

export const adminAuth = admin.auth();
export const adminFirestore = admin.firestore();
export default admin;

