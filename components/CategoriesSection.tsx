"use client";

import { motion } from "framer-motion";

export default function CategoriesSection() {
  const categories = [
    {
      title: "النحو",
      description: "تعلم قواعد النحو والإعراب بطريقة سهلة",
      icon: "📖",
      color: "from-primary-400 to-primary-600",
      count: 25,
    },
    {
      title: "الصرف",
      description: "فهم الأوزان والصيغ في اللغة العربية",
      icon: "🔤",
      color: "from-primary-500 to-primary-700",
      count: 20,
    },
    {
      title: "البلاغة",
      description: "المعاني والبيان والبديع",
      icon: "✨",
      color: "from-primary-600 to-primary-800",
      count: 18,
    },
    {
      title: "الأدب",
      description: "الشعر والنثر والأدب العربي",
      icon: "📜",
      color: "from-primary-700 to-primary-900",
      count: 15,
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
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  return (
    <section className="py-16 bg-surface-light dark:bg-surface-dark">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            التخصصات التعليمية
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            اختر التخصص الذي تريد تعلمه واستكشف المحتوى التعليمي المتاح
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ margin: "-50px" }}
        >
          {categories.map((category, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="card p-6 group"
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className={`w-16 h-16 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center text-3xl mb-4 mx-auto`}
                whileHover={{ scale: 1.15, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {category.icon}
              </motion.div>
              <h3 className="text-xl font-semibold text-center mb-2 text-gray-900 dark:text-white group-hover:text-primary-DEFAULT transition-colors">
                {category.title}
              </h3>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                {category.description}
              </p>
              <div className="text-center">
                <motion.span
                  className="inline-block bg-primary-100 dark:bg-primary-900 text-primary-DEFAULT px-3 py-1 rounded-full text-sm font-semibold"
                  whileHover={{ scale: 1.1 }}
                >
                  {category.count} درس
                </motion.span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
