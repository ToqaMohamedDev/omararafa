"use client";

import { useSession } from "@/hooks/useSession";
import { useRouter } from "next/navigation";
import { User, Mail, Award, BookOpen, Clock, TrendingUp, LogOut, Phone, Calendar, Copy, Check } from "lucide-react";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        birthDate: user.birthDate || "",
      });
    }
  }, [user]);

  useEffect(() => {
    // انتظر حتى يتم تحميل حالة المصادقة قبل التحقق
    if (!loading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, loading, router]);

  // إظهار loading أثناء التحقق من المصادقة
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-DEFAULT"></div>
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
      value: "12",
      color: "text-primary-DEFAULT",
    },
    {
      icon: Award,
      label: "المعدل العام",
      value: "85%",
      color: "text-primary-DEFAULT",
    },
    {
      icon: Clock,
      label: "ساعات التعلم",
      value: "45",
      color: "text-primary-DEFAULT",
    },
    {
      icon: TrendingUp,
      label: "المستوى",
      value: "متوسط",
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
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            الاختبارات الأخيرة
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  اختبار النحو - الفاعل والمفعول به
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  تم في 15 يناير 2024
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-DEFAULT">90%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ممتاز
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  اختبار النصوص - التحليل
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  تم في 10 يناير 2024
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-DEFAULT">75%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">جيد</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

