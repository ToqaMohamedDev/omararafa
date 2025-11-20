# دليل تحويل البيانات (Migration Guide)

## 📋 نظرة عامة

هذا الدليل يوضح كيفية تحويل بيانات الفيديوهات والاختبارات من الشكل القديم إلى الشكل الجديد الذي يعتمد على private subcollections حسب Firestore Security Rules.

## 🔄 التغييرات

### الفيديوهات (Videos)

**الشكل القديم:**
```json
{
  "id": "video123",
  "title": "...",
  "description": "...",
  "thumbnailUrl": "...",
  "videoUrl": "https://...",  ← سيتم نقله
  "category": "...",
  "level": "...",
  "createdAt": "...",
  "updatedAt": "...",
  "views": 0
}
```

**الشكل الجديد:**
```json
// videos/{id}
{
  "title": "...",
  "description": "...",
  "thumbnailUrl": "...",
  "category": "...",
  "level": "...",
  "createdAt": "...",
  "updatedAt": "...",
  "views": 0
}

// videos/{id}/private/source
{
  "url": "https://..."  ← videoUrl القديم
}
```

### الاختبارات (Tests)

**الشكل القديم:**
```json
{
  "id": "test123",
  "title": "...",
  "description": "...",
  "questionsData": [...],  ← سيتم نقله
  "category": "...",
  "level": "...",
  "createdAt": "...",
  "updatedAt": "..."
}
```

**الشكل الجديد:**
```json
// tests/{id}
{
  "title": "...",
  "description": "...",
  "category": "...",
  "level": "...",
  "createdAt": "...",
  "updatedAt": "..."
}

// tests/{id}/private/content
{
  "url": "[JSON string of questionsData]"  ← questionsData القديم
}
```

## 🚀 كيفية التنفيذ

### الخطوة 1: التحقق من Firebase Admin

تأكد من أن Firebase Admin SDK مهيأ بشكل صحيح وأن متغيرات البيئة موجودة.

### الخطوة 2: الحصول على ID Token

قم بتسجيل الدخول كـ Admin واحصل على ID Token من Firebase Auth.

### الخطوة 3: استدعاء API Migration

استخدم أحد الطرق التالية:

#### الطريقة 1: استخدام curl

```bash
curl -X POST https://your-domain.com/api/migrate \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "YOUR_ID_TOKEN_HERE"
  }'
```

#### الطريقة 2: استخدام JavaScript/TypeScript

```typescript
const idToken = await user.getIdToken();

const response = await fetch('/api/migrate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    idToken: idToken,
  }),
});

const result = await response.json();
console.log(result);
```

#### الطريقة 3: استخدام Postman أو أي REST Client

1. Method: `POST`
2. URL: `https://your-domain.com/api/migrate`
3. Headers: `Content-Type: application/json`
4. Body:
```json
{
  "idToken": "YOUR_ID_TOKEN_HERE"
}
```

## 📊 النتائج المتوقعة

بعد تنفيذ السكريبت، ستحصل على استجابة مثل:

```json
{
  "success": true,
  "message": "تم إكمال عملية التحويل",
  "results": {
    "videos": {
      "total": 10,
      "migrated": 10,
      "errors": []
    },
    "tests": {
      "total": 5,
      "migrated": 5,
      "errors": []
    }
  },
  "summary": {
    "videos": "10/10 فيديو تم تحويله",
    "tests": "5/5 اختبار تم تحويله",
    "totalErrors": 0
  }
}
```

## ⚠️ ملاحظات مهمة

1. **النسخ الاحتياطي**: يُنصح بعمل نسخة احتياطية من قاعدة البيانات قبل التنفيذ.

2. **التشغيل مرة واحدة**: السكريبت آمن للتشغيل عدة مرات - سيتخطى البيانات التي تم تحويلها مسبقاً.

3. **الأخطاء**: إذا حدثت أخطاء، ستجدها في `results.videos.errors` و `results.tests.errors`.

4. **الصلاحيات**: يجب أن تكون مسجلاً كـ Admin (dzggghjg@gmail.com) لتنفيذ السكريبت.

5. **Firestore Rules**: تأكد من أن Firestore Security Rules تسمح بإنشاء private subcollections.

## 🔍 التحقق من النتائج

بعد التنفيذ، يمكنك التحقق من النتائج في Firebase Console:

1. اذهب إلى **Firestore Database**
2. افتح مجموعة `videos` واختر أي فيديو
3. تأكد من وجود subcollection `private` → `source` مع حقل `url`
4. تأكد من عدم وجود `videoUrl` في المستند الرئيسي
5. كرر نفس الخطوات لمجموعة `tests`

## 🐛 حل المشاكل

### خطأ: "Firebase Admin not initialized"
- تأكد من أن متغيرات البيئة موجودة
- تحقق من أن Firebase Admin SDK مهيأ بشكل صحيح

### خطأ: "Unauthorized: Admin access only"
- تأكد من أنك مسجل دخول كـ Admin
- تحقق من أن ID Token صحيح

### خطأ: "Missing or insufficient permissions"
- تحقق من Firestore Security Rules
- تأكد من أن القواعد تسمح بإنشاء private subcollections

## 📝 ملاحظات إضافية

- السكريبت يحافظ على نفس IDs للمستندات
- البيانات القديمة (videoUrl و questionsData) يتم حذفها من المستندات الرئيسية
- البيانات الجديدة تُحفظ في private subcollections

