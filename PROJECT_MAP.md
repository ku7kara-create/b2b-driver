# PROJECT_MAP.md — B2B Driver

> آخر تحديث: 2026-07-22 | الإصدار: 0.3.0 | الحالة: قيد التطوير

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
| 4 | FCM Push Notifications | تمت إضافة البنية التحتية (PushToken model، Firebase Admin SDK، API تسجيل التوكن، service worker، هوك المتصفح) | ضبط متغيرات البيئة في `.env.local` بمفاتيح Firebase، تفعيل في Firebase Console |

## [TESTS]

| # | الملف | التغطية |
|---|---|---|
| 1 | `tests/integration/real-time-acceptance.test.ts` | اختبار القبول الفوري (24 اختبار) — 2 سائق + عميل، Socket.io WebSocket، API قبول، التحقق من حالة DB، الشات الفوري عبر Socket + إشعارات DB + تسجيل FCM Push Token + إصلاح Bug إرسال السائق للرسائل |
| 2 | `tests/integration/city-isolation.test.ts` | اختبار عزل المدن (34 اختبار) — فلترة طلبات السائق، إنشاء العروض عبر المدن، API الرسائل، مدفوعات المشرف، endpoints الإدارة، Socket.io، إحصائيات dashboard، الإزالة الفورية للسائق غير المزايد + مهلة السائق المزايد |

## [FIXED VULNERABILITIES]

| # | الثغرة | الملفات المتأثرة | الإصلاح |
|---|---|---|---|
| 1 | **حرج** — أي مستخدم مصدق يمكنه قراءة/إرسال رسائل لأي رحلة | `api/messages/route.ts` | إضافة التحقق `trip.customerId !== uid && trip.driverId !== uid` |
| 2 | **حرج** — المشرف يمكنه رؤية مدفوعات جميع المدن | `api/admin/payments/route.ts` | إضافة `where: { driver: { user: { city: adminCity } } }` |
| 3 | **متوسط** — المشرف يمكنه تعديل/حذف مستخدمين من مدن أخرى | 6 endpoints إدارية | إضافة التحقق `target.city !== admin.assignedCity` |
| 4 | **متوسط** — بث Socket.io عبر المدن | `server/socket.ts` | تغيير الغرفة `drivers:available` → `drivers:available:{city}` |
| 5 | **متوسط** — `getIO()` يرجع null في API routes | `server/socket.ts` | استخدام `globalThis` لمشاركة مثيل Socket.io |

---

## [LOG]

| التاريخ | المرحلة | الوصف |
|---|---|---|
| 2026-07-12 | M1+M2 | تهيئة المشروع، تثبيت الحزم، Prisma schema، بذور، خادم يعمل |
| 2026-07-12 | M3 | المصادقة: 4 شاشات، NextAuth + JWT، API تسجيل، حماية المسارات |
| 2026-07-12 | M4 | تطبيق العميل: 4 شاشات + 6 API endpoints |
| 2026-07-12 | M5+M6+M7 | Socket.io فوري، تطبيق السائق، لوحة تحكم المشرف |
| 2026-07-12 | Harden | تحسينات إنتاجية: Toast، Socket.io حي، حماية الاشتراك، نماذج ديناميكية |
| 2026-07-12 | M8+M9 | تقييمات، سجل رحلات، إشعارات، تتبع مباشر، اختبار نهائي |
| 2026-07-22 | Test + Harden | اختبار تكاملي للقبول الفوري + Socket.io emit عند القبول + استقصاء غير مشروط في صفحة عرض السائق |
| 2026-07-22 | City Isolation Audit | مراجعة كاملة لعزل المدن عبر 32 ملف API + 5 صفحات مشرف + Socket.io. إصلاح 9 ثغرات (2 حرجة، 7 متوسطة). إضافة اختبار عزل المدن (30 اختبار) |
| 2026-07-22 | Feed Visibility Rule | تحديث `/api/driver/trips` — تغيير شرط مهلة الـ5 دقائق من `status: "rejected"` إلى `driverId: driver.id` (أي سائق له عرض). إضافة مستمع Socket `bid:accepted_external` في لوحة السائق للإزالة الفورية. إضافة اختبار TEST 8 (4 تأكيدات) |
| 2026-07-22 | Real-time Chat + Notifications | إرسال Socket `chat:message` عبر `getIO().to(trip:{tripId})` بعد إنشاء رسالة في `api/messages/route.ts`. إضافة مستمع `chat:message` + دخول غرفة `trip:join` في صفحتي الشات (سائق/عميل). إنشاء إشعار `Notification` في DB للمستلم. إضافة اختبار Step 6.5 (5 تأكيدات) — socket event + DB + notification |
| 2026-07-22 | Phone Dialer Audit | التحقق من أزرار الاتصال: `customer/trip/[id]/page.tsx` و `driver/trip/[id]/page.tsx` — كلاهما يستخدم `tel:` URL scheme بالفعل (لا تغيير مطلوب) |
| 2026-07-22 | Chat Bug Fix | إصلاح `api/messages/route.ts` — مقارنة `trip.driver?.userId` بدلاً من `trip.driverId` لأن `driverId` هو ID سائق (Driver model) وليس ID مستخدم (User model). كان يسبب 403 عند محاولة السائق إرسال/قراءة الرسائل. إضافة تحديث Optimistic في `send()` بعد نجاح API. إضافة اختبار Step 6.6 (تأكيدين) |
| 2026-07-22 | FCM Push Notifications Infrastructure | إضافة `PushToken` model في Prisma، `firebase-admin` init في `src/lib/firebase-admin.ts`، helper `sendChatNotification()` في `src/lib/fcm.ts`، API تسجيل التوكن `POST/DELETE api/notifications/token`، تحديث `api/messages/route.ts` لإرسال FCM push بعد كل رسالة، service worker `public/firebase-messaging-sw.js`، هوك `useFcm` لتسجيل التوكن من المتصفح. إضافة اختبار Step 6.6 (تأكيدين). تحديث `.env.example` بمتغيرات FCM |
