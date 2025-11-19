"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function StatsSection() {
  const [videosCount, setVideosCount] = useState<number>(0);
  const [testsCount, setTestsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // جلب عدد الفيديوهات والاختبارات من Firebase
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // جلب عدد الفيديوهات
        const videosRes = await fetch("/api/videos");
        if (videosRes.ok) {
          const videosData = await videosRes.json();
          setVideosCount(videosData.videos?.length || 0);
        }

        // جلب عدد الاختبارات
        const testsRes = await fetch("/api/tests");
        if (testsRes.ok) {
          const testsData = await testsRes.json();
          setTestsCount(testsData.tests?.length || 0);
        }
      } catch (error) {
        console.error("Error fetching counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const stats = [
    {
      number: "7+",
      label: "سنوات خبرة",
      icon: "📚",
      description: "في تدريس اللغة العربية",
    },
    {
      number: "500+",
      label: "طالب",
      icon: "👥",
      description: "استفادوا من الدروس",
    },
    {
      number: loading ? "..." : `${videosCount}+`,
      label: "فيديو تعليمي",
      icon: "🎥",
      description: "محتوى تعليمي متاح",
    },
    {
      number: loading ? "..." : `${testsCount}+`,
      label: "اختبار",
      icon: "📝",
      description: "اختبار تفاعلي",
    },
  ];

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
    hidden: { opacity: 0, y: 30, scale: 0.9 },
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
    <section className="pt-8 md:pt-12 pb-16 md:pb-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto container-padding">
        <motion.div
          className="text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            إحصائيات الموقع
          </h2>
          <motion.div
            className="w-32 h-1.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 mx-auto rounded-full mb-4"
            initial={{ width: 0 }}
            whileInView={{ width: 128 }}
            viewport={{ margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          ></motion.div>
        </motion.div>
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ margin: "-100px" }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="card p-8 text-center group hover:border-primary-300 dark:hover:border-primary-700"
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className="text-5xl mb-4"
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {stat.icon}
              </motion.div>
              <motion.div
                className="text-5xl font-bold text-gradient mb-3"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ margin: "-50px" }}
                transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
              >
                {stat.number}
              </motion.div>
              <div className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {stat.label}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {stat.description}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
