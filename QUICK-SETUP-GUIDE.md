# دليل الإعداد السريع (Quick Setup Guide)

## 🚀 إعداد Firebase Client SDK في 5 دقائق

### الخطوة 1: الحصول على Firebase Config

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر المشروع: **omrarafa-c6a94**
3. اضغط على ⚙️ **Project Settings** (في القائمة الجانبية)
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

في المجلد الرئيسي للمشروع:

**على macOS/Linux:**
```bash
touch .env.local
```

**أو أنشئ الملف يدوياً** من محرر النصوص.

### الخطوة 3: إضافة متغيرات البيئة

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
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyABC123XYZ789def456ghi789
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=omrarafa-c6a94.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=omrarafa-c6a94
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=omrarafa-c6a94.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=116963051139013645034
NEXT_PUBLIC_FIREBASE_APP_ID=1:116963051139013645034:web:abc123def456ghi789
```

### الخطوة 4: إعادة تشغيل الخادم

**مهم جداً:** يجب إعادة تشغيل خادم التطوير بعد إضافة متغيرات البيئة!

```bash
# أوقف الخادم (اضغط Ctrl+C في Terminal)
# ثم أعد تشغيله:
npm run dev
```

### الخطوة 5: التحقق

بعد إعادة التشغيل:
1. افتح المتصفح
2. افتح Developer Console (F12)
3. يجب ألا ترى رسالة: `⚠️ Firebase API keys missing!`
4. جرب تسجيل الدخول أو فتح صفحة Admin

## ✅ التحقق من أن كل شيء يعمل

افتح المتصفح وافتح Developer Console (F12):
- ✅ لا توجد رسائل خطأ متعلقة بـ Firebase
- ✅ يمكنك تسجيل الدخول
- ✅ صفحة Admin تعمل (إذا كنت مسجل دخول كـ Admin)

## 🚀 طريقة أسهل (Script تلقائي)

```bash
npm run setup:env
```

ثم اتبع التعليمات على الشاشة.

## 🐛 حل المشاكل الشائعة

### المشكلة: "Firebase API keys are missing"

**الحل:**
- تأكد من أن جميع المتغيرات الستة موجودة في `.env.local`
- تأكد من أن المتغيرات تبدأ بـ `NEXT_PUBLIC_`
- تأكد من إعادة تشغيل الخادم

### المشكلة: "auth/api-key-not-valid"

**الحل:**
- تأكد من نسخ `apiKey` بالضبط من Firebase Console
- تأكد من عدم وجود مسافات إضافية قبل أو بعد القيمة
- أعد تشغيل الخادم

### المشكلة: لا يعمل تسجيل الدخول

**الحل:**
1. تأكد من أن `authDomain` صحيح: `omrarafa-c6a94.firebaseapp.com`
2. تأكد من تفعيل Google Sign-In في Firebase Console:
   - Authentication → Sign-in method → Google → Enable
3. تأكد من إضافة Authorized domains في Firebase Console

## 📝 ملاحظات مهمة

- ⚠️ **لا ترفع ملف `.env.local` إلى Git** - إنه موجود في `.gitignore`
- 🔒 **هذه المتغيرات آمنة للكشف في Client-side** (هذا هو السلوك الطبيعي لـ Firebase Client SDK)
- 📚 **للمزيد من التفاصيل، راجع:** `FIREBASE-CLIENT-SETUP.md`

## 🔗 روابط مفيدة

- [Firebase Console - General Settings](https://console.firebase.google.com/project/omrarafa-c6a94/settings/general)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

## 📞 إذا استمرت المشكلة

1. تحقق من Console في المتصفح (F12) لرؤية رسائل الخطأ
2. تأكد من أن ملف `.env.local` موجود في المجلد الرئيسي
3. تأكد من أن جميع المتغيرات الستة موجودة
4. راجع `FIREBASE-CLIENT-SETUP.md` للتفاصيل الكاملة
