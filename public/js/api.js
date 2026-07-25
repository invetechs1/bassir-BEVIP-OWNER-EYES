/**
 * بصير | طبقة الاتصال Api
 * وضعان:
 *  - الوضع المتصل: يتخاطب مع خادم Node عبر fetch
 *  - وضع الديمو (window.DEMO_MODE): يشغّل نفس نواة المنطق داخل المتصفح بلا خادم
 */
(function () {
  'use strict';

  const DEMO = !!window.DEMO_MODE;

  // ============ وضع الديمو: نواة داخل المتصفح ============
  let demoCore = null, demoUser = null;

  function demoInit() {
    if (demoCore) return;
    let db = null;
    try {
      const saved = localStorage.getItem('bassir-demo-db');
      if (saved) db = JSON.parse(saved);
    } catch (e) { /* تجاهل */ }
    const fresh = window.BassirSeed.buildSeed();
    if (!db || !db.meta || db.meta.version !== fresh.meta.version) db = fresh;
    demoCore = window.BassirCore.createCore(db, function persist() {
      try { localStorage.setItem('bassir-demo-db', JSON.stringify(db)); } catch (e) { /* تجاهل */ }
    });
    try {
      const su = sessionStorage.getItem('bassir-demo-user');
      if (su) demoUser = JSON.parse(su);
    } catch (e) { /* تجاهل */ }
  }

  function demoCall(path, method, body) {
    demoInit();
    const c = demoCore;
    if (path === '/api/login') {
      const user = c.login(body.username, body.password);
      demoUser = user;
      sessionStorage.setItem('bassir-demo-user', JSON.stringify(user));
      return { token: 'demo', user: user };
    }
    if (!demoUser) { const e = new Error('يلزم تسجيل الدخول'); e.status = 401; throw e; }
    if (path === '/api/logout') { demoUser = null; sessionStorage.removeItem('bassir-demo-user'); return { ok: true }; }
    if (path === '/api/me') return { user: demoUser };
    if (path === '/api/state') return c.getState(demoUser);
    if (path === '/api/summary/contractors') {
      const cid = demoUser.role === 'contractor' ? demoUser.contractorId : null;
      return c.db.contractors.filter(function (x) { return !cid || x.id === cid; }).map(c.contractorSummary);
    }
    let m = path.match(/^\/api\/collections\/(\w+)$/);
    if (m && method === 'POST') return c.createItem(demoUser, m[1], body);
    m = path.match(/^\/api\/collections\/(\w+)\/([\w-]+)$/);
    if (m && method === 'PUT') return c.updateItem(demoUser, m[1], m[2], body);
    if (m && method === 'DELETE') return c.deleteItem(demoUser, m[1], m[2]);
    if (path === '/api/actions/review') return c.review(demoUser, body);
    if (path === '/api/actions/resubmit') return c.resubmit(demoUser, body);
    if (path === '/api/actions/notify-read') return c.markNotificationsRead(demoUser);
    if (path === '/api/actions/profile') return c.updateProfile(demoUser, body);
    if (path === '/api/actions/add-contractor') return c.addContractor(demoUser, body);
    if (path === '/api/actions/add-project') return c.addProject(demoUser, body);
    if (path === '/api/actions/send-report') return c.sendReport(demoUser, body);
    const e = new Error('مسار غير معروف'); e.status = 404; throw e;
  }

  // ============ الواجهة الموحدة ============
  async function call(path, method, body) {
    method = method || 'GET';
    if (DEMO) {
      try { return structuredClone(demoCall(path, method, body)); }
      catch (e) { return Promise.reject(e); }
    }
    const headers = { 'Content-Type': 'application/json' };
    const token = sessionStorage.getItem('bassir-token');
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const res = await fetch(path, {
      method: method, headers: headers,
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(function () { return {}; });
    if (!res.ok) { const e = new Error(data.error || ('خطأ ' + res.status)); e.status = res.status; throw e; }
    return data;
  }

  window.Api = {
    demo: DEMO,
    async login(username, password) {
      const r = await call('/api/login', 'POST', { username: username, password: password });
      if (!DEMO) sessionStorage.setItem('bassir-token', r.token);
      sessionStorage.setItem('bassir-user', JSON.stringify(r.user));
      return r.user;
    },
    async logout() {
      try { await call('/api/logout', 'POST', {}); } catch (e) { /* تجاهل */ }
      sessionStorage.removeItem('bassir-token');
      sessionStorage.removeItem('bassir-user');
    },
    currentUser() {
      try { return JSON.parse(sessionStorage.getItem('bassir-user')); } catch (e) { return null; }
    },
    state() { return call('/api/state'); },
    contractorsSummary() { return call('/api/summary/contractors'); },
    create(collection, data) { return call('/api/collections/' + collection, 'POST', data); },
    update(collection, id, patch) { return call('/api/collections/' + collection + '/' + id, 'PUT', patch); },
    remove(collection, id) { return call('/api/collections/' + collection + '/' + id, 'DELETE'); },
    review(opts) { return call('/api/actions/review', 'POST', opts); },
    addContractor(p) { return call('/api/actions/add-contractor', 'POST', p); },
    addProject(p) { return call('/api/actions/add-project', 'POST', p); },
    sendReport(p) { return call('/api/actions/send-report', 'POST', p); },
    /** رفع ملف فعلي — opts: { category, versionOf } — في الديمو محاكاة بالاسم */
    async upload(file, opts) {
      opts = opts || {};
      if (DEMO) return { name: file.name, url: '', demo: true, category: opts.category || 'أخرى' };
      const token = sessionStorage.getItem('bassir-token');
      const headers = {
        'Authorization': 'Bearer ' + token,
        'Content-Type': file.type || 'application/octet-stream',
        'x-filename': encodeURIComponent(file.name)
      };
      if (opts.category) headers['x-category'] = encodeURIComponent(opts.category);
      if (opts.versionOf) headers['x-version-of'] = opts.versionOf;
      const res = await fetch('/api/upload', { method: 'POST', headers: headers, body: file });
      const data = await res.json().catch(function () { return {}; });
      if (!res.ok) { const e = new Error(data.error || 'فشل رفع الملف'); throw e; }
      return data;
    },
    resubmit(p) { return call('/api/actions/resubmit', 'POST', p); },
    notifyRead() { return call('/api/actions/notify-read', 'POST', {}); },
    updateProfile(p) { return call('/api/actions/profile', 'POST', p); },
    backup() {
      if (DEMO) return Promise.reject(new Error('النسخ الاحتياطي متاح في نسخة الخادم'));
      return call('/api/actions/backup', 'POST', {});
    },
    backups() {
      if (DEMO) return Promise.resolve([]);
      return call('/api/backups');
    },
    integrationsStatus() {
      if (DEMO) return Promise.resolve({ demo: true });
      return call('/api/integrations/status');
    },
    analyzePhoto(p) {
      if (DEMO) { const e = new Error('التحليل الحقيقي متاح في نسخة الخادم بعد إضافة ANTHROPIC_API_KEY'); e.status = 503; return Promise.reject(e); }
      return call('/api/actions/analyze-photo', 'POST', p);
    },
    resetDemo() {
      if (DEMO) { localStorage.removeItem('bassir-demo-db'); demoCore = null; }
    }
  };
})();
