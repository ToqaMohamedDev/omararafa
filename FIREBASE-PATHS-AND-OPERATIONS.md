# 🔥 Firebase Firestore - دليل شامل للمسارات والعمليات

## 📋 جدول المحتويات
1. [Collections الرئيسية](#collections-الرئيسية)
2. [Subcollections](#subcollections)
3. [Security Rules](#security-rules)
4. [العمليات (Operations)](#العمليات-operations)
5. [Data Flow](#data-flow)
6. [أمثلة على الاستخدام](#أمثلة-على-الاستخدام)

---

## 📦 Collections الرئيسية

### 1. **users** - المستخدمون
**المسار:** `users/{userId}`

**الحقول:**
```typescript
{
  uid: string;                    // معرف المستخدم (مطابق لـ userId)
  name: string;                   // اسم المستخدم
  email: string;                  // البريد الإلكتروني
  photoURL?: string;              // صورة المستخدم
  level?: string;                 // المستوى: "مبتدئ" | "مبتدئ متقدم" | "متوسط" | "متقدم" | "ممتاز"
  levelScore?: number;            // نقاط المستوى (1-5)
  averageScore?: number;          // المعدل العام (0-100)
  completedTests?: number;        // عدد الاختبارات المكتملة
  educationalLevel?: string;      // المرحلة التعليمية
  createdAt: timestamp;          // تاريخ الإنشاء
  updatedAt: timestamp;          // تاريخ آخر تحديث
}
```

**العمليات:**
- ✅ **Create:** المستخدم يمكنه إنشاء حسابه فقط (`request.auth.uid == userId`)
- ✅ **Read:** المستخدم يمكنه قراءة حسابه فقط
- ✅ **Update:** المستخدم يمكنه تحديث حسابه فقط
- ❌ **Delete:** المستخدم يمكنه حذف حسابه

**الأماكن المستخدمة:**
- `app/auth/register/page.tsx` - إنشاء حساب جديد
- `app/auth/login/page.tsx` - تسجيل الدخول
- `hooks/useSession.tsx` - إدارة الجلسة
- `app/profile/page.tsx` - عرض البروفايل
- `app/tests/page.tsx` - تحديث المستوى بعد الاختبار
- `app/admin/page.tsx` - عرض المستخدمين

---

### 2. **subscriptions** - الاشتراكات
**المسار:** `subscriptions/{subscriptionId}` (subscriptionId = userId)

**الحقول:**
```typescript
{
  userId: string;                 // معرف المستخدم
  educationalLevelId: string;     // ID المرحلة التعليمية المشترك فيها
  startsAt: timestamp;            // تاريخ بداية الاشتراك
  endsAt: timestamp;              // تاريخ انتهاء الاشتراك
  createdAt: timestamp;           // تاريخ الإنشاء
  updatedAt: timestamp;           // تاريخ آخر تحديث
}
```

**العمليات:**
- ✅ **Read:** المستخدم يمكنه قراءة اشتراكه فقط أو الأدمن
- ✅ **Write:** الأدمن فقط

**الأماكن المستخدمة:**
- `app/tests/page.tsx` - التحقق من الاشتراك
- `components/VideoSection.tsx` - التحقق من الاشتراك
- `app/courses/page.tsx` - التحقق من الاشتراك
- `app/admin/page.tsx` - إدارة الاشتراكات

---

### 3. **roles** - الأدوار
**المسار:** `roles/{userId}`

**الحقول:**
```typescript
{
  role: "admin";                  // الدور (admin فقط)
}
```

**العمليات:**
- ✅ **Read:** الأدمن فقط
- ❌ **Write:** محظور (false)

**الأماكن المستخدمة:**
- `app/admin/page.tsx` - التحقق من صلاحيات الأدمن
- `components/Navbar.tsx` - عرض/إخفاء روابط الأدمن

---

### 4. **educationalLevels** - المراحل التعليمية
**المسار:** `educationalLevels/{levelId}`

**الحقول:**
```typescript
{
  id: string;                     // معرف المرحلة (مطابق لـ levelId)
  name: string;                   // اسم المرحلة
  imageUrl?: string;              // صورة المرحلة
  createdAt: timestamp;           // تاريخ الإنشاء
  updatedAt: timestamp;           // تاريخ آخر تحديث
}
```

**العمليات:**
- ✅ **Read:** الجميع
- ✅ **Write:** الأدمن فقط

**الأماكن المستخدمة:**
- `app/tests/page.tsx` - عرض المراحل التعليمية
- `components/VideoSection.tsx` - عرض المراحل التعليمية
- `app/courses/page.tsx` - عرض المراحل التعليمية
- `app/admin/page.tsx` - إدارة المراحل التعليمية

---

### 5. **categories** - التصنيفات (للفيديوهات)
**المسار:** `categories/{categoryId}`

**الحقول:**
```typescript
{
  id: string;                     // معرف التصنيف
  name: string;                   // اسم التصنيف
  createdAt: timestamp;           // تاريخ الإنشاء
  updatedAt: timestamp;          // تاريخ آخر تحديث
}
```

**العمليات:**
- ✅ **Read:** الجميع
- ✅ **Write:** الأدمن فقط

**الأماكن المستخدمة:**
- `components/CategoriesSection.tsx` - عرض التصنيفات
- `components/VideoSection.tsx` - فلترة الفيديوهات
- `app/admin/page.tsx` - إدارة التصنيفات

---

### 6. **courseCategories** - تصنيفات الكورسات
**المسار:** `courseCategories/{categoryId}`

**الحقول:**
```typescript
{
  id: string;                     // معرف التصنيف
  name: string;                   // اسم التصنيف
  createdAt: timestamp;           // تاريخ الإنشاء
  updatedAt: timestamp;          // تاريخ آخر تحديث
}
```

**العمليات:**
- ✅ **Read:** الجميع
- ✅ **Write:** الأدمن فقط

**الأماكن المستخدمة:**
- `app/courses/page.tsx` - فلترة الكورسات
- `app/admin/page.tsx` - إدارة تصنيفات الكورسات

---

### 7. **videos** - الفيديوهات
**المسار:** `videos/{videoId}`

**الحقول:**
```typescript
{
  id: string;                     // معرف الفيديو
  title: string;                  // عنوان الفيديو
  description: string;            // وصف الفيديو
  category: string;                // ID التصنيف
  level: string;                   // ID المرحلة التعليمية
  thumbnailUrl?: string;           // صورة مصغرة
  thumbnail?: string;              // صورة مصغرة (بديل)
  videoUrl?: string;               // رابط الفيديو (عام)
  views?: number;                  // عدد المشاهدات
  duration?: string;               // مدة الفيديو
  createdAt: timestamp;           // تاريخ الإنشاء
  updatedAt: timestamp;          // تاريخ آخر تحديث
}
```

**العمليات:**
- ✅ **Read:** الجميع (البيانات العامة)
- ✅ **Write:** الأدمن فقط

**الأماكن المستخدمة:**
- `components/VideoSection.tsx` - عرض الفيديوهات
- `components/CategoriesSection.tsx` - حساب عدد الفيديوهات
- `components/StatsSection.tsx` - إحصائيات الفيديوهات
- `app/admin/page.tsx` - إدارة الفيديوهات

---

### 8. **tests** - الاختبارات
**المسار:** `tests/{testId}`

**الحقول:**
```typescript
{
  id: string;                     // معرف الاختبار
  title: string;                  // عنوان الاختبار
  description: string;            // وصف الاختبار
  level: string;                  // ID المرحلة التعليمية
  duration: string;               // مدة الاختبار (مثل "30 دقيقة")
  questions: number;              // عدد الأسئلة
  createdAt: timestamp;          // تاريخ الإنشاء
  updatedAt: timestamp;          // تاريخ آخر تحديث
}
```

**العمليات:**
- ✅ **Read:** الجميع (البيانات العامة)
- ✅ **Write:** الأدمن فقط

**الأماكن المستخدمة:**
- `app/tests/page.tsx` - عرض الاختبارات
- `components/StatsSection.tsx` - إحصائيات الاختبارات
- `app/admin/page.tsx` - إدارة الاختبارات

---

### 9. **courses** - الكورسات
**المسار:** `courses/{courseId}`

**الحقول:**
```typescript
{
  id: string;                     // معرف الكورس
  title: string;                  // عنوان الكورس
  description: string;            // وصف الكورس
  category: string;               // ID التصنيف
  level: string;                  // ID المرحلة التعليمية
  thumbnailUrl?: string;          // صورة مصغرة
  thumbnail?: string;             // صورة مصغرة (بديل)
  videoUrl?: string;              // رابط الفيديو (عام)
  createdAt: timestamp;          // تاريخ الإنشاء
  updatedAt: timestamp;          // تاريخ آخر تحديث
}
```

**العمليات:**
- ✅ **Read:** المستخدمون المسجلون فقط
- ✅ **Write:** الأدمن فقط

**الأماكن المستخدمة:**
- `app/courses/page.tsx` - عرض الكورسات
- `components/PricingSection.tsx` - عرض تفاصيل الكورسات
- `app/admin/page.tsx` - إدارة الكورسات

---

### 10. **messages** - الرسائل
**المسار:** `messages/{messageId}`

**الحقول:**
```typescript
{
  id: string;                     // معرف الرسالة
  userId?: string;                // ID المستخدم (اختياري)
  userEmail: string;              // البريد الإلكتروني
  userName: string;               // اسم المستخدم
  message: string;                // نص الرسالة
  createdAt: timestamp;          // تاريخ الإنشاء
  read: boolean;                 // تم القراءة أم لا
}
```

**العمليات:**
- ✅ **Read:** المستخدم (رسائله فقط) أو الأدمن
- ✅ **Create:** الجميع
- ✅ **Update/Delete:** الأدمن فقط

**الأماكن المستخدمة:**
- `app/contact/page.tsx` - إرسال رسالة
- `app/profile/page.tsx` - عرض رسائل المستخدم
- `app/admin/page.tsx` - إدارة الرسائل

---

### 11. **testResults** - نتائج الاختبارات
**المسار:** `testResults/{resultId}`

**الحقول:**
```typescript
{
  id: string;                     // معرف النتيجة
  userId: string;                 // ID المستخدم
  testId: string;                 // ID الاختبار
  score: number;                  // عدد الإجابات الصحيحة
  percentage: number;             // النسبة المئوية (0-100)
  totalQuestions: number;         // إجمالي عدد الأسئلة
  answers: {                      // الإجابات المقدمة
    [questionIndex: number]: answerIndex: number
  };
  createdAt: timestamp;          // تاريخ الحفظ
}
```

**العمليات:**
- ✅ **Read:** المستخدم (نتائجه فقط)
- ✅ **Create:** المستخدم (لنفسه فقط)
- ✅ **Update/Delete:** الأدمن فقط

**الأماكن المستخدمة:**
- `app/tests/page.tsx` - حفظ النتيجة بعد الاختبار
- `app/profile/page.tsx` - عرض إحصائيات المستخدم
- `app/admin/page.tsx` - عرض النتائج (مستقبلاً)

---

## 📁 Subcollections

### 1. **videos/{videoId}/private/source** - رابط الفيديو الخاص
**المسار:** `videos/{videoId}/private/source`

**الحقول:**
```typescript
{
  url: string;                    // رابط الفيديو الخاص (يحتاج اشتراك)
}
```

**العمليات:**
- ✅ **Read:** المستخدمون المشتركون فقط (`hasValidSubscription`)
- ✅ **Write:** الأدمن فقط

**الأماكن المستخدمة:**
- `components/VideoSection.tsx` - جلب رابط الفيديو للمشتركين
- `app/admin/page.tsx` - حفظ رابط الفيديو الخاص

**Security Rules:**
```javascript
allow read: if request.auth != null && 
               exists(/databases/$(database)/documents/videos/$(videoId)) &&
               get(/databases/$(database)/documents/videos/$(videoId)).data.level != null &&
               hasValidSubscription(get(/databases/$(database)/documents/videos/$(videoId)).data.level);
```

---

### 2. **tests/{testId}/private/content** - محتوى الاختبار الخاص
**المسار:** `tests/{testId}/private/content`

**الحقول:**
```typescript
{
  questionsData: Array<{          // بيانات الأسئلة
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }>;
}
```

**العمليات:**
- ✅ **Read:** المستخدمون المشتركون فقط (`hasValidSubscription`)
- ✅ **Write:** الأدمن فقط

**الأماكن المستخدمة:**
- `app/tests/page.tsx` - جلب الأسئلة للمشتركين
- `app/admin/page.tsx` - حفظ الأسئلة

**Security Rules:**
```javascript
allow read: if request.auth != null && 
               exists(/databases/$(database)/documents/tests/$(testId)) &&
               get(/databases/$(database)/documents/tests/$(testId)).data.level != null &&
               hasValidSubscription(get(/databases/$(database)/documents/tests/$(testId)).data.level);
```

---

### 3. **courses/{courseId}/private/source** - رابط الكورس الخاص
**المسار:** `courses/{courseId}/private/source`

**الحقول:**
```typescript
{
  url: string;                    // رابط الفيديو الخاص (يحتاج اشتراك)
}
```

**العمليات:**
- ✅ **Read:** المستخدمون المشتركون فقط (`hasValidSubscription`)
- ✅ **Write:** الأدمن فقط

**الأماكن المستخدمة:**
- `app/courses/page.tsx` - جلب رابط الكورس للمشتركين
- `app/admin/page.tsx` - حفظ رابط الكورس الخاص

**Security Rules:**
```javascript
allow read: if request.auth != null && 
               exists(/databases/$(database)/documents/courses/$(courseId)) &&
               get(/databases/$(database)/documents/courses/$(courseId)).data.level != null &&
               hasValidSubscription(get(/databases/$(database)/documents/courses/$(courseId)).data.level);
```

---

## 🔒 Security Rules

### Helper Functions

#### 1. **hasValidSubscription(requiredLevelId)**
```javascript
function hasValidSubscription(requiredLevelId) {
  return requiredLevelId != null && 
         requiredLevelId != "" &&
         request.auth != null &&
         exists(/databases/$(database)/documents/subscriptions/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/subscriptions/$(request.auth.uid)).data.endsAt > request.time &&
         get(/databases/$(database)/documents/subscriptions/$(request.auth.uid)).data.educationalLevelId != null &&
         get(/databases/$(database)/documents/subscriptions/$(request.auth.uid)).data.educationalLevelId == requiredLevelId;
}
```

**الوظيفة:** التحقق من أن المستخدم لديه اشتراك صالح للمرحلة التعليمية المطلوبة

**الشروط:**
- المستخدم مسجل دخول
- يوجد اشتراك للمستخدم
- الاشتراك لم ينتهِ بعد
- الاشتراك مطابق للمرحلة التعليمية المطلوبة

---

#### 2. **isAdmin()**
```javascript
function isAdmin() {
  return request.auth != null &&
         exists(/databases/$(database)/documents/roles/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/roles/$(request.auth.uid)).data.role == 'admin';
}
```

**الوظيفة:** التحقق من أن المستخدم أدمن

**الشروط:**
- المستخدم مسجل دخول
- يوجد دور للمستخدم
- الدور هو "admin"

---

## 🔄 العمليات (Operations)

### 1. **Read Operations**

#### جلب جميع المستندات من Collection
```typescript
import { collection, getDocs, query, orderBy } from "firebase/firestore";

// مثال: جلب جميع الفيديوهات
const videosQuery = query(
  collection(db, "videos"), 
  orderBy("createdAt", "desc")
);
const videosSnapshot = await getDocs(videosQuery);
const videos = videosSnapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data()
}));
```

#### جلب مستند واحد
```typescript
import { doc, getDoc } from "firebase/firestore";

// مثال: جلب اشتراك المستخدم
const subscriptionRef = doc(db, "subscriptions", user.uid);
const subscriptionDoc = await getDoc(subscriptionRef);
if (subscriptionDoc.exists()) {
  const data = subscriptionDoc.data();
}
```

#### جلب Subcollection
```typescript
import { doc, getDoc } from "firebase/firestore";

// مثال: جلب رابط الفيديو الخاص
const privateSourceRef = doc(db, "videos", videoId, "private", "source");
const privateSourceDoc = await getDoc(privateSourceRef);
if (privateSourceDoc.exists()) {
  const url = privateSourceDoc.data().url;
}
```

#### جلب مع Filtering
```typescript
import { collection, query, where, getDocs } from "firebase/firestore";

// مثال: جلب نتائج اختبارات المستخدم
const resultsQuery = query(
  collection(db, "testResults"),
  where("userId", "==", user.uid),
  orderBy("createdAt", "desc")
);
const resultsSnapshot = await getDocs(resultsQuery);
```

---

### 2. **Create Operations**

#### إنشاء مستند جديد
```typescript
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// مثال: إنشاء نتيجة اختبار
await addDoc(collection(db, "testResults"), {
  userId: user.uid,
  testId: testId,
  score: score.correct,
  percentage: score.percentage,
  totalQuestions: score.total,
  answers: answers,
  createdAt: serverTimestamp(),
});
```

#### إنشاء Subcollection
```typescript
import { doc, setDoc } from "firebase/firestore";

// مثال: حفظ رابط الفيديو الخاص
const privateSourceRef = doc(db, "videos", videoId, "private", "source");
await setDoc(privateSourceRef, {
  url: videoUrl
});
```

---

### 3. **Update Operations**

#### تحديث مستند
```typescript
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

// مثال: تحديث مستوى المستخدم
const userRef = doc(db, "users", user.uid);
await updateDoc(userRef, {
  level: "متقدم",
  levelScore: 4,
  averageScore: 85,
  completedTests: 15,
  updatedAt: serverTimestamp(),
});
```

---

### 4. **Delete Operations**

#### حذف مستند
```typescript
import { doc, deleteDoc } from "firebase/firestore";

// مثال: حذف فيديو
const videoRef = doc(db, "videos", videoId);
await deleteDoc(videoRef);

// حذف Subcollection
const privateSourceRef = doc(db, "videos", videoId, "private", "source");
await deleteDoc(privateSourceRef);
```

---

## 📊 Data Flow

### 1. **تدفق البيانات للفيديوهات**

```
1. المستخدم يفتح صفحة الفيديوهات
   ↓
2. جلب البيانات العامة من videos/{videoId}
   - title, description, thumbnail (متاح للجميع)
   ↓
3. المستخدم يضغط على فيديو
   ↓
4. التحقق من الاشتراك
   - قراءة subscriptions/{userId}
   ↓
5. إذا كان مشترك:
   - جلب videos/{videoId}/private/source
   - عرض رابط الفيديو الخاص
   ↓
6. إذا لم يكن مشترك:
   - عرض رسالة طلب الاشتراك
```

---

### 2. **تدفق البيانات للاختبارات**

```
1. المستخدم يفتح صفحة الاختبارات
   ↓
2. جلب البيانات العامة من tests/{testId}
   - title, description, duration (متاح للجميع)
   ↓
3. المستخدم يضغط على "بدء الاختبار"
   ↓
4. التحقق من الاشتراك
   - قراءة subscriptions/{userId}
   ↓
5. إذا كان مشترك:
   - جلب tests/{testId}/private/content
   - عرض الأسئلة
   ↓
6. المستخدم يجيب على الأسئلة
   ↓
7. عند الانتهاء:
   - حفظ النتيجة في testResults/{resultId}
   - تحديث users/{userId} (level, averageScore, etc.)
   ↓
8. عرض النتيجة
```

---

### 3. **تدفق البيانات للكورسات**

```
1. المستخدم يفتح صفحة الكورسات
   ↓
2. جلب البيانات العامة من courses/{courseId}
   - title, description, thumbnail (يحتاج تسجيل دخول)
   ↓
3. المستخدم يضغط على كورس
   ↓
4. التحقق من الاشتراك
   - قراءة subscriptions/{userId}
   ↓
5. إذا كان مشترك:
   - جلب courses/{courseId}/private/source
   - عرض رابط الفيديو الخاص
   ↓
6. إذا لم يكن مشترك:
   - عرض رسالة طلب الاشتراك
```

---

## 💡 أمثلة على الاستخدام

### مثال 1: جلب فيديوهات مع رابطها الخاص
```typescript
// جلب الفيديوهات العامة
const videosSnapshot = await getDocs(collection(db, "videos"));
const videos = videosSnapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data()
}));

// إذا كان المستخدم مشترك، جلب الروابط الخاصة
if (hasSubscription) {
  const videosWithUrls = await Promise.all(
    videos.map(async (video) => {
      try {
        const privateSourceRef = doc(db, "videos", video.id, "private", "source");
        const privateSourceDoc = await getDoc(privateSourceRef);
        if (privateSourceDoc.exists()) {
          return {
            ...video,
            videoUrl: privateSourceDoc.data().url
          };
        }
      } catch (error) {
        // إذا كان الخطأ permission-denied، المستخدم غير مشترك
        console.error("Error fetching video URL:", error);
      }
      return video;
    })
  );
}
```

---

### مثال 2: حفظ نتيجة اختبار
```typescript
// حفظ النتيجة
await addDoc(collection(db, "testResults"), {
  userId: user.uid,
  testId: testId,
  score: correctAnswers,
  percentage: percentage,
  totalQuestions: totalQuestions,
  answers: answers,
  createdAt: serverTimestamp(),
});

// جلب جميع النتائج لحساب المستوى
const resultsQuery = query(
  collection(db, "testResults"),
  where("userId", "==", user.uid),
  orderBy("createdAt", "desc")
);
const resultsSnapshot = await getDocs(resultsQuery);
const results = resultsSnapshot.docs.map((doc) => doc.data());

// حساب المعدل والمستوى
const averagePercentage = Math.round(
  results.reduce((sum, r) => sum + r.percentage, 0) / results.length
);

// تحديث مستوى المستخدم
const userRef = doc(db, "users", user.uid);
await updateDoc(userRef, {
  level: calculateLevel(results.length, averagePercentage),
  averageScore: averagePercentage,
  completedTests: results.length,
  updatedAt: serverTimestamp(),
});
```

---

### مثال 3: التحقق من الاشتراك
```typescript
const checkSubscription = async () => {
  if (!user?.uid || !db) return false;
  
  try {
    const subscriptionRef = doc(db, "subscriptions", user.uid);
    const subscriptionDoc = await getDoc(subscriptionRef);
    
    if (subscriptionDoc.exists()) {
      const data = subscriptionDoc.data();
      const endsAt = data.endsAt?.toDate ? data.endsAt.toDate() : new Date(data.endsAt);
      const now = new Date();
      return endsAt > now;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking subscription:", error);
    return false;
  }
};
```

---

## 📝 ملاحظات مهمة

1. **Security Rules:** جميع القواعد موجودة في `firestore.rules`
2. **Indexes:** قد تحتاج لإنشاء indexes في Firebase Console للـ queries المعقدة
3. **Subcollections:** المسار `private/source` هو في الواقع subcollection اسمها `private` وdocument اسمها `source`
4. **Timestamps:** استخدم `serverTimestamp()` دائماً للحقول الزمنية
5. **Error Handling:** تعامل مع `permission-denied` errors بشكل صحيح

---

## 🔗 روابط مفيدة

- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Queries](https://firebase.google.com/docs/firestore/query-data/queries)

---

**آخر تحديث:** 2024-11-23


