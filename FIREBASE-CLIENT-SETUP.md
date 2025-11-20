# إعداد Firebase Client SDK

## 📋 المتغيرات المطلوبة

بعد إزالة Firebase Admin SDK، المشروع يحتاج فقط إلى متغيرات Firebase Client SDK.

### المتغيرات الستة المطلوبة:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## 🚀 خطوات الإعداد

### الخطوة 1: الحصول على Firebase Config

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر المشروع: **omrarafa-c6a94**
3. اضغط على ⚙️ **Project Settings** (بجانب Project Overview)
4. اذهب إلى تبويب **General**
5. في قسم **Your apps**:
   - إذا كان هناك Web app موجود، اضغط على أيقونة الترس ⚙️ بجانبه
   - إذا لم يكن هناك Web app، اضغط على **</>** (Add app) واختر **Web**
6. ستجد كود مثل هذا:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "omrarafa-c6a94.firebaseapp.com",
  projectId: "omrarafa-c6a94",
  storageBucket: "omrarafa-c6a94.firebasestorage.app",
  messagingSenderId: "116963051139013645034",
  appId: "1:116963051139013645034:web:..."
};
```

### الخطوة 2: إنشاء ملف `.env.local`

في جذر المشروع (نفس مستوى `package.json`)، أنشئ ملف `.env.local`:

```bash
touch .env.local
```

### الخطوة 3: إضافة المتغيرات

افتح ملف `.env.local` وأضف:

```env
# Firebase Client SDK Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy... (انسخ من Firebase Console)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=omrarafa-c6a94.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=omrarafa-c6a94
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=omrarafa-c6a94.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=116963051139013645034
NEXT_PUBLIC_FIREBASE_APP_ID=1:116963051139013645034:web:... (انسخ من Firebase Console)
```

**مثال كامل:**

```env
# Firebase Client SDK Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyABC123XYZ789def456ghi789
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=omrarafa-c6a94.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=omrarafa-c6a94
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=omrarafa-c6a94.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=116963051139013645034
NEXT_PUBLIC_FIREBASE_APP_ID=1:116963051139013645034:web:abc123def456ghi789
```

### الخطوة 4: إعادة تشغيل الخادم

**مهم جداً:** بعد إضافة أو تعديل ملف `.env.local`، يجب إعادة تشغيل خادم التطوير:

```bash
# أوقف الخادم (Ctrl+C) ثم:
npm run dev
```

## ✅ التحقق من الإعداد

بعد إعادة التشغيل، افتح المتصفح وافتح Developer Console (F12). يجب ألا ترى رسالة:

```
⚠️ Firebase API keys missing!
```

## 🔒 ملاحظات الأمان

- ملف `.env.local` موجود في `.gitignore` ولن يتم رفعه إلى Git
- جميع المتغيرات تبدأ بـ `NEXT_PUBLIC_` لأنها تُستخدم في Client-side
- هذه المتغيرات آمنة للكشف في Client-side (هذا هو السلوك الطبيعي لـ Firebase Client SDK)

## 🗑️ متغيرات لم تعد مطلوبة

بعد إزالة Firebase Admin SDK، **لم تعد تحتاج** إلى:

- ❌ `FIREBASE_SERVICE_ACCOUNT`
- ❌ `FIREBASE_PROJECT_ID` (كان للـ Admin SDK)
- ❌ `FIREBASE_PRIVATE_KEY`
- ❌ `FIREBASE_CLIENT_EMAIL`
- ❌ `FIREBASE_CLIENT_ID`
- ❌ أي متغيرات أخرى متعلقة بـ Firebase Admin SDK

## 🆘 حل المشاكل

### المشكلة: "Firebase API keys are missing"

**الحل:**
1. تأكد من أن ملف `.env.local` موجود في جذر المشروع
2. تأكد من أن جميع المتغيرات الستة موجودة
3. تأكد من أن المتغيرات تبدأ بـ `NEXT_PUBLIC_`
4. أعد تشغيل خادم التطوير

### المشكلة: "auth/api-key-not-valid"

**الحل:**
1. تأكد من نسخ `apiKey` بالضبط من Firebase Console
2. تأكد من عدم وجود مسافات إضافية قبل أو بعد القيمة
3. أعد تشغيل خادم التطوير

### المشكلة: لا يعمل تسجيل الدخول

**الحل:**
1. تأكد من أن `authDomain` صحيح: `omrarafa-c6a94.firebaseapp.com`
2. تأكد من تفعيل Google Sign-In في Firebase Console:
   - Authentication → Sign-in method → Google → Enable
3. تأكد من إضافة Authorized domains في Firebase Console

## 📚 مراجع إضافية

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

