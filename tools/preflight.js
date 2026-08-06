/**
 * بصير | فحص جاهزية النشر (Preflight)
 * يتحقق من متطلبات التشغيل الإنتاجي ويطبع تقرير جاهزية.
 * التشغيل:  node tools/preflight.js
 * يخرج برمز 1 إذا وُجد خلل حرج يمنع التشغيل.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const RESET = '\x1b[0m', GREEN = '\x1b[32m', YELLOW = '\x1b[33m', RED = '\x1b[31m', BOLD = '\x1b[1m', DIM = '\x1b[2m';

let criticalFail = 0, warnCount = 0;
const line = function (icon, label, detail, color) {
  console.log('  ' + (color || '') + icon + RESET + ' ' + label + (detail ? DIM + ' — ' + detail + RESET : ''));
};
const good = function (l, d) { line(GREEN + '✓', l, d); };
const warn = function (l, d) { warnCount++; line(YELLOW + '◽', l, d, YELLOW); };
const fail = function (l, d) { criticalFail++; line(RED + '✗', l, d, RED); };

// ============ تحميل .env (بلا اعتماديات) ============
(function loadEnv() {
  const envFile = path.join(ROOT, '.env');
  if (!fs.existsSync(envFile)) return;
  fs.readFileSync(envFile, 'utf8').split('\n').forEach(function (l) {
    const mm = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (mm && !(mm[1] in process.env)) process.env[mm[1]] = mm[2].replace(/^["']|["']$/g, '');
  });
})();

console.log('\n' + BOLD + '👁  بصير — فحص جاهزية النشر الحي' + RESET);
console.log(DIM + '  ─────────────────────────────────────────' + RESET);

// 1) إصدار Node
console.log('\n' + BOLD + '  بيئة التشغيل' + RESET);
const major = parseInt(process.versions.node.split('.')[0], 10);
if (major >= 22) good('Node.js ' + process.versions.node, 'يدعم node:sqlite المدمج');
else fail('Node.js ' + process.versions.node, 'مطلوب الإصدار 22 أو أحدث (لقاعدة البيانات المدمجة)');

// 2) node:sqlite متاح
try {
  require('node:sqlite');
  good('node:sqlite', 'متاح — قاعدة بيانات SQLite حقيقية');
} catch (e) {
  if ((process.env.STORAGE || 'sqlite') === 'json') warn('node:sqlite غير متاح', 'ستُستخدم قاعدة JSON (STORAGE=json)');
  else fail('node:sqlite غير متاح', 'حدّث Node أو اضبط STORAGE=json');
}

// 3) مجلد البيانات قابل للكتابة
const DATA_DIR = path.join(ROOT, 'data');
try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const probe = path.join(DATA_DIR, '.probe');
  fs.writeFileSync(probe, 'ok'); fs.unlinkSync(probe);
  good('مجلد البيانات data/', 'قابل للكتابة (قاعدة البيانات + الملفات المرفوعة)');
} catch (e) {
  fail('مجلد البيانات data/', 'غير قابل للكتابة: ' + e.message);
}

// 4) البذرة تُبنى بلا أخطاء
console.log('\n' + BOLD + '  التطبيق' + RESET);
let db = null;
try {
  db = require(path.join(ROOT, 'shared', 'seed-data.js')).buildSeed();
  good('بناء البيانات', 'الإصدار ' + (db.meta && db.meta.version) + ' · ' + (db.projects || []).length + ' مشروع');
} catch (e) {
  fail('بناء البيانات', e.message);
}
try {
  require(path.join(ROOT, 'shared', 'api-core.js'));
  require(path.join(ROOT, 'server', 'integrations.js'));
  require(path.join(ROOT, 'server', 'storage.js'));
  good('وحدات النظام', 'النواة، التخزين، التكامل — سليمة');
} catch (e) {
  fail('وحدات النظام', e.message);
}

// 5) واجهة الديمو مبنية
if (fs.existsSync(path.join(ROOT, 'demo', 'bassir-demo.html'))) good('نسخة الديمو', 'demo/bassir-demo.html موجودة');
else warn('نسخة الديمو غير مبنية', 'شغّل: npm run build:demo');

// 6) عارض PDF المضمّن
if (fs.existsSync(path.join(ROOT, 'public', 'vendor', 'pdfjs', 'pdf.min.mjs'))) good('عارض PDF المضمّن', 'public/vendor/pdfjs');
else warn('عارض PDF غير موجود', 'مراجعة مستندات PDF داخل المنصة ستتعطل');

// ============ الأمان والإنتاج ============
console.log('\n' + BOLD + '  الأمان والإنتاج' + RESET);
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 24) good('JWT_SECRET', 'مضبوط للإنتاج');
else if (process.env.JWT_SECRET) warn('JWT_SECRET قصير', 'يُفضّل 32 محرفاً فأكثر');
else warn('JWT_SECRET غير مضبوط', 'سيُولَّد ويُحفَظ في data/.jwt-secret تلقائياً (اضبطه صراحةً للإنتاج متعدد النسخ)');

const port = process.env.PORT || 3000;
good('المنفذ', String(port));

// ============ التكاملات ============
console.log('\n' + BOLD + '  التكاملات (اختيارية — تعمل بالمحاكاة إن لم تُهيَّأ)' + RESET);
let integ = null;
try { integ = require(path.join(ROOT, 'server', 'integrations.js')); } catch (e) { /* أُبلغ أعلاه */ }
if (integ) {
  const st = integ.status();
  st.email.configured ? good('البريد الإلكتروني', st.email.provider) : warn('البريد', 'محاكاة — أضف RESEND_API_KEY أو SENDGRID_API_KEY + EMAIL_FROM');
  st.whatsapp.configured ? good('واتساب', 'WhatsApp Cloud API') : warn('واتساب', 'محاكاة — أضف WHATSAPP_TOKEN + WHATSAPP_PHONE_ID');
  if (st.ai.configured) good('الذكاء الاصطناعي', 'Claude Vision (' + st.ai.model + ')');
  else if (st.ai.keyPresent && !st.ai.sdkInstalled) warn('الذكاء الاصطناعي', 'المفتاح موجود لكن الحزمة غير مثبتة — npm install @anthropic-ai/sdk');
  else warn('الذكاء الاصطناعي', 'محاكاة — أضف ANTHROPIC_API_KEY وثبّت @anthropic-ai/sdk');
  st.cameraIngest.configured ? good('مدخل الكاميرات', 'CAMERA_KEY مضبوط') : warn('مدخل الكاميرات', 'أضف CAMERA_KEY لاستقبال اللقطات');
  st.media && st.media.configured ? good('البث المباشر RTSP', st.media.url) : warn('البث المباشر', 'أضف MEDIA_SERVER_URL (MediaMTX) للبث الحي');
}

// ============ الخلاصة ============
console.log('\n' + DIM + '  ─────────────────────────────────────────' + RESET);
if (criticalFail) {
  console.log('  ' + RED + BOLD + '✗ غير جاهز: ' + criticalFail + ' خلل حرج يجب معالجته قبل التشغيل.' + RESET);
  console.log('  ' + DIM + (warnCount ? warnCount + ' تنبيه غير حرج (تكاملات اختيارية).' : '') + RESET + '\n');
  process.exit(1);
} else {
  console.log('  ' + GREEN + BOLD + '✓ جاهز للتشغيل.' + RESET + '  ' + DIM + warnCount + ' تنبيه غير حرج (تكاملات اختيارية تعمل بالمحاكاة).' + RESET);
  console.log('  ' + DIM + 'التشغيل: npm start   |   Docker: docker compose up -d   |   الصحة: GET /healthz' + RESET + '\n');
  process.exit(0);
}
