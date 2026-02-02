"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BookOpen, Award, Users, GraduationCap, Sparkles, CheckCircle2 } from "lucide-react";

export default function AboutSection() {
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

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9, x: -50 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        duration: 0.7,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  const specializations = [
    { icon: BookOpen, text: "علم النحو والإعراب", color: "text-blue-500 bg-blue-50 dark:bg-blue-900/30" },
    { icon: Sparkles, text: "علم البلاغة", color: "text-purple-500 bg-purple-50 dark:bg-purple-900/30" },
    { icon: GraduationCap, text: "الأدب العربي والشعر", color: "text-green-500 bg-green-50 dark:bg-green-900/30" },
    { icon: Award, text: "النصوص الأدبية", color: "text-amber-500 bg-amber-50 dark:bg-amber-900/30" },
  ];

  const stats = [
    { number: "9+", label: "سنوات خبرة", icon: Award, gradient: "from-blue-500 to-blue-600" },
    { number: "500+", label: "طالب", icon: Users, gradient: "from-green-500 to-green-600" },
    { number: "100%", label: "رضا الطلاب", icon: CheckCircle2, gradient: "from-amber-500 to-amber-600" },
  ];

  return (
    <section id="about" className="py-20 md:py-28 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/80 via-white to-primary-100/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
      <div className="absolute inset-0 opacity-30 dark:opacity-10">
        <div className="absolute top-20 right-10 w-64 h-64 bg-primary-200 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-primary-300/50 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <motion.span
            className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-full text-sm font-semibold mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4" />
            تعرف على المعلم
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            عن الأستاذ <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">عمر عرفة</span>
          </h2>
          <motion.div
            className="w-24 h-1.5 bg-gradient-to-r from-primary-500 to-primary-600 mx-auto rounded-full"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
          {/* Image Section */}
          <motion.div
            className="relative"
            variants={imageVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="relative mx-auto max-w-md lg:max-w-lg">
              {/* Decorative elements */}
              <div className="absolute -inset-4 bg-gradient-to-br from-primary-400/20 via-primary-500/10 to-primary-600/20 rounded-3xl blur-2xl" />
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary-400/30 rounded-full blur-xl" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary-300/40 rounded-full blur-xl" />
              
              {/* Main Image Container */}
              <motion.div
                className="relative bg-gradient-to-br from-primary-100 to-primary-200 dark:from-gray-700 dark:to-gray-800 rounded-3xl p-2 shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                  <Image
                    src="/2026-02-02 12.12.34.jpg"
                    alt="الأستاذ عمر عرفة - مدرس اللغة العربية"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </div>

                {/* Floating Quote */}
                <motion.div
                  className="absolute -bottom-6 left-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base font-medium text-center leading-relaxed">
                    &ldquo;التعليم ليس ملء دلو، بل إشعال شعلة&rdquo;
                  </p>
                </motion.div>
              </motion.div>

              {/* Experience Badge */}
              <motion.div
                className="absolute -top-4 -left-4 md:-left-8 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-5 py-3 rounded-2xl shadow-lg"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, type: "spring" }}
              >
                <p className="text-2xl font-bold">+9</p>
                <p className="text-xs opacity-90">سنوات خبرة</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Content Section */}
          <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Bio Card */}
            <motion.div
              variants={itemVariants}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-10 h-10 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </span>
                الخبرة والتدريس
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-lg">
                مدرس لغة عربية بخبرة تزيد عن <span className="text-primary-600 dark:text-primary-400 font-bold">9 سنوات</span> في تدريس اللغة العربية بجميع فروعها. متخصص في النحو والبلاغة والأدب والنصوص والقراءة.
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                أهتم بتقديم المحتوى التعليمي بطريقة <span className="text-primary-600 dark:text-primary-400 font-semibold">سهلة ومبسطة</span> تناسب جميع المستويات، مع التركيز على الفهم العميق والتطبيق العملي.
              </p>
            </motion.div>

            {/* Specializations */}
            <motion.div variants={itemVariants}>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">التخصصات</h4>
              <div className="grid grid-cols-2 gap-3">
                {specializations.map((spec, index) => (
                  <motion.div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-xl ${spec.color} transition-all duration-300`}
                    whileHover={{ scale: 1.03, x: 5 }}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <spec.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{spec.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-4"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="relative group"
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl`} />
                  <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-lg border border-gray-100 dark:border-gray-700 group-hover:border-primary-200 dark:group-hover:border-primary-800 transition-colors">
                    <div className={`w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <motion.p
                      className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                    >
                      {stat.number}
                    </motion.p>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {stat.label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div variants={itemVariants} className="pt-4">
              <motion.a
                href="/contact"
                className="inline-flex items-center gap-2 btn-primary text-lg px-8 py-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Users className="w-5 h-5" />
                تواصل مع الأستاذ
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
