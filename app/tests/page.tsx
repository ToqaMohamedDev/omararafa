"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/hooks/useSession";
import { Clock, FileText, Award, CheckCircle, XCircle, ArrowRight, ArrowLeft, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface Test {
  id: string;
  title: string;
  description: string;
  duration: string;
  questions: number;
  category: string;
  level: string;
  questionsData: Question[];
}

export default function TestsPage() {
  const { user, isAuthenticated, loading: sessionLoading } = useSession();
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // محاولة جلب الاختبارات من Firebase
    const fetchTests = async () => {
      try {
        const response = await fetch("/api/tests");
        if (response.ok) {
          const data = await response.json();
          if (data.tests && data.tests.length > 0) {
            setTests(data.tests);
          } else {
            setTests([]); // لا بيانات افتراضية
          }
        } else {
          setTests([]); // لا بيانات افتراضية
        }
      } catch (error) {
        console.error("Error fetching tests:", error);
        setTests([]); // لا بيانات افتراضية
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const currentTest = tests.find((t) => t.id === selectedTest);
  const currentQ = currentTest?.questionsData[currentQuestion];

  const handleAnswer = (answerIndex: number) => {
    setAnswers({ ...answers, [currentQuestion]: answerIndex });
  };

  const handleNext = async () => {
    if (currentQuestion < (currentTest?.questionsData.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
      
      // حفظ النتيجة في Firebase
      if (user?.uid && selectedTest && currentTest) {
        const score = calculateScore();
        try {
          await fetch("/api/tests/results", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.uid,
              testId: selectedTest,
              score: score.correct,
              percentage: score.percentage,
              answers: answers,
            }),
          });
        } catch (error) {
          console.error("Error saving test result:", error);
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    if (!currentTest) return { correct: 0, total: 0, percentage: 0 };
    let correct = 0;
    currentTest.questionsData.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correct++;
      }
    });
    const total = currentTest.questionsData.length;
    const percentage = Math.round((correct / total) * 100);
    return { correct, total, percentage };
  };

  const resetTest = () => {
    setSelectedTest(null);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setTestStarted(false);
  };

  // إظهار loading أثناء تحميل session
  if (sessionLoading) {
    return (
      <div className="container mx-auto container-padding py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-DEFAULT mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري التحقق من المصادقة...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto container-padding py-16">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            className="card p-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <FileText className="w-20 h-20 text-primary-DEFAULT mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              صفحة الاختبارات
            </h1>
            <p className="text-lg mb-8 text-gray-600 dark:text-gray-400">
              يجب تسجيل الدخول للوصول إلى الاختبارات التعليمية
            </p>
            <motion.a
              href="/auth/login"
              className="inline-block btn-primary px-8 py-4 text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              تسجيل الدخول
            </motion.a>
          </motion.div>
        </div>
      </div>
    );
  }

  if (showResults && currentTest) {
    const score = calculateScore();
    return (
      <div className="container mx-auto container-padding py-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="card p-8 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  score.percentage >= 70
                    ? "bg-primary-100 dark:bg-primary-900"
                    : score.percentage >= 50
                    ? "bg-primary-200 dark:bg-primary-800"
                    : "bg-primary-300 dark:bg-primary-700"
                }`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.3 }}
              >
                <Award
                  className={`w-12 h-12 ${
                    score.percentage >= 70
                      ? "text-primary-600 dark:text-primary-400"
                      : score.percentage >= 50
                      ? "text-primary-700 dark:text-primary-300"
                      : "text-primary-800 dark:text-primary-200"
                  }`}
                />
              </motion.div>
              <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                نتائج الاختبار
              </h2>
              <motion.div
                className="text-5xl font-bold text-primary-DEFAULT mb-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.4 }}
              >
                {score.percentage}%
              </motion.div>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {score.correct} من {score.total} إجابة صحيحة
              </p>
            </motion.div>

            <motion.div
              className="space-y-4 mb-8"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {currentTest.questionsData.map((q, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === q.correctAnswer;
                return (
                  <motion.div
                    key={q.id}
                    className={`p-4 rounded-lg border-2 ${
                      isCorrect
                        ? "bg-primary-50 dark:bg-primary-900/20 border-primary-500"
                        : "bg-gray-100 dark:bg-gray-700/50 border-gray-400 dark:border-gray-500"
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: -5 }}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
                      >
                        {isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1" />
                        ) : (
                          <XCircle className="w-6 h-6 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-1" />
                        )}
                      </motion.div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white mb-2">
                          {q.question}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          إجابتك: {q.options[userAnswer]}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            الإجابة الصحيحة: {q.options[q.correctAnswer]}
                          </p>
                        )}
                        {q.explanation && (
                          <p className="text-sm bg-white dark:bg-gray-700 p-2 rounded text-gray-700 dark:text-gray-300">
                            <strong>شرح:</strong> {q.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            <motion.div
              className="flex gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button
                onClick={resetTest}
                className="btn-primary px-6 py-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                اختبار آخر
              </motion.button>
              <motion.button
                onClick={() => {
                  setShowResults(false);
                  setCurrentQuestion(0);
                  setAnswers({});
                }}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                إعادة المحاولة
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (testStarted && currentTest && currentQ) {
    return (
      <div className="container mx-auto container-padding py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="card p-6 mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                السؤال {currentQuestion + 1} من {currentTest.questionsData.length}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentTest.title}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-primary-DEFAULT h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentQuestion + 1) / currentTest.questionsData.length) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              ></motion.div>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              className="card p-8 mb-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                {currentQ.question}
              </h2>

              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`w-full text-right p-4 rounded-lg border-2 transition-all ${
                      answers[currentQuestion] === index
                        ? "border-primary-DEFAULT bg-primary-50 dark:bg-primary-900/20 text-primary-DEFAULT font-semibold"
                        : "border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    }`}
                    whileHover={{ scale: 1.02, x: -5 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <span className="ml-2 font-semibold">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <motion.div
            className="flex justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: currentQuestion === 0 ? 1 : 1.05 }}
              whileTap={{ scale: currentQuestion === 0 ? 1 : 0.95 }}
            >
              <ArrowRight className="w-5 h-5" />
              السابق
            </motion.button>
            <motion.button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 rounded-lg btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {currentQuestion === currentTest.questionsData.length - 1
                ? "إنهاء الاختبار"
                : "التالي"}
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

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

  if (loading) {
    return (
      <div className="container mx-auto container-padding py-16">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary-DEFAULT border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto container-padding py-8">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
          الاختبارات التعليمية
        </h1>
        <motion.div
          className="w-32 h-1.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 mx-auto rounded-full mb-6"
          initial={{ width: 0 }}
          animate={{ width: 128 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        ></motion.div>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          مرحباً {user?.name}، اختر الاختبار الذي تريد أداءه واختبر معرفتك في اللغة العربية
        </p>
      </motion.div>

      {tests.length === 0 ? (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          </motion.div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            لا توجد اختبارات متاحة حالياً
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {tests.map((test, index) => (
            <motion.div
              key={test.id}
              variants={itemVariants}
              className="card p-6 md:p-8 group overflow-hidden"
              whileHover={{ y: -10, scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-DEFAULT px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold shadow-sm">
                  {test.category}
                </span>
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold">
                  {test.level}
                </span>
              </div>

              <h2 className="text-xl md:text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-primary-DEFAULT transition-colors line-clamp-2">
                {test.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-5 text-sm md:text-base line-clamp-2 leading-relaxed">
                {test.description}
              </p>

              <div className="flex items-center gap-4 mb-6 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {test.duration}
                </span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  {test.questions} سؤال
                </span>
              </div>

              <motion.button
                onClick={() => {
                  setSelectedTest(test.id);
                  setTestStarted(true);
                  setCurrentQuestion(0);
                  setAnswers({});
                  setShowResults(false);
                }}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 group/btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Play className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                بدء الاختبار
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

