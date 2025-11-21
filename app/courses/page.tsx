"use client";

import { useState, useEffect } from "react";
import { BookOpen, Clock, Users, Star, Play, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase-client";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { CourseCardSkeleton } from "@/components/Skeleton";

interface Course {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: string;
  level: string;
  instructor: string;
  category?: string;
  categoryName?: string;
  students?: number;
  rating?: number;
  lessons?: number;
  createdAt?: any;
}

export default function CoursesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  // جلب التصنيفات والدورات من Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // جلب التصنيفات
        let categoriesData: Array<{ id: string; name: string }> = [];
        const categoriesRes = await fetch("/api/categories");
        if (categoriesRes.ok) {
          const apiCategoriesData = await categoriesRes.json();
          categoriesData = apiCategoriesData.categories || [];
          setCategories(categoriesData);
        }

        // جلب الدورات من API أولاً
        const coursesRes = await fetch("/api/courses");
        let coursesData: Course[] = [];
        
        if (coursesRes.ok) {
          const apiData = await coursesRes.json();
          coursesData = apiData.courses || [];
        }

        // إذا كان API يعيد بيانات فارغة، استخدم Firebase Client SDK مباشرة
        if (coursesData.length === 0 && db) {
          try {
            const coursesQuery = query(collection(db, "courses"), orderBy("createdAt", "desc"));
            const coursesSnapshot = await getDocs(coursesQuery);
            coursesData = coursesSnapshot.docs.map((doc) => {
              const courseData = doc.data();
              const categoryId = courseData.category;
              return {
                id: doc.id,
                ...courseData,
                categoryName: categoryId ? categoriesData.find(c => c.id === categoryId)?.name || "" : "",
              };
            }) as Course[];
          } catch (firestoreError) {
            console.error("Error fetching courses from Firestore:", firestoreError);
          }
        }

        setCourses(coursesData);

        // جلب التصنيفات من Firestore إذا كان API يعيد بيانات فارغة
        if (categoriesData.length === 0 && db) {
          try {
            const categoriesQuery = query(collection(db, "categories"), orderBy("name"));
            const categoriesSnapshot = await getDocs(categoriesQuery);
            const firestoreCategories = categoriesSnapshot.docs.map((doc) => ({
              id: doc.id,
              name: doc.data().name,
            }));
            setCategories(firestoreCategories);
          } catch (firestoreError) {
            console.error("Error fetching categories from Firestore:", firestoreError);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // إنشاء قائمة التصنيفات مع "الكل"
  const categoryList = [
    { id: "all", name: "الكل" },
    ...categories,
  ];

  // استخدام الدورات من Firebase فقط (لا بيانات افتراضية)
  const displayCourses = courses;

  const filteredCourses =
    selectedCategory === "all"
      ? displayCourses
      : displayCourses.filter((course) => course.category === selectedCategory);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  return (
    <div className="container mx-auto container-padding page-padding">
      <motion.div
        className="text-center mb-8 md:mb-12"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
          الدورات التعليمية
        </h1>
        <motion.div
          className="w-32 h-1.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 mx-auto rounded-full mb-6"
          initial={{ width: 0 }}
          animate={{ width: 128 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        ></motion.div>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          اختر الدورة التي تناسبك وابدأ رحلتك في تعلم اللغة العربية
        </p>
      </motion.div>

      {/* فلاتر التصنيفات */}
      {categoryList.length > 1 && (
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-8 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {categoryList.map((category, index) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2.5 rounded-full font-semibold transition-all ${
                selectedCategory === category.id
                  ? "bg-primary-600 dark:bg-primary-500 text-white shadow-lg shadow-primary-500/50 dark:shadow-primary-500/30 ring-2 ring-primary-400 dark:ring-primary-600 ring-offset-2 ring-offset-white dark:ring-offset-gray-900"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500"
              }`}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              {category.name}
            </motion.button>
          ))}
        </motion.div>
      )}

      {loading ? (
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Categories Skeleton */}
          {categoryList.length > 1 && (
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              ))}
            </div>
          )}
          
          {/* Courses Grid Skeleton */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </motion.div>
        </motion.div>
      ) : filteredCourses.length === 0 ? (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-400">
            لا توجد دورات في هذا التصنيف
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={selectedCategory}
        >
          {filteredCourses.map((course, index) => (
          <motion.div
            key={course.id}
            variants={itemVariants}
            className="card overflow-hidden group"
            whileHover={{ y: -10, scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative overflow-hidden">
              <motion.img
                src={course.thumbnailUrl || "https://via.placeholder.com/400x250?text=دورة"}
                alt={course.title}
                className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/95 dark:bg-gray-900/95 rounded-full p-5 transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                  <Play className="w-10 h-10 text-primary-DEFAULT fill-primary-DEFAULT" />
                </div>
              </div>
              <div className="absolute top-4 left-4">
                <motion.span
                  className="bg-primary-DEFAULT text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ margin: "-50px" }}
                  transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                >
                  {course.level}
                </motion.span>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-primary-DEFAULT transition-colors">
                  {course.title}
                </h2>
                {course.rating !== undefined && course.rating > 0 && (
                  <motion.div
                    className="flex items-center gap-1 text-primary-DEFAULT"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Star className="w-5 h-5 fill-current" />
                    <span className="font-semibold">{course.rating}</span>
                  </motion.div>
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {course.description}
              </p>

              <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration || "غير محدد"}</span>
                </div>
                {course.lessons !== undefined && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.lessons} درس</span>
                  </div>
                )}
                {course.students !== undefined && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{course.students} طالب</span>
                  </div>
                )}
                {course.categoryName && (
                  <div className="mt-2">
                    <span className="inline-block bg-primary-100 dark:bg-primary-900/30 text-primary-DEFAULT px-3 py-1 rounded-full text-xs font-semibold">
                      {course.categoryName}
                    </span>
                  </div>
                )}
              </div>

              <motion.button
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 group/btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Play className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                ابدأ الدورة
              </motion.button>
            </div>
          </motion.div>
        ))}
        </motion.div>
      )}
    </div>
  );
}
