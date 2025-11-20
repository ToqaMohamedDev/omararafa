"use client";

import { BookOpen, GraduationCap, Users, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

// Social Media Icons
const FacebookIcon = () => (
  <svg
    className="w-6 h-6"
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const YouTubeIcon = () => (
  <svg
    className="w-6 h-6"
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const TikTokIcon = () => (
  <svg
    className="w-6 h-6"
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

export default function HeroSection() {
  return (
    <motion.div
      className="text-center py-16 md:py-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="mb-12">
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 px-6 py-3 rounded-full mb-8"
        >
          <Sparkles className="w-4 h-4 text-primary-DEFAULT" />
          <span className="text-primary-DEFAULT font-semibold text-sm">
            مدرس لغة عربية
          </span>
        </motion.div>
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl font-bold mb-6 text-gray-900 dark:text-white leading-tight"
        >
          مرحباً بك في موقع
        </motion.h1>
        <motion.h2
          variants={itemVariants}
          className="text-4xl md:text-6xl font-bold mb-8 text-gradient"
        >
          الأستاذ عمر عرفة
        </motion.h2>
        <motion.div
          variants={itemVariants}
          className="w-40 h-1.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 mx-auto rounded-full mb-10"
        ></motion.div>
        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-6 max-w-3xl mx-auto leading-relaxed font-medium"
        >
          مدرس لغة عربية بخبرة تزيد عن 9 سنوات في تدريس اللغة العربية
        </motion.p>
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12"
        >
          متخصص في النحو والبلاغة والأدب والنصوص والقراءة - تعلم بطريقة سهلة ومبسطة
        </motion.p>
      </div>

      <motion.div
        variants={itemVariants}
        className="flex flex-wrap justify-center gap-4 mb-12"
      >
        <motion.a
          href="/tests"
          className="btn-primary text-lg px-10 py-4 flex items-center gap-3 group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <BookOpen className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          ابدأ الاختبارات
        </motion.a>
        <motion.a
          href="/videos"
          className="btn-secondary text-lg px-10 py-4 flex items-center gap-3 group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <GraduationCap className="w-5 h-5 group-hover:scale-110 transition-transform" />
          شاهد الفيديوهات
        </motion.a>
        <motion.a
          href="/contact"
          className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-10 py-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-semibold text-lg shadow-soft hover:shadow-medium flex items-center gap-3 group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
          تواصل معنا
        </motion.a>
      </motion.div>

      {/* Social Media Links */}
      <motion.div
        variants={itemVariants}
        className="mb-8"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg font-medium">
          تابعنا على
        </p>
        <div className="flex items-center justify-center gap-6">
          {[
            {
              name: "فيسبوك",
              url: "https://www.facebook.com/p/%D8%A3%D8%B9%D9%85%D8%B1-%D8%B9%D8%B1%D9%81%D8%A9-mrOmar-Arafa-100083062796232/",
              icon: FacebookIcon,
              color: "hover:text-blue-500",
            },
            {
              name: "يوتيوب",
              url: "https://www.youtube.com/@omararafa-arabic/videos",
              icon: YouTubeIcon,
              color: "hover:text-red-500",
            },
            {
              name: "تيك توك",
              url: "https://www.tiktok.com/@omararafa95?_r=1&_t=ZS-91VQTjRLq6b",
              icon: TikTokIcon,
              color: "hover:text-black dark:hover:text-white",
            },
            {
              name: "واتساب",
              url: "https://wa.me/201146525436",
              icon: WhatsAppIcon,
              color: "hover:text-green-500",
            },
          ].map((social, index) => {
            const IconComponent = social.icon;
            return (
              <motion.a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                whileHover={{ scale: 1.15, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className={`text-gray-600 dark:text-gray-400 ${social.color} transition-all duration-300 cursor-pointer bg-white dark:bg-gray-800 p-3 rounded-full shadow-md hover:shadow-lg`}
                aria-label={social.name}
              >
                <IconComponent />
              </motion.a>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
