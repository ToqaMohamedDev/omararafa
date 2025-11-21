"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, LogIn, Eye, EyeOff, Sparkles, ArrowRight, Phone, Calendar, GraduationCap } from "lucide-react";
import Link from "next/link";
import { signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase-client";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, query, orderBy, getDocs } from "firebase/firestore";

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

// دالة محسّنة للتحقق من اكتمال بيانات المستخدم
// تفحص: الاسم، الإيميل، رقم التليفون، تاريخ الميلاد، الصورة
const checkUserDataCompleteness = (userData: any): { isComplete: boolean; missingFields: string[] } => {
  const missingFields: string[] = [];
  
  // فحص الاسم
  if (!userData?.name || typeof userData.name !== 'string' || userData.name.trim() === "") {
    missingFields.push("name");
  }
  
  // فحص الإيميل
  if (!userData?.email || typeof userData.email !== 'string' || userData.email.trim() === "") {
    missingFields.push("email");
  }
  
  // فحص رقم التليفون
  if (!userData?.phone || typeof userData.phone !== 'string' || userData.phone.trim() === "") {
    missingFields.push("phone");
  }
  
  // فحص تاريخ الميلاد
  if (!userData?.birthDate || typeof userData.birthDate !== 'string' || userData.birthDate.trim() === "") {
    missingFields.push("birthDate");
  }
  
  // فحص المرحلة التعليمية (التحقق من ID أو name)
  if ((!userData?.educationalLevelId || typeof userData.educationalLevelId !== 'string' || userData.educationalLevelId.trim() === "") &&
      (!userData?.educationalLevel || typeof userData.educationalLevel !== 'string' || userData.educationalLevel.trim() === "")) {
    missingFields.push("educationalLevel");
  }
  
  // فحص الصورة (اختياري - لكن نتحقق منها)
  // الصورة ليست إلزامية، لكن نتحقق منها
  
  const isComplete = missingFields.length === 0;
  
  console.log("🔍 فحص اكتمال البيانات:", {
    name: userData?.name || "غير موجود",
    email: userData?.email || "غير موجود",
    phone: userData?.phone || "غير موجود",
    birthDate: userData?.birthDate || "غير موجود",
    educationalLevel: userData?.educationalLevel || "غير موجود",
    photoURL: userData?.photoURL || "غير موجود",
    isComplete,
    missingFields
  });
  
  return {
    isComplete,
    missingFields,
  };
};

// دالة محسّنة للتحقق من وجود واكتمال بيانات المستخدم في Firestore
const checkFirestoreUserData = async (uid: string): Promise<{ 
  exists: boolean; 
  data: any; 
  isComplete: boolean; 
  missingFields: string[] 
}> => {
  if (!db) {
    throw new Error("Firestore غير مهيأ");
  }
  try {
    console.log("🔍 فحص Firestore للمستخدم:", uid);
    
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.log("❌ المستخدم غير موجود في Firestore");
      return {
        exists: false,
        data: null,
        isComplete: false,
        missingFields: ["phone", "birthDate", "educationalLevel"],
      };
    }
    
    const userData = userDoc.data();
    console.log("✅ تم العثور على المستخدم:", {
      email: userData.email,
      phone: userData.phone,
      birthDate: userData.birthDate
    });
    
    const completeness = checkUserDataCompleteness(userData);
    
    return {
      exists: true,
      data: userData,
      isComplete: completeness.isComplete,
      missingFields: completeness.missingFields,
    };
  } catch (error: any) {
    console.error("❌ خطأ في فحص Firestore:", error);
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
    educationalLevelId: string;
    educationalLevel?: string; // name للمرحلة التعليمية (اختياري)
  },
  maxRetries = 3
): Promise<void> => {
  if (!db) {
    throw new Error("Firestore غير مهيأ");
  }

  // التحقق من أن المستخدم مسجل دخول
  // استخدام waitForAuth للحصول على auth.currentUser
  if (!auth) {
    throw new Error("Firebase Auth غير مهيأ");
  }

  // محاولة الانتظار للحصول على auth.currentUser باستخدام waitForAuth
  let currentUser = auth.currentUser;
  if (!currentUser) {
    try {
      // انتظر حتى يكون auth.currentUser جاهز (بحد أقصى 3 ثوان)
      currentUser = await waitForAuth(3000);
      if (currentUser) {
        console.log("✅ تم الحصول على auth.currentUser:", currentUser.uid);
      }
    } catch (waitError) {
      console.warn("⚠️ لم يتم الحصول على auth.currentUser في الوقت المحدد:", waitError);
      // إذا فشل waitForAuth، انتظر قليلاً ثم حاول مرة أخرى
      await new Promise(resolve => setTimeout(resolve, 1000));
      currentUser = auth.currentUser;
    }
  }

  // إذا لم يكن موجوداً بعد، استخدم UID مباشرة (المستخدم مسجل دخول بالفعل من Google)
  if (!currentUser) {
    console.warn("⚠️ auth.currentUser غير موجود، لكن المستخدم مسجل دخول - استخدام UID مباشرة");
    // نستمر في المحاولة - Firestore Security Rules ستحقق من auth token
    // لكن يجب أن نتحقق من أن المستخدم مسجل دخول بالفعل
    // إذا لم يكن مسجل دخول، Firestore Security Rules سترفض الطلب
  } else {
    // التأكد من أن UID يطابق المستخدم الحالي
    if (currentUser && currentUser.uid !== uid) {
      throw new Error(`UID غير متطابق: المتوقع ${uid}, الحالي ${currentUser.uid}`);
    }
    if (currentUser) {
      console.log("✅ UID متطابق:", uid);
    }
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
          educationalLevelId: userData.educationalLevelId.trim(),
          educationalLevel: userData.educationalLevel || existingData.educationalLevel || "",
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
          educationalLevelId: userData.educationalLevelId.trim(),
          educationalLevel: userData.educationalLevel || "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      
      // نجح الحفظ
      console.log(`✅ تم حفظ البيانات بنجاح (محاولة ${attempt}/${maxRetries})`);
      return;
    } catch (error: any) {
      lastError = error;
      console.warn(`محاولة حفظ البيانات ${attempt}/${maxRetries} فشلت:`, error);
      
      // إذا كان الخطأ permission-denied، لا نحاول مرة أخرى
      if (error.code === "permission-denied") {
        console.error("❌ خطأ في الصلاحيات:", {
          code: error.code,
          message: error.message,
          uid: uid,
          currentUser: auth.currentUser?.uid,
          isAuthenticated: !!auth.currentUser
        });
        throw new Error("ليس لديك صلاحية لحفظ البيانات. يرجى التحقق من إعدادات Firestore Security Rules في Firebase Console. راجع ملف FIRESTORE-SECURITY-RULES.md");
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

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleForm, setShowGoogleForm] = useState(false);
  const [googleUserData, setGoogleUserData] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [educationalLevelId, setEducationalLevelId] = useState("");
  const [educationalLevels, setEducationalLevels] = useState<Array<{ id: string; name: string }>>([]);
  const { login } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get("message");
    if (message === "complete_profile") {
      setError("يرجى إكمال بياناتك (رقم التليفون وتاريخ الميلاد والمرحلة التعليمية) قبل تسجيل الدخول");
    }
  }, [searchParams]);

  // جلب المراحل التعليمية من Firestore
  useEffect(() => {
    const loadEducationalLevels = async () => {
      if (!db) return;
      try {
        const educationalLevelsQuery = query(collection(db, "educationalLevels"), orderBy("name"));
        const educationalLevelsSnapshot = await getDocs(educationalLevelsQuery);
        const levels = educationalLevelsSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setEducationalLevels(levels);
      } catch (error) {
        console.error("Error fetching educational levels:", error);
      }
    };
    loadEducationalLevels();
  }, [db]);

  // ملء الحقول عند فتح النموذج إذا كانت البيانات موجودة
  useEffect(() => {
    if (showGoogleForm && googleUserData) {
      if (googleUserData.phone) {
        setPhone(googleUserData.phone);
      }
      if (googleUserData.birthDate) {
        setBirthDate(googleUserData.birthDate);
      }
      if (googleUserData.educationalLevelId) {
        setEducationalLevelId(googleUserData.educationalLevelId);
      }
    }
  }, [showGoogleForm, googleUserData]);

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
        const uid = user.uid;
        
        console.log("✅ Email/Password Sign-In نجح:", { uid, email: user.email });

        // فحص بيانات المستخدم من Firestore
        if (!db) {
          throw new Error("Firestore غير مهيأ. يرجى إعادة تحميل الصفحة");
        }

        console.log("🔍 فحص بيانات Firestore...");
        const firestoreCheck = await checkFirestoreUserData(uid);
        
        console.log("📊 نتيجة فحص Firestore:", {
          exists: firestoreCheck.exists,
          isComplete: firestoreCheck.isComplete,
          missingFields: firestoreCheck.missingFields,
          hasPhone: !!firestoreCheck.data?.phone,
          hasBirthDate: !!firestoreCheck.data?.birthDate
        });

        // إذا كانت البيانات كاملة → تسجيل الدخول مباشرة
        if (firestoreCheck.exists && firestoreCheck.isComplete && firestoreCheck.data) {
          console.log("✅ البيانات كاملة في Firestore - تسجيل الدخول");
          const userData = firestoreCheck.data;
          
          // التأكد من وجود جميع الحقول المطلوبة
          if (!userData.name || !userData.email || !userData.phone || !userData.birthDate || (!userData.educationalLevelId && !userData.educationalLevel)) {
            console.warn("⚠️ بيانات ناقصة رغم اجتياز الفحص");
            // اعتبرها بيانات ناقصة وأظهر النموذج
            throw new Error("INCOMPLETE_DATA");
          }
          
          // تسجيل الدخول
          login({
            uid: uid,
            email: userData.email || user.email || email,
            name: userData.name || user.displayName || email.split("@")[0],
            photoURL: userData.photoURL || user.photoURL || undefined,
            phone: userData.phone || "",
            birthDate: userData.birthDate || "",
            educationalLevelId: userData.educationalLevelId || "",
            educationalLevel: userData.educationalLevel || "",
          });
          
          setIsLoading(false);
          router.push("/");
          return;
        }

        // البيانات ناقصة أو document غير موجود → عرض النموذج
        console.log("⚠️ البيانات ناقصة أو غير موجودة - عرض النموذج");
        
        // جمع البيانات من Firebase Auth و Firestore
        const emailUserData = {
          uid: uid,
          name: firestoreCheck.data?.name || user.displayName || email.split("@")[0] || "مستخدم",
          email: firestoreCheck.data?.email || user.email || email,
          photoURL: firestoreCheck.data?.photoURL || user.photoURL || undefined,
          phone: firestoreCheck.data?.phone || "",
          birthDate: firestoreCheck.data?.birthDate || "",
        };
        
        console.log("📝 بيانات للنموذج:", {
          uid: emailUserData.uid,
          name: emailUserData.name,
          email: emailUserData.email,
          hasPhone: !!emailUserData.phone,
          hasBirthDate: !!emailUserData.birthDate,
          missingFields: firestoreCheck.missingFields
        });

        setGoogleUserData(emailUserData);
        setShowGoogleForm(true);
        setIsLoading(false);
        
      } catch (err: any) {
        // حالة خاصة: بيانات ناقصة
        if (err.message === "INCOMPLETE_DATA") {
          // أعد المحاولة باعتبارها بيانات ناقصة
          if (db && auth?.currentUser) {
            const uid = auth.currentUser.uid;
            const firestoreCheck = await checkFirestoreUserData(uid);
            const emailUserData = {
              uid: uid,
              name: firestoreCheck.data?.name || auth.currentUser.displayName || email.split("@")[0] || "مستخدم",
              email: firestoreCheck.data?.email || auth.currentUser.email || email,
              photoURL: firestoreCheck.data?.photoURL || auth.currentUser.photoURL || undefined,
              phone: firestoreCheck.data?.phone || "",
              birthDate: firestoreCheck.data?.birthDate || "",
            };
            setGoogleUserData(emailUserData);
            setShowGoogleForm(true);
            setIsLoading(false);
            return;
          }
        }
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

      if (!db) {
        throw new Error("Firestore غير مهيأ. يرجى إعادة تحميل الصفحة");
      }

      console.log("🔄 بدء Google Sign-In");

      // المرحلة 1: تسجيل الدخول بـ Google
      const popupPromise = signInWithPopup(auth, googleProvider);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("TIMEOUT")), 30000);
      });

      const result = await Promise.race([popupPromise, timeoutPromise]) as any;
      const firebaseUser = result.user;
      const uid = firebaseUser.uid;
      
      console.log("✅ Google Sign-In نجح:", { uid, email: firebaseUser.email });

      // المرحلة 2: فحص Firestore مباشرة
      console.log("🔍 فحص بيانات Firestore...");
      const firestoreCheck = await checkFirestoreUserData(uid);
      
      console.log("📊 نتيجة فحص Firestore:", {
        exists: firestoreCheck.exists,
        isComplete: firestoreCheck.isComplete,
        missingFields: firestoreCheck.missingFields,
        hasPhone: !!firestoreCheck.data?.phone,
        hasBirthDate: !!firestoreCheck.data?.birthDate
      });

      // المرحلة 3 & 5: إذا كانت البيانات كاملة → حفظ في Firestore ثم دخول
      if (firestoreCheck.exists && firestoreCheck.isComplete && firestoreCheck.data) {
        console.log("✅ البيانات كاملة في Firestore - حفظ/تحديث ثم دخول");
        const userData = firestoreCheck.data;
        
        // التأكد من وجود جميع الحقول المطلوبة
        if (!userData.name || !userData.email || !userData.phone || !userData.birthDate || (!userData.educationalLevelId && !userData.educationalLevel)) {
          console.warn("⚠️ بيانات ناقصة رغم اجتياز الفحص:", {
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            birthDate: userData.birthDate,
            educationalLevelId: userData.educationalLevelId,
            educationalLevel: userData.educationalLevel
          });
          // اعتبرها بيانات ناقصة وأظهر النموذج
          throw new Error("INCOMPLETE_DATA");
        }
        
        // حفظ/تحديث البيانات في Firestore (بعد auth)
        // استخدام البيانات من Firestore مع تحديث من Google إذا لزم الأمر
        const finalUserData = {
          name: userData.name || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "مستخدم",
          email: userData.email || firebaseUser.email || "",
          photoURL: userData.photoURL || firebaseUser.photoURL || "",
          phone: userData.phone || "",
          birthDate: userData.birthDate || "",
          educationalLevelId: userData.educationalLevelId || "",
          educationalLevel: userData.educationalLevel || "",
        };
        
        // حفظ/تحديث في Firestore
        try {
          await saveUserDataWithRetry(uid, finalUserData, 3);
          console.log("✅ تم حفظ/تحديث البيانات في Firestore");
        } catch (saveError) {
          console.warn("⚠️ تحذير: فشل حفظ البيانات في Firestore، لكن سنكمل الدخول:", saveError);
        }
        
        // تسجيل الدخول
        login({
          uid: uid,
          email: finalUserData.email,
          name: finalUserData.name,
          photoURL: finalUserData.photoURL || undefined,
          phone: finalUserData.phone,
          birthDate: finalUserData.birthDate,
          educationalLevelId: finalUserData.educationalLevelId,
          educationalLevel: finalUserData.educationalLevel,
        });
        
        setIsLoading(false);
        router.push("/");
        return;
      }

      // المرحلة 4: البيانات ناقصة أو document غير موجود → عرض النموذج
      console.log("⚠️ البيانات ناقصة أو غير موجودة - عرض النموذج");
      
      // جمع البيانات من Google و Firestore
      const googleData = {
        uid: uid,
        // استخدم البيانات من Firestore إذا كانت موجودة، وإلا استخدم من Google
        name: firestoreCheck.data?.name || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "مستخدم",
        email: firestoreCheck.data?.email || firebaseUser.email || "",
        photoURL: firestoreCheck.data?.photoURL || firebaseUser.photoURL || undefined,
        phone: firestoreCheck.data?.phone || "",
        birthDate: firestoreCheck.data?.birthDate || "",
        educationalLevelId: firestoreCheck.data?.educationalLevelId || "",
        educationalLevel: firestoreCheck.data?.educationalLevel || "",
      };
      
      console.log("📝 بيانات للنموذج (من Google + Firestore):", {
        uid: googleData.uid,
        name: googleData.name,
        email: googleData.email,
        hasPhoto: !!googleData.photoURL,
        hasPhone: !!googleData.phone,
        hasBirthDate: !!googleData.birthDate,
        missingFields: firestoreCheck.missingFields
      });

      setGoogleUserData(googleData);
      setShowGoogleForm(true);
      setIsLoading(false);
      
    } catch (err: any) {
      console.error("❌ Google sign in error:", err);
      
      // حالة خاصة: بيانات ناقصة
      if (err.message === "INCOMPLETE_DATA") {
        // أعد المحاولة باعتبارها بيانات ناقصة
        setShowGoogleForm(true);
        setIsLoading(false);
        return;
      }
      
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

    if (!educationalLevelId || educationalLevelId.trim() === "") {
      setError("يرجى اختيار المرحلة التعليمية");
      return;
    }

    // الحصول على name المرحلة التعليمية من القائمة
    const selectedLevel = educationalLevels.find(level => level.id === educationalLevelId);
    if (!selectedLevel) {
      setError("المرحلة التعليمية المختارة غير صحيحة");
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
        educationalLevelId: educationalLevelId.trim(),
        educationalLevel: selectedLevel.name,
      };

      console.log("🔄 محاولة حفظ البيانات:", { uid, phone: finalUserData.phone, birthDate: finalUserData.birthDate });

      // المرحلة 6: حفظ البيانات في Firestore
      try {
        await saveUserDataWithRetry(uid, finalUserData, 3);
        console.log("✅ تم حفظ البيانات في Firestore بنجاح");
        
        // التحقق من أن البيانات تم حفظها بالفعل
        const userRef = doc(db, "users", uid);
        const verifyDoc = await getDoc(userRef);
        
        if (!verifyDoc.exists()) {
          throw new Error("فشل التحقق من حفظ البيانات");
        }
        
        const savedData = verifyDoc.data();
        console.log("✅ تم التحقق من البيانات المحفوظة:", {
          phone: savedData.phone,
          birthDate: savedData.birthDate
        });
        
        // التأكد من أن البيانات المحفوظة هي نفس البيانات المدخلة
        if (savedData.phone !== finalUserData.phone || savedData.birthDate !== finalUserData.birthDate) {
          throw new Error("البيانات المحفوظة لا تطابق البيانات المدخلة");
        }
        
      } catch (saveError: any) {
        console.error("❌ خطأ في حفظ البيانات:", saveError);
        
        // إذا فشل الحفظ، حاول استخدام API كـ fallback (فقط في production أو إذا كان الخطأ permission-denied)
        if (saveError.code === "permission-denied" || saveError.message?.includes("صلاحية")) {
          // في development، تخطي محاولة API لتجنب 503 errors
          const isDevelopment = process.env.NODE_ENV === "development";
          
          if (isDevelopment) {
            console.warn("⚠️ في development: تخطي محاولة API - تأكد من Firestore Security Rules");
            throw new Error("ليس لديك صلاحية لحفظ البيانات. يرجى التحقق من إعدادات Firestore Security Rules");
          }
          
          // لا نستخدم API routes - تم إزالة Firebase Admin SDK
          // فقط نعرض رسالة خطأ للمستخدم
          console.warn("⚠️ فشل حفظ البيانات في Firestore");
          throw new Error("ليس لديك صلاحية لحفظ البيانات. يرجى التحقق من إعدادات Firestore Security Rules");
        } else {
          throw saveError;
        }
      }

      // ✅ نجح الحفظ - الآن قم بتسجيل الدخول وإغلاق Modal
      console.log("✅ تسجيل الدخول وإغلاق Modal");
      
      // تحديث Session
      login({
        uid: uid,
        email: finalUserData.email,
        name: finalUserData.name,
        photoURL: finalUserData.photoURL || undefined,
        phone: finalUserData.phone,
        birthDate: finalUserData.birthDate,
        educationalLevelId: finalUserData.educationalLevelId,
        educationalLevel: finalUserData.educationalLevel,
      });
      
      // إغلاق Modal
      setShowGoogleForm(false);
      setIsLoading(false);
      
      // الانتظار قليلاً قبل الانتقال لضمان تحديث الـ state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // الانتقال للصفحة الرئيسية
      router.push("/");
      
    } catch (err: any) {
      console.error("❌ Error saving Google user data:", err);
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
      // لا تغلق Modal عند حدوث خطأ
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
              e.stopPropagation();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card p-8 max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* زر الإغلاق */}
              <button
                type="button"
                onClick={() => {
                  // إغلاق Modal والعودة لشاشة تسجيل الدخول
                  setShowGoogleForm(false);
                  setGoogleUserData(null);
                  setPhone("");
                  setBirthDate("");
                  setEducationalLevelId("");
                  setError("");
                  setIsLoading(false);
                  // تسجيل خروج المستخدم من Google
                  if (auth) {
                    signOut(auth);
                  }
                }}
                className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                أكمل بياناتك
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                يرجى إدخال رقم التليفون وتاريخ الميلاد والمرحلة التعليمية لإكمال التسجيل (إجباري)
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

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    المرحلة التعليمية <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={educationalLevelId}
                    onChange={(e) => setEducationalLevelId(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-DEFAULT focus:border-primary-DEFAULT bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">اختر المرحلة التعليمية</option>
                    {educationalLevels.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                  {educationalLevels.length === 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      جاري تحميل المراحل التعليمية...
                    </p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !phone || !birthDate || !educationalLevelId}
                  className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    "حفظ والمتابعة"
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-DEFAULT"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
