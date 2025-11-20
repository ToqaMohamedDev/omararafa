# 🔥 حل مشاكل Firebase Client SDK

## المشكلة: "Firebase API keys are missing"

إذا رأيت هذه الرسالة في Console، هذا يعني أن متغيرات Firebase Client SDK غير موجودة.

## الحل في 3 خطوات:

### الخطوة 1: احصل على Firebase Config

1. افتح الرابط: https://console.firebase.google.com/project/omrarafa-c6a94/settings/general
2. في قسم **"Your apps"**، اضغط على Web app (أو أنشئ واحداً)
3. انسخ القيم من الكود المعروض

### الخطوة 2: أضف المتغيرات

1. افتح ملف `.env.local` في المجلد الرئيسي
2. أضف المتغيرات التالية:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy... (انسخ من Firebase Console)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=omrarafa-c6a94.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=omrarafa-c6a94
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=omrarafa-c6a94.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=116963051139013645034
NEXT_PUBLIC_FIREBASE_APP_ID=1:116963051139013645034:web:... (انسخ من Firebase Console)
```

### الخطوة 3: أعد تشغيل الخادم

```bash
# أوقف الخادم (Ctrl+C في Terminal)
# ثم:
npm run dev
```

## ✅ التحقق

بعد إعادة التشغيل:
- افتح المتصفح وافتح Developer Console (F12)
- يجب ألا ترى رسالة: `⚠️ Firebase API keys missing!`
- جرب تسجيل الدخول

## 🚀 طريقة أسهل (Script تلقائي)

```bash
npm run setup:env
```

ثم اتبع التعليمات على الشاشة.

## ⚠️ مهم جداً

- جميع المتغيرات يجب أن تبدأ بـ `NEXT_PUBLIC_`
- لا تنسى إعادة تشغيل الخادم بعد التعديل
- تأكد من نسخ القيم بالضبط من Firebase Console

## 📚 للمزيد من المعلومات

راجع: `FIREBASE-CLIENT-SETUP.md`
