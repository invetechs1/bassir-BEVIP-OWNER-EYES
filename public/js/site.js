/* بصير | سكربت الموقع التعريفي: تتبّع الزيارات، حاسبة العائد، طلب عرض، ودخول مالك النظام.
   خارجي (لا مضمّن) لاحترام سياسة أمان المحتوى CSP. */
(function () {
  'use strict';
  var PRICE = 2000;

  // ====== طبقة اتصال: الخادم الحقيقي إن وُجد، وإلا نواة داخل المتصفح ======
  var _core = null;
  function localCore() {
    if (_core) return _core;
    if (!window.BassirSeed || !window.BassirCore) return null;
    var db = null;
    try { var s = localStorage.getItem('bassir-demo-db'); if (s) db = JSON.parse(s); } catch (e) {}
    var fresh = window.BassirSeed.buildSeed();
    if (!db || !db.meta || db.meta.version !== fresh.meta.version) db = fresh;
    _core = window.BassirCore.createCore(db, function () { try { localStorage.setItem('bassir-demo-db', JSON.stringify(db)); } catch (e) {} });
    return _core;
  }
  async function apiCall(path, body) {
    try {
      var res = await fetch(path, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
      if (res.ok) return await res.json();
      var d = await res.json().catch(function () { return {}; });
      var e = new Error(d.error || ('خطأ ' + res.status)); e.status = res.status; throw e;
    } catch (netErr) {
      if (netErr && netErr.status) throw netErr;
      var c = localCore();
      if (c) {
        if (path === '/api/platform/visit') return c.recordVisit();
        if (path === '/api/platform/register') return c.registerTenant(body);
      }
      throw netErr;
    }
  }

  function fmt(n) { return Number(n || 0).toLocaleString('en-US'); }
  function parseNum(s) { return Number(String(s).replace(/[^\d]/g, '')) || 0; }
  function clampCount(v) { v = parseInt(v, 10); if (!v || v < 1) v = 1; if (v > 200) v = 200; return v; }
  function $(id) { return document.getElementById(id); }

  // ====== سجّل زيارة (لتغذية قمع التحويل في لوحة مالك المنصّة) ======
  try { apiCall('/api/platform/visit', {}).catch(function () {}); } catch (e) {}

  // ====== حاسبة العائد ======
  var rVal = $('roi-value'), rCount = $('roi-count');
  function calcRoi() {
    var v = parseNum(rVal.value), n = clampCount(rCount.value);
    rCount.value = n; rVal.value = v.toLocaleString('en-US');
    var s1 = v * 0.03, s2 = v * 0.015, s3 = v * 0.005, total = (s1 + s2 + s3) * n, cost = n * PRICE * 12;
    $('roi-s1').textContent = fmt(Math.round(s1 * n)) + ' ر.س';
    $('roi-s2').textContent = fmt(Math.round(s2 * n)) + ' ر.س';
    $('roi-s3').textContent = fmt(Math.round(s3 * n)) + ' ر.س';
    $('roi-total').textContent = fmt(Math.round(total)) + ' ر.س';
    $('roi-x').textContent = cost ? Math.round(total / cost) : '—';
  }
  $('roi-plus').onclick = function () { rCount.value = clampCount(rCount.value) + 1; calcRoi(); };
  $('roi-minus').onclick = function () { rCount.value = clampCount(rCount.value) - 1; calcRoi(); };
  rVal.oninput = calcRoi; rCount.oninput = calcRoi; calcRoi();

  // ====== طلب عرض تجريبي (يُنشئ عميلاً محتملاً يظهر في لوحة المالك) ======
  var dProj = $('d-proj');
  $('d-plus').onclick = function () { dProj.value = clampCount(dProj.value) + 1; };
  $('d-minus').onclick = function () { dProj.value = clampCount(dProj.value) - 1; };
  $('demo-form').onsubmit = async function (ev) {
    ev.preventDefault();
    var ok = $('d-ok'), err = $('d-err'); ok.style.display = 'none'; err.style.display = 'none';
    var company = $('d-company').value.trim(), email = $('d-email').value.trim();
    if (!company) { err.textContent = '⚠️ أدخل اسم الشركة/الجهة.'; err.style.display = 'block'; return; }
    if (!email) { err.textContent = '⚠️ أدخل البريد الإلكتروني.'; err.style.display = 'block'; return; }
    var btn = $('d-send'); btn.disabled = true; var old = btn.textContent; btn.textContent = '⏳ جارٍ الإرسال…';
    try {
      await apiCall('/api/platform/register', {
        companyName: company, contactName: $('d-contact').value.trim(),
        email: email, phone: $('d-phone').value.trim(), projectCount: clampCount(dProj.value)
      });
      ok.style.display = 'block'; $('demo-form').reset(); dProj.value = 1;
    } catch (e) {
      err.textContent = '⚠️ ' + (e.message || 'تعذّر إرسال الطلب، حاول مجدداً.'); err.style.display = 'block';
    } finally { btn.disabled = false; btn.textContent = old; }
  };

  // ====== دخول مالك النظام → لوحة تحكّم المنصّة ======
  var modal = $('owner-modal');
  function openModal(e) { if (e) e.preventDefault(); modal.classList.add('on'); setTimeout(function () { $('o-pass').focus(); }, 50); }
  function closeModal() { modal.classList.remove('on'); $('o-err').style.display = 'none'; }
  $('owner-login').addEventListener('click', openModal);
  $('o-cancel').addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

  async function ownerLogin() {
    var err = $('o-err'); err.style.display = 'none';
    var u = $('o-user').value.trim(), p = $('o-pass').value;
    if (!u || !p) { err.textContent = '⚠️ أدخل اسم المستخدم وكلمة المرور.'; err.style.display = 'block'; return; }
    var btn = $('o-go'); btn.disabled = true; var old = btn.textContent; btn.textContent = '⏳ جارٍ الدخول…';
    try {
      var r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u, password: p }) });
      var data = await r.json().catch(function () { return {}; });
      if (!r.ok || !data.user) throw new Error(data.error || 'بيانات الدخول غير صحيحة');
      if (['platform_admin', 'admin'].indexOf(data.user.role) === -1) throw new Error('هذا الحساب ليس مالكاً للمنصّة');
      // خزّن الجلسة بنفس مفاتيح التطبيق ثم انتقل مباشرةً للوحة المنصّة
      try { if (data.token) sessionStorage.setItem('bassir-token', data.token); } catch (e) {}
      try { sessionStorage.setItem('bassir-user', JSON.stringify(data.user)); } catch (e) {}
      window.location.href = '/app#biz-overview';
    } catch (e) {
      err.textContent = '⚠️ ' + (e.message || 'تعذّر الدخول.'); err.style.display = 'block';
      btn.disabled = false; btn.textContent = old;
    }
  }
  $('o-go').addEventListener('click', ownerLogin);
  $('o-pass').addEventListener('keydown', function (e) { if (e.key === 'Enter') ownerLogin(); });
})();
