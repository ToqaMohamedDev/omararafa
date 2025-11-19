"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase-client";

interface User {
  uid?: string;
  name: string;
  email: string;
  photoURL?: string;
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
      };
    }
    return null;
  } catch (error) {
    console.error("Error verifying user:", error);
    return null;
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
        if (isMounted && parsedUser && parsedUser.email) {
          setUser(parsedUser);
          // لا نوقف loading هنا - ننتظر Firebase
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
            if (parsedUser && parsedUser.email) {
              setUser(parsedUser);
            } else {
              setUser(null);
            }
          } catch (e) {
            setUser(null);
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
              setUser(userData);
              localStorage.setItem("user", JSON.stringify(userData));
            } else if (isMounted) {
              // إذا فشل التحقق، احذف من localStorage
              setUser(null);
              localStorage.removeItem("user");
            }
          } catch (error) {
            console.error("Error in auth state change:", error);
            // في حالة الخطأ، احتفظ بالبيانات من localStorage إذا كانت موجودة
            const savedUser = localStorage.getItem("user");
            if (savedUser && isMounted) {
              try {
                const parsedUser = JSON.parse(savedUser);
                if (parsedUser && parsedUser.email) {
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
          // في حالة الخطأ، استخدم localStorage كـ fallback
          const savedUser = localStorage.getItem("user");
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser);
              if (parsedUser && parsedUser.email) {
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
            if (parsedUser && parsedUser.email) {
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
      try {
        await fetch(`/api/users/${userData.uid}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: userData.name,
            email: userData.email,
          }),
        });
      } catch (error) {
        console.error("Error updating user in Firebase:", error);
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
      }
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
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
