# وين ألاقي؟ — Wain Alaqi

منصة محلية للبحث عن المنتجات والخدمات والمتاجر في **الرمثا، الأردن**.
المستخدم يكتب اسم منتج أو خدمة يحتاجها، فتعرض له المنصة المتاجر التي توفره مع السعر والتوفر والموقع ووسائل التواصل.

> **ملاحظة:** جميع البيانات الافتراضية (Seed Data) هي بيانات تجريبية واضحة (`is_demo = true`) ولا تمثّل متاجر أو أشخاصًا حقيقيين. يمكن للمدير حذفها.

---

## المميزات (Features)

- 🔎 **محرك بحث** عربي/إنجليزي يدعم المطابقة الجزئية وترتيب النتائج (الصلة، التوفر، المسافة، التقييم، حداثة المخزون، التوثيق).
- 🏪 **متاجر** مع صفحات تفصيلية وحالات (مسودة / بانتظار المراجعة / معتمد / مرفوض / موقوف / مؤرشف).
- 📦 **منتجات** مع حالات توفر (متوفر / كمية محدودة / غير متوفر / غير معروف) وآخر تحديث للمخزون.
- 🗺️ **خريطة** Leaflet / OpenStreetMap (بدون API Key مدفوع).
- ⭐ **تقييمات** مع نظام إشراف (Moderation) وبلاغات.
- 📩 **طلبات "لم أجد ما أبحث عنه"** مع حالات (جديد / قيد البحث / تم الإيجاد / مغلق).
- 🛠️ **لوحة تحكم التاجر** (Store Dashboard): إحصائيات، تعديل المتجر، إدارة المنتجات.
- 🛡️ **لوحة إدارة CMS**: متاجر، قطاعات، منتجات، مستخدمون، تجار، تقييمات، طلبات بحث، محتوى الصفحات.
- 🔐 **مصادقة وأدوار**: USER، STORE_OWNER، ADMIN، CONTENT_MANAGER مع تحكم بالصلاحيات.
- 🌍 **قابلية التوسع للمدن** — المدينة كيان مستقل، يمكن إضافة إربد/عمان/الزرقاء لاحقًا دون تغيير المعمارية.
- 📱 **عربي RTL** بالكامل، Responsive (Mobile First).

---

## التقنية (Stack)

| الطبقة | التقنية |
|--------|---------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | Next.js Route Handlers (API) + Server Components |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (Credentials provider, bcrypt) |
| Maps | Leaflet + OpenStreetMap |
| Tests | Vitest + jsdom |
| Fonts | next/font (Cairo) |

---

## المتطلبات (Requirements)

- Node.js ≥ 20
- PostgreSQL ≥ 14 (محلي أو سحابي مثل Neon / Supabase)

---

## التثبيت والتشغيل (Installation)

```bash
# 1. تثبيت الحزم
npm install

# 2. إعداد متغيرات البيئة
cp .env.example .env
# عدّل قيم .env (DATABASE_URL, AUTH_SECRET, ...)

# 3. توليد عميل Prisma
npm run db:generate

# 4. تشغيل المايكريشنز
npm run db:migrate:dev   # بيئة تطوير (ينشئ قاعدة البيانات)
# أو: npm run db:push     # دفع المخطط مباشرة بدون مايكريشنز

# 5. بيانات افتراضية
npm run db:seed

# 6. تشغيل التطوير
npm run dev
# افتح http://localhost:3000
```

### تشغيل سريع مع Docker

```bash
docker compose up --build
# التطبيق على http://localhost:3000 (مع PostgreSQL جاهز)
```

---

## متغيرات البيئة (Environment Variables)

