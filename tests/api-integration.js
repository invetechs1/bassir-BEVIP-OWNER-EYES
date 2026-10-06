/* اختبار تكامل الواجهة البرمجية: يشغّل الخادم الحقيقي على قاعدة بيانات SQLite مؤقتة
   ويتحقق من الصلاحيات، والتحقق من الإحداثيات، والترقية غير المدمِّرة لبيانات قديمة. */
const path = require('path');
const fs = require('fs');
const os = require('os');
const http = require('http');
const { spawn, spawnSync } = require('child_process');

const PORT = 3197;
const BASE = 'http://127.0.0.1:' + PORT;
const DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'bassir-api-'));
process.env.DATA_DIR = DATA_DIR;
const seedModule = require('../shared/seed-data.js');

const results = [];
function check(name, cond, note) {
  results.push([name, !!cond]);
  console.log((cond ? 'PASS' : 'FAIL') + ' — ' + name + (note ? '  (' + note + ')' : ''));
}

function request(method, p, token, body) {
  return new Promise(function (resolve) {
    const data = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = 'Bearer ' + token;
    const r = http.request(BASE + p, { method: method, headers: headers }, function (res) {
      let buf = '';
      res.on('data', function (c) { buf += c; });
      res.on('end', function () {
        let parsed = {};
        try { parsed = JSON.parse(buf); } catch (e) { /* ليس JSON */ }
        resolve({ status: res.statusCode, body: parsed, headers: res.headers });
      });
    });
    r.on('error', function (e) { resolve({ status: 0, body: { error: e.message }, headers: {} }); });
    if (data) r.write(data);
    r.end();
  });
}

async function login(u, p) {
  const r = await request('POST', '/api/login', null, { username: u, password: p });
  return r.body.token;
}

function startServer() {
  const child = spawn(process.execPath, [path.join(__dirname, '..', 'server', 'server.js')], {
    env: Object.assign({}, process.env, { PORT: String(PORT), DATA_DIR: DATA_DIR }),
    stdio: ['ignore', 'pipe', 'pipe']
  });
  child.stderr.on('data', function () {});
  return new Promise(function (resolve, reject) {
    const deadline = Date.now() + 15000;
    (function poll() {
      request('GET', '/healthz').then(function (r) {
        if (r.status === 200) return resolve(child);
        if (Date.now() > deadline) { child.kill(); return reject(new Error('server did not start')); }
        setTimeout(poll, 250);
      });
    })();
  });
}

function stopServer(child) {
  return new Promise(function (resolve) {
    setTimeout(function () { child.on('exit', resolve); child.kill(); }, 400);
  });
}

