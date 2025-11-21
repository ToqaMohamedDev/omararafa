"use client";

import { useState, useEffect } from "react";
import { BookOpen, Clock, Users, Star, Play, Loader2, Phone, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db, auth } from "@/lib/firebase-client";
import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";
import { CourseCardSkeleton } from "@/components/Skeleton";
import VideoPlayer from "@/components/VideoPlayer";
import { useSession } from "@/hooks/useSession";

// WhatsApp Icon Component
const WhatsAppIcon = () => (
  <svg
    className="w-6 h-6"
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.375a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

interface Course {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  directVideoUrl?: string;
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
  const { user, isAuthenticated } = useSession();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseCategories, setCourseCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [showMessage, setShowMessage] = useState<{ type: "subscription" | "contact" | "login"; show: boolean }>({ type: "subscription", show: false });

  // جلب التصنيفات والدورات من Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // جلب تصنيفات الكورسات
        let courseCategoriesData: Array<{ id: string; name: string }> = [];
        if (db) {
          try {
            const courseCategoriesQuery = query(collection(db, "courseCategories"), orderBy("name"));
            const courseCategoriesSnapshot = await getDocs(courseCategoriesQuery);
            courseCategoriesData = courseCategoriesSnapshot.docs.map((doc) => ({
              id: doc.id,
              name: doc.data().name,
            }));
            setCourseCategories(courseCategoriesData);
          } catch (firestoreError) {
            console.error("Error fetching course categories from Firestore:", firestoreError);
          }
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
                categoryName: categoryId ? courseCategoriesData.find(c => c.id === categoryId)?.name || "" : "",
              };
            }) as Course[];
          } catch (firestoreError) {
            console.error("Error fetching courses from Firestore:", firestoreError);
          }
        }

        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // التحقق من حالة الاشتراك
  useEffect(() => {
    const checkSubscription = async () => {
      if (!isAuthenticated || !user?.uid || !db) {
        setHasSubscription(false);
        return;
      }

      try {
        const subscriptionRef = doc(db, "subscriptions", user.uid);
        const subscriptionDoc = await getDoc(subscriptionRef);
        
        if (subscriptionDoc.exists()) {
          const data = subscriptionDoc.data();
          const endsAt = data.endsAt?.toDate();
          if (endsAt && endsAt > new Date()) {
            setHasSubscription(true);
          } else {
            setHasSubscription(false);
          }
        } else {
          setHasSubscription(false);
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
        setHasSubscription(false);
      }
    };

    checkSubscription();
  }, [isAuthenticated, user?.uid, db]);

  // إنشاء قائمة التصنيفات مع "الكل"
  const categoryList = [
    { id: "all", name: "الكل" },
    ...courseCategories,
  ];

  // استخدام الدورات من Firebase فقط (لا بيانات افتراضية)
  const displayCourses = courses;

  // فلترة الكورسات بناءً على التصنيف والمرحلة التعليمية
  const filteredCourses = displayCourses.filter((course) => {
    // فلترة حسب التصنيف
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    
    // فلترة حسب المرحلة التعليمية (إذا كان المستخدم مسجل دخول)
    let matchesLevel = true;
    if (isAuthenticated && user?.educationalLevelId) {
      matchesLevel = course.level === user.educationalLevelId;
    }
    
    return matchesCategory && matchesLevel;
  });

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
          الكورسات التعليمية
        </h1>
        <motion.div
          className="w-32 h-1.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 mx-auto rounded-full mb-6 opacity-70"
          initial={{ width: 0 }}
          animate={{ width: 128 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        ></motion.div>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          اختر الكورس الذي يناسبك وابدأ رحلتك في تعلم اللغة العربية
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
              onClick={() => {
                setFiltering(true);
                setSelectedCategory(category.id);
                setTimeout(() => {
                  setFiltering(false);
                }, 800);
              }}
              className={`relative px-6 py-2.5 rounded-full font-semibold transition-all ${
                selectedCategory === category.id
                  ? "bg-primary-600 dark:bg-primary-700 text-white shadow-md shadow-primary-500/20 dark:shadow-primary-500/15 ring-2 ring-primary-400/20 dark:ring-primary-600/20 scale-105"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:scale-105"
              }`}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: selectedCategory === category.id ? 1.05 : 1 }}
              transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
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
      ) : filtering ? (
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
      ) : filteredCourses.length === 0 ? (
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
            className="inline-block mb-6"
          >
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6">
              <BookOpen className="w-16 h-16 text-gray-400" />
            </div>
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            لا توجد كورسات
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            لا توجد كورسات في هذا التصنيف حالياً
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
            className="card overflow-hidden group cursor-pointer"
            whileHover={{ y: -10, scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={async () => {
              // إذا كان المستخدم غير مسجل دخول
              if (!isAuthenticated) {
                setShowMessage({ type: "login", show: true });
                return;
              }

              // إذا كان المستخدم غير مشترك، لا نسمح له بفتح الكورس
              if (!hasSubscription) {
                setShowMessage({ type: "subscription", show: true });
                return;
              }

              // إذا كان المستخدم مشترك، نحاول جلب videoUrl من private/source إذا لم يكن موجوداً
              if (hasSubscription && db && auth?.currentUser) {
                let finalVideoUrl = course.videoUrl || course.directVideoUrl;
                
                // إذا لم يكن videoUrl موجوداً، نحاول جلبه من private/source
                if (!finalVideoUrl) {
                  try {
                    const privateSourceRef = doc(db, "courses", course.id, "private", "source");
                    const privateSourceDoc = await getDoc(privateSourceRef);
                    if (privateSourceDoc.exists()) {
                      const data = privateSourceDoc.data();
                      finalVideoUrl = data.url || "";
                    }
                  } catch (error: any) {
                    console.error("Error fetching course URL:", error);
                    // إذا كان الخطأ permission-denied، هذا يعني أن Security Rules تمنع الوصول
                    if (error.code === "permission-denied") {
                      setShowMessage({ type: "contact", show: true });
                      return;
                    }
                  }
                }
                
                // إذا لم نجد videoUrl بعد كل المحاولات
                if (!finalVideoUrl || finalVideoUrl.trim() === "") {
                  setShowMessage({ type: "contact", show: true });
                  return;
                }
                
                // تحديث videoUrl في الكورس قبل فتحه
                setSelectedCourse({
                  ...course,
                  videoUrl: finalVideoUrl,
                  directVideoUrl: finalVideoUrl,
                });
              } else {
                setSelectedCourse(course);
              }
            }}
          >
            <div className="relative overflow-hidden">
              <motion.img
                src={course.thumbnailUrl || "https://via.placeholder.com/400x250?text=دورة"}
                alt={course.title}
                className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Play className="w-16 h-16 text-primary-600 dark:text-primary-400 fill-primary-600 dark:fill-primary-400 drop-shadow-lg" />
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="text-2xl font-bold flex-1 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {course.title}
                </h2>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {course.rating !== undefined && course.rating > 0 && (
                    <motion.div
                      className="flex items-center gap-1 text-primary-600 dark:text-primary-400"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-semibold">{course.rating}</span>
                    </motion.div>
                  )}
                  <span className="bg-primary-600 dark:bg-primary-700 text-white px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap">
                    {course.level}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-2 line-clamp-2 text-sm">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{course.duration || "غير محدد"}</span>
                </div>
                {course.categoryName && (
                  <span className="inline-block bg-primary-100 dark:bg-primary-900/30 text-primary-DEFAULT px-2 py-0.5 rounded-full text-xs font-semibold">
                    {course.categoryName}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        </motion.div>
      )}

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <VideoPlayer
              videoUrl={selectedCourse.videoUrl}
              title={selectedCourse.title}
              thumbnailUrl={selectedCourse.thumbnailUrl}
              onClose={() => setSelectedCourse(null)}
              directVideoUrl={selectedCourse.directVideoUrl}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Modal */}
      <AnimatePresence>
        {showMessage.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMessage({ type: "subscription", show: false })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 border border-gray-200 dark:border-gray-700"
            >
              {showMessage.type === "subscription" && (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full p-4">
                      <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-3 text-gray-900 dark:text-white">
                    اشتراك مطلوب
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
                    يجب الاشتراك لمشاهدة هذا الكورس. يرجى التواصل مع مستر عمر للاشتراك.
                  </p>
                  
                  {/* Contact Buttons */}
                  <div className="space-y-3 mb-6">
                    {/* WhatsApp Button */}
                    <a
                      href="https://wa.me/2001146525436"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3.5 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <WhatsAppIcon />
                      <span>واتساب</span>
                    </a>

                    {/* Phone Call Button */}
                    <a
                      href="tel:01146525436"
                      className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3.5 rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <Phone className="w-5 h-5" />
                      <span>اتصال: 01146525436</span>
                    </a>
                  </div>

                  <button
                    onClick={() => setShowMessage({ type: "subscription", show: false })}
                    className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                  >
                    إغلاق
                  </button>
                </>
              )}

              {showMessage.type === "login" && (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-4">
                      <AlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-3 text-gray-900 dark:text-white">
                    تسجيل الدخول مطلوب
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
                    يجب تسجيل الدخول أولاً لمشاهدة الكورسات
                  </p>
                  <button
                    onClick={() => setShowMessage({ type: "login", show: false })}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    فهمت
                  </button>
                </>
              )}

              {showMessage.type === "contact" && (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full p-4">
                      <Phone className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-3 text-gray-900 dark:text-white">
                    رابط الكورس غير متاح
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
                    عذراً، رابط الكورس غير متاح حالياً. يرجى التواصل مع مستر عمر للحصول على المساعدة.
                  </p>
                  
                  {/* Contact Buttons */}
                  <div className="space-y-3 mb-6">
                    {/* WhatsApp Button */}
                    <a
                      href="https://wa.me/2001146525436"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3.5 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <WhatsAppIcon />
                      <span>واتساب</span>
                    </a>

                    {/* Phone Call Button */}
                    <a
                      href="tel:01146525436"
                      className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3.5 rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <Phone className="w-5 h-5" />
                      <span>اتصال: 01146525436</span>
                    </a>
                  </div>

                  <button
                    onClick={() => setShowMessage({ type: "contact", show: false })}
                    className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                  >
                    إغلاق
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
