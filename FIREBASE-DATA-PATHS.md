# 🗺️ مسارات بيانات Firebase - الفيديوهات، الكورسات، والاختبارات

## 📋 المحتويات
1. [الفيديوهات (Videos)](#الفيديوهات-videos)
2. [الكورسات (Courses)](#الكورسات-courses)
3. [الاختبارات (Tests)](#الاختبارات-tests)

---

## 🎥 الفيديوهات (Videos)

### 📍 المسار العام (Public Data)
```
videos/{videoId}
```

**البيانات المتاحة للجميع:**
```typescript
{
  id: string;                    // معرف الفيديو
  title: string;                 // عنوان الفيديو
  description: string;           // وصف الفيديو
  category: string;              // ID التصنيف
  level: string;                 // ID المرحلة التعليمية
  thumbnailUrl?: string;          // صورة مصغرة
  thumbnail?: string;             // صورة مصغرة (بديل)
  views?: number;                 // عدد المشاهدات
  duration?: string;              // مدة الفيديو
  createdAt: timestamp;          // تاريخ الإنشاء
  updatedAt: timestamp;          // تاريخ آخر تحديث
}
```

**العمليات:**
- ✅ **Read:** الجميع (public)
- ✅ **Write:** الأدمن فقط

---

### 🔒 المسار الخاص (Private Data)
```
videos/{videoId}/private/source
```

**البيانات المتاحة للمشتركين فقط:**
```typescript
{
  url: string;                   // رابط الفيديو الخاص (يحتاج اشتراك)
}
```

**العمليات:**
- ✅ **Read:** المستخدمون المشتركون فقط
- ✅ **Write:** الأدمن فقط

**الشروط للوصول:**
1. المستخدم مسجل دخول (`request.auth != null`)
2. يوجد فيديو في `videos/{videoId}`
3. الفيديو يحتوي على `level` (ID المرحلة التعليمية)
4. المستخدم لديه اشتراك صالح للمرحلة التعليمية (`hasValidSubscription`)

---

### 🔄 تدفق البيانات (Data Flow)

```
┌─────────────────────────────────────────────────────────────┐
│                    صفحة الفيديوهات                          │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  جلب البيانات العامة         │
        │  videos/{videoId}             │
        │  (title, description, etc.)   │
        └───────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  عرض قائمة الفيديوهات        │
        │  (متاح للجميع)                │
        └───────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  المستخدم يضغط على فيديو    │
        └───────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  التحقق من الاشتراك          │
        │  subscriptions/{userId}       │
        └───────────────────────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
    ┌───────────────┐      ┌───────────────┐
    │  مشترك        │      │  غير مشترك   │
    └───────────────┘      └───────────────┘
            │                       │
            ▼                       ▼
    ┌───────────────────┐   ┌───────────────────┐
    │ جلب رابط الفيديو  │   │ عرض رسالة         │
    │ الخاص             │   │ طلب الاشتراك      │
    │ videos/{videoId}/  │   │                   │
    │ private/source    │   │                   │
    └───────────────────┘   └───────────────────┘
            │
            ▼
    ┌───────────────────┐
    │ عرض الفيديو       │
    │ (VideoPlayer)      │
    └───────────────────┘
```

---

### 💻 أمثلة الكود

#### جلب البيانات العامة
```typescript
// جلب جميع الفيديوهات
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

#### جلب الرابط الخاص (للمشتركين)
```typescript
// التحقق من الاشتراك أولاً
const subscriptionRef = doc(db, "subscriptions", user.uid);
const subscriptionDoc = await getDoc(subscriptionRef);

if (subscriptionDoc.exists()) {
  const data = subscriptionDoc.data();
  const endsAt = data.endsAt?.toDate();
  const isValid = endsAt > new Date();
  
  if (isValid) {
    // جلب الرابط الخاص
    const privateSourceRef = doc(db, "videos", videoId, "private", "source");
    const privateSourceDoc = await getDoc(privateSourceRef);
    
    if (privateSourceDoc.exists()) {
      const videoUrl = privateSourceDoc.data().url;
      // عرض الفيديو
    }
  }
}
```

---

## 📚 الكورسات (Courses)

### 📍 المسار العام (Public Data)
```
courses/{courseId}
```

**البيانات المتاحة للمستخدمين المسجلين:**
```typescript
{
  id: string;                    // معرف الكورس
  title: string;                 // عنوان الكورس
  description: string;           // وصف الكورس
  category: string;              // ID التصنيف
  level: string;                 // ID المرحلة التعليمية
  thumbnailUrl?: string;         // صورة مصغرة
  thumbnail?: string;            // صورة مصغرة (بديل)
  videoUrl?: string;            // رابط الفيديو (عام)
  createdAt: timestamp;         // تاريخ الإنشاء
  updatedAt: timestamp;          // تاريخ آخر تحديث
}
```

**العمليات:**
- ✅ **Read:** المستخدمون المسجلون فقط (`request.auth != null`)
- ✅ **Write:** الأدمن فقط

---

### 🔒 المسار الخاص (Private Data)
```
courses/{courseId}/private/source
```

**البيانات المتاحة للمشتركين فقط:**
```typescript
{
  url: string;                   // رابط الفيديو الخاص (يحتاج اشتراك)
}
```

**العمليات:**
- ✅ **Read:** المستخدمون المشتركون فقط
- ✅ **Write:** الأدمن فقط

**الشروط للوصول:**
1. المستخدم مسجل دخول (`request.auth != null`)
2. يوجد كورس في `courses/{courseId}`
3. الكورس يحتوي على `level` (ID المرحلة التعليمية)
4. المستخدم لديه اشتراك صالح للمرحلة التعليمية (`hasValidSubscription`)

---

### 🔄 تدفق البيانات (Data Flow)

```
┌─────────────────────────────────────────────────────────────┐
│                    صفحة الكورسات                            │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  التحقق من تسجيل الدخول      │
        │  (request.auth != null)       │
        └───────────────────────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
    ┌───────────────┐      ┌───────────────┐
    │  مسجل دخول    │      │  غير مسجل    │
    └───────────────┘      └───────────────┘
            │                       │
            ▼                       ▼
    ┌───────────────────┐   ┌───────────────────┐
    │ جلب البيانات      │   │ عرض رسالة         │
    │ العامة            │   │ تسجيل الدخول      │
    │ courses/{courseId} │   │                   │
    └───────────────────┘   └───────────────────┘
            │
            ▼
        ┌───────────────────────────────┐
        │  عرض قائمة الكورسات          │
        │  (title, description, etc.)  │
        └───────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  المستخدم يضغط على كورس      │
        └───────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  التحقق من الاشتراك          │
        │  subscriptions/{userId}       │
        └───────────────────────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
    ┌───────────────┐      ┌───────────────┐
    │  مشترك        │      │  غير مشترك   │
    └───────────────┘      └───────────────┘
            │                       │
            ▼                       ▼
    ┌───────────────────┐   ┌───────────────────┐
    │ جلب رابط الكورس   │   │ عرض رسالة         │
    │ الخاص             │   │ طلب الاشتراك      │
    │ courses/{courseId}/│   │                   │
    │ private/source    │   │                   │
    └───────────────────┘   └───────────────────┘
            │
            ▼
    ┌───────────────────┐
    │ عرض الفيديو       │
    │ (VideoPlayer)      │
    └───────────────────┘
```

---

### 💻 أمثلة الكود

#### جلب البيانات العامة
```typescript
// جلب جميع الكورسات (يحتاج تسجيل دخول)
if (isAuthenticated && db) {
  const coursesQuery = query(
    collection(db, "courses"), 
    orderBy("createdAt", "desc")
  );
  const coursesSnapshot = await getDocs(coursesQuery);
  const courses = coursesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));
}
```

#### جلب الرابط الخاص (للمشتركين)
```typescript
// التحقق من الاشتراك أولاً
const subscriptionRef = doc(db, "subscriptions", user.uid);
const subscriptionDoc = await getDoc(subscriptionRef);

if (subscriptionDoc.exists()) {
  const data = subscriptionDoc.data();
  const endsAt = data.endsAt?.toDate();
  const isValid = endsAt > new Date();
  
  if (isValid && data.educationalLevelId === course.level) {
    // جلب الرابط الخاص
    const privateSourceRef = doc(db, "courses", courseId, "private", "source");
    const privateSourceDoc = await getDoc(privateSourceRef);
    
    if (privateSourceDoc.exists()) {
      const courseUrl = privateSourceDoc.data().url;
      // عرض الفيديو
    }
  }
}
```

---

## 📝 الاختبارات (Tests)

### 📍 المسار العام (Public Data)
```
tests/{testId}
```

**البيانات المتاحة للجميع:**
```typescript
{
  id: string;                    // معرف الاختبار
  title: string;                 // عنوان الاختبار
  description: string;           // وصف الاختبار
  level: string;                // ID المرحلة التعليمية
  duration: string;             // مدة الاختبار (مثل "30 دقيقة")
  questions: number;           // عدد الأسئلة
  createdAt: timestamp;        // تاريخ الإنشاء
  updatedAt: timestamp;        // تاريخ آخر تحديث
}
```

**العمليات:**
- ✅ **Read:** الجميع (public)
- ✅ **Write:** الأدمن فقط

---

### 🔒 المسار الخاص (Private Data)
```
tests/{testId}/private/content
```

**البيانات المتاحة للمشتركين فقط:**
```typescript
{
  questionsData: Array<{        // بيانات الأسئلة
    id: number;                 // معرف السؤال
    question: string;           // نص السؤال
    options: string[];          // الخيارات
    correctAnswer: number;      // رقم الإجابة الصحيحة
    explanation?: string;       // شرح الإجابة (اختياري)
  }>;
}
```

**العمليات:**
- ✅ **Read:** المستخدمون المشتركون فقط
- ✅ **Write:** الأدمن فقط

**الشروط للوصول:**
1. المستخدم مسجل دخول (`request.auth != null`)
2. يوجد اختبار في `tests/{testId}`
3. الاختبار يحتوي على `level` (ID المرحلة التعليمية)
4. المستخدم لديه اشتراك صالح للمرحلة التعليمية (`hasValidSubscription`)

---

### 🔄 تدفق البيانات (Data Flow)

```
┌─────────────────────────────────────────────────────────────┐
│                    صفحة الاختبارات                          │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  جلب البيانات العامة         │
        │  tests/{testId}               │
        │  (title, description, etc.)   │
        └───────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  عرض قائمة الاختبارات        │
        │  (متاح للجميع)                │
        └───────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  المستخدم يضغط على           │
        │  "بدء الاختبار"               │
        └───────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  التحقق من تسجيل الدخول      │
        │  (request.auth != null)       │
        └───────────────────────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
    ┌───────────────┐      ┌───────────────┐
    │  مسجل دخول    │      │  غير مسجل    │
    └───────────────┘      └───────────────┘
            │                       │
            ▼                       ▼
    ┌───────────────────┐   ┌───────────────────┐
    │ التحقق من الاشتراك│   │ عرض رسالة         │
    │ subscriptions/    │   │ تسجيل الدخول      │
    │ {userId}          │   │                   │
    └───────────────────┘   └───────────────────┘
            │
            ▼
        ┌───────────────────────────────┐
        │  التحقق من صحة الاشتراك       │
        │  (endsAt > now &&             │
        │   educationalLevelId == level)│
        └───────────────────────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
    ┌───────────────┐      ┌───────────────┐
    │  مشترك        │      │  غير مشترك   │
    └───────────────┘      └───────────────┘
            │                       │
            ▼                       ▼
    ┌───────────────────┐   ┌───────────────────┐
    │ جلب الأسئلة       │   │ عرض رسالة         │
    │ tests/{testId}/    │   │ طلب الاشتراك      │
    │ private/content    │   │                   │
    └───────────────────┘   └───────────────────┘
            │
            ▼
    ┌───────────────────┐
    │ عرض الأسئلة       │
    │ (Test Interface)   │
    └───────────────────┘
            │
            ▼
    ┌───────────────────┐
    │ المستخدم يجيب      │
    │ على الأسئلة         │
    └───────────────────┘
            │
            ▼
    ┌───────────────────┐
    │ حفظ النتيجة        │
    │ testResults/       │
    │ {resultId}         │
    └───────────────────┘
            │
            ▼
    ┌───────────────────┐
    │ عرض النتيجة        │
    │ (Result Banner)     │
    └───────────────────┘
```

---

### 💻 أمثلة الكود

#### جلب البيانات العامة
```typescript
// جلب جميع الاختبارات
const testsQuery = query(
  collection(db, "tests"), 
  orderBy("createdAt", "desc")
);
const testsSnapshot = await getDocs(testsQuery);
const tests = testsSnapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data()
}));
```

#### جلب الأسئلة الخاصة (للمشتركين)
```typescript
// التحقق من الاشتراك أولاً
const subscriptionRef = doc(db, "subscriptions", user.uid);
const subscriptionDoc = await getDoc(subscriptionRef);

