"use client";

import { motion } from "framer-motion";

export default function AboutSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  return (
    <section className="py-16 bg-gradient-to-br from-primary-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              عن الأستاذ عمر عرفة
            </h2>
            <motion.div
              className="w-24 h-1 bg-primary-DEFAULT mx-auto rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: 96 }}
              viewport={{ margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
            ></motion.div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ margin: "-50px" }}
          >
            <motion.div className="space-y-6" variants={itemVariants}>
              <motion.div
                className="card p-6"
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="text-2xl font-semibold mb-4 text-primary-DEFAULT">
                  الخبرة والتدريس
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  مدرس لغة عربية بخبرة تزيد عن 9 سنوات في تدريس اللغة العربية
                  بجميع فروعها. متخصص في النحو والبلاغة والأدب والنصوص والقراءة.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  أهتم بتقديم المحتوى التعليمي بطريقة سهلة ومبسطة تناسب جميع المستويات،
                  مع التركيز على الفهم العميق والتطبيق العملي.
                </p>
              </motion.div>

              <motion.div
                className="grid grid-cols-2 gap-4"
                variants={itemVariants}
              >
                {[
                  { number: "9+", label: "سنوات خبرة" },
                  { number: "500+", label: "طالب" },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="card p-4 text-center"
                    whileHover={{ scale: 1.05, y: -3 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      className="text-3xl font-bold text-primary-DEFAULT mb-2"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ margin: "-50px" }}
                      transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
                    >
                      {stat.number}
                    </motion.div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div className="space-y-4" variants={itemVariants}>
              <motion.div
                className="card p-6"
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  التخصصات
                </h3>
                <motion.ul
                  className="space-y-3"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ margin: "-50px" }}
                >
                  {[
                    "علم النحو والإعراب",
                    "علم البلاغة (المعاني والبيان والبديع)",
                    "الأدب العربي والشعر",
                    "النصوص الأدبية والشعرية",
                    "القراءة والفهم",
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      variants={itemVariants}
                      className="flex items-center text-gray-700 dark:text-gray-300"
                    >
                      <motion.span
                        className="w-2 h-2 bg-primary-DEFAULT rounded-full ml-3"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ margin: "-50px" }}
                        transition={{ delay: index * 0.1 }}
                      ></motion.span>
                      {item}
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>

              <motion.div
                className="card p-6"
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  المؤهلات
                </h3>
                <motion.div
                  className="space-y-2 text-gray-700 dark:text-gray-300"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ margin: "-50px" }}
                >
                  {[
                    "شهادات في طرق التدريس الحديثة",
                    "خبرة في التعليم الإلكتروني",
                  ].map((item, index) => (
                    <motion.p
                      key={index}
                      variants={itemVariants}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ margin: "-50px" }}
                      transition={{ delay: index * 0.1 }}
                    >
                      • {item}
                    </motion.p>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
