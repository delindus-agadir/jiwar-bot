# إعداد قاعدة البيانات - نظام الأنشطة

## Collections المطلوبة في Appwrite

### 1. Collection: `activities`

**الوصف:** تخزين معلومات الأنشطة التي ينظمها المسؤولون

**Attributes:**

| Key | Type | Size | Required | Default | Description |
|-----|------|------|----------|---------|-------------|
| title | String | 200 | Yes | - | عنوان النشاط |
| event_date | String | 50 | Yes | - | تاريخ الحدث (ISO format) |
| registration_deadline | String | 50 | Yes | - | آخر موعد للتسجيل |
| location | String | 200 | Yes | - | مكان النشاط |
| contribution_amount | Integer | - | No | 0 | المبلغ بالدرهم (اختياري) |
| organizing_committee | String | 200 | Yes | - | اللجنة المنظمة |
| description | String | 1000 | No | - | وصف النشاط |
| max_participants | Integer | - | No | - | الحد الأقصى للمشاركين |
| current_participants | Integer | - | Yes | 0 | العدد الحالي |
| created_by | String | 50 | Yes | - | معرف المسؤول |
| created_at | String | 50 | Yes | - | تاريخ الإنشاء |
| status | String | 20 | Yes | open | الحالة: open, closed, cancelled |

**Indexes:**
- `created_by` (للبحث السريع)
- `status` (للفلترة)
- `event_date` (للترتيب)

**Permissions:**
- Read: Any
- Create: Users (role: admin)
- Update: Users (role: admin)
- Delete: Users (role: admin)

---

### 2. Collection: `activity_registrations`

**الوصف:** تسجيلات الأعضاء في الأنشطة

**Attributes:**

| Key | Type | Size | Required | Default | Description |
|-----|------|------|----------|---------|-------------|
| activity_id | String | 50 | Yes | - | معرف النشاط |
| member_id | String | 50 | Yes | - | معرف العضو |
| registered_at | String | 50 | Yes | - | تاريخ التسجيل |
| participation_level | String | 20 | Yes | attended | attended, participated, had_role |
| contribution_points | Integer | - | Yes | 6 | 6, 8, or 12 |
| role_description | String | 500 | No | - | وصف الدور (إذا had_role) |
| payment_status | String | 20 | Yes | pending | pending, paid |
| payment_amount | Integer | - | No | 0 | المبلغ المدفوع |
| confirmed_by_admin | Boolean | - | Yes | false | تأكيد المسؤول |

**Indexes:**
- `activity_id` (للبحث السريع)
- `member_id` (للبحث السريع)
- Compound: `activity_id + member_id` (منع التسجيل المكرر)

**Permissions:**
- Read: Users
- Create: Users (role: member, admin)
- Update: Users (role: admin)
- Delete: Users (role: admin)

---

### 3. Collection: `monthly_scores`

**الوصف:** النقاط الشهرية المحسوبة لكل عضو

**Attributes:**

| Key | Type | Size | Required | Default | Description |
|-----|------|------|----------|---------|-------------|
| member_id | String | 50 | Yes | - | معرف العضو |
| month | String | 10 | Yes | - | الشهر (YYYY-MM) |
| quality_score | Float | - | Yes | 0 | نقاط الجودة (0-25) |
| contribution_score | Float | - | Yes | 0 | نقاط المساهمة |
| quality_weight | Float | - | Yes | 0.7 | وزن الجودة (70%) |
| contribution_weight | Float | - | Yes | 0.3 | وزن المساهمة (30%) |
| total_score | Float | - | Yes | 0 | الإجمالي المرجح |
| evaluations_count | Integer | - | Yes | 0 | عدد التقييمات |
| activities_count | Integer | - | Yes | 0 | عدد الأنشطة |
| created_at | String | 50 | Yes | - | تاريخ الإنشاء |

**Indexes:**
- `member_id` (للبحث السريع)
- `month` (للترتيب)
- Compound: `member_id + month` (منع التكرار)

**Permissions:**
- Read: Users
- Create: Users (role: admin) + System
- Update: Users (role: admin) + System
- Delete: Users (role: admin)

---

## خطوات الإعداد في Appwrite Console

### الخطوة 1: إنشاء Collection `activities`

1. اذهب إلى **Databases** > اختر قاعدة بياناتك
2. انقر **Create Collection**
3. Collection ID: `activities`
4. Collection Name: `Activities`
5. أضف جميع الـ Attributes من الجدول أعلاه
6. أضف الـ Indexes
7. اضبط الـ Permissions

### الخطوة 2: إنشاء Collection `activity_registrations`

1. انقر **Create Collection**
2. Collection ID: `activity_registrations`
3. Collection Name: `Activity Registrations`
4. أضف جميع الـ Attributes
5. أضف الـ Indexes (مهم جداً: compound index لمنع التسجيل المكرر)
6. اضبط الـ Permissions

### الخطوة 3: إنشاء Collection `monthly_scores`

1. انقر **Create Collection**
2. Collection ID: `monthly_scores`
3. Collection Name: `Monthly Scores`
4. أضف جميع الـ Attributes
5. أضف الـ Indexes
6. اضبط الـ Permissions

---

## ملاحظات مهمة

### 🔒 Permissions
- **activities**: الجميع يقرأ، المسؤولون فقط يكتبون
- **activity_registrations**: الأعضاء يسجلون، المسؤولون يعدلون
- **monthly_scores**: نظام تلقائي + مسؤولون

### 📊 Indexes
- الـ Compound Indexes مهمة جداً للأداء
- تأكد من إضافتها بالضبط كما هو موضح

### 🔄 Auto-calculation
- `monthly_scores` سيتم حسابها تلقائياً في نهاية كل شهر
- يمكن للمسؤول إعادة الحساب يدوياً إذا لزم الأمر

---

## التحقق من الإعداد

بعد إنشاء الـ Collections، تحقق من:
- [ ] جميع الـ Attributes موجودة
- [ ] الأنواع صحيحة (String, Integer, Float, Boolean)
- [ ] الـ Required fields صحيحة
- [ ] الـ Default values مضبوطة
- [ ] الـ Indexes تم إنشاؤها
- [ ] الـ Permissions صحيحة
