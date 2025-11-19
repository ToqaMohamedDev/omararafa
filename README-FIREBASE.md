# Firebase Admin SDK Integration

تم ربط المشروع بـ Firebase Admin SDK بنجاح.

## الملفات المُنشأة:

### 1. ملفات الإعداد:
- `lib/firebase-admin.ts` - إعداد Firebase Admin SDK
- `lib/firebase-client.ts` - إعداد Firebase Client SDK (للعميل)
- `lib/firebase-utils.ts` - دوال مساعدة للتعامل مع Firebase

### 2. API Routes:
- `app/api/auth/verify/route.ts` - التحقق من الـ token
- `app/api/users/create/route.ts` - إنشاء مستخدم جديد
- `app/api/users/[uid]/route.ts` - الحصول على/تحديث بيانات المستخدم
- `app/api/tests/route.ts` - إدارة الاختبارات
- `app/api/tests/results/route.ts` - حفظ/جلب نتائج الاختبارات
- `app/api/contact/route.ts` - إرسال رسائل التواصل

## الاستخدام:

### إنشاء مستخدم جديد:
```typescript
const response = await fetch('/api/users/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'User Name'
  })
});
```

### حفظ نتيجة اختبار:
```typescript
const response = await fetch('/api/tests/results', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-id',
    testId: 'test-id',
    score: 8,
    percentage: 80,
    answers: { /* answers object */ }
  })
});
```

### إرسال رسالة تواصل:
```typescript
const response = await fetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Name',
    email: 'email@example.com',
    phone: '+20...',
    subject: 'Subject',
    message: 'Message'
  })
});
```

## الأمان:

- ملف `omrarafa-c6a94-firebase-adminsdk-fbsvc-fea6ce64d2.json` تم إضافته إلى `.gitignore`
- جميع API routes محمية وتتحقق من البيانات قبل المعالجة

## ملاحظات:

- تأكد من تفعيل Firestore في Firebase Console
- تأكد من إعداد قواعد الأمان في Firestore
- يمكنك استخدام Firebase Console لإدارة البيانات

