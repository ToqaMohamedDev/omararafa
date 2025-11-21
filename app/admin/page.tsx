"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { auth, db } from "@/lib/firebase-client";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  getDoc,
  where,
  setDoc
} from "firebase/firestore";
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
  Tag,
  CreditCard,
  Search,
  AlertTriangle,
  MessageSquare,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { VideoCardSkeleton, CategoryCardSkeleton, TestCardSkeleton, CourseCardSkeleton, SubscriptionCardSkeleton, MessageCardSkeleton, AdminDashboardSkeleton } from "@/components/Skeleton";

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
  videoUrl?: string;
  thumbnailUrl?: string;
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
  const [activeTab, setActiveTab] = useState<"categories" | "courseCategories" | "educationalLevels" | "videos" | "tests" | "courses" | "subscriptions" | "messages">("categories");
  
  // Categories (for videos)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "" });
  
  // Course Categories (for courses)
  const [courseCategories, setCourseCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [showCourseCategoryForm, setShowCourseCategoryForm] = useState(false);
  const [editingCourseCategory, setEditingCourseCategory] = useState<{ id: string; name: string } | null>(null);
  const [courseCategoryForm, setCourseCategoryForm] = useState({ name: "" });
  
  // Educational Levels
  const [educationalLevels, setEducationalLevels] = useState<Array<{ id: string; name: string }>>([]);
  const [showEducationalLevelForm, setShowEducationalLevelForm] = useState(false);
  const [editingEducationalLevel, setEditingEducationalLevel] = useState<{ id: string; name: string } | null>(null);
  const [educationalLevelForm, setEducationalLevelForm] = useState({ name: "" });
  
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

  // Subscriptions
  const [subscriptions, setSubscriptions] = useState<Array<{
    id: string;
    userId: string;
    adminId: string;
    createdAt: any;
    endsAt: any;
    userName?: string;
    userEmail?: string;
    userPhone?: string;
  }>>([]);
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [subscriptionForm, setSubscriptionForm] = useState({ userId: "" });
  const [subscriptionSearch, setSubscriptionSearch] = useState("");

  // Messages
  const [messages, setMessages] = useState<Array<{
    id: string;
    userId: string | null;
    userName: string;
    userEmail: string;
    userPhone: string;
    subject: string;
    message: string;
    createdAt: any;
    read: boolean;
  }>>([]);
  const [messageSearch, setMessageSearch] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  
  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    show: false,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: "تأكيد",
    cancelText: "إلغاء",
  });

  const checkAdmin = useCallback(async () => {
    // إذا كان session لا يزال في حالة loading، لا تفعل شيء
    if (sessionLoading) {
      return;
    }

    // بعد انتهاء loading، تحقق من المصادقة
    if (!isAuthenticated || !user || !user.uid) {
      setLoading(false);
      return;
    }

    if (!db) {
      setLoading(false);
      return;
    }

    try {
      // التحقق من وجود document في roles collection للمستخدم
      // إذا وُجد document، فهو admin (بغض النظر عن محتوى الـ document)
      const roleRef = doc(db, "roles", user.uid);
      const roleDoc = await getDoc(roleRef);

      console.log("Admin check - User UID:", user.uid);
      console.log("Admin check - Document exists:", roleDoc.exists());
      
      if (roleDoc.exists()) {
        // المستخدم admin - يوجد document في roles collection
        console.log("User is admin - document found in roles collection");
          setIsAdmin(true);
          loadData();
        } else {
        // لا يوجد document - المستخدم ليس admin
        console.log("User is NOT admin - no document found in roles collection");
        router.push("/");
      }
    } catch (error) {
      console.error("Admin check error:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated, sessionLoading, router, db]);

  useEffect(() => {
    // انتظر حتى يتم تحميل حالة المصادقة قبل التحقق
    if (!sessionLoading) {
      checkAdmin();
    }
  }, [sessionLoading, checkAdmin]);

  const loadData = async () => {
    setDataLoading(true);
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

      // Load course categories
      let courseCategoriesData: Array<{ id: string; name: string }> = [];
      if (db) {
        try {
          const courseCategoriesQuery = query(collection(db, "courseCategories"), orderBy("name"));
          const courseCategoriesSnapshot = await getDocs(courseCategoriesQuery);
          courseCategoriesData = courseCategoriesSnapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
          }));
        } catch (error) {
          console.error("Error fetching course categories from Firestore:", error);
        }
      }
      setCourseCategories(courseCategoriesData);

      // Load educational levels
      let educationalLevelsData: Array<{ id: string; name: string }> = [];
      if (db) {
        try {
          const educationalLevelsQuery = query(collection(db, "educationalLevels"), orderBy("name"));
          const educationalLevelsSnapshot = await getDocs(educationalLevelsQuery);
          educationalLevelsData = educationalLevelsSnapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
          }));
        } catch (error) {
          console.error("Error fetching educational levels from Firestore:", error);
        }
      }
      setEducationalLevels(educationalLevelsData);

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
      if (testsData.length === 0 && db && auth?.currentUser) {
        try {
          const testsSnapshot = await getDocs(collection(db, "tests"));
          testsData = testsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Test[];
        } catch (error: any) {
          console.error("Error fetching tests from Firestore:", error);
          // إذا كان الخطأ permission-denied، هذا يعني أن Firestore Security Rules غير صحيحة
          if (error.code === "permission-denied") {
            console.error("⚠️ Firestore Security Rules تمنع القراءة. تأكد من تطبيق القواعد في Firebase Console.");
          }
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
      if (coursesData.length === 0 && db && auth?.currentUser) {
        try {
          const coursesQuery = query(collection(db, "courses"), orderBy("createdAt", "desc"));
          const coursesSnapshot = await getDocs(coursesQuery);
          coursesData = coursesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Course[];
        } catch (error: any) {
          console.error("Error fetching courses from Firestore:", error);
          // إذا كان الخطأ permission-denied، هذا يعني أن Firestore Security Rules غير صحيحة
          if (error.code === "permission-denied") {
            console.error("⚠️ Firestore Security Rules تمنع القراءة. تأكد من تطبيق القواعد في Firebase Console.");
          }
        }
      }
      setCourses(coursesData);

      // Load subscriptions
      if (db && auth?.currentUser) {
        try {
          const subscriptionsQuery = query(collection(db, "subscriptions"), orderBy("createdAt", "desc"));
          const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
          const subscriptionsData = await Promise.all(
            subscriptionsSnapshot.docs.map(async (subscriptionDoc) => {
              const data = subscriptionDoc.data();
              let userName = data.userName || "";
              let userEmail = data.userEmail || "";
              let userPhone = data.userPhone || "";
              
              // إذا لم تكن البيانات موجودة، نحاول جلبها من users collection
              if ((!userName || !userEmail) && db) {
                try {
                  const userRef = doc(db, "users", data.userId);
                  const userDoc = await getDoc(userRef);
                  if (userDoc.exists()) {
                    const userData = userDoc.data() as { name?: string; email?: string; phone?: string };
                    userName = userData.name || userName || "";
                    userEmail = userData.email || userEmail || "";
                    userPhone = userData.phone || userPhone || "";
                    
                    // تحديث الاشتراك بالبيانات
                    if (!data.userName || !data.userEmail) {
                      await updateDoc(subscriptionDoc.ref, {
                        userName: userName,
                        userEmail: userEmail,
                        userPhone: userPhone,
                      });
                    }
                  }
                } catch (error) {
                  console.error(`Error fetching user data for ${data.userId}:`, error);
                }
              }
              
              return {
                id: subscriptionDoc.id,
                userId: data.userId,
                adminId: data.adminId,
                createdAt: data.createdAt,
                endsAt: data.endsAt,
                userName: userName,
                userEmail: userEmail,
                userPhone: userPhone,
              };
            })
          );
          setSubscriptions(subscriptionsData);
        } catch (error: any) {
          console.error("Error fetching subscriptions from Firestore:", error);
        }
      }

      // Load messages
      if (db && auth?.currentUser) {
        try {
          const messagesQuery = query(collection(db, "messages"), orderBy("createdAt", "desc"));
          const messagesSnapshot = await getDocs(messagesQuery);
          const messagesData = messagesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Array<{
            id: string;
            userId: string | null;
            userName: string;
            userEmail: string;
            userPhone: string;
            subject: string;
            message: string;
            createdAt: any;
            read: boolean;
          }>;
          setMessages(messagesData);
        } catch (error: any) {
          console.error("Error fetching messages from Firestore:", error);
        }
      }
    } catch (error) {
      console.error("Load data error:", error);
    } finally {
      setDataLoading(false);
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

    if (!db) {
      setMessage({ type: "error", text: "Firebase غير مهيأ. يرجى إعادة تحميل الصفحة." });
      setSubmitting(false);
      return;
    }

    try {
      const categoryName = categoryForm.name.trim();
      if (!categoryName) {
        setMessage({ type: "error", text: "اسم التصنيف مطلوب" });
        setSubmitting(false);
        return;
      }

      if (editingCategory) {
        // تحديث التصنيف
        // التحقق من عدم وجود تصنيف آخر بنفس الاسم
        const categoriesQuery = query(
          collection(db, "categories"),
          where("name", "==", categoryName)
        );
        const existingCategories = await getDocs(categoriesQuery);
        
        const hasDuplicate = existingCategories.docs.some(
          (doc) => doc.id !== editingCategory.id
        );

        if (hasDuplicate) {
          setMessage({ type: "error", text: "اسم التصنيف موجود بالفعل" });
          setSubmitting(false);
          return;
        }

        const categoryRef = doc(db, "categories", editingCategory.id);
        await updateDoc(categoryRef, {
          name: categoryName,
          updatedAt: serverTimestamp(),
        });

        setMessage({ type: "success", text: "تم تحديث التصنيف بنجاح" });
      } else {
        // إضافة تصنيف جديد
        // التحقق من عدم وجود تصنيف بنفس الاسم
        const categoriesQuery = query(
          collection(db, "categories"),
          where("name", "==", categoryName)
        );
        const existingCategories = await getDocs(categoriesQuery);

        if (!existingCategories.empty) {
          setMessage({ type: "error", text: "اسم التصنيف موجود بالفعل" });
          setSubmitting(false);
          return;
        }

        await addDoc(collection(db, "categories"), {
          name: categoryName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        setMessage({ type: "success", text: "تم إضافة التصنيف بنجاح" });
      }

        setShowCategoryForm(false);
        setEditingCategory(null);
        setCategoryForm({ name: "" });
        loadData();
    } catch (error: any) {
      console.error("Error saving category:", error);
      setMessage({ type: "error", text: error.message || "حدث خطأ أثناء حفظ التصنيف" });
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
    setConfirmModal({
      show: true,
      title: "تأكيد الحذف",
      message: "هل أنت متأكد من حذف هذا التصنيف؟ سيتم رفض الحذف إذا كان هناك فيديوهات أو كورسات تستخدمه.",
      confirmText: "حذف",
      cancelText: "إلغاء",
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, show: false });
        
        if (!db) {
          setMessage({ type: "error", text: "Firebase غير مهيأ. يرجى إعادة تحميل الصفحة." });
          return;
        }

        try {
          // التحقق من وجود فيديوهات أو كورسات تستخدم هذا التصنيف
          const videosQuery = query(collection(db, "videos"), where("category", "==", id));
          const coursesQuery = query(collection(db, "courses"), where("category", "==", id));
          
          const [videosSnapshot, coursesSnapshot] = await Promise.all([
            getDocs(videosQuery),
            getDocs(coursesQuery)
          ]);

          if (!videosSnapshot.empty || !coursesSnapshot.empty) {
            const items = [];
            if (!videosSnapshot.empty) items.push("فيديوهات");
            if (!coursesSnapshot.empty) items.push("كورسات");
            setMessage({ type: "error", text: `لا يمكن حذف التصنيف: يوجد ${items.join(" و ")} تستخدم هذا التصنيف` });
            return;
          }

          const categoryRef = doc(db, "categories", id);
          await deleteDoc(categoryRef);

        setMessage({ type: "success", text: "تم حذف التصنيف بنجاح" });
        loadData();
    } catch (error: any) {
          console.error("Error deleting category:", error);
          setMessage({ type: "error", text: error.message || "حدث خطأ أثناء حذف التصنيف" });
    }
      },
    });
  };

  // Course Category functions
  const handleCourseCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    if (!db) {
      setMessage({ type: "error", text: "Firebase غير مهيأ. يرجى إعادة تحميل الصفحة." });
      setSubmitting(false);
      return;
    }

    try {
      const categoryName = courseCategoryForm.name.trim();
      if (!categoryName) {
        setMessage({ type: "error", text: "اسم التصنيف مطلوب" });
        setSubmitting(false);
        return;
      }

      if (editingCourseCategory) {
        // تحديث التصنيف
        const courseCategoriesQuery = query(
          collection(db, "courseCategories"),
          where("name", "==", categoryName)
        );
        const existingCategories = await getDocs(courseCategoriesQuery);
        
        const hasDuplicate = existingCategories.docs.some(
          (doc) => doc.id !== editingCourseCategory.id
        );

        if (hasDuplicate) {
          setMessage({ type: "error", text: "اسم التصنيف موجود بالفعل" });
          setSubmitting(false);
          return;
        }

        const categoryRef = doc(db, "courseCategories", editingCourseCategory.id);
        await updateDoc(categoryRef, {
          name: categoryName,
          updatedAt: serverTimestamp(),
        });

        setMessage({ type: "success", text: "تم تحديث تصنيف الكورسات بنجاح" });
      } else {
        // إضافة تصنيف جديد
        const courseCategoriesQuery = query(
          collection(db, "courseCategories"),
          where("name", "==", categoryName)
        );
        const existingCategories = await getDocs(courseCategoriesQuery);

        if (!existingCategories.empty) {
          setMessage({ type: "error", text: "اسم التصنيف موجود بالفعل" });
          setSubmitting(false);
          return;
        }

        await addDoc(collection(db, "courseCategories"), {
          name: categoryName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        setMessage({ type: "success", text: "تم إضافة تصنيف الكورسات بنجاح" });
      }

        setShowCourseCategoryForm(false);
        setEditingCourseCategory(null);
        setCourseCategoryForm({ name: "" });
        loadData();
    } catch (error: any) {
      console.error("Error saving course category:", error);
      setMessage({ type: "error", text: error.message || "حدث خطأ أثناء حفظ تصنيف الكورسات" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCourseCategory = (category: { id: string; name: string }) => {
    setEditingCourseCategory(category);
    setCourseCategoryForm({ name: category.name });
    setShowCourseCategoryForm(true);
  };

  const handleDeleteCourseCategory = async (id: string) => {
    setConfirmModal({
      show: true,
      title: "تأكيد الحذف",
      message: "هل أنت متأكد من حذف هذا التصنيف؟ سيتم رفض الحذف إذا كان هناك كورسات تستخدمه.",
      confirmText: "حذف",
      cancelText: "إلغاء",
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, show: false });
        
        if (!db) {
          setMessage({ type: "error", text: "Firebase غير مهيأ. يرجى إعادة تحميل الصفحة." });
          return;
        }

        try {
          // التحقق من وجود كورسات تستخدم هذا التصنيف
          const coursesQuery = query(collection(db, "courses"), where("category", "==", id));
          const coursesSnapshot = await getDocs(coursesQuery);

          if (!coursesSnapshot.empty) {
            setMessage({ type: "error", text: `لا يمكن حذف التصنيف: يوجد كورسات تستخدم هذا التصنيف` });
            return;
          }

          const categoryRef = doc(db, "courseCategories", id);
          await deleteDoc(categoryRef);

        setMessage({ type: "success", text: "تم حذف تصنيف الكورسات بنجاح" });
        loadData();
    } catch (error: any) {
          console.error("Error deleting course category:", error);
          setMessage({ type: "error", text: error.message || "حدث خطأ أثناء حذف تصنيف الكورسات" });
    }
      },
    });
  };

  // Educational Level functions
  const handleEducationalLevelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    if (!db) {
      setMessage({ type: "error", text: "Firebase غير مهيأ. يرجى إعادة تحميل الصفحة." });
      setSubmitting(false);
      return;
    }

    try {
      const levelName = educationalLevelForm.name.trim();
      if (!levelName) {
        setMessage({ type: "error", text: "اسم المرحلة التعليمية مطلوب" });
        setSubmitting(false);
        return;
      }

      if (editingEducationalLevel) {
        // تحديث المرحلة التعليمية
        const educationalLevelsQuery = query(
          collection(db, "educationalLevels"),
          where("name", "==", levelName)
        );
        const existingLevels = await getDocs(educationalLevelsQuery);
        
        const hasDuplicate = existingLevels.docs.some(
          (doc) => doc.id !== editingEducationalLevel.id
        );

        if (hasDuplicate) {
          setMessage({ type: "error", text: "اسم المرحلة التعليمية موجود بالفعل" });
          setSubmitting(false);
          return;
        }

        const levelRef = doc(db, "educationalLevels", editingEducationalLevel.id);
        await updateDoc(levelRef, {
          name: levelName,
          updatedAt: serverTimestamp(),
        });

        setMessage({ type: "success", text: "تم تحديث المرحلة التعليمية بنجاح" });
      } else {
        // إضافة مرحلة تعليمية جديدة
        const educationalLevelsQuery = query(
          collection(db, "educationalLevels"),
          where("name", "==", levelName)
        );
        const existingLevels = await getDocs(educationalLevelsQuery);

        if (!existingLevels.empty) {
          setMessage({ type: "error", text: "اسم المرحلة التعليمية موجود بالفعل" });
          setSubmitting(false);
          return;
        }

        await addDoc(collection(db, "educationalLevels"), {
          name: levelName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        setMessage({ type: "success", text: "تم إضافة المرحلة التعليمية بنجاح" });
      }

        setShowEducationalLevelForm(false);
        setEditingEducationalLevel(null);
        setEducationalLevelForm({ name: "" });
        loadData();
    } catch (error: any) {
      console.error("Error saving educational level:", error);
      setMessage({ type: "error", text: error.message || "حدث خطأ أثناء حفظ المرحلة التعليمية" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditEducationalLevel = (level: { id: string; name: string }) => {
    setEditingEducationalLevel(level);
    setEducationalLevelForm({ name: level.name });
    setShowEducationalLevelForm(true);
  };

  // Video functions
  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    if (!db) {
      setMessage({ type: "error", text: "Firebase غير مهيأ. يرجى إعادة تحميل الصفحة." });
      setSubmitting(false);
      return;
    }

    try {
      if (!videoForm.category) {
        setMessage({ type: "error", text: "يجب اختيار تصنيف للفيديو" });
        setSubmitting(false);
        return;
      }

      if (!videoForm.title || !videoForm.description) {
        setMessage({ type: "error", text: "العنوان والوصف مطلوبان" });
        setSubmitting(false);
        return;
      }

      // التحقق من وجود التصنيف
      const categoryRef = doc(db, "categories", videoForm.category);
      const categoryDoc = await getDoc(categoryRef);
      if (!categoryDoc.exists()) {
        setMessage({ type: "error", text: "التصنيف المحدد غير موجود" });
        setSubmitting(false);
        return;
      }

      if (editingVideo) {
        // تحديث الفيديو
        const videoRef = doc(db, "videos", editingVideo.id);
        await updateDoc(videoRef, {
          title: videoForm.title,
          thumbnailUrl: videoForm.thumbnailUrl || "",
          description: videoForm.description,
          category: videoForm.category,
          level: videoForm.level || "مبتدئ",
          updatedAt: serverTimestamp(),
      });

        // إذا كان videoUrl موجود، تحديث private/source
        if (videoForm.videoUrl) {
          const privateSourceRef = doc(db, "videos", editingVideo.id, "private", "source");
          await setDoc(privateSourceRef, {
            url: videoForm.videoUrl,
          }, { merge: true });
        }

        setMessage({ type: "success", text: "تم تحديث الفيديو بنجاح" });
      } else {
        // إضافة فيديو جديد
        const videoRef = await addDoc(collection(db, "videos"), {
          title: videoForm.title,
          thumbnailUrl: videoForm.thumbnailUrl || "",
          description: videoForm.description,
          category: videoForm.category,
          level: videoForm.level || "مبتدئ",
          views: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // إنشاء private subcollection مع videoUrl
        if (videoForm.videoUrl) {
          const privateSourceRef = doc(db, "videos", videoRef.id, "private", "source");
          await setDoc(privateSourceRef, {
            url: videoForm.videoUrl,
          });
        }

        setMessage({ type: "success", text: "تم إضافة الفيديو بنجاح" });
      }

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
    } catch (error: any) {
      console.error("Error saving video:", error);
      setMessage({ type: "error", text: error.message || "حدث خطأ أثناء حفظ الفيديو" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditVideo = async (video: Video) => {
    setEditingVideo(video);
    
    // جلب videoUrl من private subcollection
    let videoUrl = video.videoUrl || "";
    if (db && video.id) {
      try {
        const privateSourceRef = doc(db, "videos", video.id, "private", "source");
        const privateSourceDoc = await getDoc(privateSourceRef);
        if (privateSourceDoc.exists()) {
          const data = privateSourceDoc.data();
          videoUrl = data.url || "";
        }
      } catch (error) {
        console.error("Error fetching video URL from private subcollection:", error);
      }
    }
    
    setVideoForm({
      title: video.title,
      videoUrl: videoUrl,
      thumbnailUrl: video.thumbnailUrl || "",
      description: video.description,
      category: video.category || "",
      level: video.level,
    });
    setShowVideoForm(true);
  };

  const handleDeleteVideo = async (id: string) => {
    setConfirmModal({
      show: true,
      title: "تأكيد الحذف",
      message: "هل أنت متأكد من حذف هذا الفيديو؟",
      confirmText: "حذف",
      cancelText: "إلغاء",
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, show: false });
        
        if (!db) {
          setMessage({ type: "error", text: "Firebase غير مهيأ. يرجى إعادة تحميل الصفحة." });
          return;
        }

        try {
          // حذف private subcollection أولاً
          const privateSourceRef = doc(db, "videos", id, "private", "source");
          const privateSourceDoc = await getDoc(privateSourceRef);
          if (privateSourceDoc.exists()) {
            await deleteDoc(privateSourceRef);
          }

          // حذف المستند الرئيسي
          const videoRef = doc(db, "videos", id);
          await deleteDoc(videoRef);

        setMessage({ type: "success", text: "تم حذف الفيديو بنجاح" });
        loadData();
    } catch (error: any) {
          console.error("Error deleting video:", error);
          setMessage({ type: "error", text: error.message || "حدث خطأ أثناء حذف الفيديو" });
    }
      },
    });
  };

  // Test functions
  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    if (!db) {
      setMessage({ type: "error", text: "Firebase غير مهيأ. يرجى إعادة تحميل الصفحة." });
      setSubmitting(false);
      return;
    }

    try {
      if (!testForm.title || !testForm.description) {
        setMessage({ type: "error", text: "العنوان والوصف مطلوبان" });
        setSubmitting(false);
        return;
      }

      if (!testForm.questionsData || testForm.questionsData.length === 0) {
        setMessage({ type: "error", text: "يجب إضافة سؤال واحد على الأقل" });
        setSubmitting(false);
        return;
      }

      const questions = testForm.questionsData.length;
      const duration = testForm.duration || `${questions * 5} دقيقة`;

      if (editingTest) {
        // تحديث الاختبار
        const testRef = doc(db, "tests", editingTest.id);
        await updateDoc(testRef, {
          title: testForm.title,
          description: testForm.description,
          category: testForm.category || "",
          level: testForm.level || "مبتدئ",
          duration: duration,
          updatedAt: serverTimestamp(),
        });

        // تحديث private/content مع questionsData
        const privateContentRef = doc(db, "tests", editingTest.id, "private", "content");
        await setDoc(privateContentRef, {
          questionsData: testForm.questionsData,
        }, { merge: true });

        setMessage({ type: "success", text: "تم تحديث الاختبار بنجاح" });
      } else {
        // إضافة اختبار جديد
        const testRef = await addDoc(collection(db, "tests"), {
          title: testForm.title,
          description: testForm.description,
          category: testForm.category || "",
          level: testForm.level || "مبتدئ",
          duration: duration,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // إنشاء private subcollection مع questionsData
        const privateContentRef = doc(db, "tests", testRef.id, "private", "content");
        await setDoc(privateContentRef, {
          questionsData: testForm.questionsData,
        });

        setMessage({ type: "success", text: "تم إضافة الاختبار بنجاح" });
      }

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
    } catch (error: any) {
      console.error("Error saving test:", error);
      setMessage({ type: "error", text: error.message || "حدث خطأ أثناء حفظ الاختبار" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTest = async (test: Test) => {
    setEditingTest(test);
    
    // جلب questionsData من private subcollection
    let questionsData = test.questionsData || [];
    if (db && test.id) {
      try {
        const privateContentRef = doc(db, "tests", test.id, "private", "content");
        const privateContentDoc = await getDoc(privateContentRef);
        if (privateContentDoc.exists()) {
          const data = privateContentDoc.data();
          questionsData = data.questionsData || [];
        }
      } catch (error) {
        console.error("Error fetching questions data from private subcollection:", error);
      }
    }
    
    setTestForm({
      title: test.title,
      description: test.description,
      duration: test.duration,
      category: test.category,
      level: test.level,
      questionsData: questionsData,
    });
    setShowTestForm(true);
  };

  const handleDeleteTest = async (id: string) => {
    setConfirmModal({
      show: true,
      title: "تأكيد الحذف",
      message: "هل أنت متأكد من حذف هذا الاختبار؟",
      confirmText: "حذف",
      cancelText: "إلغاء",
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, show: false });
        
        if (!db) {
          setMessage({ type: "error", text: "Firebase غير مهيأ. يرجى إعادة تحميل الصفحة." });
          return;
        }

        try {
          // حذف private subcollection أولاً
          const privateContentRef = doc(db, "tests", id, "private", "content");
          const privateContentDoc = await getDoc(privateContentRef);
          if (privateContentDoc.exists()) {
            await deleteDoc(privateContentRef);
          }

          // حذف المستند الرئيسي
          const testRef = doc(db, "tests", id);
          await deleteDoc(testRef);

        setMessage({ type: "success", text: "تم حذف الاختبار بنجاح" });
        loadData();
    } catch (error: any) {
          console.error("Error deleting test:", error);
          setMessage({ type: "error", text: error.message || "حدث خطأ أثناء حذف الاختبار" });
    }
      },
    });
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

    if (!db) {
      setMessage({ type: "error", text: "Firebase غير مهيأ. يرجى إعادة تحميل الصفحة." });
      setSubmitting(false);
      return;
    }

    try {
      if (!courseForm.category) {
        setMessage({ type: "error", text: "يجب اختيار تصنيف للكورس" });
        setSubmitting(false);
        return;
      }

      if (!courseForm.title || !courseForm.description) {
        setMessage({ type: "error", text: "العنوان والوصف مطلوبان" });
        setSubmitting(false);
        return;
      }

      // التحقق من وجود التصنيف
      const categoryRef = doc(db, "courseCategories", courseForm.category);
      const categoryDoc = await getDoc(categoryRef);
      if (!categoryDoc.exists()) {
        setMessage({ type: "error", text: "التصنيف المحدد غير موجود" });
        setSubmitting(false);
        return;
      }

      if (editingCourse) {
        // تحديث الكورس
        const courseRef = doc(db, "courses", editingCourse.id);
        await updateDoc(courseRef, {
          title: courseForm.title,
          description: courseForm.description,
          thumbnailUrl: courseForm.thumbnailUrl || "",
          duration: courseForm.duration || "0 ساعة",
          level: courseForm.level || "مبتدئ",
          instructor: courseForm.instructor || "عمر عرفة",
          category: courseForm.category,
          updatedAt: serverTimestamp(),
        });

        // إذا كان videoUrl موجود، تحديث private/source
        if (courseForm.videoUrl) {
          const privateSourceRef = doc(db, "courses", editingCourse.id, "private", "source");
          await setDoc(privateSourceRef, {
            url: courseForm.videoUrl,
          }, { merge: true });
        }

        setMessage({ type: "success", text: "تم تحديث الكورس بنجاح" });
      } else {
        // إضافة كورس جديد
        const courseRef = await addDoc(collection(db, "courses"), {
          title: courseForm.title,
          description: courseForm.description,
          thumbnailUrl: courseForm.thumbnailUrl || "",
          duration: courseForm.duration || "0 ساعة",
          level: courseForm.level || "مبتدئ",
          instructor: courseForm.instructor || "عمر عرفة",
          category: courseForm.category,
          students: 0,
          rating: 0,
          lessons: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // إنشاء private subcollection مع videoUrl
        if (courseForm.videoUrl) {
          const privateSourceRef = doc(db, "courses", courseRef.id, "private", "source");
          await setDoc(privateSourceRef, {
            url: courseForm.videoUrl,
          });
        }

        setMessage({ type: "success", text: "تم إضافة الكورس بنجاح" });
      }

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
    } catch (error: any) {
      console.error("Error saving course:", error);
      setMessage({ type: "error", text: error.message || "حدث خطأ أثناء حفظ الكورس" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCourse = async (course: Course) => {
    setEditingCourse(course);
    
    // جلب videoUrl من private subcollection
    let videoUrl = course.videoUrl || "";
    if (db && course.id) {
      try {
        const privateSourceRef = doc(db, "courses", course.id, "private", "source");
        const privateSourceDoc = await getDoc(privateSourceRef);
        if (privateSourceDoc.exists()) {
          const data = privateSourceDoc.data();
          videoUrl = data.url || "";
        }
      } catch (error) {
        console.error("Error fetching course URL from private subcollection:", error);
      }
    }
    
    setCourseForm({
      title: course.title,
      description: course.description,
      videoUrl: videoUrl,
      thumbnailUrl: course.thumbnailUrl || "",
      duration: course.duration,
      level: course.level,
      instructor: course.instructor,
      category: course.category || "",
    });
    setShowCourseForm(true);
  };

  const handleDeleteCourse = async (id: string) => {
    setConfirmModal({
      show: true,
      title: "تأكيد الحذف",
      message: "هل أنت متأكد من حذف هذا الكورس؟",
      confirmText: "حذف",
      cancelText: "إلغاء",
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, show: false });
        
        if (!db) {
          setMessage({ type: "error", text: "Firebase غير مهيأ. يرجى إعادة تحميل الصفحة." });
          return;
        }

        try {
          // حذف private subcollection أولاً
          const privateSourceRef = doc(db, "courses", id, "private", "source");
          const privateSourceDoc = await getDoc(privateSourceRef);
          if (privateSourceDoc.exists()) {
            await deleteDoc(privateSourceRef);
          }

          // حذف المستند الرئيسي
          const courseRef = doc(db, "courses", id);
          await deleteDoc(courseRef);

        setMessage({ type: "success", text: "تم حذف الكورس بنجاح" });
        loadData();
        } catch (error: any) {
          console.error("Error deleting course:", error);
          setMessage({ type: "error", text: error.message || "حدث خطأ أثناء حذف الكورس" });
        }
      },
    });
  };

  // Subscription functions
  const handleSubscriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    if (!db || !user?.uid) {
      setMessage({ type: "error", text: "Firebase غير مهيأ أو المستخدم غير مسجل دخول." });
      setSubmitting(false);
      return;
    }

    try {
      const userId = subscriptionForm.userId.trim();
      if (!userId) {
        setMessage({ type: "error", text: "معرف المستخدم مطلوب" });
        setSubmitting(false);
        return;
      }

      // التحقق من وجود المستخدم وجلب بياناته
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        setMessage({ type: "error", text: "المستخدم غير موجود" });
        setSubmitting(false);
        return;
      }

      // جلب بيانات المستخدم
      const userData = userDoc.data();
      const userName = userData.name || "";
      const userEmail = userData.email || "";
      const userPhone = userData.phone || "";

      // التحقق من وجود اشتراك سابق
      const subscriptionRef = doc(db, "subscriptions", userId);
      const subscriptionDoc = await getDoc(subscriptionRef);
      
      if (subscriptionDoc.exists()) {
        setMessage({ type: "error", text: "المستخدم لديه اشتراك موجود بالفعل" });
        setSubmitting(false);
        return;
      }

      // حساب تاريخ الانتهاء (شهر واحد من الآن)
      const now = new Date();
      const endsAt = new Date(now);
      endsAt.setMonth(endsAt.getMonth() + 1);

      // إنشاء الاشتراك مع بيانات المستخدم
      await setDoc(subscriptionRef, {
        userId: userId,
        adminId: user.uid,
        createdAt: serverTimestamp(),
        endsAt: endsAt,
        userName: userName,
        userEmail: userEmail,
        userPhone: userPhone,
      });

      setMessage({ type: "success", text: "تم إضافة الاشتراك بنجاح" });
      setShowSubscriptionForm(false);
      setSubscriptionForm({ userId: "" });
      loadData();
    } catch (error: any) {
      console.error("Error saving subscription:", error);
      setMessage({ type: "error", text: error.message || "حدث خطأ أثناء حفظ الاشتراك" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubscription = async (userId: string) => {
    setConfirmModal({
      show: true,
      title: "تأكيد الحذف",
      message: "هل أنت متأكد من حذف هذا الاشتراك؟",
      confirmText: "حذف",
      cancelText: "إلغاء",
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, show: false });
        
        if (!db) {
          setMessage({ type: "error", text: "Firebase غير مهيأ. يرجى إعادة تحميل الصفحة." });
          return;
        }

        try {
          const subscriptionRef = doc(db, "subscriptions", userId);
          await deleteDoc(subscriptionRef);

          setMessage({ type: "success", text: "تم حذف الاشتراك بنجاح" });
          loadData();
        } catch (error: any) {
          console.error("Error deleting subscription:", error);
          setMessage({ type: "error", text: error.message || "حدث خطأ أثناء حذف الاشتراك" });
        }
      },
    });
  };

  // إظهار loading أثناء تحميل session أو التحقق من Admin
  if (sessionLoading || loading) {
    return <AdminDashboardSkeleton />;
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
              إدارة التصنيفات والفيديوهات والاختبارات والكورسات
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
            { id: "categories" as const, label: "تصنيفات الفيديوهات", icon: Tag },
            { id: "courseCategories" as const, label: "تصنيفات الكورسات", icon: BookOpen },
            { id: "educationalLevels" as const, label: "المراحل التعليمية", icon: GraduationCap },
            { id: "videos" as const, label: "الفيديوهات", icon: Video },
            { id: "tests" as const, label: "الاختبارات", icon: FileText },
            { id: "courses" as const, label: "الكورسات", icon: BookOpen },
            { id: "subscriptions" as const, label: "الاشتراكات", icon: CreditCard },
            { id: "messages" as const, label: "الرسائل", icon: MessageSquare },
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
            {categories.length === 0 && !loading ? (
              <div className="text-center py-12 card card-padding">
                <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                  لا توجد تصنيفات. أضف تصنيفاً جديداً للبدء.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  يجب إضافة تصنيف على الأقل قبل إضافة فيديوهات.
                </p>
              </div>
            ) : categories.length === 0 && loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <CategoryCardSkeleton key={i} />
                ))}
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

        {/* Course Categories Tab */}
        {activeTab === "courseCategories" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                إدارة تصنيفات الكورسات
              </h2>
              <button
                onClick={() => {
                  setEditingCourseCategory(null);
                  setCourseCategoryForm({ name: "" });
                  setShowCourseCategoryForm(true);
                }}
                className="flex items-center gap-2 btn-primary w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">إضافة تصنيف</span>
              </button>
            </div>

            {/* Course Category Form */}
            <AnimatePresence>
              {showCourseCategoryForm && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="card mb-6 md:mb-8 card-padding"
                >
                  <form onSubmit={handleCourseCategorySubmit} className="form-spacing">
                    <div>
                      <label className="block mb-2 md:mb-3 font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300">
                        اسم التصنيف
                      </label>
                      <input
                        type="text"
                        required
                        value={courseCategoryForm.name}
                        onChange={(e) => setCourseCategoryForm({ name: e.target.value })}
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
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : editingCourseCategory ? "تحديث" : "إضافة"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCourseCategoryForm(false);
                          setEditingCourseCategory(null);
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

            {/* Course Categories List */}
            {courseCategories.length === 0 && !loading ? (
              <div className="text-center py-12 card card-padding">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                  لا توجد تصنيفات للكورسات. أضف تصنيفاً جديداً للبدء.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  يجب إضافة تصنيف على الأقل قبل إضافة كورسات.
                </p>
              </div>
            ) : courseCategories.length === 0 && loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <CategoryCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {courseCategories.map((category) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card card-padding hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center shadow-md">
                          <BookOpen className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{category.name}</h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCourseCategory(category)}
                          className="p-2.5 text-[#FF6B35] hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all duration-300 hover:scale-110"
                        >
                          <Edit className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => handleDeleteCourseCategory(category.id)}
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

        {/* Educational Levels Tab */}
        {activeTab === "educationalLevels" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                إدارة المراحل التعليمية
              </h2>
              <button
                onClick={() => {
                  setEditingEducationalLevel(null);
                  setEducationalLevelForm({ name: "" });
                  setShowEducationalLevelForm(true);
                }}
                className="flex items-center gap-2 btn-primary w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">إضافة مرحلة تعليمية</span>
              </button>
            </div>

            {/* Educational Level Form */}
            <AnimatePresence>
              {showEducationalLevelForm && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="card mb-6 md:mb-8 card-padding"
                >
                  <form onSubmit={handleEducationalLevelSubmit} className="form-spacing">
                    <div>
                      <label className="block mb-2 md:mb-3 font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300">
                        اسم المرحلة التعليمية
                      </label>
                      <input
                        type="text"
                        required
                        value={educationalLevelForm.name}
                        onChange={(e) => setEducationalLevelForm({ name: e.target.value })}
                        placeholder="مثال: ابتدائي، إعدادي، ثانوي، جامعي..."
                        className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary flex-1"
                      >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : editingEducationalLevel ? "تحديث" : "إضافة"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEducationalLevelForm(false);
                          setEditingEducationalLevel(null);
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

            {/* Educational Levels List */}
            {educationalLevels.length === 0 && !loading ? (
              <div className="text-center py-12 card card-padding">
                <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                  لا توجد مراحل تعليمية. أضف مرحلة تعليمية جديدة للبدء.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  يمكن ربط المراحل التعليمية بالفيديوهات والكورسات والاختبارات.
                </p>
              </div>
            ) : educationalLevels.length === 0 && loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <CategoryCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {educationalLevels.map((level) => (
                  <motion.div
                    key={level.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card card-padding hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center shadow-md">
                          <GraduationCap className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{level.name}</h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditEducationalLevel(level)}
                          className="p-2.5 text-[#FF6B35] hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all duration-300 hover:scale-110"
                        >
                          <Edit className="w-4 h-4" strokeWidth={2.5} />
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
            {dataLoading && videos.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <VideoCardSkeleton key={i} />
                ))}
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-12 card card-padding">
                <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  لا توجد فيديوهات. أضف فيديو جديداً للبدء.
                </p>
              </div>
            ) : (
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
            )}
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
                        <label className="font-semibold text-gray-900 dark:text-white">الأسئلة</label>
                        <button
                          type="button"
                          onClick={addQuestion}
                          className="flex items-center gap-2 px-4 py-2.5 btn-primary text-white font-semibold"
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
            {dataLoading && tests.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <TestCardSkeleton key={i} />
                ))}
              </div>
            ) : tests.length === 0 ? (
              <div className="text-center py-12 card card-padding">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  لا توجد اختبارات. أضف اختباراً جديداً للبدء.
                </p>
              </div>
            ) : (
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
            )}
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                إدارة الكورسات
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
                <span className="text-sm md:text-base">إضافة كورس</span>
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
                        <label className="block mb-2 md:mb-3 font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300">عنوان الكورس</label>
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
                        {courseCategories.length === 0 ? (
                          <div className="p-4 border border-yellow-300 dark:border-yellow-700 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                              يجب إضافة تصنيف أولاً من قسم "تصنيفات الكورسات"
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
                            {courseCategories.map((cat) => (
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
            {dataLoading && courses.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-12 card card-padding">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  لا توجد كورسات. أضف كورس جديد للبدء.
                </p>
              </div>
            ) : (
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
            )}
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === "subscriptions" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                إدارة الاشتراكات
              </h2>
              <button
                onClick={() => {
                  setSubscriptionForm({ userId: "" });
                  setShowSubscriptionForm(true);
                }}
                className="flex items-center gap-2 btn-primary w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">إضافة اشتراك</span>
              </button>
      </div>

            {/* Subscription Form */}
            <AnimatePresence>
              {showSubscriptionForm && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="card mb-6 md:mb-8 card-padding"
                >
                  <form onSubmit={handleSubscriptionSubmit} className="form-spacing">
                    <div>
                      <label className="block mb-2 md:mb-3 font-semibold text-sm md:text-base text-gray-700 dark:text-gray-300">
                        معرف المستخدم (User ID)
                      </label>
                      <input
                        type="text"
                        required
                        value={subscriptionForm.userId}
                        onChange={(e) => setSubscriptionForm({ userId: e.target.value })}
                        placeholder="أدخل User ID الخاص بالطالب"
                        className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
                      />
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        سيتم إنشاء اشتراك لمدة شهر واحد تلقائياً
                      </p>
                    </div>

                    <div className="flex gap-3 md:gap-4">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                            <span>جاري الإضافة...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 md:w-5 md:h-5" />
                            <span>إضافة اشتراك</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSubscriptionForm(false);
                          setSubscriptionForm({ userId: "" });
                        }}
                        className="flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                      >
                        <X className="w-4 h-4 md:w-5 md:h-5" />
                        <span>إلغاء</span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search Bar */}
            <div className="mb-6 md:mb-8">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث بالاسم، الإيميل، رقم التليفون، أو User ID..."
                  value={subscriptionSearch}
                  onChange={(e) => setSubscriptionSearch(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Subscriptions List */}
            {dataLoading && subscriptions.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <SubscriptionCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {(() => {
                  // فلترة الاشتراكات حسب البحث
                  const filteredSubscriptions = subscriptions.filter((subscription) => {
                    if (!subscriptionSearch.trim()) return true;
                    const search = subscriptionSearch.toLowerCase();
                    return (
                      subscription.userId.toLowerCase().includes(search) ||
                      (subscription.userName || "").toLowerCase().includes(search) ||
                      (subscription.userEmail || "").toLowerCase().includes(search) ||
                      (subscription.userPhone || "").includes(search)
                    );
                  });

                  if (filteredSubscriptions.length === 0) {
                    return (
                      <div key="no-results" className="col-span-full text-center py-12">
                        <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-400">
                          {subscriptionSearch ? "لا توجد نتائج للبحث" : "لا توجد اشتراكات"}
                        </p>
                      </div>
                    );
                  }

                  return filteredSubscriptions.map((subscription) => {
                  const createdAt = subscription.createdAt?.toDate ? subscription.createdAt.toDate() : null;
                  const endsAt = subscription.endsAt?.toDate ? subscription.endsAt.toDate() : new Date(subscription.endsAt);
                  const isExpired = endsAt < new Date();
                  
                  return (
                    <motion.div
                      key={subscription.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`card overflow-hidden hover:shadow-xl transition-shadow duration-300 ${
                        isExpired ? "border-2 border-red-300 dark:border-red-700" : ""
                      }`}
                    >
                      <div className="card-padding">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            {subscription.userName && (
                              <h3 className="font-bold mb-2 text-base md:text-lg text-gray-900 dark:text-white">
                                {subscription.userName}
                              </h3>
                            )}
                            {subscription.userEmail && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                {subscription.userEmail}
                              </p>
                            )}
                            {subscription.userPhone && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                {subscription.userPhone}
                              </p>
                            )}
                            <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
                              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                User ID:
                              </p>
                              <p className="text-xs text-gray-800 dark:text-gray-200 font-mono break-all">
                                {subscription.userId}
                              </p>
                            </div>
                          </div>
                          {isExpired && (
                            <span className="px-2 py-1 text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded whitespace-nowrap">
                              منتهي
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 mb-4">
                          {createdAt && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-semibold">تاريخ البدء:</span>{" "}
                              {createdAt.toLocaleDateString("ar-EG", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </div>
                          )}
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-semibold">تاريخ الانتهاء:</span>{" "}
                            {endsAt.toLocaleDateString("ar-EG", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteSubscription(subscription.userId)}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg w-full"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                            <span>حذف</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                  });
                })()}
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                الرسائل والشكاوي
              </h2>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ابحث بالاسم، الإيميل، رقم التليفون، أو الموضوع..."
                  value={messageSearch}
                  onChange={(e) => setMessageSearch(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Messages List */}
            {dataLoading && messages.length === 0 ? (
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <MessageCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {(() => {
                  // فلترة الرسائل حسب البحث
                  const filteredMessages = messages.filter((message) => {
                    if (!messageSearch.trim()) return true;
                    const search = messageSearch.toLowerCase();
                    return (
                      message.userName.toLowerCase().includes(search) ||
                      message.userEmail.toLowerCase().includes(search) ||
                      message.userPhone.includes(search) ||
                      message.subject.toLowerCase().includes(search) ||
                      message.message.toLowerCase().includes(search)
                    );
                  });

                  if (filteredMessages.length === 0) {
                    return (
                      <div className="col-span-full text-center py-12">
                        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-400">
                          {messageSearch ? "لا توجد نتائج للبحث" : "لا توجد رسائل"}
                        </p>
                      </div>
                    );
                  }

                  return filteredMessages.map((message) => {
                  const createdAt = message.createdAt?.toDate ? message.createdAt.toDate() : new Date(message.createdAt);
                  
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`card overflow-hidden hover:shadow-xl transition-shadow duration-300 ${
                        !message.read ? "border-2 border-primary-300 dark:border-primary-700" : ""
                      }`}
                    >
                      <div className="card-padding">
                        {/* Header with Subject and Status */}
                        <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-lg md:text-xl text-gray-900 dark:text-white">
                                {message.subject}
                              </h3>
                              {!message.read && (
                                <span className="px-2 py-1 text-xs font-semibold bg-primary-DEFAULT text-white rounded whitespace-nowrap">
                                  جديدة
                                </span>
                              )}
                              {message.read && (
                                <span className="px-2 py-1 text-xs font-semibold bg-gray-500 text-white rounded whitespace-nowrap">
                                  مقروءة
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {createdAt.toLocaleDateString("ar-EG", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>

                        {/* User Information */}
                        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            معلومات المرسل:
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">الاسم</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {message.userName}
                              </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">البريد الإلكتروني</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white break-all">
                                {message.userEmail}
                              </p>
                            </div>
                            {message.userPhone && (
                              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">رقم الهاتف</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {message.userPhone}
                                </p>
                              </div>
                            )}
                            {message.userId && (
                              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">User ID</p>
                                <p className="text-xs font-mono text-gray-900 dark:text-white break-all">
                                  {message.userId}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Message Content */}
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            محتوى الرسالة:
                          </h4>
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                              {message.message}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={async () => {
                              if (!db) return;
                              try {
                                const messageRef = doc(db, "messages", message.id);
                                await updateDoc(messageRef, { read: !message.read });
                                setMessage({ type: "success", text: message.read ? "تم تحديد الرسالة كغير مقروءة" : "تم تحديد الرسالة كمقروءة" });
                                loadData();
                              } catch (error) {
                                console.error("Error updating message:", error);
                                setMessage({ type: "error", text: "حدث خطأ أثناء تحديث الرسالة" });
                              }
                            }}
                            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex-1 ${
                              message.read
                                ? "bg-gray-500 text-white hover:bg-gray-600"
                                : "bg-orange-500 text-white hover:bg-orange-600"
                            }`}
                          >
                            <Check className="w-4 h-4" strokeWidth={2.5} />
                            <span>{message.read ? "تحديد كغير مقروءة" : "تمت القراءة"}</span>
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({
                                show: true,
                                title: "تأكيد الحذف",
                                message: "هل أنت متأكد من حذف هذه الرسالة؟",
                                confirmText: "حذف",
                                cancelText: "إلغاء",
                                onConfirm: async () => {
                                  setConfirmModal({ ...confirmModal, show: false });
                                  if (!db) return;
                                  try {
                                    const messageRef = doc(db, "messages", message.id);
                                    await deleteDoc(messageRef);
                                    setMessage({ type: "success", text: "تم حذف الرسالة بنجاح" });
                                    loadData();
                                  } catch (error: any) {
                                    console.error("Error deleting message:", error);
                                    setMessage({ type: "error", text: error.message || "حدث خطأ أثناء حذف الرسالة" });
                                  }
                                },
                              });
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg flex-1"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                            <span>حذف</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                  });
                })()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmModal({ ...confirmModal, show: false })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4">
                  <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-center mb-3 text-gray-900 dark:text-white">
                {confirmModal.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
                {confirmModal.message}
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                >
                  {confirmModal.cancelText || "إلغاء"}
                </button>
                <button
                  onClick={() => {
                    confirmModal.onConfirm();
                  }}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {confirmModal.confirmText || "تأكيد"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

