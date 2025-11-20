# إعداد بيئة التطوير المحلية (Local Development Setup)

## 📋 المتغيرات المطلوبة

المشروع يحتاج فقط إلى متغيرات Firebase Client SDK (6 متغيرات).

## 🚀 الإعداد السريع

### الطريقة 1: استخدام Script تلقائي (مستحسن)

```bash
npm run setup:env
```

ثم اتبع التعليمات على الشاشة.

### الطريقة 2: الإعداد اليدوي

#### الخطوة 1: الحصول على Firebase Config

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر المشروع: **omrarafa-c6a94**
3. اضغط على ⚙️ **Project Settings**
4. اذهب إلى تبويب **General**
5. في قسم **Your apps**، اضغط على Web app (أو أنشئ واحداً)
6. انسخ القيم من الكود المعروض

#### الخطوة 2: إنشاء ملف `.env.local`

في المجلد الرئيسي للمشروع:

```bash
touch .env.local
```

#### الخطوة 3: إضافة المتغيرات

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

#### الخطوة 4: إعادة تشغيل الخادم

**مهم جداً:** بعد إضافة أو تعديل `.env.local`، يجب إعادة تشغيل خادم التطوير:

```bash
# أوقف الخادم (Ctrl+C)
npm run dev
```

## ✅ التحقق من الإعداد

بعد إعادة التشغيل:
1. افتح المتصفح وافتح Developer Console (F12)
2. يجب ألا ترى رسالة: `⚠️ Firebase API keys missing!`
3. جرب تسجيل الدخول

## 🐛 حل المشاكل

### المشكلة: "Firebase API keys are missing"

**الحل:**
1. تأكد من أن ملف `.env.local` موجود في جذر المشروع
2. تأكد من أن جميع المتغيرات الستة موجودة
3. تأكد من أن المتغيرات تبدأ بـ `NEXT_PUBLIC_`
4. أعد تشغيل خادم التطوير

### المشكلة: "auth/api-key-not-valid"

**الحل:**
1. تأكد من نسخ `apiKey` بالضبط من Firebase Console
2. تأكد من عدم وجود مسافات إضافية
3. أعد تشغيل الخادم

### المشكلة: لا يعمل تسجيل الدخول

**الحل:**
1. تأكد من تفعيل Google Sign-In في Firebase Console:
   - Authentication → Sign-in method → Google → Enable
2. تأكد من إضافة Authorized domains
3. تأكد من أن `authDomain` صحيح

## 📝 ملاحظات مهمة

- ⚠️ **لا ترفع ملف `.env.local` إلى Git** - إنه موجود في `.gitignore`
- 🔒 **هذه المتغيرات آمنة للكشف في Client-side** (هذا هو السلوك الطبيعي لـ Firebase Client SDK)
- 📚 **للمزيد من التفاصيل، راجع:** `FIREBASE-CLIENT-SETUP.md`

## 🗑️ متغيرات لم تعد مطلوبة

بعد إزالة Firebase Admin SDK، **لم تعد تحتاج** إلى:
- ❌ `FIREBASE_SERVICE_ACCOUNT`
- ❌ `FIREBASE_PROJECT_ID` (كان للـ Admin SDK)
- ❌ `FIREBASE_PRIVATE_KEY`
- ❌ `FIREBASE_CLIENT_EMAIL`
- ❌ أي متغيرات أخرى متعلقة بـ Firebase Admin SDK

## 🔗 روابط مفيدة

- [Firebase Console](https://console.firebase.google.com/project/omrarafa-c6a94/settings/general)
- [FIREBASE-CLIENT-SETUP.md](./FIREBASE-CLIENT-SETUP.md)
