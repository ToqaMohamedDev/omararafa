// ============================================
// Validation Utilities - دوال التحقق من صحة البيانات
// ============================================

import { VALIDATION_RULES } from "./constants";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Validation for Video Form
export const validateVideoForm = (form: {
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  description: string;
  category: string;
  level: string;
}): ValidationResult => {
  const errors: string[] = [];

  if (!form.title.trim()) {
    errors.push("عنوان الفيديو مطلوب");
  } else if (form.title.trim().length < VALIDATION_RULES.MIN_TITLE_LENGTH) {
    errors.push(`عنوان الفيديو يجب أن يكون على الأقل ${VALIDATION_RULES.MIN_TITLE_LENGTH} أحرف`);
  } else if (form.title.trim().length > VALIDATION_RULES.MAX_TITLE_LENGTH) {
    errors.push(`عنوان الفيديو يجب أن يكون أقل من ${VALIDATION_RULES.MAX_TITLE_LENGTH} حرف`);
  }

  if (!form.videoUrl.trim()) {
    errors.push("رابط الفيديو مطلوب");
  } else if (!isValidUrl(form.videoUrl.trim())) {
    errors.push("رابط الفيديو غير صحيح");
  }

  if (!form.thumbnailUrl.trim()) {
    errors.push("رابط الصورة المصغرة مطلوب");
  } else if (!isValidUrl(form.thumbnailUrl.trim())) {
    errors.push("رابط الصورة المصغرة غير صحيح");
  }

  if (!form.description.trim()) {
    errors.push("وصف الفيديو مطلوب");
  } else if (form.description.trim().length < VALIDATION_RULES.MIN_DESCRIPTION_LENGTH) {
    errors.push(`وصف الفيديو يجب أن يكون على الأقل ${VALIDATION_RULES.MIN_DESCRIPTION_LENGTH} أحرف`);
  }

  if (!form.category.trim()) {
    errors.push("التصنيف مطلوب");
  }

  if (!form.level.trim()) {
    errors.push("المرحلة التعليمية مطلوبة");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validation for Test Form
export const validateTestForm = (form: {
  title: string;
  description: string;
  duration: string;
  category: string;
  level: string;
  questionsData: Array<any>;
}): ValidationResult => {
  const errors: string[] = [];

  if (!form.title.trim()) {
    errors.push("عنوان الاختبار مطلوب");
  } else if (form.title.trim().length < VALIDATION_RULES.MIN_TITLE_LENGTH) {
    errors.push(`عنوان الاختبار يجب أن يكون على الأقل ${VALIDATION_RULES.MIN_TITLE_LENGTH} أحرف`);
  }

  if (!form.description.trim()) {
    errors.push("وصف الاختبار مطلوب");
  } else if (form.description.trim().length < VALIDATION_RULES.MIN_DESCRIPTION_LENGTH) {
    errors.push(`وصف الاختبار يجب أن يكون على الأقل ${VALIDATION_RULES.MIN_DESCRIPTION_LENGTH} أحرف`);
  }

  if (!form.duration.trim()) {
    errors.push("مدة الاختبار مطلوبة");
  }

  if (!form.category.trim()) {
    errors.push("التصنيف مطلوب");
  }

  if (!form.level.trim()) {
    errors.push("المرحلة التعليمية مطلوبة");
  }

  if (!form.questionsData || form.questionsData.length === 0) {
    errors.push("يجب إضافة سؤال واحد على الأقل");
  } else {
    form.questionsData.forEach((question, index) => {
      if (!question.question?.trim()) {
        errors.push(`السؤال رقم ${index + 1} لا يحتوي على نص`);
      }
      if (!question.options || question.options.length < 2) {
        errors.push(`السؤال رقم ${index + 1} يجب أن يحتوي على خيارين على الأقل`);
      }
      if (typeof question.correctAnswer !== "number" || question.correctAnswer < 0) {
        errors.push(`السؤال رقم ${index + 1} لا يحتوي على إجابة صحيحة`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validation for Course Form
export const validateCourseForm = (form: {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  level: string;
  instructor: string;
  category: string;
}): ValidationResult => {
  const errors: string[] = [];

  if (!form.title.trim()) {
    errors.push("عنوان الكورس مطلوب");
  } else if (form.title.trim().length < VALIDATION_RULES.MIN_TITLE_LENGTH) {
    errors.push(`عنوان الكورس يجب أن يكون على الأقل ${VALIDATION_RULES.MIN_TITLE_LENGTH} أحرف`);
  }

  if (!form.description.trim()) {
    errors.push("وصف الكورس مطلوب");
  } else if (form.description.trim().length < VALIDATION_RULES.MIN_DESCRIPTION_LENGTH) {
    errors.push(`وصف الكورس يجب أن يكون على الأقل ${VALIDATION_RULES.MIN_DESCRIPTION_LENGTH} أحرف`);
  }

  if (form.videoUrl.trim() && !isValidUrl(form.videoUrl.trim())) {
    errors.push("رابط الفيديو غير صحيح");
  }

  if (!form.thumbnailUrl.trim()) {
    errors.push("رابط الصورة المصغرة مطلوب");
  } else if (!isValidUrl(form.thumbnailUrl.trim())) {
    errors.push("رابط الصورة المصغرة غير صحيح");
  }

  if (!form.duration.trim()) {
    errors.push("مدة الكورس مطلوبة");
  }

  if (!form.level.trim()) {
    errors.push("المرحلة التعليمية مطلوبة");
  }

  if (!form.instructor.trim()) {
    errors.push("اسم المدرب مطلوب");
  }

  if (!form.category.trim()) {
    errors.push("التصنيف مطلوب");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validation for Category Form
export const validateCategoryForm = (form: { name: string }): ValidationResult => {
  const errors: string[] = [];

  if (!form.name.trim()) {
    errors.push("اسم التصنيف مطلوب");
  } else if (form.name.trim().length < VALIDATION_RULES.MIN_NAME_LENGTH) {
    errors.push(`اسم التصنيف يجب أن يكون على الأقل ${VALIDATION_RULES.MIN_NAME_LENGTH} أحرف`);
  } else if (form.name.trim().length > VALIDATION_RULES.MAX_NAME_LENGTH) {
    errors.push(`اسم التصنيف يجب أن يكون أقل من ${VALIDATION_RULES.MAX_NAME_LENGTH} حرف`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validation for Educational Level Form
export const validateEducationalLevelForm = (form: {
  id: string;
  name: string;
  imageUrl: string;
}): ValidationResult => {
  const errors: string[] = [];

  if (!form.id.trim()) {
    errors.push("معرف المرحلة التعليمية مطلوب");
  }

  if (!form.name.trim()) {
    errors.push("اسم المرحلة التعليمية مطلوب");
  } else if (form.name.trim().length < VALIDATION_RULES.MIN_NAME_LENGTH) {
    errors.push(`اسم المرحلة التعليمية يجب أن يكون على الأقل ${VALIDATION_RULES.MIN_NAME_LENGTH} أحرف`);
  }

  if (form.imageUrl.trim() && !isValidUrl(form.imageUrl.trim())) {
    errors.push("رابط الصورة غير صحيح");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validation for Subscription Form
export const validateSubscriptionForm = (form: {
  userId: string;
  educationalLevelId: string;
}): ValidationResult => {
  const errors: string[] = [];

  if (!form.userId.trim()) {
    errors.push("معرف المستخدم مطلوب");
  }

  if (!form.educationalLevelId.trim()) {
    errors.push("المرحلة التعليمية مطلوبة");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Helper function to validate URL
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

