/** بصير | الصفحات المشتركة: لوحة القيادة، رؤية المشروع، المقاولون، الذكاء الاصطناعي، التقارير */
(function () {
  'use strict';

  const esc = Charts.esc;

  // ============ أدوات مشتركة ============
  const STATUS = {
    pending: ['قيد المراجعة', 'p-warn'],
    approved: ['معتمد', 'p-ok'],
    approved_notes: ['معتمد مع ملاحظات', 'p-info'],
    rejected: ['مرفوض', 'p-danger'],
    open: ['مفتوح', 'p-warn'],
    answered: ['تم الرد', 'p-ok'],
    issued: ['صادرة', 'p-info'],
    done: ['نُفذت', 'p-ok'],
    closed: ['مغلق', 'p-ok'],
    pass: ['ناجح ✓', 'p-ok'],
    fail: ['راسب ✗', 'p-danger']
  };

  function pill(status) {
    const s = STATUS[status] || [status, 'p-muted'];
    return '<span class="pill ' + s[1] + '">' + esc(s[0]) + '</span>';
  }

  function money(n) { return n == null ? '—' : '<span class="num">' + Number(n).toLocaleString('en-US') + '</span> ر.س'; }
  function millions(n) { return '<span class="num">' + (n / 1e6).toFixed(1) + '</span> مليون ر.س'; }

  function toast(msg, isErr) {
    let wrap = document.querySelector('.toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
    const t = document.createElement('div');
    t.className = 'toast' + (isErr ? ' t-err' : '');
    t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(function () { t.remove(); }, 4200);
  }

  function modal(html) {
    const back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML = '<div class="modal">' + html + '</div>';
    back.addEventListener('click', function (e) { if (e.target === back) back.remove(); });
    document.body.appendChild(back);
    return back;
  }

  function discOf(ctx, id) {
    return (ctx.S.projects[0].disciplines || []).find(function (d) { return d.id === id; }) || { name: id, color: '#8b95a8', icon: '🔧' };
  }

  function floorName(ctx, id) {
    const f = (ctx.S.projects[0].floors || []).find(function (x) { return x.id === id; });
    return f ? f.name : id;
  }

  /** إنجاز مرجّح بالقيمة لمجموعة بنود */
  function weightedProgress(items) {
    let earned = 0, total = 0;
    items.forEach(function (b) { const v = b.qty * b.unitPrice; total += v; earned += v * (b.progress / 100); });
    return total ? Math.round((earned / total) * 100) : null;
  }

  /** مزج لون التخصص مع الخلفية الداكنة حسب نسبة الإنجاز (داكن ← ساطع) */
  function mixColor(hex, t) {
    const dark = [16, 21, 31];
    const c = [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
    const r = c.map(function (v, i) { return Math.round(dark[i] + (v - dark[i]) * t); });
    return 'rgb(' + r.join(',') + ')';
  }

  function summarize(ctx) {
    // ملخصات المقاولين محلياً (تطابق منطق الخادم)
    return ctx.S.contractors.map(function (c) {
      const items = ctx.S.boqItems.filter(function (b) { return b.contractorId === c.id; });
      const progress = weightedProgress(items) || 0;
      const earnedValue = c.contractValue * progress / 100;
      return {
        id: c.id, name: c.name, type: c.type, contractValue: c.contractValue,
        amountReceived: c.amountReceived, startDate: c.startDate, endDate: c.endDate,
        progress: progress, plannedProgress: c.plannedProgress || 0,
        delayed: progress < (c.plannedProgress || 0) - 3,
        overpaid: c.amountReceived > earnedValue * 1.05,
        earnedValue: Math.round(earnedValue)
      };
    });
  }

  // ============ لوحة القيادة ============
  function renderDashboard(el, ctx) {
    const P = ctx.S.projects[0];
    const sums = summarize(ctx);
    const delayedCount = sums.filter(function (s) { return s.delayed; }).length;
    const alerts = ctx.S.aiInsights.filter(function (a) { return a.severity !== 'ok'; }).slice(0, 3);
    const variance = Math.round((P.progressActual - P.progressPlanned) * 10) / 10;
    const costVar = P.costActual - P.costPlannedToDate;

    el.innerHTML =
      '<div class="grid g4 mb">' +
      '<div class="card kpi"><div class="lbl">نسبة الإنجاز الفعلية</div><div class="val num">' + P.progressActual + '%</div>' +
      '<div class="sub">المخطط: <b class="num">' + P.progressPlanned + '%</b> · الانحراف <b class="' + (variance < 0 ? 'trend-down' : 'trend-up') + ' num">' + variance + '%</b></div></div>' +
      '<div class="card kpi ' + (costVar > 0 ? 'k-danger' : 'k-ok') + '"><div class="lbl">التكلفة الفعلية حتى تاريخه</div><div class="val">' + millions(P.costActual) + '</div>' +
      '<div class="sub">المخطط: ' + millions(P.costPlannedToDate) + ' · ' + (costVar > 0 ? '<span class="trend-down">تجاوز ' + millions(costVar) + '</span>' : '<span class="trend-up">ضمن الميزانية</span>') + '</div></div>' +
      '<div class="card kpi k-info"><div class="lbl">قيمة العقود / الميزانية</div><div class="val">' + millions(P.budgetPlanned) + '</div>' +
      '<div class="sub">التسليم المتوقع: <b>' + esc(P.endForecast) + '</b> (التعاقدي ' + esc(P.endPlanned) + ')</div></div>' +
      '<div class="card kpi ' + (delayedCount ? 'k-warn' : 'k-ok') + '"><div class="lbl">المقاولون</div><div class="val num">' + sums.length + '</div>' +
      '<div class="sub">' + (delayedCount ? '<span class="trend-down">' + delayedCount + ' متأخر عن الجدول</span>' : '<span class="trend-up">الجميع ضمن الجدول</span>') + '</div></div>' +
      '</div>' +

      '<div class="grid g2 mb">' +
      '<div class="card"><h3>📈 الجدول الزمني: المخطط مقابل الفعلي <span class="hint">منحنى S التراكمي</span></h3>' + Charts.sCurve(ctx.S.scheduleCurve) + '</div>' +
      '<div class="card"><h3>💰 التكلفة: المخطط مقابل الفعلي <span class="hint">مليون ريال</span></h3>' + Charts.sCurve(ctx.S.costCurve, { maxY: 55, unit: 'م' }) + '</div>' +
      '</div>' +

      '<div class="grid g2">' +
      '<div class="card"><h3>🗂️ مراحل المشروع</h3>' +
      Charts.compareBars(ctx.S.scheduleTasks.map(function (t) {
        return { label: t.name, actual: t.progress, planned: taskPlanned(t) };
      })) + '</div>' +
      '<div class="card"><h3>🔔 تنبيهات بصير الذكية <span class="hint">من تحليل الصور والكاميرات</span></h3>' +
      (alerts.length ? alerts.map(aiItemHtml).join('') : '<div class="empty"><div class="e-ico">✨</div>لا توجد تنبيهات حرجة</div>') +
      '<button class="btn ghost sm" data-nav="ai">فتح صفحة الذكاء الاصطناعي ←</button></div>' +
      '</div>';

    el.querySelectorAll('[data-nav]').forEach(function (b) {
      b.addEventListener('click', function () { ctx.nav(b.getAttribute('data-nav')); });
    });
  }

  function taskPlanned(t) {
    // نسبة مخططة تقريبية بحسب موقع اليوم بين بداية ونهاية النشاط المخطط
    const now = Date.now();
    const s = new Date(t.startPlanned).getTime(), e = new Date(t.endPlanned).getTime();
    if (now <= s) return 0;
    if (now >= e) return 100;
    return Math.round(((now - s) / (e - s)) * 100);
  }

  // ============ الذكاء الاصطناعي ============
  function aiItemHtml(a) {
    const ico = a.severity === 'alert' ? '🚨' : a.severity === 'warn' ? '⚠️' : '✅';
    const src = a.source === 'camera' ? 'كاميرات الموقع' : a.source === 'photos' ? 'تحليل الصور' : 'تحليل البيانات';
    return '<div class="ai-item sev-' + a.severity + '"><div class="ai-ico">' + ico + '</div><div style="flex:1">' +
      '<p>' + esc(a.note) + '</p>' +
      '<div class="meta">' + esc(a.date) + ' · المصدر: ' + src + (a.area ? ' · الموقع: ' + esc(a.area) : '') +
      (a.detected != null ? ' · الرصد البصري: <b class="num">' + a.detected + '%</b>' : '') + '</div></div></div>';
  }

  function renderAi(el, ctx) {
    const overall = ctx.S.projects[0].progressActual;
    const visual = 52.1; // متوسط الرصد البصري في الديمو
    el.innerHTML =
      '<div class="grid g3 mb">' +
      '<div class="card" style="text-align:center"><h3 style="justify-content:center">👁 الإنجاز بعين بصير</h3>' +
      Charts.donut(visual, { label: 'رصد بصري (AI)' }) +
      '<div class="small muted mt">تحليل ' + ctx.S.photos.length + ' صور و3 كاميرات مثبتة</div></div>' +
      '<div class="card" style="text-align:center"><h3 style="justify-content:center">📋 الإنجاز المُبلَّغ</h3>' +
      Charts.donut(overall, { label: 'تقارير الموقع', color: '#4cc9f0' }) +
      '<div class="small muted mt">وفق مستخلصات وتقارير فريق العمل</div></div>' +
      '<div class="card"><h3>🎥 الكاميرات المباشرة</h3>' +
      ['كاميرا 1 - الواجهة الشمالية', 'كاميرا 2 - الدور الثالث', 'كاميرا 3 - السطح'].map(function (c, i) {
        return '<div class="flex" style="justify-content:space-between;border:1px solid var(--border);border-radius:10px;padding:10px 14px;margin-bottom:8px;background:var(--bg2)">' +
          '<span class="small">📡 ' + c + '</span><span class="pill p-ok">● مباشر</span></div>';
      }).join('') +
      '<div class="small muted">تُحلَّل اللقطات كل 30 دقيقة لاستخراج نسب الإنجاز وتنبيهات السلامة</div></div>' +
      '</div>' +

      '<div class="grid g2">' +
      '<div class="card"><h3>🧠 رؤى وتنبيهات بصير</h3>' + ctx.S.aiInsights.map(aiItemHtml).join('') + '</div>' +
      '<div class="card"><h3>📸 آخر الصور المُحلَّلة <span class="hint">رفع فريق الموقع</span></h3>' +
      '<div class="grid g2">' + ctx.S.photos.map(function (p) {
        return '<div class="photo-card"><div class="ph">🏗️<div class="scan"></div></div><div class="info">' +
          '<b>' + esc(p.title) + '</b><div class="muted small">' + esc(p.date) + ' · ' + esc(floorName(ctx, p.area)) + '</div>' +
          '<div class="aiTag">🤖 ' + esc(p.ai) + (p.detected != null ? ' — <b class="num">' + p.detected + '%</b>' : '') + '</div></div></div>';
      }).join('') + '</div></div>' +
      '</div>';
  }

  // ============ صفحة المقاولين (رؤية المالك) ============
  function renderContractors(el, ctx) {
    const sums = summarize(ctx);
    const totalContracts = sums.reduce(function (a, s) { return a + s.contractValue; }, 0);
    const totalReceived = sums.reduce(function (a, s) { return a + s.amountReceived; }, 0);
    const delayed = sums.filter(function (s) { return s.delayed; });
    const overpaid = sums.filter(function (s) { return s.overpaid; });

    el.innerHTML =
      '<div class="grid g4 mb">' +
      '<div class="card kpi"><div class="lbl">عدد المقاولين في المشروع</div><div class="val num">' + sums.length + '</div><div class="sub">' + esc(sums.map(function (s) { return discOf(ctx, s.type).icon; }).join(' ')) + '</div></div>' +
      '<div class="card kpi k-info"><div class="lbl">إجمالي قيم العقود</div><div class="val">' + millions(totalContracts) + '</div><div class="sub">لجميع التخصصات</div></div>' +
      '<div class="card kpi"><div class="lbl">إجمالي المبالغ المستلمة</div><div class="val">' + millions(totalReceived) + '</div><div class="sub num">' + Math.round(totalReceived / totalContracts * 100) + '% من قيمة العقود</div></div>' +
      '<div class="card kpi ' + (delayed.length || overpaid.length ? 'k-danger' : 'k-ok') + '"><div class="lbl">مؤشرات الخطر</div><div class="val num">' + (delayed.length + overpaid.length) + '</div>' +
      '<div class="sub">' + delayed.length + ' متأخر · ' + overpaid.length + ' صرف أعلى من المستحق</div></div>' +
      '</div>' +

      '<div class="card"><h3>👷 أداء المقاولين <span class="hint">الإنجاز محسوب من جداول الكميات المعتمدة</span></h3>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
      '<th>المقاول</th><th>التخصص</th><th>قيمة العقد</th><th>نسبة الإنجاز</th><th>المستحق (Earned)</th><th>المستلم</th><th>الجدول</th><th>الصرف</th><th>المدة</th>' +
      '</tr></thead><tbody>' +
      sums.map(function (s) {
        const d = discOf(ctx, s.type);
        return '<tr>' +
          '<td><b>' + esc(s.name) + '</b></td>' +
          '<td><span class="pill p-muted">' + d.icon + ' ' + esc(d.name) + '</span></td>' +
          '<td>' + money(s.contractValue) + '</td>' +
          '<td><div class="flex"><div class="bar ' + (s.delayed ? 'b-danger' : 'b-ok') + '" style="flex:1"><i style="width:' + s.progress + '%"></i></div><b class="num">' + s.progress + '%</b></div>' +
          '<div class="small muted num">المخطط ' + s.plannedProgress + '%</div></td>' +
          '<td>' + money(s.earnedValue) + '</td>' +
          '<td>' + money(s.amountReceived) + '</td>' +
          '<td>' + (s.delayed ? '<span class="pill p-danger">متأخر</span>' : '<span class="pill p-ok">ضمن الجدول</span>') + '</td>' +
          '<td>' + (s.overpaid ? '<span class="pill p-danger">استلم أكثر من مستحقه</span>' : '<span class="pill p-ok">سليم</span>') + '</td>' +
          '<td class="small muted num">' + esc(s.startDate) + '<br>' + esc(s.endDate) + '</td>' +
          '</tr>';
      }).join('') +
      '</tbody></table></div></div>';
  }

  // ============ رؤية المشروع (2D + BIM) ============
  const visionState = { tab: '2d', floor: 'GF', disc: 'all', zone: null, bimFloor: null };

  function itemsFor(ctx, floorId, disc, zone) {
    return ctx.S.boqItems.filter(function (b) {
      return b.floor === floorId &&
        (disc === 'all' || b.discipline === disc) &&
        (zone == null || b.zone === zone);
    });
  }

  function renderVision(el, ctx) {
    const P = ctx.S.projects[0];
    const st = visionState;

    const discChips = '<div class="disc-chips">' +
      '<div class="disc-chip ' + (st.disc === 'all' ? 'active' : '') + '" data-disc="all" style="--disc-color:#e0a458"><span class="dot"></span>جميع البنود</div>' +
      P.disciplines.map(function (d) {
        return '<div class="disc-chip ' + (st.disc === d.id ? 'active' : '') + '" data-disc="' + d.id + '" style="--disc-color:' + d.color + '">' +
          '<span class="dot"></span>' + d.icon + ' ' + esc(d.name) + '</div>';
      }).join('') + '</div>';

    let body = '';
    if (st.tab === '2d') body = render2d(ctx);
    else body = renderBim(ctx);

    el.innerHTML =
      '<div class="tabs">' +
      '<div class="tab ' + (st.tab === '2d' ? 'active' : '') + '" data-vtab="2d">🗺️ المخططات ثنائية الأبعاد</div>' +
      '<div class="tab ' + (st.tab === 'bim' ? 'active' : '') + '" data-vtab="bim">🏢 نموذج BIM ثلاثي الأبعاد</div>' +
      '</div>' + discChips + body +
      '<div class="legend"><span><span class="sw" style="background:#141a26;border:1px solid #26314a"></span>داكن = أعمال غير منتهية</span>' +
      '<span><span class="sw" style="background:linear-gradient(90deg,#8a6a35,#e0a458);box-shadow:0 0 10px rgba(224,164,88,.7)"></span>ساطع = بنود منتهية (مستخلصات معتمدة)</span>' +
      '<span>اضغط أي منطقة/دور لعرض بنود جدول الكميات المرتبطة بها</span></div>';

    // ربط الأحداث
    el.querySelectorAll('[data-vtab]').forEach(function (t) {
      t.addEventListener('click', function () { st.tab = t.getAttribute('data-vtab'); renderVision(el, ctx); });
    });
    el.querySelectorAll('[data-disc]').forEach(function (t) {
      t.addEventListener('click', function () { st.disc = t.getAttribute('data-disc'); st.zone = null; renderVision(el, ctx); });
    });
    el.querySelectorAll('[data-floor]').forEach(function (t) {
      t.addEventListener('click', function () { st.floor = t.getAttribute('data-floor'); st.zone = null; renderVision(el, ctx); });
    });
    el.querySelectorAll('[data-zone]').forEach(function (z) {
      z.addEventListener('click', function () { st.zone = Number(z.getAttribute('data-zone')); renderVision(el, ctx); });
    });
    el.querySelectorAll('[data-bimfloor]').forEach(function (z) {
      z.addEventListener('click', function () { st.bimFloor = z.getAttribute('data-bimfloor'); renderVision(el, ctx); });
    });
  }

  // مواقع مناطق المخطط 2D (ست مناطق + ممر)
  const ZONES = [
    { x: 40, y: 40, w: 230, h: 200, name: 'الجناح الشمالي الشرقي' },
    { x: 285, y: 40, w: 230, h: 200, name: 'القلب الخدمي' },
    { x: 530, y: 40, w: 230, h: 200, name: 'الجناح الشمالي الغربي' },
    { x: 40, y: 300, w: 230, h: 180, name: 'الجناح الجنوبي الشرقي' },
    { x: 285, y: 300, w: 230, h: 180, name: 'البهو والمصاعد' },
    { x: 530, y: 300, w: 230, h: 180, name: 'الجناح الجنوبي الغربي' }
  ];

  function render2d(ctx) {
    const P = ctx.S.projects[0];
    const st = visionState;
    const accent = st.disc === 'all' ? '#e0a458' : discOf(ctx, st.disc).color;

    const floorTabs = '<div class="floor-tabs">' + P.floors.map(function (f) {
      const fp = weightedProgress(itemsFor(ctx, f.id, st.disc, null));
      return '<div class="tab ' + (st.floor === f.id ? 'active' : '') + '" data-floor="' + f.id + '">' + esc(f.name) +
        (fp != null ? ' <span class="muted num">' + fp + '%</span>' : '') + '</div>';
    }).join('') + '</div>';

    // بناء SVG للمخطط
    let zonesSvg = '';
    ZONES.forEach(function (z, i) {
      const items = itemsFor(ctx, st.floor, st.disc, i);
      const p = weightedProgress(items);
      const t = p == null ? 0.04 : 0.06 + (p / 100) * 0.86;
      const fill = mixColor(accent, t);
      const done = p != null && p >= 95;
      const sel = st.zone === i;
      zonesSvg += '<g class="zone-shape" data-zone="' + i + '">' +
        '<rect x="' + z.x + '" y="' + z.y + '" width="' + z.w + '" height="' + z.h + '" rx="6" fill="' + fill + '" ' +
        'stroke="' + (sel ? '#fff' : done ? accent : '#26314a') + '" stroke-width="' + (sel ? 3 : done ? 2 : 1.4) + '"' +
        (done ? ' filter="url(#glow)"' : '') + '>' +
        '<title>' + esc(z.name) + ' — ' + (p == null ? 'لا بنود' : 'الإنجاز ' + p + '%') + '</title></rect>' +
        '<text x="' + (z.x + z.w / 2) + '" y="' + (z.y + z.h / 2 - 8) + '" text-anchor="middle" fill="' + (t > 0.5 ? '#10151f' : '#aab3c5') + '" font-size="13" font-weight="700" pointer-events="none">' + esc(z.name) + '</text>' +
        '<text x="' + (z.x + z.w / 2) + '" y="' + (z.y + z.h / 2 + 16) + '" text-anchor="middle" fill="' + (t > 0.5 ? '#10151f' : '#e9ecf3') + '" font-size="18" font-weight="800" pointer-events="none">' + (p == null ? '—' : p + '%') + '</text>' +
        '</g>';
    });

    // محاور الشبكة الهندسية
    let axes = '';
    ['A', 'B', 'C'].forEach(function (a, i) {
      const y = 40 + i * 220;
      axes += '<circle cx="790" cy="' + y + '" r="11" fill="none" stroke="#33405e"/><text x="790" y="' + (y + 4) + '" text-anchor="middle" fill="#67718a" font-size="10">' + a + '</text>';
    });
    for (let g = 0; g < 4; g++) {
      const x = 40 + g * 245;
      axes += '<circle cx="' + x + '" cy="505" r="11" fill="none" stroke="#33405e"/><text x="' + x + '" y="509" text-anchor="middle" fill="#67718a" font-size="10">' + (g + 1) + '</text>' +
        '<line x1="' + x + '" y1="30" x2="' + x + '" y2="490" stroke="#1a2234" stroke-dasharray="4 8"/>';
    }

    const svg = '<svg viewBox="0 0 810 525">' +
      '<defs><filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
      '<rect x="28" y="28" width="744" height="464" rx="10" fill="none" stroke="#33405e" stroke-width="3"/>' +
      axes +
      '<rect x="40" y="252" width="720" height="36" fill="#0e1420" stroke="#1e2740"/><text x="400" y="274" text-anchor="middle" fill="#4a5570" font-size="11">ممر الحركة الرئيسي</text>' +
      zonesSvg + '</svg>';

    // لوحة البنود الجانبية
    const panelItems = itemsFor(ctx, st.floor, st.disc, st.zone);
    const panelTitle = st.zone == null ? 'كل بنود ' + floorName(ctx, st.floor) : ZONES[st.zone].name + ' — ' + floorName(ctx, st.floor);
    const panel =
      '<div class="card zone-panel"><h3>📋 ' + esc(panelTitle) + ' <span class="hint num">' + panelItems.length + ' بند</span></h3>' +
      (panelItems.length ? panelItems.map(function (b) {
        const d = discOf(ctx, b.discipline);
        const done = b.progress >= 100;
        return '<div style="border:1px solid ' + (done ? d.color : 'var(--border)') + ';border-radius:10px;padding:10px 12px;margin-bottom:9px;background:var(--bg2)' + (done ? ';box-shadow:0 0 12px ' + d.color + '33' : '') + '">' +
          '<div class="flex" style="justify-content:space-between"><b class="small">' + esc(b.description) + '</b><span class="pill ' + (done ? 'p-ok' : b.progress > 0 ? 'p-warn' : 'p-muted') + '">' + esc(b.status) + '</span></div>' +
          '<div class="small muted num">' + esc(b.code) + ' · ' + b.qty + ' ' + esc(b.unit) + ' × ' + b.unitPrice.toLocaleString('en-US') + ' ر.س · ' + d.icon + ' ' + esc(d.name) + '</div>' +
          '<div class="flex mt" style="margin-top:8px"><div class="bar" style="flex:1"><i style="width:' + b.progress + '%;background:linear-gradient(90deg,' + d.color + '88,' + d.color + ')"></i></div><b class="num small">' + b.progress + '%</b></div>' +
          '</div>';
      }).join('') : '<div class="empty"><div class="e-ico">🗂️</div>لا توجد بنود مطابقة للتصفية الحالية</div>') +
      '</div>';

    return floorTabs +
      '<div class="grid" style="grid-template-columns:1.6fr 1fr"><div class="plan-stage">' + svg + '</div>' + panel + '</div>';
  }

  function renderBim(ctx) {
    const P = ctx.S.projects[0];
    const st = visionState;
    const accent = st.disc === 'all' ? '#e0a458' : discOf(ctx, st.disc).color;
    const floors = P.floors.slice(); // B1 أسفل ... RF أعلى

    const W = 640, cx = 250, fw = 170, fd = 52, fh = 34, gap = 6;
    let svg = '<svg viewBox="0 0 ' + W + ' 560" style="direction:ltr">' +
      '<defs><filter id="bimglow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';

    // أرضية شبكية
    svg += '<g opacity=".5">';
    for (let i = -3; i <= 3; i++) {
      svg += '<line x1="' + (cx + i * 55 - fw) + '" y1="530" x2="' + (cx + i * 55 + fw) + '" y2="440" stroke="#17203270" stroke-width="1"/>';
      svg += '<line x1="' + (cx + i * 55 - fw) + '" y1="440" x2="' + (cx + i * 55 + fw) + '" y2="530" stroke="#17203270" stroke-width="1"/>';
    }
    svg += '</g>';

    const baseY = 470;
    let floorLabels = '';
    floors.forEach(function (f, i) {
      const items = itemsFor(ctx, f.id, st.disc, null);
      const p = weightedProgress(items);
      const t = p == null ? 0.05 : 0.07 + (p / 100) * 0.85;
      const topColor = mixColor(accent, t);
      const sideColor = mixColor(accent, t * 0.55);
      const side2Color = mixColor(accent, t * 0.35);
      const done = p != null && p >= 95;
      const y = baseY - i * (fh + gap);
      const sel = st.bimFloor === f.id;

      const top = 'M ' + cx + ' ' + (y - fd) + ' L ' + (cx + fw) + ' ' + y + ' L ' + cx + ' ' + (y + fd) + ' L ' + (cx - fw) + ' ' + y + ' Z';
      const right = 'M ' + (cx + fw) + ' ' + y + ' L ' + cx + ' ' + (y + fd) + ' L ' + cx + ' ' + (y + fd + fh) + ' L ' + (cx + fw) + ' ' + (y + fh) + ' Z';
      const left = 'M ' + (cx - fw) + ' ' + y + ' L ' + cx + ' ' + (y + fd) + ' L ' + cx + ' ' + (y + fd + fh) + ' L ' + (cx - fw) + ' ' + (y + fh) + ' Z';

      svg += '<g class="bim-floor" data-bimfloor="' + f.id + '"' + (done ? ' filter="url(#bimglow)"' : '') + '>' +
        '<path d="' + left + '" fill="' + side2Color + '" stroke="#0a0d13" stroke-width="1"/>' +
        '<path d="' + right + '" fill="' + sideColor + '" stroke="#0a0d13" stroke-width="1"/>' +
        '<path d="' + top + '" fill="' + topColor + '" stroke="' + (sel ? '#fff' : done ? accent : '#26314a') + '" stroke-width="' + (sel ? 2.5 : 1.2) + '">' +
        '<title>' + esc(f.name) + ' — ' + (p == null ? 'لا بنود' : p + '%') + '</title></path></g>';
      floorLabels += '<g class="bim-floor" data-bimfloor="' + f.id + '">' +
        '<line x1="' + (cx + fw + 4) + '" y1="' + (y + fh / 2) + '" x2="' + (cx + fw + 26) + '" y2="' + (y + fh / 2) + '" stroke="#33405e"/>' +
        '<text x="' + (cx + fw + 32) + '" y="' + (y + fh / 2 + 4) + '" fill="' + (sel ? '#fff' : '#8b95a8') + '" font-size="12" font-weight="' + (sel ? '800' : '400') + '" text-anchor="start">' +
        (p == null ? '' : p + '% · ') + esc(f.name) + '</text></g>';
    });
    svg += floorLabels + '</svg>';

    // لوحة تفاصيل الدور المحدد
    const selFloor = st.bimFloor || 'GF';
    const detail =
      '<div class="card zone-panel"><h3>🏢 ' + esc(floorName(ctx, selFloor)) + ' <span class="hint">تفصيل التخصصات</span></h3>' +
      P.disciplines.map(function (d) {
        const p = weightedProgress(itemsFor(ctx, selFloor, d.id, null));
        if (p == null) return '';
        return '<div style="margin-bottom:13px"><div class="flex" style="justify-content:space-between;font-size:12.5px;margin-bottom:5px">' +
          '<span>' + d.icon + ' ' + esc(d.name) + '</span><b class="num" style="color:' + d.color + '">' + p + '%</b></div>' +
          '<div class="bar"><i style="width:' + p + '%;background:linear-gradient(90deg,' + d.color + '77,' + d.color + ')' + (p >= 95 ? ';box-shadow:0 0 10px ' + d.color : '') + '"></i></div></div>';
      }).join('') +
      '<div class="small muted mt">💡 المناطق الساطعة المتوهجة = بنود مكتملة اعتُمدت مستخلصاتها. اضغط أي دور في النموذج لعرض تفاصيله.</div>' +
      '<div class="sig">نموذج BIM مرفوع بواسطة: ' + esc(P.consultantName) + ' · مرتبط بجدول الكميات (' + ctx.S.boqItems.length + ' بند)</div>' +
      '</div>';

    return '<div class="grid" style="grid-template-columns:1.5fr 1fr"><div class="bim-stage">' + svg + '</div>' + detail + '</div>';
  }

  // ============ التقارير والإرسال ============
  function renderReports(el, ctx) {
    const canSend = ['consultant', 'admin', 'owner_rep', 'owner'].indexOf(ctx.U.role) !== -1;
    el.innerHTML =
      '<div class="grid g2 mb">' +
      '<div class="card"><h3>📅 التقارير اليومية</h3>' +
      ctx.S.dailyReports.map(function (r) {
        return '<div style="border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px;background:var(--bg2)">' +
          '<div class="flex" style="justify-content:space-between"><b>تقرير يوم ' + esc(r.date) + '</b><span class="pill p-info">☀️ ' + esc(r.weather) + '</span></div>' +
          '<div class="small muted" style="margin:6px 0">العمالة: <b class="num">' + r.manpower + '</b> · المعدات: ' + esc(r.equipment) + '</div>' +
          '<ul style="margin:8px 18px 0;font-size:13px;line-height:2">' + r.works.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul>' +
          '<div class="small muted mt" style="margin-top:8px">📎 ' + r.photos.length + ' صور مرفقة · أعده: ' + esc(r.by) + '</div></div>';
      }).join('') + '</div>' +

      '<div>' +
      '<div class="card mb"><h3>📊 التقارير الشهرية</h3>' +
      ctx.S.monthlyReports.map(function (r) {
        return '<div style="border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px;background:var(--bg2)">' +
          '<div class="flex" style="justify-content:space-between"><b>' + esc(r.title) + '</b>' +
          '<span class="pill ' + (r.progressActual < r.progressPlanned - 3 ? 'p-danger' : 'p-ok') + ' num">' + r.progressActual + '% / ' + r.progressPlanned + '%</span></div>' +
          '<p class="small" style="line-height:1.9;margin-top:8px;color:#c6cdda">' + esc(r.summary) + '</p></div>';
      }).join('') + '</div>' +

      '<div class="card"><h3>📨 إرسال التقارير للمالك</h3>' +
      (canSend ?
        '<label class="fl">القناة</label><select class="inp" id="rp-channel"><option value="whatsapp">واتساب WhatsApp</option><option value="email">البريد الإلكتروني</option></select>' +
        '<label class="fl">المستلم (رقم / بريد)</label><input class="inp" id="rp-to" placeholder="05xxxxxxxx أو owner@example.com" value="0501234567">' +
        '<label class="fl">التقرير</label><select class="inp" id="rp-title">' +
        '<option>التقرير اليومي - ' + esc(ctx.S.dailyReports[0] ? ctx.S.dailyReports[0].date : '') + '</option>' +
        ctx.S.monthlyReports.map(function (r) { return '<option>' + esc(r.title) + '</option>'; }).join('') +
        '<option>ملخص أداء المقاولين</option></select>' +
        '<div class="m-actions"><button class="btn" id="rp-send">📤 إرسال الآن</button></div>'
        : '<div class="muted small">الإرسال متاح للاستشاري وممثل المالك</div>') +
      '<h3 class="mt">سجل الإرسال</h3>' +
      (ctx.S.messages.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>القناة</th><th>إلى</th><th>التقرير</th><th>التاريخ</th><th>الحالة</th></tr></thead><tbody>' +
        ctx.S.messages.slice().reverse().map(function (m) {
          return '<tr><td>' + (m.channel === 'whatsapp' ? '💬 واتساب' : '📧 إيميل') + '</td><td class="num">' + esc(m.to) + '</td><td>' + esc(m.title) + '</td><td class="small muted num">' + esc(m.date) + '</td><td><span class="pill p-ok">أُرسل ✓</span></td></tr>';
        }).join('') + '</tbody></table></div>' : '<div class="empty">لا رسائل بعد</div>') +
      '</div></div></div>';

    const sendBtn = el.querySelector('#rp-send');
    if (sendBtn) sendBtn.addEventListener('click', async function () {
      try {
        await Api.sendReport({
          channel: el.querySelector('#rp-channel').value,
          to: el.querySelector('#rp-to').value,
          title: el.querySelector('#rp-title').value
        });
        toast('✅ تم إرسال التقرير بنجاح عبر ' + (el.querySelector('#rp-channel').value === 'whatsapp' ? 'واتساب' : 'البريد الإلكتروني'));
        ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });
  }

  window.ViewsShared = {
    pill: pill, money: money, millions: millions, toast: toast, modal: modal,
    discOf: discOf, floorName: floorName, weightedProgress: weightedProgress,
    summarize: summarize, STATUS: STATUS, esc: esc,
    renderDashboard: renderDashboard, renderVision: renderVision,
    renderContractors: renderContractors, renderAi: renderAi, renderReports: renderReports
  };
})();
