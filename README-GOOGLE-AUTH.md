# تسجيل الدخول بحساب Google

تم إضافة ميزة تسجيل الدخول بحساب Google بنجاح.

## ⚠️ خطأ: auth/api-key-not-valid

إذا ظهر هذا الخطأ، يجب إضافة Firebase API Keys في ملف `.env.local`.

## الإعداد المطلوب:

### 1. الحصول على Firebase API Keys:

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر المشروع: **omrarafa-c6a94**
3. اضغط على أيقونة الإعدادات ⚙️ بجانب **Project Overview**
4. اختر **Project settings**
5. اذهب إلى تبويب **General**
6. في قسم **Your apps**:
   - إذا كان هناك Web app موجود، اضغط على أيقونة الترس ⚙️ بجانبه
   - إذا لم يكن هناك Web app، اضغط على **</>** (Add app) واختر **Web**
7. انسخ القيم التالية من الكود المعروض:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",  // ← انسخ هذا
     authDomain: "omrarafa-c6a94.firebaseapp.com",
     projectId: "omrarafa-c6a94",
     storageBucket: "omrarafa-c6a94.firebasestorage.app",
     messagingSenderId: "116963051139013645034",  // ← انسخ هذا
     appId: "1:116963051139013645034:web:..."  // ← انسخ هذا
   };
   ```

### 2. إنشاء ملف `.env.local`:

في جذر المشروع (نفس مستوى `package.json`)، أنشئ ملف اسمه `.env.local` وأضف:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy... (انسخ apiKey من Firebase Console)
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=116963051139013645034
NEXT_PUBLIC_FIREBASE_APP_ID=1:116963051139013645034:web:... (انسخ appId من Firebase Console)
```

**مثال:**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyABC123XYZ789
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=116963051139013645034
NEXT_PUBLIC_FIREBASE_APP_ID=1:116963051139013645034:web:abc123def456
```

### 3. إعادة تشغيل الخادم:

بعد إضافة الملف، **أعد تشغيل** خادم التطوير:
```bash
# أوقف الخادم (Ctrl+C) ثم:
npm run dev
```

### 4. تفعيل Google Authentication في Firebase:

1. اذهب إلى Firebase Console > **Authentication**
2. اضغط على **Get started** (إذا كان هذا أول مرة)
3. اذهب إلى **Sign-in method**
4. اضغط على **Google**
5. فعّل **Enable**
6. أدخل **Project support email** (يمكن استخدام أي بريد إلكتروني)
7. اضغط **Save**

## الميزات المضافة:

✅ زر تسجيل الدخول بـ Google في صفحة تسجيل الدخول
✅ زر إنشاء حساب بـ Google في صفحة إنشاء الحساب
✅ حفظ بيانات المستخدم تلقائياً في Firestore
✅ دعم صورة المستخدم من Google
✅ معالجة الأخطاء مع رسائل واضحة بالعربية

## الاستخدام:

بعد إضافة API keys وإعادة تشغيل الخادم، يمكن للمستخدمين:
- تسجيل الدخول بحساب Google
- إنشاء حساب جديد بحساب Google
- سيتم حفظ بياناتهم تلقائياً في Firestore

## ملاحظات مهمة:

- ⚠️ **يجب إعادة تشغيل الخادم** بعد إضافة `.env.local`
- ⚠️ تأكد من تفعيل Google Authentication في Firebase Console
- ⚠️ الملف `.env.local` موجود في `.gitignore` ولن يتم رفعه إلى Git
- ⚠️ لا تشارك ملف `.env.local` مع أي شخص

## استكشاف الأخطاء:

### الخطأ: "auth/api-key-not-valid"
- تأكد من نسخ `apiKey` بشكل صحيح من Firebase Console
- تأكد من أن الملف `.env.local` موجود في جذر المشروع
- تأكد من إعادة تشغيل الخادم بعد إضافة الملف

### الخطأ: "Firebase غير مهيأ بشكل صحيح"
- تأكد من وجود جميع المتغيرات في `.env.local`
- تأكد من أن أسماء المتغيرات صحيحة (تبدأ بـ `NEXT_PUBLIC_`)
