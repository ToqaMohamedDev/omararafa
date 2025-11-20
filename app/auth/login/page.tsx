"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, LogIn, Eye, EyeOff, Sparkles, ArrowRight, Phone, Calendar } from "lucide-react";
import Link from "next/link";
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase-client";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleForm, setShowGoogleForm] = useState(false);
  const [googleUserData, setGoogleUserData] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const { login } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get("message");
    if (message === "complete_profile") {
      setError("يرجى إكمال بياناتك (رقم التليفون وتاريخ الميلاد) قبل تسجيل الدخول");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (email && password) {
      if (!auth) {
        setError("Firebase غير مهيأ. يرجى إعادة تحميل الصفحة.");
        setIsLoading(false);
        return;
      }
      try {
        // استخدام Firebase Client SDK لتسجيل الدخول
        const { signInWithEmailAndPassword } = await import("firebase/auth");
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;
        
        // الحصول على ID token
        const idToken = await user.getIdToken();
        
        // التحقق من الـ token والحصول على بيانات المستخدم
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken }),
        });

        if (response.ok) {
          const data = await response.json();
          login({
            uid: data.uid,
            email: data.email || email,
            name: data.name || email.split("@")[0],
          });
          router.push("/");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || "حدث خطأ أثناء تسجيل الدخول");
        }
      } catch (err: any) {
        console.error("Login error:", err);
        let errorMessage = "حدث خطأ أثناء تسجيل الدخول";
        if (err.code === "auth/user-not-found") {
          errorMessage = "المستخدم غير موجود";
        } else if (err.code === "auth/wrong-password") {
          errorMessage = "كلمة المرور غير صحيحة";
        } else if (err.code === "auth/invalid-email") {
          errorMessage = "البريد الإلكتروني غير صحيح";
        } else if (err.message) {
          errorMessage = err.message;
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    } else {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
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

      // محاولة استخدام popup مع timeout
      if (!auth || !googleProvider) {
        setError("Firebase غير مهيأ. يرجى إعادة تحميل الصفحة.");
        setIsLoading(false);
        return;
      }
      const popupPromise = signInWithPopup(auth, googleProvider);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("TIMEOUT")), 30000); // 30 ثانية timeout
      });

      const result = await Promise.race([popupPromise, timeoutPromise]) as any;
      const user = result.user;
      
      // الحصول على ID token مع timeout
      const tokenPromise = user.getIdToken();
      const tokenTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("TOKEN_TIMEOUT")), 10000); // 10 ثواني timeout
      });

      const idToken = await Promise.race([tokenPromise, tokenTimeoutPromise]) as string;
      
      // إرسال الـ token إلى API مع timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 ثانية timeout

      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        // إذا كان هناك phone و birthDate محفوظين، سجل دخول مباشرة
        if (data.phone && data.birthDate) {
          login({
            uid: data.uid,
            email: data.email || "",
            name: data.name || "مستخدم",
            photoURL: data.photoURL || undefined,
            phone: data.phone || "",
            birthDate: data.birthDate || "",
          });
          router.push("/");
        } else {
          // إذا لم يكن هناك phone و birthDate، اعرض النموذج
          setGoogleUserData({
            uid: data.uid,
            email: data.email || "",
            name: data.name || "مستخدم",
            photoURL: data.photoURL || undefined,
            phone: data.phone || "",
            birthDate: data.birthDate || "",
          });
          setShowGoogleForm(true);
          setIsLoading(false);
        }
      } else {
        // معالجة 503 بشكل خاص
        if (response.status === 503) {
          // في development، Firebase Admin قد لا يكون مهيأ
          // لكن المستخدم مسجل دخول في Firebase Client، لذا نستخدم بياناته
          const firebaseUser = result.user;
          // حفظ البيانات في Firestore مباشرة
          if (db) {
            try {
              const userRef = doc(db, "users", firebaseUser.uid);
              const userDoc = await getDoc(userRef);
              
              if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.phone && userData.birthDate) {
                  login({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || "",
                    name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "مستخدم",
                    photoURL: firebaseUser.photoURL || undefined,
                    phone: userData.phone || "",
                    birthDate: userData.birthDate || "",
                  });
                  router.push("/");
                  return;
                }
              }
              
              // إذا لم تكن هناك بيانات، اعرض النموذج
              setGoogleUserData({
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "مستخدم",
                photoURL: firebaseUser.photoURL || undefined,
                phone: "",
                birthDate: "",
              });
              setShowGoogleForm(true);
              setIsLoading(false);
              return;
            } catch (firestoreError) {
              console.warn("Error checking Firestore:", firestoreError);
            }
          }
          
          // Fallback: اعرض النموذج
          setGoogleUserData({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "مستخدم",
            photoURL: firebaseUser.photoURL || undefined,
            phone: "",
            birthDate: "",
          });
          setShowGoogleForm(true);
          setIsLoading(false);
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || "حدث خطأ أثناء تسجيل الدخول بـ Google");
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);
      let errorMessage = "حدث خطأ أثناء تسجيل الدخول بـ Google";
      
      if (err.message === "TIMEOUT" || err.name === "AbortError") {
        errorMessage = "انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى أو التحقق من اتصال الإنترنت";
      } else if (err.message === "TOKEN_TIMEOUT") {
        errorMessage = "انتهت مهلة الحصول على رمز التحقق. يرجى المحاولة مرة أخرى";
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // التحقق من أن الحقول مملوءة
    if (!phone || !birthDate) {
      setError("يرجى إدخال رقم التليفون وتاريخ الميلاد");
      return;
    }

    setIsLoading(true);

    if (!googleUserData) {
      setError("حدث خطأ. يرجى المحاولة مرة أخرى.");
      setIsLoading(false);
      return;
    }

    try {
      // حفظ البيانات في Firestore
      if (db) {
        const userRef = doc(db, "users", googleUserData.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          await setDoc(userRef, {
            ...userDoc.data(),
            phone: phone || "",
            birthDate: birthDate || "",
            updatedAt: serverTimestamp(),
          }, { merge: true });
        } else {
          await setDoc(userRef, {
            name: googleUserData.name,
            email: googleUserData.email,
            photoURL: googleUserData.photoURL || "",
            phone: phone || "",
            birthDate: birthDate || "",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      }

      // تسجيل الدخول
      login({
        uid: googleUserData.uid,
        email: googleUserData.email || "",
        name: googleUserData.name || "مستخدم",
        photoURL: googleUserData.photoURL || undefined,
        phone: phone || "",
        birthDate: birthDate || "",
      });
      
      router.push("/");
    } catch (err: any) {
      console.error("Error saving Google user data:", err);
      setError("حدث خطأ أثناء حفظ البيانات");
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            تسجيل الدخول
          </h1>
          <motion.div
            className="w-24 h-1.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 mx-auto rounded-full mb-4"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          ></motion.div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            سجل دخولك للوصول إلى الاختبارات والمحتوى الخاص
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
          <form onSubmit={handleSubmit} className="space-y-6">
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
                    <Lock className="w-5 h-5" />
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
                    placeholder="أدخل كلمة المرور"
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
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                variants={itemVariants}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>جاري تسجيل الدخول...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>تسجيل الدخول</span>
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
              <span className="relative z-10">تسجيل الدخول بـ Google</span>
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

          {/* Register Link */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              ليس لديك حساب؟
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 text-primary-DEFAULT hover:text-primary-dark font-semibold group transition-colors"
            >
              <span>إنشاء حساب جديد</span>
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
