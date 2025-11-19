"use client";

import { useSession } from "@/hooks/useSession";
import { useRouter } from "next/navigation";
import { User, Mail, Award, BookOpen, Clock, TrendingUp } from "lucide-react";
import { useEffect } from "react";

export default function ProfilePage() {
  const { user, isAuthenticated, loading } = useSession();
  const router = useRouter();

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
              <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <User className="w-12 h-12 text-primary-DEFAULT" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {user?.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  defaultValue={user?.name}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  defaultValue={user?.email}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <button className="w-full bg-primary-DEFAULT text-white py-3 rounded-lg hover:bg-primary-dark transition font-semibold">
                حفظ التغييرات
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
                  اختبار الصرف - الأوزان
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

