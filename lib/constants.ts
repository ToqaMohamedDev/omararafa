// ============================================
// Constants - القيم الثابتة في التطبيق
// ============================================

// Subscription Duration (in months)
export const SUBSCRIPTION_DURATION_MONTHS = 1;

// Default Instructor Name
export const DEFAULT_INSTRUCTOR_NAME = "عمر عرفة";

// Date Format Options
export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
  locale: "ar-EG",
};

// Error Messages
export const ERROR_MESSAGES = {
  FIREBASE_NOT_INITIALIZED: "Firebase غير مهيأ. يرجى إعادة تحميل الصفحة.",
  USER_NOT_LOGGED_IN: "المستخدم غير مسجل دخول.",
  USER_NOT_FOUND: "المستخدم غير موجود",
  USER_ID_REQUIRED: "معرف المستخدم مطلوب",
  EDUCATIONAL_LEVEL_REQUIRED: "المرحلة التعليمية مطلوبة",
  SUBSCRIPTION_EXISTS: "المستخدم لديه اشتراك موجود بالفعل",
  PERMISSION_DENIED: "Firestore Security Rules تمنع القراءة. تأكد من تطبيق القواعد في Firebase Console.",
  GENERIC_ERROR: "حدث خطأ غير متوقع",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SUBSCRIPTION_ADDED: "تم إضافة الاشتراك بنجاح",
  SUBSCRIPTION_DELETED: "تم حذف الاشتراك بنجاح",
  CATEGORY_ADDED: "تم إضافة التصنيف بنجاح",
  CATEGORY_UPDATED: "تم تحديث التصنيف بنجاح",
  CATEGORY_DELETED: "تم حذف التصنيف بنجاح",
  VIDEO_ADDED: "تم إضافة الفيديو بنجاح",
  VIDEO_UPDATED: "تم تحديث الفيديو بنجاح",
  VIDEO_DELETED: "تم حذف الفيديو بنجاح",
  TEST_ADDED: "تم إضافة الاختبار بنجاح",
  TEST_UPDATED: "تم تحديث الاختبار بنجاح",
  TEST_DELETED: "تم حذف الاختبار بنجاح",
  COURSE_ADDED: "تم إضافة الكورس بنجاح",
  COURSE_UPDATED: "تم تحديث الكورس بنجاح",
  COURSE_DELETED: "تم حذف الكورس بنجاح",
  EDUCATIONAL_LEVEL_ADDED: "تم إضافة المرحلة التعليمية بنجاح",
  EDUCATIONAL_LEVEL_UPDATED: "تم تحديث المرحلة التعليمية بنجاح",
  EDUCATIONAL_LEVEL_DELETED: "تم حذف المرحلة التعليمية بنجاح",
  MESSAGE_DELETED: "تم حذف الرسالة بنجاح",
  MESSAGE_MARKED_READ: "تم تحديد الرسالة كمقروءة",
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  MIN_TITLE_LENGTH: 3,
  MAX_TITLE_LENGTH: 200,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 2000,
  MIN_DURATION_LENGTH: 1,
  MAX_DURATION_LENGTH: 50,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
} as const;

// Firestore Collections
export const COLLECTIONS = {
  USERS: "users",
  SUBSCRIPTIONS: "subscriptions",
  CATEGORIES: "categories",
  COURSE_CATEGORIES: "courseCategories",
  EDUCATIONAL_LEVELS: "educationalLevels",
  VIDEOS: "videos",
  TESTS: "tests",
  COURSES: "courses",
  MESSAGES: "messages",
  ROLES: "roles",
} as const;

// Firestore Subcollections
export const SUBCOLLECTIONS = {
  PRIVATE_SOURCE: "private/source",
  PRIVATE_CONTENT: "private/content",
} as const;

