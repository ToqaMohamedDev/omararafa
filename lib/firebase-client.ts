import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// التحقق من وجود API keys
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

if (typeof window !== "undefined" && (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId)) {
  console.warn(
    "⚠️ Firebase API keys missing! Please add them to .env.local file.\n" +
    "See README-GOOGLE-AUTH.md for instructions."
  );
}

const firebaseConfig = {
  apiKey: apiKey || "",
  authDomain: authDomain || "omrarafa-c6a94.firebaseapp.com",
  projectId: projectId || "omrarafa-c6a94",
  storageBucket: storageBucket || "omrarafa-c6a94.firebasestorage.app",
  messagingSenderId: messagingSenderId || "",
  appId: appId || "",
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (typeof window !== "undefined") {
  try {
    if (!getApps().length) {
      if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
        throw new Error("Firebase API keys are missing. Please check .env.local file.");
      }
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    // إعداد persistence لضمان حفظ حالة المصادقة
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error("Error setting auth persistence:", error);
    });
    // إعداد timeout للـ auth
    auth.settings.appVerificationDisabledForTesting = false;
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    // إزالة setCustomParameters التي قد تسبب مشاكل
    // googleProvider.setCustomParameters({
    //   prompt: "select_account",
    // });
    // إضافة scopes إضافية (email و profile مضمنان افتراضياً، لكن نضيفهم للتأكيد)
    googleProvider.addScope("email");
    googleProvider.addScope("profile");
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

export { app, auth, db, googleProvider };
