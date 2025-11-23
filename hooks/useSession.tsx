"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, User as FirebaseUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase-client";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { usePathname } from "next/navigation";

interface User {
  uid?: string;
  name: string;
  email: string;
  photoURL?: string;
  phone?: string;
  birthDate?: string;
  educationalLevelId?: string;
  educationalLevel?: string;
  level?: string;
  levelScore?: number;
  averageScore?: number;
  completedTests?: number;
}

interface SessionContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// دالة مساعدة للتحقق من المستخدم
const verifyUser = async (firebaseUser: FirebaseUser): Promise<User | null> => {
  try {
    // استخدام Firestore مباشرة بدون استدعاء API routes
    // لأن Firebase Admin SDK تم إزالته
    if (db) {
      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          return {
            uid: firebaseUser.uid,
            email: userData.email || firebaseUser.email || "",
            name: userData.name || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "مستخدم",
            photoURL: userData.photoURL || firebaseUser.photoURL || undefined,
            phone: userData.phone || "",
            birthDate: userData.birthDate || "",
            educationalLevelId: userData.educationalLevelId || "",
            educationalLevel: userData.educationalLevel || "",
            level: userData.level || "مبتدئ",
            levelScore: userData.levelScore || 0,
            averageScore: userData.averageScore || 0,
            completedTests: userData.completedTests || 0,
          };
        }
      } catch (firestoreError) {
        console.warn("Error fetching user from Firestore:", firestoreError);
      }
    }
    
    // إذا لم توجد بيانات في Firestore، نعيد بيانات Firebase Client
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "مستخدم",
      photoURL: firebaseUser.photoURL || undefined,
      phone: "",
      birthDate: "",
      educationalLevelId: "",
      educationalLevel: "",
      level: "مبتدئ",
      levelScore: 0,
      averageScore: 0,
      completedTests: 0,
    };
  } catch (error) {
    console.error("Error verifying user:", error);
    // في حالة الخطأ، نعيد بيانات المستخدم من Firebase Client
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "مستخدم",
      photoURL: firebaseUser.photoURL || undefined,
      phone: "",
      birthDate: "",
      educationalLevelId: "",
      educationalLevel: "",
      level: "مبتدئ",
      levelScore: 0,
      averageScore: 0,
      completedTests: 0,
    };
  }
};

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const authStateChecked = useRef(false);
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let isMounted = true;

    // تحميل أولي من localStorage لإظهار حالة سريعة (لكن لا نوقف loading)
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // التحقق من وجود phone و birthDate و educationalLevel في localStorage أيضاً
        if (isMounted && parsedUser && parsedUser.email && parsedUser.phone && parsedUser.birthDate && (parsedUser.educationalLevelId || parsedUser.educationalLevel)) {
          setUser(parsedUser);
          // لا نوقف loading هنا - ننتظر Firebase
        } else if (isMounted && parsedUser && parsedUser.email) {
          // إذا كانت البيانات غير مكتملة، احذف من localStorage
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Error loading user from storage:", error);
        localStorage.removeItem("user");
      }
    }

    // التحقق من Firebase Auth
    if (!auth) {
      console.warn("Firebase Auth not initialized");
      if (isMounted) {
        // إذا لم يكن هناك auth، استخدم localStorage فقط
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
              // التحقق من وجود phone و birthDate و educationalLevel
              if (parsedUser && parsedUser.email && parsedUser.phone && parsedUser.birthDate && (parsedUser.educationalLevelId || parsedUser.educationalLevel)) {
                setUser(parsedUser);
              } else {
                // إذا كانت البيانات غير مكتملة، احذف من localStorage
                localStorage.removeItem("user");
                setUser(null);
              }
          } catch (e) {
            setUser(null);
            localStorage.removeItem("user");
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
      return;
    }

    // الاستماع لتغييرات Firebase Auth - هذا هو المصدر الوحيد للحقيقة
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (!isMounted) return;

        authStateChecked.current = true;

        if (firebaseUser) {
          try {
            const userData = await verifyUser(firebaseUser);
            if (userData && isMounted) {
              // التحقق من وجود phone و birthDate و educationalLevel
              if (!userData.phone || !userData.birthDate || (!userData.educationalLevelId && !userData.educationalLevel)) {
                // إذا لم تكن البيانات موجودة، تحقق من الصفحة الحالية
                if (typeof window !== "undefined") {
                  // استخدام عدة طرق للتحقق من الصفحة الحالية
                  const currentPath = window.location.pathname || window.location.href || pathname || "";
                  const isAuthPage = currentPath.includes("/auth/login") || 
                                    currentPath.includes("/auth/register") ||
                                    currentPath.includes("/auth/");
                  
                  // إذا كان المستخدم في صفحة auth (login/register)، لا تسجل خروجه
                  // دع المستخدم يكمل بياناته
                  if (isAuthPage) {
                    console.log("⚠️ بيانات ناقصة - المستخدم في صفحة auth، لا تسجيل خروج", {
                      path: currentPath,
                      hasPhone: !!userData.phone,
                      hasBirthDate: !!userData.birthDate,
                      hasEducationalLevelId: !!userData.educationalLevelId,
                      hasEducationalLevel: !!userData.educationalLevel,
                      firebaseUser: firebaseUser?.uid,
                      authCurrentUser: auth?.currentUser?.uid
                    });
                    // لا تسجل خروج - دع المستخدم يكمل بياناته
                    // نحافظ على firebaseUser موجوداً (لا نسجل خروج)
                    // لا نضع setUser(null) هنا - نترك firebaseUser موجوداً
                    // فقط نحذف من localStorage
                    localStorage.removeItem("user");
                    // لا نعود هنا - نترك firebaseUser موجوداً حتى يتمكن من حفظ البيانات
                    return;
                  }
                  
                  // إذا كان المستخدم في صفحة أخرى، سجل خروجه وأعد التوجيه
                  console.log("User data incomplete - logging out", {
                    path: currentPath,
                    hasPhone: !!userData.phone,
                    hasBirthDate: !!userData.birthDate,
                    hasEducationalLevelId: !!userData.educationalLevelId,
                    hasEducationalLevel: !!userData.educationalLevel
                  });
                  if (auth) {
                    await firebaseSignOut(auth);
                  }
                  setUser(null);
                  localStorage.removeItem("user");
                  window.location.href = "/auth/login?message=complete_profile";
                } else {
                  // في SSR، فقط احذف البيانات
                  setUser(null);
                  localStorage.removeItem("user");
                }
                return;
              }
              
              setUser(userData);
              localStorage.setItem("user", JSON.stringify(userData));
              
              // حفظ/تحديث البيانات في Firestore مباشرة (fallback إذا كان Admin غير متاح)
              if (db && userData.uid) {
                try {
                  const userRef = doc(db, "users", userData.uid);
                  const userDoc = await getDoc(userRef);
                  
                  if (!userDoc.exists()) {
                    // إنشاء مستخدم جديد
                    await setDoc(userRef, {
                      name: userData.name,
                      email: userData.email,
                      photoURL: userData.photoURL || "",
                      phone: userData.phone || "",
                      birthDate: userData.birthDate || "",
                      educationalLevelId: userData.educationalLevelId || "",
                      educationalLevel: userData.educationalLevel || "",
                      createdAt: serverTimestamp(),
                      updatedAt: serverTimestamp(),
                    });
                  } else {
                    // تحديث بيانات المستخدم (الحفاظ على phone و birthDate إذا كانت موجودة)
                    const existingData = userDoc.data();
                    await updateDoc(userRef, {
                      name: userData.name,
                      email: userData.email,
                      photoURL: userData.photoURL || existingData?.photoURL || "",
                      phone: existingData?.phone || userData.phone || "",
                      birthDate: existingData?.birthDate || userData.birthDate || "",
                      educationalLevelId: existingData?.educationalLevelId || userData.educationalLevelId || "",
                      educationalLevel: existingData?.educationalLevel || userData.educationalLevel || "",
                      updatedAt: serverTimestamp(),
                    });
                  }
                } catch (firestoreError) {
                  console.warn("Error saving user to Firestore (client-side):", firestoreError);
                  // لا نوقف العملية، فقط نعرض warning
                }
              }
            } else if (isMounted) {
              // إذا فشل التحقق، احذف من localStorage
              setUser(null);
              localStorage.removeItem("user");
            }
          } catch (error) {
            console.error("Error in auth state change:", error);
            // في حالة الخطأ، احتفظ بالبيانات من localStorage إذا كانت موجودة ومكتملة
            const savedUser = localStorage.getItem("user");
            if (savedUser && isMounted) {
              try {
                const parsedUser = JSON.parse(savedUser);
                // التحقق من وجود phone و birthDate
                if (parsedUser && parsedUser.email && parsedUser.phone && parsedUser.birthDate) {
                  setUser(parsedUser);
                } else {
                  setUser(null);
                  localStorage.removeItem("user");
                }
              } catch (e) {
                setUser(null);
                localStorage.removeItem("user");
              }
            } else {
              setUser(null);
            }
          }
        } else {
          // لا يوجد مستخدم في Firebase
          if (isMounted) {
            setUser(null);
            localStorage.removeItem("user");
          }
        }

        if (isMounted) {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Auth state change error:", error);
        if (isMounted) {
          authStateChecked.current = true;
          // في حالة الخطأ، استخدم localStorage كـ fallback (فقط إذا كانت البيانات مكتملة)
          const savedUser = localStorage.getItem("user");
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser);
              // التحقق من وجود phone و birthDate و educationalLevel
              if (parsedUser && parsedUser.email && parsedUser.phone && parsedUser.birthDate && (parsedUser.educationalLevelId || parsedUser.educationalLevel)) {
                setUser(parsedUser);
              } else {
                setUser(null);
                localStorage.removeItem("user");
              }
            } catch (e) {
              setUser(null);
              localStorage.removeItem("user");
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      }
    );

    unsubscribeRef.current = unsubscribe;

    // Timeout للتأكد من إيقاف loading حتى لو لم يتم استدعاء onAuthStateChanged
    const timeout = setTimeout(() => {
      if (isMounted && !authStateChecked.current) {
        console.warn("Auth state change timeout - using localStorage");
        authStateChecked.current = true;
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            // التحقق من وجود phone و birthDate و educationalLevel
            if (parsedUser && parsedUser.email && parsedUser.phone && parsedUser.birthDate && (parsedUser.educationalLevelId || parsedUser.educationalLevel)) {
              setUser(parsedUser);
            } else {
              setUser(null);
              localStorage.removeItem("user");
            }
          } catch (e) {
            setUser(null);
            localStorage.removeItem("user");
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    }, 2000); // 2 ثواني فقط

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      authStateChecked.current = false;
    };
  }, []);

  const login = async (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    
    // حفظ في Firebase إذا كان هناك uid
    // استخدام Firestore مباشرة بدون استدعاء API routes
    if (userData.uid && db) {
      try {
        const userRef = doc(db, "users", userData.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          await setDoc(userRef, {
            name: userData.name,
            email: userData.email,
            photoURL: userData.photoURL || "",
            phone: userData.phone || "",
            birthDate: userData.birthDate || "",
            educationalLevelId: userData.educationalLevelId || "",
            educationalLevel: userData.educationalLevel || "",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          const existingData = userDoc.data();
          await updateDoc(userRef, {
            name: userData.name || existingData?.name || "",
            email: userData.email || existingData?.email || "",
            photoURL: userData.photoURL || existingData?.photoURL || "",
            phone: (userData.phone && userData.phone.trim() !== "") ? userData.phone.trim() : (existingData?.phone || ""),
            birthDate: (userData.birthDate && userData.birthDate.trim() !== "") ? userData.birthDate.trim() : (existingData?.birthDate || ""),
            educationalLevelId: (userData.educationalLevelId && userData.educationalLevelId.trim() !== "") ? userData.educationalLevelId.trim() : (existingData?.educationalLevelId || ""),
            educationalLevel: (userData.educationalLevel && userData.educationalLevel.trim() !== "") ? userData.educationalLevel.trim() : (existingData?.educationalLevel || ""),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (firestoreError) {
        console.error("Error saving user to Firestore:", firestoreError);
      }
    }
  };

  const logout = async () => {
    try {
      if (auth) {
        await firebaseSignOut(auth);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user?.uid) return;
    
    // استخدام Firestore مباشرة بدون استدعاء API routes
    if (db) {
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          ...userData,
          updatedAt: serverTimestamp(),
        });
        
        // جلب البيانات المحدثة
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const updatedData = userDoc.data();
          const newUserData = { ...user, ...updatedData };
          setUser(newUserData);
          localStorage.setItem("user", JSON.stringify(newUserData));
        }
      } catch (firestoreError) {
        console.error("Error updating user in Firestore:", firestoreError);
        throw firestoreError;
      }
    } else {
      throw new Error("Firestore غير مهيأ");
    }
  };

  return (
    <SessionContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
