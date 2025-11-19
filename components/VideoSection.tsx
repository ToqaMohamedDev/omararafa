"use client";

import { useState, useEffect } from "react";
import { Play, Clock, Eye, BookOpen, X, Sparkles, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import VideoPlayer from "./VideoPlayer";
import { db } from "@/lib/firebase-client";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

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
  }, []);

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

  const filteredVideos =
    selectedCategory === "all"
      ? videosWithCategoryNames
      : videosWithCategoryNames.filter((video) => video.category === selectedCategory);

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
                onClick={() => setSelectedCategory(category.id)}
                className={`relative px-6 md:px-8 py-3 md:py-3.5 rounded-full font-semibold text-sm md:text-base transition-all duration-300 ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-xl shadow-primary-500/50 dark:shadow-primary-500/30 ring-4 ring-primary-400/30 dark:ring-primary-600/30 scale-105"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-500 hover:scale-105"
                }`}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: selectedCategory === category.id ? 1.05 : 1 }}
                transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
              >
                {category.name}
                {selectedCategory === category.id && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 opacity-20 blur-xl"
                    layoutId="activeCategory"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}

        {loading ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-6"
            >
              <div className="w-16 h-16 border-4 border-primary-200 dark:border-primary-900 border-t-primary-600 rounded-full"></div>
            </motion.div>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">جاري تحميل الفيديوهات...</p>
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
                  onClick={() => {
                    setSelectedVideo(video);
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

                        {/* Level Badge */}
                        <motion.div
                          className="absolute top-4 left-4"
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1, type: "spring" }}
                        >
                          <span className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-lg backdrop-blur-sm border border-primary-400/30">
                            {video.level}
                          </span>
                        </motion.div>

                        {/* Views Badge */}
                        {video.views !== undefined && (
                          <motion.div
                            className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-lg"
                            initial={{ opacity: 0, x: 10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {video.views > 1000 ? `${(video.views / 1000).toFixed(1)}K` : video.views}
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

                      {/* العنوان */}
                      <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300 leading-tight">
                        {video.title}
                      </h3>

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

        {/* رسالة عدم وجود فيديوهات */}
        {!loading && filteredVideos.length === 0 && (
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
    </section>
  );
}
