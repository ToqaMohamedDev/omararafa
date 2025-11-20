"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { auth, db } from "@/lib/firebase-client";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { 
  Video, 
  FileText, 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  LogOut,
  Loader2,
  X,
  Check,
  Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_EMAIL = "dzggghjg@gmail.com";

interface Video {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  description: string;
  category: string;
  level: string;
}

interface Test {
  id: string;
  title: string;
  description: string;
  duration: string;
  questions: number;
  category: string;
  level: string;
  questionsData: Array<{
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }>;
}

interface Course {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  level: string;
  instructor: string;
  category?: string;
}

export default function AdminPage() {
  const { user, isAuthenticated, logout, loading: sessionLoading } = useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"categories" | "videos" | "tests" | "courses">("categories");
  
  // Categories
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "" });
  
  // Videos
  const [videos, setVideos] = useState<Video[]>([]);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [videoForm, setVideoForm] = useState({
    title: "",
    videoUrl: "",
    thumbnailUrl: "",
    description: "",
    category: "",
    level: "مبتدئ",
  });

  // Tests
  const [tests, setTests] = useState<Test[]>([]);
  const [showTestForm, setShowTestForm] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [testForm, setTestForm] = useState({
    title: "",
    description: "",
    duration: "",
    category: "",
    level: "مبتدئ",
    questionsData: [] as Array<{
      id: number;
      question: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
    }>,
  });

  // Courses
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
    duration: "",
    level: "مبتدئ",
    instructor: "عمر عرفة",
    category: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const checkAdmin = useCallback(async () => {
    // إذا كان session لا يزال في حالة loading، لا تفعل شيء
    if (sessionLoading) {
      return;
    }

    // بعد انتهاء loading، تحقق من المصادقة
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    if (user.email !== ADMIN_EMAIL) {
      router.push("/");
      return;
    }

    try {
      const idToken = await auth?.currentUser?.getIdToken();
      if (!idToken) {
        router.push("/auth/login");
        return;
      }

      const response = await fetch("/api/admin/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (response.ok) {
        setIsAdmin(true);
        loadData();
      } else if (response.status === 503) {
        // في development، Firebase Admin قد لا يكون مهيأ
        // لكن يمكننا التحقق من email المستخدم مباشرة
        if (user.email === ADMIN_EMAIL) {
          setIsAdmin(true);
          loadData();
        } else {
          router.push("/");
        }
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Admin check error:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated, sessionLoading, router]);

  useEffect(() => {
    // انتظر حتى يتم تحميل حالة المصادقة قبل التحقق
    if (!sessionLoading) {
      checkAdmin();
    }
  }, [sessionLoading, checkAdmin]);

  const loadData = async () => {
    try {
      // Load categories
      let categoriesData: Array<{ id: string; name: string }> = [];
      const categoriesRes = await fetch("/api/categories");
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        categoriesData = data.categories || [];
      }
      // Fallback to Firestore
      if (categoriesData.length === 0 && db) {
        try {
          const categoriesQuery = query(collection(db, "categories"), orderBy("name"));
          const categoriesSnapshot = await getDocs(categoriesQuery);
          categoriesData = categoriesSnapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
          }));
        } catch (error) {
          console.error("Error fetching categories from Firestore:", error);
        }
      }
      setCategories(categoriesData);

      // Load videos
      let videosData: Video[] = [];
      const videosRes = await fetch("/api/videos");
      if (videosRes.ok) {
        const data = await videosRes.json();
        videosData = data.videos || [];
      }
      // Fallback to Firestore
      if (videosData.length === 0 && db) {
        try {
          const videosQuery = query(collection(db, "videos"), orderBy("createdAt", "desc"));
          const videosSnapshot = await getDocs(videosQuery);
          videosData = videosSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Video[];
        } catch (error) {
          console.error("Error fetching videos from Firestore:", error);
        }
      }
      setVideos(videosData);

      // Load tests
      let testsData: Test[] = [];
      const testsRes = await fetch("/api/tests");
      if (testsRes.ok) {
        const data = await testsRes.json();
        testsData = data.tests || [];
      }
      // Fallback to Firestore
      if (testsData.length === 0 && db) {
        try {
          const testsSnapshot = await getDocs(collection(db, "tests"));
          testsData = testsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Test[];
        } catch (error) {
          console.error("Error fetching tests from Firestore:", error);
        }
      }
      setTests(testsData);

      // Load courses
      let coursesData: Course[] = [];
      const coursesRes = await fetch("/api/courses");
      if (coursesRes.ok) {
        const data = await coursesRes.json();
        coursesData = data.courses || [];
      }
      // Fallback to Firestore
      if (coursesData.length === 0 && db) {
        try {
          const coursesQuery = query(collection(db, "courses"), orderBy("createdAt", "desc"));
          const coursesSnapshot = await getDocs(coursesQuery);
          coursesData = coursesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Course[];
        } catch (error) {
          console.error("Error fetching courses from Firestore:", error);
        }
      }
      setCourses(coursesData);
    } catch (error) {
      console.error("Load data error:", error);
    }
  };

  const getIdToken = async () => {
    const token = await auth?.currentUser?.getIdToken();
    if (!token) {
      throw new Error("Not authenticated");
    }
    return token;
  };

  // Category functions
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const idToken = await getIdToken();
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, name: categoryForm.name }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: editingCategory ? "تم تحديث التصنيف بنجاح" : "تم إضافة التصنيف بنجاح" });
        setShowCategoryForm(false);
        setEditingCategory(null);
        setCategoryForm({ name: "" });
        loadData();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "حدث خطأ" });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "حدث خطأ" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCategory = (category: { id: string; name: string }) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name });
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التصنيف؟ سيتم رفض الحذف إذا كان هناك فيديوهات أو دورات تستخدمه.")) return;

    try {
      const idToken = await getIdToken();
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "تم حذف التصنيف بنجاح" });
        loadData();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "حدث خطأ" });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "حدث خطأ" });
    }
  };

  // Video functions
  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const idToken = await getIdToken();
      const url = editingVideo
        ? `/api/videos/${editingVideo.id}`
        : "/api/videos";
      const method = editingVideo ? "PUT" : "POST";

      if (!videoForm.category) {
        setMessage({ type: "error", text: "يجب اختيار تصنيف للفيديو" });
        setSubmitting(false);
        return;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, ...videoForm }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: editingVideo ? "تم تحديث الفيديو بنجاح" : "تم إضافة الفيديو بنجاح" });
        setShowVideoForm(false);
        setEditingVideo(null);
        setVideoForm({
          title: "",
          videoUrl: "",
          thumbnailUrl: "",
          description: "",
          category: "",
          level: "مبتدئ",
        });
        loadData();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "حدث خطأ" });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "حدث خطأ" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditVideo = (video: Video) => {
    setEditingVideo(video);
    setVideoForm({
      title: video.title,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl || "",
      description: video.description,
      category: video.category || "",
      level: video.level,
    });
    setShowVideoForm(true);
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الفيديو؟")) return;

    try {
      const idToken = await getIdToken();
      const response = await fetch(`/api/videos/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "تم حذف الفيديو بنجاح" });
        loadData();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "حدث خطأ" });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "حدث خطأ" });
    }
  };

  // Test functions
  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const idToken = await getIdToken();
      const url = editingTest
        ? `/api/tests/${editingTest.id}`
        : "/api/tests";
      const method = editingTest ? "PUT" : "POST";

      const questions = testForm.questionsData.length;
      const testData = {
        ...testForm,
        questions,
        duration: testForm.duration || `${questions * 5} دقيقة`,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, ...testData }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: editingTest ? "تم تحديث الاختبار بنجاح" : "تم إضافة الاختبار بنجاح" });
        setShowTestForm(false);
        setEditingTest(null);
        setTestForm({
          title: "",
          description: "",
          duration: "",
          category: "",
          level: "مبتدئ",
          questionsData: [],
        });
        loadData();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "حدث خطأ" });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "حدث خطأ" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTest = (test: Test) => {
    setEditingTest(test);
    setTestForm({
      title: test.title,
      description: test.description,
      duration: test.duration,
      category: test.category,
      level: test.level,
      questionsData: test.questionsData || [],
    });
    setShowTestForm(true);
  };

  const handleDeleteTest = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الاختبار؟")) return;

    try {
      const idToken = await getIdToken();
      const response = await fetch(`/api/tests/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "تم حذف الاختبار بنجاح" });
        loadData();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "حدث خطأ" });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "حدث خطأ" });
    }
  };

  const addQuestion = () => {
    const newId = testForm.questionsData.length + 1;
    setTestForm({
      ...testForm,
      questionsData: [
        ...testForm.questionsData,
        {
          id: newId,
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          explanation: "",
        },
      ],
    });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...testForm.questionsData];
    updated[index] = { ...updated[index], [field]: value };
    setTestForm({ ...testForm, questionsData: updated });
  };

  const removeQuestion = (index: number) => {
    const updated = testForm.questionsData.filter((_, i) => i !== index);
    setTestForm({ ...testForm, questionsData: updated });
  };

  // Course functions
  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const idToken = await getIdToken();
      const url = editingCourse
        ? `/api/courses/${editingCourse.id}`
        : "/api/courses";
      const method = editingCourse ? "PUT" : "POST";

      if (!courseForm.category) {
        setMessage({ type: "error", text: "يجب اختيار تصنيف للدورة" });
        setSubmitting(false);
        return;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, ...courseForm }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: editingCourse ? "تم تحديث الدورة بنجاح" : "تم إضافة الدورة بنجاح" });
        setShowCourseForm(false);
        setEditingCourse(null);
        setCourseForm({
          title: "",
          description: "",
          videoUrl: "",
          thumbnailUrl: "",
          duration: "",
          level: "مبتدئ",
          instructor: "عمر عرفة",
          category: "",
        });
        loadData();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "حدث خطأ" });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "حدث خطأ" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      videoUrl: course.videoUrl,
      thumbnailUrl: course.thumbnailUrl || "",
      duration: course.duration,
      level: course.level,
      instructor: course.instructor,
      category: course.category || "",
    });
    setShowCourseForm(true);
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الدورة؟")) return;

    try {
      const idToken = await getIdToken();
      const response = await fetch(`/api/courses/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "تم حذف الدورة بنجاح" });
        loadData();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "حدث خطأ" });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "حدث خطأ" });
    }
  };

  // إظهار loading أثناء تحميل session أو التحقق من Admin
  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-DEFAULT" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto container-padding page-padding">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              لوحة التحكم
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
              إدارة التصنيفات والفيديوهات والاختبارات والدورات
            </p>
          </div>
        </div>

        {/* Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 md:mb-8 p-4 md:p-5 rounded-xl flex items-center gap-3 shadow-md ${
                message.type === "success"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
                  : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
              }`}
            >
              {message.type === "success" ? (
                <Check className="w-5 h-5 flex-shrink-0" />
              ) : (
                <X className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm md:text-base">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-2 md:gap-4 mb-8 md:mb-12 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {[
            { id: "categories" as const, label: "التصنيفات", icon: Tag },
            { id: "videos" as const, label: "الفيديوهات", icon: Video },
            { id: "tests" as const, label: "الاختبارات", icon: FileText },
            { id: "courses" as const, label: "الدورات", icon: BookOpen },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 md:px-6 py-3 font-semibold transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-primary-DEFAULT border-b-2 border-primary-DEFAULT"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-t-lg"
              }`}
            >
              <tab.icon className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                إدارة التصنيفات
              </h2>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryForm({ name: "" });
                  setShowCategoryForm(true);
                }}
                className="flex items-center gap-2 btn-primary w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">إضافة تصنيف</span>
              </button>
            </div>

            {/* Category Form */}
            <AnimatePresence>
              {showCategoryForm && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="card mb-6 md:mb-8 card-padding"
                >
                  <form onSubmit={handleCategorySubmit} className="form-spacing">
                    <div>
                      <label className="block mb-2 md:mb-3 font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300">
                        اسم التصنيف
                      </label>
                      <input
                        type="text"
                        required
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ name: e.target.value })}
                        placeholder="مثال: النحو، البلاغة، الأدب، النصوص، القراءة..."
                        className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary flex-1"
                      >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : editingCategory ? "تحديث" : "إضافة"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCategoryForm(false);
                          setEditingCategory(null);
                        }}
                        className="px-6 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Categories List */}
            {categories.length === 0 ? (
              <div className="text-center py-12 card card-padding">
                <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                  لا توجد تصنيفات. أضف تصنيفاً جديداً للبدء.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  يجب إضافة تصنيف على الأقل قبل إضافة فيديوهات.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {categories.map((category) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card card-padding hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center shadow-md">
                          <Tag className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{category.name}</h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="p-2.5 text-[#FF6B35] hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all duration-300 hover:scale-110"
                        >
                          <Edit className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300 hover:scale-110"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === "videos" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                إدارة الفيديوهات
              </h2>
              <button
                onClick={() => {
                  setEditingVideo(null);
                  setVideoForm({
                    title: "",
                    videoUrl: "",
                    thumbnailUrl: "",
                    description: "",
                    category: "",
                    level: "مبتدئ",
                  });
                  setShowVideoForm(true);
                }}
                className="flex items-center gap-2 btn-primary w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">إضافة فيديو</span>
              </button>
            </div>

            {/* Video Form */}
            <AnimatePresence>
              {showVideoForm && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="card mb-6 md:mb-8 card-padding"
                >
                  <form onSubmit={handleVideoSubmit} className="form-spacing">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <label className="block mb-2 md:mb-3 font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300">عنوان الفيديو</label>
                        <input
                          type="text"
                          required
                          value={videoForm.title}
                          onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                          className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 md:mb-3 font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300">رابط الفيديو</label>
                        <input
                          type="url"
                          required
                          value={videoForm.videoUrl}
                          onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                          className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 md:mb-3 font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300">رابط الصورة</label>
                        <input
                          type="url"
                          value={videoForm.thumbnailUrl}
                          onChange={(e) => setVideoForm({ ...videoForm, thumbnailUrl: e.target.value })}
                          className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 md:mb-3 font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300">التصنيف</label>
                        {categories.length === 0 ? (
                          <div className="p-4 border border-yellow-300 dark:border-yellow-700 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                              يجب إضافة تصنيف أولاً من قسم "التصنيفات"
                            </p>
                          </div>
                        ) : (
                          <select
                            required
                            value={videoForm.category}
                            onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value })}
                            className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
                          >
                            <option value="">اختر التصنيف</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      <div>
                        <label className="block mb-2 md:mb-3 font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300">المستوى</label>
                        <select
                          value={videoForm.level}
                          onChange={(e) => setVideoForm({ ...videoForm, level: e.target.value })}
                          className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
                        >
                          <option value="مبتدئ">مبتدئ</option>
                          <option value="متوسط">متوسط</option>
                          <option value="متقدم">متقدم</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block mb-2 font-semibold">الوصف</label>
                      <textarea
                        required
                        value={videoForm.description}
                        onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary flex-1"
                      >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : editingVideo ? "تحديث" : "إضافة"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowVideoForm(false);
                          setEditingVideo(null);
                        }}
                        className="px-6 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Videos List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {videos.map((video) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {video.thumbnailUrl && (
                    <div className="relative overflow-hidden">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-48 object-cover rounded-t-lg transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="card-padding">
                    <h3 className="font-bold mb-2 md:mb-3 text-base md:text-lg text-gray-900 dark:text-white">{video.title}</h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 md:mb-6 line-clamp-2">
                      {video.description}
                    </p>
                    <div className="flex gap-2 md:gap-3">
                      <button
                        onClick={() => handleEditVideo(video)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-lg hover:from-[#FF8C42] hover:to-[#FF6B35] transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
                      >
                        <Edit className="w-4 h-4" strokeWidth={2.5} />
                        <span>تعديل</span>
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Tests Tab */}
        {activeTab === "tests" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                إدارة الاختبارات
              </h2>
              <button
                onClick={() => {
                  setEditingTest(null);
                  setTestForm({
                    title: "",
                    description: "",
                    duration: "",
                    category: "",
                    level: "مبتدئ",
                    questionsData: [],
                  });
                  setShowTestForm(true);
                }}
                className="flex items-center gap-2 btn-primary w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">إضافة اختبار</span>
              </button>
            </div>

            {/* Test Form */}
            <AnimatePresence>
              {showTestForm && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="card mb-6 md:mb-8 card-padding"
                >
                  <form onSubmit={handleTestSubmit} className="form-spacing">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <label className="block mb-2 md:mb-3 font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300">عنوان الاختبار</label>
                        <input
                          type="text"
                          required
                          value={testForm.title}
                          onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                          className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 md:mb-3 font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300">التصنيف</label>
                        <input
                          type="text"
                          required
                          value={testForm.category}
                          onChange={(e) => setTestForm({ ...testForm, category: e.target.value })}
                          className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 md:mb-3 font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300">المستوى</label>
                        <select
                          value={testForm.level}
                          onChange={(e) => setTestForm({ ...testForm, level: e.target.value })}
                          className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
                        >
                          <option value="مبتدئ">مبتدئ</option>
                          <option value="متوسط">متوسط</option>
                          <option value="متقدم">متقدم</option>
                        </select>
                      </div>
                      <div>
                        <label className="block mb-2 md:mb-3 font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300">المدة (اختياري)</label>
                        <input
                          type="text"
                          value={testForm.duration}
                          onChange={(e) => setTestForm({ ...testForm, duration: e.target.value })}
                          placeholder="مثال: 30 دقيقة"
                          className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block mb-2 font-semibold">الوصف</label>
                      <textarea
                        required
                        value={testForm.description}
                        onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Questions */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="font-semibold">الأسئلة</label>
                        <button
                          type="button"
                          onClick={addQuestion}
                          className="flex items-center gap-2 px-4 py-2 bg-primary-DEFAULT text-white rounded-lg hover:bg-primary-dark"
                        >
                          <Plus className="w-4 h-4" />
                          إضافة سؤال
                        </button>
                      </div>
                      <div className="space-y-6">
                        {testForm.questionsData.map((q, index) => (
                          <div key={index} className="border rounded-lg p-4 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-4">
                              <span className="font-semibold">سؤال {index + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeQuestion(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <label className="block mb-2 text-sm">السؤال</label>
                                <input
                                  type="text"
                                  required
                                  value={q.question}
                                  onChange={(e) => updateQuestion(index, "question", e.target.value)}
                                  className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
                                />
                              </div>
                              <div>
                                <label className="block mb-2 text-sm">الإجابات</label>
                                {q.options.map((option, optIndex) => (
                                  <div key={optIndex} className="flex items-center gap-2 mb-2">
                                    <input
                                      type="radio"
                                      name={`correct-${index}`}
                                      checked={q.correctAnswer === optIndex}
                                      onChange={() => updateQuestion(index, "correctAnswer", optIndex)}
                                      className="w-4 h-4"
                                    />
                                    <input
                                      type="text"
                                      required
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...q.options];
                                        newOptions[optIndex] = e.target.value;
                                        updateQuestion(index, "options", newOptions);
                                      }}
                                      className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-800"
                                      placeholder={`الإجابة ${optIndex + 1}`}
                                    />
                                  </div>
                                ))}
                              </div>
                              <div>
                                <label className="block mb-2 text-sm">شرح الإجابة (اختياري)</label>
                                <input
                                  type="text"
                                  value={q.explanation || ""}
                                  onChange={(e) => updateQuestion(index, "explanation", e.target.value)}
                                  className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={submitting || testForm.questionsData.length === 0}
                        className="btn-primary flex-1"
                      >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : editingTest ? "تحديث" : "إضافة"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowTestForm(false);
                          setEditingTest(null);
                        }}
                        className="px-6 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tests List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {tests.map((test) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="card-padding">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold mb-2 text-base md:text-lg text-gray-900 dark:text-white">{test.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {test.description}
                        </p>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">{test.questions} سؤال</span>
                          {test.duration && <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">{test.duration}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 md:gap-3">
                      <button
                        onClick={() => handleEditTest(test)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-lg hover:from-[#FF8C42] hover:to-[#FF6B35] transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
                      >
                        <Edit className="w-4 h-4" strokeWidth={2.5} />
                        <span>تعديل</span>
                      </button>
                      <button
                        onClick={() => handleDeleteTest(test.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                إدارة الدورات
              </h2>
              <button
                onClick={() => {
                  setEditingCourse(null);
                  setCourseForm({
                    title: "",
                    description: "",
                    videoUrl: "",
                    thumbnailUrl: "",
                    duration: "",
                    level: "مبتدئ",
                    instructor: "عمر عرفة",
                    category: "",
                  });
                  setShowCourseForm(true);
                }}
                className="flex items-center gap-2 btn-primary w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">إضافة دورة</span>
              </button>
            </div>

            {/* Course Form */}
            <AnimatePresence>
              {showCourseForm && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="card mb-6 md:mb-8 card-padding"
                >
                  <form onSubmit={handleCourseSubmit} className="form-spacing">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <label className="block mb-2 md:mb-3 font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300">عنوان الدورة</label>
                        <input
                          type="text"
                          required
                          value={courseForm.title}
                          onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                          className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 md:mb-3 font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300">رابط الفيديو</label>
                        <input
                          type="url"
                          required
                          value={courseForm.videoUrl}
                          onChange={(e) => setCourseForm({ ...courseForm, videoUrl: e.target.value })}
                          className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 md:mb-3 font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300">رابط الصورة</label>
                        <input
                          type="url"
                          value={courseForm.thumbnailUrl}
                          onChange={(e) => setCourseForm({ ...courseForm, thumbnailUrl: e.target.value })}
                          className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 md:mb-3 font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300">المدة</label>
                        <input
                          type="text"
                          value={courseForm.duration}
                          onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                          placeholder="مثال: 40 ساعة"
                          className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 md:mb-3 font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300">المستوى</label>
                        <select
                          value={courseForm.level}
                          onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                          className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
                        >
                          <option value="مبتدئ">مبتدئ</option>
                          <option value="متوسط">متوسط</option>
                          <option value="متقدم">متقدم</option>
                        </select>
                      </div>
                      <div>
                        <label className="block mb-2 md:mb-3 font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300">المدرس</label>
                        <input
                          type="text"
                          value={courseForm.instructor}
                          onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                          className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 md:mb-3 font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300">التصنيف</label>
                        {categories.length === 0 ? (
                          <div className="p-4 border border-yellow-300 dark:border-yellow-700 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                              يجب إضافة تصنيف أولاً من قسم "التصنيفات"
                            </p>
                          </div>
                        ) : (
                          <select
                            required
                            value={courseForm.category}
                            onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                            className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
                          >
                            <option value="">اختر التصنيف</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block mb-2 md:mb-3 font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300">الوصف</label>
                      <textarea
                        required
                        value={courseForm.description}
                        onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary flex-1"
                      >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : editingCourse ? "تحديث" : "إضافة"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCourseForm(false);
                          setEditingCourse(null);
                        }}
                        className="px-6 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Courses List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {courses.map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {course.thumbnailUrl && (
                    <div className="relative overflow-hidden">
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-48 object-cover rounded-t-lg transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="card-padding">
                    <h3 className="font-bold mb-2 md:mb-3 text-base md:text-lg text-gray-900 dark:text-white">{course.title}</h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 md:mb-6 line-clamp-2">
                      {course.description}
                    </p>
                    {(course.duration || course.instructor) && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2 flex-wrap">
                        {course.duration && <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">{course.duration}</span>}
                        {course.instructor && <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">{course.instructor}</span>}
                      </div>
                    )}
                    <div className="flex gap-2 md:gap-3">
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-lg hover:from-[#FF8C42] hover:to-[#FF6B35] transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
                      >
                        <Edit className="w-4 h-4" strokeWidth={2.5} />
                        <span>تعديل</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

