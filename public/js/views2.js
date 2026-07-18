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
            '<td class="num small"><b>' + esc(it.ref) + '</b>' + (it.file ? '<br><span class="muted">📎 ' + esc(it.file) + '</span>' : '') + '</td>' +
            '<td>' + esc(it.title) + (it.location ? '<div class="small muted">الموقع: ' + esc(VS.floorName(ctx, it.location)) + '</div>' : '') + '</td>' +
            '<td class="small">' + esc(contractorName(ctx, it.contractorId)) + '</td>' +
            (tab === 'changeOrders' ? '<td>' + money(it.amount) + '<div class="small muted num">+' + (it.days || 0) + ' يوم</div></td>' : '') +
            (tab === 'payments' ? '<td>' + money(it.amount) + '</td>' : '') +
            '<td class="small muted num">' + esc(it.date) + '</td>' +
            '<td>' + pill(it.status) + '</td>' +
            '<td class="small" style="max-width:220px">' + (it.notes ? esc(it.notes) : '<span class="muted">—</span>') +
            (it.signature ? '<div class="sig">✍️ ' + esc(it.signature) + ' · ' + esc(it.signDate) + '</div>' : '') + '</td>' +
            '<td>' + (it.status === 'pending' ? '<button class="btn sm" data-review="' + it.id + '">مراجعة وقرار</button>' : '') + '</td>' +
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

  // ============ التقارير اليومية (إنشاء - الاستشاري) ============
  function renderDailyReport(el, ctx) {
    el.innerHTML =
      '<div class="grid" style="grid-template-columns:1fr 1.2fr">' +
      '<div class="card"><h3>📝 تقرير يومي جديد</h3>' +
      '<label class="fl">التاريخ</label><input class="inp" id="dr-date" type="date" value="' + new Date().toISOString().slice(0, 10) + '">' +
      '<div class="grid g2"><div><label class="fl">الطقس</label><input class="inp" id="dr-weather" placeholder="مشمس 40°"></div>' +
      '<div><label class="fl">العمالة</label><input class="inp num" id="dr-manpower" type="number" placeholder="150"></div></div>' +
      '<label class="fl">المعدات</label><input class="inp" id="dr-equipment" placeholder="رافعة برجية 2...">' +
      '<label class="fl">الأعمال المنفذة (سطر لكل عمل)</label><textarea class="inp" id="dr-works" rows="5" placeholder="صب خرسانة...\nلياسة..."></textarea>' +
      '<label class="fl">الصور والملفات الداعمة</label>' +
      '<input class="inp" id="dr-photos" type="file" multiple accept="image/*,.pdf">' +
      '<div class="m-actions"><button class="btn block" id="dr-save">حفظ التقرير</button></div></div>' +
      '<div class="card"><h3>🗄️ أرشيف التقارير اليومية</h3>' +
      ctx.S.dailyReports.map(function (r) {
        return '<div style="border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px;background:var(--bg2)">' +
          '<div class="flex" style="justify-content:space-between"><b class="num">' + esc(r.date) + '</b><span class="small muted">عمالة: ' + r.manpower + ' · 📎 ' + (r.photos || []).length + '</span></div>' +
          '<div class="small" style="margin-top:6px;color:#c6cdda">' + r.works.map(esc).join(' • ') + '</div></div>';
      }).join('') + '</div></div>';

    el.querySelector('#dr-save').addEventListener('click', async function () {
      const files = el.querySelector('#dr-photos').files;
      try {
        await Api.create('dailyReports', {
          date: el.querySelector('#dr-date').value,
          weather: el.querySelector('#dr-weather').value || '—',
          manpower: Number(el.querySelector('#dr-manpower').value) || 0,
          equipment: el.querySelector('#dr-equipment').value || '—',
          works: el.querySelector('#dr-works').value.split('\n').filter(Boolean),
          photos: Array.prototype.map.call(files, function (f) { return f.name; }),
          by: ctx.U.name
        });
        toast('✅ حُفظ التقرير اليومي');
        ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });
  }

  // ============ ممثل المالك: المشاريع والاستشاريين ============
  function renderRepProjects(el, ctx) {
    el.innerHTML =
      '<div class="grid" style="grid-template-columns:1.2fr 1fr">' +
      '<div class="card"><h3>🏗️ مشاريع المالك</h3>' +
      ctx.S.projects.map(function (p) {
        return '<div style="border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:10px;background:var(--bg2)">' +
          '<div class="flex" style="justify-content:space-between"><b style="font-size:16px">' + esc(p.name) + '</b>' +
          '<span class="pill p-info num">' + (p.progressActual || 0) + '%</span></div>' +
          '<div class="small muted" style="margin:6px 0">' + esc(p.location) + ' · الميزانية ' + VS.millions(p.budgetPlanned) + '</div>' +
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
        } else toast('✅ أُنشئ المشروع');
        ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });
  }

  // ============ إدارة المستخدمين ============
  const ROLE_NAMES = {
    admin: 'مدير النظام', owner: 'المالك', owner_rep: 'ممثل المالك',
    consultant: 'الاستشاري', contractor: 'مقاول'
  };

  function renderUsers(el, ctx) {
    const isAdmin = ctx.U.role === 'admin';
    el.innerHTML =
      '<div class="grid" style="grid-template-columns:1.4fr 1fr">' +
      '<div class="card"><h3>👥 مستخدمو النظام</h3><div class="tbl-wrap"><table class="tbl"><thead><tr>' +
      '<th>الاسم</th><th>اسم المستخدم</th>' + (isAdmin ? '<th>كلمة المرور</th>' : '') + '<th>الدور</th><th></th></tr></thead><tbody>' +
      (ctx.S.users || []).map(function (u) {
        return '<tr><td><b>' + esc(u.name) + '</b></td><td class="num">' + esc(u.username) + '</td>' +
          (isAdmin ? '<td class="num small muted">' + esc(u.password || '••••') + '</td>' : '') +
          '<td><span class="pill p-info">' + esc(ROLE_NAMES[u.role] || u.role) + '</span></td>' +
          '<td>' + (u.username !== 'admin' && u.id !== ctx.U.id ? '<button class="btn danger sm" data-del="' + u.id + '">حذف</button>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></div></div>' +

      '<div class="card"><h3>➕ إضافة مستخدم</h3>' +
      '<label class="fl">الاسم الكامل</label><input class="inp" id="nu-name">' +
      '<label class="fl">اسم المستخدم</label><input class="inp" id="nu-user">' +
      '<label class="fl">كلمة المرور</label><input class="inp" id="nu-pass">' +
      '<label class="fl">الدور</label><select class="inp" id="nu-role">' +
      Object.keys(ROLE_NAMES).map(function (r) { return '<option value="' + r + '">' + ROLE_NAMES[r] + '</option>'; }).join('') + '</select>' +
      '<label class="fl">ربط بمقاول (لدور المقاول فقط)</label><select class="inp" id="nu-cont"><option value="">—</option>' +
      ctx.S.contractors.map(function (c) { return '<option value="' + c.id + '">' + esc(c.name) + '</option>'; }).join('') + '</select>' +
      '<div class="m-actions"><button class="btn block" id="nu-save">إنشاء المستخدم</button></div></div></div>';

    el.querySelector('#nu-save').addEventListener('click', async function () {
      try {
        await Api.create('users', {
          name: el.querySelector('#nu-name').value,
          username: el.querySelector('#nu-user').value,
          password: el.querySelector('#nu-pass').value,
          role: el.querySelector('#nu-role').value,
          contractorId: el.querySelector('#nu-cont').value || undefined
        });
        toast('✅ أُنشئ المستخدم');
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
      '<div class="small muted mt">💡 كل بند كميات مربوط بعناصر النموذج، فيتلوّن العنصر ساطعاً في عرض المالك عند اكتمال البند واعتماد مستخلصه.</div></div></div>';

    el.querySelector('#bim-up').addEventListener('click', function () {
      const f = el.querySelector('#bim-file').files[0];
      if (!f) { toast('اختر ملف النموذج أولاً', true); return; }
      toast('✅ رُفع النموذج "' + f.name + '" وربط بجدول الكميات — أصبح مرئياً للمالك في صفحة رؤية المشروع');
    });
  }

  // ============ صفحات المقاول ============
  const contState = { tab: 'shopDrawings' };

  function renderContractorHome(el, ctx) {
    const c = ctx.S.contractors[0];
    if (!c) { el.innerHTML = '<div class="empty">لا يوجد عقد مرتبط بحسابك</div>'; return; }
    const sums = VS.summarize(ctx)[0];
    const d = discOf(ctx, c.type);
    const pendingAll = APPROVAL_TABS.reduce(function (a, t) {
      return a + (ctx.S[t.col] || []).filter(function (x) { return x.status === 'pending'; }).length;
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

      '<div class="tabs">' + APPROVAL_TABS.map(function (t) {
        const pending = (ctx.S[t.col] || []).filter(function (x) { return x.status === 'pending'; }).length;
        return '<div class="tab ' + (contState.tab === t.col ? 'active' : '') + '" data-ctab="' + t.col + '">' + t.icon + ' ' + t.name +
          (pending ? '<span class="n">' + pending + '</span>' : '') + '</div>';
      }).join('') + '</div>' +

      '<div class="card"><div class="flex" style="justify-content:space-between;margin-bottom:12px">' +
      '<h3 style="margin:0">' + (APPROVAL_TABS.find(function (t) { return t.col === contState.tab; }) || {}).name + '</h3>' +
      '<button class="btn sm" id="ct-new">➕ رفع طلب جديد</button></div>' +
      renderContractorList(ctx) + '</div>';

    el.querySelectorAll('[data-ctab]').forEach(function (t) {
      t.addEventListener('click', function () { contState.tab = t.getAttribute('data-ctab'); renderContractorHome(el, ctx); });
    });
    el.querySelector('#ct-new').addEventListener('click', function () { openSubmitModal(ctx); });
  }

  function renderContractorList(ctx) {
    const items = (ctx.S[contState.tab] || []).slice().reverse();
    if (!items.length) return '<div class="empty"><div class="e-ico">📭</div>لا طلبات بعد — ارفع أول طلب</div>';
    return '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>المرجع</th><th>العنوان</th>' +
      (contState.tab === 'changeOrders' || contState.tab === 'payments' ? '<th>القيمة</th>' : '') +
      '<th>التاريخ</th><th>الحالة</th><th>رد الاستشاري</th></tr></thead><tbody>' +
      items.map(function (it) {
        return '<tr><td class="num small"><b>' + esc(it.ref) + '</b></td><td>' + esc(it.title) + '</td>' +
          (contState.tab === 'changeOrders' || contState.tab === 'payments' ? '<td>' + money(it.amount) + '</td>' : '') +
          '<td class="small muted num">' + esc(it.date) + '</td><td>' + pill(it.status) + '</td>' +
          '<td class="small" style="max-width:240px">' + (it.notes ? esc(it.notes) : '<span class="muted">—</span>') +
          (it.signature ? '<div class="sig">✍️ ' + esc(it.signature) + ' · ' + esc(it.signDate) + '</div>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function openSubmitModal(ctx) {
    const tab = contState.tab;
    const meta = APPROVAL_TABS.find(function (t) { return t.col === tab; });
    const needAmount = tab === 'changeOrders' || tab === 'payments';
    const isPayment = tab === 'payments';
    const isWir = tab === 'wirs';
    const myBoq = ctx.S.boqItems;

    const m = modal(
      '<h3>➕ رفع ' + meta.name + '</h3>' +
      '<div class="m-sub">سيصل الطلب للاستشاري للمراجعة والاعتماد أو الرفض</div>' +
      '<label class="fl">رقم المرجع</label><input class="inp num" id="sb-ref" placeholder="REF-001">' +
      '<label class="fl">العنوان / الوصف</label><input class="inp" id="sb-title">' +
      (needAmount ? '<label class="fl">القيمة (ر.س)</label><input class="inp num" id="sb-amount" type="number">' : '') +
      (tab === 'changeOrders' ? '<label class="fl">الأيام الإضافية المطلوبة</label><input class="inp num" id="sb-days" type="number" value="0">' : '') +
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
      if (tab === 'changeOrders') data.days = Number(m.querySelector('#sb-days').value) || 0;
      if (isWir) data.location = m.querySelector('#sb-loc').value;
      const files = m.querySelector('#sb-file').files;
      if (files.length) data.file = files[0].name;
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

  window.ViewsRoles = {
    renderApprovals: renderApprovals,
    renderManageContractors: renderManageContractors,
    renderBoq: renderBoq,
    renderDailyReport: renderDailyReport,
    renderRepProjects: renderRepProjects,
    renderUsers: renderUsers,
    renderBimUpload: renderBimUpload,
    renderContractorHome: renderContractorHome
  };
})();
