"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  UserPlus,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle,
  XCircle,
  Phone,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase-client";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

// دالة للانتظار حتى يكون auth.currentUser جاهز
const waitForAuth = (maxWait = 5000): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!auth) {
      reject(new Error("Firebase Auth غير مهيأ"));
      return;
    }
    
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }
    
    let unsubscribe: (() => void) | null = null;
    
    const timeout = setTimeout(() => {
      if (unsubscribe) unsubscribe();
      reject(new Error("انتهت مهلة انتظار تسجيل الدخول"));
    }, maxWait);
    
    unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        clearTimeout(timeout);
        if (unsubscribe) unsubscribe();
        resolve(user);
      }
    });
  });
};

// دالة للتحقق من اكتمال بيانات المستخدم
const checkUserDataCompleteness = (userData: any): { isComplete: boolean; missingFields: string[] } => {
  const requiredFields = {
    phone: userData?.phone,
    birthDate: userData?.birthDate,
  };
  
  const missingFields: string[] = [];
  
  // التحقق من الحقول الإلزامية
  if (!requiredFields.phone || requiredFields.phone.trim() === "") {
    missingFields.push("phone");
  }
  if (!requiredFields.birthDate || requiredFields.birthDate.trim() === "") {
    missingFields.push("birthDate");
  }
  
  return {
    isComplete: missingFields.length === 0,
    missingFields,
  };
};

// دالة للتحقق من وجود واكتمال بيانات المستخدم في Firestore
const checkFirestoreUserData = async (uid: string): Promise<{ exists: boolean; data: any; isComplete: boolean; missingFields: string[] }> => {
  if (!db) {
    throw new Error("Firestore غير مهيأ");
  }

  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return {
        exists: false,
        data: null,
        isComplete: false,
        missingFields: ["phone", "birthDate"],
      };
    }
    
    const userData = userDoc.data();
    const completeness = checkUserDataCompleteness(userData);
    
    return {
      exists: true,
      data: userData,
      isComplete: completeness.isComplete,
      missingFields: completeness.missingFields,
    };
  } catch (error: any) {
    console.error("Error checking Firestore user data:", error);
    throw error;
  }
};