انظر `.env.example`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/wain_alaqi?sslmode=require
AUTH_SECRET=change-me-to-a-long-random-string
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_CITY=al-ramtha
MAP_PROVIDER=leaflet
STORAGE_PROVIDER=local
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
```

> **أمان:** لا تضع قيمًا حقيقية في `.env` داخل Git. الملف `.env` مُتجاهَل في `.gitignore`.

---

## إعداد قاعدة البيانات (Database Setup)

```bash
npm run db:migrate:dev     # إنشاء/تطبيق المايكريشنز
npm run db:seed            # بيانات تجريبية
npm run db:reset           # إعادة ضبط كاملة (حذر)
npm run db:studio          # Prisma Studio لاستعراض البيانات
```

---

## البيانات الافتراضية (Seed Data)

ينشئ `npm run db:seed`:

- 1 مدينة (الرمثا)
- 10 قطاعات
- ~36 متجرًا تجريبيًا (بما فيها متجر `PENDING_REVIEW` وآخر `REJECTED`)
- ~200 منتجًا تجريبيًا
- ~10 تقييمات
- 38 مستخدمًا (admin + 36 تاجر + 1 مستخدم)
- محتوى افتراضي للصفحات (Hero, Banner, FAQ, ...)

جميع السجلات التجريبية موسومة `is_demo = true`. يمكن للمدير حذف البيانات التجريبية.

---

## التطوير والإنتاج (Development / Production)

```bash
npm run dev        # تطوير
npm run build      # بناء الإنتاج
npm run start      # تشغيل بناء الإنتاج
npm run lint       # فحص الكود
npm run test       # الاختبارات
```

---

## الاختبارات (Testing)

```bash
npm test           # vitest
npm run test:watch # وضع المراقبة
```

الاختبارات تغطي: utils، validations، محرك البحث (تكاملي مع قاعدة البيانات)، المصادقة والأدوار.

> ملاحظة: اختبارات التكامل تتطلب قاعدة بيانات مُهيّأة (شغّل `db:migrate` و`db:seed` أولًا).

---

## الأدوار (Roles)

| الدور | الصلاحيات |
|-------|-----------|
| USER | بحث، تصفح، تقييم المتاجر، إرسال طلبات بحث |
| STORE_OWNER | كل صلاحيات USER + لوحة تحكم متجره فقط |
| ADMIN | كل الصلاحيات + لوحة إدارة CMS |
| CONTENT_MANAGER | إدارة المحتوى والقطاعات |

---

## الحسابات التجريبية (Demo Accounts)

> ⚠️ لل تطوير فقط. غيّر كلمات المرور في الإنتاج.

| الدور | البريد | كلمة المرور |
|-------|--------|-------------|
| Admin | `admin@example.com` | `ChangeMe123!` |
| Store Owner | `store1@example.com` | `ChangeMe123!` |
| User | `user@example.com` | `ChangeMe123!` |

---

## الأمان (Security)

- تجزئة كلمات المرور (bcrypt, cost 12)
- تحكم بالصلاحيات حسب الدور (RBAC) على مستوى الخادم
- تحقق من المدخلات (Zod) على الخادم والعميل
- منع وصول التاجر إلى متاجر الآخرين
- حماية مسارات الإدارة (`/admin`) بالتحقق من الجلسة والدور
- لا تُخزَّن الأسرار في Git

---

## قابلية التوسع للمدن (Multi-city)

المدينة كيان مستقل (`City`) وكل متجر مرتبط بمدينة. البحث يمكن تقييده بالمدينة.
لإضافة مدينة جديدة (مثل إربد): أضف سجلًا في جدول `cities` — لا حاجة لتغيير المعمارية.

---

## القرارات التقنية (Technical Decisions)

- **Next.js Route Handlers** بدل backend منفصل: بساطة النشر على Vercel/Render ودمج Frontend/Backend.
- **Prisma ORM**: مايكريشنز آمنة، أنواع TypeScript، وسهولة التبديل بين مزودي PostgreSQL.
- **Leaflet/OpenStreetMap**: مجاني وبدون API Key في التطوير.
- **NextAuth Credentials**: مناسب للمنصة المحلية؛ يمكن لاحقًا إضافة OAuth.

---

## النشر (Deployment)

### Vercel
1. اربط المستودع على Vercel.
2. أضف متغيرات البيئة (DATABASE_URL, AUTH_SECRET, ...).
3. شغّل `db:migrate` و`db:seed` عبر Vercel Build Command أو يدويًا.

### Railway / Render
1. أنشئ PostgreSQL instance.
2. عيّن `DATABASE_URL` ومتغيرات البيئة.
3. شغّل `npm run build && npm run start`.

### Docker
```bash
docker compose up --build
```

---

## هيكل المشروع (Project Structure)

```
src/
  app/
    api/            # Route Handlers (auth, stores, products, search, admin/...)
    admin/          # لوحة إدارة CMS
    dashboard/store/ # لوحة تحكم التاجر
    (public pages)  # /, /search, /stores, /categories, /map, /login, ...
  components/       # مكونات قابلة لإعادة الاستخدام
  lib/              # prisma, auth, search, validations, utils, content, logger
  config/          # constants
prisma/
  schema.prisma
  seed.ts
tests/             # vitest
```

---

## ترخيص (License)

MIT — مشروع تجريبي لأغراض التطوير والعرض.
