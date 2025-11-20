"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, User as FirebaseUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase-client";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

interface User {
  uid?: string;
  name: string;
  email: string;
  photoURL?: string;
  phone?: string;
  birthDate?: string;
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
    const idToken = await firebaseUser.getIdToken(false);
    const response = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        uid: data.uid,
        email: data.email || firebaseUser.email || "",
        name: data.name || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "مستخدم",
        photoURL: data.photoURL || firebaseUser.photoURL,
        phone: data.phone || "",
        birthDate: data.birthDate || "",
      };
    }
    // إذا كان الخطأ 503 (Service Unavailable)، يعني Firebase Admin غير مهيأ
    // جرب جلب البيانات من Firestore مباشرة
    if (response.status === 503 && db) {
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
          };
        }
      } catch (firestoreError) {
        console.warn("Error fetching user from Firestore:", firestoreError);
      }
      
      // إذا لم توجد بيانات في Firestore، نعيد بيانات Firebase Client
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "مستخدم",
        photoURL: firebaseUser.photoURL || undefined,
        phone: "",
        birthDate: "",
      };
    }
    return null;
  } catch (error) {
    console.error("Error verifying user:", error);
    // في حالة الخطأ، جرب جلب البيانات من Firestore مباشرة
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
          };
        }
      } catch (firestoreError) {
        console.warn("Error fetching user from Firestore:", firestoreError);
      }
    }
    
    // في حالة الخطأ، نعيد بيانات المستخدم من Firebase Client
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "مستخدم",
      photoURL: firebaseUser.photoURL || undefined,
      phone: "",
      birthDate: "",
    };
  }
};

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const authStateChecked = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let isMounted = true;

    // تحميل أولي من localStorage لإظهار حالة سريعة (لكن لا نوقف loading)
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // التحقق من وجود phone و birthDate في localStorage أيضاً
        if (isMounted && parsedUser && parsedUser.email && parsedUser.phone && parsedUser.birthDate) {
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
            // التحقق من وجود phone و birthDate
            if (parsedUser && parsedUser.email && parsedUser.phone && parsedUser.birthDate) {
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
              // التحقق من وجود phone و birthDate
              if (!userData.phone || !userData.birthDate) {
                // إذا لم تكن البيانات موجودة، تحقق من الصفحة الحالية
                if (typeof window !== "undefined") {
                  const currentPath = window.location.pathname;
                  
                  // إذا كان المستخدم في صفحة auth (login/register)، لا تسجل خروجه
                  // دع المستخدم يكمل بياناته
                  if (currentPath.includes("/auth/")) {
                    console.log("⚠️ بيانات ناقصة - المستخدم في صفحة auth، لا تسجيل خروج");
                    // لا تسجل خروج - دع المستخدم يكمل بياناته
                    setUser(null);
                    localStorage.removeItem("user");
                    return;
                  }
                  
                  // إذا كان المستخدم في صفحة أخرى، سجل خروجه وأعد التوجيه
                  console.log("User data incomplete - logging out");
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
    if (userData.uid) {
      // في development، استخدم Client-side Firestore مباشرة لتجنب 503 errors
      // في production، حاول استخدام API أولاً
      const useClientSideDirectly = process.env.NODE_ENV === "development";
      
      if (useClientSideDirectly && db) {
        // استخدام Client-side Firestore مباشرة في development
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
              updatedAt: serverTimestamp(),
            });
          }
        } catch (firestoreError) {
          console.error("Error saving user to Firestore:", firestoreError);
        }
        return; // لا نحاول API في development
      }
      
      // في production، محاولة استخدام API أولاً
      try {
        const response = await fetch(`/api/users/${userData.uid}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: userData.name,
            email: userData.email,
            photoURL: userData.photoURL || "",
            phone: userData.phone || "",
            birthDate: userData.birthDate || "",
          }),
        });
        
        // إذا فشل API (503)، استخدم Client-side Firestore مباشرة
        if (!response.ok && response.status === 503 && db) {
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
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            } else {
              const existingData = userDoc.data();
              // استخدام البيانات الجديدة إذا كانت موجودة وليست فارغة، وإلا استخدم الموجودة
              await updateDoc(userRef, {
                name: userData.name || existingData?.name || "",
                email: userData.email || existingData?.email || "",
                photoURL: userData.photoURL || existingData?.photoURL || "",
                phone: (userData.phone && userData.phone.trim() !== "") ? userData.phone.trim() : (existingData?.phone || ""),
                birthDate: (userData.birthDate && userData.birthDate.trim() !== "") ? userData.birthDate.trim() : (existingData?.birthDate || ""),
                updatedAt: serverTimestamp(),
              });
            }
          } catch (firestoreError) {
            console.error("Error saving user to Firestore (client-side fallback):", firestoreError);
          }
        }
      } catch (error) {
        console.error("Error updating user in Firebase:", error);
        // Fallback إلى Client-side Firestore
        if (db) {
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
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            } else {
              const existingData = userDoc.data();
              // استخدام البيانات الجديدة إذا كانت موجودة وليست فارغة، وإلا استخدم الموجودة
              await updateDoc(userRef, {
                name: userData.name || existingData?.name || "",
                email: userData.email || existingData?.email || "",
                photoURL: userData.photoURL || existingData?.photoURL || "",
                phone: (userData.phone && userData.phone.trim() !== "") ? userData.phone.trim() : (existingData?.phone || ""),
                birthDate: (userData.birthDate && userData.birthDate.trim() !== "") ? userData.birthDate.trim() : (existingData?.birthDate || ""),
                updatedAt: serverTimestamp(),
              });
            }
          } catch (firestoreError) {
            console.error("Error saving user to Firestore (client-side fallback):", firestoreError);
          }
        }
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
    
    try {
      const response = await fetch(`/api/users/${user.uid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        const newUserData = { ...user, ...updatedUser };
        setUser(newUserData);
        localStorage.setItem("user", JSON.stringify(newUserData));
      } else if (response.status === 503 && db) {
        // Fallback إلى Client-side Firestore إذا كان Admin غير متاح
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
          console.error("Error updating user in Firestore (client-side):", firestoreError);
          throw firestoreError;
        }
      } else {
        throw new Error("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      // Fallback إلى Client-side Firestore
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
          console.error("Error updating user in Firestore (client-side fallback):", firestoreError);
          throw firestoreError;
        }
      } else {
        throw error;
      }
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
