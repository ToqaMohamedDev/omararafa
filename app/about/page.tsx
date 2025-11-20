"use client";

import { GraduationCap, Award, BookOpen, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
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

  const cards = [
    {
      icon: GraduationCap,
      title: "رسالتنا",
      description:
        "نشر المعرفة والثقافة العربية بطريقة سهلة ومبسطة تناسب جميع المستويات التعليمية.",
    },
    {
      icon: Award,
      title: "رؤيتنا",
      description:
        "أن نكون المرجع الأول في تعليم اللغة العربية عبر الإنترنت للطلاب في جميع أنحاء العالم.",
    },
    {
      icon: BookOpen,
      title: "ما نقدمه",
      description:
        "فيديوهات تعليمية، اختبارات تفاعلية، دورات متخصصة، ومواد تعليمية شاملة في اللغة العربية.",
    },
    {
      icon: Users,
      title: "جمهورنا",
      description:
        "طلاب المدارس والجامعات، محبي اللغة العربية، والمعلمين الذين يبحثون عن موارد تعليمية إضافية.",
    },
  ];

  return (
    <div className="container mx-auto container-padding page-padding">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            عن الموقع
          </h1>
          <motion.div
            className="w-32 h-1 bg-primary-DEFAULT mx-auto rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 128 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          ></motion.div>
        </motion.div>

        <motion.div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="card p-8"
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h2 className="text-3xl font-bold mb-4 text-primary-DEFAULT">
              من نحن
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              موقع تعليمي متخصص في اللغة العربية، يقدم محتوى تعليمي شامل ومبسط
              لجميع المستويات. نهدف إلى نشر المعرفة والثقافة العربية من خلال
              دروس متخصصة في النحو والبلاغة والأدب والنصوص والقراءة.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              تحت إشراف الأستاذ عمر عرفة، مدرس لغة عربية بخبرة تزيد عن 9
              سنوات في تدريس اللغة العربية بجميع فروعها.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={containerVariants}
          >
            {cards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="card p-6"
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ margin: "-50px" }}
                    transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                  >
                    <Icon className="w-12 h-12 text-primary-DEFAULT mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {card.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800 rounded-lg shadow-soft p-8"
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              الأستاذ عمر عرفة
            </h2>
            <motion.div
              className="space-y-4 text-gray-700 dark:text-gray-300"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                "مدرس لغة عربية بخبرة تزيد عن 9 سنوات في تدريس اللغة العربية بجميع فروعها. متخصص في النحو والبلاغة والأدب والنصوص والقراءة.",
                "حاصل على شهادات في طرق التدريس الحديثة وخبرة واسعة في التعليم الإلكتروني.",
                "أهتم بتقديم المحتوى التعليمي بطريقة سهلة ومبسطة تناسب جميع المستويات، مع التركيز على الفهم العميق والتطبيق العملي.",
              ].map((text, index) => (
                <motion.p
                  key={index}
                  variants={itemVariants}
                  className="text-lg"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  {text}
                </motion.p>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
