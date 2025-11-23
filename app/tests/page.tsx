"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "@/hooks/useSession";
import { Clock, FileText, Award, CheckCircle, XCircle, ArrowRight, ArrowLeft, Play, Phone, AlertCircle, GraduationCap, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db, auth } from "@/lib/firebase-client";
import { collection, getDocs, doc, getDoc, query, orderBy, addDoc, serverTimestamp, where, updateDoc } from "firebase/firestore";
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
  level: string;
  questionsData: Question[];
}

export default function TestsPage() {
  const { user, isAuthenticated, loading: sessionLoading } = useSession();
  const [selectedEducationalLevel, setSelectedEducationalLevel] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [tests, setTests] = useState<Test[]>([]);
  // State محلي للاختبار الحالي مع questionsData (مثل Admin Panel)
  const [currentTestData, setCurrentTestData] = useState<Test | null>(null);
  const [educationalLevels, setEducationalLevels] = useState<Array<{ id: string; name: string; imageUrl?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [showMessage, setShowMessage] = useState<{ type: "subscription" | "contact" | "login" | "alreadyCompleted"; show: boolean }>({ type: "subscription", show: false });
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null); // الوقت المتبقي بالثواني
  const [timerStarted, setTimerStarted] = useState(false);
  const [completedTestIds, setCompletedTestIds] = useState<Set<string>>(new Set()); // مجموعة معرفات الاختبارات المكتملة
  const [completedTestResults, setCompletedTestResults] = useState<Map<string, { score: number; percentage: number; totalQuestions: number; answers: { [key: number]: number }; createdAt: any }>>(new Map()); // نتائج الاختبارات المكتملة
  const [selectedCompletedTestId, setSelectedCompletedTestId] = useState<string | null>(null); // الاختبار المكتمل المحدد لعرض نتيجته

  // التحقق من الاشتراك وجلب الاختبارات المكتملة
  useEffect(() => {
    const checkSubscriptionAndCompletedTests = async () => {
      if (!isAuthenticated || !user?.uid || !db) {
        setHasSubscription(false);
        setCompletedTestIds(new Set());
        return;
      }

      try {
        // التحقق من الاشتراك
        const subscriptionRef = doc(db, "subscriptions", user.uid);
        const subscriptionDoc = await getDoc(subscriptionRef);
        
        if (subscriptionDoc.exists()) {
          const data = subscriptionDoc.data();
          const endsAt = data.endsAt?.toDate ? data.endsAt.toDate() : new Date(data.endsAt);
          const now = new Date();
          const isValid = endsAt > now;
          setHasSubscription(isValid);
        } else {
          setHasSubscription(false);
        }

        // جلب الاختبارات المكتملة والنتائج
        try {
          const resultsQuery = query(
            collection(db, "testResults"),
            where("userId", "==", user.uid)
          );
          const resultsSnapshot = await getDocs(resultsQuery);
          const completedIds = new Set<string>();
          const resultsMap = new Map<string, { score: number; percentage: number; totalQuestions: number; answers: { [key: number]: number }; createdAt: any }>();
          
          resultsSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            if (data.testId) {
              completedIds.add(data.testId);
              // حفظ النتيجة
              resultsMap.set(data.testId, {
                score: data.score || 0,
                percentage: data.percentage || 0,
                totalQuestions: data.totalQuestions || 0,
                answers: data.answers || {},
                createdAt: data.createdAt
              });
            }
          });
          
          setCompletedTestIds(completedIds);
          setCompletedTestResults(resultsMap);
          console.log("✅ الاختبارات المكتملة:", Array.from(completedIds));
          console.log("✅ نتائج الاختبارات:", Array.from(resultsMap.entries()));
        } catch (error: any) {
          // إذا فشل query (مثل عدم وجود index)، لا نمنع المستخدم
          console.warn("⚠️ لا يمكن جلب الاختبارات المكتملة:", error);
          setCompletedTestIds(new Set());
          setCompletedTestResults(new Map());
        }
      } catch (error) {
        console.error("❌ Error checking subscription:", error);
        setHasSubscription(false);
        setCompletedTestIds(new Set());
      }
    };

    checkSubscriptionAndCompletedTests();
  }, [isAuthenticated, user?.uid, db]);

  // جلب المراحل التعليمية
  useEffect(() => {
    const loadEducationalLevels = async () => {
      if (!db) {
        console.warn("⚠️ db غير متاح لجلب المراحل التعليمية");
        return;
      }
      try {
        const educationalLevelsQuery = query(collection(db, "educationalLevels"), orderBy("createdAt", "asc"));
        const educationalLevelsSnapshot = await getDocs(educationalLevelsQuery);
        const levels = educationalLevelsSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          imageUrl: doc.data().imageUrl || "",
        }));
        setEducationalLevels(levels);
      } catch (error) {
        console.error("❌ Error fetching educational levels:", error);
      }
    };
    loadEducationalLevels();
  }, [db]);

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
          } catch (firestoreError: any) {
            console.error("Error fetching tests from Firestore:", firestoreError);
          }
        }

        // لا نجلب private/content هنا - فقط نعرض البيانات العامة (العنوان والوصف)
        // private/content سيتم جلبه فقط عند الضغط على "بدء الاختبار"
        testsData = testsData.map(test => ({
          ...test,
          questionsData: [], // نترك questionsData فارغ حتى يتم جلبه عند بدء الاختبار
        }));

        // طباعة بيانات الاختبارات بشكل مفصل
        console.log("📊 ========== بيانات الاختبارات ==========");
        console.log("📊 إجمالي عدد الاختبارات:", testsData.length);
        console.log("📊 الاختبارات:", testsData.map((test, index) => ({
          رقم: index + 1,
          المعرف: test.id,
          العنوان: test.title,
          الوصف: test.description,
          المدة: test.duration,
          المرحلة_التعليمية_ID: test.level,
          عدد_الأسئلة: test.questions || 0,
          البيانات_الكاملة: test
        })));
        console.log("📊 ========================================");

        setTests(testsData);
      } catch (error) {
        console.error("Error fetching tests:", error);
        setTests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [hasSubscription, db, auth?.currentUser]);

  // فلترة الاختبارات بناءً على المرحلة التعليمية المختارة
  const testsForSelectedLevel = useMemo(() => {
    if (!selectedEducationalLevel) return [];
    
    const filtered = tests.filter((test) => {
      if (!test.level) {
        return false;
      }
      return test.level === selectedEducationalLevel;
    });

    // طباعة بيانات الاختبارات المفلترة
    console.log("🔍 ========== الاختبارات المفلترة ==========");
    console.log("🔍 المرحلة التعليمية المختارة:", selectedEducationalLevel);
    console.log("🔍 إجمالي الاختبارات:", tests.length);
    console.log("🔍 عدد الاختبارات المفلترة:", filtered.length);
    console.log("🔍 الاختبارات المفلترة:", filtered.map((test, index) => ({
      رقم: index + 1,
      المعرف: test.id,
      العنوان: test.title,
      الوصف: test.description,
      المدة: test.duration,
      المرحلة_التعليمية_ID: test.level,
      عدد_الأسئلة: test.questions || 0,
      hasQuestionsData: !!test.questionsData,
      questionsDataLength: test.questionsData?.length || 0
    })));
    console.log("🔍 جميع المراحل في الاختبارات:", [...new Set(tests.map(t => t.level))]);
    console.log("🔍 ========================================");

    return filtered;
  }, [selectedEducationalLevel, tests]);


  // استخدام currentTestData بدلاً من البحث في tests array (مثل Admin Panel)
  const currentTest = currentTestData;
  
  const currentQ = useMemo(() => {
    if (currentTest?.questionsData && Array.isArray(currentTest.questionsData) && currentTest.questionsData.length > currentQuestion) {
      return currentTest.questionsData[currentQuestion];
    }
    return undefined;
  }, [currentTest, currentQuestion]);

  // Debug: التحقق من currentTest و currentQ
  useEffect(() => {
    if (testStarted && selectedTest) {
      console.log("🔍 حالة الاختبار:", {
        testStarted,
        selectedTest,
        currentTest: currentTest ? {
          id: currentTest.id,
          title: currentTest.title,
          questionsDataLength: currentTest.questionsData?.length || 0,
          questionsData: currentTest.questionsData,
          hasQuestionsData: !!currentTest.questionsData,
          isArray: Array.isArray(currentTest.questionsData)
        } : null,
        currentQuestion,
        currentQ: currentQ ? {
          id: currentQ.id,
          question: currentQ.question,
          options: currentQ.options
        } : null,
        allTests: tests.map(t => ({
          id: t.id,
          questionsDataLength: t.questionsData?.length || 0
        }))
      });
    }
  }, [testStarted, selectedTest, currentTest, currentQuestion, currentQ, tests]);

  const handleAnswer = (answerIndex: number) => {
    setAnswers({ ...answers, [currentQuestion]: answerIndex });
  };

  const handleNext = async () => {
    if (currentQuestion < (currentTest?.questionsData.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // حفظ النتيجة في Firebase مباشرة قبل عرض النتائج
      if (user?.uid && selectedTest && currentTest && db) {
        const score = calculateScore();
        try {
          // حفظ النتيجة أولاً
          await addDoc(collection(db, "testResults"), {
            userId: user.uid,
            testId: selectedTest,
            score: score.correct,
            percentage: score.percentage,
            totalQuestions: score.total,
            answers: answers,
            createdAt: serverTimestamp(),
          });

          // إضافة الاختبار إلى قائمة الاختبارات المكتملة
          setCompletedTestIds((prev) => {
            const newSet = new Set(prev);
            if (selectedTest) {
              newSet.add(selectedTest);
            }
            return newSet;
          });

          // حساب المستوى الجديد بناءً على جميع النتائج
          const resultsQuery = query(
            collection(db, "testResults"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
          );

          const resultsSnapshot = await getDocs(resultsQuery);
          const results = resultsSnapshot.docs.map((doc) => doc.data());

          if (results.length > 0) {
            // حساب المعدل العام
            const totalPercentage = results.reduce((sum, result) => sum + (result.percentage || 0), 0);
            const averagePercentage = Math.round(totalPercentage / results.length);
            const completedTests = results.length;

            // تحديد المستوى
            let level = "مبتدئ";
            let levelScore = 0;

            if (completedTests >= 20 && averagePercentage >= 90) {
              level = "ممتاز";
              levelScore = 5;
            } else if (completedTests >= 15 && averagePercentage >= 80) {
              level = "متقدم";
              levelScore = 4;
            } else if (completedTests >= 10 && averagePercentage >= 70) {
              level = "متوسط";
              levelScore = 3;
            } else if (completedTests >= 5 && averagePercentage >= 60) {
              level = "مبتدئ متقدم";
              levelScore = 2;
            } else {
              level = "مبتدئ";
              levelScore = 1;
            }

            // تحديث مستوى المستخدم
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
              await updateDoc(userRef, {
                level: level,
                levelScore: levelScore,
                averageScore: averagePercentage,
                completedTests: completedTests,
                updatedAt: serverTimestamp(),
              });
            }
          }
          
          // تحديث completedTestResults بالنتيجة الجديدة
          const newResult = {
            score: score.correct,
            percentage: score.percentage,
            totalQuestions: score.total,
            answers: answers,
            createdAt: new Date(),
          };
          setCompletedTestResults((prev) => {
            const newMap = new Map(prev);
            if (selectedTest) {
              newMap.set(selectedTest, newResult);
            }
            return newMap;
          });
          
          // إعادة تعيين حالة الاختبار للعودة إلى قائمة الاختبارات
          setShowResults(false);
          setTestStarted(false);
          setSelectedTest(null);
          setCurrentQuestion(0);
          setAnswers({});
          setCurrentTestData(null);
          setTimeRemaining(null);
          setTimerStarted(false);
          
          // عرض بنر النتيجة تلقائياً
          if (selectedTest) {
            setSelectedCompletedTestId(selectedTest);
          }
        } catch (error) {
          console.error("Error saving test result:", error);
          // حتى لو فشل الحفظ، عرض النتائج
          setShowResults(true);
        }
      } else {
        // إذا لم يكن المستخدم مسجل دخول، عرض النتائج فقط
        setShowResults(true);
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
    setCurrentTestData(null); // إعادة تعيين currentTestData
    setTimeRemaining(null);
    setTimerStarted(false);
  };

  // دالة لتحويل duration string إلى ثواني
  const parseDurationToSeconds = (duration: string): number => {
    // تنسيقات محتملة: "30 دقيقة", "30 د", "1 ساعة", "1 س", "45 دقيقة"
    const match = duration.match(/(\d+)/);
    if (match) {
      const value = parseInt(match[1]);
      if (duration.includes("ساعة") || duration.includes("س")) {
        return value * 60 * 60; // تحويل الساعات إلى ثواني
      } else if (duration.includes("دقيقة") || duration.includes("د")) {
        return value * 60; // تحويل الدقائق إلى ثواني
      }
      // افتراض أن القيمة بالدقائق إذا لم يذكر
      return value * 60;
    }
    // افتراضي: 30 دقيقة
    return 30 * 60;
  };

  // مؤقت الاختبار
  useEffect(() => {
    if (!testStarted || !currentTest || !timerStarted || timeRemaining === null) {
      return;
    }

    if (timeRemaining <= 0) {
      // انتهى الوقت - إنهاء الاختبار تلقائياً
      setTimerStarted(false);
      
      // حفظ النتيجة قبل عرض النتائج
      if (user?.uid && selectedTest && currentTest && db) {
        const score = calculateScore();
        try {
          if (!db) return;
          addDoc(collection(db, "testResults"), {
            userId: user.uid,
            testId: selectedTest,
            score: score.correct,
            percentage: score.percentage,
            totalQuestions: score.total,
            answers: answers,
            createdAt: serverTimestamp(),
          }).then(() => {
            // إضافة الاختبار إلى قائمة الاختبارات المكتملة
            if (selectedTest) {
              setCompletedTestIds((prev) => {
                const newSet = new Set(prev);
                newSet.add(selectedTest);
                return newSet;
              });
            }

            // حساب المستوى بعد حفظ النتيجة
            if (!db || !user?.uid) return;
            
            const resultsQuery = query(
              collection(db, "testResults"),
              where("userId", "==", user.uid),
              orderBy("createdAt", "desc")
            );

            getDocs(resultsQuery).then((resultsSnapshot) => {
              const results = resultsSnapshot.docs.map((doc) => doc.data());

              if (results.length > 0 && db && user?.uid) {
                const totalPercentage = results.reduce((sum, result) => sum + (result.percentage || 0), 0);
                const averagePercentage = Math.round(totalPercentage / results.length);
                const completedTests = results.length;

                let level = "مبتدئ";
                let levelScore = 0;

                if (completedTests >= 20 && averagePercentage >= 90) {
                  level = "ممتاز";
                  levelScore = 5;
                } else if (completedTests >= 15 && averagePercentage >= 80) {
                  level = "متقدم";
                  levelScore = 4;
                } else if (completedTests >= 10 && averagePercentage >= 70) {
                  level = "متوسط";
                  levelScore = 3;
                } else if (completedTests >= 5 && averagePercentage >= 60) {
                  level = "مبتدئ متقدم";
                  levelScore = 2;
                } else {
                  level = "مبتدئ";
                  levelScore = 1;
                }

                const userRef = doc(db, "users", user.uid);
                getDoc(userRef).then((userDoc) => {
                  if (userDoc.exists()) {
                    updateDoc(userRef, {
                      level: level,
                      levelScore: levelScore,
                      averageScore: averagePercentage,
                      completedTests: completedTests,
                      updatedAt: serverTimestamp(),
                    });
                  }
                });
              }
            });
            
            // تحديث completedTestResults بالنتيجة الجديدة
            const newResult = {
              score: score.correct,
              percentage: score.percentage,
              totalQuestions: score.total,
              answers: answers,
              createdAt: new Date(),
            };
            setCompletedTestResults((prev) => {
              const newMap = new Map(prev);
              if (selectedTest) {
                newMap.set(selectedTest, newResult);
              }
              return newMap;
            });
            
            // إعادة تعيين حالة الاختبار للعودة إلى قائمة الاختبارات
            setShowResults(false);
            setTestStarted(false);
            setSelectedTest(null);
            setCurrentQuestion(0);
            setAnswers({});
            setCurrentTestData(null);
            setTimeRemaining(null);
            setTimerStarted(false);
            
            // عرض بنر النتيجة تلقائياً
            if (selectedTest) {
              setSelectedCompletedTestId(selectedTest);
            }
          }).catch((error) => {
            console.error("Error saving test result:", error);
            // حتى لو فشل الحفظ، عرض النتائج
            setShowResults(true);
          });
        } catch (error) {
          console.error("Error saving test result:", error);
          // حتى لو فشل الحفظ، عرض النتائج
          setShowResults(true);
        }
      } else {
        // إذا لم يكن المستخدم مسجل دخول، عرض النتائج فقط
        setShowResults(true);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, currentTest, timerStarted, timeRemaining, user?.uid, selectedTest, db, answers]);

  // بدء المؤقت عند بدء الاختبار
  useEffect(() => {
    if (testStarted && currentTest && !timerStarted) {
      const durationInSeconds = parseDurationToSeconds(currentTest.duration);
      setTimeRemaining(durationInSeconds);
      setTimerStarted(true);
    }
  }, [testStarted, currentTest, timerStarted]);

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
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border-2 border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                السؤال {currentQuestion + 1} من {currentTest.questionsData?.length || 0}
              </span>
              <div className="flex items-center gap-4">
                {/* المؤقت */}
                {timeRemaining !== null && (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold ${
                    timeRemaining <= 60 
                      ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 animate-pulse"
                      : timeRemaining <= 300
                      ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                      : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  }`}>
                    <Clock className={`w-4 h-4 ${
                      timeRemaining <= 60 
                        ? "text-red-600 dark:text-red-400"
                        : timeRemaining <= 300
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-blue-600 dark:text-blue-400"
                    }`} />
                    <span>
                      {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {currentTest.title}
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-primary-600 to-primary-700 h-2 rounded-full"
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
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6 border-2 border-gray-200 dark:border-gray-700"
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
                        ? "border-primary-600 dark:border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold shadow-md"
                        : "border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600"
                    }`}
                    whileHover={{ scale: 1.02, x: -5 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <span className="ml-2 font-semibold text-primary-600 dark:text-primary-400">
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
        staggerChildren: 0.05,
        delayChildren: 0,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 10,
      pointerEvents: "none" as const
    },
    visible: {
      opacity: 1,
      y: 0,
      pointerEvents: "auto" as const,
      transition: {
        duration: 0.2,
        ease: "easeOut" as const,
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

      {/* بنر النتيجة للاختبار المكتمل */}
      <AnimatePresence>
        {selectedCompletedTestId && completedTestResults.has(selectedCompletedTestId) && currentTestData && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="mb-8"
          >
            {(() => {
              const result = completedTestResults.get(selectedCompletedTestId)!;
              const test = tests.find(t => t.id === selectedCompletedTestId);
              const percentage = result.percentage;
              
              return (
                <div className={`rounded-2xl shadow-2xl overflow-hidden border-2 ${
                  percentage >= 70
                    ? "bg-gradient-to-r from-green-500 via-green-600 to-green-700 border-green-400"
                    : percentage >= 50
                    ? "bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 border-yellow-400"
                    : "bg-gradient-to-r from-red-500 via-red-600 to-red-700 border-red-400"
                }`}>
                  <div className="p-6 md:p-8 relative">
                    {/* زر الإغلاق */}
                    <motion.button
                      onClick={() => {
                        setSelectedCompletedTestId(null);
                        setCurrentTestData(null);
                      }}
                      className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all backdrop-blur-sm z-10"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.button>

                    <div className="flex items-center justify-between gap-4 flex-wrap pr-12">
                      <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", delay: 0.2 }}
                          className="bg-white/20 dark:bg-white/10 rounded-full p-4 backdrop-blur-sm"
                        >
                          <Award className="w-8 h-8 md:w-10 md:h-10 text-white" />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                            نتيجة الاختبار
                          </h3>
                          <p className="text-white/90 text-sm md:text-base">
                            {test?.title || currentTestData?.title || "اختبار"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 flex-wrap">
                        <div className="text-center">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.3 }}
                            className="text-4xl md:text-5xl font-bold text-white mb-1"
                          >
                            {percentage}%
                          </motion.div>
                          <p className="text-white/90 text-sm md:text-base">
                            {result.score} من {result.totalQuestions} صحيح
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* التفاصيل الكاملة */}
                  {currentTestData?.questionsData && currentTestData.questionsData.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white dark:bg-gray-800 border-t-2 border-white/20"
                    >
                      <div className="p-6 md:p-8 max-h-[600px] overflow-y-auto">
                        <h4 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                          تفاصيل الإجابات
                        </h4>
                        <div className="space-y-4">
                          {currentTestData.questionsData.map((q, index) => {
                            const userAnswer = result.answers[index];
                            const isCorrect = userAnswer === q.correctAnswer;
                            return (
                              <motion.div
                                key={q.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`p-4 rounded-lg border-2 ${
                                  isCorrect
                                    ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                                    : "bg-red-50 dark:bg-red-900/20 border-red-500"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  {isCorrect ? (
                                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                                  ) : (
                                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                                  )}
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900 dark:text-white mb-2">
                                      {index + 1}. {q.question}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                      <span className="font-semibold">إجابتك:</span> {q.options[userAnswer]}
                                    </p>
                                    {!isCorrect && (
                                      <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                                        <span className="font-semibold">الإجابة الصحيحة:</span> {q.options[q.correctAnswer]}
                                      </p>
                                    )}
                                    {q.explanation && (
                                      <p className="text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded text-gray-700 dark:text-gray-300 mt-2">
                                        <strong>شرح:</strong> {q.explanation}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* عرض المراحل التعليمية أولاً */}
      {!selectedEducationalLevel && (
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            اختر المرحلة التعليمية
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {educationalLevels.map((level, index) => (
              <motion.button
                key={level.id}
                onClick={() => {
                  setSelectedEducationalLevel(level.id);
                }}
                className="card overflow-hidden group cursor-pointer text-right hover:shadow-xl transition-all duration-300 p-0"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* الصورة الكبيرة في الأعلى */}
                <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {level.imageUrl ? (
                    <img
                      src={level.imageUrl}
                      alt={level.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800">
                      <GraduationCap className="w-16 h-16 text-primary-600 dark:text-primary-400" />
                    </div>
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {/* Arrow Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="w-12 h-12 text-white drop-shadow-lg transform rotate-180" />
                  </div>
                </div>
                
                {/* المحتوى */}
                <div className="p-6">
                  <h4 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {level.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    اضغط للاطلاع على الاختبارات
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* عرض الاختبارات عند اختيار مرحلة */}
      {selectedEducationalLevel && (
        <>
          {/* زر العودة */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <button
              onClick={() => {
                setSelectedEducationalLevel(null);
              }}
              className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
              <span>العودة إلى المراحل التعليمية</span>
            </button>
          </motion.div>
        </>
      )}

      {(() => {
        // Debug: التحقق من الحالة
        console.log("🔍 Render check:", {
          selectedEducationalLevel,
          testsForSelectedLevelLength: testsForSelectedLevel.length,
          testsLength: tests.length,
          loading,
          testStarted,
          showResults,
          testsForSelectedLevel: testsForSelectedLevel.map(t => ({ id: t.id, title: t.title, level: t.level }))
        });

        // إذا كان الاختبار بدأ أو النتائج معروضة، لا نعرض قائمة الاختبارات
        // (يتم عرضها في return statements أعلاه في بداية الكومبوننت)
        
        if (!selectedEducationalLevel) {
          return (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
                className="inline-block mb-6"
              >
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6">
                  <GraduationCap className="w-16 h-16 text-gray-400" />
                </div>
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                اختر المرحلة التعليمية
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                يرجى اختيار مرحلة تعليمية للاطلاع على الاختبارات
              </p>
            </motion.div>
          );
        }

        if (testsForSelectedLevel.length === 0) {
          return (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              </motion.div>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                لا توجد اختبارات متاحة لهذه المرحلة التعليمية حالياً
              </p>
            </motion.div>
          );
        }

        return (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {testsForSelectedLevel.map((test, index) => {
              console.log("🎨 Rendering test card:", { index, testId: test.id, testTitle: test.title });
              return (
            <motion.div
              key={test.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl p-6 md:p-8 group overflow-hidden border-2 border-gray-200 dark:border-gray-700 transition-all duration-300"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              whileHover={{ y: -10, scale: 1.03 }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="text-xl md:text-2xl font-bold flex-1 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                  {test.title}
                </h2>
                {/* Level badge removed - not needed for display */}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-5 text-sm md:text-base line-clamp-2 leading-relaxed">
                {test.description}
              </p>

              <div className="flex items-center gap-4 mb-6 text-xs md:text-sm">
                <span className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg font-medium">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  {test.duration}
                </span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-lg font-medium">
                  <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  {test.questionsData?.length || test.questions || 0} سؤال
                </span>
              </div>

              <motion.button
                onClick={async () => {
                  // إذا كان المستخدم غير مسجل دخول
                  if (!isAuthenticated) {
                    setShowMessage({ type: "login", show: true });
                    return;
                  }

                  // إذا كان الاختبار مكتملاً، عرض النتيجة
                  if (completedTestIds.has(test.id)) {
                    setSelectedCompletedTestId(test.id);
                    // جلب questionsData لعرض التفاصيل
                    if (db && auth?.currentUser) {
                      try {
                        const privateContentRef = doc(db, "tests", test.id, "private", "content");
                        const privateContentDoc = await getDoc(privateContentRef);
                        if (privateContentDoc.exists()) {
                          const data = privateContentDoc.data();
                          const testQuestionsData = data.questionsData || [];
                          const updatedTest = {
                            ...test,
                            questionsData: testQuestionsData,
                            questions: testQuestionsData.length,
                          };
                          setCurrentTestData(updatedTest);
                        }
                      } catch (error) {
                        console.error("❌ خطأ في جلب تفاصيل الاختبار:", error);
                      }
                    }
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
                      console.log("📥 جلب الأسئلة من private/content...");
                      console.log("📥 معرف الاختبار:", test.id);
                      try {
                        const privateContentRef = doc(db, "tests", test.id, "private", "content");
                        const privateContentDoc = await getDoc(privateContentRef);
                        if (privateContentDoc.exists()) {
                          const data = privateContentDoc.data();
                          testQuestionsData = data.questionsData || [];
                          console.log("✅ تم جلب الأسئلة بنجاح:", {
                            عدد_الأسئلة: testQuestionsData.length,
                            الأسئلة: testQuestionsData.map((q, index) => ({
                              رقم: index + 1,
                              السؤال: q.question,
                              عدد_الخيارات: q.options?.length || 0
                            }))
                          });
                        } else {
                          console.warn("⚠️ private/content غير موجود للاختبار:", test.id);
                        }
                      } catch (error: any) {
                        console.error("❌ خطأ في جلب الأسئلة:", error);
                        console.error("❌ تفاصيل الخطأ:", {
                          code: error.code,
                          message: error.message,
                          testId: test.id
                        });
                        // إذا كان الخطأ permission-denied، هذا يعني أن Security Rules تمنع الوصول
                        if (error.code === "permission-denied") {
                          console.error("🚫 Security Rules تمنع الوصول إلى private/content");
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
                    
                    // تحديث الاختبار بـ questionsData (مثل Admin Panel)
                    const updatedTest = {
                      ...test,
                      questionsData: testQuestionsData,
                      questions: testQuestionsData.length,
                    };
                    
                    // طباعة بيانات الاختبار عند البدء
                    console.log("🚀 ========== بدء الاختبار ==========");
                    console.log("🚀 معرف الاختبار:", test.id);
                    console.log("🚀 عنوان الاختبار:", test.title);
                    console.log("🚀 الوصف:", test.description);
                    console.log("🚀 المدة:", test.duration);
                    console.log("🚀 المرحلة التعليمية ID:", test.level);
                    console.log("🚀 عدد الأسئلة:", testQuestionsData.length);
                    console.log("🚀 الأسئلة:", testQuestionsData.map((q, index) => ({
                      رقم: index + 1,
                      السؤال: q.question,
                      الخيارات: q.options,
                      الإجابة_الصحيحة: q.correctAnswer,
                      الشرح: q.explanation || "لا يوجد شرح"
                    })));
                    console.log("🚀 الاختبار المحدث:", updatedTest);
                    console.log("🚀 ====================================");
                    
                    // استخدام state محلي للاختبار الحالي (مثل Admin Panel)
                    setCurrentTestData(updatedTest);
                    
                    // تحديث tests state أيضاً (للتوافق)
                    const updatedTests = tests.map(t => t.id === test.id ? updatedTest : t);
                    setTests(updatedTests);
                    
                    // البدء في الاختبار
                    
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
                className={`w-full font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 group/btn shadow-lg transition-all duration-300 ${
                  completedTestIds.has(test.id)
                    ? "bg-gradient-to-r from-green-600 via-green-700 to-green-800 hover:from-green-700 hover:via-green-800 hover:to-green-900 text-white hover:shadow-xl cursor-pointer"
                    : "bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 hover:from-primary-700 hover:via-primary-800 hover:to-primary-900 text-white hover:shadow-xl"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {completedTestIds.has(test.id) ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    تم إكمال الاختبار
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    بدء الاختبار
                  </>
                )}
              </motion.button>
            </motion.div>
              );
            })}
          </motion.div>
        );
      })()}

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

              {showMessage.type === "alreadyCompleted" && (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-4">
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-3 text-gray-900 dark:text-white">
                    تم إكمال الاختبار
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
                    لقد قمت بحل هذا الاختبار من قبل. لا يمكن حل نفس الاختبار أكثر من مرة.
                  </p>
                  <button
                    onClick={() => setShowMessage({ type: "alreadyCompleted", show: false })}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    فهمت
                  </button>
                </>
              )}

              {showMessage.type === "alreadyCompleted" && (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-4">
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-3 text-gray-900 dark:text-white">
                    تم إكمال الاختبار
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
                    لقد قمت بحل هذا الاختبار من قبل. لا يمكن حل نفس الاختبار أكثر من مرة.
                  </p>
                  <button
                    onClick={() => setShowMessage({ type: "alreadyCompleted", show: false })}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    فهمت
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

