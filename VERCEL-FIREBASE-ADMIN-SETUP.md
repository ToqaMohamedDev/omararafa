# إعداد Firebase Client SDK في Vercel

## 📋 المتغيرات المطلوبة

المشروع يحتاج فقط إلى متغيرات Firebase Client SDK (6 متغيرات).

## 🚀 الإعداد في Vercel

### الخطوة 1: الحصول على Firebase Config

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر المشروع: **omrarafa-c6a94**
3. اضغط على ⚙️ **Project Settings**
4. اذهب إلى تبويب **General**
5. في قسم **Your apps**، اضغط على Web app (أو أنشئ واحداً)
6. انسخ القيم من الكود المعروض

### الخطوة 2: إضافة Environment Variables في Vercel

1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اختر مشروعك
3. اذهب إلى **Settings** → **Environment Variables**
4. أضف المتغيرات التالية:

```
NEXT_PUBLIC_FIREBASE_API_KEY = (انسخ من Firebase Console)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = omrarafa-c6a94.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = omrarafa-c6a94
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = omrarafa-c6a94.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = (انسخ من Firebase Console)
NEXT_PUBLIC_FIREBASE_APP_ID = (انسخ من Firebase Console)
```

**مثال:**
```
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyABC123XYZ789def456ghi789
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = omrarafa-c6a94.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = omrarafa-c6a94
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = omrarafa-c6a94.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 116963051139013645034
NEXT_PUBLIC_FIREBASE_APP_ID = 1:116963051139013645034:web:abc123def456ghi789
```

**مهم:**
- تأكد من اختيار **Production**, **Preview**, و **Development** لكل متغير
- أو على الأقل **Production** و **Preview**

### الخطوة 3: Redeploy

بعد إضافة Environment Variables:

1. اذهب إلى **Deployments**
2. اضغط على **Redeploy** للـ deployment الأخير
3. أو ادفع commit جديد إلى GitHub

### الخطوة 4: التحقق

بعد الـ redeploy:
1. افتح موقعك في Vercel
2. افتح Developer Console (F12)
3. يجب ألا ترى رسالة: `⚠️ Firebase API keys missing!`
4. جرب تسجيل الدخول

## ✅ التحقق من الإعداد

في Vercel Logs، يجب ألا ترى:
- ❌ `Firebase API keys are missing`
- ❌ `auth/api-key-not-valid`

## 🐛 حل المشاكل

### المشكلة: "Firebase API keys are missing"

**الحل:**
1. تأكد من إضافة جميع المتغيرات الستة
2. تأكد من أن المتغيرات تبدأ بـ `NEXT_PUBLIC_`
3. تأكد من اختيار البيئات الصحيحة (Production, Preview, Development)
4. قم بعمل Redeploy

### المشكلة: لا يعمل تسجيل الدخول في Production

**الحل:**
1. تأكد من تفعيل Google Sign-In في Firebase Console
2. تأكد من إضافة domain الخاص بـ Vercel في Authorized domains:
   - Authentication → Settings → Authorized domains
   - أضف: `your-project.vercel.app`

## 📝 ملاحظات مهمة

- 🔒 **هذه المتغيرات آمنة للكشف في Client-side** (هذا هو السلوك الطبيعي لـ Firebase Client SDK)
- ⚠️ **بعد إضافة Environment Variables، يجب عمل Redeploy**
- 📚 **للمزيد من المعلومات، راجع:** `FIREBASE-CLIENT-SETUP.md`

## 🗑️ متغيرات لم تعد مطلوبة

بعد إزالة Firebase Admin SDK، **لم تعد تحتاج** إلى:
- ❌ `FIREBASE_SERVICE_ACCOUNT`
- ❌ `FIREBASE_PROJECT_ID` (كان للـ Admin SDK)
- ❌ `FIREBASE_PRIVATE_KEY`
- ❌ `FIREBASE_CLIENT_EMAIL`
- ❌ أي متغيرات أخرى متعلقة بـ Firebase Admin SDK

## 🔗 روابط مفيدة

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Firebase Console](https://console.firebase.google.com/project/omrarafa-c6a94/settings/general)
- [FIREBASE-CLIENT-SETUP.md](./FIREBASE-CLIENT-SETUP.md)
