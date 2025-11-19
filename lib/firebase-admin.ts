import * as firebaseAdmin from "firebase-admin";
const admin = firebaseAdmin as any;

let isInitialized = false;

if (!admin.apps || admin.apps.length === 0) {
  try {
    // استخدام متغيرات البيئة بدلاً من ملف JSON
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID || "omrarafa-c6a94",
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        };

    // التحقق من وجود private_key قبل التهيئة
    if (!serviceAccount.private_key) {
      // في بيئة التطوير المحلية، هذا طبيعي (متغيرات البيئة غير موجودة)
      if (process.env.NODE_ENV === "production") {
        console.warn("Firebase Admin: private_key missing. Admin features will not work.");
      }
    } else {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as any),
        projectId: process.env.FIREBASE_PROJECT_ID || "omrarafa-c6a94",
      });
      isInitialized = true;
    }
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    isInitialized = false;
  }
} else {
  isInitialized = true;
}

// تصدير القيم فقط إذا تم التهيئة بنجاح
export const adminAuth = isInitialized && admin.auth ? admin.auth() : null;
export const adminFirestore = isInitialized && admin.firestore ? admin.firestore() : null;
export const FieldValue = isInitialized && admin.firestore ? admin.firestore.FieldValue : null;

// دالة للتحقق من تهيئة Firebase Admin (ترجع boolean بدلاً من رمي خطأ)
export function checkFirebaseAdmin(): boolean {
  return isInitialized && adminAuth !== null && adminFirestore !== null;
}

export default admin;

