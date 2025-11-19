# إعداد Firebase Admin في Vercel

## المشكلة
خطأ `503 (Service Unavailable)` في production يعني أن Firebase Admin غير مهيأ في Vercel.

## الحل: إضافة Environment Variables في Vercel

### الخطوة 1: الحصول على Firebase Service Account

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر المشروع: **omrarafa-c6a94**
3. اضغط على ⚙️ **Project Settings**
4. اذهب إلى تبويب **Service accounts**
5. اضغط على **Generate new private key**
6. سيتم تحميل ملف JSON - **احفظه بأمان!**

### الخطوة 2: إضافة Environment Variables في Vercel

1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اختر مشروعك: **omararafa-beta**
3. اذهب إلى **Settings** → **Environment Variables**
4. أضف المتغيرات التالية:

#### الطريقة الأولى: استخدام FIREBASE_SERVICE_ACCOUNT (مستحسن)

```
FIREBASE_SERVICE_ACCOUNT = (انسخ محتوى ملف JSON كاملاً)
```

**مثال:**
```json
{"type":"service_account","project_id":"omrarafa-c6a94","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

**مهم جداً:** 
- انسخ الملف JSON **كاملاً** في سطر واحد
- تأكد من أن `\n` في `private_key` موجودة (سيتم استبدالها تلقائياً)

#### الطريقة الثانية: استخدام متغيرات منفصلة

إذا لم تكن تريد استخدام `FIREBASE_SERVICE_ACCOUNT`، أضف:

```
FIREBASE_PROJECT_ID = omrarafa-c6a94
FIREBASE_PRIVATE_KEY_ID = (من ملف JSON)
FIREBASE_PRIVATE_KEY = (من ملف JSON - مع \n)
FIREBASE_CLIENT_EMAIL = (من ملف JSON)
FIREBASE_CLIENT_ID = (من ملف JSON)
FIREBASE_CLIENT_X509_CERT_URL = (من ملف JSON)
```

**مهم:** في `FIREBASE_PRIVATE_KEY`، تأكد من أن `\n` موجودة بين الأسطر.

### الخطوة 3: Redeploy

بعد إضافة Environment Variables:

1. اذهب إلى **Deployments**
2. اضغط على **Redeploy** للـ deployment الأخير
3. أو ادفع commit جديد إلى GitHub

### الخطوة 4: التحقق

بعد الـ redeploy، تحقق من:

1. افتح [Vercel Logs](https://vercel.com/dashboard)
2. ابحث عن: `Firebase Admin initialized successfully`
3. إذا رأيت: `Firebase Admin: private_key missing`، يعني أن Environment Variables غير صحيحة

## ملاحظات مهمة

- **لا تشارك** ملف Service Account JSON مع أي شخص
- **لا ترفع** ملف JSON إلى GitHub
- Environment Variables في Vercel **مشفرة** وآمنة
- بعد إضافة Environment Variables، يجب عمل **Redeploy**

## إذا استمرت المشكلة

1. تحقق من أن `FIREBASE_SERVICE_ACCOUNT` يحتوي على JSON صحيح
2. تحقق من أن `private_key` يحتوي على `\n` بين الأسطر
3. تحقق من Vercel Logs للأخطاء
4. تأكد من أن Service Account له الصلاحيات المطلوبة في Firebase

