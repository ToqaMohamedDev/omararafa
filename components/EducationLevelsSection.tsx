"use client";

import { GraduationCap, BookOpen, Users, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function EducationLevelsSection() {
  const levels = [
    {
      title: "المرحلة الإعدادية",
      description: "من الصف الأول إلى الصف الثالث الإعدادي",
      icon: GraduationCap,
      color: "from-primary-500 to-primary-600",
      subjects: ["النحو المتقدم", "الصرف", "البلاغة", "الأدب"],
    },
    {
      title: "المرحلة الثانوية",
      description: "من الصف الأول إلى الصف الثالث الثانوي",
      icon: Award,
      color: "from-primary-600 to-primary-700",
      subjects: ["النحو الشامل", "الصرف المتقدم", "البلاغة الكاملة", "الأدب والنقد"],
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
            المراحل الدراسية
          </h2>
          <motion.div
            className="w-32 h-1.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 mx-auto rounded-full mb-6"
            initial={{ width: 0 }}
            whileInView={{ width: 128 }}
            viewport={{ margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          ></motion.div>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            أقدم دروساً شاملة في اللغة العربية لجميع المراحل الدراسية
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ margin: "-100px" }}
        >
          {levels.map((level, index) => {
            const Icon = level.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="card p-6 group hover:border-primary-300 dark:hover:border-primary-700"
                whileHover={{ y: -10, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${level.color} flex items-center justify-center mb-4 mx-auto shadow-lg`}
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Icon className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-center mb-2 text-gray-900 dark:text-white group-hover:text-primary-DEFAULT transition-colors">
                  {level.title}
                </h3>
                <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-4">
                  {level.description}
                </p>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 mb-2">
                    المواد المغطاة:
                  </p>
                  <motion.ul
                    className="space-y-1.5"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ margin: "-50px" }}
                  >
                    {level.subjects.map((subject, idx) => (
                      <motion.li
                        key={idx}
                        variants={itemVariants}
                        className="flex items-center text-sm text-gray-700 dark:text-gray-300"
                      >
                        <motion.span
                          className="w-1.5 h-1.5 bg-primary-DEFAULT rounded-full ml-2"
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ margin: "-50px" }}
                          transition={{ delay: idx * 0.05 }}
                        ></motion.span>
                        {subject}
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
