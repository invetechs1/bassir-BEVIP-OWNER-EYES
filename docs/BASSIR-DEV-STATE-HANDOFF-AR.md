# بصير — عيون المالك | ملف تسليم المطوّر: ماذا صار والحالة الحالية

> وثيقة موجّهة لمطوّر النظام: ملخّص ما أُنجز، الوضع الحالي للكود والنشر، المسارات والملفات، وما يتبقّى للإنتاج.
> آخر تحديث: نوفمبر 2026 · الفرع: `claude/bassir-owner-eyes-system-aogee5` → مدموج في `main`.

---

## 1) خلاصة سريعة (ماذا صار)
أُضيفت فوق نظام «بصير — عيون المالك» الأساسي **طبقة تجارية كاملة + واجهة عامة (موقع) ثنائية اللغة + أدوات مبيعات**:
- **طبقة البيع (SaaS):** إنشاء مستأجرين، فوترة لكل مشروع (٢,٠٠٠ ر.س/مشروع/شهر)، فواتير تلقائية، تفعيل/إيقاف آلي، ولوحة تحكّم لمالك المنصّة (عدد العملاء، الدخل MRR، النمو، قمع التحويل).
- **موقع تعريفي كامل** (عربي + إنجليزي) هو الصفحة الرئيسية للدومين.
- **صفحة اشتراك ودفع** (عربي + إنجليزي) بدفع مُحاكى.
- **دخول مالك المنصّة** من الموقع ومن التطبيق (بوّابة مخفيّة).
- **تعريب كامل** لشاشتي خريطة الإنجاز وعارض BIM.
- **أدوات مبيعات:** استراتيجية التسعير، الخطة التسويقية، كتيب المبيعات، وعرض تقديمي (Slides) — في `docs/`.

> كل ما سبق **مدموج في `main`** ويُنشر تلقائيًا.

---

## 2) المسارات (Routes) — الحالة الحالية
الخادم `server/server.js` يوجّه المسارات العامة إلى صفحات ثابتة، وبقيّتها API:

| المسار | المحتوى |
|---|---|
| `/` | الموقع التعريفي (عربي) — `public/site.html` |
| `/en` | الموقع التعريفي (إنجليزي) — `public/site-en.html` |
| `/app` | **التطبيق** (دخول العملاء ومالك المنصّة) — `public/index.html` (SPA) |
| `/landing.html` أو `/subscribe` | صفحة الاشتراك والدفع (عربي) |
| `/landing-en.html` أو `/subscribe-en` | صفحة الاشتراك والدفع (إنجليزي) |
| `/deck` | عرض المبيعات التقديمي — `public/deck.html` |

**ملاحظة مهمة:** الصفحة الرئيسية للدومين `/` أصبحت **الموقع**، والتطبيق انتقل إلى **`/app`**.

### مسارات API (منصّة البيع)
عامة (بلا مصادقة — لصفحات الموقع/الاشتراك):
`GET /api/platform/plans` · `POST /api/platform/visit` · `POST /api/platform/register` · `POST /api/platform/subscribe`

لمالك المنصّة (`platform_admin`/`admin`):
`GET /api/platform/state` · `POST /api/actions/platform-create-tenant` · `platform-pay-invoice` · `platform-set-status` · `platform-run-billing`

---

## 3) الصفحات والملفات الرئيسية
**صفحات عامة (`public/`):** `site.html` (موقع AR)، `site-en.html` (موقع EN)، `landing.html` (اشتراك AR)، `landing-en.html` (اشتراك EN)، `deck.html` (عرض المبيعات)، `index.html` (تطبيق SPA).

**سكربتات الواجهة (`public/js/`):** `app.js` (التطبيق + البوّابة المخفيّة لمالك المنصّة)، `api.js` (طبقة الاتصال + دوال platform)، `views*.js` + `views-platform.js` (لوحة مالك المنصّة)، `bim-viewer.js`، `site.js` + `landing.js` + `deck.js` (سكربتات الصفحات العامة — ثنائية اللغة)، `i18n.js`، `charts.js`، `viewer.js`.

**النواة المشتركة (`shared/`):** `api-core.js` (محرّك الفوترة والإحصاءات؛ ثابت `DEFAULT_PRICE = 2000`)، `seed-data.js` (الباقات، المستأجرون، الفواتير، مستخدم `biz`، عدّاد الزيارات).

**الخادم:** `server/server.js` (Node، SQLite، رفع ملفات، **CSP**، توجيه ثابت + API).

**الديمو الثابت:** `tools/build-demo.js` → `demo/bassir-demo.html` (يعمل بلا خادم).

**أدوات المبيعات (`docs/`):** `BASSIR-PRICING-STRATEGY-AR` (استراتيجية التسعير)، `BASSIR-SALES-PLAYBOOK-AR` (كتيب المبيعات)، `Bassir-Sales-Deck-AR.pdf` (العرض)، `BASSIR-DEV-HANDOFF-AR` و`SAAS-COMMERCIALIZATION` (تفاصيل طبقة البيع). لكلٍّ نسخة MD + PDF غالبًا.

