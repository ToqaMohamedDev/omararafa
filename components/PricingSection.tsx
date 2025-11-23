"use client";

import { Check, Star, BookOpen, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function PricingSection() {
  const courses = [
    {
      name: "كورس النحو الأساسي",
      description: "كورس شامل لتعلم قواعد النحو والإعراب من الصفر",
      features: [
        "شرح مفصل لقواعد النحو",
        "تمارين تفاعلية متنوعة",
        "أمثلة من القرآن الكريم والأدب",
        "إعراب الجمل والتراكيب",
        "اختبارات تقييمية دورية",
      ],
      popular: false,
      icon: BookOpen,
    },
    {
      name: "كورس البلاغة العربية",
      description: "تعلم المعاني والبيان والبديع بطريقة سهلة ومبسطة",
      features: [
        "شرح علم المعاني",
        "دراسة علم البيان",
        "تعلم علم البديع",
        "تحليل نصوص أدبية",
        "تمارين تطبيقية",
        "اختبارات شاملة",
      ],
      popular: true,
      icon: Users,
    },
    {
      name: "كورس النصوص والقراءة",
      description: "تحليل النصوص الأدبية والشعرية وفهم معانيها",
      features: [
        "تحليل النصوص الشعرية",
        "دراسة النصوص النثرية",
        "فهم المعاني والأفكار",
        "تحليل الأسلوب الأدبي",
        "تمارين على النصوص",
        "متابعة فردية",
      ],
      popular: false,
      icon: Star,
    },
  ];

  const specializedCourses = [
    {
      title: "كورس النحو المتقدم",
      level: "متقدم",
    },
    {
      title: "كورس الأدب العربي",
      level: "متوسط - متقدم",
    },
    {
      title: "كورس العروض والقافية",
      level: "متقدم",
    },
    {
      title: "كورس النقد الأدبي",
      level: "متقدم",
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
    <section className="section-padding bg-white dark:bg-gray-900">
      <div className="container mx-auto container-padding">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            الكورسات التعليمية
          </h2>
          <motion.div
            className="w-32 h-1.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 mx-auto rounded-full mb-6"
            initial={{ width: 0 }}
            whileInView={{ width: 128 }}
            viewport={{ margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          ></motion.div>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            اختر الكورس الذي يناسبك وابدأ رحلتك في تعلم اللغة العربية
          </p>
        </motion.div>

        {/* الكورسات الرئيسية */}
        <div className="mb-16">
          <motion.h3
            className="text-2xl font-bold mb-8 text-center text-gray-900 dark:text-white"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            الكورسات الرئيسية
          </motion.h3>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ margin: "-100px" }}
          >
            {courses.map((course, index) => {
              const Icon = course.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={`card p-8 relative group ${
                    course.popular
                      ? "border-2 border-primary-DEFAULT scale-105 md:scale-110"
                      : ""
                  }`}
                  whileHover={{ y: -10, scale: course.popular ? 1.12 : 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {course.popular && (
                    <motion.div
                      className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary-DEFAULT text-white px-4 py-1 rounded-full text-sm font-bold"
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ margin: "-50px" }}
                      transition={{ type: "spring", delay: 0.3 }}
                    >
                      الأكثر شعبية
                    </motion.div>
                  )}
                  <div className="text-center mb-6">
                    <motion.div
                      className="bg-primary-100 dark:bg-primary-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Icon className="w-8 h-8 text-primary-DEFAULT" />
                    </motion.div>
                    <h4 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                      {course.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {course.description}
                    </p>
                  </div>
                  <motion.ul
                    className="space-y-3 mb-6"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ margin: "-50px" }}
                  >
                    {course.features.map((feature, idx) => (
                      <motion.li
                        key={idx}
                        variants={itemVariants}
                        className="flex items-start gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ margin: "-50px" }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ margin: "-50px" }}
                          transition={{ delay: idx * 0.05 + 0.1, type: "spring" }}
                        >
                          <Check className="w-5 h-5 text-primary-DEFAULT flex-shrink-0 mt-0.5" />
                        </motion.div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </motion.li>
                    ))}
                  </motion.ul>
                  <motion.button
                    type="button"
                    className="w-full btn-primary py-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const message = encodeURIComponent(`أريد التسجيل في ${course.name}`);
                      window.open(`https://wa.me/2001146525436?text=${message}`, '_blank');
                    }}
                  >
                    سجل في الكورس
                  </motion.button>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* الكورسات المتخصصة */}
        <div>
          <motion.h3
            className="text-2xl font-bold mb-8 text-center text-gray-900 dark:text-white"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            الكورسات المتخصصة
          </motion.h3>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ margin: "-50px" }}
          >
            {specializedCourses.map((course, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="card p-6 group hover:border-primary-300 dark:hover:border-primary-700"
                whileHover={{ y: -8, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h4 className="text-xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-primary-DEFAULT transition-colors">
                  {course.title}
                </h4>
                <motion.button
                  type="button"
                  className="w-full btn-secondary py-2.5 text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const message = encodeURIComponent(`أريد التسجيل في ${course.title}`);
                    window.open(`https://wa.me/2001146525436?text=${message}`, '_blank');
                  }}
                >
                  سجل في الكورس
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
