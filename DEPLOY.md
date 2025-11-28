# نشر التطبيق على Vercel (موصى به)

لنشر تطبيقك ومشاركته مع الآخرين، أسهل طريقة هي استخدام **Vercel**.

## الطريقة 1: عبر الموقع (الأسهل)

1.  قم برفع كود مشروعك على **GitHub**.
2.  اذهب إلى [vercel.com](https://vercel.com) وسجل حساباً.
3.  اضغط على **"Add New..."** -> **"Project"**.
4.  اختر مستودع GitHub الخاص بمشروعك (Import).
5.  في إعدادات النشر (Configure Project):
    *   **Framework Preset:** Vite
    *   **Root Directory:** ./
    *   **Environment Variables:** (مهم جداً!)
        *   اضغط على Environment Variables وأضف المتغيرات الموجودة في ملف `.env` (إن وجدت) أو القيم التي نستخدمها:
        *   (في حالتنا، القيم موجودة داخل الكود مباشرة في `src/lib/appwrite.js`، لذا قد لا تحتاج لإضافة شيء هنا إلا إذا كنت تستخدم `.env`).
6.  اضغط **Deploy**.

## الطريقة 2: السحب والإفلات (Netlify) - بدون GitHub

1.  في جهازك، قم ببناء المشروع:
    ```bash
    npm run build
    ```
2.  سيظهر مجلد جديد اسمه `dist`.
3.  اذهب إلى موقع [netlify.com](https://www.netlify.com) وسجل دخول.
4.  في لوحة التحكم، ستجد منطقة مكتوب فيها "Drag and drop your site output folder here".
5.  اسحب مجلد `dist` وأفلته هناك.
6.  سيتم نشر الموقع فوراً وسيعطيك رابطاً.

---

### ملاحظة مهمة جداً بخصوص Appwrite

بما أنك تستخدم Appwrite Cloud، يجب عليك إضافة **نطاق الموقع الجديد** (Domain) في إعدادات Appwrite.

1.  بعد النشر، انسخ رابط موقعك الجديد (مثلاً `https://my-app.vercel.app`).
2.  اذهب إلى **Appwrite Console**.
3.  اختر مشروعك -> **Overview** -> **Integrations** -> **Platforms**.
4.  ابحث عن منصة الـ Web التي أنشأتها (localhost).
5.  يمكنك تعديلها أو إضافة واحدة جديدة (+ Add Platform -> Web).
6.  في خانة **Hostname**، ضع رابط موقعك الجديد (بدون https://).
    *   مثال: `my-app.vercel.app`

**بدون هذه الخطوة، لن يعمل تسجيل الدخول في النسخة المنشورة!**