---

## 4) حسابات الدخول
| الحساب | المستخدم/المرور | الدور |
|---|---|---|
| المالك | `owner / owner123` | owner |
| ممثل المالك | `rep / rep123` | owner_rep |
| الاستشاري | `consultant / consult123` | consultant |
| مدير المشروع | `pm / pm123` | project_manager |
| مقاول | `cont-str / cont123` · `cont-arch / cont123` | contractor |
| الأدمن | `admin / admin123` | admin |
| **مالك المنصّة** | `biz / biz123` | **platform_admin** |

**دخول مالك المنصّة:** من الموقع عبر زر «دخول مالك النظام» (الفوتر) → نافذة كلمة مرور → `/app#biz-overview`. أو من صفحة `/app` بالضغط **ثلاث مرّات على شعار العين 👁** لكشف البوّابة.

---

## 5) نموذج البيانات (ملخّص)
**المستأجر (tenant):** `id, companyName, contactName, email, phone, planId, pricePerProject, projectCount, status (active|trial|suspended|pending), createdAt, activatedAt, subscriptionStart, subscriptionEnd, billingCycle, nextInvoiceDate, lastPaymentAt, usersCount, cardLast4`.
**الفاتورة (invoice):** `id, number, tenantId, period, projectCount, pricePerProject, amount, currency, status (paid|unpaid|overdue), issuedAt, dueAt, paidAt, method, cardLast4`.
**مؤشّرات `platformStats`:** عدد المستأجرين/الفعّالين/المشاريع/المستخدمين، MRR/ARR، الإيراد، النمو الشهري، الزيارات، نسبة التحويل، المستحقّات.

---

## 6) ⚠️ ما يتبقّى قبل الإطلاق (مهام المطوّر)
1. **بوابة الدفع الحقيقية (الأهم):** الدفع الآن **مُحاكى** في `chargeCard(card, amount)` بـ`shared/api-core.js`. اربط **Moyasar/Tap**: توكِن البطاقة من صفحة الاشتراك، ونفّذ الدفع من الخادم بمفتاح `.env`، وأضِف **Webhook** تأكيد (idempotent). التفاصيل في `docs/SAAS-COMMERCIALIZATION`.
2. **جدولة الفوترة:** استدعِ `runBilling` يوميًا عبر Cron (حاليًا يدوي بزر في اللوحة).
3. **كلمة مرور مالك المنصّة:** غيّر `biz/biz123`، واجعل بوّابة المالك تطلب كلمة المرور في الإنتاج.
4. **سياسة أمان المحتوى (CSP):** الخادم يمنع السكربت المضمّن (`script-src 'self'`). **أي سكربت جديد يجب أن يكون ملفًا خارجيًا** يُحمّل عبر `src` (كما في `js/site.js` و`js/landing.js` و`js/deck.js`) — لا `<script>…</script>` مضمّن.
5. **(اختياري)** لقطتا «خريطة الإنجاز» و«BIM» في الموقع الإنجليزي أصبحتا إنجليزيتين بالكامل بعد تعريب التطبيق؛ أي نص عربي متبقٍّ هو **بيانات** (أسماء بنود/مشاريع) لا تُترجم.

---

## 7) التشغيل والنشر
```bash
npm install
npm start        # http://localhost:3000  (الموقع على / والتطبيق على /app)
```
- **النشر:** من فرع `main` (الاستضافة تعيد النشر تلقائيًا بعد الدمج).
- **بناء الديمو الثابت:** `node tools/build-demo.js`.
- **التحقّق المرجعي المنجز:** زحف 6 أدوار = 81 زيارة صفحة / صفر أخطاء، واختبار كل الصفحات العامة وتدفّق الاشتراك والدفع على الخادم الحقيقي.

---

## 8) ملاحظات تشغيلية مهمة
- **إعادة تسمية المستودع:** تمّت إعادة تسمية المستودع على GitHub إلى **`invetechs1/bassir-BEVIP-OWNER-EYES`** (الاسم القديم `BEVIP-OWNER-EYES` يُعيد التوجيه). استخدم الاسم الجديد في عمليات GitHub.
- **خطأ GitHub المؤقّت:** أثناء آخر دمج ظهرت أخطاء خادم عابرة (500/502) من GitHub بينما الدمج **تمّ فعليًا** (PR #35 ظاهر في سجلّ `main`). إن رأيت تعارضًا مشابهًا مستقبلًا، تحقّق من سجلّ `main` قبل إعادة المحاولة.
- **الفرع:** كل العمل على `claude/bassir-owner-eyes-system-aogee5` ويُدمج إلى `main` عبر Pull Requests.

> للتفاصيل التجارية والتسعير وكتيب المبيعات، راجع ملفات `docs/` المذكورة في القسم (3).
