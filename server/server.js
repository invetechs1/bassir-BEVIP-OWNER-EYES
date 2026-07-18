/**
 * بصير - عيون المالك | خادم النظام (بدون أي اعتماديات خارجية)
 * التشغيل:  node server/server.js   ثم افتح  http://localhost:3000
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const seedModule = require('../shared/seed-data.js');
const coreModule = require('../shared/api-core.js');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// ============ قاعدة البيانات (ملف JSON) ============
const SEED_VERSION = seedModule.buildSeed().meta.version;

function loadDb() {
  if (process.argv.indexOf('--reset') === -1 && fs.existsSync(DB_FILE)) {
    try {
      const saved = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      if (saved.meta && saved.meta.version === SEED_VERSION) return saved;
      console.log('نسخة البيانات قديمة — سيعاد التهيئة بالبيانات المحدثة');
    }
    catch (e) { console.error('تعذر قراءة قاعدة البيانات، سيعاد التهيئة:', e.message); }
  }
  return seedModule.buildSeed();
}

const db = loadDb();
let saveTimer = null;
function persist() {
  if (saveTimer) return;
  saveTimer = setTimeout(function () {
    saveTimer = null;
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 1));
  }, 150);
}

// ============ تشفير كلمات المرور (scrypt المدمجة) ============
function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex');
  return { passwordHash: crypto.scryptSync(String(plain), salt, 64).toString('hex'), salt: salt };
}

function verifyPassword(plain, user) {
  if (user.passwordHash && user.salt) {
    const h = crypto.scryptSync(String(plain), user.salt, 64);
    const stored = Buffer.from(user.passwordHash, 'hex');
    return h.length === stored.length && crypto.timingSafeEqual(h, stored);
  }
  return false;
}

// ترحيل: أي كلمة مرور نصية قديمة تُشفَّر فور الإقلاع وتُحذف من التخزين
let migrated = 0;
db.users.forEach(function (u) {
  if (u.password) {
    Object.assign(u, hashPassword(u.password));
    delete u.password;
    migrated++;
  }
});
if (migrated) console.log('🔐 شُفِّرت كلمات مرور ' + migrated + ' مستخدم (scrypt)');
persist();

const core = coreModule.createCore(db, persist, {
  password: { hash: hashPassword, verify: verifyPassword }
});

// ============ توكنات موقعة (JWT HS256) تبقى صالحة بعد إعادة التشغيل ============
const SECRET_FILE = path.join(DATA_DIR, '.jwt-secret');
function loadSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  try { return fs.readFileSync(SECRET_FILE, 'utf8').trim(); } catch (e) { /* أول تشغيل */ }
  const s = crypto.randomBytes(48).toString('hex');
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(SECRET_FILE, s, { mode: 0o600 });
  return s;
}
const JWT_SECRET = loadSecret();
const TOKEN_TTL = 12 * 3600 * 1000; // 12 ساعة

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function signToken(user) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({ uid: user.id, exp: Date.now() + TOKEN_TTL }));
  const sig = b64url(crypto.createHmac('sha256', JWT_SECRET).update(header + '.' + payload).digest());
  return header + '.' + payload + '.' + sig;
}

function verifyToken(token) {
  const parts = (token || '').split('.');
  if (parts.length !== 3) return null;
  const expected = b64url(crypto.createHmac('sha256', JWT_SECRET).update(parts[0] + '.' + parts[1]).digest());
  const a = Buffer.from(parts[2]), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let payload;
  try { payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()); }
  catch (e) { return null; }
  if (!payload.exp || payload.exp < Date.now()) return null;
  const u = db.users.find(function (x) { return x.id === payload.uid; });
  if (!u) return null;
  return { id: u.id, username: u.username, name: u.name, role: u.role, contractorId: u.contractorId || null };
}

function authUser(req) {
  const h = req.headers['authorization'] || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? verifyToken(m[1]) : null;
}

// ============ حد محاولات الدخول (10 محاولات / 10 دقائق لكل عنوان) ============
const loginAttempts = new Map();
function loginLimited(ip) {
  const now = Date.now();
  const rec = loginAttempts.get(ip);
  if (!rec || now > rec.resetAt) { loginAttempts.set(ip, { count: 1, resetAt: now + 600000 }); return false; }
  rec.count++;
  return rec.count > 10;
}

