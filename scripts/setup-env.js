#!/usr/bin/env node

/**
 * Script لإنشاء ملف .env.local تلقائياً لـ Firebase Client SDK
 * استخدم: node scripts/setup-env.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envLocalPath = path.join(process.cwd(), '.env.local');

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('🚀 إعداد ملف .env.local لـ Firebase Client SDK\n');

  // التحقق من وجود الملف
  if (fs.existsSync(envLocalPath)) {
    const answer = await question('⚠️  ملف .env.local موجود بالفعل. هل تريد استبداله؟ (y/n): ');
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('❌ تم الإلغاء.');
      rl.close();
      return;
    }
  }

  console.log('\n📋 الخطوات:');
  console.log('1. اذهب إلى: https://console.firebase.google.com/project/omrarafa-c6a94/settings/general');
  console.log('2. في قسم "Your apps"، اضغط على Web app (أو أنشئ واحداً)');
  console.log('3. انسخ القيم من الكود المعروض\n');

  console.log('📝 أدخل القيم التالية:\n');

  const apiKey = await question('NEXT_PUBLIC_FIREBASE_API_KEY: ');
  const authDomain = await question('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN (افتراضي: omrarafa-c6a94.firebaseapp.com): ') || 'omrarafa-c6a94.firebaseapp.com';
  const projectId = await question('NEXT_PUBLIC_FIREBASE_PROJECT_ID (افتراضي: omrarafa-c6a94): ') || 'omrarafa-c6a94';
  const storageBucket = await question('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET (افتراضي: omrarafa-c6a94.firebasestorage.app): ') || 'omrarafa-c6a94.firebasestorage.app';
  const messagingSenderId = await question('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ');
  const appId = await question('NEXT_PUBLIC_FIREBASE_APP_ID: ');

  // التحقق من القيم المطلوبة
  if (!apiKey || !messagingSenderId || !appId) {
    console.log('\n❌ خطأ: القيم المطلوبة غير مكتملة');
    rl.close();
    return;
  }

  // إنشاء محتوى .env.local
  const envContent = `# Firebase Client SDK Configuration
# Generated automatically by setup-env.js
# See FIREBASE-CLIENT-SETUP.md for more information

NEXT_PUBLIC_FIREBASE_API_KEY=${apiKey}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${authDomain}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${projectId}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${storageBucket}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId}
NEXT_PUBLIC_FIREBASE_APP_ID=${appId}
`;

  // كتابة الملف
  try {
    fs.writeFileSync(envLocalPath, envContent, 'utf8');
    console.log('\n✅ تم إنشاء ملف .env.local بنجاح!');
    console.log(`📁 الموقع: ${envLocalPath}`);
    console.log('\n⚠️  مهم: أعد تشغيل خادم التطوير (npm run dev)');
    console.log('\n📚 للمزيد من المعلومات، راجع: FIREBASE-CLIENT-SETUP.md');
  } catch (error) {
    console.log('❌ خطأ في كتابة الملف:', error.message);
  }

  rl.close();
}

main().catch(console.error);
