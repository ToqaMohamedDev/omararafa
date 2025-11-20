# إعداد الأدمن (Admin Setup)

## نظرة عامة

القواعد الجديدة في Firestore تستخدم collection `roles` للتحقق من صلاحيات الأدمن. يجب إعداد هذا Collection قبل استخدام القواعد.

## الطريقة 1: من Firebase Console (مستحسن)

### الخطوة 1: إنشاء Collection `roles`

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر المشروع: **omrarafa-c6a94**
3. اذهب إلى **Firestore Database**
4. اضغط على **Start collection** (إذا لم يكن موجوداً)
5. أدخل Collection ID: `roles`
6. اضغط **Next**

### الخطوة 2: إضافة مستند الأدمن

1. في Collection `roles`، اضغط على **Add document**
2. في **Document ID**، أدخل **UID الخاص بالمستخدم** (يمكنك الحصول عليه من Authentication → Users)
3. اضغط **Add field**:
   - **Field name**: `role`
   - **Type**: `string`
   - **Value**: `admin`
4. اضغط **Save**

**مثال:**
```
Collection: roles
Document ID: abc123xyz789 (UID من Authentication)
Fields:
  role: "admin" (string)
```

## الطريقة 2: من الكود (Firebase Admin SDK)

يمكنك إنشاء مستند الأدمن من خلال API route:

```typescript
// POST /api/admin/setup
import { adminFirestore } from "@/lib/firebase-admin";

// في API route
await adminFirestore.collection("roles").doc(userId).set({
  role: "admin"
});
```

## الحصول على UID

### من Firebase Console:
1. اذهب إلى **Authentication** → **Users**
2. ابحث عن المستخدم (البحث بالبريد الإلكتروني)
3. انسخ **User UID**

### من الكود:
```typescript
// في Client-side
import { auth } from "@/lib/firebase-client";

const user = auth.currentUser;
const uid = user?.uid;
```

## التحقق من الأدمن

بعد إعداد `roles` collection، يمكنك التحقق من أن المستخدم أدمن:

### من Firestore Rules:
القواعد تستخدم دالة `isAdmin()` التي تتحقق من:
- وجود مستند في `roles/{uid}`
- أن حقل `role` يساوي `"admin"`

### من الكود:
```typescript
// في API route
const roleDoc = await adminFirestore.collection("roles").doc(uid).get();
const isAdmin = roleDoc.exists && roleDoc.data()?.role === "admin";
```

## ملاحظات مهمة

1. **UID يجب أن يكون صحيحاً**: تأكد من نسخ UID الكامل من Authentication
2. **حقل `role` يجب أن يكون `"admin"` بالضبط**: حساس لحالة الأحرف
3. **Security Rules**: القواعد تمنع الكتابة في `roles` من Client-side، فقط Admin SDK يمكنه الكتابة
4. **النسخ الاحتياطي**: احفظ قائمة UIDs للأدمن في مكان آمن

## إضافة أدمن إضافي

لإضافة أدمن جديد، كرر الخطوات أعلاه مع UID المستخدم الجديد.

## إزالة صلاحيات الأدمن

لإزالة صلاحيات الأدمن:
1. اذهب إلى Firestore Database
2. افتح collection `roles`
3. احذف المستند الذي يحتوي على UID المستخدم

## التحقق من القواعد

بعد إعداد `roles` collection، اختبر القواعد:

1. سجل دخول كمستخدم عادي
2. حاول الوصول إلى private subcollections - يجب أن يفشل
3. سجل دخول كمستخدم أدمن
4. حاول الوصول إلى private subcollections - يجب أن ينجح

## مثال كامل

```
Firebase Console → Firestore Database

Collection: roles
├── Document ID: user1_uid_here
│   └── role: "admin"
├── Document ID: user2_uid_here
│   └── role: "admin"
└── ...
```

## 🔗 روابط مفيدة

- [Firebase Console - Authentication](https://console.firebase.google.com/project/omrarafa-c6a94/authentication/users)
- [Firebase Console - Firestore](https://console.firebase.google.com/project/omrarafa-c6a94/firestore)

