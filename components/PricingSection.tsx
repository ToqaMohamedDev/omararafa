"use client";

import { Check, Star, BookOpen, Users, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function PricingSection() {
  const plans = [
    {
      name: "الباقة الأساسية",
      price: "500",
      period: "شهرياً",
      description: "مناسبة للمبتدئين والطلاب في المراحل الأولى",
      features: [
        "10 دروس فيديو شهرياً",
        "5 اختبارات تفاعلية",
        "متابعة أسبوعية",
        "مواد تعليمية أساسية",
        "دعم عبر البريد الإلكتروني",
      ],
      popular: false,
      icon: BookOpen,
    },
    {
      name: "الباقة المتوسطة",
      price: "800",
      period: "شهرياً",
      description: "مناسبة للطلاب في المراحل المتوسطة",
      features: [
        "20 دروس فيديو شهرياً",
        "10 اختبارات تفاعلية",
        "متابعة أسبوعية مكثفة",
        "مواد تعليمية شاملة",
        "دعم فوري عبر الواتساب",
        "جلسات تقييم شهرية",
      ],
      popular: true,
      icon: Users,
    },
    {
      name: "الباقة المتقدمة",
      price: "1200",
      period: "شهرياً",
      description: "مناسبة للطلاب المتقدمين والجامعيين",
      features: [
        "دروس فيديو غير محدودة",
        "اختبارات غير محدودة",
        "متابعة يومية",
        "مواد تعليمية متخصصة",
        "دعم فوري 24/7",
        "جلسات تقييم أسبوعية",
        "دروس خصوصية (ساعتين شهرياً)",
        "شهادة إتمام معتمدة",
      ],
      popular: false,
      icon: Star,
    },
  ];

  const courses = [
    {
      title: "دورة النحو الشاملة",
      duration: "40 ساعة",
      price: "2000",
      level: "جميع المستويات",
    },
    {
      title: "دورة النصوص والقراءة",
      duration: "35 ساعة",
      price: "1800",
      level: "متوسط - متقدم",
    },
    {
      title: "دورة البلاغة العربية",
      duration: "30 ساعة",
      price: "1500",
      level: "متقدم",
    },
    {
      title: "دورة الأدب العربي",
      duration: "45 ساعة",
      price: "2200",
      level: "متوسط - متقدم",
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
            الأسعار والاشتراكات
          </h2>
          <motion.div
            className="w-32 h-1.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 mx-auto rounded-full mb-6"
            initial={{ width: 0 }}
            whileInView={{ width: 128 }}
            viewport={{ margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          ></motion.div>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            اختر الباقة التي تناسبك أو سجل في إحدى الدورات المتخصصة
          </p>
        </motion.div>

        {/* الباقات الشهرية */}
        <div className="mb-16">
          <motion.h3
            className="text-2xl font-bold mb-8 text-center text-gray-900 dark:text-white"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            الباقات الشهرية
          </motion.h3>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ margin: "-100px" }}
          >
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={`card p-8 relative group ${
                    plan.popular
                      ? "border-2 border-primary-DEFAULT scale-105 md:scale-110"
                      : ""
                  }`}
                  whileHover={{ y: -10, scale: plan.popular ? 1.12 : 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {plan.popular && (
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
                      {plan.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {plan.description}
                    </p>
                    <div className="mb-4">
                      <motion.span
                        className="text-4xl font-bold text-primary-DEFAULT"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ margin: "-50px" }}
                        transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                      >
                        {plan.price}
                      </motion.span>
                      <span className="text-gray-600 dark:text-gray-400 mr-2">جنيه</span>
                      <span className="text-sm text-gray-500 dark:text-gray-500 block mt-1">
                        {plan.period}
                      </span>
                    </div>
                  </div>
                  <motion.ul
                    className="space-y-3 mb-6"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ margin: "-50px" }}
                  >
                    {plan.features.map((feature, idx) => (
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
                    className="w-full btn-primary py-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    اشترك الآن
                  </motion.button>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* الدورات المتخصصة */}
        <div>
          <motion.h3
            className="text-2xl font-bold mb-8 text-center text-gray-900 dark:text-white"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            الدورات المتخصصة
          </motion.h3>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ margin: "-50px" }}
          >
            {courses.map((course, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="card p-6 group hover:border-primary-300 dark:hover:border-primary-700"
                whileHover={{ y: -8, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-primary-DEFAULT transition-colors">
                  {course.title}
                </h4>
                <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{course.level}</span>
                  </div>
                </div>
                <div className="mb-4">
                  <motion.span
                    className="text-3xl font-bold text-primary-DEFAULT"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ margin: "-50px" }}
                    transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                  >
                    {course.price}
                  </motion.span>
                  <span className="text-gray-600 dark:text-gray-400 mr-2">جنيه</span>
                </div>
                <motion.button
                  className="w-full btn-secondary py-2.5 text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  سجل في الدورة
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
