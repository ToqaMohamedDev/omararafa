// ============================================
// Types & Interfaces - جميع أنواع البيانات
// ============================================

// Video Types
export interface Video {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  description: string;
  category: string;
  level: string;
  educationalLevelId?: string; // اختياري للتوافق مع البيانات القديمة
}

export interface VideoForm {
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  description: string;
  category: string;
  level: string;
}

// Test Types
export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Test {
  id: string;
  title: string;
  description: string;
  duration: string;
  questions: number;
  level: string;
  educationalLevelId?: string; // اختياري للتوافق مع البيانات القديمة
  questionsData: Question[];
}

export interface TestForm {
  title: string;
  description: string;
  duration: string;
  questions: number;
  level: string;
  questionsData: Question[];
}

// Course Types
export interface Course {
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

export interface CourseForm {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  level: string;
  instructor: string;
  category: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
}

export interface CategoryForm {
  name: string;
}

// Educational Level Types
export interface EducationalLevel {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface EducationalLevelForm {
  id: string;
  name: string;
  imageUrl: string;
}

// Subscription Types
export interface Subscription {
  id: string;
  userId: string;
  adminId: string;
  createdAt: any;
  endsAt: any;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  educationalLevelId?: string;
}

export interface SubscriptionForm {
  userId: string;
  educationalLevelId: string;
}

// Message Types
export interface Message {
  id: string;
  userId: string | null;
  userName: string;
  userEmail: string;
  userPhone: string;
  subject: string;
  message: string;
  createdAt: any;
  read: boolean;
}

// Admin Tab Types
export type AdminTab = 
  | "categories" 
  | "courseCategories" 
  | "educationalLevels" 
  | "videos" 
  | "tests" 
  | "courses" 
  | "subscriptions" 
  | "messages";

// Message Types (for UI feedback)
export interface MessageState {
  type: "success" | "error";
  text: string;
}

// Confirm Modal Types
export interface ConfirmModal {
  show: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void | Promise<void>;
}

