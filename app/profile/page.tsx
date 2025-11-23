"use client";

import { useSession } from "@/hooks/useSession";
import { useRouter } from "next/navigation";
import { User, Mail, Award, BookOpen, TrendingUp, LogOut, Phone, Calendar, Copy, Check, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase-client";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { ProfileSkeleton, MessageCardSkeleton } from "@/components/Skeleton";

export default function ProfilePage() {
  const { user, isAuthenticated, loading, logout, updateUser } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    birthDate: user?.birthDate || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState<Array<{
    id: string;
    subject: string;
    message: string;
    createdAt: any;
    read: boolean;
  }>>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [userStats, setUserStats] = useState({
    completedTests: 0,
    averageScore: 0,
    level: "مبتدئ",
    levelScore: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        birthDate: user.birthDate || "",
      });
      
      // تحديث الإحصائيات من بيانات المستخدم
      setUserStats({
        completedTests: user.completedTests || 0,
        averageScore: user.averageScore || 0,
        level: user.level || "مبتدئ",
        levelScore: user.levelScore || 0,
      });
    }
  }, [user]);

  // جلب الإحصائيات مباشرة من Firestore
  useEffect(() => {
    const loadStats = async () => {
      if (!user?.uid || !db) return;
      
      setLoadingStats(true);
      try {
        const { query: firestoreQuery, collection: firestoreCollection, where: firestoreWhere, orderBy: firestoreOrderBy, getDocs: firestoreGetDocs } = await import("firebase/firestore");
        
        let results: any[] = [];
        
        try {
          // محاولة جلب النتائج مع orderBy
          const resultsQuery = firestoreQuery(
            firestoreCollection(db, "testResults"),
            firestoreWhere("userId", "==", user.uid),
            firestoreOrderBy("createdAt", "desc")
          );

          const resultsSnapshot = await firestoreGetDocs(resultsQuery);
          results = resultsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        } catch (error: any) {
          // إذا فشل query مع orderBy (مثل عدم وجود index)، جرب بدون orderBy
          if (error?.code === "failed-precondition" || error?.code === "unimplemented") {
            console.warn("⚠️ Firestore index missing, trying without orderBy:", error);
            try {
              const resultsQuery = firestoreQuery(
                firestoreCollection(db, "testResults"),
                firestoreWhere("userId", "==", user.uid)
              );

              const resultsSnapshot = await firestoreGetDocs(resultsQuery);
              results = resultsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              
              // ترتيب النتائج يدوياً حسب createdAt
              results.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
                return dateB.getTime() - dateA.getTime();
              });
            } catch (fallbackError) {
              console.error("❌ Error loading stats (fallback):", fallbackError);
              throw fallbackError;
            }
          } else {
            throw error;
          }
        }
        
        // حساب الإحصائيات
        const completedTests = results.length;
        const totalPercentage = results.reduce((sum: number, result: any) => sum + (result.percentage || 0), 0);
        const averageScore = completedTests > 0 ? Math.round(totalPercentage / completedTests) : 0;
        
        console.log("📊 الإحصائيات المحملة:", {
          completedTests,
          averageScore,
          resultsCount: results.length,
          userLevel: user.level,
        });
        
        // تحديث الإحصائيات
        setUserStats({
          completedTests,
          averageScore,
          level: user.level || "مبتدئ",
          levelScore: user.levelScore || 0,
        });
      } catch (error: any) {
        console.error("❌ Error loading stats:", error);
        console.error("❌ Error details:", {
          code: error?.code,
          message: error?.message,
          userId: user?.uid,
        });
        // في حالة الخطأ، استخدم البيانات من user object
        setUserStats({
          completedTests: user.completedTests || 0,
          averageScore: user.averageScore || 0,
          level: user.level || "مبتدئ",
          levelScore: user.levelScore || 0,
        });
      } finally {
        setLoadingStats(false);
      }
    };

    if (user?.uid && db) {
      loadStats();
    }
  }, [user?.uid, db, user?.level, user?.levelScore, user?.averageScore, user?.completedTests]);

  // جلب الرسائل المرسلة من المستخدم
  useEffect(() => {
    const loadMessages = async () => {
      if (!user || !db || !isAuthenticated) return;
      
      setLoadingMessages(true);
      try {
        // جلب جميع الرسائل (Security Rules ستسمح فقط بالرسائل الخاصة بالمستخدم)
        const messagesQuery = query(
          collection(db, "messages"),
          orderBy("createdAt", "desc")
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        
        // فلترة الرسائل في الكود بناءً على userId أو userEmail
        const allMessages = messagesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Array<{
          id: string;
          userId: string | null;
          userEmail: string;
          subject: string;
          message: string;
          createdAt: any;
          read: boolean;
        }>;

        // فلترة الرسائل التي تنتمي للمستخدم
        const userMessages = allMessages.filter(msg => {
          // إذا كان userId موجود ويساوي user.uid
          if (msg.userId && user.uid && msg.userId === user.uid) {
            return true;
          }
          // إذا كان userEmail موجود ويساوي user.email
          if (msg.userEmail && user.email && msg.userEmail.toLowerCase() === user.email.toLowerCase()) {
            return true;
          }
          return false;
        });

        // ترتيب الرسائل حسب التاريخ
        userMessages.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });

        setMessages(userMessages);
        console.log("Loaded messages:", userMessages.length, "for user:", user.email);
      } catch (error: any) {
        console.error("Error loading messages:", error);
        // في حالة الخطأ (مثل عدم وجود index)، جرب بدون orderBy
        try {
          const messagesQuery = query(collection(db, "messages"));
          const messagesSnapshot = await getDocs(messagesQuery);
          const allMessages = messagesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Array<{
            id: string;
            userId: string | null;
            userEmail: string;
            subject: string;
            message: string;
            createdAt: any;
            read: boolean;
          }>;

          const userMessages = allMessages.filter(msg => {
            if (msg.userId && user.uid && msg.userId === user.uid) {
              return true;
            }
            if (msg.userEmail && user.email && msg.userEmail.toLowerCase() === user.email.toLowerCase()) {
              return true;
            }
            return false;
          });

          userMessages.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return dateB.getTime() - dateA.getTime();
          });

          setMessages(userMessages);
          console.log("Loaded messages (fallback):", userMessages.length);
        } catch (error2) {
          console.error("Error loading messages (fallback):", error2);
        }
      } finally {
        setLoadingMessages(false);
      }
    };

    if (user && isAuthenticated) {
      loadMessages();
    }
  }, [user, isAuthenticated, db]);

  useEffect(() => {
    // انتظر حتى يتم تحميل حالة المصادقة قبل التحقق
    if (!loading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, loading, router]);

  // إظهار loading أثناء التحقق من المصادقة
  if (loading) {
    return (
      <div className="container mx-auto container-padding page-padding">
        <ProfileSkeleton />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage("");
    try {
      await updateUser({
        name: formData.name,
        phone: formData.phone,
        birthDate: formData.birthDate,
      });
      setSaveMessage("تم حفظ التغييرات بنجاح!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setSaveMessage("حدث خطأ أثناء حفظ التغييرات");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyUID = async () => {
    if (user?.uid) {
      try {
        await navigator.clipboard.writeText(user.uid);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy:", error);
      }
    }
  };

  const stats = [
    {
      icon: BookOpen,
      label: "الاختبارات المكتملة",
      value: loadingStats ? "..." : userStats.completedTests.toString(),
      color: "text-primary-DEFAULT",
    },
    {
      icon: Award,
      label: "المعدل العام",
      value: loadingStats ? "..." : `${userStats.averageScore}%`,
      color: "text-primary-DEFAULT",
    },
    {
      icon: TrendingUp,
      label: "المستوى",
      value: loadingStats ? "..." : userStats.level,
      color: "text-primary-DEFAULT",
    },
  ];

  return (
    <div className="container mx-auto container-padding page-padding">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
          الملف الشخصي
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6">
            <div className="flex items-center gap-6 mb-6">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border-2 border-primary-DEFAULT"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary-DEFAULT flex items-center justify-center border-2 border-primary-600">
                  <span className="text-3xl font-bold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || "م"}
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {user?.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </p>
                {user?.phone && (
                  <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-1">
                    <Phone className="w-4 h-4" />
                    {user.phone}
                  </p>
                )}
                {user?.uid && (
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="font-mono text-xs">ID: {user.uid}</span>
                    </p>
                    <button
                      onClick={handleCopyUID}
                      className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      title="نسخ ID"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  رقم التليفون
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01146525436"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  تاريخ الميلاد
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent"
                />
              </div>
              {saveMessage && (
                <div className={`p-3 rounded-lg text-sm ${
                  saveMessage.includes("نجاح") 
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300" 
                    : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                }`}>
                  {saveMessage}
                </div>
              )}
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
              </button>
              <button 
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition font-semibold mt-4"
              >
                <LogOut className="w-5 h-5" />
                تسجيل الخروج
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              الإحصائيات
            </h3>
            <div className="space-y-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-6 h-6 text-primary-DEFAULT" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              الشكاوي والرسائل المرسلة
          </h3>
          </div>
          {loadingMessages ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <MessageCardSkeleton key={i} />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">لا توجد رسائل مرسلة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const date = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt || new Date());
                return (
                  <div
                    key={msg.id}
                    className={`p-5 rounded-lg border-2 transition-all duration-200 ${
                      msg.read
                        ? "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                        : "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-700"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-600">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                            {msg.subject}
                          </h4>
                          {!msg.read && (
                            <span className="px-2 py-1 text-xs font-semibold bg-orange-500 text-white rounded whitespace-nowrap inline-block">
                              جديدة
                            </span>
                          )}
                          {msg.read && (
                            <span className="px-2 py-1 text-xs font-semibold bg-gray-500 text-white rounded whitespace-nowrap inline-block">
                              مقروءة
                            </span>
                          )}
              </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {date.toLocaleDateString("ar-EG", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                </p>
              </div>
            </div>

                    {/* Message Content */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {msg.message}
                </p>
              </div>
              </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

