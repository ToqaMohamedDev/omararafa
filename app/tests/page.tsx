"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/hooks/useSession";
import { Clock, FileText, Award, CheckCircle, XCircle, ArrowRight, ArrowLeft, Play, Phone, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db, auth } from "@/lib/firebase-client";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { TestCardSkeleton } from "@/components/Skeleton";

// WhatsApp Icon Component
const WhatsAppIcon = () => (
  <svg
    className="w-6 h-6"
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.375a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

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
  const [hasSubscription, setHasSubscription] = useState(false);
  const [showMessage, setShowMessage] = useState<{ type: "subscription" | "contact" | "login"; show: boolean }>({ type: "subscription", show: false });

  // التحقق من الاشتراك
  useEffect(() => {
    const checkSubscription = async () => {
      if (!isAuthenticated || !user?.uid || !db) {
        setHasSubscription(false);
        return;
      }

      try {
        const subscriptionRef = doc(db, "subscriptions", user.uid);
        const subscriptionDoc = await getDoc(subscriptionRef);
        
        if (subscriptionDoc.exists()) {
          const data = subscriptionDoc.data();
          const endsAt = data.endsAt?.toDate ? data.endsAt.toDate() : new Date(data.endsAt);
          const now = new Date();
          const isValid = endsAt > now;
          console.log("Subscription check:", { 
            exists: true, 
            endsAt: endsAt.toISOString(), 
            now: now.toISOString(), 
            isValid 
          });
          setHasSubscription(isValid);
        } else {
          console.log("Subscription check: Document does not exist");
          setHasSubscription(false);
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
        setHasSubscription(false);
      }
    };

    checkSubscription();
  }, [isAuthenticated, user?.uid]);

  useEffect(() => {
    // محاولة جلب الاختبارات من Firebase
    const fetchTests = async () => {
      try {
        const response = await fetch("/api/tests");
        let testsData: Test[] = [];
        
        if (response.ok) {
          const data = await response.json();
          testsData = data.tests || [];
        }

        // إذا كان API يعيد بيانات فارغة، استخدم Firebase Client SDK مباشرة
        if (testsData.length === 0 && db) {
          try {
            const testsSnapshot = await getDocs(collection(db, "tests"));
            testsData = testsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Test[];
          } catch (firestoreError) {
            console.error("Error fetching tests from Firestore:", firestoreError);
          }
        }

        // جلب questionsData من private/content للمستخدمين المشتركين فقط
        // إذا لم يكن المستخدم مشترك، نترك questionsData فارغ
        if (hasSubscription && db && auth?.currentUser && testsData.length > 0) {
          try {
            const testsWithQuestions = await Promise.all(
              testsData.map(async (test) => {
                if (!db) return { ...test, questionsData: [] };
                try {
                  const privateContentRef = doc(db, "tests", test.id, "private", "content");
                  const privateContentDoc = await getDoc(privateContentRef);
                  if (privateContentDoc.exists()) {
                    const data = privateContentDoc.data();
                    const questionsData = data.questionsData || [];
                    return {
                      ...test,
                      questionsData: questionsData,
                    };
                  }
                } catch (error: any) {
                  // إذا كان الخطأ permission-denied، هذا طبيعي
                  if (error.code !== "permission-denied") {
                    console.error(`Error fetching questions data for ${test.id}:`, error);
                  }
                }
                // إذا لم يتم جلب questionsData، نعيد الاختبار بدون questionsData
                return {
                  ...test,
                  questionsData: [],
                };
              })
            );
            testsData = testsWithQuestions;
          } catch (error) {
            console.error("Error fetching questions data from private subcollections:", error);
          }
        } else {
          // إذا لم يكن المستخدم مشترك، نزيل questionsData من جميع الاختبارات
          testsData = testsData.map(test => ({
            ...test,
            questionsData: [],
          }));
        }

        setTests(testsData);
      } catch (error) {
        console.error("Error fetching tests:", error);
        setTests([]); // لا بيانات افتراضية
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [hasSubscription]);

  const currentTest = tests.find((t) => t.id === selectedTest);
  const currentQ = currentTest?.questionsData && Array.isArray(currentTest.questionsData) && currentTest.questionsData.length > currentQuestion
    ? currentTest.questionsData[currentQuestion]
    : undefined;

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
    const total = currentTest.questionsData?.length || 0;
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
          <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (showResults && currentTest && currentTest.questionsData && currentTest.questionsData.length > 0) {
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
              {(currentTest.questionsData || []).map((q, index) => {
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

  if (testStarted && currentTest && currentTest.questionsData && currentTest.questionsData.length > 0 && currentQ) {
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
                السؤال {currentQuestion + 1} من {currentTest.questionsData?.length || 0}
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
                  width: `${((currentQuestion + 1) / (currentTest.questionsData?.length || 1)) * 100}%`,
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
              {currentQuestion === (currentTest.questionsData?.length || 0) - 1
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
      <div className="container mx-auto container-padding page-padding">
        <div className="text-center mb-12">
          <div className="h-12 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 w-96 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <TestCardSkeleton key={i} />
          ))}
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
          className="w-32 h-1.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 mx-auto rounded-full mb-6 opacity-70"
          initial={{ width: 0 }}
          animate={{ width: 128 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        ></motion.div>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {isAuthenticated && user?.name 
            ? `مرحباً ${user.name}، اختر الاختبار الذي تريد أداءه واختبر معرفتك في اللغة العربية`
            : "اختر الاختبار الذي تريد أداءه واختبر معرفتك في اللغة العربية"}
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
          {tests.filter((test) => {
            // فلترة الاختبارات بناءً على المرحلة التعليمية (إذا كان المستخدم مسجل دخول)
            if (isAuthenticated && user?.educationalLevelId) {
              return test.level === user.educationalLevelId;
            }
            // إذا لم يكن المستخدم مسجل دخول، نعرض جميع الاختبارات
            return true;
          }).map((test, index) => (
            <motion.div
              key={test.id}
              variants={itemVariants}
              className="card p-6 md:p-8 group overflow-hidden"
              whileHover={{ y: -10, scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="mb-4">
                <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold shadow-sm">
                  {test.category}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="text-xl md:text-2xl font-bold flex-1 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                  {test.title}
                </h2>
                <span className="bg-primary-600 dark:bg-primary-700 text-white px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap flex-shrink-0">
                  {test.level}
                </span>
              </div>
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
                onClick={async () => {
                  // إذا كان المستخدم غير مسجل دخول
                  if (!isAuthenticated) {
                    setShowMessage({ type: "login", show: true });
                    return;
                  }

                  // إذا كان المستخدم غير مشترك، لا نسمح له ببدء الاختبار
                  if (!hasSubscription) {
                    setShowMessage({ type: "subscription", show: true });
                    return;
                  }

                  // إذا كان المستخدم مشترك، نحاول جلب questionsData من private/content إذا لم يكن موجوداً
                  if (hasSubscription && db && auth?.currentUser) {
                    let testQuestionsData = test.questionsData || [];
                    
                    // إذا لم يكن questionsData موجوداً، نحاول جلبه من private/content
                    if (!testQuestionsData || testQuestionsData.length === 0) {
                      try {
                        const privateContentRef = doc(db, "tests", test.id, "private", "content");
                        const privateContentDoc = await getDoc(privateContentRef);
                        if (privateContentDoc.exists()) {
                          const data = privateContentDoc.data();
                          testQuestionsData = data.questionsData || [];
                        }
                      } catch (error: any) {
                        console.error("Error fetching questions data:", error);
                        // إذا كان الخطأ permission-denied، هذا يعني أن Security Rules تمنع الوصول
                        if (error.code === "permission-denied") {
                          setShowMessage({ type: "contact", show: true });
                          return;
                        }
                      }
                    }
                    
                    // إذا لم نجد questionsData بعد كل المحاولات
                    if (!testQuestionsData || testQuestionsData.length === 0) {
                      setShowMessage({ type: "contact", show: true });
                      return;
                    }
                    
                    // تحديث الاختبار بـ questionsData قبل البدء
                    const updatedTest = {
                      ...test,
                      questionsData: testQuestionsData,
                    };
                    const updatedTests = tests.map(t => t.id === test.id ? updatedTest : t);
                    setTests(updatedTests);
                    
                    // البدء في الاختبار بعد تحديث state
                    setSelectedTest(test.id);
                    setTestStarted(true);
                    setCurrentQuestion(0);
                    setAnswers({});
                    setShowResults(false);
                  } else {
                    // إذا لم يكن المستخدم مشترك، نبدأ الاختبار (لكن لن يعمل بدون questionsData)
                  setSelectedTest(test.id);
                  setTestStarted(true);
                  setCurrentQuestion(0);
                  setAnswers({});
                  setShowResults(false);
                  }
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

      {/* Message Modal */}
      <AnimatePresence>
        {showMessage.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMessage({ type: "subscription", show: false })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 border border-gray-200 dark:border-gray-700"
            >
              {showMessage.type === "subscription" && (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full p-4">
                      <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-3 text-gray-900 dark:text-white">
                    اشتراك مطلوب
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
                    يجب الاشتراك لمشاهدة هذا الاختبار. يرجى التواصل مع مستر عمر للاشتراك.
                  </p>
                  
                  {/* Contact Buttons */}
                  <div className="space-y-3 mb-6">
                    {/* WhatsApp Button */}
                    <a
                      href="https://wa.me/2001146525436"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3.5 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <WhatsAppIcon />
                      <span>واتساب</span>
                    </a>

                    {/* Phone Call Button */}
                    <a
                      href="tel:01146525436"
                      className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3.5 rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <Phone className="w-5 h-5" />
                      <span>اتصال: 01146525436</span>
                    </a>
                  </div>

                  <button
                    onClick={() => setShowMessage({ type: "subscription", show: false })}
                    className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                  >
                    إغلاق
                  </button>
                </>
              )}

              {showMessage.type === "login" && (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-4">
                      <AlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-3 text-gray-900 dark:text-white">
                    تسجيل الدخول مطلوب
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
                    يجب تسجيل الدخول أولاً لمشاهدة الاختبارات
                  </p>
                  <button
                    onClick={() => setShowMessage({ type: "login", show: false })}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    فهمت
                  </button>
                </>
              )}

              {showMessage.type === "contact" && (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full p-4">
                      <Phone className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-3 text-gray-900 dark:text-white">
                    محتوى الاختبار غير متاح
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
                    عذراً، محتوى الاختبار غير متاح حالياً. يرجى التواصل مع مستر عمر للحصول على المساعدة.
                  </p>
                  
                  {/* Contact Buttons */}
                  <div className="space-y-3 mb-6">
                    {/* WhatsApp Button */}
                    <a
                      href="https://wa.me/2001146525436"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3.5 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <WhatsAppIcon />
                      <span>واتساب</span>
                    </a>

                    {/* Phone Call Button */}
                    <a
                      href="tel:01146525436"
                      className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3.5 rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <Phone className="w-5 h-5" />
                      <span>اتصال: 01146525436</span>
                    </a>
                  </div>

                  <button
                    onClick={() => setShowMessage({ type: "contact", show: false })}
                    className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                  >
                    إغلاق
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

