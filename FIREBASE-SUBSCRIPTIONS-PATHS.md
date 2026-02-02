# 🔐 مسارات بيانات الاشتراكات (Subscriptions) - Firebase Firestore

## 📋 المحتويات
1. [المسار والبنية](#المسار-والبنية)
2. [الحقول (Fields)](#الحقول-fields)
3. [Security Rules](#security-rules)
4. [العمليات (Operations)](#العمليات-operations)
5. [تدفق البيانات (Data Flow)](#تدفق-البيانات-data-flow)
6. [أمثلة على الاستخدام](#أمثلة-على-الاستخدام)

---

## 📍 المسار والبنية

### المسار الكامل
```
subscriptions/{subscriptionId}
```

**ملاحظة مهمة:** `subscriptionId` = `userId` (معرف المستخدم)

**السبب:** كل مستخدم يمكن أن يكون له اشتراك واحد فقط، لذلك يتم استخدام `userId` كمعرف للاشتراك.

---

## 📊 الحقول (Fields)

### البنية الكاملة
```typescript
{
  id: string;                    // معرف الاشتراك (مطابق لـ userId)
  userId: string;                // معرف المستخدم
  adminId: string;               // معرف الأدمن الذي أنشأ الاشتراك
  educationalLevelId: string;     // ID المرحلة التعليمية المشترك فيها
  userName?: string;             // اسم المستخدم (يتم جلبه من users)
  userEmail?: string;            // البريد الإلكتروني (يتم جلبه من users)
  userPhone?: string;            // رقم الهاتف (يتم جلبه من users)
  createdAt: timestamp;          // تاريخ الإنشاء
  endsAt: timestamp;            // تاريخ انتهاء الاشتراك
}
```

### الحقول المطلوبة
- ✅ `userId` - معرف المستخدم (مطلوب)
- ✅ `educationalLevelId` - ID المرحلة التعليمية (مطلوب)
- ✅ `adminId` - معرف الأدمن (مطلوب)
- ✅ `createdAt` - تاريخ الإنشاء (مطلوب)
- ✅ `endsAt` - تاريخ الانتهاء (مطلوب)

### الحقول الاختيارية
- ⚪ `userName` - اسم المستخدم (يتم جلبه تلقائياً من users)
- ⚪ `userEmail` - البريد الإلكتروني (يتم جلبه تلقائياً من users)
- ⚪ `userPhone` - رقم الهاتف (يتم جلبه تلقائياً من users)

---

## 🔒 Security Rules

### القواعد الكاملة
```javascript
match /subscriptions/{subscriptionId} {
  // القراءة: المستخدم يمكنه قراءة اشتراكه فقط أو الأدمن
  allow read: if request.auth != null && 
                 (subscriptionId == request.auth.uid || isAdmin());
  
  // الكتابة: الأدمن فقط
  allow write: if isAdmin();
}
```

### شرح القواعد

#### 1. **Read (القراءة)**
**الشروط:**
- المستخدم مسجل دخول (`request.auth != null`)
- إما:
  - `subscriptionId == request.auth.uid` (المستخدم يقرأ اشتراكه الخاص)
  - أو `isAdmin()` (الأدمن يمكنه قراءة جميع الاشتراكات)

**النتيجة:**
- ✅ المستخدم يمكنه قراءة اشتراكه فقط
- ✅ الأدمن يمكنه قراءة جميع الاشتراكات
- ❌ المستخدم لا يمكنه قراءة اشتراكات المستخدمين الآخرين

#### 2. **Write (الكتابة)**
**الشروط:**
- `isAdmin()` فقط

**النتيجة:**
- ✅ الأدمن فقط يمكنه إنشاء/تحديث/حذف الاشتراكات
- ❌ المستخدمون العاديون لا يمكنهم تعديل اشتراكاتهم

---

## 🔄 العمليات (Operations)

### 1. **Create (إنشاء اشتراك)**

**المسار:** `subscriptions/{userId}`

**من يقوم بها:** الأدمن فقط

**الخطوات:**
1. التحقق من وجود المستخدم في `users/{userId}`
2. جلب بيانات المستخدم (name, email, phone)
3. التحقق من عدم وجود اشتراك سابق
4. حساب تاريخ الانتهاء (`endsAt = now + SUBSCRIPTION_DURATION_MONTHS`)
5. إنشاء الاشتراك مع جميع البيانات

**الكود:**
```typescript
// التحقق من وجود المستخدم
const userRef = doc(db, "users", userId);
const userDoc = await getDoc(userRef);
if (!userDoc.exists()) {
  throw new Error("المستخدم غير موجود");
}

// جلب بيانات المستخدم
const userData = userDoc.data();
const userName = userData.name || "";
const userEmail = userData.email || "";
const userPhone = userData.phone || "";

// التحقق من عدم وجود اشتراك سابق
const subscriptionRef = doc(db, "subscriptions", userId);
const subscriptionDoc = await getDoc(subscriptionRef);
if (subscriptionDoc.exists()) {
  throw new Error("المستخدم لديه اشتراك بالفعل");
}

// حساب تاريخ الانتهاء (مثال: 3 أشهر)
const now = new Date();
const endsAt = new Date(now);
endsAt.setMonth(endsAt.getMonth() + 3); // 3 أشهر

// إنشاء الاشتراك
await setDoc(subscriptionRef, {
  userId: userId,
  adminId: adminUser.uid,
  educationalLevelId: educationalLevelId,
  userName: userName,
  userEmail: userEmail,
  userPhone: userPhone,
  createdAt: serverTimestamp(),
  endsAt: endsAt,
});
```

---

### 2. **Read (قراءة اشتراك)**

#### أ. قراءة اشتراك المستخدم الحالي
**المسار:** `subscriptions/{userId}` (حيث userId = request.auth.uid)

**من يقوم بها:** المستخدم نفسه

**الكود:**
```typescript
const subscriptionRef = doc(db, "subscriptions", user.uid);
const subscriptionDoc = await getDoc(subscriptionRef);

if (subscriptionDoc.exists()) {
  const data = subscriptionDoc.data();
  const endsAt = data.endsAt?.toDate ? data.endsAt.toDate() : new Date(data.endsAt);
  const now = new Date();
  const isValid = endsAt > now;
  
  console.log("Subscription:", {
    exists: true,
    endsAt: endsAt.toISOString(),
    now: now.toISOString(),
    isValid: isValid,
    educationalLevelId: data.educationalLevelId
  });
} else {
  console.log("No subscription found");
}
```

#### ب. قراءة جميع الاشتراكات (للأدمن)
**المسار:** `subscriptions/` (جميع المستندات)

**من يقوم بها:** الأدمن فقط

**الكود:**
```typescript
const subscriptionsQuery = query(
  collection(db, "subscriptions"), 
  orderBy("createdAt", "desc")
);
const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
const subscriptions = subscriptionsSnapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data()
}));
```

---

### 3. **Update (تحديث اشتراك)**

**المسار:** `subscriptions/{userId}`

**من يقوم بها:** الأدمن فقط

**ملاحظة:** في الكود الحالي، لا يوجد تحديث مباشر للاشتراك. يتم حذف الاشتراك القديم وإنشاء اشتراك جديد.

**الكود (مستقبلاً):**
```typescript
const subscriptionRef = doc(db, "subscriptions", userId);
await updateDoc(subscriptionRef, {
  educationalLevelId: newEducationalLevelId,
  endsAt: newEndsAt,
  updatedAt: serverTimestamp(),
});
```

---

### 4. **Delete (حذف اشتراك)**

**المسار:** `subscriptions/{userId}`

**من يقوم بها:** الأدمن فقط

**الكود:**
```typescript
const subscriptionRef = doc(db, "subscriptions", userId);
await deleteDoc(subscriptionRef);
```

---

## 🔄 تدفق البيانات (Data Flow)

### 1. **إنشاء اشتراك جديد (من الأدمن)**

```
┌─────────────────────────────────────────────────────────────┐
│                    لوحة الأدمن                            │
│                    (Admin Panel)                           │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  الأدمن يدخل بيانات الاشتراك  │
        │  - userId                     │
        │  - educationalLevelId         │
        └───────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  التحقق من وجود المستخدم      │
        │  users/{userId}               │
        └───────────────────────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
    ┌───────────────┐      ┌───────────────┐
    │  موجود        │      │  غير موجود   │
    └───────────────┘      └───────────────┘
            │                       │
            ▼                       ▼
    ┌───────────────────┐   ┌───────────────────┐
    │ جلب بيانات        │   │ عرض رسالة خطأ     │
    │ المستخدم          │   │ "المستخدم غير     │
    │ (name, email, etc.)│   │ موجود"            │
    └───────────────────┘   └───────────────────┘
            │
            ▼
        ┌───────────────────────────────┐
        │  التحقق من عدم وجود           │
        │  اشتراك سابق                 │
        │  subscriptions/{userId}      │
        └───────────────────────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
    ┌───────────────┐      ┌───────────────┐
    │  لا يوجد      │      │  موجود       │
    └───────────────┘      └───────────────┘
            │                       │
            ▼                       ▼
    ┌───────────────────┐   ┌───────────────────┐
    │ حساب تاريخ        │   │ عرض رسالة خطأ     │
    │ الانتهاء          │   │ "المستخدم لديه    │
    │ (endsAt = now + 3)│   │ اشتراك بالفعل"    │
    └───────────────────┘   └───────────────────┘
            │
            ▼
        ┌───────────────────────────────┐
        │  إنشاء الاشتراك              │
        │  subscriptions/{userId}     │
        │  {                           │
        │    userId,                   │
        │    adminId,                  │
        │    educationalLevelId,        │
        │    userName,                  │
        │    userEmail,                 │
        │    userPhone,                 │
        │    createdAt,                 │
        │    endsAt                     │
        │  }                           │
        └───────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  عرض رسالة نجاح              │
        │  "تم إضافة الاشتراك بنجاح"   │
        └───────────────────────────────┘
```

---

### 2. **التحقق من صحة الاشتراك (من المستخدم)**

```
┌─────────────────────────────────────────────────────────────┐
│                    صفحة المستخدم                           │
│                    (Videos/Tests/Courses)                   │
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
    │ جلب الاشتراك     │   │ hasSubscription   │
    │ subscriptions/   │   │ = false          │
    │ {userId}         │   │                  │
    └───────────────────┘   └───────────────────┘
            │
            ▼
        ┌───────────────────────────────┐
        │  التحقق من وجود الاشتراك     │
        │  (subscriptionDoc.exists())  │
        └───────────────────────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
    ┌───────────────┐      ┌───────────────┐
    │  موجود        │      │  غير موجود   │
    └───────────────┘      └───────────────┘
            │                       │
            ▼                       ▼
    ┌───────────────────┐   ┌───────────────────┐
    │ التحقق من         │   │ hasSubscription  │
    │ تاريخ الانتهاء    │   │ = false          │
    │ (endsAt > now)    │   │                  │
    └───────────────────┘   └───────────────────┘
            │
            ▼
        ┌───────────────────────────────┐
        │  التحقق من المرحلة التعليمية │
        │  (educationalLevelId ==      │
        │   requiredLevelId)           │
        └───────────────────────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
    ┌───────────────┐      ┌───────────────┐
    │  مطابق        │      │  غير مطابق   │
    └───────────────┘      └───────────────┘
            │                       │
            ▼                       ▼
    ┌───────────────────┐   ┌───────────────────┐
    │ hasSubscription   │   │ hasSubscription   │
    │ = true            │   │ = false          │
    │ (يمكن الوصول)     │   │ (لا يمكن الوصول) │
    └───────────────────┘   └───────────────────┘
```

---

### 3. **حذف اشتراك (من الأدمن)**

```
┌─────────────────────────────────────────────────────────────┐
│                    لوحة الأدمن                            │
│                    (Admin Panel)                           │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  الأدمن يضغط على "حذف"       │
        │  للاشتراك                    │
        └───────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  عرض نافذة تأكيد              │
        │  "هل أنت متأكد من الحذف؟"    │
        └───────────────────────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
    ┌───────────────┐      ┌───────────────┐
    │  تأكيد        │      │  إلغاء        │
    └───────────────┘      └───────────────┘
            │
            ▼
        ┌───────────────────────────────┐
        │  حذف الاشتراك                │
        │  subscriptions/{userId}     │
        └───────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  عرض رسالة نجاح              │
        │  "تم حذف الاشتراك بنجاح"     │
        └───────────────────────────────┘
```

---

## 💻 أمثلة على الاستخدام

### مثال 1: التحقق من الاشتراك (في صفحة الفيديوهات)

```typescript
// في components/VideoSection.tsx
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
        
        setHasSubscription(isValid);
      } else {
        setHasSubscription(false);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      setHasSubscription(false);
    }
  };

  checkSubscription();
}, [isAuthenticated, user?.uid]);
```

---

### مثال 2: التحقق من الاشتراك لمرحلة تعليمية محددة

```typescript
// في app/tests/page.tsx
const checkSubscriptionForLevel = async (requiredLevelId: string) => {
  if (!user?.uid || !db) return false;
  
  try {
    const subscriptionRef = doc(db, "subscriptions", user.uid);
    const subscriptionDoc = await getDoc(subscriptionRef);
    
    if (subscriptionDoc.exists()) {
      const data = subscriptionDoc.data();
      const endsAt = data.endsAt?.toDate ? data.endsAt.toDate() : new Date(data.endsAt);
      const now = new Date();
      const isValid = endsAt > now;
      const levelMatches = data.educationalLevelId === requiredLevelId;
      
      return isValid && levelMatches;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking subscription:", error);
    return false;
  }
};
```

---

### مثال 3: إنشاء اشتراك جديد (من الأدمن)

```typescript
// في app/admin/page.tsx
const handleSubscriptionSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const userId = subscriptionForm.userId.trim();
  const educationalLevelId = subscriptionForm.educationalLevelId.trim();
  
  // 1. التحقق من وجود المستخدم
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    throw new Error("المستخدم غير موجود");
  }
  
  // 2. جلب بيانات المستخدم
  const userData = userDoc.data();
  const userName = userData.name || "";
  const userEmail = userData.email || "";
  const userPhone = userData.phone || "";
  
  // 3. التحقق من عدم وجود اشتراك سابق
  const subscriptionRef = doc(db, "subscriptions", userId);
  const subscriptionDoc = await getDoc(subscriptionRef);
  if (subscriptionDoc.exists()) {
    throw new Error("المستخدم لديه اشتراك بالفعل");
  }
  
  // 4. حساب تاريخ الانتهاء (3 أشهر)
  const now = new Date();
  const endsAt = new Date(now);
  endsAt.setMonth(endsAt.getMonth() + 3);
  
  // 5. إنشاء الاشتراك
  await setDoc(subscriptionRef, {
    userId: userId,
    adminId: adminUser.uid,
    educationalLevelId: educationalLevelId,
    userName: userName,
    userEmail: userEmail,
    userPhone: userPhone,
    createdAt: serverTimestamp(),
    endsAt: endsAt,
  });
  
  console.log("تم إنشاء الاشتراك بنجاح");
};
```

---

### مثال 4: جلب جميع الاشتراكات (للأدمن)

```typescript
// في app/admin/page.tsx
const loadSubscriptions = async () => {
  if (!db) return;
  
  try {
    const subscriptionsQuery = query(
      collection(db, "subscriptions"), 
      orderBy("createdAt", "desc")
    );
    const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
    
    const subscriptionsData = await Promise.all(
      subscriptionsSnapshot.docs.map(async (subscriptionDoc) => {
        const data = subscriptionDoc.data();
        return {
          id: subscriptionDoc.id,
          userId: data.userId,
          adminId: data.adminId,
          educationalLevelId: data.educationalLevelId,
          userName: data.userName,
          userEmail: data.userEmail,
          userPhone: data.userPhone,
          createdAt: data.createdAt,
          endsAt: data.endsAt,
        };
      })
    );
    
    setSubscriptions(subscriptionsData);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
  }
};
```

---

### مثال 5: حذف اشتراك (من الأدمن)

```typescript
// في app/admin/page.tsx
const handleDeleteSubscription = async (userId: string) => {
  if (!db) return;
  
  try {
    const subscriptionRef = doc(db, "subscriptions", userId);
    await deleteDoc(subscriptionRef);
    
    console.log("تم حذف الاشتراك بنجاح");
    // إعادة تحميل قائمة الاشتراكات
    loadSubscriptions();
  } catch (error) {
    console.error("Error deleting subscription:", error);
  }
};
```

---

## 🔐 استخدام الاشتراك في Security Rules

### دالة hasValidSubscription

```javascript
function hasValidSubscription(requiredLevelId) {
  return requiredLevelId != null && 
         requiredLevelId != "" &&
         request.auth != null &&
         // التحقق من وجود وثيقة الاشتراك
         exists(/databases/$(database)/documents/subscriptions/$(request.auth.uid)) &&
         // التحقق من تاريخ الانتهاء
         get(/databases/$(database)/documents/subscriptions/$(request.auth.uid)).data.endsAt > request.time &&
         // التحقق من وجود حقل الليفل ومطابقته
         get(/databases/$(database)/documents/subscriptions/$(request.auth.uid)).data.educationalLevelId != null &&
         get(/databases/$(database)/documents/subscriptions/$(request.auth.uid)).data.educationalLevelId == requiredLevelId;
}
```

**الاستخدام:**
- تستخدم في Security Rules للتحقق من الوصول إلى:
  - `videos/{videoId}/private/source`
  - `tests/{testId}/private/content`
  - `courses/{courseId}/private/source`

---

## 📊 جدول ملخص

| العملية | المسار | من يقوم بها | Security Rule |
|---------|--------|-------------|---------------|
| **Create** | `subscriptions/{userId}` | الأدمن فقط | `isAdmin()` |
| **Read (خاص)** | `subscriptions/{userId}` | المستخدم نفسه | `subscriptionId == request.auth.uid` |
| **Read (جميع)** | `subscriptions/` | الأدمن فقط | `isAdmin()` |
| **Update** | `subscriptions/{userId}` | الأدمن فقط | `isAdmin()` |
| **Delete** | `subscriptions/{userId}` | الأدمن فقط | `isAdmin()` |

---

## ⚠️ ملاحظات مهمة

1. **معرف الاشتراك:** `subscriptionId` = `userId` (كل مستخدم له اشتراك واحد فقط)
2. **مدة الاشتراك:** يتم حسابها تلقائياً عند الإنشاء (عادة 3 أشهر)
3. **التحقق من الصلاحية:** يتم التحقق من `endsAt > now` دائماً
4. **المرحلة التعليمية:** يجب أن تطابق `educationalLevelId` المرحلة المطلوبة
5. **البيانات الإضافية:** `userName`, `userEmail`, `userPhone` يتم جلبها تلقائياً من `users/{userId}`

---

## 🔗 الأماكن المستخدمة

- ✅ `app/tests/page.tsx` - التحقق من الاشتراك قبل عرض الأسئلة
- ✅ `components/VideoSection.tsx` - التحقق من الاشتراك قبل عرض رابط الفيديو
- ✅ `app/courses/page.tsx` - التحقق من الاشتراك قبل عرض رابط الكورس
- ✅ `app/admin/page.tsx` - إدارة الاشتراكات (إنشاء/حذف/عرض)
- ✅ `firestore.rules` - استخدام `hasValidSubscription` في Security Rules

---

**آخر تحديث:** 2024-11-23


