"use client";

import { useState, useEffect } from "react";
import { Phone, MapPin, Clock, Send, CheckCircle, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { db } from "@/lib/firebase-client";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function ContactPage() {
  const { user, isAuthenticated } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // تعبئة البيانات من المستخدم إذا كان مسجل دخول
  useEffect(() => {
    if (user && isAuthenticated) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    if (!db) {
      setError("Firebase غير مهيأ. يرجى إعادة تحميل الصفحة.");
      setIsSubmitting(false);
      return;
    }

    try {
      // حفظ الرسالة في Firestore
      await addDoc(collection(db, "messages"), {
        userId: user?.uid || null,
        userName: formData.name,
        userEmail: formData.email,
        userPhone: formData.phone || "",
        subject: formData.subject,
        message: formData.message,
        createdAt: serverTimestamp(),
        read: false,
      });

      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (error: any) {
      console.error("Error submitting contact form:", error);
      setError(error.message || "حدث خطأ أثناء إرسال الرسالة");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "الهاتف",
      content: "01146525436",
      description: "اتصل بنا في أوقات العمل",
    },
    {
      icon: MapPin,
      title: "العنوان",
      content: "القاهرة، مصر",
      description: "القاهرة، مصر",
    },
    {
      icon: Clock,
      title: "أوقات العمل",
      content: "الأحد - الخميس",
      description: "9:00 صباحاً - 5:00 مساءً",
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
    <div className="container mx-auto container-padding page-padding">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
          تواصل معنا
        </h1>
        <motion.div
          className="w-32 h-1.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 mx-auto rounded-full mb-6"
          initial={{ width: 0 }}
          animate={{ width: 128 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        ></motion.div>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          نحن هنا لمساعدتك! تواصل مع الأستاذ عمر عرفة لأي استفسار أو سؤال
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* معلومات التواصل */}
        <div className="lg:col-span-1 space-y-4">
          <motion.div
            className="card p-6 mb-6"
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              معلومات التواصل
            </h2>
            <div className="space-y-4">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <motion.div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                    whileHover={{ x: 5, scale: 1.02 }}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ margin: "-50px" }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      className="bg-primary-100 dark:bg-primary-900 p-3 rounded-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Icon className="w-5 h-5 text-primary-DEFAULT" />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {info.title}
                      </h3>
                      <p className="text-primary-DEFAULT font-medium mb-1">
                        {info.content}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {info.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800 rounded-lg shadow-soft p-6"
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              معلومات الأستاذ
            </h3>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p>
                <strong className="text-primary-DEFAULT">الاسم:</strong> عمر عرفة
              </p>
              <p>
                <strong className="text-primary-DEFAULT">التخصص:</strong> مدرس لغة عربية
              </p>
              <p>
                <strong className="text-primary-DEFAULT">سنوات الخبرة:</strong> 9 سنوات
              </p>
            </div>
          </motion.div>
        </div>

        {/* نموذج التواصل */}
        <motion.div className="lg:col-span-2" variants={itemVariants}>
          <motion.div
            className="card p-8"
            whileHover={{ y: -5, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="bg-primary-100 dark:bg-primary-900 p-3 rounded-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <MessageSquare className="w-6 h-6 text-primary-DEFAULT" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                أرسل رسالة
              </h2>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                  >
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                  >
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                  >
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                    placeholder="01146525436"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                  >
                    موضوع الرسالة *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                    placeholder="موضوع الرسالة"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  الرسالة *
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none transition"
                  placeholder="اكتب رسالتك هنا بالتفصيل..."
                />
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    إرسال الرسالة
                  </>
                )}
              </motion.button>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 text-red-700 dark:text-red-300 px-4 py-4 rounded-lg"
                  >
                    <p className="font-semibold">{error}</p>
                  </motion.div>
                )}
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 text-green-700 dark:text-green-300 px-4 py-4 rounded-lg flex items-center gap-3"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", delay: 0.2 }}
                    >
                      <CheckCircle className="w-6 h-6 flex-shrink-0" />
                    </motion.div>
                    <div>
                      <p className="font-semibold">تم إرسال رسالتك بنجاح!</p>
                      <p className="text-sm">سنقوم بالرد عليك في أقرب وقت ممكن.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