(async function main() {
  // 1) قاعدة بيانات قديمة (نسخة 20) فيها مشروع بلا إحداثيات وسجل مستخدم حقيقي — يجب أن تُرقّى دون فقد أي سجل
  const legacy = seedModule.buildSeed();
  legacy.meta.version = 20;
  legacy.projects.find(function (p) { return p.id === 'P1'; }).lat = null;
  legacy.projects.find(function (p) { return p.id === 'P1'; }).lng = null;
  legacy.shopDrawings.push({ id: 'SH-LEGACY', projectId: 'P1', contractorId: 'C1', title: 'سجل قديم يجب أن يبقى', status: 'pending', date: '2026-01-01' });
  legacy.projects.push({ id: 'P-LEGACY', name: 'مشروع قديم بدون إحداثيات', location: 'عمّان', lat: null, lng: null, status: 'active', floors: [], disciplines: [] });
  delete legacy.bimMappings;
  const legacyFile = path.join(DATA_DIR, 'legacy.json');
  fs.writeFileSync(legacyFile, JSON.stringify(legacy));
  const writer = spawnSync(process.execPath, ['-e',
    "const fs=require('fs');const s=require(process.env.STORAGE_PATH).createStorage();s.persist(JSON.parse(fs.readFileSync(process.env.LEGACY_FILE,'utf8')));"],
    { env: Object.assign({}, process.env, { STORAGE_PATH: path.join(__dirname, '..', 'server', 'storage.js'), LEGACY_FILE: legacyFile }) });
  if (writer.status !== 0) throw new Error('could not write legacy database: ' + writer.stderr);

  const child = await startServer();
  const token = await login('admin', 'admin123');
  const st = await request('GET', '/api/state', token);
  const p1 = st.body.projects.find(function (p) { return p.id === 'P1'; });
  const health = await request('GET', '/healthz', null);
  check('migration keeps existing records (legacy shop drawing still present)', st.body.shopDrawings.some(function (x) { return x.id === 'SH-LEGACY'; }));
  check('migration backfills missing project coordinates from seed', p1 && p1.lat === 24.80 && p1.lng === 46.62, p1 && (p1.lat + ',' + p1.lng));
  check('migration adds collections missing from the older database', Array.isArray(st.body.bimMappings));
  check('migration does not invent coordinates for unknown projects', st.body.projects.some(function (p) { return p.id === 'P-LEGACY' && p.lat === null; }));
  check('database version advanced to current seed version', health.body.version === seedModule.buildSeed().meta.version, 'healthz version=' + health.body.version);

  // 2) أمان الترويسات
  const home = await request('GET', '/', null);
  check('security header: Content-Security-Policy present', !!home.headers['content-security-policy']);
  check('security header: X-Content-Type-Options nosniff', home.headers['x-content-type-options'] === 'nosniff');
  check('security header: X-Frame-Options SAMEORIGIN', home.headers['x-frame-options'] === 'SAMEORIGIN');

  // 3) إضافة المشروع: الإحداثيات مطلوبة وداخل المملكة، والاسم مطلوب
  const rep = await login('rep', 'rep123');
  const base = { name: 'QA مشروع اختبار', startPlanned: '2026-01-01', endPlanned: '2027-01-01', budgetPlanned: 1000 };
  let r = await request('POST', '/api/actions/add-project', rep, base);
  check('add project without coordinates is rejected (400)', r.status === 400, r.status + ' ' + (r.body.error || ''));
  r = await request('POST', '/api/actions/add-project', rep, Object.assign({}, base, { lat: 51.5, lng: -0.12 }));
  check('add project outside Saudi Arabia is rejected (400)', r.status === 400);
  r = await request('POST', '/api/actions/add-project', rep, Object.assign({}, base, { name: '   ', lat: 24.7, lng: 46.7 }));
  check('add project with blank name is rejected (400)', r.status === 400);
  r = await request('POST', '/api/actions/add-project', rep, Object.assign({}, base, { lat: '24.7', lng: '46.7' }));
  check('add project with valid string coordinates is accepted (201)', r.status === 201, r.status);
  const newId = r.body.project ? r.body.project.id : (r.body.id || null);
  check('accepted project stores coordinates as numbers', r.body && (r.body.lat === 24.7 || (r.body.project && r.body.project.lat === 24.7)));
  r = await request('POST', '/api/actions/add-project', await login('consultant', 'consult123'), Object.assign({}, base, { lat: 24.7, lng: 46.7 }));
  check('consultant cannot add a project (403)', r.status === 403);

  // 4) تحديث الإحداثيات عبر الواجهة العامة
  r = await request('PUT', '/api/collections/projects/P1', token, { lat: 99, lng: 46 });
  check('project update with latitude out of range is rejected (400)', r.status === 400);
  r = await request('PUT', '/api/collections/projects/P1', token, { lat: '26.36', lng: '43.97' });
  check('project update with valid string coordinates is accepted', r.status === 200);
  const after = await request('GET', '/api/state', token);
  const p1b = after.body.projects.find(function (p) { return p.id === 'P1'; });
  check('stored project coordinates are numeric after update', typeof p1b.lat === 'number' && p1b.lat === 26.36);

  // 5) الصلاحيات (حذف وتعديل)
  const owner = await login('owner', 'owner123');
  const cont = await login('cont-arch', 'cont123');
  const sd = await request('POST', '/api/collections/shopDrawings', token, { title: 'QA perm', contractorId: 'C1', projectId: 'P1' });
  const sdId = sd.body.id;
  r = await request('DELETE', '/api/collections/shopDrawings/' + sdId, cont);
  check('contractor cannot delete a submittal (403)', r.status === 403);
  r = await request('PUT', '/api/collections/shopDrawings/' + sdId, cont, { title: 'x' });
  check('contractor cannot edit another contractor\'s submittal (403)', r.status === 403);
  r = await request('DELETE', '/api/collections/shopDrawings/' + sdId, owner);
  check('owner can delete a submittal (broad-delete role)', r.status === 200, r.status);

  const co = await request('POST', '/api/collections/changeOrders', token, { title: 'QA CO', contractorId: 'C1', amount: 100, days: 1, projectId: 'P1' });
  await request('POST', '/api/actions/review', token, { collection: 'changeOrders', id: co.body.id, status: 'approved', notes: 'ok' });
  r = await request('PUT', '/api/collections/changeOrders/' + co.body.id, owner, { amount: 999999 });
  check('owner cannot change amount on an approved change order (403)', r.status === 403);
  r = await request('PUT', '/api/collections/changeOrders/' + co.body.id, owner, { notes: 'تعليق لاحق' });
  check('owner can still change non-financial fields on an approved item', r.status === 200);

  await stopServer(child);

  // 6) الإقلاع الثاني: البيانات المرقّاة تبقى كما هي دون إعادة بذر
  const child2 = await startServer();
  const token2 = await login('admin', 'admin123');
  const st2 = await request('GET', '/api/state', token2);
  check('restart keeps data written before (no reseed)', st2.body.changeOrders.some(function (x) { return x.title === 'QA CO'; }));
  await stopServer(child2);

  console.log('\n=== SUMMARY ===');
  const failed = results.filter(function (x) { return !x[1]; });
  console.log(results.length + ' checks, ' + failed.length + ' failed');
  failed.forEach(function (f) { console.log('  FAILED: ' + f[0]); });
  try { fs.rmSync(DATA_DIR, { recursive: true, force: true }); } catch (e) { console.log('note: temp data dir not removed (' + DATA_DIR + ')'); }
  process.exit(failed.length ? 1 : 0);
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
