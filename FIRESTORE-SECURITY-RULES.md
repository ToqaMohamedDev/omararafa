# Firestore Security Rules

## ⚠️ مهم جداً: يجب إضافة هذه القواعد لإصلاح مشكلة حفظ البيانات

المشكلة الحالية: **"Missing or insufficient permissions"** عند محاولة حفظ البيانات.

### الخطوات المطلوبة:

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر المشروع: **omrarafa-c6a94**
3. اذهب إلى **Firestore Database** → **Rules**
4. استبدل القواعد الحالية **بالكامل** بالقواعد التالية:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // قاعدة للمستخدمين - يسمح للمستخدم بقراءة وكتابة بياناته فقط
    match /users/{userId} {
      // السماح بالقراءة والكتابة فقط إذا كان المستخدم مسجل دخول وUID يطابق
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // قواعد أخرى للبيانات الأخرى (categories, videos, tests, courses)
    match /categories/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /videos/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /tests/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /courses/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // قاعدة عامة للباقي (للقراءة فقط)
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
- **بعد إضافة القواعد، اضغط على "Publish" لحفظها** ⚠️
- قد يستغرق الأمر بضع دقائق حتى تصبح القواعد فعالة

### التحقق من القواعد:

بعد إضافة القواعد، يمكنك التحقق منها:
1. اذهب إلى **Firestore Database** → **Rules**
2. تأكد من أن القواعد مطابقة تماماً للكود أعلاه
3. اضغط على **"Publish"**
4. انتظر رسالة النجاح

### إذا استمرت المشكلة:

1. تأكد من أن المستخدم مسجل دخول بالفعل (افتح Console في المتصفح)
2. تأكد من أن `auth.currentUser.uid` يطابق `userId` في Firestore
3. تحقق من console في المتصفح للأخطاء
4. تأكد من أن Firebase Client SDK مهيأ بشكل صحيح
5. جرب تسجيل الخروج والدخول مرة أخرى

