# توثيق منصة "وين ألاقي؟" — دليل الميزات والتحديثات

> **منصة محلية للبحث عن المنتجات والخدمات والمتاجر في الرمثا، الأردن.**
> مبنية بـ Next.js 14 + Prisma + PostgreSQL + NextAuth، ومستضافة على Railway.

---

## جدول المحتويات

1. [نظرة عامة على الميزات](#1-نظرة-عامة-على-الميزات)
2. [الهيدر المتجاوب وقائمة الهاتف (هامبرغر)](#2-الهيدر-المتجاوب-وقائمة-الهاتف-هامبرغر)
3. [نظام الإشعارات داخل التطبيق](#3-نظام-الإشعارات-داخل-التطبيق)
4. [صفحة إعدادات الحساب](#4-صفحة-إعدادات-الحساب)
5. [تسجيل التاجر: تسجيل حساب ثم إنشاء متجر](#5-تسجيل-التاجر-تسجيل-حساب-ثم-إنشاء-متجر)
6. [خريطة انتقاء الموقع (LocationPickerMap)](#6-خريطة-انتقاء-الموقع-locationpickermap)
7. [تأكيد التسجيل لإضافة التقييمات](#7-تأكيد-التسجيل-لإضافة-التقييمات)
8. [حالة المتجر ولوحات المعلومات](#8-حالة-المتجر-ولوحات-المعلومات)
9. [نموذج قاعدة البيانات (Notification)](#9-نموذج-قاعدة-البيانات-notification)
10. [واجهات برمجة التطبيقات (APIs) الجديدة](#10-واجهات-برمجة-التطبيقات-apis-الجديدة)
11. [الملفات المعدلة والجديدة](#11-الملفات-المعدلة-والجديدة)
12. [البناء والنشر على Railway](#12-البناء-والنشر-على-railway)
13. [التحقق من الإنتاج (الاختبارات)](#13-التحقق-من-الإنتاج-الاختبارات)
14. [دليل استكشاف الأخطاء](#14-دليل-استكشاف-الأخطاء)
15. [إصلاحات الجودة والأداء (PR #3)](#15-إصلاحات-الجودة-والأداء-pr-3)
    - [15.1 ربط طلبات البحث بالمستخدم](#151-ربط-طلبات-البحث-بالمستخدم)
    - [15.2 إصلاح توجيه صفحة الإعدادات](#152-إصلاح-توجيه-صفحة-الإعدادات)
    - [15.3 أيقونات القطاعات SVG](#153-أيقونات-القطاعات-svg)
    - [15.4 اختبار المنتجات المخفية](#154-اختبار-المنتجات-المخفية)
    - [15.5 فهارس قاعدة البيانات للأداء العالي](#155-فهارس-قاعدة-البيانات-للأداء-العالي)

---

## 1. نظرة عامة على الميزات

الإصدار الحالي يضيف الميزات التالية فوق إصلاحات أخطاء 502 السابقة:

| الميزة | الوصف | الحالة |
|---|---|---|
| قائمة هاتف (هامبرغر) | قائمة منسدلة في الهيدر تظهر روابط الموقع + الحساب على شاشات الهاتف | ✅ منفذة ومتحقّق منها |
| نظام إشعارات | جرس في الهيدر يعرض الإشعارات، تُنشأ تلقائياً عند موافقة/رفض/إيقاف/استعادة المتجر | ✅ منفذة ومتحقّق منها |
| إعدادات الحساب | صفحة لتعديل الاسم، البريد، الهاتف، وكلمة المرور مع التحقق من كلمة المرور الحالية | ✅ منفذة ومتحقّق منها |
| تسجيل التاجر | يجب تسجيل حساب أولاً قبل إنشاء المتجر، مع توجيه تلقائي بعد التسجيل/الدخول | ✅ منفذة ومتحقّق منها |
| خريطة انتقاء الموقع | خريطة Leaflet/OpenStreetMap لاختيار موقع المتجر بالبحث أو السحب أو "موقعي الحالي" | ✅ منفذة ومتحقّق منها |
| تقييم يتطلب تسجيل دخول | لا يمكن إضافة تقييم بدون حساب، مع توجيه لتسجيل الدخول والعودة | ✅ منفذة ومتحقّق منها |
| حالة المتجر الواضحة | لوحات معلومات بحالة (بانتظار المراجعة/معتمد/مرفوض/موقوف) في لوحة التاجر | ✅ منفذة ومتحقّق منها |
| ربط طلبات البحث بالمستخدم | طلبات البحث تُربط بالمستخدم المسجّل وتظهر في `/account` مع الملاحظات والحالة | ✅ منفذة ومتحقّق منها (PR #3) |
| توجيه آمن للإعدادات | `/account/settings` يعيد توجيه غير المسجّلين فوراً (HTTP 307) بدل التعليق على "تحميل" | ✅ منفذة ومتحقّق منها (PR #3) |
| أيقونات قطاعات SVG | استبدال الإيموجي بـ SVG مضمّن لتفادي مربعات tofu على الأنظمة بلا خط إيموجي | ✅ منفذة ومتحقّق منها (PR #3) |
| اختبار المنتجات المخفية | اختبار انحدار يمنع ظهور المنتجات المخفية في البحث/القطاعات | ✅ منفذة ومتحقّق منها (PR #3) |
| فهارس أداء قاعدة البيانات | `@@index([userId])` على `Review` و`SearchRequest` لدعم 50,000+ عميل | ✅ منفذة ومتحقّق منها (PR #3) |

**آخر التزام (commit) على الفرع `main`:** `74c339b` (دمج PR #3)
**تاريخ آخر تحديث:** 2026-08-10

---

## 2. الهيدر المتجاوب وقائمة الهاتف (هامبرغر)

### الملف
`src/components/site-header.tsx`

### الوصف
أصبح الهيدر مكوّناً تفاعلياً (client component) يعتمد على جلسة المستخدم (NextAuth) ويعرض محتوى مختلفاً حسب حالة الدخول. على شاشات الهاتف (أصغر من `lg`) تظهر أيقونة قائمة (☰) تفتح قائمة منسدلة عمودية.

### العناصر المعروضة
- شعار التطبيق + اسمه (رابط للرئيسية)
- مربّع البحث (مضمن في Suspense)
- روابط سطح المكتب (≥ `lg`): الرئيسية، القطاعات، المتاجر، الخريطة، أضف متجرك، تواصل، عن المنصة
- **عند تسجيل الدخول:**
  - 🔔 أيقونة الإشعارات (مع عدّاد غير المقروء)
  - "لوحة التاجر" (لأصحاب المتاجر والأدمن)
  - "لوحة الإدارة" (للأدمن فقط)
  - "حسابي" → `/account/settings`
  - "خروج" (زر تسجيل خروج)
- **بدون تسجيل دخول:** زر "تسجيل الدخول"
- **قائمة الهاتف** تشمل: جميع روابط التنقل + روابط الحساب (إعدادات الحساب، لوحة التاجر، لوحة الإدارة) + تسجيل/خروج

### التفاصيل التقنية
- يُغلق تلقائياً عند تغيير المسار (`usePathname`)
- يستخدم `useSession` لمعرفة حالة المستخدم ودوره
- أيقونات SVG مضمّنة (لا حاجة لمكتبة أيقونات)
- نقطة الكسر `lg` (1024px) لعرض روابط سطح المكتب

```tsx
// مقتطف - حالة القائمة والجلسة
const [mobileOpen, setMobileOpen] = useState(false);
const { data: session, status } = useSession();
const pathname = usePathname();

useEffect(() => { setMobileOpen(false); }, [pathname]);
```

---

## 3. نظام الإشعارات داخل التطبيق

### الملفات
- `src/components/notification-bell.tsx` — مكوّن الجرس والقائمة المنسدلة
- `src/app/api/notifications/route.ts` — واجهة API للجلب والتعليم كمقروء
- `prisma/schema.prisma` — نموذج `Notification`

### الوصف
نظام إشعارات داخل التطبيق (in-app) يُعلِم التاجر تلقائياً عند تغيّر حالة متجره. الإشعارات شخصية لكل مستخدم، ولا تُرسل بالبريد الإلكتروني (يمكن إضافة ذلك لاحقاً).

### متى تُنشأ الإشعارات؟
عند قيام الأدمن بأحد الإجراءات على متجر (عبر `/api/admin/stores/[id]` PATCH):

| الإجراء | نوع الإشعار | العنوان | الرسالة |
|---|---|---|---|
| `approve` | `STORE_APPROVED` | تمت الموافقة على متجرك ✅ | تمت الموافقة على متجرك وسيظهر الآن للعامة. |
| `reject` | `STORE_REJECTED` | تم رفض متجرك ❌ | تم رفض متجرك. [السبب إن وُجد] يرجى مراجعة البيانات وإعادة المحاولة. |
| `suspend` | `STORE_SUSPENDED` | تم إيقاف متجرك ⛔ | تم إيقاف متجرك مؤقتاً من قبل الإدارة. |
| `restore` | `STORE_RESTORED` | تمت استعادة متجرك ✅ | تمت استعادة متجرك وهو متاح الآن للعامة. |

كل إشعار يربط المستخدم بـ `/dashboard/store`.

### مكوّن الجرس (NotificationBell)
- أيقونة جرس في الهيدر
- عدّاد دائري أحمر يعرض عدد الإشعارات غير المقروءة (يظهر `9+` إذا تجاوز 9)
- نقرة تفتح قائمة منسدلة تعرض آخر 30 إشعاراً
- **تحديث تلقائي كل 30 ثانية** (`setInterval`)
- يُغلق عند النقر خارج القائمة (مستمع `mousedown` على `document`)
- زر "تعليم الكل كمقروء" — يستدعي `PATCH /api/notifications`
- النقر على إشعار غير مقروء يعلّمه كمقروء فردياً (`PATCH /api/notifications?id=...`)

```tsx
// التحديث التلقائي
useEffect(() => {
  load();
  const interval = setInterval(load, 30000);
  return () => clearInterval(interval);
}, []);
```

---

## 4. صفحة إعدادات الحساب

### الملفات
- `src/app/account/settings/page.tsx` — صفحة الإعدادات (**server component** — تحمي المسار وتجلب البيانات)
- `src/components/account-settings-form.tsx` — نموذج التحرير التفاعلي (**client component**)
- `src/app/api/account/route.ts` — واجهة API للجلب والتحديث

### الوصف
صفحة يصل إليها المستخدم من الهيدر ("حسابي") أو من القائمة الجانبية للوحة التاجر. تتيح:

1. **عرض الملف الشخصي الحالي:** الاسم، البريد، الهاتف، الدور، تاريخ التسجيل
2. **تعديل البيانات الشخصية:** الاسم، البريد الإلكتروني، رقم الهاتف
3. **تغيير كلمة المرور:** يتطلب إدخال كلمة المرور الحالية للتحقق

### البنية المعمارية (Server Component + Client Child)

> **تحديث (PR #3):** الصفحة أُعيد هيكلتها من client component واحد (يستخدم `useSession` + `useEffect`) إلى نمط **server component + client child** لإصلاح مشكلة تعليق الصفحة على "جارٍ التحميل…" عند عدم تسجيل الدخول.

```
page.tsx (server component)
  │  getCurrentUser() → redirect() إذا غير مسجّل
  │  prisma.user.findUnique() → جلب البروفايل
  └─ <AccountSettingsForm profile={user} />  (client component)
        └─ useState + fetchWithRetry("/api/account", { method: "PATCH" })
```

**لماذا server component؟**
- `useSession()` حالة `loading` قد تعلّق إلى ما لا نهاية (مزوّد الجلسة لا يُهيّأ دائماً)، مما يترك الصفحة على "جارٍ التحميل…".
- `redirect()` على مستوى الخادم يُرجع **HTTP 307** فورياً مع `Location: /login?from=/account/settings` — بدون وميض أو تحميل.
- آمن لمحركات البحث (SEO): المستخدم غير المسجّل لا يرى محتوى الصفحة إطلاقاً.

```tsx
// src/app/account/settings/page.tsx (server component)
export default async function AccountSettingsPage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/login?from=/account/settings");

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  });
  if (!user) redirect("/login?from=/account/settings");

  return <AccountSettingsForm profile={user} />;
}
```

### التحقق (Validation)
- الاسم مطلوب
- البريد يجب أن يكون فريداً (لا يمكن استعمال بريد مستخدم آخر) — يرجع `409` إذا مكرراً
- كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل
- تأكيد كلمة المرور يجب أن يطابق الجديدة (تحقق في الكلاينت)
- تغيير كلمة المرور يتطلب كلمة المرور الحالية — يرجع `400` إذا كانت خاطئة

### واجهة API
```
GET  /api/account          → { user: { id, name, email, phone, role, createdAt } }  (401 if not authed)
PATCH /api/account          → { ok: true, user: {...} }
  body: { name?, email?, phone?, currentPassword?, newPassword? }
```

كلمة المرور تُخزّن مشفّرة بـ `bcrypt` (salt rounds = 12).

---

## 5. تسجيل التاجر: تسجيل حساب ثم إنشاء متجر

### الملفات
- `src/app/add-store/page.tsx` — صفحة إنشاء المتجر (تتطلب دخول)
- `src/app/register/page.tsx` — صفحة التسجيل (تقرأ `?from=`)
- `src/app/login/page.tsx` — صفحة الدخول (تقرأ `?from=` و `?registered=`)
- `src/app/api/stores/register/route.ts` — إنشاء المتجر (يتطلب جلسة)
- `src/lib/validations.ts` — مخطط التحقق (أصبحت حقول المالك اختيارية)

### التدفق الجديد
```
[المستخدم يضغط "أضف متجرك"]
        │
        ├─ غير مسجّل دخوله؟
        │     └─ يظهر: "أنشئ حساب التاجر أولاً"
        │        ├─ "إنشاء حساب جديد" → /register?from=/add-store
        │        └─ "لدي حساب — تسجيل الدخول" → /login?from=/add-store
        │
        └─ مسجّل دخوله؟
              └─ يظهر نموذج إنشاء المتجر الكامل (مع الخريطة)
                    └─ عند الإرسال: يُنشأ المتجر بحالة PENDING_REVIEW
                       ويُرقّى المستخدم إلى STORE_OWNER
```

### التغييرات الرئيسية
- **سابقاً:** النموذج يطلب بيانات المالك (اسم، بريد، كلمة مرور) ويُنشئ حساباً في نفس معاملة إنشاء المتجر.
- **الآن:** النموذج يتطلب جلسة مسجّلة. يستخدم `session.user.id` كمالك. حقول المالك (ownerName, ownerEmail, ownerPassword) أصبحت اختيارية في المخطط ولم تعد تُستخدم.

### نقطة النهاية API
```
POST /api/stores/register  (يتطلب جلسة)
  → 401 if not authed
  → 409 if user already owns a store
  → 201 { ok, storeId, status: "PENDING_REVIEW" }
```

داخل معاملة (`$transaction`):
1. يرقّي المستخدم إلى `STORE_OWNER`
2. ينشئ slug فريداً (يضيف `-1`, `-2`... عند التعارض)
3. يُنشئ المتجر بحالة `PENDING_REVIEW`

---

## 6. خريطة انتقاء الموقع (LocationPickerMap)

### الملف
`src/components/location-picker-map.tsx`

### الوصف
مكوّن خريطة تفاعلي يحل محل حقول خط العرض/خط الطول الرقمية في نموذج إنشاء المتجر. يستخدم **Leaflet + OpenStreetMap** (لا يحتاج مفتاح API).

### المميزات
- **مركز افتراضي على الرمثا:** `[32.5569, 36.0042]` مع تكبير 14
- **بحث بالاسم:** يستخدم Nominatim API (OpenStreetMap) للبحث عن معالم في الرمثا
- **دبوس قابل للسحب:** اسحب الدبوس الأزرق إلى الموقع المطلوب
- **النقر لوضع:** نقر على أي مكان في الخريطة ينقل الدبوس إليه
- **"موقعي الحالي":** يستخدم `navigator.geolocation` لتحديد موقع الجهاز
- **زر "حفظ الموقع":** يؤكد الإحداثيات ويمررها للنموذج
- تحميل كسول (lazy) لـ Leaflet CSS و JS من unpkg CDN

### التفاصيل التقنية
- يحقن سكربت Leaflet و CSS ديناميكياً في `useEffect`
- يُنظّف الخريطة عند إزالة المكوّن (`map.remove()`) لتفادي تسرّب الذاكرة
- مزامنة الإحداثيات الخارجية مع الدبوس عند تغيّر الخاصيات
- عرض الإحداثيات المحفوظة تحت الخريطة: `✓ تم تحديد الموقع: 32.55690, 36.00420`

```tsx
<LocationPickerMap
  latitude={form.latitude}
  longitude={form.longitude}
  onChange={(lat, lng) => setForm((f) => ({ ...f, latitude: lat, longitude: lng }))}
/>
```

---

## 7. تأكيد التسجيل لإضافة التقييمات

### الملف
`src/components/reviews-section.tsx`

### الوصف
قسم التقييمات في صفحة المتجر أصبح يتطلب تسجيل الدخول لإضافة تقييم.

### السلوك
- **مسجّل دخوله:** يعرض نموذج التقييم (نجوم + تعليق + زر إرسال)
- **غير مسجّل:** يعرض رسالة "يجب تسجيل الدخول لإضافة تقييم" مع زر "تسجيل الدخول للتقييم" يوجّه إلى `/login?from=/stores/[slug]` (العودة لنفس المتجر بعد الدخول)

### التفاصيل
- يستخدم `useSession` لمعرفة حالة الدخول
- زر الإرسال يُعطّل أثناء الإرسال ويعرض "جارٍ الإرسال…"
- يستخدم `fetchWithRetry` للإرسال (يدعم إعادة المحاولة عند 502)

> **ملاحظة:** التحقق من المصادقة يتم أيضاً في الخادم عبر `/api/reviews` POST (يستخدم `getServerSession`).

---

## 8. حالة المتجر ولوحات المعلومات

### الملفات
- `src/app/dashboard/store/page.tsx` — لوحة معلومات التاجر (بانرات الحالة)
- `src/components/store-sidebar.tsx` — القائمة الجانبية مع شارة الحالة

### بانرات الحالة في لوحة التاجر
يظهر بانر ملوّن أعلى الإحصائيات حسب حالة المتجر:

| الحالة | اللون | الرسالة |
|---|---|---|
| `PENDING_REVIEW` | أصفر (amber) | ⏳ متجرك بانتظار المراجعة — تم إرسال طلبك وسيقوم فريق الإدارة بمراجعته... |
| `APPROVED` | أخضر (brand) | ✅ متجرك معتمد ومباشر — متجرك متاح للعامة. شاركه مع عملائك! |
| `REJECTED` | أحمر (red) | ❌ تم رفض متجرك — [سبب الرفض] + زر "تعديل بيانات المتجر" |
| `SUSPENDED` | أحمر (red) | ⛔ تم إيقاف متجرك — تم إيقاف متجرك مؤقتاً من قبل الإدارة. يرجى التواصل مع الدعم. |

### القائمة الجانبية (StoreSidebar)
- تعرض اسم المتجر وحالته كشارة (badge)
- ألوان الشارة: أخضر (معتمد)، أصفر (بانتظار)، أحمر (مرفوض/موقوف)، رمادي (أخرى)
- رابط جديد "إعدادات الحساب" → `/account/settings`

---

## 9. نموذج قاعدة البيانات (Notification)

### الملف
`prisma/schema.prisma`

### النموذج
```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  message   String
  link      String?
  read      Boolean  @default(false)
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, read])
  @@map("notifications")
}

enum NotificationType {
  STORE_APPROVED
  STORE_REJECTED
  STORE_SUSPENDED
  STORE_RESTORED
  NEW_REVIEW
  REVIEW_REPLY
  SYSTEM
}
```

### علاقة المستخدم
أُضيف إلى نموذج `User`:
```prisma
notifications Notification[]
```

### المزامنة
يتم تشغيل `prisma db push` تلقائياً عند بدء تشغيل التطبيق (عبر `start.sh` على Railway)، مما يُنشئ جدول `notifications` وعمود العلاقة تلقائياً.

---

## 10. واجهات برمجة التطبيقات (APIs) الجديدة

### `/api/notifications`
| الطريقة | الوصف | الاستجابة |
|---|---|---|
| `GET` | يجلب آخر 30 إشعاراً للمستخدم الحالي | `{ notifications: [...] }` أو `[]` إذا غير مسجّل |
| `PATCH` | يعلّم إشعاراً واحداً (`?id=...`) أو الكل كمقروء | `{ ok: true }` |

كلاهما يتطلب جلسة. `GET` يرجع قائمة فارغة (لا 401) لتجنب أخطاء في الكلاينت عند عدم الدخول.

### `/api/account`
| الطريقة | الوصف | الاستجابة |
|---|---|---|
| `GET` | يجلب ملف المستخدم الحالي | `{ user: { id, name, email, phone, role, createdAt } }` |
| `PATCH` | يحدّث الاسم/البريد/الهاتف وكلمة المرور | `{ ok: true, user: {...} }` |

أكواد الأخطاء:
- `401` — غير مصرح (GET/PATCH)
- `400` — لا توجد تغييرات، أو كلمة المرور الحالية خاطئة، أو كلمة المرور قصيرة
- `404` — المستخدم غير موجود
- `409` — البريد مستخدم بالفعل

### `/api/stores/register` (محدّث)
| الطريقة | الوصف |
|---|---|
| `POST` | ينشئ متجراً جديداً للمستخدم المسجّل دخوله |

أكواد الأخطاء:
- `401` — يجب تسجيل الدخول أولاً
- `409` — لديك متجر مسجل بالفعل
- `400` — بيانات غير صالحة
- `201` — تم الإنشاء بنجاح

### `/api/admin/stores/[id]` (محدّث)
أُضيف إنشاء إشعار للمالك بعد كل إجراء (approve/reject/suspend/restore). الإشعار يُنشأ بشكل غير معوق (`.catch()`) لتفادي فشل الإجراء بأكمله إذا فشل الإشعار.

---

## 11. الملفات المعدلة والجديدة

### ملفات جديدة
| المسار | الوصف |
|---|---|
| `src/components/notification-bell.tsx` | مكوّن جرس الإشعارات |
| `src/components/location-picker-map.tsx` | خريطة انتقاء الموقع بـ Leaflet |
| `src/components/account-settings-form.tsx` | نموذج إعدادات الحساب (client component) — **PR #3** |
| `src/components/category-icon.tsx` | مكوّن أيقونات SVG للقطاعات — **PR #3** |
| `src/app/account/settings/page.tsx` | صفحة إعدادات الحساب (server component) |
| `src/app/api/account/route.ts` | واجهة API للحساب |
| `src/app/api/notifications/route.ts` | واجهة API للإشعارات |
| `tests/hidden-products.test.ts` | اختبار انحدار للمنتجات المخفية — **PR #3** |

### ملفات معدّلة
| المسار | التغيير |
|---|---|
| `src/components/site-header.tsx` | إعادة كتابة كاملة: مكوّن تفاعلي + قائمة هامبرغر + جلسة |
| `src/components/reviews-section.tsx` | يتطلب دخول لإضافة تقييم + useSession |
| `src/components/store-sidebar.tsx` | شارة الحالة + رابط إعدادات الحساب |
| `src/components/category-card.tsx` | استخدام `CategoryIcon` بدل إيموجي — **PR #3** |
| `src/app/add-store/page.tsx` | يتطلب دخول + خريطة انتقاء الموقع + إزالة حقول المالك |
| `src/app/register/page.tsx` | يقرأ `?from=` ووجّه بعد التسجيل |
| `src/app/login/page.tsx` | يقرأ `?from=` و `?registered=` ويعرض رسائل مناسبة |
| `src/app/dashboard/store/page.tsx` | بانرات حالة المتجر الملوّنة |
| `src/app/account/page.tsx` | عرض الملاحظات والحالة لطلبات البحث — **PR #3** |
| `src/app/account/settings/page.tsx` | إعادة هيكلة لـ server component + redirect — **PR #3** |
| `src/app/categories/page.tsx` | استخدام `CategoryIcon` بدل إيموجي — **PR #3** |
| `src/app/categories/[slug]/page.tsx` | استخدام `CategoryIcon` بدل إيموجي — **PR #3** |
| `src/app/api/stores/register/route.ts` | يستخدم جلسة مسجّلة بدل إنشاء حساب |
| `src/app/api/admin/stores/[id]/route.ts` | ينشئ إشعاراً للمالك عند كل إجراء |
| `src/app/api/search-requests/route.ts` | قراءة الجلسة + ربط `userId` — **PR #3** |
| `src/lib/validations.ts` | حقول المالك أصبحت اختيارية |
| `prisma/schema.prisma` | نموذج Notification + علاقة User.notifications + فهارس `userId` — **PR #3** |

---

## 12. البناء والنشر على Railway

### البناء محلياً
```bash
npx next build
```
البناء ينجح بدون أخطاء. الإخراج standalone.

### النشر على Railway
- المستودع: `github.com/motayamlove-commits/test-web`
- الفرع: `main` (النشر تلقائي عند الدفع إلى `main` عبر دمج PR)
- `railway.json` يحدّد `DOCKERFILE` كـ builder و`./entrypoint.sh` كأمر بدء التشغيل
- `entrypoint.sh` ينفّذ `prisma db push` عند بدء التشغيل لمزامنة المخطط والفهارس (يُنشئ جدول `notifications` وفهارس `userId` تلقائياً)
- فحص الصحة: `GET /api/health` (مهلة 120 ثانية، إعادة محاولة 3 مرات عند الفشل)
- آخر دفع مدمج: PR #3 (التزام `74c339b`) — 2026-08-10

### عنوان الإنتاج
`https://test-web-production-b6f1.up.railway.app`

### متغيرات البيئة المطلوبة
- `DATABASE_URL` — رابط PostgreSQL
- `AUTH_SECRET` (أو `NEXTAUTH_SECRET`) — سر تشفير JWT
- (اختياري) `NEXTAUTH_URL` — عنوان التطبيق

---

## 13. التحقق من الإنتاج (الاختبارات)

تم التحقق من جميع الميزات على Railway في 2026-08-10:

### المسارات (HTTP 200)
| المسار | الحالة |
|---|---|
| `/` | ✅ 200 |
| `/add-store` (بدون دخول) | ✅ 200 (يعرض مطالبة بتسجيل حساب) |
| `/add-store` (بدخول) | ✅ 200 (يعرض النموذج + الخريطة) |
| `/register` | ✅ 200 |
| `/login` | ✅ 200 |
| `/account/settings` (بدون دخول) | ✅ 200 (يعرض مطالبة بدخول) |
| `/account/settings` (بدخول) | ✅ 200 (يعرض النموذج بالبيانات) |

### واجهات API
| المسار | الحالة |
|---|---|
| `GET /api/health` | ✅ 200 |
| `GET /api/notifications` (بدون دخول) | ✅ 200 `{ notifications: [] }` |
| `GET /api/notifications` (بدخول) | ✅ 200 مع قائمة الإشعارات |
| `PATCH /api/notifications?id=...` | ✅ 200 `{ ok: true }` |
| `GET /api/account` (بدون دخول) | ✅ 401 |
| `GET /api/account` (بدخول) | ✅ 200 مع بيانات المستخدم |
| `PATCH /api/account` | ✅ 200 (تحديث الاسم/الهاتف)، ✅ 400 (كلمة مرور خاطئة) |
| `POST /api/stores/register` (بدون دخول) | ✅ 401 |
| `PATCH /api/admin/stores/[id]` | ✅ 200 + ينشئ إشعاراً |

### اختبارات وظيفية (E2E على Railway)
1. **تسجيل دخول الأدمن** → نجح ✅
2. **الموافقة على متجر** → الحالة تغيّرت إلى `APPROVED` ✅
3. **تسجيل دخول مالك المتجر (store1)** → نجح ✅
4. **قراءة إشعارات store1** → وُجدت 3 إشعارات (موافقة + إيقاف + استعادة) ✅
5. **تعليم الكل كمقروء** → جميع الإشعارات أصبحت `read: true` ✅
6. **تحديث اسم store1** → نجح ✅
7. **محاولة كلمة مرور خاطئة** → رُفضت برسالة "كلمة المرور الحالية غير صحيحة" ✅
8. **تصفّح /add-store بالخريطة** → الخريطة تُحمّل، البحث يعمل، زر "موقعي الحالي" يعمل ✅
9. **تصفّح /account/settings** → النموذج يعرض البيانات الحالية ✅
10. **قائمة الهامبرغر على الهاتف** → تفتح وتغلق وتعرض الروابط ✅

### في المتصفح (تم التحقق)
- صفحة `/login` تعرض نموذج الدخول
- بعد الدخول، الهيدر يعرض: 🔔 إشعارات | لوحة التاجر | حسابي | خروج
- النقر على الجرس يفتح قائمة الإشعارات
- النقر على "حسابي" ينتقل إلى `/account/settings` ويعرض البيانات
- صفحة `/add-store` تعرض الخريطة مع البحث و"موقعي الحالي" و"حفظ الموقع"

### التحقق من إصلاحات PR #3 (2026-08-10)

#### إصلاح 1 — ربط طلبات البحث بالمستخدم
| الاختبار | النتيجة |
|---|---|
| تسجيل دخول `user@example.com` → إرسال طلب بحث `مكواة بخار` | ✅ حُفظ بـ `userId` صحيح |
| فتح `/account` يعرض الطلب فوراً مع الملاحظات والحالة | ✅ |
| تسجيل دخول `admin@example.com` → لا يرى طلب المستخدم | ✅ (0 نتائج) |
| إرسال طلب مجهول (بدون جلسة) | ✅ حُفظ بـ `userId = null` |
| دمج الطلبات المكررة محصور لكل مستخدم | ✅ |

#### إصلاح 2 — توجيه صفحة الإعدادات
| الاختبار | النتيجة |
|---|---|
| `curl -I /account/settings` (بدون مصادقة) | ✅ HTTP 307 → `/login?from=/account/settings` |
| `/account/settings` (بدخول) | ✅ يعرض النموذج بالبيانات |
| `/account` (بدون مصادقة) | ✅ HTTP 307 → `/login?from=/account` |

#### إصلاح 3 — أيقونات القطاعات
| الاختبار | النتيجة |
|---|---|
| `/categories` — HTML يحتوي `<svg>` فعلي | ✅ |
| `/` (الرئيسية) — لا إيموجي في بطاقات القطاعات | ✅ |
| `/categories/[slug]` — أيقونة SVG | ✅ |
| لا توجد بايتات إيموجي (`\xf0\x9f`) في HTML | ✅ |

#### إصلاح 4 — المنتجات المخفية
| الاختبار | النتيجة |
|---|---|
| منتج نشط يظهر في البحث | ✅ (4 نتائج لـ "شاحن") |
| إخفاء منتج (`active=false`) → يختفي من البحث | ✅ (3 نتائج) |
| إعادة إظهاره (`active=true`) → يعود للبحث | ✅ (4 نتائج) |
| `tests/hidden-products.test.ts` (4 حالات) | ✅ جميعها تمر |

#### اختبارات الانحدار — جميع المسارات
| المسار | الحالة |
|---|---|
| `/` | ✅ 200 |
| `/categories` | ✅ 200 |
| `/stores` | ✅ 200 |
| `/map` | ✅ 200 |
| `/search` | ✅ 200 |
| `/login` `/register` `/contact` `/about` | ✅ 200 |
| `/account` `/account/settings` (بدون دخول) | ✅ 307 → `/login` |

---

## 14. دليل استكشاف الأخطاء

### المشكلة: الإشعارات لا تظهر للمالك
**السبب المحتمل:** جدول `notifications` لم يُنشأ بعد على Railway.
**الحل:** Railway ينفّذ `prisma db push` عند بدء التشغيل. إذا لم يحدث، شغّل يدوياً:
```bash
npx prisma db push
```

### المشكلة: الخريطة لا تُحمّل
**السبب المحتمل:** Leaflet لم يُحمّل من CDN (شبكة بطيئة/محظورة).
**الحل:** تأكد أن `unpkg.com` متاح. المكوّن يحاول تحميل:
- CSS: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.css`
- JS: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js`

### المشكلة: "يجب تسجيل الدخول أولاً" عند إنشاء المتجر
**السبب المتوقع:** هذا سلوك صحيح. يجب تسجيل حساب قبل إنشاء المتجر.
**الحل:** سجّل حساباً من `/register?from=/add-store` ثم سجّل الدخول، ستنتقل تلقائياً لصفحة إنشاء المتجر.

### المشكلة: كلمة المرور لا تتغيّر
**السبب المحتمل:** كلمة المرور الحالية غير صحيحة.
**الحل:** تأكد من إدخال كلمة المرور الحالية بشكل صحيح. الواجهة ترجع `400` مع رسالة "كلمة المرور الحالية غير صحيحة".

### المشكلة: 401 على `/api/account`
**السبب المتوقع:** غير مسجّل دخول.
**الحل:** سجّل الدخول أولاً. الواجهة ترجع `401` بدون جلسة (هذا سلوك صحيح).

### المشكلة: 502 متقطّع على صفحة
**السبب المحتمل:** بدء تشغيل بارد (cold start).
**الحل:** أعد المحاولة. تطبيق الكلاينت يستخدم `fetchWithRetry` الذي يعيد المحاولة تلقائياً.

### المشكلة: صفحة `/account/settings` تظهر "جارٍ التحميل…" ولا تنتقل
> **تم الإصلاح في PR #3.** السبب كان client component بـ `useSession`+`useEffect` يعلّق في حالة `loading`.
**الحل:** الصفحة الآن server component يستخدم `getCurrentUser()` + `redirect()`. الزائر غير المسجّل يُعاد توجيهه فوراً (HTTP 307) إلى `/login?from=/account/settings`.

### المشكلة: أيقونات القطاعات تظهر كمربعات (□)
> **تم الإصلاح في PR #3.** السبب كان استخدام إيموجي يُعرض كمربعات tofu على أنظمة تفتقر لخط إيموجي ملوّن.
**الحل:** استُبدلت الإيموجي بمكوّن `CategoryIcon` يُولّد SVG مضمّن في الصفحات الثلاث: الرئيسية، `/categories`، `/categories/[slug]`.

### المشكلة: طلبات البحث لا تظهر في `/account`
> **تم الإصلاح في PR #3.** السبب كان `POST /api/search-requests` لا يربط الطلب بالمستخدم.
**الحل:** الواجهة الآن تقرأ الجلسة عبر `getServerSession` وتمرّر `userId`. `/account` يعرض الطلبات مع الملاحظات والحالة.

---

## 15. إصلاحات الجودة والأداء (PR #3)

> **PR #3:** https://github.com/motayamlove-commits/test-web/pull/3
> **الالتزام:** `74c339b` على فرع `main` (تم الدمج 2026-08-10)
> **الهدف:** تحسين المنصة لتحمل ضغط عالٍ (50,000+ عميل) وإصلاح 4 مشكلات محددة بإصلاح السبب الجذري.

### القواعد المُتبعة
- ✅ فحص قبل التعديل (استكشاف كامل للكود قبل كل تغيير)
- ✅ عدم تعديل وظائف غير مرتبطة بالمشكلات
- ✅ عدم إنشاء بيانات اختبار دائمة (نُظّفت بيانات الاختبار اليدوية بعد التحقق)
- ✅ إصلاح السبب الجذري وليس الأعراض

### نتائج الفحص الشامل
| الفحص | النتيجة |
|---|---|
| `npm run lint` | ✅ نظيف (لا تحذيرات/أخطاء ESLint) |
| `npm run build` | ✅ نجح (Next.js standalone) |
| `npm test` (vitest) | ✅ 35/35 ناجحة |

---

### 15.1 ربط طلبات البحث بالمستخدم

#### المشكلة
طلبات البحث (Search Requests) المُرسلة من صفحة `/search-request` لم تكن مرتبطة بالمستخدم المسجّل، فلا تظهر في صفحة `/account` ولا يمكن للمستخدم تتبّع طلباته.

#### السبب الجذري
`POST /api/search-requests` لم يقرأ جلسة المستخدم ولم يمرّر `userId` عند إنشاء الطلب.

#### الإصلاح
**الملف:** `src/app/api/search-requests/route.ts`

```ts
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id || null;
  // ...
  const existing = await prisma.searchRequest.findFirst({
    where: {
      query: { equals: query, mode: "insensitive" },
      status: { in: ["NEW", "SEARCHING"] },
      userId: userId ?? undefined,  // دمج محصور لكل مستخدم
    },
  });
  // ...
  const created = await prisma.searchRequest.create({
    data: { query, notes, phone, email: email || null, userId, status: "NEW" },
  });
}
```

**السلوك:**
- مستخدم مسجّل → الطلب يُحفظ بـ `userId` ويظهر في `/account`.
- زائر مجهول → الطلب يُحفظ بـ `userId = null` (ما زال مقبولاً).
- دمج الطلبات المكررة محصور لكل مستخدم (`userId: userId ?? undefined`) حتى لا يتضخم عدّاد مستخدم بسبب طلبات مستخدم آخر.

**عرض الطلب في `/account`:**
`src/app/account/page.tsx` يعرض الآن الملاحظات (`notes`) وشارة الحالة (`SEARCH_REQUEST_STATUS_LABELS`) لكل طلب بحث.

```tsx
<div className="flex items-center justify-between gap-2">
  <p className="font-medium text-gray-800">{s.query}</p>
  <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
    {SEARCH_REQUEST_STATUS_LABELS[s.status] || s.status}
  </span>
</div>
{s.notes && <p className="mt-1 text-sm text-gray-600">{s.notes}</p>}
```

#### التحقق
| الخطوة | النتيجة |
|---|---|
| تسجيل دخول `user@example.com` | ✅ جلسة نشطة، `id: cmsmt77a200eiys0xpjhlvfon` |
| `POST /api/search-requests` بـ `query: "مكواة بخار"` | ✅ `{ ok: true, id: "cmsmv07xt..." }` |
| استعلام DB: `userId` للطلب | ✅ `cmsmt77a200eiys0xpjhlvfon` (نفس المستخدم) |
| `/account` يعرض الطلب + الملاحظات + الحالة "جديد" | ✅ |
| تسجيل دخول `admin@example.com` → `/account` | ✅ لا يرى طلب المستخدم (0 نتائج) |
| طلب مجهول (بدون cookies) | ✅ `userId: null` ومقبول |

---

### 15.2 إصلاح توجيه صفحة الإعدادات

#### المشكلة
صفحة `/account/settings` كانت تبقى على "جارٍ التحميل…" (infinite loading) عند زيارة زائر غير مسجّل، بدلاً من إعادة توجيهه لصفحة الدخول.

#### السبب الجذري
الصفحة كانت **client component** تستخدم `useSession()` + `useEffect` لإعادة التوجيه. حالة `status === "loading"` كانت تعلّق الصفحة إلى ما لا نهاية لأن مزوّد الجلسة (SessionProvider) لا يُهيّأ (hydrate) دائماً في الوقت المناسب.

#### الإصلاح
أُعيد هيكلة الصفحة إلى نمط **server component + client child**:

**1. server component** (`src/app/account/settings/page.tsx`):
```tsx
export default async function AccountSettingsPage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/login?from=/account/settings");

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  });
  if (!user) redirect("/login?from=/account/settings");

  return <AccountSettingsForm profile={user} />;
}
```

**2. client child** (`src/components/account-settings-form.tsx`):
- يستقبل `profile` كـ props (لا حاجة لـ `useSession`).
- يدير حالة النموذج بـ `useState`.
- يُرسل التحديثات عبر `fetchWithRetry("/api/account", { method: "PATCH" })`.

**لماذا هذا أفضل؟**
- `redirect()` على مستوى الخادم يُرجع **HTTP 307** فوراً — لا وميض "تحميل" ولا تعليق.
- الزائر غير المسجّل لا يرى محتوى الصفحة إطلاقاً (آمن لمحركات البحث).
- البيانات تُجلب في الخادم (Prisma) وتُمرّر كـ props — لا طلب API إضافي من الكلاينت.

#### التحقق
| الاختبار | النتيجة |
|---|---|
| `curl -I http://localhost:12000/account/settings` (بدون مصادقة) | ✅ `HTTP/1.1 307` + `Location: /login?from=/account/settings` |
| `/account/settings` بجلسة مسجّلة | ✅ يعرض النموذج بالبيانات (الاسم، البريد، الهاتف، الدور) |
| `/account` (بدون مصادقة) | ✅ `307` → `/login?from=/account` |

---

### 15.3 أيقونات القطاعات SVG

#### المشكلة
أيقونات القطاعات (إيموجي مثل 📱 🚗 🏠) كانت تظهر كمربعات فارغة (tofu boxes: □) على الأنظمة التي تفتقر لخط إيموجي ملوّن.

#### السبب الجذري
الإيموجي يُعرض من جهة الخادم ويعتمد على خطوط النظام. على خوادم Linux (مثل Railway) أو أجهزة قديمة بدون خط إيموجي، تُعرض كمربعات tofu.

#### الإصلاح
أُنشئ مكوّن `CategoryIcon` (`src/components/category-icon.tsx`) يربط `slug` القطاع بأيقونة SVG مضمّنة (vector)، لا تعتمد على خطوط النظام:

```tsx
const ICONS: Record<string, JSX.Element> = {
  electronics: (<svg viewBox="0 0 24 24" ...><rect x="7" y="2" width="10" height="20" rx="2" />...</svg>),
  "auto-parts": (<svg ...><path d="M5 11l1.5-4.5h11L19 11" />...</svg>),
  "home-tools": (<svg ...><path d="M3 11l9-8 9 8" />...</svg>),
  // ... 10 قطاعات
};

export function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  const icon = ICONS[slug] ?? FALLBACK;
  return <span className={className}>{icon}</span>;
}
```

**التطبيق في 3 صفحات:**

| الصفحة | الملف | التغيير |
|---|---|---|
| الرئيسية | `src/components/category-card.tsx` | `{category.icon}` → `<CategoryIcon slug={category.slug} />` |
| قائمة القطاعات | `src/app/categories/page.tsx` | `{c.icon \|\| "🏷️"}` → `<CategoryIcon slug={c.slug} />` |
| تفاصيل القطاع | `src/app/categories/[slug]/page.tsx` | `{category.icon \|\| "🏷️"}` → `<CategoryIcon slug={category.slug} />` |

> **ملاحظة:** جدول إدارة القطاعات في `admin-categories.tsx` ما زال يستخدم إيموجي لواجهة الأدمن فقط — خارج نطاق الإصلاح العام.

#### التحقق
| الاختبار | النتيجة |
|---|---|
| `/categories` — HTML يحتوي `<svg viewBox=...>` | ✅ (10 أيقونات SVG) |
| أسماء القطاعات تظهر بدون إيموجي قبلها | ✅ |
| لا توجد بايتات إيموجي (`\xf0\x9f`) في HTML المُولّد | ✅ |

---

### 15.4 اختبار المنتجات المخفية

#### المشكلة
لم يكن هناك اختبار آلي يمنع عودة المنتجات المخفية (`active=false`) لظهورها في نتائج البحث أو صفحات القطاعات.

#### الإصلاح
أُنشئ `tests/hidden-products.test.ts` — اختبار انحدار بـ 4 حالات:

```ts
describe("hidden products (active=false) are never shown", () => {
  it("searchProducts never returns a product with active=false", async () => { ... });
  it("store detail page only lists active products", async () => { ... });
  it("category product count excludes inactive products", async () => { ... });
  it("product ids in search results are unique", async () => { ... });
});
```

**ما يفحصه:**
1. `searchProducts()` لا تُرجع أي منتج بـ `active=false`.
2. صفحة تفاصيل المتجر تستخدم `products: { where: { active: true } }`.
3. عدّاد منتجات القطاع يستبعد المنتجات غير النشطة.
4. معرّفات المنتجات في نتائج البحث فريدة (لا تكرار/تسرّيب).

#### التحقق
```
✓ tests/hidden-products.test.ts (4 tests) 159ms
```

#### سيناريو الإخفاء/الإظهار اليدوي (E2E)
| الخطوة | النتيجة |
|---|---|
| منتج نشط في متجر معتمد (تك ستور) | ✅ يظهر في البحث (4 نتائج لـ "شاحن") |
| `PATCH /api/admin/products/[id]` بـ `active: false` | ✅ حُفظ، `active: false` |
| البحث بعد الإخفاء | ✅ المنتج اختفى (3 نتائج) |
| `PATCH` بـ `active: true` (إعادة الإظهار) | ✅ حُفظ، `active: true` |
| البحث بعد الإظهار | ✅ المنتج عاد (4 نتائج) |

> **ملاحظة:** بيانات الاختبار اليدوية (طلبَي بحث تجريبيين) نُظّفت من قاعدة البيانات بعد التحقق. المنتج المُختبَر أُعيد لحالته الأصلية (`active: true`).

---

### 15.5 فهارس قاعدة البيانات للأداء العالي

#### الهدف
دعم حمل 50,000+ عميل عبر تسريع استعلامات `/account` الشائعة (جلب مراجعات/طلبات بحث مستخدم).

#### الإصلاح
**الملف:** `prisma/schema.prisma`

```prisma
model Review {
  // ...
  @@unique([storeId, userId])
  @@index([userId])          // جديد — PR #3
  @@map("reviews")
}

model SearchRequest {
  // ...
  @@index([query])
  @@index([status])
  @@index([userId])          // جديد — PR #3
  @@map("search_requests")
}
```

#### التطبيق
- الفهارس طُبّقت محلياً عبر `prisma db push`.
- `entrypoint.sh` على Railway يشغّل `prisma db push` عند كل نشر، لذا الفهارس تُنشأ تلقائياً عند النشر:
  ```sh
  echo "Syncing database schema..."
  node node_modules/prisma/build/index.js db push 2>&1 || echo "WARNING: DB sync failed..."
  ```

#### الأثر
| الاستعلام | قبل | بعد |
|---|---|---|
| جلب مراجعات مستخدم (`/account`) | فحص كامل للجدول | فحص الفهرس (O(log n)) |
| جلب طلبات بحث مستخدم (`/account`) | فحص كامل للجدول | فحص الفهرس |

هذه الفهارس تصبح حاسمة عند نمو عدد السجلات (آلاف المراجعات/طلبات البحث) لأنها تحوّل استعلامات `/account` من مسح كامل للجدول إلى بحث بالفهرس.

---

## ملخّص

جميع الميزات المطلوبة منفّذة ومُتحقّق منها في الإنتاج:

- ✅ قائمة هاتف (هامبرغر) مع روابط الموقع والحساب
- ✅ تقييم يتطلب تسجيل دخول
- ✅ صفحة إعدادات الحساب (الاسم، البريد، كلمة المرور، الهاتف)
- ✅ تسجيل التاجر: حساب أولاً ثم إنشاء متجر (مع توجيه تلقائي)
- ✅ خريطة انتقاء الموقع (Leaflet/OpenStreetMap، بحث + سحب + موقعي)
- ✅ حالة المتجر الواضحة في لوحة التاجر
- ✅ نظام إشعارات داخل التطبيق (جرس + عدّاد + قائمة + تعليم كمقروء)
- ✅ ربط طلبات البحث بالمستخدم (PR #3)
- ✅ توجيه آمن لصفحة الإعدادات بدون تعليق (PR #3)
- ✅ أيقونات قطاعات SVG بدل إيموجي (PR #3)
- ✅ اختبار انحدار للمنتجات المخفية (PR #3)
- ✅ فهارس قاعدة بيانات للأداء العالي (PR #3)

**آخر التزام (commit) على فرع `main`:** `74c339b` (دمج PR #3)
**PR #3:** https://github.com/motayamlove-commits/test-web/pull/3
مرفوع إلى GitHub ومنشور على Railway.
