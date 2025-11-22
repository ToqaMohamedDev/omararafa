// ============================================
// Error Handler - معالج الأخطاء الموحد
// ============================================

import { ERROR_MESSAGES } from "./constants";

export interface ErrorInfo {
  code?: string;
  message: string;
  originalError?: any;
}

/**
 * معالجة الأخطاء من Firebase/Firestore
 */
export const handleFirebaseError = (error: any): string => {
  console.error("Firebase Error:", error);

  // معالجة أخطاء Firestore
  if (error?.code === "permission-denied") {
    return ERROR_MESSAGES.PERMISSION_DENIED;
  }

  if (error?.code === "not-found") {
    return "البيانات المطلوبة غير موجودة";
  }

  if (error?.code === "already-exists") {
    return "البيانات موجودة بالفعل";
  }

  if (error?.code === "invalid-argument") {
    return "البيانات المدخلة غير صحيحة";
  }

  // معالجة أخطاء Auth
  if (error?.code === "auth/user-not-found") {
    return "المستخدم غير موجود";
  }

  if (error?.code === "auth/wrong-password") {
    return "كلمة المرور غير صحيحة";
  }

  if (error?.code === "auth/email-already-in-use") {
    return "البريد الإلكتروني مستخدم بالفعل";
  }

  if (error?.code === "auth/weak-password") {
    return "كلمة المرور ضعيفة جداً";
  }

  if (error?.code === "auth/network-request-failed") {
    return "خطأ في الاتصال بالشبكة. يرجى المحاولة مرة أخرى";
  }

  // رسالة الخطأ الافتراضية
  return error?.message || ERROR_MESSAGES.GENERIC_ERROR;
};

/**
 * معالجة الأخطاء العامة
 */
export const handleGenericError = (error: any, defaultMessage: string = ERROR_MESSAGES.GENERIC_ERROR): string => {
  console.error("Generic Error:", error);
  
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }

  if (typeof error === "string") {
    return error;
  }

  return defaultMessage;
};

/**
 * التحقق من وجود Firebase و DB
 */
export const validateFirebaseSetup = (db: any, user: any): { isValid: boolean; error?: string } => {
  if (!db) {
    return { isValid: false, error: ERROR_MESSAGES.FIREBASE_NOT_INITIALIZED };
  }

  if (!user?.uid) {
    return { isValid: false, error: ERROR_MESSAGES.USER_NOT_LOGGED_IN };
  }

  return { isValid: true };
};