if (subscriptionDoc.exists()) {
  const data = subscriptionDoc.data();
  const endsAt = data.endsAt?.toDate();
  const isValid = endsAt > new Date();
  
  if (isValid && data.educationalLevelId === test.level) {
    // جلب الأسئلة الخاصة
    const privateContentRef = doc(db, "tests", testId, "private", "content");
    const privateContentDoc = await getDoc(privateContentRef);
    
    if (privateContentDoc.exists()) {
      const questionsData = privateContentDoc.data().questionsData;
      // عرض الأسئلة
    }
  }
}
```

---

## 🔐 Security Rules - ملخص

### الفيديوهات
```javascript
match /videos/{videoId} {
  allow read: if true;  // البيانات العامة متاحة للجميع
  allow write: if isAdmin();
  
  match /private/source {
    allow read: if request.auth != null && 
                   exists(/databases/$(database)/documents/videos/$(videoId)) &&
                   get(/databases/$(database)/documents/videos/$(videoId)).data.level != null &&
                   hasValidSubscription(get(/databases/$(database)/documents/videos/$(videoId)).data.level);
    allow write: if isAdmin();
  }
}
```

### الكورسات
```javascript
match /courses/{courseId} {
  allow read: if request.auth != null;  // يحتاج تسجيل دخول
  allow write: if isAdmin();
  
  match /private/source {
    allow read: if request.auth != null && 
                   exists(/databases/$(database)/documents/courses/$(courseId)) &&
                   get(/databases/$(database)/documents/courses/$(courseId)).data.level != null &&
                   hasValidSubscription(get(/databases/$(database)/documents/courses/$(courseId)).data.level);
    allow write: if isAdmin();
  }
}
```

### الاختبارات
```javascript
match /tests/{testId} {
  allow read: if true;  // البيانات العامة متاحة للجميع
  allow write: if isAdmin();
  
  match /private/content {
    allow read: if request.auth != null && 
                   exists(/databases/$(database)/documents/tests/$(testId)) &&
                   get(/databases/$(database)/documents/tests/$(testId)).data.level != null &&
                   hasValidSubscription(get(/databases/$(database)/documents/tests/$(testId)).data.level);
    allow write: if isAdmin();
  }
}
```

---

## 📊 جدول مقارنة

| الميزة | الفيديوهات | الكورسات | الاختبارات |
|--------|------------|----------|------------|
| **البيانات العامة** | متاحة للجميع | تحتاج تسجيل دخول | متاحة للجميع |
| **المسار العام** | `videos/{videoId}` | `courses/{courseId}` | `tests/{testId}` |
| **المسار الخاص** | `videos/{videoId}/private/source` | `courses/{courseId}/private/source` | `tests/{testId}/private/content` |
| **نوع البيانات الخاصة** | رابط الفيديو (`url`) | رابط الفيديو (`url`) | الأسئلة (`questionsData`) |
| **يحتاج اشتراك** | ✅ نعم | ✅ نعم | ✅ نعم |
| **Security Rule** | `hasValidSubscription` | `hasValidSubscription` | `hasValidSubscription` |

---

**آخر تحديث:** 2024-11-23


