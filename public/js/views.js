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

  /** عرض مرفق: رابط قابل للفتح إن كان مرفوعاً فعلياً على الخادم، وإلا الاسم فقط */
  function att(f) {
    if (!f) return '';
    if (typeof f === 'string') return esc(f);
    if (f.url) return '<a href="' + esc(f.url) + '" target="_blank" style="color:var(--info)">' + esc(f.name) + ' ⬇</a>';
    return esc(f.name || '');
  }
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

  // ============ عين المالك: حالة المشروع بنظرة واحدة ============
  const DAY = 24 * 3600 * 1000;
  function daysDiff(a, b) { return Math.round((new Date(a).getTime() - new Date(b).getTime()) / DAY); }

  function projectGlance(ctx, P) {
    const delayDays = P.endForecast && P.endPlanned ? daysDiff(P.endForecast, P.endPlanned) : 0;
    const progVar = Math.round(((P.progressActual || 0) - (P.progressPlanned || 0)) * 10) / 10;
    const costVar = (P.costActual || 0) - (P.costPlannedToDate || 0);
    const costVarPct = P.costPlannedToDate ? Math.round(costVar / P.costPlannedToDate * 100) : 0;
    const totalDays = P.endPlanned && P.startPlanned ? daysDiff(P.endPlanned, P.startPlanned) : 0;
    const elapsed = P.startActual ? Math.max(0, daysDiff(new Date().toISOString().slice(0, 10), P.startActual)) : 0;
    const elapsedPct = totalDays ? Math.min(100, Math.round(elapsed / totalDays * 100)) : 0;
    let timeVerdict, timeCls, timeIco;
    if (delayDays > 7) { timeVerdict = 'متأخر ' + delayDays + ' يوماً عن الجدول'; timeCls = 'danger'; timeIco = '🔴'; }
    else if (delayDays < -7) { timeVerdict = 'متقدم ' + Math.abs(delayDays) + ' يوماً على الجدول'; timeCls = 'ok'; timeIco = '🟢'; }
    else { timeVerdict = 'ماشٍ حسب الجدول الزمني'; timeCls = 'ok'; timeIco = '🟢'; }
    return {
      delayDays: delayDays, progVar: progVar, costVar: costVar, costVarPct: costVarPct,
      elapsedPct: elapsedPct, elapsed: elapsed, totalDays: totalDays,
      timeVerdict: timeVerdict, timeCls: timeCls, timeIco: timeIco
    };
  }

  function clampScore(v) { return Math.max(0, Math.min(100, Math.round(v))); }

  /** حساب تقدم مقاول ومؤشراته من جداول الكميات (نسخة عميل خفيفة) */
  function contractorHealth(A, c) {
    const items = (A.boqItems || []).filter(function (b) { return b.contractorId === c.id; });
    let earned = 0, total = 0;
    items.forEach(function (b) { const v = b.qty * b.unitPrice; total += v; earned += v * (b.progress / 100); });
    const progress = total ? earned / total * 100 : 0;
    const earnedValue = c.contractValue * progress / 100;
    return { delayed: progress < (c.plannedProgress || 0) - 3, overpaid: c.amountReceived > earnedValue * 1.05 };
  }

  /**
   * مؤشر صحة المشروع المركّب: يدمج الجدول والتكلفة والجودة والسلامة وأداء
   * المقاولين في درجة 0-100 مع تقدير آلي لتاريخ الإنجاز حسب الوتيرة الحالية.
   */
  function projectHealth(ctx, P, A) {
    A = A || ctx.S;
    const inP = function (x) { return !x.projectId || x.projectId === P.id; };
    const g = projectGlance(ctx, P);
    const openNcr = (A.ncrs || []).filter(function (x) { return inP(x) && x.status === 'open'; }).length;
    const failedTests = (A.materialTests || []).filter(function (x) { return inP(x) && x.result === 'fail'; }).length;
    const openPunch = (A.punchList || []).filter(function (x) { return inP(x) && x.status === 'open'; }).length;
    const openHse = (A.hseReports || []).filter(function (x) { return inP(x) && x.status === 'open'; }).length;
    const openInc = (A.incidents || []).filter(function (x) { return inP(x) && x.status === 'open'; }).length;
    const conts = (A.contractors || []).filter(inP);
    let delayed = 0, overpaid = 0;
    conts.forEach(function (c) { const h = contractorHealth(A, c); if (h.delayed) delayed++; if (h.overpaid) overpaid++; });

    const schedule = clampScore(100 + g.progVar * 3);
    const cost = clampScore(100 - Math.max(0, g.costVarPct) * 3);
    const quality = clampScore(100 - openNcr * 8 - failedTests * 6 - openPunch * 3);
    const safety = clampScore(100 - openHse * 10 - openInc * 12);
    const contractor = clampScore(100 - delayed * 10 - overpaid * 8);
    const score = Math.round(schedule * 0.30 + cost * 0.25 + quality * 0.20 + safety * 0.15 + contractor * 0.10);

    let grade, gradeAr, cls;
    if (score >= 85) { grade = 'A'; gradeAr = 'ممتاز'; cls = 'ok'; }
    else if (score >= 70) { grade = 'B'; gradeAr = 'جيد'; cls = 'ok'; }
    else if (score >= 55) { grade = 'C'; gradeAr = 'مقبول — يحتاج متابعة'; cls = 'warn'; }
    else { grade = 'D'; gradeAr = 'حرج — تدخّل عاجل'; cls = 'danger'; }

    // تقدير الإنجاز حسب الوتيرة الفعلية
    let forecastDate = P.endForecast || null, forecastDelta = null;
    const pa = P.progressActual || 0;
    if (pa > 2 && g.elapsed > 0) {
      const velocity = pa / g.elapsed; // نسبة/يوم
      const remDays = velocity > 0 ? Math.round((100 - pa) / velocity) : null;
      if (remDays != null) {
        const fd = new Date(Date.now() + remDays * DAY);
        forecastDate = fd.toISOString().slice(0, 10);
        if (P.endPlanned) forecastDelta = daysDiff(forecastDate, P.endPlanned);
      }
    }
    return {
      score: score, grade: grade, gradeAr: gradeAr, cls: cls,
      components: [
        { key: 'الجدول الزمني', val: schedule, w: 30 },
        { key: 'التكلفة', val: cost, w: 25 },
        { key: 'الجودة', val: quality, w: 20 },
        { key: 'السلامة', val: safety, w: 15 },
        { key: 'أداء المقاولين', val: contractor, w: 10 }
      ],
      issues: { openNcr: openNcr, failedTests: failedTests, openPunch: openPunch, openHse: openHse, openInc: openInc, delayed: delayed, overpaid: overpaid },
      forecastDate: forecastDate, forecastDelta: forecastDelta
    };
  }

  const HEALTH_COLORS = { ok: '#2dd4a0', warn: '#ffcc00', danger: '#ff3b30' };

  function healthCard(ctx, P, A) {
    const h = projectHealth(ctx, P, A);
    const col = HEALTH_COLORS[h.cls];
    const barFor = function (c) {
      const bc = c.val >= 70 ? HEALTH_COLORS.ok : c.val >= 50 ? HEALTH_COLORS.warn : HEALTH_COLORS.danger;
      return '<div style="margin:7px 0"><div class="flex" style="justify-content:space-between"><span class="small">' + esc(c.key) +
        ' <span class="muted">(' + c.w + '%)</span></span><b class="num small">' + c.val + '</b></div>' +
        '<div class="bar" style="height:8px"><i style="width:' + c.val + '%;background:' + bc + '"></i></div></div>';
    };
    const forecastTxt = h.forecastDate
      ? 'التقدير الآلي للإنجاز حسب الوتيرة الحالية: <b class="num">' + esc(h.forecastDate) + '</b>' +
        (h.forecastDelta != null ? ' — <b class="num" style="color:' + (h.forecastDelta > 7 ? 'var(--danger)' : h.forecastDelta < -7 ? 'var(--ok)' : 'var(--warn)') + '">' +
          (h.forecastDelta > 0 ? 'تأخّر متوقع ' + h.forecastDelta + ' يوماً' : h.forecastDelta < 0 ? 'تقدّم متوقع ' + Math.abs(h.forecastDelta) + ' يوماً' : 'مطابق للخطة') + '</b>' : '')
      : 'التقدير الآلي يظهر بعد تسجيل بداية التنفيذ ونسبة إنجاز.';
    const chips = [];
    if (h.issues.openNcr) chips.push('🚫 ' + h.issues.openNcr + ' عدم مطابقة');
    if (h.issues.failedTests) chips.push('🧪 ' + h.issues.failedTests + ' اختبار راسب');
    if (h.issues.openPunch) chips.push('📌 ' + h.issues.openPunch + ' ملاحظة تسليم');
    if (h.issues.openHse || h.issues.openInc) chips.push('🦺 ' + (h.issues.openHse + h.issues.openInc) + ' سلامة/حوادث');
    if (h.issues.delayed) chips.push('👷 ' + h.issues.delayed + ' مقاول متأخر');
    if (h.issues.overpaid) chips.push('💰 ' + h.issues.overpaid + ' صرف يفوق المستحق');

    return '<div class="card mb" style="border-color:' + col + '55;background:linear-gradient(120deg,' + col + '10,transparent 55%),linear-gradient(180deg,var(--panel2),var(--panel))">' +
      '<div class="flex" style="justify-content:space-between;flex-wrap:wrap;align-items:flex-start;gap:16px">' +
      '<div style="text-align:center;min-width:170px">' +
      '<h3 style="justify-content:center;margin-bottom:6px">🧭 مؤشر صحة المشروع</h3>' +
      Charts.donut(h.score, { label: 'من 100', color: col, size: 128 }) +
      '<div style="margin-top:8px"><span class="pill ' + (h.cls === 'ok' ? 'p-ok' : h.cls === 'warn' ? 'p-warn' : 'p-danger') + '" style="font-size:13px;padding:4px 14px">' + h.grade + ' · ' + esc(h.gradeAr) + '</span></div></div>' +
      '<div style="flex:1;min-width:260px"><div class="small muted mb">مؤشر مركّب من خمسة أبعاد بأوزانها:</div>' +
      h.components.map(barFor).join('') + '</div></div>' +
      '<div class="small mt" style="border-top:1px solid var(--border);padding-top:10px;line-height:1.9">' +
      '📅 ' + forecastTxt +
      (chips.length ? '<div style="margin-top:8px">' + chips.map(function (c) { return '<span class="pill p-warn" style="font-size:11px;margin:2px">' + esc(c) + '</span>'; }).join(' ') + '</div>'
        : '<div class="small" style="color:var(--ok);margin-top:8px">✓ لا مخاطر جودة أو سلامة أو تعثّر مقاولين مفتوحة</div>') +
      '</div>' + healthTrend(ctx, P, A, h) + '</div>';
  }

  /** اتجاه مؤشر الصحة شهرياً: يلحق المؤشر الحالي بالسجل ويبرز التحسّن/التراجع */
  function healthTrend(ctx, P, A, h) {
    const hist = ((A || ctx.S).healthHistory || [])
      .filter(function (x) { return !x.projectId || x.projectId === P.id; })
      .slice().sort(function (a, b) { return String(a.month).localeCompare(String(b.month)); });
    if (!hist.length) return '';
    const points = hist.map(function (x) { return { month: x.month, actual: x.score }; }).concat([{ month: 'الآن', actual: h.score }]);
    const prev = hist[hist.length - 1].score;
    const delta = h.score - prev;
    const first = hist[0].score;
    const overall = h.score - first;
    const arrow = delta > 0 ? '<span style="color:var(--ok)">▲ +' + delta + '</span>' : delta < 0 ? '<span style="color:var(--danger)">▼ ' + delta + '</span>' : '<span class="muted">— ثابت</span>';
    let trendMsg;
    if (overall <= -8) trendMsg = '<span style="color:var(--danger)">📉 اتجاه هابط منذ بداية العام (' + overall + ' نقطة) — يتطلب خطة تصحيحية</span>';
    else if (overall >= 8) trendMsg = '<span style="color:var(--ok)">📈 اتجاه صاعد منذ بداية العام (+' + overall + ' نقطة)</span>';
    else trendMsg = '<span class="muted">مستقر نسبياً منذ بداية العام (' + (overall > 0 ? '+' : '') + overall + ' نقطة)</span>';
    return '<div style="border-top:1px solid var(--border);padding-top:12px;margin-top:10px">' +
      '<div class="flex" style="justify-content:space-between;flex-wrap:wrap"><b class="small">📊 اتجاه مؤشر الصحة شهرياً</b>' +
      '<span class="small">مقارنة بالشهر السابق: ' + arrow + ' نقطة</span></div>' +
      '<div style="margin-top:6px">' + Charts.sCurve(points, { maxY: 100, unit: '', actualLabel: 'المؤشر', plannedLabel: '' }) + '</div>' +
      '<div class="small mt">' + trendMsg + '</div></div>';
  }

  function verdictTile(ico, title, main, sub, cls) {
    const color = cls === 'danger' ? 'var(--danger)' : cls === 'warn' ? 'var(--warn)' : 'var(--ok)';
    return '<div class="card" style="text-align:center;border-color:' + color + '55">' +
      '<div style="font-size:34px">' + ico + '</div>' +
      '<div class="muted small" style="margin:6px 0 4px">' + esc(title) + '</div>' +
      '<div style="font-size:19px;font-weight:800;color:' + color + '">' + main + '</div>' +
      '<div class="small muted" style="margin-top:6px;line-height:1.8">' + sub + '</div></div>';
  }

  /** شريط جاهزية التسليم بنظرة — يظهر عند وجود بيانات تسليم للمشروع */
  function handoverStrip(ctx, P, A) {
    const hi = (A.handoverItems || []).filter(function (x) { return !x.projectId || x.projectId === P.id; });
    if (!hi.length) return '';
    const done = hi.filter(function (i) { return i.status === 'done'; }).length;
    const pct = Math.round(done / hi.length * 100);
    const openPunch = (A.punchList || []).filter(function (x) { return (!x.projectId || x.projectId === P.id) && x.status === 'open'; }).length;
    const expSoon = (A.warranties || []).filter(function (x) {
      if (x.projectId && x.projectId !== P.id) return null;
      const d = x.endDate ? Math.round((new Date(x.endDate) - Date.now()) / 86400000) : null;
      return d != null && d >= 0 && d <= 90;
    }).length;
    const reg = hi.filter(function (i) { return i.group === 'regulatory'; });
    const regDone = reg.filter(function (i) { return i.status === 'done'; }).length;
    const cls = pct >= 90 ? 'ok' : pct >= 50 ? 'warn' : '';
    return '<div class="card" style="margin-top:12px"><div class="flex" style="justify-content:space-between;flex-wrap:wrap">' +
      '<h3 style="margin:0">🏁 جاهزية التسليم بنظرة</h3>' +
      '<button class="btn ghost sm" data-nav="handover">فتح وحدة التسليم ←</button></div>' +
      '<div class="grid g4" style="margin-top:12px">' +
      '<div class="card kpi ' + (cls === 'ok' ? 'k-ok' : cls === 'warn' ? 'k-warn' : '') + '"><div class="lbl">اكتمال بنود التسليم</div>' +
      '<div class="val num">' + pct + '%</div><div class="sub num">' + done + '/' + hi.length + ' بند</div></div>' +
      '<div class="card kpi ' + (openPunch ? 'k-warn' : 'k-ok') + '"><div class="lbl">ملاحظات مفتوحة</div><div class="val num">' + openPunch + '</div><div class="sub">Punch List</div></div>' +
      '<div class="card kpi ' + (regDone < reg.length ? 'k-warn' : 'k-ok') + '"><div class="lbl">الموافقات النظامية</div><div class="val num">' + regDone + '/' + reg.length + '</div><div class="sub">أمانة · دفاع مدني · SEC · إشغال</div></div>' +
      '<div class="card kpi ' + (expSoon ? 'k-warn' : 'k-ok') + '"><div class="lbl">ضمانات قرب الانتهاء</div><div class="val num">' + expSoon + '</div><div class="sub">خلال 90 يوماً</div></div>' +
      '</div></div>';
  }

  function renderOwnerEye(el, ctx) {
    const A = ctx.Sall || ctx.S; // كل مشاريع المستخدم
    const html = A.projects.map(function (P) {
      const g = projectGlance(ctx, P);
      const items = A.boqItems.filter(function (b) { return b.projectId === P.id; });
      const floors = (P.floors || []);

      // شريط الأدوار: نظرة سريعة على إنجاز كل دور
      const floorsStrip = floors.length && items.length ?
        '<div class="card"><h3>🏢 إنجاز الأدوار بنظرة <span class="hint">اضغط أي دور لفتحه في رؤية المشروع</span></h3>' +
        '<div class="flex" style="gap:8px;align-items:stretch">' +
        floors.map(function (f) {
          const p = weightedProgress(items.filter(function (b) { return b.floor === f.id; }));
          if (p == null) return '';
          const t = 0.08 + (p / 100) * 0.84;
          return '<div class="eye-floor" data-goflor="' + f.id + '" data-gopr="' + P.id + '" style="background:' + mixColor('#e0a458', t) + ';' +
            (p >= 95 ? 'box-shadow:0 0 14px rgba(224,164,88,.65);' : '') + '">' +
            '<b class="num" style="color:' + (t > 0.5 ? '#10151f' : '#e9ecf3') + '">' + p + '%</b>' +
            '<span style="color:' + (t > 0.5 ? '#233' : '#8b95a8') + '">' + esc(f.name) + '</span></div>';
        }).join('') + '</div>' +
        '<div class="legend"><span><span class="sw" style="background:#141a26;border:1px solid #26314a"></span>داكن = لم يُنفذ</span>' +
        '<span><span class="sw" style="background:#e0a458;box-shadow:0 0 8px rgba(224,164,88,.8)"></span>ساطع = منفذ ومعتمد</span></div></div>' : '';

      return '<div class="card mb" style="border-color:rgba(224,164,88,.35)">' +
        '<div class="flex" style="justify-content:space-between;flex-wrap:wrap">' +
        '<div><h3 style="font-size:18px;margin-bottom:4px">🏗️ ' + esc(P.name) + '</h3>' +
        '<div class="small muted">' + esc(P.location || '') + ' · الاستشاري: ' + esc(P.consultantName || '—') + '</div></div>' +
        '<div style="text-align:center">' + Charts.donut(Math.round(P.progressActual || 0), { label: 'الإنجاز الفعلي', size: 120 }) + '</div>' +
        '</div></div>' +

        healthCard(ctx, P, A) +

        '<div class="grid g3 mb">' +
        verdictTile(g.timeIco, 'الوقت: المخطط مقابل الفعلي', esc(g.timeVerdict),
          'مضى <b class="num">' + g.elapsedPct + '%</b> من المدة (' + g.elapsed + ' من ' + g.totalDays + ' يوماً)' +
          '<br>التسليم التعاقدي <b class="num">' + esc(P.endPlanned || '—') + '</b> · المتوقع <b class="num">' + esc(P.endForecast || '—') + '</b>', g.timeCls) +
        verdictTile(g.progVar < -3 ? '🟠' : '🟢', 'الإنجاز: المخطط مقابل الفعلي',
          '<span class="num">' + (P.progressActual || 0) + '%</span> مقابل <span class="num">' + (P.progressPlanned || 0) + '%</span> مخطط',
          'الانحراف <b class="num">' + g.progVar + '%</b>' + (g.progVar < -3 ? ' — يلزم تسريع الوتيرة' : ' — ضمن الحدود المقبولة'),
          g.progVar < -8 ? 'danger' : g.progVar < -3 ? 'warn' : 'ok') +
        verdictTile(g.costVar > 0 ? '🟠' : '🟢', 'التكلفة: التقديرية مقابل الفعلية',
          (g.costVar > 0 ? 'تجاوز ' : 'وفر ') + millions(Math.abs(g.costVar)),
          'الفعلي ' + millions(P.costActual || 0) + ' مقابل ' + millions(P.costPlannedToDate || 0) + ' مخطط (' + (g.costVarPct > 0 ? '+' : '') + g.costVarPct + '%)' +
          '<br>الميزانية الكلية ' + millions(P.budgetPlanned || 0),
          g.costVarPct > 10 ? 'danger' : g.costVarPct > 0 ? 'warn' : 'ok') +
        '</div>' + floorsStrip + handoverStrip(ctx, P, A);
    }).join('<hr style="border:none;border-top:1px dashed var(--border);margin:26px 0">');

    el.innerHTML =
      '<div class="card mb" style="background:linear-gradient(120deg,rgba(224,164,88,.12),transparent 60%),linear-gradient(180deg,var(--panel2),var(--panel))">' +
      '<div class="flex"><span style="font-size:40px;filter:drop-shadow(0 0 14px rgba(224,164,88,.7))">👁</span>' +
      '<div><b style="font-size:17px">عين المالك</b><div class="small muted" style="margin-top:4px">حالة مشاريعك بنظرة واحدة: الإنجاز، الزمن، التكلفة — دون الحاجة لقراءة التقارير</div></div>' +
      '<span class="spacer"></span>' +
      '<button class="btn ghost sm" data-nav="vision">👁 رؤية المشروع</button>' +
      '<button class="btn ghost sm" data-nav="cameras">🎥 الكاميرات</button></div></div>' + html;

    el.querySelectorAll('[data-nav]').forEach(function (b) {
      b.addEventListener('click', function () { ctx.nav(b.getAttribute('data-nav')); });
    });
    el.querySelectorAll('[data-goflor]').forEach(function (b) {
      b.addEventListener('click', function () {
        visionState.tab = '2d';
        visionState.floor = b.getAttribute('data-goflor');
        visionState.zone = null;
        const pid = b.getAttribute('data-gopr');
        if (pid && ctx.setProject && pid !== ctx.projectId) { sessionStorage.setItem('bassir-project', pid); ctx.setProject(pid); }
        ctx.nav('vision');
      });
    });
  }

  // ============ كاميرات الموقع ============
  function renderCameras(el, ctx) {
    const cams = ctx.S.cameras || [];
    const canManage = ['consultant', 'admin'].indexOf(ctx.U.role) !== -1;
    const media = (ctx.S.mediaServerUrl || '').replace(/\/+$/, '');
    const now = new Date();
    const ts = now.toISOString().slice(0, 10) + ' ' + now.toTimeString().slice(0, 8);

    el.innerHTML =
      '<div class="card mb"><div class="flex"><span style="font-size:26px">🎥</span>' +
      '<div><b>البث المباشر من الموقع</b><div class="small muted" style="margin-top:3px">' +
      (media ? 'بث RTSP حي عبر خادم الوسائط، ' : '') + 'تُحلَّل اللقطات بذكاء بصير كل 30 دقيقة لاستخراج نسب الإنجاز وتنبيهات السلامة تلقائياً</div></div>' +
      '<span class="spacer"></span>' +
      (media ? '<span class="pill p-ok">📡 خادم البث متصل</span>' : (canManage ? '<span class="pill p-warn">البث الحي غير مهيأ — MEDIA_SERVER_URL</span>' : '')) +
      '<span class="pill p-ok">● ' + cams.filter(function (c) { return c.status === 'online'; }).length + ' كاميرا متصلة</span></div></div>' +

      '<div class="grid g2 mb">' +
      cams.map(function (c, i) {
        const on = c.status === 'online';
        const live = on && media && c.streamPath;
        let feed;
        if (live) {
          // بث حي فعلي: مشغل HLS/WebRTC المدمج في خادم الوسائط (MediaMTX)
          feed = '<iframe src="' + esc(media + '/' + c.streamPath) + '" style="width:100%;height:100%;border:0;position:absolute;inset:0" allow="autoplay" title="' + esc(c.name) + '"></iframe>';
        } else if (on) {
          feed = '<div class="cam-scene">' +
            '<span class="cam-crane" style="animation-delay:' + (i * 1.3) + 's">🏗️</span>' +
            '<span class="cam-bld">🏢</span><span class="cam-wrk" style="animation-delay:' + (i * 0.7) + 's">👷</span>' +
            '</div><div class="scan"></div>' +
            '<div class="cam-osd"><span>' + esc(c.id) + ' · ' + esc(c.location) + '</span><span class="num">' + ts + '</span></div>';
        } else {
          feed = '<div class="empty" style="padding:52px 0"><div class="e-ico">📡</div>انقطع الاتصال — جارٍ إعادة المحاولة</div>';
        }
        return '<div class="card" style="padding:0;overflow:hidden">' +
          '<div class="flex" style="justify-content:space-between;padding:14px 18px">' +
          '<b>' + esc(c.name) + '</b>' +
          (on ? '<span class="pill p-danger"><span class="rec-dot"></span> LIVE' + (live ? ' · RTSP' : '') + '</span>' : '<span class="pill p-muted">غير متصلة</span>') + '</div>' +
          '<div class="cam-feed' + (on ? '' : ' cam-off') + '">' + feed + '</div>' +
          '<div class="flex" style="justify-content:space-between;padding:12px 18px" class="small">' +
          '<span class="small muted">📍 ' + esc(c.location) + ' · مركبة منذ ' + esc(c.installed || '') + '</span>' +
          '<span class="small" style="color:var(--info)">🤖 تحليل AI نشط</span></div></div>';
      }).join('') + '</div>' +

      (canManage ?
        '<div class="card"><h3>➕ ربط كاميرا جديدة</h3><div class="grid" style="grid-template-columns:repeat(5,1fr);gap:10px">' +
        '<div><label class="fl">اسم الكاميرا</label><input class="inp" id="cm-name" placeholder="كاميرا 5 - ..."></div>' +
        '<div><label class="fl">الموقع</label><input class="inp" id="cm-loc" placeholder="الواجهة الغربية"></div>' +
        '<div><label class="fl">رابط المصدر RTSP</label><input class="inp num" id="cm-url" placeholder="rtsp://..." dir="ltr"></div>' +
        '<div><label class="fl">مسار البث (على خادم الوسائط)</label><input class="inp num" id="cm-path" placeholder="cam5" dir="ltr"></div>' +
        '<div><label class="fl">&nbsp;</label><button class="btn block" id="cm-add">ربط الكاميرا</button></div>' +
        '</div>' +
        '<div class="small muted mt">💡 للبث الحي: شغّل خادم الوسائط MediaMTX واضبط فيه مصدر RTSP للكاميرا بنفس المسار، ثم عرّف MEDIA_SERVER_URL في .env — التفاصيل في صفحة التكامل والإعدادات.</div></div>' : '') +

      // تنبيهات السلامة المرصودة من الكاميرات → تقارير حوادث قابلة للأرشفة والطباعة
      (function () {
        const safety = (ctx.S.aiInsights || []).filter(function (a) { return a.severity === 'alert' && (a.kind === 'safety' || a.source === 'camera'); });
        if (!safety.length) return '';
        return '<div class="card mt"><h3>🦺 تنبيهات السلامة من الكاميرات <span class="hint">حوّل أي تنبيه إلى تقرير حادث موثّق وقابل للطباعة</span></h3>' +
          safety.map(function (a) {
            return '<div class="flex" style="justify-content:space-between;border:1px solid var(--border);border-radius:10px;padding:10px 14px;margin-bottom:8px;background:var(--bg2)">' +
              '<div class="small" style="flex:1">🚨 ' + esc(a.note) + '<div class="muted num">' + esc(a.date) + (a.cameraId ? ' · ' + esc(a.cameraId) : '') + '</div></div>' +
              (a.incidentId ? '<span class="pill p-ok">📋 تقرير محفوظ</span>' : '') +
              (canManage ? '<button class="btn ghost sm" data-caminc="' + a.id + '">📋 تقرير حادث</button>' : '') + '</div>';
          }).join('') + '</div>';
      })();

    el.querySelectorAll('[data-caminc]').forEach(function (b) {
      b.addEventListener('click', function () {
        const a = (ctx.S.aiInsights || []).find(function (x) { return x.id === b.getAttribute('data-caminc'); });
        if (a) openIncidentModal(ctx, a);
      });
    });

    const addBtn = el.querySelector('#cm-add');
    if (addBtn) addBtn.addEventListener('click', async function () {
      const name = el.querySelector('#cm-name').value.trim();
      if (!name) { toast('أدخل اسم الكاميرا', true); return; }
      try {
        await Api.create('cameras', {
          name: name, location: el.querySelector('#cm-loc').value,
          url: el.querySelector('#cm-url').value,
          streamPath: (el.querySelector('#cm-path').value || '').trim(),
          status: 'online',
          installed: new Date().toISOString().slice(0, 10)
        });
        toast('✅ رُبطت الكاميرا وبدأ تحليل بثها');
        ctx.refresh();
      } catch (e) { toast(e.message, true); }
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

      healthCard(ctx, P, ctx.S) +

      '<div class="grid g2 mb">' +
      '<div class="card"><h3>📈 الجدول الزمني: المخطط مقابل الفعلي <span class="hint">منحنى S التراكمي</span></h3>' +
      (ctx.S.scheduleCurve.length > 1 ? Charts.sCurve(ctx.S.scheduleCurve) : '<div class="empty"><div class="e-ico">📈</div>لا بيانات جدول زمني لهذا المشروع بعد — يرفعها الاستشاري</div>') + '</div>' +
      '<div class="card"><h3>💰 التكلفة: المخطط مقابل الفعلي <span class="hint">مليون ريال</span></h3>' +
      (ctx.S.costCurve.length > 1 ? Charts.sCurve(ctx.S.costCurve, { maxY: 55, unit: 'م' }) : '<div class="empty"><div class="e-ico">💰</div>لا بيانات تكلفة لهذا المشروع بعد</div>') + '</div>' +
      '</div>' +

      '<div class="grid g2 mb">' +
      '<div class="card"><h3>💵 التدفق النقدي مقابل الإنجاز <span class="hint">الوارد من المالك مقابل المنصرف للمقاولين (مليون ر.س)</span></h3>' +
      ((ctx.S.cashFlow || []).length > 1
        ? Charts.sCurve((ctx.S.cashFlow || []).map(function (c) { return { month: c.month, planned: c.inflow, actual: c.outflow }; }),
            { maxY: 55, unit: 'م', plannedLabel: 'الوارد', actualLabel: 'المنصرف' }) +
          (function () {
            const last = ctx.S.cashFlow[ctx.S.cashFlow.length - 1];
            const net = Math.round((last.inflow - last.outflow) * 10) / 10;
            return '<div class="small muted mt">الإنجاز المرتبط بآخر فترة <b class="num">' + last.progress + '%</b> · صافي التدفق <b class="num" style="color:' + (net >= 0 ? 'var(--ok)' : 'var(--danger)') + '">' + (net > 0 ? '+' : '') + net + ' م</b></div>';
          })()
        : '<div class="empty"><div class="e-ico">💵</div>لا بيانات تدفق نقدي بعد</div>') + '</div>' +
      '<div class="card"><h3>🗂️ مراحل المشروع <span class="hint">' + (ctx.S.scheduleTasks || []).length + ' مرحلة</span></h3>' +
      (ctx.S.scheduleTasks.length ? Charts.compareBars(ctx.S.scheduleTasks.map(function (t) {
        return { label: t.name, actual: t.progress, planned: taskPlanned(t) };
      })) : '<div class="empty"><div class="e-ico">🗂️</div>لم تُسجل مراحل لهذا المشروع بعد</div>') + '</div>' +
      '</div>' +

      '<div class="card"><h3>🔔 تنبيهات بصير الذكية <span class="hint">من تحليل الصور والكاميرات</span></h3>' +
      (alerts.length ? alerts.map(function (a) { return aiItemHtml(a, ctx); }).join('') : '<div class="empty"><div class="e-ico">✨</div>لا توجد تنبيهات حرجة</div>') +
      '<button class="btn ghost sm" data-nav="ai">فتح صفحة الذكاء الاصطناعي ←</button></div>';

    el.querySelectorAll('[data-nav]').forEach(function (b) {
      b.addEventListener('click', function () { ctx.nav(b.getAttribute('data-nav')); });
    });

    // تسجيل لقطة الصحة الشهرية وإطلاق تنبيه تلقائي عند هبوط الدرجة لفئة أدنى
    if (['consultant', 'admin', 'owner'].indexOf(ctx.U.role) !== -1 && ctx.projectId && Api.recordHealth) {
      Api.recordHealth(ctx.projectId).then(function (r) {
        if (r && r.dropped) { toast('📉 تنبيه: تراجعت درجة صحة المشروع — راجع الإشعارات'); ctx.refresh(); }
      }).catch(function () { /* تجاهل */ });
    }
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
  function assigneeName(ctx, id) {
    if (!id) return '';
    const c = ctx && (ctx.Sall || ctx.S).contractors.find(function (x) { return x.id === id; });
    return c ? c.name : id;
  }

  function aiItemHtml(a, ctx) {
    const ico = a.severity === 'alert' ? '🚨' : a.severity === 'warn' ? '⚠️' : '✅';
    const src = a.source === 'camera' ? 'كاميرات الموقع' : a.source === 'photos' ? 'تحليل الصور' : 'تحليل البيانات';
    const assigned = a.assignedTo ? ' · <span class="pill p-info" style="font-size:10px">👤 مسند إلى: ' + esc(assigneeName(ctx, a.assignedTo)) + '</span>' : '';
    return '<div class="ai-item sev-' + a.severity + '"><div class="ai-ico">' + ico + '</div><div style="flex:1">' +
      '<p>' + esc(a.note) + '</p>' +
      '<div class="meta">' + esc(a.date) + ' · المصدر: ' + src + (a.area ? ' · الموقع: ' + esc(a.area) : '') +
      (a.detected != null ? ' · الرصد البصري: <b class="num">' + a.detected + '%</b>' : '') + assigned + '</div></div></div>';
  }

  // تقرير حادث من تنبيه سلامة: ينشئ سجلاً قابلاً للأرشفة ثم يطبعه
  function incidentPrintHtml(ctx, inc) {
    return '<h1>تقرير حادث/مخالفة سلامة — Incident Report</h1>' +
      '<p class="muted">المشروع: ' + esc(ctx.S.projects[0].name) + ' · المرجع: <b>' + esc(inc.ref || '') + '</b>' + (inc.docCode ? ' · ' + esc(inc.docCode) : '') + '</p>' +
      '<table><tbody>' +
      '<tr><th style="width:180px">العنوان</th><td>' + esc(inc.title) + '</td></tr>' +
      '<tr><th>النوع</th><td>' + esc(inc.kind === 'violation' ? 'مخالفة سلامة' : inc.kind === 'incident' ? 'حادث' : 'ملاحظة') + '</td></tr>' +
      '<tr><th>الخطورة</th><td>' + esc(inc.severity === 'high' ? 'عالية' : inc.severity === 'medium' ? 'متوسطة' : 'منخفضة') + '</td></tr>' +
      '<tr><th>الموقع</th><td>' + esc(inc.location || '') + '</td></tr>' +
      '<tr><th>التاريخ/الوقت</th><td>' + esc((inc.date || '') + ' ' + (inc.time || '')) + '</td></tr>' +
      '<tr><th>المصدر</th><td>' + esc(inc.source === 'camera' ? ('كاميرا ' + (inc.cameraId || '')) : inc.source || '') + '</td></tr>' +
      '<tr><th>الجهة المسؤولة</th><td>' + esc(assigneeName(ctx, inc.assignedTo) || '—') + '</td></tr>' +
      '<tr><th>الإجراء المتخذ</th><td>' + esc(inc.action || '') + '</td></tr>' +
      '</tbody></table>';
  }

  function openIncidentModal(ctx, a) {
    const existing = a.incidentId ? (ctx.S.incidents || []).find(function (x) { return x.id === a.incidentId; }) : null;
    const m = modal(
      '<h3>📋 تقرير حادث/سلامة</h3>' +
      '<div class="m-sub">' + esc(a.note || '') + '</div>' +
      '<label class="fl">عنوان التقرير</label><input class="inp" id="in-title" value="' + esc(existing ? existing.title : (a.note || '').slice(0, 80)) + '">' +
      '<div class="grid g2"><div><label class="fl">النوع</label><select class="inp" id="in-kind">' +
      [['violation', 'مخالفة سلامة'], ['incident', 'حادث'], ['observation', 'ملاحظة']].map(function (o) { return '<option value="' + o[0] + '"' + (existing && existing.kind === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div>' +
      '<div><label class="fl">الخطورة</label><select class="inp" id="in-sev">' +
      [['high', 'عالية'], ['medium', 'متوسطة'], ['low', 'منخفضة']].map(function (o) { return '<option value="' + o[0] + '"' + (existing && existing.severity === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div></div>' +
      '<label class="fl">الموقع</label><input class="inp" id="in-loc" value="' + esc(existing ? existing.location : (a.area || '')) + '">' +
      '<label class="fl">الجهة المسؤولة</label><select class="inp" id="in-cont"><option value="">— غير محدد —</option>' +
      ctx.S.contractors.map(function (c) { return '<option value="' + c.id + '"' + ((existing ? existing.assignedTo : a.assignedTo) === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('') + '</select>' +
      '<label class="fl">الإجراء المتخذ / المطلوب</label><textarea class="inp" id="in-action" rows="3">' + esc(existing ? existing.action : '') + '</textarea>' +
      '<div class="m-actions"><button class="btn" id="in-save">💾 حفظ وأرشفة</button><button class="btn ghost" id="in-print">🖨 طباعة</button><button class="btn mutedb" id="in-cancel">إغلاق</button></div>'
    );
    function collect() {
      return {
        title: m.querySelector('#in-title').value, kind: m.querySelector('#in-kind').value,
        severity: m.querySelector('#in-sev').value, location: m.querySelector('#in-loc').value,
        assignedTo: m.querySelector('#in-cont').value, action: m.querySelector('#in-action').value,
        source: a.source || 'camera', cameraId: a.cameraId || null, date: a.date, time: a.time || '',
        ref: existing ? existing.ref : 'INC-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 900 + 100)
      };
    }
    m.querySelector('#in-cancel').addEventListener('click', function () { m.remove(); });
    m.querySelector('#in-print').addEventListener('click', function () {
      window.ViewsHandover.printDoc('تقرير حادث', incidentPrintHtml(ctx, Object.assign({ docCode: existing ? existing.docCode : '' }, collect())));
    });
    m.querySelector('#in-save').addEventListener('click', async function () {
      try {
        if (existing) { await Api.update('incidents', existing.id, collect()); }
        else {
          const inc = await Api.create('incidents', collect());
          await Api.update('aiInsights', a.id, { incidentId: inc.id, assignedTo: inc.assignedTo || a.assignedTo || '' });
        }
        m.remove(); toast('✅ حُفظ تقرير الحادث في الأرشيف'); ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });
  }

  function renderAi(el, ctx) {
    const overall = ctx.S.projects[0].progressActual;
    const visual = 52.1; // متوسط الرصد البصري في الديمو
    const canAnalyze = ['consultant', 'admin'].indexOf(ctx.U.role) !== -1;

    const analyzeCard = canAnalyze ?
      '<div class="card mb"><h3>🔬 تحليل صورة جديدة بعين بصير <span class="hint">رؤية حاسوبية حقيقية (Claude Vision) — تتطلب تهيئة ANTHROPIC_API_KEY على الخادم</span></h3>' +
      '<div class="grid" style="grid-template-columns:2fr 2fr 1fr 1fr;gap:10px;align-items:end">' +
      '<div><label class="fl">صورة من الموقع</label><input class="inp" id="az-file" type="file" accept="image/*"></div>' +
      '<div><label class="fl">المنطقة / البند</label><input class="inp" id="az-area" placeholder="الدور الثاني - لياسة"></div>' +
      '<div><label class="fl">نسبة الاستشاري %</label><input class="inp num" id="az-rep" type="number" min="0" max="100"></div>' +
      '<div><button class="btn block" id="az-go">تحليل</button></div>' +
      '</div><div id="az-out"></div></div>' : '';

    el.innerHTML = analyzeCard +
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
      '<div class="small muted">تُحلَّل اللقطات كل 30 دقيقة لاستخراج نسب الإنجاز وتنبيهات السلامة</div>' +
      '<button class="btn ghost sm mt" data-nav="cameras">🎥 فتح صفحة الكاميرات ←</button></div>' +
      '</div>' +

      // مقارنة ما يرصده الذكاء الاصطناعي بما يرفعه الاستشاري
      '<div class="card mb"><h3>⚖️ مقارنة الرصد البصري (AI) مع نسب الاستشاري <span class="hint">الفرق أكثر من 5% يستوجب تحققاً ميدانياً</span></h3>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>المنطقة / البند</th><th>المصدر</th><th>نسبة الاستشاري</th><th>رصد بصير AI</th><th>الفرق</th><th>الحكم</th></tr></thead><tbody>' +
      ctx.S.aiInsights.filter(function (a) { return a.detected != null && a.reported != null; }).map(function (a) {
        const diff = Math.round((a.detected - a.reported) * 10) / 10;
        const ok = Math.abs(diff) <= 5;
        return '<tr><td><b>' + esc(a.area) + '</b></td>' +
          '<td class="small muted">' + (a.source === 'camera' ? '🎥 كاميرا' : '📸 صور') + '</td>' +
          '<td class="num">' + a.reported + '%</td>' +
          '<td class="num" style="color:var(--info)"><b>' + a.detected + '%</b></td>' +
          '<td class="num" style="color:' + (ok ? 'var(--ok)' : 'var(--danger)') + '">' + (diff > 0 ? '+' : '') + diff + '%</td>' +
          '<td>' + (ok ? '<span class="pill p-ok">متطابق ✓</span>' : '<span class="pill p-danger">انحراف — تحقق ميداني</span>') + '</td></tr>';
      }).join('') + '</tbody></table></div></div>' +

      '<div class="grid g2">' +
      '<div class="card"><h3>🧠 رؤى وتنبيهات بصير <span class="hint">إسناد التنبيهات للجهة المسؤولة وتحويلها لتقارير حوادث</span></h3>' +
      ctx.S.aiInsights.map(function (a) {
        const assignCtl = canAnalyze ?
          '<div class="flex" style="gap:6px;margin:6px 0 4px">' +
          '<select class="inp sm" data-assign="' + a.id + '" style="max-width:200px;padding:5px 10px;font-size:12px"><option value="">— إسناد إلى جهة —</option>' +
          ctx.S.contractors.map(function (c) { return '<option value="' + c.id + '"' + (a.assignedTo === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('') + '</select>' +
          (a.severity === 'alert' && (a.kind === 'safety' || a.source === 'camera') ?
            '<button class="btn ghost sm" data-incident="' + a.id + '">📋 تقرير حادث</button>' : '') +
          '</div>' : '';
        return aiItemHtml(a, ctx) + assignCtl;
      }).join('') + '</div>' +
      '<div class="card"><h3>📸 آخر الصور المُحلَّلة <span class="hint">رفع فريق الموقع</span></h3>' +
      '<div class="grid g2">' + ctx.S.photos.map(function (p) {
        return '<div class="photo-card"><div class="ph">' + (p.url ? '<img src="' + esc(p.url) + '" style="width:100%;height:100%;object-fit:cover" alt="">' : '🏗️') + '<div class="scan"></div></div><div class="info">' +
          '<b>' + esc(p.title) + '</b><div class="muted small">' + esc(p.date) + ' · ' + esc(floorName(ctx, p.area)) + '</div>' +
          '<div class="aiTag">🤖 ' + esc(p.ai) + (p.detected != null ? ' — <b class="num">' + p.detected + '%</b>' : '') + '</div></div></div>';
      }).join('') + '</div></div>' +
      '</div>';

    el.querySelectorAll('[data-nav]').forEach(function (b) {
      b.addEventListener('click', function () { ctx.nav(b.getAttribute('data-nav')); });
    });

    // إسناد التنبيه لجهة مسؤولة (يُشعَر المقاول المسند إليه)
    el.querySelectorAll('[data-assign]').forEach(function (s) {
      s.addEventListener('change', async function () {
        try {
          await Api.update('aiInsights', s.getAttribute('data-assign'), { assignedTo: s.value });
          toast(s.value ? '✅ أُسند التنبيه وأُشعرت الجهة' : 'أُلغي الإسناد'); ctx.refreshSilent();
        } catch (e) { toast(e.message, true); }
      });
    });
    // تحويل تنبيه سلامة إلى تقرير حادث قابل للأرشفة والطباعة
    el.querySelectorAll('[data-incident]').forEach(function (b) {
      b.addEventListener('click', function () {
        const a = ctx.S.aiInsights.find(function (x) { return x.id === b.getAttribute('data-incident'); });
        openIncidentModal(ctx, a);
      });
    });

    const azGo = el.querySelector('#az-go');
    if (azGo) azGo.addEventListener('click', async function () {
      const f = el.querySelector('#az-file').files[0];
      if (!f) { toast('اختر صورة أولاً', true); return; }
      const out = el.querySelector('#az-out');
      out.innerHTML = '<div class="small muted mt">⏳ جارٍ رفع الصورة وتحليلها بالذكاء الاصطناعي...</div>';
      try {
        const up = await Api.upload(f);
        const repVal = el.querySelector('#az-rep').value;
        const r = await Api.analyzePhoto({
          url: up.url, mime: f.type,
          area: el.querySelector('#az-area').value,
          reported: repVal === '' ? null : Number(repVal)
        });
        out.innerHTML = '<div class="ai-item mt sev-' + (r.analysis.safety.length ? 'alert' : 'ok') + '"><div class="ai-ico">🤖</div><div>' +
          '<p><b>الرصد البصري: <span class="num">' + r.analysis.progress + '%</span></b>' +
          (r.diff != null ? ' · الفرق عن نسبة الاستشاري: <b class="num" style="color:' + (Math.abs(r.diff) > 5 ? 'var(--danger)' : 'var(--ok)') + '">' + (r.diff > 0 ? '+' : '') + r.diff + '%</b>' : '') + '</p>' +
          '<p>' + esc(r.analysis.summary) + '</p>' +
          (r.analysis.observations.length ? '<p class="small">🔎 ' + r.analysis.observations.map(esc).join('؛ ') + '</p>' : '') +
          (r.analysis.safety.length ? '<p class="small" style="color:var(--danger)">⚠ ' + r.analysis.safety.map(esc).join('؛ ') + '</p>' : '') +
          '</div></div>';
        toast('✅ اكتمل التحليل وسُجل في رؤى بصير');
        ctx.refreshSilent();
      } catch (e) {
        out.innerHTML = '<div class="small mt" style="color:var(--warn)">⚠ ' + esc(e.message) + '</div>';
      }
    });
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

      '<div class="card mb"><h3>📊 مقارنة الإنجاز الفعلي بالمخطط لكل مقاول <span class="hint">أزرق = المخطط · ذهبي = الفعلي</span></h3>' +
      Charts.compareBars(sums.map(function (s) {
        return { label: s.name, actual: s.progress, planned: s.plannedProgress };
      })) +
      '<div class="small muted mt">المقاول الذي يقل فعليه عن المخطط بأكثر من 3% يُعلَّم متأخراً — ' +
      '<b style="color:var(--danger)">' + delayed.length + '</b> متأخر من ' + sums.length + '.</div></div>' +

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
    else if (st.tab === 'elev') body = renderElev(ctx);
    else body = renderBim(ctx);

    el.innerHTML =
      '<div class="tabs">' +
      '<div class="tab ' + (st.tab === '2d' ? 'active' : '') + '" data-vtab="2d">🗺️ المخططات ثنائية الأبعاد</div>' +
      '<div class="tab ' + (st.tab === 'elev' ? 'active' : '') + '" data-vtab="elev">🏙️ واجهات المبنى</div>' +
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
    el.querySelectorAll('[data-dview]').forEach(function (b) {
      b.addEventListener('click', function () {
        const dr = (ctx.S.planDrawings || []).find(function (x) { return x.id === b.getAttribute('data-dview'); });
        const canEdit = ['consultant', 'admin'].indexOf(ctx.U.role) !== -1;
        if (dr) window.DrawingViewer.open(ctx, 'planDrawings', dr, { canEdit: canEdit, canReview: false });
      });
    });
    // من الواجهة: الضغط على أي دور يفتحه تلقائياً في عرض المخططات مع تفصيل تخصصاته
    el.querySelectorAll('[data-elevfloor]').forEach(function (z) {
      z.addEventListener('click', function () {
        st.tab = '2d'; st.floor = z.getAttribute('data-elevfloor'); st.zone = null;
        renderVision(el, ctx);
      });
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
      // خطوط المخطط الداخلية: باهتة للأعمال غير المنفذة وساطعة للمنفذة المعتمدة
      const lineColor = mixColor(accent, Math.min(1, t * 1.25));
      let hatch = '';
      for (let k = 1; k <= 3; k++) {
        const hy = z.y + (z.h * k) / 4;
        hatch += '<line x1="' + (z.x + 14) + '" y1="' + hy + '" x2="' + (z.x + z.w - 14) + '" y2="' + hy + '" stroke="' + lineColor + '" stroke-width="1.1" stroke-dasharray="' + (done ? 'none' : '7 5') + '" pointer-events="none"/>';
      }
      hatch += '<line x1="' + (z.x + z.w / 2) + '" y1="' + (z.y + 10) + '" x2="' + (z.x + z.w / 2) + '" y2="' + (z.y + z.h - 10) + '" stroke="' + lineColor + '" stroke-width="1.1" stroke-dasharray="' + (done ? 'none' : '7 5') + '" pointer-events="none"/>';
      zonesSvg += '<g class="zone-shape" data-zone="' + i + '">' +
        '<rect x="' + z.x + '" y="' + z.y + '" width="' + z.w + '" height="' + z.h + '" rx="6" fill="' + fill + '" ' +
        'stroke="' + (sel ? '#fff' : done ? accent : '#26314a') + '" stroke-width="' + (sel ? 3 : done ? 2 : 1.4) + '"' +
        (done ? ' filter="url(#glow)"' : '') + '>' +
        '<title>' + esc(z.name) + ' — ' + (p == null ? 'لا بنود' : 'الإنجاز ' + p + '%') + '</title></rect>' + hatch +
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

    // شريط تفصيل التخصصات للدور الحالي: معماري، إنشائي، كهروميكانيكا...
    const discStrip = '<div class="card mb" style="padding:12px 16px"><div class="flex" style="gap:16px">' +
      '<b class="small">📊 إنجاز ' + esc(floorName(ctx, st.floor)) + ' حسب التخصص:</b>' +
      P.disciplines.map(function (d) {
        const p = weightedProgress(itemsFor(ctx, st.floor, d.id, null));
        if (p == null) return '';
        return '<span class="small" style="white-space:nowrap">' + d.icon + ' ' + esc(d.name.replace('الأعمال ', '').replace('أعمال ', '')) +
          ' <b class="num" style="color:' + d.color + '">' + p + '%</b></span>';
      }).join('') + '</div></div>';

    // المخططات المرفوعة المرتبطة بهذا الدور
    const floorDrawings = (ctx.S.planDrawings || []).filter(function (dr) {
      return dr.floor === st.floor && (st.disc === 'all' || dr.discipline === st.disc);
    });
    const drawingsHtml = floorDrawings.length ?
      '<div style="border-top:1px dashed var(--border);margin-top:12px;padding-top:10px">' +
      '<b class="small">📐 المخططات المرتبطة بهذا الدور:</b>' +
      floorDrawings.map(function (dr) {
        return '<div class="small muted flex" style="margin-top:6px;gap:6px">📎 <b class="num">' + esc(dr.ref) + '</b> ' + esc(dr.title) +
          ' <span class="pill p-ok" style="font-size:10px">مربوط بجدول الكميات ✓</span> ' + window.DrawingViewer.btn(dr) + '</div>';
      }).join('') + '</div>' : '';

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
      drawingsHtml +
      '</div>';

    return floorTabs + discStrip +
      '<div class="grid" style="grid-template-columns:1.6fr 1fr"><div class="plan-stage">' + svg + '</div>' + panel + '</div>';
  }

  // ============ واجهات المبنى (High-Rise): كل دور بنسبة إنجازه ============
  function renderElev(ctx) {
    const P = ctx.S.projects[0];
    const st = visionState;
    const accent = st.disc === 'all' ? '#e0a458' : discOf(ctx, st.disc).color;
    const floors = P.floors.slice(); // B1 أسفل ... RF أعلى

    const W = 620, H = 600, bx = 120, bw = 300;
    const fh = 56, baseY = H - 70;
    let svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="direction:ltr">' +
      '<defs><filter id="eglow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';

    // الأرض والسماء
    svg += '<line x1="30" y1="' + baseY + '" x2="' + (W - 30) + '" y2="' + baseY + '" stroke="#33405e" stroke-width="2"/>';
    svg += '<text x="' + (W - 40) + '" y="' + (baseY + 24) + '" fill="#4a5570" font-size="10" text-anchor="end">منسوب الأرض ±0.00</text>';

    floors.forEach(function (f, i) {
      const items = itemsFor(ctx, f.id, st.disc, null);
      const p = weightedProgress(items);
      const t = p == null ? 0.05 : 0.08 + (p / 100) * 0.84;
      const fill = mixColor(accent, t);
      const done = p != null && p >= 95;
      const isBasement = f.id === 'B1';
      const y = baseY - (i) * fh - fh;

      // جسم الدور
      svg += '<g class="bim-floor" data-elevfloor="' + f.id + '"' + (done ? ' filter="url(#eglow)"' : '') + '>' +
        '<rect x="' + bx + '" y="' + y + '" width="' + bw + '" height="' + (fh - 4) + '" rx="3" fill="' + fill + '" ' +
        'stroke="' + (st.floor === f.id ? '#fff' : done ? accent : '#26314a') + '" stroke-width="' + (st.floor === f.id ? 2.5 : 1.2) + '"' + (isBasement ? ' stroke-dasharray="6 4" opacity=".85"' : '') + '>' +
        '<title>' + esc(f.name) + ' — ' + (p == null ? 'لا بنود' : p + '%') + ' (اضغط لفتح الدور)</title></rect>';
      // نوافذ الواجهة: ساطعة للمنجز
      for (let wdw = 0; wdw < 6; wdw++) {
        const wx = bx + 22 + wdw * 45;
        const lit = p != null && (wdw + 1) / 6 * 100 <= p;
        svg += '<rect x="' + wx + '" y="' + (y + 14) + '" width="26" height="' + (fh - 32) + '" rx="2" ' +
          'fill="' + (lit ? mixColor(accent, 1) : '#0c1018') + '" stroke="#1c2536" pointer-events="none"' +
          (lit ? ' opacity=".95"' : ' opacity=".9"') + '/>';
      }
      // التسمية والنسبة
      svg += '<line x1="' + (bx + bw + 6) + '" y1="' + (y + fh / 2) + '" x2="' + (bx + bw + 26) + '" y2="' + (y + fh / 2) + '" stroke="#33405e" pointer-events="none"/>' +
        '<text x="' + (bx + bw + 32) + '" y="' + (y + fh / 2 + 4) + '" fill="' + (st.floor === f.id ? '#fff' : '#8b95a8') + '" font-size="12.5" font-weight="' + (st.floor === f.id ? '800' : '400') + '" text-anchor="start">' +
        (p == null ? '' : p + '% · ') + esc(f.name) + '</text>' +
        '<text x="' + (bx - 12) + '" y="' + (y + fh / 2 + 4) + '" fill="#4a5570" font-size="10" text-anchor="end" pointer-events="none">' + esc(f.id) + '</text></g>';
    });

    // سطح المبنى ورافعة
    const topY = baseY - floors.length * fh - fh + 52;
    svg += '<rect x="' + (bx + 40) + '" y="' + (topY - 26) + '" width="60" height="22" fill="#141a26" stroke="#26314a" pointer-events="none"/>' +
      '<text x="' + (bx + bw - 10) + '" y="' + (topY - 12) + '" font-size="26" text-anchor="end" pointer-events="none">🏗️</text>';
    svg += '</svg>';

    // لوحة جانبية: قائمة الأدوار
    const panel = '<div class="card zone-panel"><h3>🏙️ واجهة المبنى <span class="hint">اضغط أي دور يفتح تلقائياً</span></h3>' +
      '<div class="small muted mb" style="line-height:1.9">مخطط الواجهة مرتبط بجداول كميات كل دور — الأدوار الداكنة لم تكتمل، والساطعة المتوهجة اكتملت واعتُمدت مستخلصاتها. بالضغط على أي دور يفتح النظام مسقطه تلقائياً مع نِسَب المعماري والإنشائي والكهروميكانيكا وبقية التخصصات.</div>' +
      floors.slice().reverse().map(function (f) {
        const p = weightedProgress(itemsFor(ctx, f.id, st.disc, null));
        if (p == null) return '';
        return '<div class="flex" data-elevfloor="' + f.id + '" style="cursor:pointer;justify-content:space-between;border:1px solid var(--border);border-radius:10px;padding:9px 12px;margin-bottom:7px;background:var(--bg2)">' +
          '<span class="small">' + esc(f.name) + '</span>' +
          '<div class="flex" style="flex:1;max-width:150px;margin:0 10px"><div class="bar" style="flex:1"><i style="width:' + p + '%"></i></div></div>' +
          '<b class="num small">' + p + '%</b></div>';
      }).join('') +
      ((ctx.S.planDrawings || []).some(function (d) { return d.floor === 'ELEV'; }) ?
        '<div class="sig">📐 ' + esc(((ctx.S.planDrawings || []).find(function (d) { return d.floor === 'ELEV'; }) || {}).title || '') + ' — مربوط بجدول الكميات</div>' : '') +
      '</div>';

    return '<div class="grid" style="grid-template-columns:1.5fr 1fr"><div class="bim-stage">' + svg + '</div>' + panel + '</div>';
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
  // توليد تقرير تقدم موحّد بضغطة واحدة — عربي/إنجليزي — جاهز للإرسال للعميل
  function progressReportHtml(ctx, period, lang) {
    const P = ctx.S.projects[0] || {};
    const sums = summarize(ctx);
    const tasks = ctx.S.scheduleTasks || [];
    const L = lang === 'en'
      ? { title: 'Project Progress Report', period: period === 'monthly' ? 'Monthly' : 'Weekly', project: 'Project', kpi: 'Key Indicators', actual: 'Actual Progress', planned: 'Planned Progress', variance: 'Variance', cost: 'Cost to date', budget: 'Budget', phases: 'Phases', phase: 'Phase', contractors: 'Contractors', contractor: 'Contractor', prog: 'Progress', status: 'Status', delayed: 'Delayed', ontrack: 'On track' }
      : { title: 'تقرير تقدم المشروع', period: period === 'monthly' ? 'شهري' : 'أسبوعي', project: 'المشروع', kpi: 'المؤشرات الرئيسية', actual: 'الإنجاز الفعلي', planned: 'الإنجاز المخطط', variance: 'الانحراف', cost: 'التكلفة حتى تاريخه', budget: 'الميزانية', phases: 'المراحل', phase: 'المرحلة', contractors: 'المقاولون', contractor: 'المقاول', prog: 'الإنجاز', status: 'الحالة', delayed: 'متأخر', ontrack: 'ضمن الجدول' };
    const variance = Math.round((P.progressActual - P.progressPlanned) * 10) / 10;
    return '<h1>' + L.title + ' — ' + L.period + '</h1>' +
      '<p class="muted">' + L.project + ': <b>' + esc(P.name) + '</b>' + (P.location ? ' — ' + esc(P.location) : '') + '</p>' +
      '<h2>' + L.kpi + '</h2><table><tbody>' +
      '<tr><th style="width:220px">' + L.actual + '</th><td>' + P.progressActual + '%</td></tr>' +
      '<tr><th>' + L.planned + '</th><td>' + P.progressPlanned + '%</td></tr>' +
      '<tr><th>' + L.variance + '</th><td class="' + (variance < 0 ? 'bad' : 'ok') + '">' + (variance > 0 ? '+' : '') + variance + '%</td></tr>' +
      '<tr><th>' + L.cost + '</th><td>' + (P.costActual / 1e6).toFixed(1) + 'M / ' + (P.budgetPlanned / 1e6).toFixed(1) + 'M</td></tr>' +
      '</tbody></table>' +
      '<h2>' + L.phases + '</h2><table><thead><tr><th>' + L.phase + '</th><th>' + L.prog + '</th></tr></thead><tbody>' +
      tasks.map(function (t) { const nm = lang === 'en' ? ((ctx.S.phaseLibrary || []).find(function (l) { return l.key === t.phaseKey; }) || {}).en || t.name : t.name; return '<tr><td>' + esc(nm) + '</td><td>' + (t.progress || 0) + '%</td></tr>'; }).join('') + '</tbody></table>' +
      '<h2>' + L.contractors + '</h2><table><thead><tr><th>' + L.contractor + '</th><th>' + L.actual + '</th><th>' + L.planned + '</th><th>' + L.status + '</th></tr></thead><tbody>' +
      sums.map(function (s) { return '<tr><td>' + esc(s.name) + '</td><td>' + s.progress + '%</td><td>' + s.plannedProgress + '%</td><td class="' + (s.delayed ? 'bad' : 'ok') + '">' + (s.delayed ? L.delayed : L.ontrack) + '</td></tr>'; }).join('') + '</tbody></table>';
  }

  function renderReports(el, ctx) {
    const canSend = ['consultant', 'admin', 'owner_rep', 'owner'].indexOf(ctx.U.role) !== -1;
    el.innerHTML =
      '<div class="card mb"><h3>⚡ توليد تقرير تقدم بضغطة واحدة <span class="hint">جاهز للإرسال للعميل — عربي أو إنجليزي</span></h3>' +
      '<div class="flex" style="flex-wrap:wrap;gap:8px">' +
      '<button class="btn" data-genrep="weekly:ar">📄 تقرير أسبوعي (عربي)</button>' +
      '<button class="btn ghost" data-genrep="weekly:en">📄 Weekly (English)</button>' +
      '<button class="btn" data-genrep="monthly:ar">📊 تقرير شهري (عربي)</button>' +
      '<button class="btn ghost" data-genrep="monthly:en">📊 Monthly (English)</button>' +
      '</div><div class="small muted mt">يجمّع التقرير المؤشرات ونسب المراحل وأداء المقاولين تلقائياً من بيانات المشروع الحالية.</div></div>' +
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
      '<div class="card mb"><h3>🗓️ التقارير الأسبوعية</h3>' +
      (ctx.S.weeklyReports || []).map(function (r) {
        return '<div style="border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px;background:var(--bg2)">' +
          '<div class="flex" style="justify-content:space-between"><b>' + esc(r.title) + '</b>' +
          '<span class="pill ' + (r.progressActual < r.progressPlanned - 3 ? 'p-danger' : 'p-ok') + ' num">' + r.progressActual + '% / ' + r.progressPlanned + '%</span></div>' +
          '<p class="small" style="line-height:1.9;margin-top:8px;color:#c6cdda">' + esc(r.summary) + '</p>' +
          (r.achievements && r.achievements.length ? '<div class="small mt" style="color:var(--ok)">✔ ' + r.achievements.map(esc).join(' · ') + '</div>' : '') +
          (r.issues && r.issues.length ? '<div class="small" style="color:var(--warn);margin-top:4px">⚠ ' + r.issues.map(esc).join(' · ') + '</div>' : '') +
          '<div class="small muted" style="margin-top:8px">📎 ' + ((r.photos || []).length + (r.attachments || []).length) + ' مرفقات · ' + esc(r.by || '') + '</div></div>';
      }).join('') + '</div>' +
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
      '<h3 class="mt">سجل الإرسال <span class="hint">التقارير اليدوية وإشعارات دورة المراجعة الآلية</span></h3>' +
      (ctx.S.messages.length ? '<div class="tbl-wrap" style="max-height:50vh;overflow-y:auto"><table class="tbl"><thead><tr><th>النوع</th><th>القناة</th><th>إلى</th><th>الموضوع</th><th>التاريخ</th><th>الحالة</th></tr></thead><tbody>' +
        ctx.S.messages.slice().reverse().map(function (m) {
          const statusPill = m.status === 'failed' ? '<span class="pill p-danger">فشل الإرسال ✗</span>'
            : m.status === 'sent_demo' ? '<span class="pill p-warn">محاكاة (القناة غير مهيأة)</span>'
            : '<span class="pill p-ok">أُرسل فعلياً ✓</span>';
          return '<tr><td class="small">' + (m.auto ? '🔔 إشعار آلي' : '📄 تقرير') + '</td>' +
            '<td>' + (m.channel === 'whatsapp' ? '💬 واتساب' : '📧 إيميل') + '</td><td class="num">' + esc(m.to || '') + '</td><td class="small">' + esc(m.title) + '</td><td class="small muted num">' + esc(m.date) + '</td><td>' + statusPill + '</td></tr>';
        }).join('') + '</tbody></table></div>' : '<div class="empty">لا رسائل بعد</div>') +
      '</div></div></div>';

    el.querySelectorAll('[data-genrep]').forEach(function (b) {
      b.addEventListener('click', function () {
        const parts = b.getAttribute('data-genrep').split(':');
        const title = (parts[1] === 'en' ? 'Progress Report' : 'تقرير التقدم') + ' — ' + ctx.S.projects[0].name;
        window.ViewsHandover.printDoc(title, progressReportHtml(ctx, parts[0], parts[1]));
      });
    });

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
    summarize: summarize, STATUS: STATUS, esc: esc, att: att,
    renderDashboard: renderDashboard, renderVision: renderVision,
    renderContractors: renderContractors, renderAi: renderAi, renderReports: renderReports,
    renderOwnerEye: renderOwnerEye, renderCameras: renderCameras
  };
})();
