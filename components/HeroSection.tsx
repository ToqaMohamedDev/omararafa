"use client";

import Image from "next/image";
import { BookOpen, GraduationCap, Users, Sparkles, Star, Award, Clock, Play, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

// Social Media Icons
const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const YouTubeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const TikTokIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.375a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

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
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

const socialLinks = [
  { name: "فيسبوك", url: "https://www.facebook.com/p/%D8%A3%D8%B9%D9%85%D8%B1-%D8%B9%D8%B1%D9%81%D8%A9-mrOmar-Arafa-100083062796232/", icon: FacebookIcon, color: "hover:bg-blue-500" },
  { name: "يوتيوب", url: "https://www.youtube.com/@omararafa-arabic/videos", icon: YouTubeIcon, color: "hover:bg-red-500" },
  { name: "تيك توك", url: "https://www.tiktok.com/@omararafa95?_r=1&_t=ZS-91VQTjRLq6b", icon: TikTokIcon, color: "hover:bg-gray-900 dark:hover:bg-white dark:hover:text-gray-900" },
  { name: "واتساب", url: "https://wa.me/2001146525436", icon: WhatsAppIcon, color: "hover:bg-green-500" },
];

const stats = [
  { number: "9+", label: "سنوات خبرة", icon: Clock },
  { number: "500+", label: "طالب", icon: Users },
  { number: "5.0", label: "تقييم", icon: Star },
];

export default function HeroSection() {
  return (
    <motion.section
      className="relative min-h-screen flex items-center overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-12 -my-12 md:-my-16"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Full Background with Image */}
      <div className="absolute inset-0">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/70 to-white dark:via-gray-900/80 dark:to-gray-900 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/50 dark:from-gray-900 dark:to-gray-900/50 z-10" />
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 z-0" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-primary-400/15 rounded-full blur-[100px] z-0" />
        
        {/* Animated Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] z-0">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FF6B35' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
      </div>

      {/* Main Content Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center min-h-screen py-20">
          
          {/* Text Content - Right Side */}
          <div className="lg:col-span-5 xl:col-span-5 order-2 lg:order-1 text-center lg:text-right">
            {/* Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500/10 to-primary-600/10 dark:from-primary-500/20 dark:to-primary-600/20 backdrop-blur-sm border border-primary-200 dark:border-primary-800 px-4 py-2 rounded-full mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              <span className="text-primary-700 dark:text-primary-300 font-semibold text-sm">
                مدرس لغة عربية معتمد
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold mb-3 text-gray-900 dark:text-white leading-[1.1]"
            >
              مرحباً بك في موقع
            </motion.h1>

            <motion.h2
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold mb-6"
            >
              <span className="relative">
                <span className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 bg-clip-text text-transparent">
                  الأستاذ عمر عرفة
                </span>
                <motion.span
                  className="absolute -bottom-2 right-0 w-full h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                  initial={{ scaleX: 0, originX: 1 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                />
              </span>
            </motion.h2>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed max-w-lg mx-auto lg:mx-0"
            >
              خبرة <span className="text-primary-600 dark:text-primary-400 font-bold">+9 سنوات</span> في تدريس اللغة العربية بأساليب حديثة ومبتكرة
            </motion.p>

            {/* Specializations Tags */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-center lg:justify-start gap-2 mb-8"
            >
              {["النحو", "البلاغة", "الأدب", "النصوص"].map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700"
                >
                  {tag}
                </span>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8"
            >
              <motion.a
                href="/tests"
                className="group relative overflow-hidden bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary-500/25 hover:shadow-2xl hover:shadow-primary-500/30 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  ابدأ الاختبارات
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.a>
              
              <motion.a
                href="/videos"
                className="group flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold text-lg text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 text-primary-600 dark:text-primary-400 mr-[-2px]" fill="currentColor" />
                </span>
                شاهد الفيديوهات
              </motion.a>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              variants={itemVariants}
              className="flex justify-center lg:justify-start gap-6 mb-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <stat.icon className="w-4 h-4 text-primary-500" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{stat.number}</span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Social Links */}
            <motion.div variants={itemVariants} className="flex items-center justify-center lg:justify-start gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">تابعنا:</span>
              <div className="flex gap-2">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + index * 0.1 }}
                      whileHover={{ scale: 1.15, y: -2 }}
                      className={`w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 ${social.color} hover:text-white transition-all duration-300 border border-gray-200 dark:border-gray-700`}
                      aria-label={social.name}
                    >
                      <IconComponent />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Image Section - Left Side (Takes more space) */}
          <motion.div
            className="lg:col-span-7 xl:col-span-7 order-1 lg:order-2 relative flex justify-center lg:justify-end items-center"
            variants={imageVariants}
          >
            <div className="relative w-full max-w-[500px] lg:max-w-none lg:w-[110%] xl:w-[115%] lg:-ml-8">
              {/* Glow Effect Behind Image */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400/40 via-primary-500/30 to-primary-600/40 rounded-full blur-[80px] scale-75" />
              
              {/* Decorative Circles */}
              <motion.div
                className="absolute top-10 right-10 w-20 h-20 rounded-full border-4 border-primary-200/50 dark:border-primary-700/30"
                animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute bottom-20 left-0 w-16 h-16 rounded-full bg-primary-500/20 dark:bg-primary-500/10"
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute top-1/3 left-5 w-8 h-8 rounded-full bg-amber-400/30"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Main Image */}
              <motion.div
                className="relative aspect-[3/4] lg:aspect-[4/5]"
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image
                  src="/omararafaarabic.png"
                  alt="الأستاذ عمر عرفة - مدرس لغة عربية"
                  fill
                  className="object-contain object-center drop-shadow-[0_20px_50px_rgba(255,107,53,0.3)]"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 60vw, 55vw"
                />
              </motion.div>

              {/* Floating Badge - Rating */}
              <motion.div
                className="absolute top-[15%] right-0 lg:right-[5%] bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm font-bold text-gray-800 dark:text-white">تقييم ممتاز</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">من جميع الطلاب</p>
              </motion.div>

              {/* Floating Badge - Experience */}
              <motion.div
                className="absolute bottom-[20%] left-0 lg:left-[5%] bg-gradient-to-br from-primary-500 to-primary-600 text-white px-5 py-4 rounded-2xl shadow-2xl"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  <div>
                    <p className="text-xl font-bold">+9 سنوات</p>
                    <p className="text-xs opacity-90">خبرة في التدريس</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Badge - Students */}
              <motion.div
                className="absolute bottom-[5%] right-[10%] bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">+500</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">طالب متميز</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
      >
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 flex justify-center pt-2"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-primary-500"
            animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
