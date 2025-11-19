"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-DEFAULT mb-4">404</h1>
          <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            الصفحة غير موجودة
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="bg-primary-DEFAULT text-white px-8 py-4 rounded-lg hover:bg-primary-dark transition font-semibold text-lg shadow-lg flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            العودة للرئيسية
          </Link>
          <button
            onClick={() => window.history.back()}
            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition font-semibold text-lg shadow-soft flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            الرجوع للخلف
          </button>
        </div>
      </div>
    </div>
  );
}