// ============ أدوات HTTP ============
function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body);
}

function readBody(req) {
  return new Promise(function (resolve, reject) {
    let data = '';
    req.on('data', function (c) { data += c; if (data.length > 5e6) req.destroy(); });
    req.on('end', function () {
      try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(new Error('JSON غير صالح')); }
    });
    req.on('error', reject);
  });
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon'
};

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const base = urlPath.startsWith('/shared/') ? ROOT : path.join(ROOT, 'public');
  const rel = urlPath.startsWith('/shared/') ? urlPath : urlPath;
  const file = path.normalize(path.join(base, rel));
  if (!file.startsWith(path.join(ROOT))) { json(res, 403, { error: 'forbidden' }); return; }
  fs.readFile(file, function (e, buf) {
    if (e) { json(res, 404, { error: 'not found: ' + urlPath }); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  });
}

// ============ الموجّه ============
const server = http.createServer(async function (req, res) {
  try {
    const u = req.url.split('?')[0];

    if (!u.startsWith('/api/')) return serveStatic(req, res);

    // تسجيل الدخول
    if (u === '/api/login' && req.method === 'POST') {
      const ip = req.socket.remoteAddress || '?';
      if (loginLimited(ip)) return json(res, 429, { error: 'محاولات كثيرة — أعد المحاولة بعد 10 دقائق' });
      const body = await readBody(req);
      const user = core.login(body.username, body.password);
      loginAttempts.delete(ip);
      return json(res, 200, { token: signToken(user), user: user });
    }

    const user = authUser(req);
    if (!user) return json(res, 401, { error: 'يلزم تسجيل الدخول' });

    if (u === '/api/logout' && req.method === 'POST') {
      // التوكنات موقعة بلا حالة على الخادم — الخروج بحذف التوكن لدى العميل
      return json(res, 200, { ok: true });
    }

    if (u === '/api/me') return json(res, 200, { user: user });

    if (u === '/api/state') return json(res, 200, core.getState(user));

    if (u === '/api/summary/contractors') {
      const cid = user.role === 'contractor' ? user.contractorId : null;
      const list = db.contractors
        .filter(function (c) { return !cid || c.id === cid; })
        .map(core.contractorSummary);
      return json(res, 200, list);
    }

    // CRUD عام على المجموعات
    let m = u.match(/^\/api\/collections\/(\w+)$/);
    if (m && req.method === 'POST') {
      const body = await readBody(req);
      return json(res, 201, core.createItem(user, m[1], body));
    }
    m = u.match(/^\/api\/collections\/(\w+)\/([\w-]+)$/);
    if (m && req.method === 'PUT') {
      const body = await readBody(req);
      return json(res, 200, core.updateItem(user, m[1], m[2], body));
    }
    if (m && req.method === 'DELETE') {
      return json(res, 200, core.deleteItem(user, m[1], m[2]));
    }

    // إجراءات الأعمال
    if (u === '/api/actions/review' && req.method === 'POST') {
      return json(res, 200, core.review(user, await readBody(req)));
    }
    if (u === '/api/actions/add-contractor' && req.method === 'POST') {
      return json(res, 201, core.addContractor(user, await readBody(req)));
    }
    if (u === '/api/actions/add-project' && req.method === 'POST') {
      return json(res, 201, core.addProject(user, await readBody(req)));
    }
    if (u === '/api/actions/send-report' && req.method === 'POST') {
      return json(res, 200, core.sendReport(user, await readBody(req)));
    }

    json(res, 404, { error: 'مسار غير معروف: ' + u });
  } catch (e) {
    json(res, e.status || 500, { error: e.message });
  }
});

server.listen(PORT, function () {
  console.log('');
  console.log('  👁  بصير - عيون المالك | Bassir Owner Eyes');
  console.log('  ─────────────────────────────────────────');
  console.log('  الخادم يعمل على:  http://localhost:' + PORT);
  console.log('');
  console.log('  حسابات الديمو:');
  console.log('    admin / admin123        (مدير النظام)');
  console.log('    owner / owner123        (المالك)');
  console.log('    rep / rep123            (ممثل المالك)');
  console.log('    consultant / consult123 (الاستشاري)');
  console.log('    cont-str / cont123      (مقاول إنشائي)');
  console.log('');
});
