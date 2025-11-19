# إصلاح مشاكل تسجيل الدخول بـ Google

## المشاكل الشائعة وحلولها

### 1. خطأ "This site can't be reached" أو "ERR_TIMED_OUT"

هذا الخطأ يحدث عادة بسبب:
- إعدادات Firebase غير صحيحة
- API keys مفقودة أو غير صحيحة
- مشاكل في الشبكة أو Firewall

### 2. تسجيل الدخول يستغرق وقتاً طويلاً

تم إضافة timeout للطلبات لتجنب الانتظار الطويل:
- 30 ثانية لفتح نافذة Google
- 10 ثواني للحصول على Token
- 15 ثانية لإرسال الطلب إلى API

## خطوات الإصلاح

### الخطوة 1: التحقق من Firebase Console

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر المشروع: **omrarafa-c6a94**
3. اضغط على ⚙️ **Project Settings**
4. اذهب إلى تبويب **General**
5. في قسم **Your apps**، اضغط على Web app الخاص بك

### الخطوة 2: نسخ إعدادات Firebase

ستجد كود مثل هذا:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "omrarafa-c6a94.firebaseapp.com",  // ← مهم جداً
  projectId: "omrarafa-c6a94",
  storageBucket: "omrarafa-c6a94.firebasestorage.app",
  messagingSenderId: "116963051139013645034",
  appId: "1:116963051139013645034:web:..."
};
```

### الخطوة 3: تحديث ملف `.env.local`

افتح ملف `.env.local` وأضف/حدث القيم التالية:

```env
# Firebase Client SDK Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy... (انسخ من Firebase Console)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=omrarafa-c6a94.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=omrarafa-c6a94
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=omrarafa-c6a94.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=116963051139013645034
NEXT_PUBLIC_FIREBASE_APP_ID=1:116963051139013645034:web:... (انسخ من Firebase Console)
```

**ملاحظة مهمة**: تأكد من نسخ `authDomain` بالضبط كما هو في Firebase Console.

### الخطوة 4: التحقق من إعدادات Google Authentication

1. في Firebase Console، اذهب إلى **Authentication**
2. اضغط على **Sign-in method**
3. تأكد من تفعيل **Google** وضبط:
   - **Enable** = مفعّل
   - **Project support email** = البريد الإلكتروني الخاص بك
   - **Authorized domains** = يجب أن يحتوي على نطاق موقعك

### الخطوة 5: إعادة تشغيل الخادم

بعد تحديث `.env.local`:

```bash
# أوقف الخادم (Ctrl+C)
npm run dev
```

### الخطوة 6: التحقق من Console

افتح Developer Tools (F12) وتحقق من:
- لا توجد أخطاء في Console
- لا توجد تحذيرات حول Firebase API keys

## حلول إضافية

### إذا استمرت المشكلة:

1. **تحقق من Firewall/Proxy**:
   - تأكد من أن `firebaseapp.com` و `googleapis.com` غير محظورين
   - جرب استخدام VPN أو شبكة أخرى

2. **مسح Cache**:
   ```bash
   # مسح cache Next.js
   rm -rf .next
   npm run dev
   ```

3. **التحقق من المتصفح**:
   - جرب متصفح آخر
   - تأكد من السماح للنوافذ المنبثقة (Pop-ups)
   - امسح cookies و cache المتصفح

4. **التحقق من إعدادات Firebase**:
   - تأكد من أن Google Sign-In مفعّل في Firebase Console
   - تأكد من أن OAuth consent screen مُعد بشكل صحيح في Google Cloud Console

## رسائل الخطأ المحسّنة

تم تحسين رسائل الخطأ لتكون أكثر وضوحاً:

- **TIMEOUT**: "انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى أو التحقق من اتصال الإنترنت"
- **TOKEN_TIMEOUT**: "انتهت مهلة الحصول على رمز التحقق. يرجى المحاولة مرة أخرى"
- **popup-blocked**: "تم حظر النافذة المنبثقة. يرجى السماح للنوافذ المنبثقة في إعدادات المتصفح"
- **network-request-failed**: "فشل الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت"

## ملاحظات مهمة

- تأكد من إضافة جميع المتغيرات في `.env.local`
- لا تشارك ملف `.env.local` أو ترفعه إلى Git
- بعد تحديث `.env.local`، يجب إعادة تشغيل الخادم
- تأكد من أن `authDomain` مطابق تماماً لما في Firebase Console

