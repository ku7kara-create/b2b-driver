# PROJECT_MAP.md — B2B Driver

> آخر تحديث: 2026-07-12 | الإصدار: 0.2.0 | الحالة: قيد التطوير

---

## [TECH_STACK]

| الطبقة | التقنية | الإصدار | الغرض |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.2.10 | هيكل التطبيق + SSR + PWA |
| UI | React + Tailwind CSS | 19.2 / 4.3 | واجهة المستخدم |
| API | tRPC | 11.18.0 | Type-safe API end-to-end |
| ORM | Prisma | 7.8.0 | إدارة قاعدة البيانات |
| DB Adapter | @prisma/adapter-better-sqlite3 | 7.8.0 | محرك SQLite المحلي |
| Auth | NextAuth.js | 4.24.14 | المصادقة + جلسات JWT |
| Real-time | Socket.io | 4.8.3 | البث المباشر للمزايدات |
| Maps | Mapbox GL JS | 3.5.0 | الخرائط + التوجيه |
| Validation | Zod | 4.4.3 | التحقق من صحة المدخلات |
| Icons | Lucide React | 1.24.0 | الأيقونات |
| Forms | React Hook Form | 7.52.0 | إدارة النماذج |
| Env | dotenv | latest | تحميل متغيرات البيئة |
| Language | TypeScript | 7.0.2 | Strict mode |

---

## [SYSTEM_FLOW]

### تدفق العميل (Customer):
```
اختيار الخدمة (خاصة/بورتر/سطحة)
    ↓
إدخال مواقع الانطلاق والوصول (خريطة Mapbox)
    ↓
[بورتر] ← تفاصيل البضائع + صور  |  [سطحة] ← نوع المركبة
    ↓
إرسال الطلب → بث للسائقين القريبين (Socket.io)
    ↓
استقبال العروض آنياً → اختيار الأفضل → تأكيد
    ↓
تتبع السائق مباشر → إتمام الرحلة → تقييم
```

### تدفق السائق (Driver):
```
تسجيل + تسديد اشتراك 150 LYD ← تفعيل الحساب
    ↓
استقبال إشعارات الطلبات القريبة (Socket.io)
    ↓
مراجعة التفاصيل (موقع/بضائع/مركبة) → تقديم عرض سعر
    ↓
قبول العميل للعرض → تنقل إلى نقطة الالتقاط
    ↓
تنفيذ الخدمة → استلام التقييم
```

### تدفق المشرف (Admin):
```
لوحة التحكم → إدارة المستخدمين/السائقين/الاشتراكات/الرحلات
تأكيد المدفوعات اليدوية → تفعيل/تعطيل الحسابات
```

---

## [ARCHITECTURE]

```
┌──────────────────────────────────────────────────────┐
│                  server.js (Custom)                   │
│  ┌────────────────────┐  ┌────────────────────────┐  │
│  │   Next.js 16       │  │   Socket.io Server     │  │
│  │   App Router       │  │   (WebSocket)          │  │
│  │   Port: 3000       │  │   Same Port: 3000      │  │
│  └────────┬───────────┘  └───────────┬────────────┘  │
│           │                          │                │
│  ┌────────┴──────────────────────────┴────────────┐  │
│  │              tRPC API Layer                     │  │
│  │  publicProcedure / protectedProcedure / admin   │  │
│  └────────────────────┬───────────────────────────┘  │
│                       │                              │
│  ┌────────────────────┴───────────────────────────┐  │
│  │         Prisma ORM (better-sqlite3 adapter)     │  │
│  │         8 Models: User, Driver, Vehicle,        │  │
│  │         Subscription, Trip, Bid, Notification,  │  │
│  │         Review                                  │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘

المسارات (App Router):
/                        → الهبوط + اختيار الحساب
/login                   → تسجيل الدخول
/register/customer       → تسجيل عميل
/register/driver         → تسجيل سائق
/customer/dashboard      → لوحة العميل
/customer/request        → طلب خدمة + خريطة
/customer/bids/[id]      → العروض والمزايدات
/customer/trip/[id]      → تتبع الرحلة مباشر
/driver/dashboard        → لوحة السائق (الطلبات القريبة)
/driver/bid/[tripId]     → تقديم عرض سعر
/driver/trip/[id]        → تنفيذ الرحلة
/driver/subscription     → الاشتراك والدفع
/admin/dashboard         → لوحة المشرف
/admin/users             → إدارة المستخدمين
/admin/drivers           → إدارة السائقين
/admin/trips             → سجل الرحلات
/admin/payments          → تأكيد المدفوعات
/api/auth/[...nextauth]  → NextAuth API
/api/register            → تسجيل مستخدم جديد
/api/trips               → إنشاء/استعراض الرحلات
/api/trips/[id]/bids     → عروض الرحلة
/api/trips/[id]/accept   → قبول عرض
/api/trips/[id]/status   → تحديث حالة الرحلة
/api/bids                → تقديم عرض
/api/bids/[id]/reject    → رفض عرض
/api/driver/trips        → طلبات السائق
/api/driver/subscription → حالة الاشتراك
/api/admin/stats         → إحصائيات المشرف
```

---

## [ORPHANS & PENDING]

| # | العنصر المعلق | السبب | الإجراء المطلوب |
|---|---|---|---|
| 1 | مفاتيح Mapbox API | لم توفر بعد | متغيرات البيئة جاهزة (`NEXT_PUBLIC_MAPBOX_TOKEN`) |
| 2 | بوابة الدفع (150 LYD) | تحتاج تكامل مع مزود دفع ليبي | تنفيذ يدوي للتأكيد من المشرف حالياً |
| 3 | PostgreSQL (إنتاج) | حالياً SQLite للتطوير | تغيير سطر واحد في prisma.config.ts + adapter |

---

## [LOG]

| التاريخ | المرحلة | الوصف |
|---|---|---|
| 2026-07-12 | M1+M2 | تهيئة المشروع، تثبيت الحزم، Prisma schema، بذور، خادم يعمل |
| 2026-07-12 | M3 | المصادقة: 4 شاشات، NextAuth + JWT، API تسجيل، حماية المسارات |
| 2026-07-12 | M4 | تطبيق العميل: 4 شاشات + 6 API endpoints |
| 2026-07-12 | M5+M6+M7 | Socket.io فوري، تطبيق السائق، لوحة تحكم المشرف |
