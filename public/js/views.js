/** بصير | الصفحات المشتركة: لوحة القيادة، رؤية المشروع، المقاولون، الذكاء الاصطناعي، التقارير */
(function () {
  'use strict';

  const esc = Charts.esc;

  I18n.registerDict({
    // حالات (STATUS pills)
    'قيد المراجعة': 'Under Review',
    'معتمد': 'Approved',
    'معتمد مع ملاحظات': 'Approved with Notes',
    'مرفوض': 'Rejected',
    'مفتوح': 'Open',
    'تم الرد': 'Answered',
    'صادرة': 'Issued',
    'نُفذت': 'Executed',
    'مغلق': 'Closed',
    'ناجح ✓': 'Passed ✓',
    'راسب ✗': 'Failed ✗',

    // وحدات مالية
    ' ر.س': ' SAR',
    ' مليون ر.س': ' million SAR',

    // عين المالك: أدوات الحكم على الوقت/الإنجاز/التكلفة
    'متأخر ': 'Delayed by ',
    ' يوماً عن الجدول': ' days behind schedule',
    'متقدم ': 'Ahead by ',
    ' يوماً على الجدول': ' days ahead of schedule',
    'ماشٍ حسب الجدول الزمني': 'On track with the schedule',
    'إنجاز الأدوار بنظرة': 'Floor progress at a glance',
    'اضغط أي دور لفتحه في رؤية المشروع': 'Click any floor to open it in Project Vision',
    'داكن = لم يُنفذ': 'Dark = not executed',
    'ساطع = منفذ ومعتمد': 'Bright = executed & approved',
    'الاستشاري:': 'Consultant:',
    'الإنجاز الفعلي': 'Actual Progress',
    'الوقت: المخطط مقابل الفعلي': 'Time: Planned vs Actual',
    'مضى <b class="num">': 'Elapsed <b class="num">',
    '%</b> من المدة (': '%</b> of duration (',
    ' من ': ' of ',
    ' يوماً)': ' days)',
    '<br>التسليم التعاقدي <b class="num">': '<br>Contractual delivery <b class="num">',
    '</b> · المتوقع <b class="num">': '</b> · Forecast <b class="num">',
    'الإنجاز: المخطط مقابل الفعلي': 'Progress: Planned vs Actual',
    '%</span> مقابل <span class="num">': '%</span> vs <span class="num">',
    '%</span> مخطط': '%</span> planned',
    'الانحراف <b class="num">': 'Variance <b class="num">',
    ' — يلزم تسريع الوتيرة': ' — pace needs to accelerate',
    ' — ضمن الحدود المقبولة': ' — within acceptable limits',
    'التكلفة: التقديرية مقابل الفعلية': 'Cost: Estimated vs Actual',
    'تجاوز ': 'Over by ',
    'وفر ': 'Saved ',
    'الفعلي ': 'Actual ',
    ' مقابل ': ' vs ',
    ' مخطط (': ' planned (',
    '<br>الميزانية الكلية ': '<br>Total budget ',
    'عين المالك': "Owner's Eye",
    'حالة مشاريعك بنظرة واحدة: الإنجاز، الزمن، التكلفة — دون الحاجة لقراءة التقارير':
      "Your projects' status at a glance: progress, time, cost — without reading reports",
    'رؤية المشروع': 'Project Vision',
    'الكاميرات': 'Cameras',

    // كاميرات الموقع
    'البث المباشر من الموقع': 'Live Site Broadcast',
    'بث RTSP حي عبر خادم الوسائط، ': 'Live RTSP stream via the media server, ',
    'تُحلَّل اللقطات بذكاء بصير كل 30 دقيقة لاستخراج نسب الإنجاز وتنبيهات السلامة تلقائياً':
      'Footage is analyzed by Bassir AI every 30 minutes to automatically extract progress rates and safety alerts',
    'خادم البث متصل': 'Streaming server connected',
    'البث الحي غير مهيأ — MEDIA_SERVER_URL': 'Live streaming not configured — MEDIA_SERVER_URL',
    'كاميرا متصلة': 'cameras online',
    'انقطع الاتصال — جارٍ إعادة المحاولة': 'Connection lost — retrying',
    'غير متصلة': 'Offline',
    'مركبة منذ ': 'Installed since ',
    'تحليل AI نشط': 'AI analysis active',
    'ربط كاميرا جديدة': 'Connect New Camera',
    'اسم الكاميرا': 'Camera Name',
    'كاميرا 5 - ...': 'Camera 5 - ...',
    'الموقع': 'Location',
    'الواجهة الغربية': 'West Facade',
    'رابط المصدر RTSP': 'RTSP Source URL',
    'مسار البث (على خادم الوسائط)': 'Stream Path (on the media server)',
    'ربط الكاميرا': 'Connect Camera',
    'للبث الحي: شغّل خادم الوسائط MediaMTX واضبط فيه مصدر RTSP للكاميرا بنفس المسار، ثم عرّف MEDIA_SERVER_URL في .env — التفاصيل في صفحة التكامل والإعدادات.':
      "For live streaming: run the MediaMTX media server, configure the camera's RTSP source with the same path, then set MEDIA_SERVER_URL in .env — details on the Integrations & Settings page.",
    'أدخل اسم الكاميرا': 'Enter the camera name',
    '✅ رُبطت الكاميرا وبدأ تحليل بثها': '✅ Camera connected and stream analysis started',

    // لوحة القيادة
    'نسبة الإنجاز الفعلية': 'Actual Progress Rate',
    'المخطط:': 'Planned:',
    'الانحراف': 'Variance',
    'التكلفة الفعلية حتى تاريخه': 'Actual Cost to Date',
    'ضمن الميزانية': 'Within budget',
    'قيمة العقود / الميزانية': 'Contract Value / Budget',
    'التسليم المتوقع:': 'Forecast delivery:',
    'التعاقدي': 'contractual',
    'المقاولون': 'Contractors',
    'متأخر عن الجدول': 'behind schedule',
    'الجميع ضمن الجدول': 'All on schedule',
    'الجدول الزمني: المخطط مقابل الفعلي': 'Schedule: Planned vs Actual',
    'منحنى S التراكمي': 'Cumulative S-curve',
    'التكلفة: المخطط مقابل الفعلي': 'Cost: Planned vs Actual',
    'مليون ريال': 'Million SAR',
    'مراحل المشروع': 'Project Phases',
    'تنبيهات بصير الذكية': 'Bassir Smart Alerts',
    'من تحليل الصور والكاميرات': 'From photo and camera analysis',
    'لا توجد تنبيهات حرجة': 'No critical alerts',
    'فتح صفحة الذكاء الاصطناعي ←': 'Open the AI page ←',

    // الذكاء الاصطناعي
    'كاميرات الموقع': 'Site Cameras',
    'تحليل الصور': 'Photo Analysis',
    'تحليل البيانات': 'Data Analysis',
    'المصدر:': 'Source:',
    'الموقع:': 'Location:',
    'الرصد البصري:': 'Visual Detection:',
    'تحليل صورة جديدة بعين بصير': 'Analyze a New Photo with Bassir Vision',
    'رؤية حاسوبية حقيقية (Claude Vision) — تتطلب تهيئة ANTHROPIC_API_KEY على الخادم':
      'Real computer vision (Claude Vision) — requires ANTHROPIC_API_KEY to be configured on the server',
    'صورة من الموقع': 'Photo from Site',
    'المنطقة / البند': 'Area / Item',
    'الدور الثاني - لياسة': 'Second Floor - Plastering',
    'نسبة الاستشاري %': "Consultant's %",
    'تحليل': 'Analyze',
    'الإنجاز بعين بصير': "Progress through Bassir's Eye",
    'رصد بصري (AI)': 'Visual Detection (AI)',
    'صور و3 كاميرات مثبتة': 'photos and 3 installed cameras',
    'الإنجاز المُبلَّغ': 'Reported Progress',
    'تقارير الموقع': 'Site Reports',
    'وفق مستخلصات وتقارير فريق العمل': "Based on the site team's extracts and reports",
    'الكاميرات المباشرة': 'Live Cameras',
    'كاميرا 1 - الواجهة الشمالية': 'Camera 1 - North Facade',
    'كاميرا 2 - الدور الثالث': 'Camera 2 - Third Floor',
    'كاميرا 3 - السطح': 'Camera 3 - Roof',
    'مباشر': 'Live',
    'تُحلَّل اللقطات كل 30 دقيقة لاستخراج نسب الإنجاز وتنبيهات السلامة':
      'Footage is analyzed every 30 minutes to extract progress rates and safety alerts',
    'فتح صفحة الكاميرات ←': 'Open the Cameras page ←',
    'مقارنة الرصد البصري (AI) مع نسب الاستشاري': "Comparing AI Visual Detection with Consultant's Percentages",
    'الفرق أكثر من 5% يستوجب تحققاً ميدانياً': 'A difference greater than 5% requires field verification',
    'المصدر': 'Source',
    'نسبة الاستشاري': "Consultant %",
    'رصد بصير AI': 'Bassir AI Detection',
    'الفرق': 'Difference',
    'الحكم': 'Verdict',
    'كاميرا': 'Camera',
    'صور': 'Photos',
    'متطابق ✓': 'Matches ✓',
    'انحراف — تحقق ميداني': 'Deviation — field verification required',
    'رؤى وتنبيهات بصير': 'Bassir Insights & Alerts',
    'آخر الصور المُحلَّلة': 'Latest Analyzed Photos',
    'رفع فريق الموقع': 'Uploaded by site team',
    'اختر صورة أولاً': 'Select a photo first',
    'جارٍ رفع الصورة وتحليلها بالذكاء الاصطناعي...': 'Uploading and analyzing the photo with AI...',
    'الفرق عن نسبة الاستشاري:': "Difference from consultant's percentage:",
    '؛ ': ', ',
    '✅ اكتمل التحليل وسُجل في رؤى بصير': '✅ Analysis complete and logged in Bassir Insights',

    // المقاولون والأداء
    'عدد المقاولين في المشروع': 'Number of Contractors on the Project',
    'إجمالي قيم العقود': 'Total Contract Values',
    'لجميع التخصصات': 'Across all disciplines',
    'إجمالي المبالغ المستلمة': 'Total Amounts Received',
    'من قيمة العقود': 'of contract value',
    'مؤشرات الخطر': 'Risk Indicators',
    'متأخر': 'Delayed',
    'صرف أعلى من المستحق': 'overpaid beyond earned value',
    'أداء المقاولين': 'Contractor Performance',
    'الإنجاز محسوب من جداول الكميات المعتمدة': 'Progress calculated from approved BOQs',
    'المقاول': 'Contractor',
    'التخصص': 'Discipline',
    'قيمة العقد': 'Contract Value',
    'نسبة الإنجاز': 'Progress %',
    'المستحق (Earned)': 'Earned Value',
    'المستلم': 'Received',
    'الجدول': 'Schedule',
    'الصرف': 'Payment',
    'المدة': 'Duration',
    'المخطط': 'Planned',
    'ضمن الجدول': 'On schedule',
    'استلم أكثر من مستحقه': 'Received more than earned',
    'سليم': 'OK',

    // رؤية المشروع (2D + واجهات + BIM)
    'جميع البنود': 'All Items',
    'المخططات ثنائية الأبعاد': '2D Drawings',
    'واجهات المبنى': 'Building Facades',
    'نموذج BIM ثلاثي الأبعاد': '3D BIM Model',
    'داكن = أعمال غير منتهية': 'Dark = unfinished works',
    'ساطع = بنود منتهية (مستخلصات معتمدة)': 'Bright = completed items (approved extracts)',
    'اضغط أي منطقة/دور لعرض بنود جدول الكميات المرتبطة بها': 'Click any zone/floor to view its linked BOQ items',
    'الجناح الشمالي الشرقي': 'Northeast Wing',
    'القلب الخدمي': 'Service Core',
    'الجناح الشمالي الغربي': 'Northwest Wing',
    'الجناح الجنوبي الشرقي': 'Southeast Wing',
    'البهو والمصاعد': 'Lobby & Elevators',
    'الجناح الجنوبي الغربي': 'Southwest Wing',
    'لا بنود': 'No items',
    'الإنجاز': 'Progress',
    'إنجاز': 'Progress',
    'ممر الحركة الرئيسي': 'Main Circulation Corridor',
    'حسب التخصص:': 'by discipline:',
    'المخططات المرتبطة بهذا الدور:': 'Drawings linked to this floor:',
    'مربوط بجدول الكميات ✓': 'Linked to BOQ ✓',
    'كل بنود ': 'All items of ',
    'بند': 'item(s)',
    'لا توجد بنود مطابقة للتصفية الحالية': 'No items match the current filter',
    'منسوب الأرض ±0.00': 'Ground level ±0.00',
    ' (اضغط لفتح الدور)': ' (click to open floor)',
    'واجهة المبنى': 'Building Facade',
    'اضغط أي دور يفتح تلقائياً': 'Click any floor to open it automatically',
    'مخطط الواجهة مرتبط بجداول كميات كل دور — الأدوار الداكنة لم تكتمل، والساطعة المتوهجة اكتملت واعتُمدت مستخلصاتها. بالضغط على أي دور يفتح النظام مسقطه تلقائياً مع نِسَب المعماري والإنشائي والكهروميكانيكا وبقية التخصصات.':
      "The facade elevation is linked to each floor's BOQ — dark floors are incomplete, glowing bright floors are complete with approved extracts. Clicking any floor automatically opens its plan with the architectural, structural, MEP, and other discipline percentages.",
    ' — مربوط بجدول الكميات': ' — linked to the BOQ',
    'تفصيل التخصصات': 'Discipline Breakdown',
    'المناطق الساطعة المتوهجة = بنود مكتملة اعتُمدت مستخلصاتها. اضغط أي دور في النموذج لعرض تفاصيله.':
      'Glowing bright areas = completed items with approved extracts. Click any floor in the model to view its details.',
    'نموذج BIM مرفوع بواسطة:': 'BIM model uploaded by:',
    'مرتبط بجدول الكميات (': 'linked to the BOQ (',
    ' بند)': ' items)',

    // التقارير والإرسال
    'التقارير اليومية': 'Daily Reports',
    'تقرير يوم': 'Report for',
    'العمالة:': 'Manpower:',
    'المعدات:': 'Equipment:',
    'صور مرفقة': 'attached photos',
    'أعده:': 'Prepared by:',
    'التقارير الأسبوعية': 'Weekly Reports',
    'مرفقات': 'attachments',
    'التقارير الشهرية': 'Monthly Reports',
    'إرسال التقارير للمالك': 'Send Reports to Owner',
    'القناة': 'Channel',
    'واتساب WhatsApp': 'WhatsApp',
    'البريد الإلكتروني': 'Email',
    'المستلم (رقم / بريد)': 'Recipient (number / email)',
    'أو': 'or',
    'التقرير': 'Report',
    'التقرير اليومي - ': 'Daily Report - ',
    'ملخص أداء المقاولين': 'Contractor Performance Summary',
    'إرسال الآن': 'Send Now',
    'الإرسال متاح للاستشاري وممثل المالك': "Sending is available to the consultant and owner's representative",
    'سجل الإرسال': 'Sending Log',
    'إلى': 'To',
    'التاريخ': 'Date',
    'الحالة': 'Status',
    'واتساب': 'WhatsApp',
    'إيميل': 'Email',
    'محاكاة (القناة غير مهيأة)': 'Simulated (channel not configured)',
    'أُرسل فعلياً ✓': 'Sent successfully ✓',
    'لا رسائل بعد': 'No messages yet',
    '✅ تم إرسال التقرير بنجاح عبر ': '✅ Report sent successfully via '
  });

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
    return '<span class="pill ' + s[1] + '">' + esc(I18n.t(s[0])) + '</span>';
  }

  function money(n) { return n == null ? '—' : '<span class="num">' + Number(n).toLocaleString('en-US') + '</span>' + I18n.t(' ر.س'); }

  /** عرض مرفق: رابط قابل للفتح إن كان مرفوعاً فعلياً على الخادم، وإلا الاسم فقط */
  function att(f) {
    if (!f) return '';
    if (typeof f === 'string') return esc(f);
    if (f.url) return '<a href="' + esc(f.url) + '" target="_blank" style="color:var(--info)">' + esc(f.name) + ' ⬇</a>';
    return esc(f.name || '');
  }
  function millions(n) { return '<span class="num">' + (n / 1e6).toFixed(1) + '</span>' + I18n.t(' مليون ر.س'); }

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
    if (delayDays > 7) { timeVerdict = I18n.t('متأخر ') + delayDays + I18n.t(' يوماً عن الجدول'); timeCls = 'danger'; timeIco = '🔴'; }
    else if (delayDays < -7) { timeVerdict = I18n.t('متقدم ') + Math.abs(delayDays) + I18n.t(' يوماً على الجدول'); timeCls = 'ok'; timeIco = '🟢'; }
    else { timeVerdict = I18n.t('ماشٍ حسب الجدول الزمني'); timeCls = 'ok'; timeIco = '🟢'; }
    return {
      delayDays: delayDays, progVar: progVar, costVar: costVar, costVarPct: costVarPct,
      elapsedPct: elapsedPct, elapsed: elapsed, totalDays: totalDays,
      timeVerdict: timeVerdict, timeCls: timeCls, timeIco: timeIco
    };
  }

  function verdictTile(ico, title, main, sub, cls) {
    const color = cls === 'danger' ? 'var(--danger)' : cls === 'warn' ? 'var(--warn)' : 'var(--ok)';
    return '<div class="card" style="text-align:center;border-color:' + color + '55">' +
      '<div style="font-size:34px">' + ico + '</div>' +
      '<div class="muted small" style="margin:6px 0 4px">' + esc(title) + '</div>' +
      '<div style="font-size:19px;font-weight:800;color:' + color + '">' + main + '</div>' +
      '<div class="small muted" style="margin-top:6px;line-height:1.8">' + sub + '</div></div>';
  }

  function renderOwnerEye(el, ctx) {
    const html = ctx.S.projects.map(function (P) {
      const g = projectGlance(ctx, P);
      const items = ctx.S.boqItems.filter(function (b) { return b.projectId === P.id; });
      const floors = (P.floors || []);

      // شريط الأدوار: نظرة سريعة على إنجاز كل دور
      const floorsStrip = floors.length && items.length ?
        '<div class="card"><h3>🏢 ' + I18n.t('إنجاز الأدوار بنظرة') + ' <span class="hint">' + I18n.t('اضغط أي دور لفتحه في رؤية المشروع') + '</span></h3>' +
        '<div class="flex" style="gap:8px;align-items:stretch">' +
        floors.map(function (f) {
          const p = weightedProgress(items.filter(function (b) { return b.floor === f.id; }));
          if (p == null) return '';
          const t = 0.08 + (p / 100) * 0.84;
          return '<div class="eye-floor" data-goflor="' + f.id + '" style="background:' + mixColor('#e0a458', t) + ';' +
            (p >= 95 ? 'box-shadow:0 0 14px rgba(224,164,88,.65);' : '') + '">' +
            '<b class="num" style="color:' + (t > 0.5 ? '#10151f' : '#e9ecf3') + '">' + p + '%</b>' +
            '<span style="color:' + (t > 0.5 ? '#233' : '#8b95a8') + '">' + esc(f.name) + '</span></div>';
        }).join('') + '</div>' +
        '<div class="legend"><span><span class="sw" style="background:#141a26;border:1px solid #26314a"></span>' + I18n.t('داكن = لم يُنفذ') + '</span>' +
        '<span><span class="sw" style="background:#e0a458;box-shadow:0 0 8px rgba(224,164,88,.8)"></span>' + I18n.t('ساطع = منفذ ومعتمد') + '</span></div></div>' : '';

      return '<div class="card mb" style="border-color:rgba(224,164,88,.35)">' +
        '<div class="flex" style="justify-content:space-between;flex-wrap:wrap">' +
        '<div><h3 style="font-size:18px;margin-bottom:4px">🏗️ ' + esc(P.name) + '</h3>' +
        '<div class="small muted">' + esc(P.location || '') + ' · ' + I18n.t('الاستشاري:') + ' ' + esc(P.consultantName || '—') + '</div></div>' +
        '<div style="text-align:center">' + Charts.donut(Math.round(P.progressActual || 0), { label: I18n.t('الإنجاز الفعلي'), size: 120 }) + '</div>' +
        '</div></div>' +

        '<div class="grid g3 mb">' +
        verdictTile(g.timeIco, I18n.t('الوقت: المخطط مقابل الفعلي'), esc(g.timeVerdict),
          I18n.t('مضى <b class="num">') + g.elapsedPct + I18n.t('%</b> من المدة (') + g.elapsed + I18n.t(' من ') + g.totalDays + I18n.t(' يوماً)') +
          I18n.t('<br>التسليم التعاقدي <b class="num">') + esc(P.endPlanned || '—') + I18n.t('</b> · المتوقع <b class="num">') + esc(P.endForecast || '—') + '</b>', g.timeCls) +
        verdictTile(g.progVar < -3 ? '🟠' : '🟢', I18n.t('الإنجاز: المخطط مقابل الفعلي'),
          '<span class="num">' + (P.progressActual || 0) + I18n.t('%</span> مقابل <span class="num">') + (P.progressPlanned || 0) + I18n.t('%</span> مخطط'),
          I18n.t('الانحراف <b class="num">') + g.progVar + '%</b>' + (g.progVar < -3 ? I18n.t(' — يلزم تسريع الوتيرة') : I18n.t(' — ضمن الحدود المقبولة')),
          g.progVar < -8 ? 'danger' : g.progVar < -3 ? 'warn' : 'ok') +
        verdictTile(g.costVar > 0 ? '🟠' : '🟢', I18n.t('التكلفة: التقديرية مقابل الفعلية'),
          I18n.t(g.costVar > 0 ? 'تجاوز ' : 'وفر ') + millions(Math.abs(g.costVar)),
          I18n.t('الفعلي ') + millions(P.costActual || 0) + I18n.t(' مقابل ') + millions(P.costPlannedToDate || 0) + I18n.t(' مخطط (') + (g.costVarPct > 0 ? '+' : '') + g.costVarPct + '%)' +
          I18n.t('<br>الميزانية الكلية ') + millions(P.budgetPlanned || 0),
          g.costVarPct > 10 ? 'danger' : g.costVarPct > 0 ? 'warn' : 'ok') +
        '</div>' + floorsStrip;
    }).join('<hr style="border:none;border-top:1px dashed var(--border);margin:26px 0">');

    el.innerHTML =
      '<div class="card mb" style="background:linear-gradient(120deg,rgba(224,164,88,.12),transparent 60%),linear-gradient(180deg,var(--panel2),var(--panel))">' +
      '<div class="flex"><span style="font-size:40px;filter:drop-shadow(0 0 14px rgba(224,164,88,.7))">👁</span>' +
      '<div><b style="font-size:17px">' + I18n.t('عين المالك') + '</b><div class="small muted" style="margin-top:4px">' + I18n.t('حالة مشاريعك بنظرة واحدة: الإنجاز، الزمن، التكلفة — دون الحاجة لقراءة التقارير') + '</div></div>' +
      '<span class="spacer"></span>' +
      '<button class="btn ghost sm" data-nav="vision">👁 ' + I18n.t('رؤية المشروع') + '</button>' +
      '<button class="btn ghost sm" data-nav="cameras">🎥 ' + I18n.t('الكاميرات') + '</button></div></div>' + html;

    el.querySelectorAll('[data-nav]').forEach(function (b) {
      b.addEventListener('click', function () { ctx.nav(b.getAttribute('data-nav')); });
    });
    el.querySelectorAll('[data-goflor]').forEach(function (b) {
      b.addEventListener('click', function () {
        visionState.tab = '2d';
        visionState.floor = b.getAttribute('data-goflor');
        visionState.zone = null;
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
      '<div><b>' + I18n.t('البث المباشر من الموقع') + '</b><div class="small muted" style="margin-top:3px">' +
      (media ? I18n.t('بث RTSP حي عبر خادم الوسائط، ') : '') + I18n.t('تُحلَّل اللقطات بذكاء بصير كل 30 دقيقة لاستخراج نسب الإنجاز وتنبيهات السلامة تلقائياً') + '</div></div>' +
      '<span class="spacer"></span>' +
      (media ? '<span class="pill p-ok">📡 ' + I18n.t('خادم البث متصل') + '</span>' : (canManage ? '<span class="pill p-warn">' + I18n.t('البث الحي غير مهيأ — MEDIA_SERVER_URL') + '</span>' : '')) +
      '<span class="pill p-ok">● ' + cams.filter(function (c) { return c.status === 'online'; }).length + ' ' + I18n.t('كاميرا متصلة') + '</span></div></div>' +

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
          feed = '<div class="empty" style="padding:52px 0"><div class="e-ico">📡</div>' + I18n.t('انقطع الاتصال — جارٍ إعادة المحاولة') + '</div>';
        }
        return '<div class="card" style="padding:0;overflow:hidden">' +
          '<div class="flex" style="justify-content:space-between;padding:14px 18px">' +
          '<b>' + esc(c.name) + '</b>' +
          (on ? '<span class="pill p-danger"><span class="rec-dot"></span> LIVE' + (live ? ' · RTSP' : '') + '</span>' : '<span class="pill p-muted">' + I18n.t('غير متصلة') + '</span>') + '</div>' +
          '<div class="cam-feed' + (on ? '' : ' cam-off') + '">' + feed + '</div>' +
          '<div class="flex" style="justify-content:space-between;padding:12px 18px" class="small">' +
          '<span class="small muted">📍 ' + esc(c.location) + ' · ' + I18n.t('مركبة منذ ') + esc(c.installed || '') + '</span>' +
          '<span class="small" style="color:var(--info)">🤖 ' + I18n.t('تحليل AI نشط') + '</span></div></div>';
      }).join('') + '</div>' +

      (canManage ?
        '<div class="card"><h3>➕ ' + I18n.t('ربط كاميرا جديدة') + '</h3><div class="grid" style="grid-template-columns:repeat(5,1fr);gap:10px">' +
        '<div><label class="fl">' + I18n.t('اسم الكاميرا') + '</label><input class="inp" id="cm-name" placeholder="' + I18n.t('كاميرا 5 - ...') + '"></div>' +
        '<div><label class="fl">' + I18n.t('الموقع') + '</label><input class="inp" id="cm-loc" placeholder="' + I18n.t('الواجهة الغربية') + '"></div>' +
        '<div><label class="fl">' + I18n.t('رابط المصدر RTSP') + '</label><input class="inp num" id="cm-url" placeholder="rtsp://..." dir="ltr"></div>' +
        '<div><label class="fl">' + I18n.t('مسار البث (على خادم الوسائط)') + '</label><input class="inp num" id="cm-path" placeholder="cam5" dir="ltr"></div>' +
        '<div><label class="fl">&nbsp;</label><button class="btn block" id="cm-add">' + I18n.t('ربط الكاميرا') + '</button></div>' +
        '</div>' +
        '<div class="small muted mt">💡 ' + I18n.t('للبث الحي: شغّل خادم الوسائط MediaMTX واضبط فيه مصدر RTSP للكاميرا بنفس المسار، ثم عرّف MEDIA_SERVER_URL في .env — التفاصيل في صفحة التكامل والإعدادات.') + '</div></div>' : '');

    const addBtn = el.querySelector('#cm-add');
    if (addBtn) addBtn.addEventListener('click', async function () {
      const name = el.querySelector('#cm-name').value.trim();
      if (!name) { toast(I18n.t('أدخل اسم الكاميرا'), true); return; }
      try {
        await Api.create('cameras', {
          name: name, location: el.querySelector('#cm-loc').value,
          url: el.querySelector('#cm-url').value,
          streamPath: (el.querySelector('#cm-path').value || '').trim(),
          status: 'online',
          installed: new Date().toISOString().slice(0, 10)
        });
        toast(I18n.t('✅ رُبطت الكاميرا وبدأ تحليل بثها'));
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
      '<div class="card kpi"><div class="lbl">' + I18n.t('نسبة الإنجاز الفعلية') + '</div><div class="val num">' + P.progressActual + '%</div>' +
      '<div class="sub">' + I18n.t('المخطط:') + ' <b class="num">' + P.progressPlanned + '%</b> · ' + I18n.t('الانحراف') + ' <b class="' + (variance < 0 ? 'trend-down' : 'trend-up') + ' num">' + variance + '%</b></div></div>' +
      '<div class="card kpi ' + (costVar > 0 ? 'k-danger' : 'k-ok') + '"><div class="lbl">' + I18n.t('التكلفة الفعلية حتى تاريخه') + '</div><div class="val">' + millions(P.costActual) + '</div>' +
      '<div class="sub">' + I18n.t('المخطط:') + ' ' + millions(P.costPlannedToDate) + ' · ' + (costVar > 0 ? '<span class="trend-down">' + I18n.t('تجاوز ') + millions(costVar) + '</span>' : '<span class="trend-up">' + I18n.t('ضمن الميزانية') + '</span>') + '</div></div>' +
      '<div class="card kpi k-info"><div class="lbl">' + I18n.t('قيمة العقود / الميزانية') + '</div><div class="val">' + millions(P.budgetPlanned) + '</div>' +
      '<div class="sub">' + I18n.t('التسليم المتوقع:') + ' <b>' + esc(P.endForecast) + '</b> (' + I18n.t('التعاقدي') + ' ' + esc(P.endPlanned) + ')</div></div>' +
      '<div class="card kpi ' + (delayedCount ? 'k-warn' : 'k-ok') + '"><div class="lbl">' + I18n.t('المقاولون') + '</div><div class="val num">' + sums.length + '</div>' +
      '<div class="sub">' + (delayedCount ? '<span class="trend-down">' + delayedCount + ' ' + I18n.t('متأخر عن الجدول') + '</span>' : '<span class="trend-up">' + I18n.t('الجميع ضمن الجدول') + '</span>') + '</div></div>' +
      '</div>' +

      '<div class="grid g2 mb">' +
      '<div class="card"><h3>📈 ' + I18n.t('الجدول الزمني: المخطط مقابل الفعلي') + ' <span class="hint">' + I18n.t('منحنى S التراكمي') + '</span></h3>' + Charts.sCurve(ctx.S.scheduleCurve) + '</div>' +
      '<div class="card"><h3>💰 ' + I18n.t('التكلفة: المخطط مقابل الفعلي') + ' <span class="hint">' + I18n.t('مليون ريال') + '</span></h3>' + Charts.sCurve(ctx.S.costCurve, { maxY: 55, unit: 'م' }) + '</div>' +
      '</div>' +

      '<div class="grid g2">' +
      '<div class="card"><h3>🗂️ ' + I18n.t('مراحل المشروع') + '</h3>' +
      Charts.compareBars(ctx.S.scheduleTasks.map(function (t) {
        return { label: t.name, actual: t.progress, planned: taskPlanned(t) };
      })) + '</div>' +
      '<div class="card"><h3>🔔 ' + I18n.t('تنبيهات بصير الذكية') + ' <span class="hint">' + I18n.t('من تحليل الصور والكاميرات') + '</span></h3>' +
      (alerts.length ? alerts.map(aiItemHtml).join('') : '<div class="empty"><div class="e-ico">✨</div>' + I18n.t('لا توجد تنبيهات حرجة') + '</div>') +
      '<button class="btn ghost sm" data-nav="ai">' + I18n.t('فتح صفحة الذكاء الاصطناعي ←') + '</button></div>' +
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
    const src = a.source === 'camera' ? I18n.t('كاميرات الموقع') : a.source === 'photos' ? I18n.t('تحليل الصور') : I18n.t('تحليل البيانات');
    return '<div class="ai-item sev-' + a.severity + '"><div class="ai-ico">' + ico + '</div><div style="flex:1">' +
      '<p>' + esc(a.note) + '</p>' +
      '<div class="meta">' + esc(a.date) + ' · ' + I18n.t('المصدر:') + ' ' + src + (a.area ? ' · ' + I18n.t('الموقع:') + ' ' + esc(a.area) : '') +
      (a.detected != null ? ' · ' + I18n.t('الرصد البصري:') + ' <b class="num">' + a.detected + '%</b>' : '') + '</div></div></div>';
  }

  function renderAi(el, ctx) {
    const overall = ctx.S.projects[0].progressActual;
    const visual = 52.1; // متوسط الرصد البصري في الديمو
    const canAnalyze = ['consultant', 'admin'].indexOf(ctx.U.role) !== -1;

    const analyzeCard = canAnalyze ?
      '<div class="card mb"><h3>🔬 ' + I18n.t('تحليل صورة جديدة بعين بصير') + ' <span class="hint">' + I18n.t('رؤية حاسوبية حقيقية (Claude Vision) — تتطلب تهيئة ANTHROPIC_API_KEY على الخادم') + '</span></h3>' +
      '<div class="grid" style="grid-template-columns:2fr 2fr 1fr 1fr;gap:10px;align-items:end">' +
      '<div><label class="fl">' + I18n.t('صورة من الموقع') + '</label><input class="inp" id="az-file" type="file" accept="image/*"></div>' +
      '<div><label class="fl">' + I18n.t('المنطقة / البند') + '</label><input class="inp" id="az-area" placeholder="' + I18n.t('الدور الثاني - لياسة') + '"></div>' +
      '<div><label class="fl">' + I18n.t('نسبة الاستشاري %') + '</label><input class="inp num" id="az-rep" type="number" min="0" max="100"></div>' +
      '<div><button class="btn block" id="az-go">' + I18n.t('تحليل') + '</button></div>' +
      '</div><div id="az-out"></div></div>' : '';

    el.innerHTML = analyzeCard +
      '<div class="grid g3 mb">' +
      '<div class="card" style="text-align:center"><h3 style="justify-content:center">👁 ' + I18n.t('الإنجاز بعين بصير') + '</h3>' +
      Charts.donut(visual, { label: I18n.t('رصد بصري (AI)') }) +
      '<div class="small muted mt">' + I18n.t('تحليل') + ' ' + ctx.S.photos.length + ' ' + I18n.t('صور و3 كاميرات مثبتة') + '</div></div>' +
      '<div class="card" style="text-align:center"><h3 style="justify-content:center">📋 ' + I18n.t('الإنجاز المُبلَّغ') + '</h3>' +
      Charts.donut(overall, { label: I18n.t('تقارير الموقع'), color: '#4cc9f0' }) +
      '<div class="small muted mt">' + I18n.t('وفق مستخلصات وتقارير فريق العمل') + '</div></div>' +
      '<div class="card"><h3>🎥 ' + I18n.t('الكاميرات المباشرة') + '</h3>' +
      [I18n.t('كاميرا 1 - الواجهة الشمالية'), I18n.t('كاميرا 2 - الدور الثالث'), I18n.t('كاميرا 3 - السطح')].map(function (c, i) {
        return '<div class="flex" style="justify-content:space-between;border:1px solid var(--border);border-radius:10px;padding:10px 14px;margin-bottom:8px;background:var(--bg2)">' +
          '<span class="small">📡 ' + c + '</span><span class="pill p-ok">● ' + I18n.t('مباشر') + '</span></div>';
      }).join('') +
      '<div class="small muted">' + I18n.t('تُحلَّل اللقطات كل 30 دقيقة لاستخراج نسب الإنجاز وتنبيهات السلامة') + '</div>' +
      '<button class="btn ghost sm mt" data-nav="cameras">🎥 ' + I18n.t('فتح صفحة الكاميرات ←') + '</button></div>' +
      '</div>' +

      // مقارنة ما يرصده الذكاء الاصطناعي بما يرفعه الاستشاري
      '<div class="card mb"><h3>⚖️ ' + I18n.t('مقارنة الرصد البصري (AI) مع نسب الاستشاري') + ' <span class="hint">' + I18n.t('الفرق أكثر من 5% يستوجب تحققاً ميدانياً') + '</span></h3>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>' + I18n.t('المنطقة / البند') + '</th><th>' + I18n.t('المصدر') + '</th><th>' + I18n.t('نسبة الاستشاري') + '</th><th>' + I18n.t('رصد بصير AI') + '</th><th>' + I18n.t('الفرق') + '</th><th>' + I18n.t('الحكم') + '</th></tr></thead><tbody>' +
      ctx.S.aiInsights.filter(function (a) { return a.detected != null && a.reported != null; }).map(function (a) {
        const diff = Math.round((a.detected - a.reported) * 10) / 10;
        const ok = Math.abs(diff) <= 5;
        return '<tr><td><b>' + esc(a.area) + '</b></td>' +
          '<td class="small muted">' + (a.source === 'camera' ? '🎥 ' + I18n.t('كاميرا') : '📸 ' + I18n.t('صور')) + '</td>' +
          '<td class="num">' + a.reported + '%</td>' +
          '<td class="num" style="color:var(--info)"><b>' + a.detected + '%</b></td>' +
          '<td class="num" style="color:' + (ok ? 'var(--ok)' : 'var(--danger)') + '">' + (diff > 0 ? '+' : '') + diff + '%</td>' +
          '<td>' + (ok ? '<span class="pill p-ok">' + I18n.t('متطابق ✓') + '</span>' : '<span class="pill p-danger">' + I18n.t('انحراف — تحقق ميداني') + '</span>') + '</td></tr>';
      }).join('') + '</tbody></table></div></div>' +

      '<div class="grid g2">' +
      '<div class="card"><h3>🧠 ' + I18n.t('رؤى وتنبيهات بصير') + '</h3>' + ctx.S.aiInsights.map(aiItemHtml).join('') + '</div>' +
      '<div class="card"><h3>📸 ' + I18n.t('آخر الصور المُحلَّلة') + ' <span class="hint">' + I18n.t('رفع فريق الموقع') + '</span></h3>' +
      '<div class="grid g2">' + ctx.S.photos.map(function (p) {
        return '<div class="photo-card"><div class="ph">' + (p.url ? '<img src="' + esc(p.url) + '" style="width:100%;height:100%;object-fit:cover" alt="">' : '🏗️') + '<div class="scan"></div></div><div class="info">' +
          '<b>' + esc(p.title) + '</b><div class="muted small">' + esc(p.date) + ' · ' + esc(floorName(ctx, p.area)) + '</div>' +
          '<div class="aiTag">🤖 ' + esc(p.ai) + (p.detected != null ? ' — <b class="num">' + p.detected + '%</b>' : '') + '</div></div></div>';
      }).join('') + '</div></div>' +
      '</div>';

    el.querySelectorAll('[data-nav]').forEach(function (b) {
      b.addEventListener('click', function () { ctx.nav(b.getAttribute('data-nav')); });
    });

    const azGo = el.querySelector('#az-go');
    if (azGo) azGo.addEventListener('click', async function () {
      const f = el.querySelector('#az-file').files[0];
      if (!f) { toast(I18n.t('اختر صورة أولاً'), true); return; }
      const out = el.querySelector('#az-out');
      out.innerHTML = '<div class="small muted mt">⏳ ' + I18n.t('جارٍ رفع الصورة وتحليلها بالذكاء الاصطناعي...') + '</div>';
      try {
        const up = await Api.upload(f);
        const repVal = el.querySelector('#az-rep').value;
        const r = await Api.analyzePhoto({
          url: up.url, mime: f.type,
          area: el.querySelector('#az-area').value,
          reported: repVal === '' ? null : Number(repVal)
        });
        out.innerHTML = '<div class="ai-item mt sev-' + (r.analysis.safety.length ? 'alert' : 'ok') + '"><div class="ai-ico">🤖</div><div>' +
          '<p><b>' + I18n.t('الرصد البصري:') + ' <span class="num">' + r.analysis.progress + '%</span></b>' +
          (r.diff != null ? ' · ' + I18n.t('الفرق عن نسبة الاستشاري:') + ' <b class="num" style="color:' + (Math.abs(r.diff) > 5 ? 'var(--danger)' : 'var(--ok)') + '">' + (r.diff > 0 ? '+' : '') + r.diff + '%</b>' : '') + '</p>' +
          '<p>' + esc(r.analysis.summary) + '</p>' +
          (r.analysis.observations.length ? '<p class="small">🔎 ' + r.analysis.observations.map(esc).join(I18n.t('؛ ')) + '</p>' : '') +
          (r.analysis.safety.length ? '<p class="small" style="color:var(--danger)">⚠ ' + r.analysis.safety.map(esc).join(I18n.t('؛ ')) + '</p>' : '') +
          '</div></div>';
        toast(I18n.t('✅ اكتمل التحليل وسُجل في رؤى بصير'));
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
      '<div class="card kpi"><div class="lbl">' + I18n.t('عدد المقاولين في المشروع') + '</div><div class="val num">' + sums.length + '</div><div class="sub">' + esc(sums.map(function (s) { return discOf(ctx, s.type).icon; }).join(' ')) + '</div></div>' +
      '<div class="card kpi k-info"><div class="lbl">' + I18n.t('إجمالي قيم العقود') + '</div><div class="val">' + millions(totalContracts) + '</div><div class="sub">' + I18n.t('لجميع التخصصات') + '</div></div>' +
      '<div class="card kpi"><div class="lbl">' + I18n.t('إجمالي المبالغ المستلمة') + '</div><div class="val">' + millions(totalReceived) + '</div><div class="sub num">' + Math.round(totalReceived / totalContracts * 100) + '% ' + I18n.t('من قيمة العقود') + '</div></div>' +
      '<div class="card kpi ' + (delayed.length || overpaid.length ? 'k-danger' : 'k-ok') + '"><div class="lbl">' + I18n.t('مؤشرات الخطر') + '</div><div class="val num">' + (delayed.length + overpaid.length) + '</div>' +
      '<div class="sub">' + delayed.length + ' ' + I18n.t('متأخر') + ' · ' + overpaid.length + ' ' + I18n.t('صرف أعلى من المستحق') + '</div></div>' +
      '</div>' +

      '<div class="card"><h3>👷 ' + I18n.t('أداء المقاولين') + ' <span class="hint">' + I18n.t('الإنجاز محسوب من جداول الكميات المعتمدة') + '</span></h3>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
      '<th>' + I18n.t('المقاول') + '</th><th>' + I18n.t('التخصص') + '</th><th>' + I18n.t('قيمة العقد') + '</th><th>' + I18n.t('نسبة الإنجاز') + '</th><th>' + I18n.t('المستحق (Earned)') + '</th><th>' + I18n.t('المستلم') + '</th><th>' + I18n.t('الجدول') + '</th><th>' + I18n.t('الصرف') + '</th><th>' + I18n.t('المدة') + '</th>' +
      '</tr></thead><tbody>' +
      sums.map(function (s) {
        const d = discOf(ctx, s.type);
        return '<tr>' +
          '<td><b>' + esc(s.name) + '</b></td>' +
          '<td><span class="pill p-muted">' + d.icon + ' ' + esc(d.name) + '</span></td>' +
          '<td>' + money(s.contractValue) + '</td>' +
          '<td><div class="flex"><div class="bar ' + (s.delayed ? 'b-danger' : 'b-ok') + '" style="flex:1"><i style="width:' + s.progress + '%"></i></div><b class="num">' + s.progress + '%</b></div>' +
          '<div class="small muted num">' + I18n.t('المخطط') + ' ' + s.plannedProgress + '%</div></td>' +
          '<td>' + money(s.earnedValue) + '</td>' +
          '<td>' + money(s.amountReceived) + '</td>' +
          '<td>' + (s.delayed ? '<span class="pill p-danger">' + I18n.t('متأخر') + '</span>' : '<span class="pill p-ok">' + I18n.t('ضمن الجدول') + '</span>') + '</td>' +
          '<td>' + (s.overpaid ? '<span class="pill p-danger">' + I18n.t('استلم أكثر من مستحقه') + '</span>' : '<span class="pill p-ok">' + I18n.t('سليم') + '</span>') + '</td>' +
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
      '<div class="disc-chip ' + (st.disc === 'all' ? 'active' : '') + '" data-disc="all" style="--disc-color:#e0a458"><span class="dot"></span>' + I18n.t('جميع البنود') + '</div>' +
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
      '<div class="tab ' + (st.tab === '2d' ? 'active' : '') + '" data-vtab="2d">🗺️ ' + I18n.t('المخططات ثنائية الأبعاد') + '</div>' +
      '<div class="tab ' + (st.tab === 'elev' ? 'active' : '') + '" data-vtab="elev">🏙️ ' + I18n.t('واجهات المبنى') + '</div>' +
      '<div class="tab ' + (st.tab === 'bim' ? 'active' : '') + '" data-vtab="bim">🏢 ' + I18n.t('نموذج BIM ثلاثي الأبعاد') + '</div>' +
      '</div>' + discChips + body +
      '<div class="legend"><span><span class="sw" style="background:#141a26;border:1px solid #26314a"></span>' + I18n.t('داكن = أعمال غير منتهية') + '</span>' +
      '<span><span class="sw" style="background:linear-gradient(90deg,#8a6a35,#e0a458);box-shadow:0 0 10px rgba(224,164,88,.7)"></span>' + I18n.t('ساطع = بنود منتهية (مستخلصات معتمدة)') + '</span>' +
      '<span>' + I18n.t('اضغط أي منطقة/دور لعرض بنود جدول الكميات المرتبطة بها') + '</span></div>';

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
        '<title>' + esc(I18n.t(z.name)) + ' — ' + (p == null ? I18n.t('لا بنود') : I18n.t('الإنجاز') + ' ' + p + '%') + '</title></rect>' + hatch +
        '<text x="' + (z.x + z.w / 2) + '" y="' + (z.y + z.h / 2 - 8) + '" text-anchor="middle" fill="' + (t > 0.5 ? '#10151f' : '#aab3c5') + '" font-size="13" font-weight="700" pointer-events="none">' + esc(I18n.t(z.name)) + '</text>' +
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
      '<rect x="40" y="252" width="720" height="36" fill="#0e1420" stroke="#1e2740"/><text x="400" y="274" text-anchor="middle" fill="#4a5570" font-size="11">' + I18n.t('ممر الحركة الرئيسي') + '</text>' +
      zonesSvg + '</svg>';

    // شريط تفصيل التخصصات للدور الحالي: معماري، إنشائي، كهروميكانيكا...
    const discStrip = '<div class="card mb" style="padding:12px 16px"><div class="flex" style="gap:16px">' +
      '<b class="small">📊 ' + I18n.t('إنجاز') + ' ' + esc(floorName(ctx, st.floor)) + ' ' + I18n.t('حسب التخصص:') + '</b>' +
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
      '<b class="small">📐 ' + I18n.t('المخططات المرتبطة بهذا الدور:') + '</b>' +
      floorDrawings.map(function (dr) {
        return '<div class="small muted" style="margin-top:6px">📎 <b class="num">' + esc(dr.ref) + '</b> ' + esc(dr.title) +
          ' <span class="pill p-ok" style="font-size:10px">' + I18n.t('مربوط بجدول الكميات ✓') + '</span></div>';
      }).join('') + '</div>' : '';

    // لوحة البنود الجانبية
    const panelItems = itemsFor(ctx, st.floor, st.disc, st.zone);
    const panelTitle = st.zone == null ? I18n.t('كل بنود ') + floorName(ctx, st.floor) : I18n.t(ZONES[st.zone].name) + ' — ' + floorName(ctx, st.floor);
    const panel =
      '<div class="card zone-panel"><h3>📋 ' + esc(panelTitle) + ' <span class="hint num">' + panelItems.length + ' ' + I18n.t('بند') + '</span></h3>' +
      (panelItems.length ? panelItems.map(function (b) {
        const d = discOf(ctx, b.discipline);
        const done = b.progress >= 100;
        return '<div style="border:1px solid ' + (done ? d.color : 'var(--border)') + ';border-radius:10px;padding:10px 12px;margin-bottom:9px;background:var(--bg2)' + (done ? ';box-shadow:0 0 12px ' + d.color + '33' : '') + '">' +
          '<div class="flex" style="justify-content:space-between"><b class="small">' + esc(b.description) + '</b><span class="pill ' + (done ? 'p-ok' : b.progress > 0 ? 'p-warn' : 'p-muted') + '">' + esc(b.status) + '</span></div>' +
          '<div class="small muted num">' + esc(b.code) + ' · ' + b.qty + ' ' + esc(b.unit) + ' × ' + b.unitPrice.toLocaleString('en-US') + I18n.t(' ر.س') + ' · ' + d.icon + ' ' + esc(d.name) + '</div>' +
          '<div class="flex mt" style="margin-top:8px"><div class="bar" style="flex:1"><i style="width:' + b.progress + '%;background:linear-gradient(90deg,' + d.color + '88,' + d.color + ')"></i></div><b class="num small">' + b.progress + '%</b></div>' +
          '</div>';
      }).join('') : '<div class="empty"><div class="e-ico">🗂️</div>' + I18n.t('لا توجد بنود مطابقة للتصفية الحالية') + '</div>') +
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
    svg += '<text x="' + (W - 40) + '" y="' + (baseY + 24) + '" fill="#4a5570" font-size="10" text-anchor="end">' + I18n.t('منسوب الأرض ±0.00') + '</text>';

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
        '<title>' + esc(f.name) + ' — ' + (p == null ? I18n.t('لا بنود') : p + '%') + I18n.t(' (اضغط لفتح الدور)') + '</title></rect>';
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
    const panel = '<div class="card zone-panel"><h3>🏙️ ' + I18n.t('واجهة المبنى') + ' <span class="hint">' + I18n.t('اضغط أي دور يفتح تلقائياً') + '</span></h3>' +
      '<div class="small muted mb" style="line-height:1.9">' + I18n.t('مخطط الواجهة مرتبط بجداول كميات كل دور — الأدوار الداكنة لم تكتمل، والساطعة المتوهجة اكتملت واعتُمدت مستخلصاتها. بالضغط على أي دور يفتح النظام مسقطه تلقائياً مع نِسَب المعماري والإنشائي والكهروميكانيكا وبقية التخصصات.') + '</div>' +
      floors.slice().reverse().map(function (f) {
        const p = weightedProgress(itemsFor(ctx, f.id, st.disc, null));
        if (p == null) return '';
        return '<div class="flex" data-elevfloor="' + f.id + '" style="cursor:pointer;justify-content:space-between;border:1px solid var(--border);border-radius:10px;padding:9px 12px;margin-bottom:7px;background:var(--bg2)">' +
          '<span class="small">' + esc(f.name) + '</span>' +
          '<div class="flex" style="flex:1;max-width:150px;margin:0 10px"><div class="bar" style="flex:1"><i style="width:' + p + '%"></i></div></div>' +
          '<b class="num small">' + p + '%</b></div>';
      }).join('') +
      ((ctx.S.planDrawings || []).some(function (d) { return d.floor === 'ELEV'; }) ?
        '<div class="sig">📐 ' + esc(((ctx.S.planDrawings || []).find(function (d) { return d.floor === 'ELEV'; }) || {}).title || '') + I18n.t(' — مربوط بجدول الكميات') + '</div>' : '') +
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
        '<title>' + esc(f.name) + ' — ' + (p == null ? I18n.t('لا بنود') : p + '%') + '</title></path></g>';
      floorLabels += '<g class="bim-floor" data-bimfloor="' + f.id + '">' +
        '<line x1="' + (cx + fw + 4) + '" y1="' + (y + fh / 2) + '" x2="' + (cx + fw + 26) + '" y2="' + (y + fh / 2) + '" stroke="#33405e"/>' +
        '<text x="' + (cx + fw + 32) + '" y="' + (y + fh / 2 + 4) + '" fill="' + (sel ? '#fff' : '#8b95a8') + '" font-size="12" font-weight="' + (sel ? '800' : '400') + '" text-anchor="start">' +
        (p == null ? '' : p + '% · ') + esc(f.name) + '</text></g>';
    });
    svg += floorLabels + '</svg>';

    // لوحة تفاصيل الدور المحدد
    const selFloor = st.bimFloor || 'GF';
    const detail =
      '<div class="card zone-panel"><h3>🏢 ' + esc(floorName(ctx, selFloor)) + ' <span class="hint">' + I18n.t('تفصيل التخصصات') + '</span></h3>' +
      P.disciplines.map(function (d) {
        const p = weightedProgress(itemsFor(ctx, selFloor, d.id, null));
        if (p == null) return '';
        return '<div style="margin-bottom:13px"><div class="flex" style="justify-content:space-between;font-size:12.5px;margin-bottom:5px">' +
          '<span>' + d.icon + ' ' + esc(d.name) + '</span><b class="num" style="color:' + d.color + '">' + p + '%</b></div>' +
          '<div class="bar"><i style="width:' + p + '%;background:linear-gradient(90deg,' + d.color + '77,' + d.color + ')' + (p >= 95 ? ';box-shadow:0 0 10px ' + d.color : '') + '"></i></div></div>';
      }).join('') +
      '<div class="small muted mt">💡 ' + I18n.t('المناطق الساطعة المتوهجة = بنود مكتملة اعتُمدت مستخلصاتها. اضغط أي دور في النموذج لعرض تفاصيله.') + '</div>' +
      '<div class="sig">' + I18n.t('نموذج BIM مرفوع بواسطة:') + ' ' + esc(P.consultantName) + ' · ' + I18n.t('مرتبط بجدول الكميات (') + ctx.S.boqItems.length + I18n.t(' بند)') + '</div>' +
      '</div>';

    return '<div class="grid" style="grid-template-columns:1.5fr 1fr"><div class="bim-stage">' + svg + '</div>' + detail + '</div>';
  }

  // ============ التقارير والإرسال ============
  function renderReports(el, ctx) {
    const canSend = ['consultant', 'admin', 'owner_rep', 'owner'].indexOf(ctx.U.role) !== -1;
    el.innerHTML =
      '<div class="grid g2 mb">' +
      '<div class="card"><h3>📅 ' + I18n.t('التقارير اليومية') + '</h3>' +
      ctx.S.dailyReports.map(function (r) {
        return '<div style="border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px;background:var(--bg2)">' +
          '<div class="flex" style="justify-content:space-between"><b>' + I18n.t('تقرير يوم') + ' ' + esc(r.date) + '</b><span class="pill p-info">☀️ ' + esc(r.weather) + '</span></div>' +
          '<div class="small muted" style="margin:6px 0">' + I18n.t('العمالة:') + ' <b class="num">' + r.manpower + '</b> · ' + I18n.t('المعدات:') + ' ' + esc(r.equipment) + '</div>' +
          '<ul style="margin:8px 18px 0;font-size:13px;line-height:2">' + r.works.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul>' +
          '<div class="small muted mt" style="margin-top:8px">📎 ' + r.photos.length + ' ' + I18n.t('صور مرفقة') + ' · ' + I18n.t('أعده:') + ' ' + esc(r.by) + '</div></div>';
      }).join('') + '</div>' +

      '<div>' +
      '<div class="card mb"><h3>🗓️ ' + I18n.t('التقارير الأسبوعية') + '</h3>' +
      (ctx.S.weeklyReports || []).map(function (r) {
        return '<div style="border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px;background:var(--bg2)">' +
          '<div class="flex" style="justify-content:space-between"><b>' + esc(r.title) + '</b>' +
          '<span class="pill ' + (r.progressActual < r.progressPlanned - 3 ? 'p-danger' : 'p-ok') + ' num">' + r.progressActual + '% / ' + r.progressPlanned + '%</span></div>' +
          '<p class="small" style="line-height:1.9;margin-top:8px;color:#c6cdda">' + esc(r.summary) + '</p>' +
          (r.achievements && r.achievements.length ? '<div class="small mt" style="color:var(--ok)">✔ ' + r.achievements.map(esc).join(' · ') + '</div>' : '') +
          (r.issues && r.issues.length ? '<div class="small" style="color:var(--warn);margin-top:4px">⚠ ' + r.issues.map(esc).join(' · ') + '</div>' : '') +
          '<div class="small muted" style="margin-top:8px">📎 ' + ((r.photos || []).length + (r.attachments || []).length) + ' ' + I18n.t('مرفقات') + ' · ' + esc(r.by || '') + '</div></div>';
      }).join('') + '</div>' +
      '<div class="card mb"><h3>📊 ' + I18n.t('التقارير الشهرية') + '</h3>' +
      ctx.S.monthlyReports.map(function (r) {
        return '<div style="border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px;background:var(--bg2)">' +
          '<div class="flex" style="justify-content:space-between"><b>' + esc(r.title) + '</b>' +
          '<span class="pill ' + (r.progressActual < r.progressPlanned - 3 ? 'p-danger' : 'p-ok') + ' num">' + r.progressActual + '% / ' + r.progressPlanned + '%</span></div>' +
          '<p class="small" style="line-height:1.9;margin-top:8px;color:#c6cdda">' + esc(r.summary) + '</p></div>';
      }).join('') + '</div>' +

      '<div class="card"><h3>📨 ' + I18n.t('إرسال التقارير للمالك') + '</h3>' +
      (canSend ?
        '<label class="fl">' + I18n.t('القناة') + '</label><select class="inp" id="rp-channel"><option value="whatsapp">' + I18n.t('واتساب WhatsApp') + '</option><option value="email">' + I18n.t('البريد الإلكتروني') + '</option></select>' +
        '<label class="fl">' + I18n.t('المستلم (رقم / بريد)') + '</label><input class="inp" id="rp-to" placeholder="05xxxxxxxx ' + I18n.t('أو') + ' owner@example.com" value="0501234567">' +
        '<label class="fl">' + I18n.t('التقرير') + '</label><select class="inp" id="rp-title">' +
        '<option>' + I18n.t('التقرير اليومي - ') + esc(ctx.S.dailyReports[0] ? ctx.S.dailyReports[0].date : '') + '</option>' +
        ctx.S.monthlyReports.map(function (r) { return '<option>' + esc(r.title) + '</option>'; }).join('') +
        '<option>' + I18n.t('ملخص أداء المقاولين') + '</option></select>' +
        '<div class="m-actions"><button class="btn" id="rp-send">📤 ' + I18n.t('إرسال الآن') + '</button></div>'
        : '<div class="muted small">' + I18n.t('الإرسال متاح للاستشاري وممثل المالك') + '</div>') +
      '<h3 class="mt">' + I18n.t('سجل الإرسال') + '</h3>' +
      (ctx.S.messages.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>' + I18n.t('القناة') + '</th><th>' + I18n.t('إلى') + '</th><th>' + I18n.t('التقرير') + '</th><th>' + I18n.t('التاريخ') + '</th><th>' + I18n.t('الحالة') + '</th></tr></thead><tbody>' +
        ctx.S.messages.slice().reverse().map(function (m) {
          return '<tr><td>' + (m.channel === 'whatsapp' ? '💬 ' + I18n.t('واتساب') : '📧 ' + I18n.t('إيميل')) + '</td><td class="num">' + esc(m.to) + '</td><td>' + esc(m.title) + '</td><td class="small muted num">' + esc(m.date) + '</td><td>' + (m.status === 'sent_demo' ? '<span class="pill p-warn">' + I18n.t('محاكاة (القناة غير مهيأة)') + '</span>' : '<span class="pill p-ok">' + I18n.t('أُرسل فعلياً ✓') + '</span>') + '</td></tr>';
        }).join('') + '</tbody></table></div>' : '<div class="empty">' + I18n.t('لا رسائل بعد') + '</div>') +
      '</div></div></div>';

    const sendBtn = el.querySelector('#rp-send');
    if (sendBtn) sendBtn.addEventListener('click', async function () {
      try {
        await Api.sendReport({
          channel: el.querySelector('#rp-channel').value,
          to: el.querySelector('#rp-to').value,
          title: el.querySelector('#rp-title').value
        });
        toast(I18n.t('✅ تم إرسال التقرير بنجاح عبر ') + (el.querySelector('#rp-channel').value === 'whatsapp' ? I18n.t('واتساب') : I18n.t('البريد الإلكتروني')));
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
