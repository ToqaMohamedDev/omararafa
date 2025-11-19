# إصلاح خطأ: auth/unauthorized-domain

## المشكلة
خطأ `Firebase: Error (auth/unauthorized-domain)` يعني أن النطاق الذي تستخدمه (مثل `localhost:3000`) غير مصرح به في Firebase Console.

## الحل السريع

### الخطوة 1: فتح Firebase Console
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر المشروع: **omrarafa-c6a94**

### الخطوة 2: إضافة النطاقات المصرح بها
1. في القائمة الجانبية، اضغط على **Authentication** (المصادقة)
2. اضغط على **Sign-in method** (طريقة تسجيل الدخول)
3. اضغط على **Google** من قائمة Providers
4. تأكد من أن **Enable** مفعّل
5. اذهب إلى قسم **Authorized domains** (النطاقات المصرح بها)
6. اضغط على **Add domain** (إضافة نطاق)
7. أضف النطاقات التالية:
   - `localhost`
   - `127.0.0.1`
   - إذا كان لديك نطاق production، أضفه أيضاً (مثل `yourdomain.com`)

### الخطوة 3: حفظ التغييرات
1. اضغط على **Save** (حفظ)
2. انتظر بضع ثوانٍ حتى يتم تطبيق التغييرات

### الخطوة 4: إعادة المحاولة
1. أعد تحميل الصفحة في المتصفح
2. جرب تسجيل الدخول بـ Google مرة أخرى

## ملاحظات مهمة

- **localhost** و **127.0.0.1** مضافة تلقائياً في بعض الحالات، لكن قد تحتاج لإضافتها يدوياً
- إذا كنت تستخدم منفذ مختلف (مثل `localhost:3002`)، تأكد من إضافة `localhost` فقط (بدون المنفذ)
- في production، تأكد من إضافة نطاقك الفعلي (مثل `yourdomain.com`)

## إذا استمرت المشكلة

1. تحقق من أن Google Sign-in مفعّل في Firebase Console
2. تحقق من أن `Project support email` مضبوط بشكل صحيح
3. تأكد من أن متغيرات البيئة في `.env.local` صحيحة
4. امسح cache المتصفح وأعد المحاولة

