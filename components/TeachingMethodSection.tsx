"use client";

import { Target, Lightbulb, Users, BookOpen, CheckCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function TeachingMethodSection() {
  const methods = [
    {
      icon: Target,
      title: "التدريس الهادف",
      description: "أركز على تحقيق أهداف تعليمية واضحة لكل درس",
    },
    {
      icon: Lightbulb,
      title: "الشرح المبسط",
      description: "أشرح المفاهيم المعقدة بطريقة سهلة ومبسطة",
    },
    {
      icon: Users,
      title: "التفاعل المستمر",
      description: "أشجع الطلاب على المشاركة والتفاعل في كل درس",
    },
    {
      icon: BookOpen,
      title: "التطبيق العملي",
      description: "أربط النظرية بالتطبيق من خلال أمثلة عملية",
    },
  ];

  const methodology = [
    "استخدام أحدث طرق التدريس التفاعلية",
    "ربط المحتوى بالواقع العملي",
    "توفير مواد تعليمية متنوعة (فيديوهات، اختبارات، تمارين)",
    "متابعة مستمرة لتقدم الطلاب",
    "توفير بيئة تعليمية محفزة ومشجعة",
    "مراعاة الفروقات الفردية بين الطلاب",
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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  return (
    <section className="section-padding bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto container-padding">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 px-4 py-2 rounded-full mb-6"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ margin: "-50px" }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-primary-DEFAULT" />
            <span className="text-primary-DEFAULT font-semibold text-sm">
              أسلوب التدريس
            </span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            المنهجية والأسلوب
          </h2>
          <motion.div
            className="w-32 h-1.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 mx-auto rounded-full mb-6"
            initial={{ width: 0 }}
            whileInView={{ width: 128 }}
            viewport={{ margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
          ></motion.div>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            أتبع منهجية تعليمية متكاملة تركز على الفهم العميق والتطبيق العملي
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ margin: "-50px" }}
        >
          {methods.map((method, index) => {
            const Icon = method.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="card p-6 text-center group hover:border-primary-300 dark:hover:border-primary-700"
                whileHover={{ y: -8, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="bg-primary-100 dark:bg-primary-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Icon className="w-8 h-8 text-primary-DEFAULT" />
                </motion.div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                  {method.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {method.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            className="card p-8 md:p-10"
            whileHover={{ y: -5, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">
              مميزات المنهجية التعليمية
            </h3>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ margin: "-50px" }}
            >
              {methodology.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  whileHover={{ x: 5, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ margin: "-50px" }}
                    transition={{ delay: index * 0.05, type: "spring" }}
                  >
                    <CheckCircle className="w-5 h-5 text-primary-DEFAULT flex-shrink-0 mt-0.5" />
                  </motion.div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">{item}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
