(function () {
'use strict';
var PRICE = 2000;

// ====== طبقة اتصال: الخادم الحقيقي إن وُجد، وإلا نواة داخل المتصفح ======
var _core = null;
function localCore() {
if (_core) return _core;
var db = null;
try { var s = localStorage.getItem('bassir-demo-db'); if (s) db = JSON.parse(s); } catch (e) {}
var fresh = window.BassirSeed.buildSeed();
if (!db || !db.meta || db.meta.version !== fresh.meta.version) db = fresh;
_core = window.BassirCore.createCore(db, function () {
  try { localStorage.setItem('bassir-demo-db', JSON.stringify(db)); } catch (e) {}
});
return _core;
}
async function apiCall(path, body) {
try {
  var res = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  if (res.ok) return await res.json();
  // الخادم موجود لكنه رفض الطلب — مرّر الخطأ للمستخدم
  var d = await res.json().catch(function () { return {}; });
  var e = new Error(d.error || ('خطأ ' + res.status)); e.status = res.status; throw e;
} catch (netErr) {
  if (netErr && netErr.status) throw netErr;   // خطأ حقيقي من الخادم
  // تعذّر الوصول للخادم (عرض ثابت) — شغّل النواة محلياً
  var c = localCore();
  if (path === '/api/platform/visit') return c.recordVisit();
  if (path === '/api/platform/subscribe') return c.subscribeTenant(body);
  if (path === '/api/platform/register') return c.registerTenant(body);
  throw netErr;
}
}

function fmt(n) { return Number(n || 0).toLocaleString('en-US'); }
function clampCount(v) { v = parseInt(v, 10); if (!v || v < 1) v = 1; if (v > 200) v = 200; return v; }

// ====== حاسبة الأسعار (قسم الأسعار) ======
var pCount = document.getElementById('p-count');
function syncPrice() {
var n = clampCount(pCount.value); pCount.value = n;
var total = fmt(n * PRICE);
document.getElementById('p-total').textContent = total;
document.getElementById('p-total2').textContent = total;
}
document.getElementById('p-plus').onclick = function () { pCount.value = clampCount(pCount.value) + 1; syncPrice(); };
document.getElementById('p-minus').onclick = function () { pCount.value = clampCount(pCount.value) - 1; syncPrice(); };
pCount.oninput = syncPrice;
document.getElementById('price-cta').onclick = function () {
document.getElementById('f-proj').value = clampCount(pCount.value); syncForm();
};

// ====== نموذج الاشتراك ======
var fProj = document.getElementById('f-proj');
function syncForm() {
var n = clampCount(fProj.value); fProj.value = n;
var total = fmt(n * PRICE);
document.getElementById('f-total').textContent = total;
document.getElementById('pay-amount').textContent = total;
}
document.getElementById('f-plus').onclick = function () { fProj.value = clampCount(fProj.value) + 1; syncForm(); };
document.getElementById('f-minus').onclick = function () { fProj.value = clampCount(fProj.value) - 1; syncForm(); };
fProj.oninput = syncForm;

// ====== معاينة البطاقة الحيّة ======
var cNum = document.getElementById('c-num'), cName = document.getElementById('c-name'), cExp = document.getElementById('c-exp');
cNum.oninput = function () {
var d = cNum.value.replace(/\D/g, '').slice(0, 16);
cNum.value = d.replace(/(.{4})/g, '$1 ').trim();
document.getElementById('cf-num').textContent = (cNum.value || '•••• •••• •••• ••••').padEnd(19, '•');
};
cName.oninput = function () { document.getElementById('cf-name').textContent = cName.value.toUpperCase() || 'الاسم على البطاقة'; };
cExp.oninput = function () {
var d = cExp.value.replace(/\D/g, '').slice(0, 4);
if (d.length >= 3) d = d.slice(0, 2) + '/' + d.slice(2);
cExp.value = d;
document.getElementById('cf-exp').textContent = d || 'MM/YY';
};

function showErr(msg) { var e = document.getElementById('err'); e.textContent = '⚠️ ' + msg; e.style.display = 'block'; }
function hideErr() { document.getElementById('err').style.display = 'none'; }

function successModal(res) {
var t = res.tenant || {}, amount = res.amount || (clampCount(fProj.value) * PRICE);
var back = document.createElement('div');
back.className = 'modal-back';
back.innerHTML =
  '<div class="modal">' +
  '<div class="big">🎉</div>' +
  '<h2 style="margin:0 0 6px">تم تفعيل حسابك!</h2>' +
  '<p style="color:var(--muted);margin:0 0 6px">أهلاً بك في بصير، <b>' + (t.companyName || '') + '</b>.</p>' +
  '<p style="margin:0 0 4px">اشتراكك: <b class="num">' + fmt(amount) + ' ر.س</b> / شهر لـ <b class="num">' + (t.projectCount || 1) + '</b> مشروع.</p>' +
  '<p style="color:var(--muted);font-size:13px">صدرت فاتورة مدفوعة' + (t.cardLast4 ? ' على بطاقة تنتهي بـ <b class="num">' + t.cardLast4 + '</b>' : '') + '.</p>' +
  '<a class="btn primary lg" href="/" style="width:100%;justify-content:center;margin-top:12px">ادخل إلى لوحتك الآن</a>' +
  '<button class="btn ghost" id="m-close" style="margin-top:10px">إغلاق</button>' +
  '</div>';
document.body.appendChild(back);
back.querySelector('#m-close').onclick = function () { back.remove(); };
back.onclick = function (ev) { if (ev.target === back) back.remove(); };
}

document.getElementById('sub-form').onsubmit = async function (ev) {
ev.preventDefault();
hideErr();
var company = document.getElementById('f-company').value.trim();
var email = document.getElementById('f-email').value.trim();
if (!company) { showErr('أدخل اسم الشركة.'); return; }
if (!email) { showErr('أدخل البريد الإلكتروني.'); return; }
var cardNum = cNum.value.replace(/\D/g, '');
if (cardNum.length < 12) { showErr('أدخل رقم بطاقة صحيح (جرّب 4111 1111 1111 1111).'); return; }
var btn = document.getElementById('pay-btn');
btn.disabled = true; var old = btn.innerHTML; btn.innerHTML = '⏳ جارٍ الدفع والتفعيل…';
try {
  var payload = {
    companyName: company,
    contactName: document.getElementById('f-contact').value.trim(),
    email: email,
    phone: document.getElementById('f-phone').value.trim(),
    projectCount: clampCount(fProj.value),
    planId: 'standard',
    card: { number: cardNum, name: cName.value.trim(), exp: cExp.value, cvc: document.getElementById('c-cvc').value.trim() }
  };
  var res = await apiCall('/api/platform/subscribe', payload);
  successModal(res);
} catch (e) {
  showErr(e.message || 'تعذّر إتمام العملية.');
} finally {
  btn.disabled = false; btn.innerHTML = old;
}
};

syncPrice(); syncForm();

// ====== سجّل زيارة (لقياس نمو النظام ونسبة التحويل في لوحة مالك المنصّة) ======
try { apiCall('/api/platform/visit', {}).catch(function () {}); } catch (e) {}

// ====== حاسبة العائد (كم يوفّر عليك بصير) ======
var rVal = document.getElementById('roi-value'), rCount = document.getElementById('roi-count');
function parseNum(s) { return Number(String(s).replace(/[^\d]/g, '')) || 0; }
function calcRoi() {
var v = parseNum(rVal.value); var n = clampCount(rCount.value); rCount.value = n;
rVal.value = v.toLocaleString('en-US');
var s1 = v * 0.03, s2 = v * 0.015, s3 = v * 0.005;
var totalPer = s1 + s2 + s3;
var total = totalPer * n;
var cost = n * PRICE * 12;
document.getElementById('roi-s1').textContent = fmt(Math.round(s1 * n)) + ' ر.س';
document.getElementById('roi-s2').textContent = fmt(Math.round(s2 * n)) + ' ر.س';
document.getElementById('roi-s3').textContent = fmt(Math.round(s3 * n)) + ' ر.س';
document.getElementById('roi-total').textContent = fmt(Math.round(total)) + ' ر.س';
document.getElementById('roi-cost').textContent = fmt(cost) + ' ر.س';
document.getElementById('roi-x').textContent = cost ? Math.round(total / cost) : '—';
}
document.getElementById('roi-plus').onclick = function () { rCount.value = clampCount(rCount.value) + 1; calcRoi(); };
document.getElementById('roi-minus').onclick = function () { rCount.value = clampCount(rCount.value) - 1; calcRoi(); };
rVal.oninput = calcRoi; rCount.oninput = calcRoi;
calcRoi();
})();