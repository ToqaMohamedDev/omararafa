# إصلاح خطأ Google Authentication: auth/invalid-credential

## الخطأ:
```
Firebase: Remote site returned malformed response that cannot be parsed for google.com for CODE_EXCHANGE (auth/invalid-credential).
```

## الحلول:

### 1. التحقق من Authorized Domains في Firebase Console

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك: **omrarafa-c6a94**
3. اذهب إلى **Authentication** > **Settings** > **Authorized domains**
4. تأكد من إضافة:
   - `localhost` (للتطوير المحلي)
   - `omrarafa-c6a94.firebaseapp.com`
   - أي domain آخر تستخدمه (مثل `vercel.app` إذا كنت تستخدم Vercel)

### 2. التحقق من إعدادات OAuth في Google Cloud Console

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. اختر المشروع: **omrarafa-c6a94** (أو نفس Project ID)
3. اذهب إلى **APIs & Services** > **Credentials**
4. ابحث عن **OAuth 2.0 Client IDs** المستخدمة في Firebase
5. تأكد من أن **Authorized JavaScript origins** تتضمن:
   - `http://localhost:3000` (للتطوير المحلي)
   - `https://omrarafa-c6a94.firebaseapp.com`
   - أي domain آخر تستخدمه
6. تأكد من أن **Authorized redirect URIs** تتضمن:
   - `http://localhost:3000/__/auth/handler` (للتطوير المحلي)
   - `https://omrarafa-c6a94.firebaseapp.com/__/auth/handler`
   - أي domain آخر مع `/__/auth/handler`

### 3. التحقق من إعدادات Firebase Authentication

1. في Firebase Console، اذهب إلى **Authentication** > **Sign-in method**
2. تأكد من أن **Google** مفعّل
3. اضغط على **Google** وتحقق من:
   - **Web client ID** و **Web client secret** موجودان
   - إذا لم تكن موجودة، اضغط على **Enable** ثم **Save**

### 4. إعادة إنشاء OAuth Credentials (إذا لزم الأمر)

إذا استمرت المشكلة:

1. في Google Cloud Console، اذهب إلى **APIs & Services** > **Credentials**
2. احذف OAuth 2.0 Client ID المستخدمة في Firebase
3. في Firebase Console، اذهب إلى **Authentication** > **Sign-in method** > **Google**
4. اضغط على **Reset** أو **Re-enable**
5. سيتم إنشاء OAuth credentials جديدة تلقائياً

### 5. التحقق من Environment Variables

تأكد من أن ملف `.env.local` يحتوي على جميع القيم الصحيحة:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=omrarafa-c6a94.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=omrarafa-c6a94
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=omrarafa-c6a94.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 6. مسح Cache والمحاولة مرة أخرى

1. امسح cache المتصفح (Ctrl+Shift+Delete أو Cmd+Shift+Delete)
2. امسح localStorage:
   ```javascript
   localStorage.clear();
   ```
3. أعد تشغيل خادم التطوير:
   ```bash
   npm run dev
   ```

### 7. استخدام signInWithRedirect بدلاً من signInWithPopup (حل بديل)

إذا استمرت المشكلة، يمكنك تجربة استخدام `signInWithRedirect` بدلاً من `signInWithPopup`:

```typescript
import { signInWithRedirect, getRedirectResult } from "firebase/auth";

// بدلاً من signInWithPopup
await signInWithRedirect(auth, googleProvider);

// ثم في useEffect أو بعد التوجيه
const result = await getRedirectResult(auth);
```

### 8. التحقق من CORS و Network Issues

- تأكد من أن المتصفح لا يحظر popups
- تحقق من Console للأخطاء الأخرى
- جرب في متصفح آخر أو وضع Incognito

## ملاحظات مهمة:

- **لا تستخدم** `setCustomParameters` مع `prompt: "select_account"` إذا كان يسبب مشاكل
- تأكد من أن جميع Domains مضاف بشكل صحيح في Firebase و Google Cloud Console
- إذا كنت تستخدم Vercel أو أي hosting آخر، أضف domain الخاص به في Authorized domains

## إذا استمرت المشكلة:

1. تحقق من [Firebase Status Page](https://status.firebase.google.com/) للتأكد من عدم وجود مشاكل في الخدمة
2. راجع [Firebase Authentication Documentation](https://firebase.google.com/docs/auth/web/google-signin)
3. تحقق من [Google Cloud Console](https://console.cloud.google.com/) للتأكد من عدم وجود قيود على المشروع

