"use client";

import { useState, useEffect } from "react";
import { Play, Clock, Eye, BookOpen, X, Sparkles, TrendingUp, Phone, AlertCircle, CheckCircle, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { VideoCardSkeleton, CategoryCardSkeleton } from "./Skeleton";
import VideoPlayer from "./VideoPlayer";
import { db, auth } from "@/lib/firebase-client";
import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";
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

interface Video {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  description: string;
  category: string;
  level: string;
  views?: number;
  duration?: string;
  date?: string;
  createdAt?: any;
  directVideoUrl?: string;
}

export default function VideoSection() {
  const { user, isAuthenticated } = useSession();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [showMessage, setShowMessage] = useState<{ type: "subscription" | "contact" | "login"; show: boolean }>({ type: "subscription", show: false });
  const [filtering, setFiltering] = useState(false);

  // التحقق من الاشتراك
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
          const endsAt = data.endsAt?.toDate ? data.endsAt.toDate() : new Date(data.endsAt);
          const now = new Date();
          const isValid = endsAt > now;
          console.log("Subscription check:", { 
            exists: true, 
            endsAt: endsAt.toISOString(), 
            now: now.toISOString(), 
            isValid 
          });
          setHasSubscription(isValid);
        } else {
          console.log("Subscription check: Document does not exist");
          setHasSubscription(false);
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
        setHasSubscription(false);
      }
    };

    checkSubscription();
  }, [isAuthenticated, user?.uid]);

  // جلب التصنيفات والفيديوهات من Firebase
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

        // جلب الفيديوهات من API أولاً
        const videosRes = await fetch("/api/videos");
        let videosData: Video[] = [];
        
        if (videosRes.ok) {
          const apiData = await videosRes.json();
          videosData = apiData.videos || [];
        }

        // إذا كان API يعيد بيانات فارغة، استخدم Firebase Client SDK مباشرة
        if (videosData.length === 0 && db) {
          try {
            const videosQuery = query(collection(db, "videos"), orderBy("createdAt", "desc"));
            const videosSnapshot = await getDocs(videosQuery);
            videosData = videosSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Video[];
          } catch (firestoreError) {
            console.error("Error fetching videos from Firestore:", firestoreError);
          }
        }

        // جلب videoUrl من private/source للمستخدمين المشتركين
        if (hasSubscription && db && auth?.currentUser && videosData.length > 0) {
          try {
            const videosWithUrls = await Promise.all(
              videosData.map(async (video) => {
                if (!db) return video;
                try {
                  const privateSourceRef = doc(db, "videos", video.id, "private", "source");
                  const privateSourceDoc = await getDoc(privateSourceRef);
                  if (privateSourceDoc.exists()) {
                    const data = privateSourceDoc.data();
                    const url = data.url || "";
                    return {
                      ...video,
                      videoUrl: url || video.videoUrl || "",
                      directVideoUrl: url || video.videoUrl || "",
                    };
                  }
                } catch (error: any) {
                  // إذا كان الخطأ permission-denied، هذا طبيعي
                  if (error.code !== "permission-denied") {
                    console.error(`Error fetching video URL for ${video.id}:`, error);
                  }
                }
                // إذا لم يتم جلب URL، نعيد الفيديو بدون URL
                return {
                  ...video,
                  videoUrl: video.videoUrl || "",
                  directVideoUrl: video.directVideoUrl || "",
                };
              })
            );
            videosData = videosWithUrls;
          } catch (error) {
            console.error("Error fetching video URLs from private subcollections:", error);
          }
        }

        setVideos(videosData);

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
  }, [hasSubscription]);

  const categoryList = [
    { id: "all", name: "الكل" },
    ...categories,
  ];

  const displayVideos = videos;
  const categoryMap = new Map(categories.map((cat) => [cat.id, cat.name]));

  const videosWithCategoryNames = displayVideos.map((video) => ({
    ...video,
    categoryName: video.category ? categoryMap.get(video.category) || video.category : "",
  }));

  // فلترة الفيديوهات بناءً على التصنيف والمرحلة التعليمية
  const filteredVideos = videosWithCategoryNames.filter((video) => {
    // فلترة حسب التصنيف
    const matchesCategory = selectedCategory === "all" || video.category === selectedCategory;
    
    // فلترة حسب المرحلة التعليمية (إذا كان المستخدم مسجل دخول)
    let matchesLevel = true;
    if (isAuthenticated && user?.educationalLevelId) {
      matchesLevel = video.level === user.educationalLevelId;
    }
    
    return matchesCategory && matchesLevel;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
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
    <section id="videos" className="py-8 md:py-12 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* العنوان الرئيسي */}
        <motion.div
          className="text-center mb-8 md:mb-10"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 px-5 py-2.5 rounded-full mb-6"
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ margin: "-50px" }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <Sparkles className="w-5 h-5 text-primary-DEFAULT" />
            <span className="text-primary-DEFAULT font-semibold text-sm">
              مكتبة الفيديوهات
            </span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            الفيديوهات التعليمية
          </h2>
          
          <motion.div
            className="w-40 h-1.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 mx-auto rounded-full mb-6"
            initial={{ width: 0 }}
            whileInView={{ width: 160 }}
            viewport={{ margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.3 }}
          ></motion.div>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            استكشف مكتبة شاملة من الفيديوهات التعليمية المميزة في اللغة العربية
          </p>
        </motion.div>

        {/* فلاتر التصنيفات */}
        {categoryList.length > 1 && (
          <motion.div
            className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8 md:mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {categoryList.map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => {
                  setFiltering(true);
                  setSelectedCategory(category.id);
                  // إخفاء Skeleton بعد فترة قصيرة
                  setTimeout(() => {
                    setFiltering(false);
                  }, 800);
                }}
                className={`relative px-6 md:px-8 py-3 md:py-3.5 rounded-full font-semibold text-sm md:text-base transition-all duration-300 ${
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
              <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                ))}
              </div>
            )}
            
            {/* Videos Grid Skeleton */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <VideoCardSkeleton key={i} />
              ))}
            </motion.div>
          </motion.div>
        ) : filtering ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </motion.div>
        ) : filteredVideos.length === 0 ? (
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
              لا توجد فيديوهات
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              لا توجد فيديوهات في هذا التصنيف حالياً
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              key={selectedCategory}
            >
              {filteredVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  variants={itemVariants}
                  className="group relative cursor-pointer"
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  onClick={async () => {
                    // إذا كان المستخدم غير مسجل دخول
                    if (!isAuthenticated) {
                      setShowMessage({ type: "login", show: true });
                      return;
                    }

                    // إذا كان المستخدم غير مشترك، لا نسمح له بفتح الفيديو
                    if (!hasSubscription) {
                      setShowMessage({ type: "subscription", show: true });
                      return;
                    }

                    // إذا كان المستخدم مشترك، نحاول جلب videoUrl من private/source إذا لم يكن موجوداً
                    if (hasSubscription && db && auth?.currentUser) {
                      let finalVideoUrl = video.videoUrl || video.directVideoUrl;
                      
                      // إذا لم يكن videoUrl موجوداً، نحاول جلبه من private/source
                      if (!finalVideoUrl) {
                        try {
                          const privateSourceRef = doc(db, "videos", video.id, "private", "source");
                          const privateSourceDoc = await getDoc(privateSourceRef);
                          if (privateSourceDoc.exists()) {
                            const data = privateSourceDoc.data();
                            finalVideoUrl = data.url || "";
                          }
                        } catch (error: any) {
                          console.error("Error fetching video URL:", error);
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
                      
                      // تحديث videoUrl في الفيديو قبل فتحه
                      setSelectedVideo({
                        ...video,
                        videoUrl: finalVideoUrl,
                        directVideoUrl: finalVideoUrl,
                      });
                    } else {
                      // إذا لم يكن المستخدم مشترك، نفتح الفيديو (لكن لن يعمل بدون URL)
                    setSelectedVideo(video);
                    }
                  }}
                >
                  <div className="relative h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600">
                    {/* الصورة */}
                    <div className="relative overflow-hidden bg-gray-200 dark:bg-gray-700">
                      <div className="aspect-video relative">
                        <img
                          src={video.thumbnailUrl || video.thumbnail || "https://via.placeholder.com/400x225?text=فيديو"}
                          alt={video.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Play Button Overlay */}
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Play className="w-16 h-16 text-primary-600 fill-primary-600 drop-shadow-2xl" />
                        </motion.div>

                        {/* Duration Badge */}
                        {video.duration && (
                          <motion.div
                            className="absolute bottom-4 left-4 bg-black/90 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-xl"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <Clock className="w-4 h-4" />
                            {video.duration}
                          </motion.div>
                        )}


                      </div>
                    </div>

                    {/* المحتوى */}
                    <div className="p-4">
                      {/* التاريخ والمشاهدات */}
                      <div className="flex items-center gap-3 mb-3 text-xs text-gray-500 dark:text-gray-400">
                        {video.createdAt && (
                          <span className="flex items-center gap-1.5">
                            {new Date(video.createdAt.seconds * 1000 || video.createdAt).toLocaleDateString("ar-EG", {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            })}
                          </span>
                        )}
                        {video.date && !video.createdAt && (
                          <span>
                            {new Date(video.date).toLocaleDateString("ar-EG", {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            })}
                          </span>
                        )}
                        {video.views !== undefined && (
                          <>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span className="flex items-center gap-1.5">
                              <TrendingUp className="w-3.5 h-3.5" />
                              {video.views > 1000 ? `${(video.views / 1000).toFixed(1)}K` : video.views} مشاهدة
                            </span>
                          </>
                        )}
                      </div>

                      {/* العنوان والمستوى */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-lg font-bold flex-1 text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300 leading-tight">
                          {video.title}
                        </h3>
                        <span className="bg-primary-600 dark:bg-primary-700 text-white px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap flex-shrink-0">
                          {video.level}
                        </span>
                      </div>

                      {/* الوصف */}
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">
                        {video.description}
                      </p>
                    </div>

                    {/* Hover Effect Border */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-primary-500/0 group-hover:border-primary-500/30 transition-all duration-500 pointer-events-none"></div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <VideoPlayer
              videoUrl={selectedVideo.videoUrl}
              title={selectedVideo.title}
              thumbnailUrl={selectedVideo.thumbnailUrl || selectedVideo.thumbnail}
              onClose={() => setSelectedVideo(null)}
              directVideoUrl={selectedVideo.directVideoUrl}
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
                    يجب الاشتراك لمشاهدة هذا الفيديو. يرجى التواصل مع مستر عمر للاشتراك.
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
                    يجب تسجيل الدخول أولاً لمشاهدة الفيديوهات
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
                    رابط الفيديو غير متاح
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
                    عذراً، رابط الفيديو غير متاح حالياً. يرجى التواصل مع مستر عمر للحصول على المساعدة.
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
    </section>
  );
}
