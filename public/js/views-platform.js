/* بصير | طبقة المنصّة (بصير بزنس): لوحة المالك، المشتركون، الفواتير، الباقات.
   تعرض مؤشرات الأعمال (MRR/الإيراد)، تدير المستأجرين (تفعيل/إيقاف)، وتحصّل الفواتير. */
(function () {
  'use strict';
  const VS = window.ViewsShared;
  const esc = VS.esc, money = VS.money, toast = VS.toast, modal = VS.modal, pill = VS.pill;
  const t = I18n.t;

  function platformData(ctx) {
    const A = ctx.Sall || ctx.S || {};
    return {
      stats: A.platformStats || {},
      tenants: (A.tenants || []).slice(),
      invoices: (A.tenantInvoices || []).slice(),
      plans: A.plans || []
    };
  }
  const SAR = function (n) { return Number(n || 0).toLocaleString('en-US') + ' ر.س'; };
  const STATUS = {
    active: { cls: 'p-ok', label: 'فعّال', icon: '✓' },
    trial: { cls: 'p-info', label: 'تجريبي', icon: '🎁' },
    suspended: { cls: 'p-danger', label: 'موقوف', icon: '⛔' },
    pending: { cls: 'p-warn', label: 'بانتظار الدفع', icon: '⏳' }
  };
  function statusChip(s) { const m = STATUS[s] || { cls: 'p-muted', label: s, icon: '•' }; return '<span class="pill ' + m.cls + '">' + m.icon + ' ' + m.label + '</span>'; }
  const invStatus = { paid: { cls: 'p-ok', label: 'مدفوعة' }, unpaid: { cls: 'p-warn', label: 'غير مدفوعة' }, overdue: { cls: 'p-danger', label: 'متأخرة' } };
  function invChip(s) { const m = invStatus[s] || { cls: 'p-muted', label: s }; return '<span class="pill ' + m.cls + '">' + m.label + '</span>'; }

  // ============ لوحة المنصّة ============
  function renderPlatformOverview(el, ctx) {
    const D = platformData(ctx); const st = D.stats;
    // إيراد شهري من الفواتير المدفوعة
    const byMonth = {};
    D.invoices.filter(function (i) { return i.status === 'paid' && i.paidAt; }).forEach(function (i) {
      const k = i.paidAt.slice(0, 7); byMonth[k] = (byMonth[k] || 0) + (i.amount || 0);
    });
    const months = Object.keys(byMonth).sort();
    const maxRev = Math.max(1, ...months.map(function (m) { return byMonth[m]; }));
    const bars = months.map(function (m) {
      const h = Math.round((byMonth[m] / maxRev) * 100);
      return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px">' +
        '<div class="small num" style="color:var(--brand)">' + Math.round(byMonth[m] / 1000) + 'k</div>' +
        '<div style="width:60%;background:linear-gradient(0deg,#8a6a35,var(--brand));border-radius:6px 6px 0 0;height:' + h + '%;min-height:4px"></div>' +
        '<div class="small muted num">' + m + '</div></div>';
    }).join('');

    el.innerHTML =
      '<div class="flex" style="justify-content:space-between;flex-wrap:wrap;align-items:center;margin-bottom:6px">' +
      '<h2 style="margin:0">📊 لوحة بصير بزنس <span class="hint">نظرة على اشتراكات ودخل منصّتك</span></h2>' +
      '<div class="flex"><a class="btn ghost sm" href="/landing.html" target="_blank">🌐 صفحة التسويق</a>' +
      '<button class="btn sm" id="biz-run-billing">⚙️ تشغيل الفوترة الآن</button></div></div>' +

      '<div class="grid g4 mb">' +
      '<div class="card kpi k-ok"><div class="lbl">الدخل الشهري المتكرر (MRR)</div><div class="val">' + SAR(st.mrr) + '</div><div class="sub">سنوياً ' + SAR(st.arr) + '</div></div>' +
      '<div class="card kpi"><div class="lbl">إجمالي الإيراد المحصّل</div><div class="val">' + SAR(st.totalRevenue) + '</div><div class="sub">هذا الشهر ' + SAR(st.revThisMonth) + '</div></div>' +
      '<div class="card kpi k-info"><div class="lbl">المشتركون الفعّالون</div><div class="val num">' + (st.active || 0) + ' / ' + (st.tenants || 0) + '</div><div class="sub num">' + (st.activeProjects || 0) + ' مشروع · ' + (st.users || 0) + ' مستخدم</div></div>' +
      '<div class="card kpi ' + ((st.overdue || 0) ? 'k-danger' : 'k-ok') + '"><div class="lbl">مستحقّات غير محصّلة</div><div class="val">' + SAR(st.outstanding) + '</div><div class="sub">' + (st.overdue || 0) + ' متأخرة · ' + (st.unpaid || 0) + ' غير مدفوعة</div></div>' +
      '</div>' +

      // ===== نمو النظام وقمع التحويل =====
      '<div class="grid g2 mb">' +
      '<div class="card"><h3>🚀 نمو النظام <span class="hint">مقارنةً بالشهر الماضي</span></h3>' +
      '<div class="grid g2" style="gap:12px">' +
      growthCard('مشتركون جدد هذا الشهر', st.newThisMonth || 0, st.tenantGrowthPct, 'الشهر الماضي ' + (st.newLastMonth || 0)) +
      growthCard('نمو الدخل المتكرر (MRR)', SAR(st.mrr), st.mrrGrowthPct, 'كان ' + SAR(st.mrrLastMonth)) +
      '</div>' +
      '<div class="small muted mt">📈 الدخل المتكرر ينمو مع كل مشترك جديد ومع كل مشروع يُضاف لمحفظة العملاء.</div></div>' +

      '<div class="card"><h3>🧲 قمع التحويل <span class="hint">من زائر إلى مشترك</span></h3>' +
      funnelRow('👀 زوّار دخلوا النظام', st.visits || 0, 100, 'var(--brand)') +
      funnelRow('📝 سجّلوا شركاتهم', st.tenants || 0, pct(st.tenants, st.visits), 'var(--info)') +
      funnelRow('💳 اشتركوا ودفعوا', st.buyers || 0, pct(st.buyers, st.visits), 'var(--ok)') +
      '<div class="flex mt" style="gap:8px;flex-wrap:wrap">' +
      '<span class="pill p-info">نسبة التحويل ' + (st.conversionPct || 0) + '%</span>' +
      '<span class="pill p-warn">⏳ ' + (st.leads || 0) + ' سجّلوا ولم يدفعوا بعد</span>' +
      '<span class="pill p-muted">🚶 ' + (st.notBought || 0) + ' زاروا ولم يسجّلوا</span>' +
      '</div>' +
      '<div class="small muted mt">💡 كل زائر لم يشترِ هو فرصة بيع — تابعهم لرفع نسبة التحويل.</div></div>' +
      '</div>' +

      '<div class="grid g2 mb">' +
      '<div class="card"><h3>📈 الإيراد الشهري <span class="hint">من الفواتير المدفوعة</span></h3>' +
      (months.length ? '<div class="flex" style="align-items:flex-end;height:180px;gap:10px;padding:8px 4px">' + bars + '</div>' : '<div class="empty"><div class="e-ico">📈</div>لا إيراد بعد</div>') + '</div>' +
      '<div class="card"><h3>🏢 المشتركون حسب الحالة</h3>' +
      [['active', st.active], ['trial', st.trial], ['pending', st.pending], ['suspended', st.suspended]].map(function (r) {
        const total = st.tenants || 1; const w = Math.round(((r[1] || 0) / total) * 100);
        return '<div style="margin:10px 0"><div class="flex" style="justify-content:space-between"><span class="small">' + statusChip(r[0]) + '</span><b class="num">' + (r[1] || 0) + '</b></div>' +
          '<div class="bar" style="height:8px;margin-top:4px"><i style="width:' + w + '%"></i></div></div>';
      }).join('') +
      '<div class="small muted mt">💰 التسعير: <b class="num">' + SAR(st.pricePerProject) + '</b> لكل مشروع / شهر — مشروعان = ' + SAR(st.pricePerProject * 2) + '، ثلاثة = ' + SAR(st.pricePerProject * 3) + ' وهكذا.</div>' +
      '</div></div>' +

      '<div class="card"><h3>💡 لماذا يشترك العميل في بصير — عيون المالك؟ <span class="hint">قيمة تبيعها لكل دور</span></h3>' +
      '<div class="grid g3">' +
      valueCard('👁 للمالك', ['يرى مشروعه مباشرةً دون زيارة الموقع', 'خريطة إنجاز على مخططاته الحقيقية تضيء مع التنفيذ', 'تقارير دورية ومؤشر صحة مالي/زمني', 'قرارات واعتمادات موثّقة بالاسم والوقت']) +
      valueCard('🏛️ للاستشاري', ['مراجعة واعتماد المستخلصات والطلبات في مكان واحد', 'سجلّ مكتب فني كامل (RFI/WIR/مخالفات)', 'ربط الكميات بالمخططات والنماذج', 'تقليل الورق والمراسلات المبعثرة']) +
      valueCard('👷 للمقاول', ['رفع جداول الكميات والبرنامج والمستخلصات بسهولة', 'متابعة المنجز والمتبقّي والتأخير لكل بند', 'توثيق أعماله وطلبات الاستلام', 'سرعة التحصيل بعد الاعتماد']) +
      '</div></div>';

    el.querySelector('#biz-run-billing').addEventListener('click', async function () {
      this.disabled = true;
      try { const r = await Api.runBilling(); toast('⚙️ تمّت الفوترة — أُصدرت ' + r.issued + ' فاتورة، أُوقف ' + r.suspended + ' مشترك متأخر'); ctx.refresh(); }
      catch (e) { toast(e.message, true); this.disabled = false; }
    });
  }
  function valueCard(title, items) {
    return '<div class="card" style="background:var(--bg2)"><b>' + title + '</b><ul style="margin:8px 0 0;padding-right:18px">' +
      items.map(function (x) { return '<li class="small" style="margin:4px 0">' + esc(x) + '</li>'; }).join('') + '</ul></div>';
  }
  const pct = function (a, b) { return b ? Math.round((Number(a || 0) / Number(b)) * 100) : 0; };
  function growthCard(label, val, growthPct, subNote) {
    const g = Number(growthPct || 0);
    const up = g >= 0;
    const arrow = '<span style="color:' + (up ? 'var(--ok)' : 'var(--danger)') + ';font-weight:800">' + (up ? '▲' : '▼') + ' ' + Math.abs(g) + '%</span>';
    return '<div class="card" style="background:var(--bg2);padding:14px">' +
      '<div class="small muted">' + esc(label) + '</div>' +
      '<div class="flex" style="justify-content:space-between;align-items:baseline;margin-top:4px"><b style="font-size:20px" class="num">' + (typeof val === 'number' ? val : val) + '</b>' + arrow + '</div>' +
      '<div class="small muted num mt">' + esc(subNote) + '</div></div>';
  }
  function funnelRow(label, n, widthPct, color) {
    const w = Math.max(6, Math.min(100, widthPct));
    return '<div style="margin:9px 0"><div class="flex" style="justify-content:space-between"><span class="small">' + label + '</span><b class="num">' + Number(n || 0).toLocaleString('en-US') + '</b></div>' +
      '<div style="height:12px;background:var(--bg2);border-radius:7px;overflow:hidden;margin-top:4px"><i style="display:block;height:100%;width:' + w + '%;background:' + color + ';border-radius:7px"></i></div></div>';
  }

  // ============ المشتركون (المستأجرون) ============
  function renderTenants(el, ctx) {
    const D = platformData(ctx);
    const rows = D.tenants.map(function (t) {
      const amount = (t.projectCount || 1) * (t.pricePerProject || 2000);
      const nInv = D.invoices.filter(function (i) { return i.tenantId === t.id; }).length;
      return '<tr>' +
        '<td><b>' + esc(t.companyName) + '</b><div class="small muted">' + esc(t.contactName || '') + ' · ' + esc(t.email) + '</div></td>' +
        '<td class="small">' + esc((D.plans.find(function (p) { return p.id === t.planId; }) || {}).name || t.planId) + '</td>' +
        '<td class="num small">' + (t.projectCount || 1) + '</td>' +
        '<td class="num small"><b>' + SAR(amount) + '</b><div class="muted">/شهر · سنوياً ' + SAR(amount * 12) + '</div></td>' +
        '<td class="small num">' + esc(t.subscriptionStart || '—') + '<div class="muted">إلى ' + esc(t.subscriptionEnd || '—') + '</div></td>' +
        '<td>' + statusChip(t.status) + (t.statusReason ? '<div class="small muted">' + esc(t.statusReason) + '</div>' : '') + '</td>' +
        '<td class="small muted num">' + esc(t.lastPaymentAt || '—') + (t.nextInvoiceDate ? '<div class="muted">تجديد ' + esc(t.nextInvoiceDate) + '</div>' : '') + '</td>' +
        '<td><div class="flex" style="gap:4px;flex-wrap:wrap">' +
        (t.status !== 'active' ? '<button class="btn sm" data-activate="' + t.id + '">تفعيل</button>' : '<button class="btn danger sm" data-suspend="' + t.id + '">إيقاف</button>') +
        '<button class="btn ghost sm" data-invs="' + t.id + '">فواتير (' + nInv + ')</button>' +
        '</div></td></tr>';
    }).join('');

    el.innerHTML =
      '<div class="card mb"><div class="flex" style="justify-content:space-between;flex-wrap:wrap"><h3 style="margin:0">🏢 المشتركون (المستأجرون) <span class="hint">كل عميل اشترى النظام</span></h3>' +
      '<button class="btn sm" id="biz-add-tenant">➕ إضافة مشترك</button></div>' +
      '<div class="small muted mb">يعرض لك: الشركة، الباقة، عدد مشاريعها، قيمة الاشتراك (شهري/سنوي)، بداية ونهاية الاشتراك، الحالة، وآخر دفع والتجديد القادم.</div>' +
      '<div class="tbl-wrap mt"><table class="tbl"><thead><tr><th>الشركة</th><th>الباقة</th><th>المشاريع</th><th>قيمة الاشتراك</th><th>مدّة الاشتراك</th><th>الحالة</th><th>آخر دفع · التجديد</th><th></th></tr></thead><tbody>' +
      (rows || '<tr><td colspan="8"><div class="empty"><div class="e-ico">🏢</div>لا مشتركون بعد</div></td></tr>') + '</tbody></table></div></div>';

    el.querySelectorAll('[data-activate]').forEach(function (b) { b.addEventListener('click', function () { setStatus(ctx, b.getAttribute('data-activate'), 'active'); }); });
    el.querySelectorAll('[data-suspend]').forEach(function (b) { b.addEventListener('click', function () { setStatus(ctx, b.getAttribute('data-suspend'), 'suspended', 'إيقاف يدوي من المالك'); }); });
    el.querySelectorAll('[data-invs]').forEach(function (b) { b.addEventListener('click', function () { tenantInvoicesModal(ctx, b.getAttribute('data-invs')); }); });
    el.querySelector('#biz-add-tenant').addEventListener('click', function () { addTenantModal(ctx); });
  }
  async function setStatus(ctx, id, status, reason) {
    try { await Api.setTenantStatus(id, status, reason); toast(status === 'active' ? '✓ فُعّل المشترك' : '⛔ أُوقف المشترك'); ctx.refresh(); }
    catch (e) { toast(e.message, true); }
  }
  function addTenantModal(ctx) {
    const m = modal('<h3>➕ إضافة مشترك</h3>' +
      '<label class="fl">اسم الشركة</label><input class="inp" id="ct-name">' +
      '<label class="fl">اسم المسؤول</label><input class="inp" id="ct-contact">' +
      '<div class="grid g2"><div><label class="fl">البريد</label><input class="inp" id="ct-email" type="email" dir="ltr"></div>' +
      '<div><label class="fl">الجوال</label><input class="inp" id="ct-phone" dir="ltr"></div></div>' +
      '<div class="grid g2"><div><label class="fl">عدد المشاريع</label><input class="inp num" id="ct-proj" type="number" min="1" value="1"></div>' +
      '<div><label class="fl">الحالة الأولية</label><select class="inp" id="ct-status"><option value="active">فعّال فوراً</option><option value="trial">تجريبي 14 يوم</option><option value="pending">بانتظار الدفع</option></select></div></div>' +
      '<div class="m-actions"><button class="btn" id="ct-save">حفظ</button><button class="btn mutedb" id="ct-cancel">إلغاء</button></div>');
    m.querySelector('#ct-cancel').addEventListener('click', function () { m.remove(); });
    m.querySelector('#ct-save').addEventListener('click', async function () {
      const name = m.querySelector('#ct-name').value.trim();
      if (!name) { toast('أدخل اسم الشركة', true); return; }
      try {
        await Api.createTenant({ companyName: name, contactName: m.querySelector('#ct-contact').value, email: m.querySelector('#ct-email').value, phone: m.querySelector('#ct-phone').value, projectCount: m.querySelector('#ct-proj').value, status: m.querySelector('#ct-status').value });
        m.remove(); toast('✓ أُضيف المشترك'); ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });
  }
  function tenantInvoicesModal(ctx, tid) {
    const D = platformData(ctx);
    const tnt = D.tenants.find(function (x) { return x.id === tid; }) || {};
    const invs = D.invoices.filter(function (i) { return i.tenantId === tid; });
    modal('<h3>🧾 فواتير ' + esc(tnt.companyName || '') + '</h3>' +
      (invs.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الرقم</th><th>الفترة</th><th>المبلغ</th><th>الحالة</th></tr></thead><tbody>' +
        invs.map(function (i) { return '<tr><td class="num small">' + esc(i.number) + '</td><td class="small num">' + esc(i.period) + '</td><td class="num small">' + SAR(i.amount) + '</td><td>' + invChip(i.status) + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<div class="empty">لا فواتير</div>') +
      '<div class="m-actions"><button class="btn" onclick="this.closest(\'.modal-back\').remove()">تم</button></div>');
  }

  // ============ الفواتير والتحصيل ============
  function renderInvoices(el, ctx) {
    const D = platformData(ctx);
    const invs = D.invoices.slice().sort(function (a, b) { return String(b.issuedAt).localeCompare(String(a.issuedAt)); });
    const tname = function (id) { return (D.tenants.find(function (t) { return t.id === id; }) || {}).companyName || id; };
    const rows = invs.map(function (i) {
      return '<tr>' +
        '<td class="num small"><b>' + esc(i.number) + '</b></td>' +
        '<td>' + esc(tname(i.tenantId)) + '</td>' +
        '<td class="small num">' + esc(i.period) + '</td>' +
        '<td class="num small">' + (i.projectCount || 1) + ' × ' + SAR(i.pricePerProject) + ' = <b>' + SAR(i.amount) + '</b></td>' +
        '<td>' + invChip(i.status) + '</td>' +
        '<td class="small muted num">' + esc(i.status === 'paid' ? ('دُفعت ' + (i.paidAt || '')) : ('تستحق ' + (i.dueAt || ''))) + '</td>' +
        '<td>' + (i.status !== 'paid' ? '<button class="btn sm" data-pay="' + i.id + '">💳 تحصيل</button>' : '<span class="pill p-ok">✓</span>') + '</td></tr>';
    }).join('');
    el.innerHTML =
      '<div class="card mb"><div class="flex" style="justify-content:space-between;flex-wrap:wrap"><h3 style="margin:0">🧾 الفواتير والتحصيل</h3>' +
      '<button class="btn sm" id="biz-run-billing2">⚙️ تشغيل الفوترة (إصدار + إيقاف المتأخرين)</button></div>' +
      '<div class="small muted mt">الفوترة تلقائية شهرياً لكل مشترك فعّال؛ وعند تأخّر السداد يُوقف الحساب آلياً حتى الدفع.</div>' +
      '<div class="tbl-wrap mt"><table class="tbl"><thead><tr><th>الرقم</th><th>المشترك</th><th>الفترة</th><th>التفصيل</th><th>الحالة</th><th>التاريخ</th><th></th></tr></thead><tbody>' +
      (rows || '<tr><td colspan="7"><div class="empty">لا فواتير</div></td></tr>') + '</tbody></table></div></div>';
    el.querySelectorAll('[data-pay]').forEach(function (b) { b.addEventListener('click', async function () {
      try { await Api.payTenantInvoice(b.getAttribute('data-pay')); toast('💳 حُصّلت الفاتورة — أُعيد تفعيل الحساب إن كان موقوفاً'); ctx.refresh(); }
      catch (e) { toast(e.message, true); }
    }); });
    el.querySelector('#biz-run-billing2').addEventListener('click', async function () {
      this.disabled = true;
      try { const r = await Api.runBilling(); toast('⚙️ أُصدرت ' + r.issued + ' فاتورة، أُوقف ' + r.suspended + ' مشترك'); ctx.refresh(); }
      catch (e) { toast(e.message, true); this.disabled = false; }
    });
  }

  // ============ الباقات والتسعير ============
  function renderPlans(el, ctx) {
    const D = platformData(ctx);
    el.innerHTML =
      '<div class="card mb"><h3>💳 الباقات والتسعير <span class="hint">التسعير لكل مشروع / شهر</span></h3>' +
      '<div class="grid g2">' + D.plans.map(function (p) {
        return '<div class="card" style="background:var(--bg2)"><div class="flex" style="justify-content:space-between"><b style="font-size:17px">' + esc(p.name) + '</b>' +
          '<span class="pill p-info">' + SAR(p.pricePerProject) + ' / مشروع / شهر</span></div>' +
          '<ul style="margin:10px 0 0;padding-right:18px">' + (p.features || []).map(function (f) { return '<li class="small" style="margin:5px 0">✓ ' + esc(f) + '</li>'; }).join('') + '</ul></div>';
      }).join('') + '</div>' +
      '<div class="small muted mt">💡 مثال: مالك لديه 3 مشاريع على الباقة القياسية = <b class="num">' + SAR(2000 * 3) + '</b> شهرياً.</div>' +
      '<div class="flex mt"><a class="btn" href="/landing.html" target="_blank">🌐 فتح صفحة التسويق والتسجيل</a></div></div>';
  }

  window.ViewsPlatform = {
    renderPlatformOverview: renderPlatformOverview,
    renderTenants: renderTenants,
    renderInvoices: renderInvoices,
    renderPlans: renderPlans
  };
})();
