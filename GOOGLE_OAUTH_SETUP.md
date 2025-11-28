# إعداد Google OAuth في Appwrite

## الخطوة 1: إنشاء مشروع Google Cloud

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. أنشئ مشروع جديد أو اختر مشروعًا موجودًا
3. من القائمة الجانبية، اذهب إلى **APIs & Services** > **Credentials**
4. انقر على **Create Credentials** > **OAuth client ID**
5. اختر **Web application**
6. أضف **Authorized redirect URIs**:
   ```
   https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/669244b9b001284d94352
   ```
   (استبدل `669244b9b001284d94352` بـ Project ID الخاص بك من Appwrite)
7. احفظ **Client ID** و **Client Secret**

## الخطوة 2: تفعيل Google OAuth في Appwrite

1. اذهب إلى [Appwrite Console](https://cloud.appwrite.io/)
2. اختر مشروعك
3. من القائمة الجانبية، اذهب إلى **Auth** > **Settings**
4. ابحث عن **Google** في قائمة OAuth2 Providers
5. انقر على **Enable**
6. أدخل **App ID** (Client ID من Google)
7. أدخل **App Secret** (Client Secret من Google)
8. احفظ التغييرات

## الخطوة 3: تحديث قاعدة البيانات

### إضافة حقول جديدة:

#### في جدول `users`:
1. اذهب إلى **Databases** > اختر قاعدة بياناتك > **users**
2. انقر على **Add Attribute**
3. أضف:
   - **Key:** `member_id`
   - **Type:** String
   - **Size:** 50
   - **Required:** No

#### في جدول `members`:
1. اذهب إلى **Databases** > اختر قاعدة بياناتك > **members**
2. انقر على **Add Attribute**
3. أضف:
   - **Key:** `user_id`
   - **Type:** String
   - **Size:** 50
   - **Required:** No

## الخطوة 4: اختبار النظام

1. قم بتشغيل التطبيق محليًا:
   ```bash
   npm run dev
   ```

2. اذهب إلى صفحة التسجيل أو تسجيل الدخول
3. انقر على "دخول باستخدام Google"
4. سجّل الدخول بحساب Google
5. يجب أن يتم توجيهك لصفحة تعبئة بيانات العضوية
6. املأ البيانات وأكمل التسجيل
7. تحقق من أنك دخلت إلى لوحة التحكم بنجاح

## ملاحظات مهمة

- **للنشر على Netlify:** تأكد من تحديث Redirect URI في Google Cloud Console ليشمل رابط الموقع المنشور
- **الأعضاء القدماء:** يُنصح بحذف البيانات القديمة قبل التفعيل
- **الصلاحيات:** كل مستخدم جديد يحصل على دور `viewer` افتراضيًا

## استكشاف الأخطاء

### خطأ: "Redirect URI mismatch"
- تأكد من أن Redirect URI في Google Cloud Console يطابق تمامًا الرابط في Appwrite

### خطأ: "Invalid OAuth credentials"
- تحقق من Client ID و Client Secret في إعدادات Appwrite

### المستخدم لا يُوجه لصفحة التسجيل
- تأكد من إضافة حقول `member_id` و `user_id` في قاعدة البيانات
