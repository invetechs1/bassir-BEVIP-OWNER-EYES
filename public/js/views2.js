/** بصير | صفحات الاستشاري والمقاول والإدارة */
(function () {
  'use strict';

  const VS = window.ViewsShared;
  const esc = VS.esc, pill = VS.pill, money = VS.money, toast = VS.toast, modal = VS.modal, discOf = VS.discOf;

  const APPROVAL_TABS = [
    { col: 'shopDrawings', name: 'المخططات التنفيذية', icon: '📐' },
    { col: 'scheduleSubmittals', name: 'الجداول الزمنية', icon: '🗓️' },
    { col: 'materials', name: 'المواد والداتا شيت', icon: '🧱' },
    { col: 'wirs', name: 'طلبات الاستلام', icon: '✅' },
    { col: 'changeOrders', name: 'أوامر التغيير', icon: '🔁' },
    { col: 'payments', name: 'المستخلصات', icon: '💰' }
  ];

  function contractorName(ctx, id) {
    const c = ctx.S.contractors.find(function (x) { return x.id === id; });
    return c ? c.name : id || '—';
  }

  // ============ صفحة اعتمادات الاستشاري ============
  const apprState = { tab: 'shopDrawings' };

  function renderApprovals(el, ctx) {
    const tab = apprState.tab;
    const items = (ctx.S[tab] || []).slice().sort(function (a, b) {
      return (a.status === 'pending' ? 0 : 1) - (b.status === 'pending' ? 0 : 1);
    });

    el.innerHTML =
      '<div class="tabs">' + APPROVAL_TABS.map(function (t) {
        const pending = (ctx.S[t.col] || []).filter(function (x) { return x.status === 'pending'; }).length;
        return '<div class="tab ' + (tab === t.col ? 'active' : '') + '" data-atab="' + t.col + '">' + t.icon + ' ' + t.name +
          (pending ? '<span class="n">' + pending + '</span>' : '') + '</div>';
      }).join('') + '</div>' +

      '<div class="card"><h3>' + (APPROVAL_TABS.find(function (t) { return t.col === tab; }) || {}).icon + ' ' +
      esc((APPROVAL_TABS.find(function (t) { return t.col === tab; }) || {}).name) +
      ' <span class="hint">القرار يُوقَّع إلكترونياً باسم الاستشاري ويُشعَر به المقاول</span></h3>' +
      (items.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
        '<th>المرجع</th><th>العنوان</th><th>المقاول</th>' +
        (tab === 'changeOrders' ? '<th>القيمة / الأيام</th>' : '') +
        (tab === 'payments' ? '<th>القيمة</th>' : '') +
        '<th>التاريخ</th><th>الحالة</th><th>الملاحظات / التوقيع</th><th></th></tr></thead><tbody>' +
        items.map(function (it) {
          return '<tr>' +
            '<td class="num small"><b>' + esc(it.ref) + '</b>' + (it.file ? '<br><span class="muted">📎 ' + VS.att(it.file) + '</span>' : '') + '</td>' +
            '<td>' + esc(it.title) + (it.location ? '<div class="small muted">الموقع: ' + esc(VS.floorName(ctx, it.location)) + '</div>' : '') + '</td>' +
            '<td class="small">' + esc(contractorName(ctx, it.contractorId)) + '</td>' +
            (tab === 'changeOrders' ? '<td>' + money(it.amount) + '<div class="small muted num">+' + (it.days || 0) + ' يوم</div></td>' : '') +
            (tab === 'payments' ? '<td>' + money(it.amount) + '</td>' : '') +
            '<td class="small muted num">' + esc(it.date) + '</td>' +
            '<td>' + pill(it.status) + '</td>' +
            '<td class="small" style="max-width:220px">' + (it.notes ? esc(it.notes) : '<span class="muted">—</span>') +
            (it.signature ? '<div class="sig">✍️ ' + esc(it.signature) + ' · ' + esc(it.signDate) + '</div>' : '') + '</td>' +
            '<td><div class="flex" style="gap:6px">' + window.DrawingViewer.btn(it) +
            (it.status === 'pending' ? '<button class="btn sm" data-review="' + it.id + '">مراجعة وقرار</button>' : '') + '</div></td>' +
            '</tr>';
        }).join('') + '</tbody></table></div>'
        : '<div class="empty"><div class="e-ico">📭</div>لا توجد طلبات في هذا القسم</div>') +
      '</div>';

    el.querySelectorAll('[data-atab]').forEach(function (t) {
      t.addEventListener('click', function () { apprState.tab = t.getAttribute('data-atab'); renderApprovals(el, ctx); });
    });
    el.querySelectorAll('[data-review]').forEach(function (b) {
      b.addEventListener('click', function () {
        const it = items.find(function (x) { return x.id === b.getAttribute('data-review'); });
        openReviewModal(ctx, tab, it);
      });
    });
    // فتح المخطط للترميز والاعتماد/الإرجاع من داخل العارض
    el.querySelectorAll('[data-dview]').forEach(function (b) {
      b.addEventListener('click', function () {
        const it = items.find(function (x) { return x.id === b.getAttribute('data-dview'); });
        window.DrawingViewer.open(ctx, tab, it, { canEdit: true, canReview: it.status === 'pending' });
      });
    });
  }

  function openReviewModal(ctx, collection, it) {
    const isPayment = collection === 'payments';
    const m = modal(
      '<h3>مراجعة: ' + esc(it.title) + '</h3>' +
      '<div class="m-sub">' + esc(it.ref) + ' · ' + esc(contractorName(ctx, it.contractorId)) +
      (it.amount ? ' · القيمة ' + money(it.amount) : '') + '</div>' +
      (isPayment && (it.lines || []).length ?
        '<div class="card" style="padding:12px;margin-bottom:10px"><b class="small">بنود جدول الكميات في هذا المستخلص:</b>' +
        it.lines.map(function (l) {
          const bq = ctx.S.boqItems.find(function (b) { return b.id === l.boqItemId; });
          return '<div class="small muted" style="margin-top:6px">• ' + (bq ? esc(bq.description) + ' (' + esc(bq.floor) + ')' : l.boqItemId) + ' ← إنجاز <b class="num" style="color:var(--ok)">' + l.progress + '%</b></div>';
        }).join('') +
        '<div class="small mt" style="color:var(--accent2)">💡 عند الاعتماد ستتحدث نسب هذه البنود تلقائياً وتتحول مناطقها في المخططات من داكنة إلى ساطعة.</div></div>' : '') +
      '<label class="fl">القرار</label>' +
      '<select class="inp" id="rv-status">' +
      '<option value="approved">✅ اعتماد</option>' +
      '<option value="approved_notes">📝 اعتماد مع ملاحظات</option>' +
      '<option value="rejected">❌ رفض وإرجاع للمقاول</option></select>' +
      '<label class="fl">الملاحظات</label><textarea class="inp" id="rv-notes" placeholder="اكتب ملاحظاتك للمقاول..."></textarea>' +
      '<label class="fl flex" style="cursor:pointer"><input type="checkbox" id="rv-sign" checked> توقيع إلكتروني باسم: <b style="color:var(--accent2)">' + esc(ctx.U.name) + '</b></label>' +
      '<div class="m-actions"><button class="btn" id="rv-ok">تأكيد القرار</button><button class="btn mutedb" id="rv-cancel">إلغاء</button></div>'
    );
    m.querySelector('#rv-cancel').addEventListener('click', function () { m.remove(); });
    m.querySelector('#rv-ok').addEventListener('click', async function () {
      if (!m.querySelector('#rv-sign').checked) { toast('يلزم التوقيع الإلكتروني لتأكيد القرار', true); return; }
      try {
        await Api.review({
          collection: collection, id: it.id,
          status: m.querySelector('#rv-status').value,
          notes: m.querySelector('#rv-notes').value
        });
        m.remove();
        toast('✅ تم تسجيل القرار وتوقيعه وإشعار المقاول');
        ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });
  }

  // ============ إدارة المقاولين (الاستشاري) ============
  function renderManageContractors(el, ctx) {
    const sums = VS.summarize(ctx);
    el.innerHTML =
      '<div class="grid" style="grid-template-columns:1.4fr 1fr">' +
      '<div class="card"><h3>👷 مقاولو المشروع</h3><div class="tbl-wrap"><table class="tbl"><thead><tr>' +
      '<th>المقاول</th><th>التخصص</th><th>قيمة العقد</th><th>المدة</th><th>الإنجاز</th><th>حساب الدخول</th></tr></thead><tbody>' +
      sums.map(function (s) {
        const d = discOf(ctx, s.type);
        const acc = (ctx.S.users || []).find(function (u) { return u.contractorId === s.id; });
        return '<tr><td><b>' + esc(s.name) + '</b></td>' +
          '<td>' + d.icon + ' ' + esc(d.name) + '</td>' +
          '<td>' + money(s.contractValue) + '</td>' +
          '<td class="small muted num">' + esc(s.startDate) + '<br>' + esc(s.endDate) + '</td>' +
          '<td><b class="num">' + s.progress + '%</b></td>' +
          '<td class="small">' + (acc ? '👤 <b class="num">' + esc(acc.username) + '</b>' : '<span class="muted">بلا حساب</span>') + '</td></tr>';
      }).join('') + '</tbody></table></div></div>' +

      '<div class="card"><h3>➕ إضافة مقاول جديد</h3>' +
      '<label class="fl">اسم المقاول</label><input class="inp" id="nc-name" placeholder="شركة ...">' +
      '<label class="fl">التخصص</label><select class="inp" id="nc-type">' +
      ctx.S.projects[0].disciplines.map(function (d) { return '<option value="' + d.id + '">' + d.icon + ' ' + esc(d.name) + '</option>'; }).join('') + '</select>' +
      '<div class="grid g2"><div><label class="fl">قيمة العقد (ر.س)</label><input class="inp num" id="nc-value" type="number" placeholder="1000000"></div>' +
      '<div><label class="fl">الجوال</label><input class="inp num" id="nc-phone" placeholder="05xxxxxxxx"></div></div>' +
      '<div class="grid g2"><div><label class="fl">تاريخ البدء</label><input class="inp" id="nc-start" type="date"></div>' +
      '<div><label class="fl">تاريخ الانتهاء</label><input class="inp" id="nc-end" type="date"></div></div>' +
      '<label class="fl">بنود جدول الكميات</label><div id="nc-boq"></div>' +
      '<button class="btn ghost sm" id="nc-addrow">+ إضافة بند</button>' +
      '<label class="fl">اسم مستخدم للمقاول (لإنشاء حساب دخول)</label><input class="inp" id="nc-user" placeholder="cont-name">' +
      '<label class="fl">كلمة المرور (اتركها فارغة للتوليد التلقائي)</label><input class="inp" id="nc-pass" placeholder="••••••••">' +
      '<div class="m-actions"><button class="btn block" id="nc-save">حفظ المقاول وإنشاء الحساب</button></div>' +
      '</div></div>';

    const boqWrap = el.querySelector('#nc-boq');
    function addRow() {
      const r = document.createElement('div');
      r.className = 'grid'; r.style.cssText = 'grid-template-columns:2fr 1fr 1fr 1fr 1fr;gap:6px;margin-bottom:6px';
      r.innerHTML = '<input class="inp" placeholder="وصف البند" data-f="description">' +
        '<input class="inp" placeholder="الوحدة" data-f="unit">' +
        '<input class="inp num" type="number" placeholder="كمية" data-f="qty">' +
        '<input class="inp num" type="number" placeholder="سعر" data-f="unitPrice">' +
        '<select class="inp" data-f="floor">' + ctx.S.projects[0].floors.map(function (f) { return '<option value="' + f.id + '">' + esc(f.name) + '</option>'; }).join('') + '</select>';
      boqWrap.appendChild(r);
    }
    addRow();
    el.querySelector('#nc-addrow').addEventListener('click', addRow);

    el.querySelector('#nc-save').addEventListener('click', async function () {
      const name = el.querySelector('#nc-name').value.trim();
      if (!name) { toast('أدخل اسم المقاول', true); return; }
      const boqItems = Array.prototype.map.call(boqWrap.children, function (r) {
        const o = {};
        r.querySelectorAll('[data-f]').forEach(function (i) { o[i.getAttribute('data-f')] = i.value; });
        return o;
      }).filter(function (o) { return o.description; });
      try {
        const res = await Api.addContractor({
          name: name, type: el.querySelector('#nc-type').value,
          contractValue: el.querySelector('#nc-value').value,
          phone: el.querySelector('#nc-phone').value,
          startDate: el.querySelector('#nc-start').value, endDate: el.querySelector('#nc-end').value,
          boqItems: boqItems,
          username: el.querySelector('#nc-user').value.trim() || null,
          password: el.querySelector('#nc-pass').value || null
        });
        if (res.account) {
          modal('<h3>✅ تم إنشاء المقاول وحسابه</h3><div class="m-sub">سلّم هذه البيانات للمقاول للدخول على صفحة المشروع:</div>' +
            '<div class="card" style="padding:16px"><div>👤 اسم المستخدم: <b class="num">' + esc(res.account.username) + '</b></div>' +
            '<div class="mt">🔑 كلمة المرور: <b class="num">' + esc(res.account.password) + '</b></div></div>' +
            '<div class="m-actions"><button class="btn" onclick="this.closest(\'.modal-back\').remove()">تم</button></div>');
        } else toast('✅ تمت إضافة المقاول');
        ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });
  }

  // ============ جدول الكميات (الاستشاري) ============
  const boqState = { contractor: 'all' };

  function renderBoq(el, ctx) {
    const canEdit = ['consultant', 'admin'].indexOf(ctx.U.role) !== -1;
    const items = ctx.S.boqItems.filter(function (b) {
      return boqState.contractor === 'all' || b.contractorId === boqState.contractor;
    });
    const total = items.reduce(function (a, b) { return a + b.qty * b.unitPrice; }, 0);
    const earned = items.reduce(function (a, b) { return a + b.qty * b.unitPrice * b.progress / 100; }, 0);

    el.innerHTML =
      '<div class="card"><h3>📊 جدول الكميات BOQ <span class="hint">تحديث نسب الإنجاز هنا يغيّر سطوع المخططات مباشرة</span></h3>' +
      '<div class="flex mb"><select class="inp" id="bq-filter" style="max-width:320px"><option value="all">كل المقاولين</option>' +
      ctx.S.contractors.map(function (c) { return '<option value="' + c.id + '"' + (boqState.contractor === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('') +
      '</select>' +
      '<span class="pill p-info">القيمة: ' + money(Math.round(total)) + '</span>' +
      '<span class="pill p-ok">المنفذ: ' + money(Math.round(earned)) + ' (' + (total ? Math.round(earned / total * 100) : 0) + '%)</span></div>' +
      '<div class="tbl-wrap" style="max-height:60vh;overflow-y:auto"><table class="tbl"><thead><tr>' +
      '<th>الكود</th><th>البند</th><th>الدور</th><th>الوحدة</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th><th style="min-width:160px">نسبة الإنجاز</th></tr></thead><tbody>' +
      items.map(function (b) {
        const d = discOf(ctx, b.discipline);
        return '<tr><td class="num small">' + esc(b.code) + '</td>' +
          '<td>' + d.icon + ' ' + esc(b.description) + '</td>' +
          '<td class="small">' + esc(VS.floorName(ctx, b.floor)) + '</td>' +
          '<td class="small">' + esc(b.unit) + '</td><td class="num">' + b.qty + '</td>' +
          '<td class="num">' + b.unitPrice.toLocaleString('en-US') + '</td>' +
          '<td class="num">' + (b.qty * b.unitPrice).toLocaleString('en-US') + '</td>' +
          '<td><div class="flex">' +
          (canEdit ? '<input type="range" min="0" max="100" value="' + b.progress + '" data-bq="' + b.id + '" style="flex:1;accent-color:' + d.color + '">' :
            '<div class="bar" style="flex:1"><i style="width:' + b.progress + '%"></i></div>') +
          '<b class="num small" id="bqv-' + b.id + '">' + b.progress + '%</b></div></td></tr>';
      }).join('') + '</tbody></table></div></div>';

    el.querySelector('#bq-filter').addEventListener('change', function (e) {
      boqState.contractor = e.target.value; renderBoq(el, ctx);
    });
    el.querySelectorAll('[data-bq]').forEach(function (r) {
      r.addEventListener('input', function () {
        el.querySelector('#bqv-' + r.getAttribute('data-bq')).textContent = r.value + '%';
      });
      r.addEventListener('change', async function () {
        try {
          const v = Number(r.value);
          await Api.update('boqItems', r.getAttribute('data-bq'), {
            progress: v, status: v >= 100 ? 'منجز' : v > 0 ? 'جاري' : 'لم يبدأ'
          });
          toast('✅ حُدّث البند — انعكس ذلك على سطوع المخططات');
          ctx.refreshSilent();
        } catch (e) { toast(e.message, true); }
      });
    });
  }

  // ============ إعداد التقارير (الاستشاري): يومي / أسبوعي / شهري ============
  const rptState = { tab: 'daily' };

  /** رفع الملفات المختارة فعلياً إلى الخادم وإرجاع سجلاتها {name, url} */
  async function filesOf(el, sel) {
    const files = el.querySelector(sel).files;
    const out = [];
    for (let i = 0; i < files.length; i++) out.push(await Api.upload(files[i]));
    return out;
  }

  function renderDailyReport(el, ctx) {
    const tab = rptState.tab;
    const today = new Date().toISOString().slice(0, 10);

    let form = '', archive = '';
    if (tab === 'daily') {
      form =
        '<h3>📝 تقرير يومي جديد</h3>' +
        '<label class="fl">التاريخ</label><input class="inp" id="dr-date" type="date" value="' + today + '">' +
        '<div class="grid g2"><div><label class="fl">الطقس</label><input class="inp" id="dr-weather" placeholder="مشمس 40°"></div>' +
        '<div><label class="fl">العمالة</label><input class="inp num" id="dr-manpower" type="number" placeholder="150"></div></div>' +
        '<label class="fl">المعدات</label><input class="inp" id="dr-equipment" placeholder="رافعة برجية 2...">' +
        '<label class="fl">الأعمال المنفذة (سطر لكل عمل)</label><textarea class="inp" id="dr-works" rows="5" placeholder="صب خرسانة...\nلياسة..."></textarea>' +
        '<label class="fl">الصور من الموقع</label><input class="inp" id="dr-photos" type="file" multiple accept="image/*">' +
        '<label class="fl">الملفات الداعمة (PDF / Excel)</label><input class="inp" id="dr-files" type="file" multiple accept=".pdf,.xlsx,.xls,.doc,.docx">' +
        '<div class="m-actions"><button class="btn block" id="dr-save">حفظ التقرير اليومي</button></div>';
      archive =
        '<h3>🗄️ أرشيف التقارير اليومية</h3>' +
        ctx.S.dailyReports.map(function (r) {
          return '<div style="border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px;background:var(--bg2)">' +
            '<div class="flex" style="justify-content:space-between"><b class="num">' + esc(r.date) + '</b><span class="small muted">عمالة: ' + r.manpower + ' · 📎 ' + ((r.photos || []).length + (r.attachments || []).length) + '</span></div>' +
            '<div class="small" style="margin-top:6px;color:#c6cdda">' + (r.works || []).map(esc).join(' • ') + '</div></div>';
        }).join('');
    } else if (tab === 'weekly') {
      form =
        '<h3>🗓️ تقرير أسبوعي جديد</h3>' +
        '<label class="fl">أسبوع يبدأ من</label><input class="inp" id="wr-week" type="date" value="' + today + '">' +
        '<label class="fl">العنوان</label><input class="inp" id="wr-title" placeholder="التقرير الأسبوعي - الأسبوع ...">' +
        '<div class="grid g2"><div><label class="fl">الإنجاز الفعلي %</label><input class="inp num" id="wr-actual" type="number" min="0" max="100"></div>' +
        '<div><label class="fl">الإنجاز المخطط %</label><input class="inp num" id="wr-planned" type="number" min="0" max="100"></div></div>' +
        '<label class="fl">ملخص الأسبوع</label><textarea class="inp" id="wr-summary" rows="3"></textarea>' +
        '<label class="fl">أبرز الإنجازات (سطر لكل بند)</label><textarea class="inp" id="wr-ach" rows="3"></textarea>' +
        '<label class="fl">المعوقات (سطر لكل بند)</label><textarea class="inp" id="wr-iss" rows="2"></textarea>' +
        '<label class="fl">الصور</label><input class="inp" id="wr-photos" type="file" multiple accept="image/*">' +
        '<label class="fl">المرفقات</label><input class="inp" id="wr-files" type="file" multiple>' +
        '<div class="m-actions"><button class="btn block" id="wr-save">حفظ التقرير الأسبوعي</button></div>';
      archive =
        '<h3>🗄️ أرشيف التقارير الأسبوعية</h3>' +
        (ctx.S.weeklyReports || []).map(function (r) {
          return '<div style="border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px;background:var(--bg2)">' +
            '<div class="flex" style="justify-content:space-between"><b>' + esc(r.title) + '</b>' +
            '<span class="pill ' + (r.progressActual < r.progressPlanned - 3 ? 'p-danger' : 'p-ok') + ' num">' + r.progressActual + '% / ' + r.progressPlanned + '%</span></div>' +
            '<div class="small" style="margin-top:6px;color:#c6cdda">' + esc(r.summary || '') + '</div>' +
            '<div class="small muted" style="margin-top:6px">📎 ' + ((r.photos || []).length + (r.attachments || []).length) + ' مرفقات</div></div>';
        }).join('');
    } else {
      form =
        '<h3>📊 تقرير شهري جديد</h3>' +
        '<label class="fl">الشهر</label><input class="inp num" id="mr-month" type="month" value="' + today.slice(0, 7) + '">' +
        '<label class="fl">العنوان</label><input class="inp" id="mr-title" placeholder="التقرير الشهري - ...">' +
        '<div class="grid g2"><div><label class="fl">الإنجاز الفعلي %</label><input class="inp num" id="mr-actual" type="number" min="0" max="100"></div>' +
        '<div><label class="fl">الإنجاز المخطط %</label><input class="inp num" id="mr-planned" type="number" min="0" max="100"></div></div>' +
        '<label class="fl">الملخص التنفيذي</label><textarea class="inp" id="mr-summary" rows="5"></textarea>' +
        '<label class="fl">الصور والمرفقات</label><input class="inp" id="mr-files" type="file" multiple>' +
        '<div class="m-actions"><button class="btn block" id="mr-save">حفظ التقرير الشهري</button></div>';
      archive =
        '<h3>🗄️ أرشيف التقارير الشهرية</h3>' +
        ctx.S.monthlyReports.map(function (r) {
          return '<div style="border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px;background:var(--bg2)">' +
            '<div class="flex" style="justify-content:space-between"><b>' + esc(r.title) + '</b>' +
            '<span class="pill ' + (r.progressActual < r.progressPlanned - 3 ? 'p-danger' : 'p-ok') + ' num">' + r.progressActual + '% / ' + r.progressPlanned + '%</span></div>' +
            '<div class="small" style="margin-top:6px;color:#c6cdda">' + esc(r.summary || '') + '</div></div>';
        }).join('');
    }

    el.innerHTML =
      '<div class="tabs">' +
      '<div class="tab ' + (tab === 'daily' ? 'active' : '') + '" data-rtab="daily">📝 يومي</div>' +
      '<div class="tab ' + (tab === 'weekly' ? 'active' : '') + '" data-rtab="weekly">🗓️ أسبوعي</div>' +
      '<div class="tab ' + (tab === 'monthly' ? 'active' : '') + '" data-rtab="monthly">📊 شهري</div>' +
      '</div>' +
      '<div class="grid" style="grid-template-columns:1fr 1.2fr">' +
      '<div class="card">' + form + '</div>' +
      '<div class="card">' + archive + '</div></div>';

    el.querySelectorAll('[data-rtab]').forEach(function (t) {
      t.addEventListener('click', function () { rptState.tab = t.getAttribute('data-rtab'); renderDailyReport(el, ctx); });
    });

    const dSave = el.querySelector('#dr-save');
    if (dSave) dSave.addEventListener('click', async function () {
      try {
        await Api.create('dailyReports', {
          date: el.querySelector('#dr-date').value,
          weather: el.querySelector('#dr-weather').value || '—',
          manpower: Number(el.querySelector('#dr-manpower').value) || 0,
          equipment: el.querySelector('#dr-equipment').value || '—',
          works: el.querySelector('#dr-works').value.split('\n').filter(Boolean),
          photos: await filesOf(el, '#dr-photos'), attachments: await filesOf(el, '#dr-files'),
          by: ctx.U.name
        });
        toast('✅ حُفظ التقرير اليومي'); ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });

    const wSave = el.querySelector('#wr-save');
    if (wSave) wSave.addEventListener('click', async function () {
      const title = el.querySelector('#wr-title').value.trim();
      if (!title) { toast('أدخل عنوان التقرير', true); return; }
      try {
        await Api.create('weeklyReports', {
          weekOf: el.querySelector('#wr-week').value, title: title,
          progressActual: Number(el.querySelector('#wr-actual').value) || 0,
          progressPlanned: Number(el.querySelector('#wr-planned').value) || 0,
          summary: el.querySelector('#wr-summary').value,
          achievements: el.querySelector('#wr-ach').value.split('\n').filter(Boolean),
          issues: el.querySelector('#wr-iss').value.split('\n').filter(Boolean),
          photos: await filesOf(el, '#wr-photos'), attachments: await filesOf(el, '#wr-files'),
          by: ctx.U.name
        });
        toast('✅ حُفظ التقرير الأسبوعي'); ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });

    const mSave = el.querySelector('#mr-save');
    if (mSave) mSave.addEventListener('click', async function () {
      const title = el.querySelector('#mr-title').value.trim();
      if (!title) { toast('أدخل عنوان التقرير', true); return; }
      try {
        await Api.create('monthlyReports', {
          month: el.querySelector('#mr-month').value, title: title,
          progressActual: Number(el.querySelector('#mr-actual').value) || 0,
          progressPlanned: Number(el.querySelector('#mr-planned').value) || 0,
          summary: el.querySelector('#mr-summary').value,
          attachments: await filesOf(el, '#mr-files'),
          by: ctx.U.name
        });
        toast('✅ حُفظ التقرير الشهري'); ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });
  }

  // ============ ممثل المالك: المشاريع والاستشاريين ============
  function renderRepProjects(el, ctx) {
    el.innerHTML =
      '<div class="grid" style="grid-template-columns:1.2fr 1fr">' +
      '<div class="card"><h3>🏗️ مشاريع المالك <span class="hint">اضغط "فتح" للتنقل بين المشاريع — أو استخدم مبدّل المشروع أعلى الشاشة</span></h3>' +
      (ctx.Sall || ctx.S).projects.map(function (p) {
        const active = ctx.projectId === p.id;
        return '<div style="border:1px solid ' + (active ? 'var(--accent)' : 'var(--border)') + ';border-radius:12px;padding:16px;margin-bottom:10px;background:var(--bg2)">' +
          '<div class="flex" style="justify-content:space-between"><b style="font-size:16px">' + esc(p.name) + '</b>' +
          '<div class="flex">' + (active ? '<span class="pill p-ok">المشروع الحالي</span>' : '<button class="btn sm" data-open-proj="' + p.id + '">فتح المشروع ←</button>') +
          '<span class="pill p-info num">' + (p.progressActual || 0) + '%</span></div></div>' +
          '<div class="small muted" style="margin:6px 0">' + esc(p.location || '—') + ' · الميزانية ' + VS.millions(p.budgetPlanned || 0) + '</div>' +
          '<div class="small">👨‍💼 الاستشاري: <b>' + esc(p.consultantName || 'لم يعيّن') + '</b></div></div>';
      }).join('') + '</div>' +

      '<div class="card"><h3>➕ إضافة مشروع وتعيين استشاري</h3>' +
      '<label class="fl">اسم المشروع</label><input class="inp" id="np-name" placeholder="برج / فيلا / مجمع...">' +
      '<label class="fl">الموقع</label><input class="inp" id="np-loc" placeholder="المدينة - الحي">' +
      '<div class="grid g2"><div><label class="fl">تاريخ البدء</label><input class="inp" id="np-start" type="date"></div>' +
      '<div><label class="fl">تاريخ الانتهاء</label><input class="inp" id="np-end" type="date"></div></div>' +
      '<label class="fl">الميزانية التقديرية (ر.س)</label><input class="inp num" id="np-budget" type="number" placeholder="10000000">' +
      '<label class="fl">المكتب الاستشاري</label><input class="inp" id="np-cons" placeholder="اسم المكتب الهندسي">' +
      '<div class="grid g2"><div><label class="fl">اسم مستخدم الاستشاري</label><input class="inp" id="np-user" placeholder="consult-x"></div>' +
      '<div><label class="fl">كلمة المرور</label><input class="inp" id="np-pass" placeholder="تلقائية إن تُركت"></div></div>' +
      '<div class="m-actions"><button class="btn block" id="np-save">إنشاء المشروع وحساب الاستشاري</button></div></div></div>';

    el.querySelector('#np-save').addEventListener('click', async function () {
      const name = el.querySelector('#np-name').value.trim();
      if (!name) { toast('أدخل اسم المشروع', true); return; }
      try {
        const res = await Api.addProject({
          name: name, location: el.querySelector('#np-loc').value,
          startPlanned: el.querySelector('#np-start').value, endPlanned: el.querySelector('#np-end').value,
          budgetPlanned: el.querySelector('#np-budget').value,
          consultantName: el.querySelector('#np-cons').value,
          consultantUsername: el.querySelector('#np-user').value.trim() || null,
          consultantPassword: el.querySelector('#np-pass').value || null,
          ownerName: ctx.S.projects[0].ownerName
        });
        if (res.account) {
          modal('<h3>✅ أُنشئ المشروع وحساب الاستشاري</h3><div class="m-sub">بيانات دخول الاستشاري:</div>' +
            '<div class="card" style="padding:16px"><div>👤 <b class="num">' + esc(res.account.username) + '</b></div>' +
            '<div class="mt">🔑 <b class="num">' + esc(res.account.password) + '</b></div></div>' +
            '<div class="m-actions"><button class="btn" onclick="this.closest(\'.modal-back\').remove()">تم</button></div>');
        } else toast('✅ أُنشئ المشروع — استخدم زر "فتح المشروع" أو المبدّل أعلى الشاشة للانتقال إليه');
        ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });
    el.querySelectorAll('[data-open-proj]').forEach(function (b) {
      b.addEventListener('click', function () {
        ctx.setProject(b.getAttribute('data-open-proj'));
        ctx.nav('dashboard');
      });
    });
  }

  // ============ إدارة المستخدمين ============
  const ROLE_NAMES = {
    admin: 'مدير النظام', owner: 'المالك', owner_rep: 'ممثل المالك',
    consultant: 'الاستشاري', contractor: 'مقاول'
  };

  // وصف صلاحيات كل دور (يظهر عند اختيار الدور وفي مصفوفة الصلاحيات)
  const ROLE_META = {
    owner: {
      icon: '👁', color: 'p-info',
      desc: 'مالك المشروع: اطلاع فقط على مشروعه المسند إليه — عين المالك، رؤية المشروع، الكاميرات، المقاولون، ذكاء بصير، التقارير. لا يضيف ولا يعدل شيئاً.',
      scope: 'project'
    },
    owner_rep: {
      icon: '🧑‍💼', color: 'p-info',
      desc: 'ممثل المالك: يطلع على كامل ملفات ومعلومات جميع المشاريع + سجل النظام، ويضيف المشاريع ويعين الاستشاريين وينشئ المستخدمين ويرسل التقارير.',
      scope: 'all'
    },
    consultant: {
      icon: '📐', color: 'p-warn',
      desc: 'الاستشاري (المكتب الفني): الاعتمادات والتوقيع، خدمات المكتب الفني الـ12، جداول الكميات، إدارة المقاولين وحساباتهم، المخططات والنماذج، التقارير، الكاميرات والتكامل. يمكن قصره على مشاريع محددة.',
      scope: 'project-optional'
    },
    contractor: {
      icon: '👷', color: 'p-muted',
      desc: 'المقاول: يرى عقده وبنوده ومبالغه فقط، يرفع طلباته (مخططات، مواد، استلامات، مستخلصات، RFI...) ويتابع قراراتها، ويستقبل ما يوجهه له المكتب الفني.',
      scope: 'contractor'
    },
    admin: {
      icon: '⚙️', color: 'p-danger',
      desc: 'أدمن النظام: كل الصفحات والصلاحيات + إدارة المستخدمين والحذف + سجل النظام + التكامل والإعدادات.',
      scope: 'all'
    }
  };

  function userScopeLabel(ctx, u) {
    if (u.role === 'contractor') {
      const c = ctx.S.contractors.find(function (x) { return x.id === u.contractorId; });
      return c ? '🔗 ' + esc(c.name) : '<span class="muted">غير مربوط بمقاول!</span>';
    }
    if (u.projectIds && u.projectIds.length) {
      return '🏗️ ' + u.projectIds.map(function (pid) {
        const p = (ctx.Sall || ctx.S).projects.find(function (x) { return x.id === pid; });
        return esc(p ? p.name : pid);
      }).join('، ');
    }
    if (u.role === 'owner') return '<span class="pill p-warn">لم يُسند لمشروع!</span>';
    return '<span class="muted">جميع المشاريع</span>';
  }

  function renderUsers(el, ctx) {
    el.innerHTML =
      // مصفوفة الصلاحيات
      '<div class="card mb"><h3>🛡️ مستويات النظام وصلاحياتها</h3><div class="grid" style="grid-template-columns:repeat(5,1fr);gap:10px">' +
      ['owner', 'owner_rep', 'consultant', 'contractor', 'admin'].map(function (r) {
        const m = ROLE_META[r];
        return '<div style="border:1px solid var(--border);border-radius:12px;padding:12px;background:var(--bg2)">' +
          '<div style="font-size:20px">' + m.icon + '</div><b class="small">' + esc(ROLE_NAMES[r]) + '</b>' +
          '<div class="small muted" style="margin-top:6px;line-height:1.8;font-size:11px">' + esc(m.desc) + '</div></div>';
      }).join('') + '</div></div>' +

      '<div class="grid" style="grid-template-columns:1.4fr 1fr">' +
      '<div class="card"><h3>👥 مستخدمو النظام <span class="hint">كلمات المرور مشفرة ولا تظهر لأحد</span></h3>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
      '<th>الاسم</th><th>اسم المستخدم</th><th>الدور</th><th>النطاق</th><th></th></tr></thead><tbody>' +
      (ctx.S.users || []).map(function (u) {
        const m = ROLE_META[u.role] || { icon: '👤', color: 'p-muted' };
        return '<tr><td><b>' + esc(u.name) + '</b></td><td class="num">' + esc(u.username) + '</td>' +
          '<td><span class="pill ' + m.color + '">' + m.icon + ' ' + esc(ROLE_NAMES[u.role] || u.role) + '</span></td>' +
          '<td class="small">' + userScopeLabel(ctx, u) + '</td>' +
          '<td>' + (u.username !== 'admin' && u.id !== ctx.U.id ? '<button class="btn danger sm" data-del="' + u.id + '">حذف</button>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></div></div>' +

      '<div class="card"><h3>➕ إضافة مستخدم</h3>' +
      '<label class="fl">الدور</label><select class="inp" id="nu-role">' +
      ['owner', 'owner_rep', 'consultant', 'contractor', 'admin'].map(function (r) {
        return '<option value="' + r + '">' + ROLE_META[r].icon + ' ' + ROLE_NAMES[r] + '</option>';
      }).join('') + '</select>' +
      '<div class="small muted" id="nu-desc" style="margin-top:8px;line-height:1.8"></div>' +
      '<label class="fl">الاسم الكامل</label><input class="inp" id="nu-name" placeholder="م. فلان الفلاني">' +
      '<label class="fl">اسم المستخدم</label><input class="inp num" id="nu-user" placeholder="username" dir="ltr">' +
      '<label class="fl">كلمة المرور (اتركها فارغة للتوليد التلقائي)</label><input class="inp num" id="nu-pass" placeholder="••••••••" dir="ltr">' +
      '<div id="nu-scope"></div>' +
      '<div class="m-actions"><button class="btn block" id="nu-save">إنشاء المستخدم وتسليم بياناته</button></div></div></div>';

    const roleSel = el.querySelector('#nu-role');
    const scopeBox = el.querySelector('#nu-scope');
    const descBox = el.querySelector('#nu-desc');

    function drawScope() {
      const r = roleSel.value;
      descBox.textContent = ROLE_META[r].desc;
      if (r === 'contractor') {
        scopeBox.innerHTML = '<label class="fl">ربط بالمقاول</label><select class="inp" id="nu-cont">' +
          ctx.S.contractors.map(function (c) { return '<option value="' + c.id + '">' + esc(c.name) + '</option>'; }).join('') + '</select>';
      } else if (r === 'owner' || r === 'consultant') {
        scopeBox.innerHTML = '<label class="fl">' + (r === 'owner' ? 'مشروع المالك (يرى صفحة مشروعه فقط)' : 'المشاريع المسندة (اتركها كلها فارغة = جميع المشاريع)') + '</label>' +
          (ctx.Sall || ctx.S).projects.map(function (p) {
            return '<label class="fl flex" style="cursor:pointer;margin:4px 0"><input type="checkbox" class="nu-proj" value="' + p.id + '"' +
              (r === 'owner' && (ctx.Sall || ctx.S).projects.length === 1 ? ' checked' : '') + '> 🏗️ ' + esc(p.name) + '</label>';
          }).join('');
      } else {
        scopeBox.innerHTML = '';
      }
    }
    drawScope();
    roleSel.addEventListener('change', drawScope);

    el.querySelector('#nu-save').addEventListener('click', async function () {
      const role = roleSel.value;
      const name = el.querySelector('#nu-name').value.trim();
      const username = el.querySelector('#nu-user').value.trim();
      if (!name || !username) { toast('أدخل الاسم واسم المستخدم', true); return; }
      const data = {
        name: name, username: username,
        password: el.querySelector('#nu-pass').value || Math.random().toString(36).slice(2, 10),
        role: role
      };
      const contSel = el.querySelector('#nu-cont');
      if (contSel) data.contractorId = contSel.value;
      const projChecks = el.querySelectorAll('.nu-proj:checked');
      if (projChecks.length) data.projectIds = Array.prototype.map.call(projChecks, function (c) { return c.value; });
      if (role === 'owner' && !data.projectIds) { toast('حدد مشروع المالك — المالك يرى صفحة مشروعه', true); return; }
      try {
        const created = await Api.create('users', data);
        modal('<h3>✅ أُنشئ الحساب — سلّم هذه البيانات لصاحبها</h3>' +
          '<div class="m-sub">كلمة المرور تظهر الآن مرة واحدة فقط ولا يمكن استرجاعها لاحقاً (مشفرة في النظام)</div>' +
          '<div class="card" style="padding:16px">' +
          '<div>' + ROLE_META[role].icon + ' <b>' + esc(name) + '</b> — ' + esc(ROLE_NAMES[role]) + '</div>' +
          '<div class="mt">👤 اسم المستخدم: <b class="num">' + esc(username) + '</b></div>' +
          '<div class="mt">🔑 كلمة المرور: <b class="num">' + esc(created.password || data.password) + '</b></div></div>' +
          '<div class="m-actions"><button class="btn" onclick="this.closest(\'.modal-back\').remove()">تم التسليم</button></div>');
        ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });

    el.querySelectorAll('[data-del]').forEach(function (b) {
      b.addEventListener('click', async function () {
        if (!confirm('حذف هذا المستخدم؟')) return;
        try { await Api.remove('users', b.getAttribute('data-del')); toast('حُذف المستخدم'); ctx.refresh(); }
        catch (e) { toast(e.message, true); }
      });
    });
  }

  // ============ سجل النظام (Audit Log) ============
  const AUDIT_ACTIONS = {
    login: ['🔑', 'دخول', 'p-info'], create: ['➕', 'إضافة', 'p-ok'],
    update: ['✏️', 'تعديل', 'p-warn'], delete: ['🗑️', 'حذف', 'p-danger'],
    review: ['✍️', 'قرار اعتماد', 'p-info'], send: ['📨', 'إرسال تقرير', 'p-ok'],
    upload: ['📎', 'رفع ملف', 'p-muted'], snapshot: ['📸', 'لقطة كاميرا', 'p-muted']
  };
  const auditState = { filter: 'all', q: '' };

  function renderAudit(el, ctx) {
    const log = ctx.S.auditLog || [];
    const filtered = log.filter(function (a) {
      if (auditState.filter !== 'all' && a.action !== auditState.filter) return false;
      if (auditState.q && (a.userName + ' ' + a.target).indexOf(auditState.q) === -1) return false;
      return true;
    });

    el.innerHTML =
      '<div class="card"><div class="flex" style="justify-content:space-between;flex-wrap:wrap;margin-bottom:12px">' +
      '<h3 style="margin:0">📜 سجل النظام <span class="hint">توثيق كامل: من فعل ماذا ومتى — ' + log.length + ' حدث</span></h3>' +
      '<input class="inp" id="au-q" placeholder="🔍 بحث بالاسم أو العملية..." style="max-width:260px" value="' + esc(auditState.q) + '"></div>' +
      '<div class="tabs">' +
      '<div class="tab ' + (auditState.filter === 'all' ? 'active' : '') + '" data-af="all">الكل</div>' +
      Object.keys(AUDIT_ACTIONS).map(function (k) {
        const n = log.filter(function (a) { return a.action === k; }).length;
        if (!n) return '';
        return '<div class="tab ' + (auditState.filter === k ? 'active' : '') + '" data-af="' + k + '">' +
          AUDIT_ACTIONS[k][0] + ' ' + AUDIT_ACTIONS[k][1] + ' <span class="muted num">' + n + '</span></div>';
      }).join('') + '</div>' +
      (filtered.length ?
        '<div class="tbl-wrap" style="max-height:65vh;overflow-y:auto"><table class="tbl"><thead><tr>' +
        '<th>الوقت</th><th>المستخدم</th><th>الدور</th><th>العملية</th><th>التفاصيل</th></tr></thead><tbody>' +
        filtered.map(function (a) {
          const m = AUDIT_ACTIONS[a.action] || ['•', a.action, 'p-muted'];
          return '<tr><td class="small muted num" style="white-space:nowrap">' + esc(a.time) + '</td>' +
            '<td class="small"><b>' + esc(a.userName) + '</b></td>' +
            '<td class="small">' + esc(ROLE_NAMES[a.role] || a.role) + '</td>' +
            '<td><span class="pill ' + m[2] + '">' + m[0] + ' ' + m[1] + '</span></td>' +
            '<td class="small">' + esc(a.target) + '</td></tr>';
        }).join('') + '</tbody></table></div>'
        : '<div class="empty"><div class="e-ico">📜</div>لا أحداث مطابقة</div>') +
      '</div>';

    el.querySelectorAll('[data-af]').forEach(function (t) {
      t.addEventListener('click', function () { auditState.filter = t.getAttribute('data-af'); renderAudit(el, ctx); });
    });
    const q = el.querySelector('#au-q');
    q.addEventListener('input', function () {
      auditState.q = q.value.trim();
      renderAudit(el, ctx);
      const q2 = el.querySelector('#au-q'); q2.focus(); q2.setSelectionRange(q2.value.length, q2.value.length);
    });
  }

  // ============ رفع BIM وربط الكميات (الاستشاري) ============
  function renderBimUpload(el, ctx) {
    const P = ctx.S.projects[0];
    el.innerHTML =
      '<div class="grid g2">' +
      '<div class="card"><h3>🏢 رفع نموذج BIM</h3>' +
      '<div class="m-sub">ارفع نموذج المشروع (IFC / RVT / NWD) ليُعرض للمالك في صفحة "رؤية المشروع" مربوطاً بجدول الكميات.</div>' +
      '<label class="fl">ملف النموذج</label><input class="inp" id="bim-file" type="file" accept=".ifc,.rvt,.nwd,.nwc">' +
      '<label class="fl">إصدار النموذج</label><input class="inp" id="bim-rev" placeholder="Rev-04 - يوليو 2026" value="Rev-04 - يوليو 2026">' +
      '<div class="m-actions"><button class="btn block" id="bim-up">رفع النموذج وربطه بجدول الكميات</button></div>' +
      '<div class="sig">النموذج الحالي: BassirTower_Rev03.ifc · رُفع 2026-06-12 · مرتبط بـ <b class="num">' + ctx.S.boqItems.length + '</b> بند</div></div>' +

      '<div class="card"><h3>🔗 حالة ربط جدول الكميات بالنموذج</h3>' +
      P.disciplines.map(function (d) {
        const n = ctx.S.boqItems.filter(function (b) { return b.discipline === d.id; }).length;
        return '<div class="flex" style="justify-content:space-between;border-bottom:1px solid rgba(34,44,64,.5);padding:10px 2px">' +
          '<span>' + d.icon + ' ' + esc(d.name) + '</span>' +
          '<span class="small"><b class="num">' + n + '</b> بند مربوط <span class="pill p-ok">✓</span></span></div>';
      }).join('') +
      '<div class="small muted mt">💡 كل بند كميات مربوط بعناصر النموذج، فيتلوّن العنصر ساطعاً في عرض المالك عند اكتمال البند واعتماد مستخلصه.</div></div></div>' +

      '<div class="card mt"><h3>📐 سجل مخططات المشروع <span class="hint">كل مخطط يرتبط بدور وتخصص وجدول كمياته — فيظهر داكناً/ساطعاً للمالك حسب التنفيذ</span></h3>' +
      '<div class="grid" style="grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:14px">' +
      '<div><label class="fl">المرجع</label><input class="inp num" id="pd-ref" placeholder="A-103"></div>' +
      '<div style="grid-column:span 2"><label class="fl">اسم المخطط</label><input class="inp" id="pd-title" placeholder="المسقط المعماري - ..."></div>' +
      '<div><label class="fl">الدور</label><select class="inp" id="pd-floor">' +
      P.floors.map(function (f) { return '<option value="' + f.id + '">' + esc(f.name) + '</option>'; }).join('') +
      '<option value="ELEV">الواجهات</option></select></div>' +
      '<div><label class="fl">التخصص</label><select class="inp" id="pd-disc">' +
      P.disciplines.map(function (d) { return '<option value="' + d.id + '">' + d.icon + ' ' + esc(d.name) + '</option>'; }).join('') + '</select></div>' +
      '<div><label class="fl">الملف</label><input class="inp" id="pd-file" type="file" accept=".dwg,.dxf,.pdf"></div>' +
      '</div>' +
      '<button class="btn sm mb" id="pd-add">➕ رفع المخطط وربطه بجدول الكميات</button>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>المرجع</th><th>المخطط</th><th>الدور</th><th>التخصص</th><th>التاريخ</th><th>الربط</th></tr></thead><tbody>' +
      (ctx.S.planDrawings || []).map(function (dr) {
        const d = discOf(ctx, dr.discipline);
        return '<tr><td class="num small"><b>' + esc(dr.ref) + '</b></td><td>' + esc(dr.title) + '<div class="small muted">📎 ' + esc(dr.file || '') + '</div></td>' +
          '<td class="small">' + (dr.floor === 'ELEV' ? 'الواجهات' : esc(VS.floorName(ctx, dr.floor))) + '</td>' +
          '<td class="small">' + d.icon + ' ' + esc(d.name) + '</td>' +
          '<td class="small muted num">' + esc(dr.date || '') + '</td>' +
          '<td><span class="pill p-ok">مربوط بجدول الكميات ✓</span></td></tr>';
      }).join('') + '</tbody></table></div></div>';

    el.querySelector('#bim-up').addEventListener('click', function () {
      const f = el.querySelector('#bim-file').files[0];
      if (!f) { toast('اختر ملف النموذج أولاً', true); return; }
      toast('✅ رُفع النموذج "' + f.name + '" وربط بجدول الكميات — أصبح مرئياً للمالك في صفحة رؤية المشروع');
    });

    el.querySelectorAll('[data-dview]').forEach(function (b) {
      b.addEventListener('click', function () {
        const dr = (ctx.S.planDrawings || []).find(function (x) { return x.id === b.getAttribute('data-dview'); });
        if (dr) window.DrawingViewer.open(ctx, 'planDrawings', dr, { canEdit: true, canReview: false });
      });
    });
    el.querySelector('#pd-add').addEventListener('click', async function () {
      const title = el.querySelector('#pd-title').value.trim();
      if (!title) { toast('أدخل اسم المخطط', true); return; }
      const f = el.querySelector('#pd-file').files[0];
      try {
        await Api.create('planDrawings', {
          ref: el.querySelector('#pd-ref').value || 'DWG-' + Math.floor(Math.random() * 900 + 100),
          title: title,
          floor: el.querySelector('#pd-floor').value,
          discipline: el.querySelector('#pd-disc').value,
          file: f ? f.name : '', by: ctx.U.name
        });
        toast('✅ رُفع المخطط وربط بجدول كميات الدور — سيظهر للمالك في رؤية المشروع');
        ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });
  }

  // ============ صفحات المقاول ============
  const CONT_TABS = APPROVAL_TABS.concat([
    { col: 'rfis', name: 'استفسارات RFI', icon: '❓' },
    { col: 'methodStatements', name: 'أساليب التنفيذ وITP', icon: '🧾' },
    { col: 'claims', name: 'المطالبات وEOT', icon: '⚖️' }
  ]);
  const contState = { tab: 'shopDrawings' };

  function renderContractorHome(el, ctx) {
    const c = ctx.S.contractors[0];
    if (!c) { el.innerHTML = '<div class="empty">لا يوجد عقد مرتبط بحسابك</div>'; return; }
    const sums = VS.summarize(ctx)[0];
    const d = discOf(ctx, c.type);
    const pendingAll = CONT_TABS.reduce(function (a, t) {
      return a + (ctx.S[t.col] || []).filter(function (x) { return x.status === 'pending' || x.status === 'open'; }).length;
    }, 0);

    el.innerHTML =
      '<div class="grid g4 mb">' +
      '<div class="card kpi"><div class="lbl">عقد ' + d.icon + ' ' + esc(d.name) + '</div><div class="val">' + VS.millions(c.contractValue) + '</div>' +
      '<div class="sub num">' + esc(c.startDate) + ' ← ' + esc(c.endDate) + '</div></div>' +
      '<div class="card kpi ' + (sums.delayed ? 'k-danger' : 'k-ok') + '"><div class="lbl">نسبة الإنجاز</div><div class="val num">' + sums.progress + '%</div>' +
      '<div class="sub">المخطط <b class="num">' + sums.plannedProgress + '%</b>' + (sums.delayed ? ' · <span class="trend-down">متأخر</span>' : ' · <span class="trend-up">ضمن الجدول</span>') + '</div></div>' +
      '<div class="card kpi k-info"><div class="lbl">المبالغ المستلمة</div><div class="val">' + VS.millions(c.amountReceived) + '</div>' +
      '<div class="sub num">' + Math.round(c.amountReceived / c.contractValue * 100) + '% من قيمة العقد</div></div>' +
      '<div class="card kpi k-warn"><div class="lbl">طلبات قيد المراجعة</div><div class="val num">' + pendingAll + '</div><div class="sub">لدى الاستشاري</div></div>' +
      '</div>' +

      '<div class="tabs">' + CONT_TABS.map(function (t) {
        const pending = (ctx.S[t.col] || []).filter(function (x) { return x.status === 'pending' || x.status === 'open'; }).length;
        return '<div class="tab ' + (contState.tab === t.col ? 'active' : '') + '" data-ctab="' + t.col + '">' + t.icon + ' ' + t.name +
          (pending ? '<span class="n">' + pending + '</span>' : '') + '</div>';
      }).join('') + '</div>' +

      '<div class="card mb"><div class="flex" style="justify-content:space-between;margin-bottom:12px">' +
      '<h3 style="margin:0">' + (CONT_TABS.find(function (t) { return t.col === contState.tab; }) || {}).name + '</h3>' +
      '<button class="btn sm" id="ct-new">➕ رفع طلب جديد</button></div>' +
      renderContractorList(ctx) + '</div>' +

      renderTechInbox(ctx);

    el.querySelectorAll('[data-ctab]').forEach(function (t) {
      t.addEventListener('click', function () { contState.tab = t.getAttribute('data-ctab'); renderContractorHome(el, ctx); });
    });
    el.querySelector('#ct-new').addEventListener('click', function () { openSubmitModal(ctx); });
    // المقاول يفتح المخطط ويرى ترميز الاستشاري وملاحظاته (قراءة فقط)
    el.querySelectorAll('[data-dview]').forEach(function (b) {
      b.addEventListener('click', function () {
        const it = (ctx.S[contState.tab] || []).find(function (x) { return x.id === b.getAttribute('data-dview'); });
        if (it) window.DrawingViewer.open(ctx, contState.tab, it, { canEdit: false, canReview: false });
      });
    });
  }

  function renderContractorList(ctx) {
    const tab = contState.tab;
    const items = (ctx.S[tab] || []).slice().reverse();
    if (!items.length) return '<div class="empty"><div class="e-ico">📭</div>لا طلبات بعد — ارفع أول طلب</div>';
    const hasAmount = tab === 'changeOrders' || tab === 'payments' || tab === 'claims';
    return '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>المرجع</th><th>العنوان</th>' +
      (hasAmount ? '<th>القيمة</th>' : '') +
      '<th>التاريخ</th><th>الحالة</th><th>رد الاستشاري</th></tr></thead><tbody>' +
      items.map(function (it) {
        const reply = tab === 'rfis' ? it.answer : it.notes;
        return '<tr><td class="num small"><b>' + esc(it.ref) + '</b></td>' +
          '<td>' + esc(it.title) + ' ' + window.DrawingViewer.btn(it) +
          (it.question ? '<div class="small muted" style="max-width:300px">' + esc(it.question) + '</div>' : '') +
          (it.kind === 'eot' ? '<div class="small muted num">تمديد +' + (it.days || 0) + ' يوم</div>' : '') +
          (it.kind === 'itp' ? '<div class="small muted">خطة فحص ITP</div>' : '') + '</td>' +
          (hasAmount ? '<td>' + money(it.amount) + '</td>' : '') +
          '<td class="small muted num">' + esc(it.date) + '</td><td>' + pill(it.status) + '</td>' +
          '<td class="small" style="max-width:240px">' + (reply ? esc(reply) : '<span class="muted">—</span>') +
          (it.signature ? '<div class="sig">✍️ ' + esc(it.signature) + ' · ' + esc(it.signDate) + '</div>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  /** ما يوجهه المكتب الفني للمقاول: NCR، تعليمات، ملاحظات، سلامة، اختبارات */
  function renderTechInbox(ctx) {
    const sections = [
      { col: 'ncrs', name: '🚫 تقارير عدم المطابقة الموجهة لك', line: function (it) { return esc(it.title) + (it.correctiveAction ? ' — <span style="color:var(--ok)">' + esc(it.correctiveAction) + '</span>' : ''); } },
      { col: 'siteInstructions', name: '📢 تعليمات موقعية', line: function (it) { return esc(it.title) + '<div class="small muted">' + esc(it.details || '') + '</div>'; } },
      { col: 'snags', name: '📌 ملاحظات التسليم المطلوب إغلاقها', line: function (it) { return esc(it.title) + ' <span class="small muted">(' + esc(VS.floorName(ctx, it.location)) + ')</span>'; } },
      { col: 'hseReports', name: '🦺 ملاحظات السلامة', line: function (it) { return esc(it.title); } },
      { col: 'materialTests', name: '🧪 نتائج اختبارات موادك', line: function (it) { return esc(it.title) + ' — <b class="num">' + esc(it.value || '') + '</b>'; }, statusKey: 'result' }
    ];
    const cards = sections.map(function (s) {
      const items = (ctx.S[s.col] || []);
      if (!items.length) return '';
      return '<div class="card"><h3>' + s.name + '</h3>' +
        items.map(function (it) {
          return '<div class="flex" style="justify-content:space-between;border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:8px;background:var(--bg2)">' +
            '<div class="small" style="flex:1">' + s.line(it) + '</div>' +
            '<div>' + pill(it[s.statusKey || 'status']) + '</div></div>';
        }).join('') + '</div>';
    }).filter(Boolean).join('');
    return cards ? '<h3 class="mb" style="margin-top:24px">📥 موجه إليك من المكتب الفني</h3><div class="grid g2">' + cards + '</div>' : '';
  }

  function openSubmitModal(ctx) {
    const tab = contState.tab;
    const meta = CONT_TABS.find(function (t) { return t.col === tab; });
    const needAmount = tab === 'changeOrders' || tab === 'payments' || tab === 'claims';
    const isPayment = tab === 'payments';
    const isWir = tab === 'wirs';
    const myBoq = ctx.S.boqItems;

    const m = modal(
      '<h3>➕ رفع ' + meta.name + '</h3>' +
      '<div class="m-sub">سيصل الطلب للاستشاري للمراجعة والاعتماد أو الرفض</div>' +
      '<label class="fl">رقم المرجع</label><input class="inp num" id="sb-ref" placeholder="REF-001">' +
      '<label class="fl">العنوان / الوصف</label><input class="inp" id="sb-title">' +
      (tab === 'rfis' ? '<label class="fl">نص الاستفسار الفني</label><textarea class="inp" id="sb-question" rows="3" placeholder="اشرح التعارض أو المعلومة المطلوبة مع ذكر رقم المخطط..."></textarea>' : '') +
      (tab === 'methodStatements' ? '<label class="fl">النوع</label><select class="inp" id="sb-kind"><option value="ms">أسلوب تنفيذ MS</option><option value="itp">خطة فحص ITP</option></select>' : '') +
      (tab === 'claims' ? '<label class="fl">نوع المطالبة</label><select class="inp" id="sb-kind"><option value="eot">تمديد مدة EOT</option><option value="cost">مطالبة مالية</option></select>' : '') +
      (needAmount ? '<label class="fl">القيمة (ر.س)</label><input class="inp num" id="sb-amount" type="number">' : '') +
      (tab === 'changeOrders' || tab === 'claims' ? '<label class="fl">الأيام الإضافية المطلوبة</label><input class="inp num" id="sb-days" type="number" value="0">' : '') +
      (isWir ? '<label class="fl">الموقع / الدور</label><select class="inp" id="sb-loc">' +
        ctx.S.projects[0].floors.map(function (f) { return '<option value="' + f.id + '">' + esc(f.name) + '</option>'; }).join('') + '</select>' : '') +
      (isPayment ?
        '<label class="fl">بنود المستخلص (اختر البند والنسبة المنجزة الجديدة)</label><div id="sb-lines"></div>' +
        '<button class="btn ghost sm" id="sb-addline">+ إضافة بند</button>' : '') +
      '<label class="fl">المرفقات (المخطط / الداتا شيت / المستندات)</label><input class="inp" id="sb-file" type="file" multiple>' +
      '<div class="m-actions"><button class="btn" id="sb-ok">إرسال للاستشاري</button><button class="btn mutedb" id="sb-cancel">إلغاء</button></div>'
    );

    if (isPayment) {
      const wrap = m.querySelector('#sb-lines');
      function addLine() {
        const r = document.createElement('div');
        r.className = 'grid'; r.style.cssText = 'grid-template-columns:2.2fr 1fr;gap:6px;margin-bottom:6px';
        r.innerHTML = '<select class="inp" data-lf="boqItemId">' +
          myBoq.map(function (b) { return '<option value="' + b.id + '">' + esc(b.description) + ' — ' + esc(b.floor) + ' (حالياً ' + b.progress + '%)</option>'; }).join('') +
          '</select><input class="inp num" data-lf="progress" type="number" min="0" max="100" placeholder="% الجديدة">';
        wrap.appendChild(r);
      }
      addLine();
      m.querySelector('#sb-addline').addEventListener('click', addLine);
    }

    m.querySelector('#sb-cancel').addEventListener('click', function () { m.remove(); });
    m.querySelector('#sb-ok').addEventListener('click', async function () {
      const data = {
        ref: m.querySelector('#sb-ref').value || 'REF-' + Math.floor(Math.random() * 900 + 100),
        title: m.querySelector('#sb-title').value
      };
      if (!data.title) { toast('أدخل عنوان الطلب', true); return; }
      if (needAmount) data.amount = Number(m.querySelector('#sb-amount').value) || 0;
      if (tab === 'changeOrders' || tab === 'claims') data.days = Number(m.querySelector('#sb-days').value) || 0;
      if (tab === 'rfis') data.question = m.querySelector('#sb-question').value;
      if (tab === 'methodStatements' || tab === 'claims') data.kind = m.querySelector('#sb-kind').value;
      if (isWir) data.location = m.querySelector('#sb-loc').value;
      const files = m.querySelector('#sb-file').files;
      if (files.length) data.file = await Api.upload(files[0]);
      if (isPayment) {
        data.lines = Array.prototype.map.call(m.querySelector('#sb-lines').children, function (r) {
          return {
            boqItemId: r.querySelector('[data-lf="boqItemId"]').value,
            progress: Number(r.querySelector('[data-lf="progress"]').value) || 0
          };
        }).filter(function (l) { return l.progress > 0; });
      }
      try {
        await Api.create(tab, data);
        m.remove();
        toast('✅ أُرسل الطلب للاستشاري');
        ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });
  }

  // ============ موديول المكتب الفني (خدمات استشاري المشروع) ============
  const HSE_KINDS = { violation: 'مخالفة سلامة', incident: 'حادث', observation: 'ملاحظة وقائية' };
  const SEVERITIES = { low: ['منخفضة', 'p-muted'], medium: ['متوسطة', 'p-warn'], high: ['عالية', 'p-danger'], minor: ['ثانوية', 'p-warn'], major: ['جوهرية', 'p-danger'], critical: ['حرجة', 'p-danger'] };
  const HND_KINDS = { asbuilt: 'مخططات كما نُفذ', om: 'كتيبات تشغيل وصيانة', warranty: 'شهادات ضمان', dlp: 'فترة الضمان DLP' };

  function sev(s) { const v = SEVERITIES[s] || [s, 'p-muted']; return '<span class="pill ' + v[1] + '">' + esc(v[0]) + '</span>'; }
  function sigCell(it) { return it.signature ? '<div class="sig">✍️ ' + esc(it.signature) + ' · ' + esc(it.signDate) + '</div>' : ''; }

  const TECH_TABS = [
    { col: 'rfis', name: 'الاستفسارات الفنية RFI', icon: '❓', desc: 'الرد على استفسارات المقاولين وحسم تعارضات المخططات والمواصفات',
      pendingOf: function (x) { return x.status === 'open'; },
      cols: [
        { h: 'الاستفسار', r: function (it) { return '<b>' + esc(it.title) + '</b><div class="small muted" style="max-width:340px">' + esc(it.question || '') + '</div>'; } },
        { h: 'الرد الفني', r: function (it) { return it.answer ? '<div class="small" style="max-width:300px;color:var(--ok)">' + esc(it.answer) + '</div>' + sigCell(it) : '<span class="muted small">بانتظار الرد</span>'; } }
      ],
      fields: [
        { k: 'contractorId', label: 'المقاول', type: 'contractor' }, { k: 'ref', label: 'المرجع', type: 'text' },
        { k: 'title', label: 'الموضوع', type: 'text' }, { k: 'question', label: 'نص الاستفسار', type: 'textarea' }
      ],
      action: function (ctx, it) {
        if (it.status !== 'open') return null;
        return { label: '↩️ رد فني', run: function () { answerModal(ctx, 'rfis', it, 'الرد الفني على الاستفسار', 'answer', { status: 'answered' }); } };
      } },

    { col: 'ncrs', name: 'عدم المطابقة NCR', icon: '🚫', desc: 'رصد الأعمال المخالفة للمواصفات ومتابعة الإجراءات التصحيحية حتى الإغلاق',
      pendingOf: function (x) { return x.status === 'open'; },
      cols: [
        { h: 'المخالفة', r: function (it) { return '<b>' + esc(it.title) + '</b><div class="small muted" style="max-width:320px">' + esc(it.description || '') + '</div>'; } },
        { h: 'الخطورة', r: function (it) { return sev(it.severity); } },
        { h: 'الإجراء التصحيحي', r: function (it) { return it.correctiveAction ? '<div class="small" style="max-width:280px">' + esc(it.correctiveAction) + '</div>' + sigCell(it) : '<span class="muted small">—</span>'; } }
      ],
      fields: [
        { k: 'contractorId', label: 'المقاول', type: 'contractor' }, { k: 'ref', label: 'المرجع', type: 'text' },
        { k: 'title', label: 'عنوان المخالفة', type: 'text' }, { k: 'description', label: 'وصف عدم المطابقة', type: 'textarea' },
        { k: 'severity', label: 'الخطورة', type: 'select', options: [['minor', 'ثانوية'], ['major', 'جوهرية'], ['critical', 'حرجة']] }
      ],
      action: function (ctx, it) {
        if (it.status !== 'open') return null;
        return { label: '✅ إغلاق', run: function () { answerModal(ctx, 'ncrs', it, 'الإجراء التصحيحي المنفذ', 'correctiveAction', { status: 'closed' }); } };
      } },

    { col: 'siteInstructions', name: 'التعليمات الموقعية', icon: '📢', desc: 'إصدار تعليمات ملزمة للمقاولين ومتابعة تنفيذها',
      pendingOf: function (x) { return x.status === 'issued'; },
      cols: [
        { h: 'التعليمات', r: function (it) { return '<b>' + esc(it.title) + '</b><div class="small muted" style="max-width:360px">' + esc(it.details || '') + '</div>' + sigCell(it); } }
      ],
      fields: [
        { k: 'contractorId', label: 'المقاول', type: 'contractor' }, { k: 'ref', label: 'المرجع', type: 'text' },
        { k: 'title', label: 'عنوان التعليمات', type: 'text' }, { k: 'details', label: 'التفاصيل', type: 'textarea' }
      ],
      action: function (ctx, it) {
        if (it.status !== 'issued') return null;
        return { label: '✔ تم التنفيذ', run: function () { quickUpdate(ctx, 'siteInstructions', it, { status: 'done' }); } };
      } },

    { col: 'methodStatements', name: 'أساليب التنفيذ وITP', icon: '🧾', desc: 'اعتماد بيانات طرق التنفيذ وخطط الفحص والاختبار المقدمة من المقاولين',
      pendingOf: function (x) { return x.status === 'pending'; },
      cols: [
        { h: 'النوع', r: function (it) { return '<span class="pill p-muted">' + (it.kind === 'itp' ? 'خطة فحص ITP' : 'أسلوب تنفيذ MS') + '</span>'; } },
        { h: 'العنوان', r: function (it) { return '<b>' + esc(it.title) + '</b>' + (it.file ? '<div class="small muted">📎 ' + VS.att(it.file) + '</div>' : ''); } },
        { h: 'الملاحظات', r: function (it) { return (it.notes ? '<div class="small">' + esc(it.notes) + '</div>' : '<span class="muted small">—</span>') + sigCell(it); } }
      ],
      fields: [
        { k: 'contractorId', label: 'المقاول', type: 'contractor' },
        { k: 'kind', label: 'النوع', type: 'select', options: [['ms', 'أسلوب تنفيذ MS'], ['itp', 'خطة فحص ITP']] },
        { k: 'ref', label: 'المرجع', type: 'text' }, { k: 'title', label: 'العنوان', type: 'text' }
      ],
      action: function (ctx, it) {
        if (it.status !== 'pending') return null;
        return { label: '✍️ قرار', run: function () { openReviewModal(ctx, 'methodStatements', it); } };
      } },

    { col: 'materialTests', name: 'اختبارات المواد', icon: '🧪', desc: 'توثيق نتائج الاختبارات المعملية والحقلية (خرسانة، تربة، ضغط، شد...)',
      pendingOf: function (x) { return x.result === 'fail'; },
      cols: [
        { h: 'الاختبار', r: function (it) { return '<b>' + esc(it.title) + '</b><div class="small muted">🏛️ ' + esc(it.lab || '') + '</div>'; } },
        { h: 'المطلوب / النتيجة', r: function (it) { return '<div class="small num">المطلوب: ' + esc(it.target || '—') + '</div><div class="small num"><b>النتيجة: ' + esc(it.value || '—') + '</b></div>' + (it.notes ? '<div class="small muted">' + esc(it.notes) + '</div>' : ''); } },
        { h: 'الحكم', r: function (it) { return pill(it.result); } }
      ],
      fields: [
        { k: 'contractorId', label: 'المقاول', type: 'contractor' }, { k: 'ref', label: 'المرجع', type: 'text' },
        { k: 'title', label: 'الاختبار', type: 'text' }, { k: 'lab', label: 'المختبر', type: 'text' },
        { k: 'target', label: 'القيمة المطلوبة', type: 'text' }, { k: 'value', label: 'النتيجة', type: 'text' },
        { k: 'result', label: 'الحكم', type: 'select', options: [['pass', 'ناجح'], ['fail', 'راسب']] },
        { k: 'notes', label: 'ملاحظات', type: 'textarea' }
      ],
      statusKey: 'result' },

    { col: 'meetings', name: 'محاضر الاجتماعات', icon: '🤝', desc: 'محاضر اجتماعات التنسيق الأسبوعية وقراراتها',
      pendingOf: function () { return false; }, noContractor: true, noStatus: true,
      cols: [
        { h: 'الاجتماع', r: function (it) { return '<b>' + esc(it.title) + '</b><div class="small muted">الحضور: ' + esc(it.attendees || '') + '</div>'; } },
        { h: 'أبرز البنود والقرارات', r: function (it) { return '<ul style="margin-right:16px;font-size:12.5px;line-height:1.9;max-width:380px">' + (it.items || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'; } }
      ],
      fields: [
        { k: 'ref', label: 'المرجع', type: 'text' }, { k: 'title', label: 'عنوان الاجتماع', type: 'text' },
        { k: 'date', label: 'التاريخ', type: 'date' }, { k: 'attendees', label: 'الحضور', type: 'text' },
        { k: 'items', label: 'البنود (سطر لكل بند)', type: 'lines' }
      ] },

    { col: 'snags', name: 'قوائم الملاحظات', icon: '📌', desc: 'ملاحظات الاستلام الابتدائي (Snag List) ومتابعة إغلاقها قبل التسليم',
      pendingOf: function (x) { return x.status === 'open'; },
      cols: [
        { h: 'الملاحظة', r: function (it) { return '<b>' + esc(it.title) + '</b>' + sigCell(it); } },
        { h: 'الموقع', r: function (it, ctx) { return '<span class="pill p-muted">' + esc(VS.floorName(ctx, it.location)) + '</span>'; } }
      ],
      fields: [
        { k: 'contractorId', label: 'المقاول', type: 'contractor' }, { k: 'ref', label: 'المرجع', type: 'text' },
        { k: 'title', label: 'وصف الملاحظة', type: 'text' }, { k: 'location', label: 'الموقع', type: 'floor' }
      ],
      action: function (ctx, it) {
        if (it.status !== 'open') return null;
        return { label: '✅ إغلاق', run: function () { quickUpdate(ctx, 'snags', it, { status: 'closed' }); } };
      } },

    { col: 'hseReports', name: 'السلامة HSE', icon: '🦺', desc: 'مخالفات وحوادث وملاحظات السلامة والصحة المهنية بالموقع',
      pendingOf: function (x) { return x.status === 'open'; },
      cols: [
        { h: 'النوع', r: function (it) { return '<span class="pill ' + (it.kind === 'incident' ? 'p-danger' : it.kind === 'violation' ? 'p-warn' : 'p-info') + '">' + esc(HSE_KINDS[it.kind] || it.kind) + '</span>'; } },
        { h: 'التقرير', r: function (it) { return '<b>' + esc(it.title) + '</b><div class="small muted" style="max-width:330px">' + esc(it.details || '') + '</div>' + sigCell(it); } },
        { h: 'الخطورة', r: function (it) { return sev(it.severity); } }
      ],
      fields: [
        { k: 'contractorId', label: 'المقاول', type: 'contractor' }, { k: 'ref', label: 'المرجع', type: 'text' },
        { k: 'kind', label: 'النوع', type: 'select', options: [['violation', 'مخالفة'], ['incident', 'حادث'], ['observation', 'ملاحظة وقائية']] },
        { k: 'title', label: 'العنوان', type: 'text' }, { k: 'details', label: 'التفاصيل', type: 'textarea' },
        { k: 'severity', label: 'الخطورة', type: 'select', options: [['low', 'منخفضة'], ['medium', 'متوسطة'], ['high', 'عالية']] }
      ],
      action: function (ctx, it) {
        if (it.status !== 'open') return null;
        return { label: '✅ إغلاق', run: function () { quickUpdate(ctx, 'hseReports', it, { status: 'closed' }); } };
      } },

    { col: 'claims', name: 'المطالبات وEOT', icon: '⚖️', desc: 'دراسة مطالبات المقاولين المالية وطلبات تمديد المدة والتوصية بشأنها',
      pendingOf: function (x) { return x.status === 'pending'; },
      cols: [
        { h: 'النوع', r: function (it) { return '<span class="pill p-muted">' + (it.kind === 'eot' ? 'تمديد مدة EOT' : 'مطالبة مالية') + '</span>'; } },
        { h: 'المطالبة', r: function (it) { return '<b>' + esc(it.title) + '</b>'; } },
        { h: 'القيمة / المدة', r: function (it) { return (it.amount ? '<div class="num small">' + money(it.amount) + '</div>' : '') + (it.days ? '<div class="num small">+' + it.days + ' يوم</div>' : ''); } },
        { h: 'القرار', r: function (it) { return (it.notes ? '<div class="small" style="max-width:240px">' + esc(it.notes) + '</div>' : '<span class="muted small">—</span>') + sigCell(it); } }
      ],
      fields: [
        { k: 'contractorId', label: 'المقاول', type: 'contractor' },
        { k: 'kind', label: 'النوع', type: 'select', options: [['eot', 'تمديد مدة EOT'], ['cost', 'مطالبة مالية']] },
        { k: 'ref', label: 'المرجع', type: 'text' }, { k: 'title', label: 'العنوان', type: 'text' },
        { k: 'days', label: 'الأيام المطلوبة', type: 'number' }, { k: 'amount', label: 'القيمة (ر.س)', type: 'number' }
      ],
      action: function (ctx, it) {
        if (it.status !== 'pending') return null;
        return { label: '✍️ قرار', run: function () { openReviewModal(ctx, 'claims', it); } };
      } },

    { col: 'valueEngineering', name: 'الهندسة القيمية', icon: '💡', desc: 'دراسة مقترحات خفض التكلفة مع الحفاظ على الجودة والوظيفة',
      pendingOf: function (x) { return x.status === 'pending'; },
      cols: [
        { h: 'المقترح', r: function (it) { return '<b>' + esc(it.title) + '</b><div class="small muted" style="max-width:320px">' + esc(it.details || '') + '</div>'; } },
        { h: 'الوفر المتوقع', r: function (it) { return '<b class="num" style="color:var(--ok)">' + money(it.saving) + '</b>'; } },
        { h: 'القرار', r: function (it) { return (it.notes ? '<div class="small">' + esc(it.notes) + '</div>' : '<span class="muted small">—</span>') + sigCell(it); } }
      ],
      fields: [
        { k: 'contractorId', label: 'المقاول', type: 'contractor' }, { k: 'ref', label: 'المرجع', type: 'text' },
        { k: 'title', label: 'المقترح', type: 'text' }, { k: 'saving', label: 'الوفر المتوقع (ر.س)', type: 'number' },
        { k: 'details', label: 'التفاصيل', type: 'textarea' }
      ],
      action: function (ctx, it) {
        if (it.status !== 'pending') return null;
        return { label: '✍️ قرار', run: function () { openReviewModal(ctx, 'valueEngineering', it); } };
      } },

    { col: 'handoverDocs', name: 'التسليم والإغلاق', icon: '📦', desc: 'مخططات كما نُفذ، كتيبات التشغيل والصيانة، الضمانات، ومتابعة فترة الضمان',
      pendingOf: function (x) { return x.status === 'pending'; },
      cols: [
        { h: 'النوع', r: function (it) { return '<span class="pill p-muted">' + esc(HND_KINDS[it.kind] || it.kind) + '</span>'; } },
        { h: 'المستند', r: function (it) { return '<b>' + esc(it.title) + '</b>' + (it.file ? '<div class="small muted">📎 ' + VS.att(it.file) + '</div>' : ''); } },
        { h: 'الملاحظات', r: function (it) { return (it.notes ? '<div class="small">' + esc(it.notes) + '</div>' : '<span class="muted small">—</span>') + sigCell(it); } }
      ],
      fields: [
        { k: 'contractorId', label: 'المقاول', type: 'contractor' },
        { k: 'kind', label: 'النوع', type: 'select', options: [['asbuilt', 'مخططات كما نُفذ'], ['om', 'كتيبات O&M'], ['warranty', 'شهادات ضمان'], ['dlp', 'ملاحظة فترة ضمان DLP']] },
        { k: 'ref', label: 'المرجع', type: 'text' }, { k: 'title', label: 'العنوان', type: 'text' }
      ],
      action: function (ctx, it) {
        if (it.status !== 'pending') return null;
        return { label: '✍️ قرار', run: function () { openReviewModal(ctx, 'handoverDocs', it); } };
      } },

    { col: 'correspondence', name: 'المراسلات', icon: '📮', desc: 'سجل الخطابات الصادرة والواردة الرسمية للمشروع',
      pendingOf: function () { return false; }, noContractor: true, noStatus: true,
      cols: [
        { h: 'الاتجاه', r: function (it) { return it.direction === 'out' ? '<span class="pill p-info">صادر ↗</span>' : '<span class="pill p-warn">وارد ↙</span>'; } },
        { h: 'الخطاب', r: function (it) { return '<b>' + esc(it.title) + '</b>'; } },
        { h: 'الجهة', r: function (it) { return '<div class="small">' + (it.from ? 'من: ' + esc(it.from) + '<br>' : '') + 'إلى: ' + esc(it.to || '—') + '</div>'; } }
      ],
      fields: [
        { k: 'ref', label: 'المرجع', type: 'text' },
        { k: 'direction', label: 'الاتجاه', type: 'select', options: [['out', 'صادر'], ['in', 'وارد']] },
        { k: 'to', label: 'الجهة', type: 'text' }, { k: 'title', label: 'الموضوع', type: 'text' }
      ] }
  ];

  const techState = { tab: 'rfis' };

  function quickUpdate(ctx, col, it, patch) {
    patch.signature = ctx.U.name;
    patch.signDate = new Date().toISOString().slice(0, 10);
    Api.update(col, it.id, patch)
      .then(function () { toast('✅ تم تحديث الحالة وتوقيعها'); ctx.refresh(); })
      .catch(function (e) { toast(e.message, true); });
  }

  function answerModal(ctx, col, it, label, key, extraPatch) {
    const m = modal(
      '<h3>' + esc(it.title) + '</h3>' +
      '<div class="m-sub">' + esc(it.ref) + ' · ' + esc(contractorName(ctx, it.contractorId)) + '</div>' +
      (it.question ? '<div class="card" style="padding:12px;margin-bottom:6px"><div class="small">' + esc(it.question) + '</div></div>' : '') +
      (it.description ? '<div class="card" style="padding:12px;margin-bottom:6px"><div class="small">' + esc(it.description) + '</div></div>' : '') +
      '<label class="fl">' + esc(label) + '</label><textarea class="inp" id="am-text" rows="4"></textarea>' +
      '<div class="m-actions"><button class="btn" id="am-ok">اعتماد وتوقيع</button><button class="btn mutedb" id="am-cancel">إلغاء</button></div>'
    );
    m.querySelector('#am-cancel').addEventListener('click', function () { m.remove(); });
    m.querySelector('#am-ok').addEventListener('click', function () {
      const txt = m.querySelector('#am-text').value.trim();
      if (!txt) { toast('اكتب النص أولاً', true); return; }
      const patch = Object.assign({}, extraPatch);
      patch[key] = txt;
      patch.signature = ctx.U.name;
      patch.signDate = new Date().toISOString().slice(0, 10);
      Api.update(col, it.id, patch)
        .then(function () { m.remove(); toast('✅ تم الاعتماد والتوقيع'); ctx.refresh(); })
        .catch(function (e) { toast(e.message, true); });
    });
  }

  function techAddModal(ctx, tabDef) {
    const m = modal(
      '<h3>➕ إضافة: ' + esc(tabDef.name) + '</h3>' +
      tabDef.fields.map(function (f) {
        const id = 'tf-' + f.k;
        if (f.type === 'contractor') return '<label class="fl">' + esc(f.label) + '</label><select class="inp" id="' + id + '">' +
          ctx.S.contractors.map(function (c) { return '<option value="' + c.id + '">' + esc(c.name) + '</option>'; }).join('') + '</select>';
        if (f.type === 'floor') return '<label class="fl">' + esc(f.label) + '</label><select class="inp" id="' + id + '">' +
          ctx.S.projects[0].floors.map(function (fl) { return '<option value="' + fl.id + '">' + esc(fl.name) + '</option>'; }).join('') + '</select>';
        if (f.type === 'select') return '<label class="fl">' + esc(f.label) + '</label><select class="inp" id="' + id + '">' +
          f.options.map(function (o) { return '<option value="' + o[0] + '">' + esc(o[1]) + '</option>'; }).join('') + '</select>';
        if (f.type === 'textarea' || f.type === 'lines') return '<label class="fl">' + esc(f.label) + '</label><textarea class="inp" id="' + id + '" rows="3"></textarea>';
        if (f.type === 'number') return '<label class="fl">' + esc(f.label) + '</label><input class="inp num" id="' + id + '" type="number">';
        if (f.type === 'date') return '<label class="fl">' + esc(f.label) + '</label><input class="inp" id="' + id + '" type="date" value="' + new Date().toISOString().slice(0, 10) + '">';
        return '<label class="fl">' + esc(f.label) + '</label><input class="inp" id="' + id + '">';
      }).join('') +
      '<div class="m-actions"><button class="btn" id="tf-ok">حفظ</button><button class="btn mutedb" id="tf-cancel">إلغاء</button></div>'
    );
    m.querySelector('#tf-cancel').addEventListener('click', function () { m.remove(); });
    m.querySelector('#tf-ok').addEventListener('click', function () {
      const data = {};
      tabDef.fields.forEach(function (f) {
        const v = m.querySelector('#tf-' + f.k).value;
        if (f.type === 'lines') data[f.k] = v.split('\n').filter(Boolean);
        else if (f.type === 'number') data[f.k] = Number(v) || 0;
        else data[f.k] = v;
      });
      if (!data.title) { toast('أدخل العنوان', true); return; }
      if (tabDef.col === 'meetings') data.by = ctx.U.name;
      if (tabDef.col === 'correspondence' && data.direction === 'out') data.by = ctx.U.name;
      Api.create(tabDef.col, data)
        .then(function () { m.remove(); toast('✅ تمت الإضافة'); ctx.refresh(); })
        .catch(function (e) { toast(e.message, true); });
    });
  }

  function renderTechOffice(el, ctx) {
    const t = TECH_TABS.find(function (x) { return x.col === techState.tab; }) || TECH_TABS[0];
    const items = (ctx.S[t.col] || []).slice().sort(function (a, b) {
      return (t.pendingOf(a) ? 0 : 1) - (t.pendingOf(b) ? 0 : 1);
    });

    // مؤشرات علوية سريعة
    const openRfis = (ctx.S.rfis || []).filter(function (x) { return x.status === 'open'; }).length;
    const openNcrs = (ctx.S.ncrs || []).filter(function (x) { return x.status === 'open'; }).length;
    const pendingDecisions = ['methodStatements', 'claims', 'valueEngineering', 'handoverDocs']
      .reduce(function (a, c) { return a + (ctx.S[c] || []).filter(function (x) { return x.status === 'pending'; }).length; }, 0);
    const openSnags = (ctx.S.snags || []).filter(function (x) { return x.status === 'open'; }).length;
    const failedTests = (ctx.S.materialTests || []).filter(function (x) { return x.result === 'fail'; }).length;
    const openHse = (ctx.S.hseReports || []).filter(function (x) { return x.status === 'open'; }).length;

    el.innerHTML =
      '<div class="grid g4 mb" style="grid-template-columns:repeat(6,1fr)">' +
      kpiMini('❓ استفسارات مفتوحة', openRfis, openRfis ? 'k-warn' : 'k-ok') +
      kpiMini('🚫 NCR مفتوحة', openNcrs, openNcrs ? 'k-danger' : 'k-ok') +
      kpiMini('✍️ قرارات معلقة', pendingDecisions, pendingDecisions ? 'k-warn' : 'k-ok') +
      kpiMini('📌 ملاحظات مفتوحة', openSnags, openSnags ? 'k-warn' : 'k-ok') +
      kpiMini('🧪 اختبارات راسبة', failedTests, failedTests ? 'k-danger' : 'k-ok') +
      kpiMini('🦺 سلامة مفتوحة', openHse, openHse ? 'k-danger' : 'k-ok') +
      '</div>' +

      '<div class="tabs">' + TECH_TABS.map(function (x) {
        const n = (ctx.S[x.col] || []).filter(x.pendingOf).length;
        return '<div class="tab ' + (techState.tab === x.col ? 'active' : '') + '" data-ttab="' + x.col + '">' + x.icon + ' ' + x.name +
          (n ? '<span class="n">' + n + '</span>' : '') + '</div>';
      }).join('') + '</div>' +

      '<div class="card"><div class="flex" style="justify-content:space-between;margin-bottom:4px">' +
      '<h3 style="margin:0">' + t.icon + ' ' + esc(t.name) + '</h3>' +
      '<button class="btn sm" id="tt-add">➕ إضافة</button></div>' +
      '<div class="small muted mb">' + esc(t.desc) + '</div>' +
      (items.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
        '<th>المرجع</th>' +
        (t.noContractor ? '' : '<th>المقاول</th>') +
        t.cols.map(function (c) { return '<th>' + esc(c.h) + '</th>'; }).join('') +
        '<th>التاريخ</th>' + (t.noStatus ? '' : '<th>الحالة</th>') + '<th></th></tr></thead><tbody>' +
        items.map(function (it, idx) {
          const act = t.action ? t.action(ctx, it) : null;
          return '<tr>' +
            '<td class="num small"><b>' + esc(it.ref || '') + '</b></td>' +
            (t.noContractor ? '' : '<td class="small">' + esc(contractorName(ctx, it.contractorId)) + '</td>') +
            t.cols.map(function (c) { return '<td>' + c.r(it, ctx) + '</td>'; }).join('') +
            '<td class="small muted num">' + esc(it.date || '') + '</td>' +
            (t.noStatus ? '' : '<td>' + pill(it[t.statusKey || 'status']) + '</td>') +
            '<td>' + (act ? '<button class="btn sm" data-tact="' + idx + '">' + act.label + '</button>' : '') + '</td>' +
            '</tr>';
        }).join('') + '</tbody></table></div>'
        : '<div class="empty"><div class="e-ico">📭</div>لا سجلات بعد</div>') +
      '</div>';

    el.querySelectorAll('[data-ttab]').forEach(function (x) {
      x.addEventListener('click', function () { techState.tab = x.getAttribute('data-ttab'); renderTechOffice(el, ctx); });
    });
    el.querySelector('#tt-add').addEventListener('click', function () { techAddModal(ctx, t); });
    el.querySelectorAll('[data-tact]').forEach(function (b) {
      b.addEventListener('click', function () {
        const it = items[Number(b.getAttribute('data-tact'))];
        const act = t.action(ctx, it);
        if (act) act.run();
      });
    });
  }

  function kpiMini(lbl, val, cls) {
    return '<div class="card kpi ' + cls + '" style="padding:14px"><div class="lbl" style="font-size:11.5px">' + lbl + '</div>' +
      '<div class="val num" style="font-size:22px;margin:4px 0 0">' + val + '</div></div>';
  }

  // ============ التكامل والإعدادات (حالة الخدمات الحقيقية) ============
  function svcCard(title, ico, ok, okText, offText, hint) {
    return '<div class="card kpi ' + (ok ? 'k-ok' : 'k-warn') + '"><div class="lbl">' + ico + ' ' + esc(title) + '</div>' +
      '<div class="val" style="font-size:17px">' + (ok ? '<span style="color:var(--ok)">✅ ' + esc(okText) + '</span>' : '<span style="color:var(--warn)">◽ ' + esc(offText) + '</span>') + '</div>' +
      '<div class="sub">' + hint + '</div></div>';
  }

  function renderSystem(el, ctx) {
    el.innerHTML = '<div class="empty"><div class="e-ico">⏳</div>جارٍ فحص حالة الخدمات...</div>';
    Api.integrationsStatus().then(function (s) {
      if (s.demo) {
        el.innerHTML = '<div class="card"><h3>⚙️ التكامل والإعدادات</h3>' +
          '<div class="empty"><div class="e-ico">🧪</div>أنت في وضع الديمو داخل المتصفح.<br>' +
          'حالة التكامل الفعلية (قاعدة البيانات، البريد، واتساب، الذكاء الاصطناعي، الكاميرات)<br>تظهر عند تشغيل نسخة الخادم: <b class="num">node server/server.js</b></div></div>';
        return;
      }
      el.innerHTML =
        '<div class="grid g3 mb">' +
        svcCard('قاعدة البيانات', '🗄️', s.storage.kind === 'sqlite', 'SQLite (' + s.storage.file + ')', 'ملف JSON', 'كتابة معاملاتية WAL · للترقية إلى PostgreSQL انظر server/storage.js') +
        svcCard('تخزين الملفات', '📁', true, s.uploads + ' ملف مرفوع', '', 'رفع فعلي إلى data/uploads — الصور والمخططات والمستندات') +
        svcCard('الذكاء الاصطناعي', '🤖', s.ai.configured, 'Claude Vision (' + s.ai.model + ')', s.ai.keyPresent && !s.ai.sdkInstalled ? 'ثبّت @anthropic-ai/sdk' : 'أضف ANTHROPIC_API_KEY',
          'تحليل حقيقي لصور الموقع ولقطات الكاميرات') +
        svcCard('البريد الإلكتروني', '📧', s.email.configured, 'متصل (' + (s.email.provider || '') + ')', 'محاكاة', 'RESEND_API_KEY أو SENDGRID_API_KEY + EMAIL_FROM') +
        svcCard('واتساب', '💬', s.whatsapp.configured, 'WhatsApp Cloud API', 'محاكاة', 'WHATSAPP_TOKEN + WHATSAPP_PHONE_ID من Meta Business') +
        svcCard('مدخل الكاميرات', '🎥', s.cameraIngest.configured, 'يستقبل اللقطات', 'أضف CAMERA_KEY', 'الكاميرا/NVR تدفع لقطة JPEG كل فترة ويحللها الذكاء الاصطناعي') +
        svcCard('البث المباشر RTSP', '📡', s.media && s.media.configured, 'خادم الوسائط متصل', 'أضف MEDIA_SERVER_URL', 'MediaMTX يحول RTSP إلى بث حي داخل صفحة الكاميرات') +
        '</div>' +

        '<div class="grid g2">' +
        '<div class="card"><h3>🔧 التهيئة (ملف .env بجذر المشروع)</h3>' +
        '<pre class="small" style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:14px;overflow-x:auto;direction:ltr;text-align:left;line-height:2">' +
        '# الذكاء الاصطناعي (تحليل الصور)\nANTHROPIC_API_KEY=sk-ant-...\n\n# البريد\nRESEND_API_KEY=re_...\nEMAIL_FROM=Bassir &lt;reports@yourdomain.com&gt;\n\n# واتساب (Meta Cloud API)\nWHATSAPP_TOKEN=EAAG...\nWHATSAPP_PHONE_ID=1234567890\n\n# مدخل لقطات الكاميرات\nCAMERA_KEY=مفتاح-سري-طويل\n\n# التخزين\nSTORAGE=sqlite\nJWT_SECRET=سر-الإنتاج</pre>' +
        '<div class="small muted">بعد التعديل أعد تشغيل الخادم. أي خدمة غير مهيأة تعمل تلقائياً بوضع المحاكاة.</div></div>' +

        '<div class="card"><h3>🎥 ربط كاميرات الموقع فعلياً</h3>' +
        '<div class="small" style="line-height:2">أي كاميرا أو جهاز تسجيل NVR يدعم الدفع عبر HTTP يرسل لقطاته للنظام، ويحللها ذكاء بصير تلقائياً:</div>' +
        '<pre class="small" style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:14px;overflow-x:auto;direction:ltr;text-align:left;line-height:2">' +
        'curl -X POST https://your-domain/api/cameras/CAM1/snapshot \\\n  -H "x-camera-key: $CAMERA_KEY" \\\n  -H "Content-Type: image/jpeg" \\\n  --data-binary @snapshot.jpg</pre>' +
        '<div class="small muted" style="line-height:2">تُحفظ اللقطة في سجل الصور، وإن كان الذكاء الاصطناعي مهيأً تُحلل فوراً وتضاف نتيجتها إلى رؤى بصير مع مقارنتها بنسب الاستشاري.</div>' +
        '<h3 class="mt">📡 البث المباشر RTSP</h3>' +
        '<div class="small" style="line-height:2">1) ثبّت <b class="num">MediaMTX</b> على السيرفر (ملف تنفيذي واحد).<br>2) أضف كل كاميرا في mediamtx.yml بمسار يطابق حقل "مسار البث":</div>' +
        '<pre class="small" style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:14px;overflow-x:auto;direction:ltr;text-align:left;line-height:2">paths:\n  cam1:\n    source: rtsp://user:pass@192.168.1.10:554/stream1</pre>' +
        '<div class="small muted" style="line-height:2">3) ضع MEDIA_SERVER_URL=http://السيرفر:8888 في .env — فيظهر البث الحي مباشرة داخل بطاقات صفحة الكاميرات للمالك.</div></div>' +
        '</div>';
    }).catch(function (e) {
      el.innerHTML = '<div class="empty"><div class="e-ico">⚠️</div>' + esc(e.message) + '</div>';
    });
  }

  window.ViewsRoles = {
    renderApprovals: renderApprovals,
    renderTechOffice: renderTechOffice,
    renderSystem: renderSystem,
    renderManageContractors: renderManageContractors,
    renderBoq: renderBoq,
    renderDailyReport: renderDailyReport,
    renderRepProjects: renderRepProjects,
    renderUsers: renderUsers,
    renderAudit: renderAudit,
    renderBimUpload: renderBimUpload,
    renderContractorHome: renderContractorHome
  };
})();