// دالة لحفظ البيانات مع retry mechanism
const saveUserDataWithRetry = async (
  uid: string,
  userData: {
    name: string;
    email: string;
    photoURL?: string;
    phone: string;
    birthDate: string;
  },
  maxRetries = 3
): Promise<void> => {
  if (!db) {
    throw new Error("Firestore غير مهيأ");
  }

  const userRef = doc(db, "users", uid);
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        // تحديث البيانات الموجودة (الحفاظ على البيانات الأخرى)
        const existingData = userDoc.data();
        await updateDoc(userRef, {
          name: userData.name || existingData.name || "",
          email: userData.email || existingData.email || "",
          photoURL: userData.photoURL || existingData.photoURL || "",
          phone: userData.phone.trim(),
          birthDate: userData.birthDate.trim(),
          updatedAt: serverTimestamp(),
        });
      } else {
        // إنشاء مستخدم جديد
        await setDoc(userRef, {
          name: userData.name,
          email: userData.email,
          photoURL: userData.photoURL || "",
          phone: userData.phone.trim(),
          birthDate: userData.birthDate.trim(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      
      // نجح الحفظ
      return;
    } catch (error: any) {
      lastError = error;
      console.warn(`محاولة حفظ البيانات ${attempt}/${maxRetries} فشلت:`, error);
      
      // إذا كان الخطأ permission-denied، لا نحاول مرة أخرى
      if (error.code === "permission-denied") {
        throw new Error("ليس لديك صلاحية لحفظ البيانات. يرجى التحقق من إعدادات Firestore Security Rules");
      }
      
      // انتظر قليلاً قبل المحاولة التالية
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  
  // فشلت جميع المحاولات
  throw lastError || new Error("فشل حفظ البيانات بعد عدة محاولات");
};

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleForm, setShowGoogleForm] = useState(false);
  const [googleUserData, setGoogleUserData] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const { login } = useSession();
  const router = useRouter();

  // ملء الحقول عند فتح النموذج إذا كانت البيانات موجودة
  useEffect(() => {
    if (showGoogleForm && googleUserData) {
      if (googleUserData.phone) {
        setPhone(googleUserData.phone);
      }
      if (googleUserData.birthDate) {
        setBirthDate(googleUserData.birthDate);
      }
    }
  }, [showGoogleForm, googleUserData]);

  // حساب قوة كلمة المرور
  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return { strength: 0, label: "", color: "" };
    if (pwd.length < 6) return { strength: 1, label: "ضعيفة", color: "red" };
    if (pwd.length < 8) return { strength: 2, label: "متوسطة", color: "yellow" };
    if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) {
      return { strength: 3, label: "قوية", color: "green" };
    }
    return { strength: 2, label: "متوسطة", color: "yellow" };
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordsMismatch =
    password && confirmPassword && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      setIsLoading(false);
      return;
    }

    if (name && email && password) {
      if (!auth) {
        setError("Firebase غير مهيأ. يرجى إعادة تحميل الصفحة.");
        setIsLoading(false);
        return;
      }
      try {
        // استخدام Firebase Client SDK لإنشاء الحساب
        const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        
        // تحديث displayName في Firebase Auth
        await updateProfile(user, {
          displayName: name,
        });
        
        // حفظ بيانات المستخدم في Firestore مباشرة
        if (db) {
          try {
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, {
              name: name,
              email: email,
              photoURL: "",
              phone: "",
              birthDate: "",
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } catch (firestoreError) {
            console.warn("Error saving user to Firestore:", firestoreError);
            // لا نوقف العملية، فقط نعرض warning
          }
        }
        
        // محاولة استخدام API كـ fallback (اختياري)
        try {
          const idToken = await user.getIdToken();
          const response = await fetch("/api/auth/google", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              idToken,
              name,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            login({
              uid: data.uid,
              email: data.email || email,
              name: data.name || name,
              photoURL: data.photoURL || "",
              phone: data.phone || "",
              birthDate: data.birthDate || "",
            });
            router.push("/");
            return;
          }
        } catch (apiError) {
          console.warn("API call failed, using client-side data:", apiError);
        }
        
        // إذا فشل API، استخدم البيانات من Firebase Client
        login({
          uid: user.uid,
          email: user.email || email,
          name: name,
          photoURL: "",
          phone: "",
          birthDate: "",
        });
        router.push("/");
      } catch (err: any) {
        console.error("Register error:", err);
        let errorMessage = "حدث خطأ أثناء إنشاء الحساب";
        if (err.code === "auth/email-already-in-use") {
          errorMessage = "البريد الإلكتروني مستخدم بالفعل";
        } else if (err.code === "auth/invalid-email") {
          errorMessage = "البريد الإلكتروني غير صحيح";
        } else if (err.code === "auth/weak-password") {
          errorMessage = "كلمة المرور ضعيفة";
        } else if (err.message) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        setIsLoading(false);
      }
    } else {
      setError("يرجى ملء جميع الحقول");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);
    
    try {
      // التحقق من وجود auth و googleProvider
      if (!auth || !googleProvider) {
        throw new Error(
          "Firebase غير مهيأ بشكل صحيح. يرجى إضافة API keys في ملف .env.local. راجع README-GOOGLE-AUTH.md للتعليمات."
        );
      }

      if (!db) {
        throw new Error("Firestore غير مهيأ. يرجى إعادة تحميل الصفحة");
      }

      // المرحلة 1: تسجيل الدخول بـ Google
      const popupPromise = signInWithPopup(auth, googleProvider);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("TIMEOUT")), 30000);
      });

      const result = await Promise.race([popupPromise, timeoutPromise]) as any;
      const firebaseUser = result.user;
      const uid = firebaseUser.uid;

      // المرحلة 2: فحص Firestore مباشرة
      const firestoreCheck = await checkFirestoreUserData(uid);

      // المرحلة 3 & 5: إذا كانت البيانات كاملة → دخول مباشر
      if (firestoreCheck.isComplete && firestoreCheck.data) {
        const userData = firestoreCheck.data;
        login({
          uid: uid,
          email: userData.email || firebaseUser.email || "",
          name: userData.name || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "مستخدم",
          photoURL: userData.photoURL || firebaseUser.photoURL || undefined,
          phone: userData.phone || "",
          birthDate: userData.birthDate || "",
        });
        router.push("/");
        return;
      }

      // المرحلة 4: البيانات ناقصة أو document غير موجود → عرض النموذج
      const googleData = {
        uid: uid,
        email: firebaseUser.email || "",
        name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "مستخدم",
        photoURL: firebaseUser.photoURL || undefined,
        // استخدم البيانات الموجودة من Firestore إذا كانت موجودة، وإلا استخدم قيم فارغة
        phone: firestoreCheck.data?.phone || "",
        birthDate: firestoreCheck.data?.birthDate || "",
      };

      setGoogleUserData(googleData);
      setShowGoogleForm(true);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Google sign in error:", err);
      let errorMessage = "حدث خطأ أثناء تسجيل الدخول بـ Google";
      
      if (err.message === "TIMEOUT" || err.name === "AbortError") {
        errorMessage = "انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى أو التحقق من اتصال الإنترنت";
      } else if (err.code === "auth/api-key-not-valid") {
        errorMessage = "مفتاح API غير صحيح. يرجى إضافة API keys الصحيحة في ملف .env.local";
      } else if (err.code === "auth/popup-closed-by-user") {
        errorMessage = "تم إغلاق نافذة تسجيل الدخول";
      } else if (err.code === "auth/popup-blocked") {
        errorMessage = "تم حظر النافذة المنبثقة. يرجى السماح للنوافذ المنبثقة في إعدادات المتصفح";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "فشل الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleGoogleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // التحقق من أن الحقول الإلزامية مملوءة
    if (!phone || phone.trim() === "") {
      setError("يرجى إدخال رقم التليفون");
      return;
    }

    if (!birthDate || birthDate.trim() === "") {
      setError("يرجى إدخال تاريخ الميلاد");
      return;
    }

    setIsLoading(true);

    if (!googleUserData || !googleUserData.uid) {
      setError("حدث خطأ. يرجى المحاولة مرة أخرى.");
      setIsLoading(false);
      return;
    }

    try {
      // التحقق من أن Firestore مهيأ
      if (!db) {
        throw new Error("Firestore غير مهيأ. يرجى إعادة تحميل الصفحة");
      }

      // الانتظار حتى يكون auth.currentUser جاهز
      let firebaseUser;
      try {
        firebaseUser = await waitForAuth(5000);
      } catch (waitError) {
        console.warn("لم يتم العثور على auth.currentUser، استخدام googleUserData");
        firebaseUser = null;
      }

      const uid = firebaseUser?.uid || googleUserData.uid;
      
      // استخدام البيانات من Google/Firebase مع البيانات المدخلة
      const finalUserData = {
        name: firebaseUser?.displayName || googleUserData.name || "مستخدم",
        email: firebaseUser?.email || googleUserData.email || "",
        photoURL: firebaseUser?.photoURL || googleUserData.photoURL || "",
        phone: phone.trim(),
        birthDate: birthDate.trim(),
      };

      // المرحلة 6: حفظ البيانات في Firestore
      try {
        await saveUserDataWithRetry(uid, finalUserData, 3);
        console.log("✅ تم حفظ البيانات في Firestore بنجاح:", { uid, phone: finalUserData.phone, birthDate: finalUserData.birthDate });
        
        // التحقق من أن البيانات تم حفظها بالفعل
        if (db) {
          const userRef = doc(db, "users", uid);
          const verifyDoc = await getDoc(userRef);
          if (verifyDoc.exists()) {
            const savedData = verifyDoc.data();
            console.log("✅ تم التحقق من البيانات المحفوظة:", savedData);
          } else {
            console.error("❌ البيانات لم تُحفظ في Firestore!");
            throw new Error("فشل التحقق من حفظ البيانات");
          }
        }
      } catch (saveError: any) {
        // إذا فشل الحفظ، حاول استخدام API كـ fallback
        if (saveError.code === "permission-denied" || saveError.message?.includes("صلاحية")) {
          try {
            const response = await fetch(`/api/users/${uid}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                phone: phone.trim(),
                birthDate: birthDate.trim(),
              }),
            });
            
            if (!response.ok && response.status !== 503) {
              throw new Error("فشل حفظ البيانات عبر API");
            }
          } catch (apiError) {
            throw new Error("ليس لديك صلاحية لحفظ البيانات. يرجى التحقق من إعدادات Firestore Security Rules");
          }
        } else {
          throw saveError;
        }
      }

      // بعد نجاح الحفظ: تسجيل الدخول والدخول للتطبيق
      login({
        uid: uid,
        email: finalUserData.email,
        name: finalUserData.name,
        photoURL: finalUserData.photoURL || undefined,
        phone: finalUserData.phone,
        birthDate: finalUserData.birthDate,
      });
      
      router.push("/");
    } catch (err: any) {
      console.error("Error saving Google user data:", err);
      let errorMessage = "حدث خطأ أثناء حفظ البيانات";
      
      if (err.code === "permission-denied" || err.message?.includes("صلاحية")) {
        errorMessage = "ليس لديك صلاحية لحفظ البيانات. يرجى التحقق من إعدادات Firestore Security Rules";
      } else if (err.code === "unavailable") {
        errorMessage = "خدمة Firestore غير متاحة حالياً. يرجى المحاولة مرة أخرى";
      } else if (err.code === "unauthenticated") {
        errorMessage = "لم يتم تسجيل الدخول. يرجى المحاولة مرة أخرى";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 container-padding">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-6 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <UserPlus className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            إنشاء حساب جديد
          </h1>
          <motion.div
            className="w-24 h-1.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 mx-auto rounded-full mb-4"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          ></motion.div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            أنشئ حسابك للوصول إلى جميع الميزات
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          className="card p-8 md:p-10 shadow-xl"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center gap-2"
                >
                  <motion.div
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                  >
                    <XCircle className="w-5 h-5" />
                  </motion.div>
                  <span className="font-medium">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-5"
            >
              {/* Name Field */}
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300"
                >
                  الاسم الكامل
                </label>
                <div className="relative">
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pr-12 pl-4 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-DEFAULT focus:border-primary-DEFAULT bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>
              </motion.div>

              {/* Email Field */}
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300"
                >
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pr-12 pl-4 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-DEFAULT focus:border-primary-DEFAULT bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                    placeholder="example@email.com"
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300"
                >
                  كلمة المرور
                </label>
                <div className="relative">
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-12 pl-4 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-DEFAULT focus:border-primary-DEFAULT bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                    placeholder="6 أحرف على الأقل"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-primary-DEFAULT transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {/* Password Strength Indicator */}
                {password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${
                            passwordStrength.color === "red"
                              ? "bg-red-500"
                              : passwordStrength.color === "yellow"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(passwordStrength.strength / 3) * 100}%`,
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          passwordStrength.color === "red"
                            ? "text-red-500"
                            : passwordStrength.color === "yellow"
                            ? "text-yellow-500"
                            : "text-green-500"
                        }`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300"
                >
                  تأكيد كلمة المرور
                </label>
                <div className="relative">
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pr-12 pl-4 py-3.5 border-2 rounded-lg focus:ring-2 focus:ring-primary-DEFAULT bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 ${
                      passwordsMatch
                        ? "border-green-500 focus:border-green-500"
                        : passwordsMismatch
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 dark:border-gray-700 focus:border-primary-DEFAULT"
                    }`}
                    placeholder="أعد إدخال كلمة المرور"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-primary-DEFAULT transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                  {confirmPassword && (
                    <motion.div
                      className="absolute left-12 top-1/2 transform -translate-y-1/2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      {passwordsMatch ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : passwordsMismatch ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : null}
                    </motion.div>
                  )}
                </div>
                {passwordsMismatch && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500 mt-1 flex items-center gap-1"
                  >
                    <XCircle className="w-3 h-3" />
                    كلمات المرور غير متطابقة
                  </motion.p>
                )}
                {passwordsMatch && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-green-500 mt-1 flex items-center gap-1"
                  >
                    <CheckCircle className="w-3 h-3" />
                    كلمات المرور متطابقة
                  </motion.p>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading || passwordsMismatch || password.length < 6}
                className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                whileHover={{ scale: isLoading || passwordsMismatch || password.length < 6 ? 1 : 1.02 }}
                whileTap={{ scale: isLoading || passwordsMismatch || password.length < 6 ? 1 : 0.98 }}
                variants={itemVariants}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>جاري إنشاء الحساب...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>إنشاء الحساب</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Google Sign In Button */}
          <motion.div
            className="mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-3.5 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 font-semibold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md group relative overflow-hidden"
              whileHover={{ scale: isLoading ? 1 : 1.02, y: -2 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </motion.div>
              <span className="relative z-10">إنشاء حساب بـ Google</span>
            </motion.button>
          </motion.div>

          {/* Divider */}
          <motion.div
            className="my-6 flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">أو</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          </motion.div>

          {/* Login Link */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              لديك حساب بالفعل؟
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-primary-DEFAULT hover:text-primary-dark font-semibold group transition-colors"
            >
              <span>تسجيل الدخول</span>
              <motion.div
                whileHover={{ x: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Link
            href="/"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-DEFAULT transition-colors"
          >
            العودة إلى الصفحة الرئيسية
          </Link>
        </motion.div>
      </motion.div>

      {/* Google Form Modal */}
      <AnimatePresence>
        {showGoogleForm && googleUserData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              // منع إغلاق الـ modal عند الضغط على الخلفية
              e.stopPropagation();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                أكمل بياناتك
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                يرجى إدخال رقم التليفون وتاريخ الميلاد لإكمال التسجيل (إجباري)
              </p>

              <form onSubmit={handleGoogleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    رقم التليفون <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01146525436"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-DEFAULT focus:border-primary-DEFAULT bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    تاريخ الميلاد <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-DEFAULT focus:border-primary-DEFAULT bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !phone || !birthDate}
                  className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "جاري الحفظ..." : "حفظ والمتابعة"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
