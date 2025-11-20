# Firestore Security Rules

## المطلوب لإصلاح مشكلة حفظ البيانات

يجب إضافة Security Rules في Firebase Console للسماح للمستخدمين بقراءة وكتابة بياناتهم الخاصة.

### الخطوات:

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر المشروع: **omrarafa-c6a94**
3. اذهب إلى **Firestore Database** → **Rules**
4. استبدل القواعد الحالية بالقواعد التالية:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // قاعدة للمستخدمين - يسمح للمستخدم بقراءة وكتابة بياناته فقط
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // قواعد أخرى للبيانات الأخرى (categories, videos, tests, courses)
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### ملاحظات مهمة:

- **`request.auth != null`**: يتحقق من أن المستخدم مسجل دخول
- **`request.auth.uid == userId`**: يتحقق من أن المستخدم يحاول الوصول لبياناته فقط
- بعد إضافة القواعد، اضغط على **Publish** لحفظها

### إذا استمرت المشكلة:

1. تحقق من أن المستخدم مسجل دخول بالفعل
2. تحقق من console في المتصفح للأخطاء
3. تأكد من أن Firebase Client SDK مهيأ بشكل صحيح

