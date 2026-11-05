/**
 * بصير | صفحات إضافية للمقاول: جدول الكميات + الجدول الزمني
 *  - renderContractorBoq: جدول كميات المقاول مع (المنجز/الجاري/المتبقي) ومؤشر التأخير حسب الجدول الزمني.
 *  - renderSchedule: عرض الجدول الزمني مع مؤشرات التأخير، وقراءة ملف جدول زمني مرفوع
 *    (CSV / Primavera XER / P6 XML / Excel XLSX / PDF) عبر parseScheduleFile.
 */
(function () {
  'use strict';
  const VS = window.ViewsShared;
  const esc = VS.esc, money = VS.money, toast = VS.toast, floorName = VS.floorName, discOf = VS.discOf;
  const t = I18n.t;

  // مسودة بنود جدول الكميات المُدخلة يدوياً (قبل الإرسال للاعتماد) — تبقى أثناء الإضافة
  let boqDraft = [];

  I18n.registerDict({
    'جدول الكميات': 'Bill of Quantities',
    'الجدول الزمني': 'Schedule',
    'الكمية المنجزة': 'Completed Qty',
    'الكمية الجاري العمل فيها': 'In-Progress Qty',
    'الكمية المتبقية': 'Remaining Qty',
    'التأخير': 'Delay',
    'ضمن الجدول': 'On schedule',
    'سيتأخر — سرّع العمل': 'Will slip — speed up',
    'متأخر': 'Behind',
    'منجز': 'Complete',
    'لم يبدأ': 'Not started',
    'المتوقع حسب الجدول': 'Expected by schedule',
    'رفع ملف الجدول الزمني': 'Upload schedule file',
    'يقرأ CSV / Primavera XER / P6 XML / Excel / PDF': 'Reads CSV / Primavera XER / P6 XML / Excel / PDF',
    '📥 تنزيل نموذج فارغ': '📥 Download Empty Template',
    'جدولك الحالي غير مطابق؟ نزّل النموذج الفارغ، انسخ بنودك فيه، ثم ارفعه — يضمن ذلك قراءته بشكل صحيح.':
      "Your current spreadsheet not matching? Download the empty template, copy your items into it, then upload it — that guarantees it reads correctly.",
    'تعذّر التعرف على أعمدة الكمية أو السعر في هذا الملف (كل القيم ظهرت صفراً) — على الأغلب تنسيق الملف مختلف عمّا يتوقعه النظام. نزّل النموذج الفارغ أعلاه وانسخ بياناتك فيه بدل رفع ملفك كما هو.':
      "Couldn't recognize the quantity or price columns in this file (every value came out zero) — the file format most likely doesn't match what the system expects. Download the empty template above and copy your data into it instead of uploading your file as-is.",
    'يشمل أعمالاً تمهيدية/تعبئة موقع — يُنصح بمراجعة عاجلة': 'Includes preliminary/mobilization work — priority review recommended',

    // ===== توزيع يدوي على الأدوار =====
    'توزيع يدوي على الأدوار': 'Manual distribution across floors',
    'الإجمالي المطلوب توزيعه:': 'Total to distribute:',
    'أدخل نسبة كل دور — يجب أن يكون المجموع 100% (تُطبَّق على كل بنود الملف)': "Enter each floor's percentage — the total must equal 100% (applies to all items in the file)",
    'النسبة %': 'Percentage %',
    'بالتساوي': 'Equally',
    'حسب المساحة': 'By area',
    'المُدخل:': 'Entered:',
    'المتبقّي:': 'Remaining:',
    'يجب أن يكون مجموع النسب 100%': 'The percentages must add up to 100%',
    'يجب أن يساوي مجموع الكميات الإجمالي': 'The quantities must add up to the total',
    'أدخل التوزيع أولاً': 'Enter the distribution first',

    // ===== جدول كميات المقاول =====
    'كامل المشروع': 'Whole project',
    'طلب تعديل جدول الكميات': 'BOQ amendment request',
    'رفع جدول الكميات للاعتماد': 'Upload Bill of Quantities for approval',
    'الأعمدة: الوصف/الوحدة/الكمية/السعر/الدور': 'Columns: Description/Unit/Quantity/Price/Floor',
    'جدول الكميات معتمد ومقفل': 'Bill of Quantities approved and locked',
    'أي تعديل يتطلب موافقة الاستشاري وممثل المالك معاً.': "Any change requires approval from both the consultant and the owner's representative.",
    'ارفع جدول كمياتك ليُراجعه الاستشاري ويعتمده، وبعد الاعتماد يُقفل ولا يُعدَّل إلا بموافقة الاستشاري وممثل المالك.':
      "Upload your Bill of Quantities for the consultant to review and approve; once approved it locks and can only be changed with approval from the consultant and the owner's representative.",
    'لديك جدول كميات قيد المراجعة': 'You have a Bill of Quantities under review',
    'بانتظار قرار الاستشاري': "Awaiting the consultant's decision",
    'يمكنك إضافة البنود يدوياً بنداً بنداً، أو رفع ملف — رفع الملف اختياري.': 'You can add items manually one by one, or upload a file — uploading a file is optional.',
    'خرسانة مسلحة للأعمدة...': 'Reinforced concrete for columns...',
    'التوزيع': 'Distribution',
    'دور واحد (المحدد)': 'Single floor (selected)',
    'وزّع بالتساوي على الأدوار': 'Distribute equally across floors',
    'وزّع حسب مساحة الأدوار': 'Distribute by floor area',
    'وزّع يدوياً (كمية لكل دور)': 'Distribute manually (quantity per floor)',
    'كامل المشروع (دون دور)': 'Whole project (no specific floor)',
    'أضف بند': 'Add item',
    'أو': 'or',
    'رفع ملف (اختياري)': 'Upload file (optional)',
    'خط أساس': 'Baseline',
    'إجمالي بنودي': 'My total items',
    'بند في عقدي': 'item(s) in my contract',
    'قيمة عقدي': 'My contract value',
    'بنود ستتأخر': 'Items at risk of slipping',
    'سرّع العمل بها': 'Speed up work on these',
    'بنود متأخرة': 'Items behind schedule',
    'خلف الجدول الزمني': 'Behind the schedule',
    'جدول كمياتي': 'My Bill of Quantities',
    'المنجز والجاري والمتبقي لكل بند، ومؤشر التأخير حسب الجدول الزمني': 'Completed, in-progress and remaining for each item, plus a delay indicator based on the schedule',
    'لا بنود في عقدك بعد': 'No items in your contract yet',
    'جارٍ قراءة الملف…': 'Reading the file…',
    'لم تُستخرج بنود. استخدم CSV/Excel بعناوين: الوصف/الوحدة/الكمية/السعر.': 'No items were extracted. Use CSV/Excel with headers: Description/Unit/Quantity/Price.',
    'توزيع كميات الملف على الأدوار:': "Distribute the file's quantities across floors:",
    'كما في الملف (دون توزيع)': 'As in the file (no distribution)',
    'بالتساوي على كل الأدوار': 'Equally across all floors',
    'حسب مساحة كل دور': "By each floor's area",
    '(أدخل المساحات في إعدادات المشروع)': '(enter the areas in project settings)',
    'يدوياً (نسبة لكل دور تُطبَّق على الكل)': 'Manually (a percentage per floor applied to all)',
    'اترك كل بند كاملاً للمشروع': 'Leave each item whole, for the project',
    'تطبيق التوزيع': 'Apply distribution',
    'مثال: بند «دهان داخلي 10,000 م²» يُقسَّم على الأدوار حسب الطريقة المختارة.': 'Example: an item "Interior paint 10,000 m²" gets split across floors according to the chosen method.',
    'إرسال طلب التعديل للاعتماد': 'Send the amendment request for approval',
    'إرسال للاستشاري للاعتماد': 'Send to the consultant for approval',
    'نسبة توزيع كل بند على الأدوار': 'Percentage distribution of each item across floors',
    'وُزّعت الكميات بالنِّسب — راجع الجدول ثم أرسل للاعتماد': 'Quantities distributed by percentage — review the table then submit for approval',
    'وُزّعت الكميات — راجع الجدول ثم أرسل للاعتماد': 'Quantities distributed — review the table then submit for approval',
    'تعذّرت قراءة الملف:': "Couldn't read the file:",
    'لم تُضف بنوداً بعد — أضف بنداً أو ارفع ملفاً.': 'No items added yet — add an item or upload a file.',
    'أُرسل طلب التعديل — يتطلب موافقة الاستشاري وممثل المالك': "The amendment request was sent — it requires approval from the consultant and the owner's representative",
    'أُرسل جدول الكميات للاستشاري للاعتماد': 'The Bill of Quantities was sent to the consultant for approval',
    'تعديل جدول الكميات —': 'BOQ amendment —',
    'جدول الكميات —': 'Bill of Quantities —',
    'تعديل جدول الكميات (إدخال يدوي) —': 'BOQ amendment (manual entry) —',
    'جدول الكميات (إدخال يدوي) —': 'Bill of Quantities (manual entry) —',
    'أدخل وصف البند': 'Enter the item description',
    'أدخل كمية صحيحة': 'Enter a valid quantity',
    'تعذّر التوزيع — تحقق من الأدوار': "Couldn't distribute — check the floors",
    'وُزّع': 'Distributed',
    'على': 'across',
    'دور': 'floor(s)',
    'توزيع': 'Distribution',
    'على الأدوار': 'across floors',
    'يدوياً على': 'manually across',

    // ===== الجدول الزمني =====
    'مراحل الجدول': 'Schedule stages',
    'مرحلة/نشاط': 'stage/activity',
    'ستتأخر': 'Will slip',
    'تحتاج تسريعاً': 'Needs speeding up',
    'متأخرة': 'Behind',
    'خلف الجدول': 'Behind schedule',
    'اليوم': 'Today',
    'تاريخ المقارنة': 'Comparison date',
    'طلب تعديل الجدول الزمني': 'Schedule amendment request',
    'رفع برنامجك الزمني للاعتماد': 'Upload your schedule for approval',
    'قراءة الملف': 'Read file',
    'الجدول الزمني معتمد ومقفل': 'Schedule approved and locked',
    'ارفع برنامجك الزمني — يُقرأ آلياً ويُرسَل للاستشاري للاعتماد، وبعد الاعتماد يُقفل ولا يُعدَّل إلا بموافقة الاستشاري وممثل المالك.':
      "Upload your schedule — it's read automatically and sent to the consultant for approval; once approved it locks and can only be changed with approval from the consultant and the owner's representative.",
    'ارفع الجدول الزمني وتعتمده مباشرةً كخط أساس، أو اعتمد برامج المقاولين المقدَّمة أدناه.': "Upload the schedule and approve it directly as a baseline, or approve the contractors' submitted schedules below.",
    'لديك جدول زمني قيد المراجعة — بانتظار القرار': 'You have a schedule under review — awaiting a decision',
    'اختر الملف ثم «قراءة الملف» — سيُستخرج منه المهام والتواريخ ونِسَب الإنجاز.': 'Choose the file then "Read file" — tasks, dates and progress percentages will be extracted from it.',
    'برامجي الزمنية المقدَّمة': 'My submitted schedules',
    'مهام': 'tasks',
    'المرحلة / النشاط': 'Stage / Activity',
    'المخطط (من ← إلى)': 'Planned (from ← to)',
    'الفعلي': 'Actual',
    'المخطط مقابل الفعلي ومؤشر التأخير حسب تاريخ اليوم': "Planned vs. actual and a delay indicator based on today's date",
    'لا جدول زمني بعد': 'No schedule yet',
    'ارفع ملفاً أعلاه': 'Upload a file above',
    'يرفعه الاستشاري': 'The consultant uploads it',
    'اختر ملف الجدول الزمني أولاً': 'Choose the schedule file first',
    'لم يتم استخراج مهام من الملف. تأكد من الصيغة (يُفضّل CSV/XER/XML/XLSX).': 'No tasks were extracted from the file. Check the format (CSV/XER/XML/XLSX preferred).',
    'اعتماد كجدول زمني للمشروع': "Approve as the project's schedule",
    'استُخرجت': 'Extracted',
    'مهمة من': 'task(s) from',
    'المهمة': 'Task',
    'أُرسل برنامجك الزمني للاستشاري للاعتماد': 'Your schedule was sent to the consultant for approval',
    'اعتُمد الجدول الزمني الرسمي للمشروع': "The project's official schedule has been approved",
    "وقّعت كاستشاري — تعديل خط الأساس بانتظار توقيع ممثل المالك": "You signed as the consultant — the baseline amendment awaits the owner representative's signature",
    'تعديل الجدول الزمني —': 'Schedule amendment —',
    'برنامج زمني —': 'Schedule —',

    // ===== اعتماد خط الأساس (جداول الكميات/الجداول الزمنية المقدَّمة) =====
    'جداول الكميات المقدَّمة': 'Submitted Bills of Quantities',
    'الجداول الزمنية المقدَّمة': 'Submitted schedules',
    'اعتماد خط الأساس من الاستشاري؛ تعديله لاحقاً يتطلب توقيع الاستشاري وممثل المالك معاً': "Baseline approval by the consultant; any later change requires both the consultant's and the owner representative's signature",
    'التوقيعات': 'Signatures',
    'الإجراء': 'Action',
    'استشاري': 'Consultant',
    'توقيع الاستشاري': "Consultant's signature",
    'توقيع ممثل المالك': "Owner representative's signature",
    'رفض': 'Reject',
    'إرجاع': 'Return',
    'بانتظار الطرف الآخر': 'Awaiting the other party',
    'سُجّل قرارك': 'Your decision was recorded',
    'سبب الإرجاع (اختياري):': 'Reason for returning it (optional):',
    'تطبيق': 'Apply',
    'البنود': 'Items',
    'ر.س': 'SAR',
    'قيمة': 'value',
    'السعر': 'Price',
    'مهمة': 'task(s)',
    'الدور (اختياري)': 'Floor (optional)',
    'كل المبنى / المشروع بالكامل': 'Whole building / entire project',
    'تسجيل تنفيذ': 'Report Executed',
    'المتبقي من إجمالي كمية البند:': 'Remaining of the item\'s total quantity:',
    'الكمية المُنفَّذة الآن': 'Quantity executed now',
    'ملاحظة (اختياري)': 'Note (optional)',
    'صور الموقع (اختياري)': 'Site photos (optional)',
    'هذا تسجيل أولي فقط — لا يظهر في نسبة الإنجاز ولا يُتيح أي مطالبة مالية حتى يعتمده الاستشاري بدليل موثَّق.':
      "This is a preliminary record only — it won't show in the progress % or allow any billing claim until the consultant approves it with documented evidence.",
    'سُجِّل التنفيذ — بانتظار اعتماد الاستشاري': 'Execution recorded — awaiting consultant approval',
    'بانتظار اعتماد الاستشاري': 'Awaiting consultant approval',
    'المتاح للمطالبة:': 'Available to claim:',
    'المُطالَب به': 'Claimed',

    // ===== تسجيل التنفيذ: كمية أو نسبة أو مبلغ — حقول مترابطة =====
    'أدخل الكمية المُنفَّذة بأي من الطرق الثلاث التالية — القيم الثلاث مرتبطة تلقائياً وتتحدّث معاً':
      'Enter the executed amount using any of the three fields below — all three stay in sync automatically',
    'المبلغ (ر.س)': 'Amount (SAR)',
    'سعر الوحدة غير محدَّد لهذا البند — استخدم الكمية أو النسبة': "This item's unit price isn't set — use quantity or percentage instead",
    'لا كمية إجمالية محدَّدة لهذا البند — استخدم الكمية أو المبلغ': "This item has no total quantity set — use quantity or amount instead"
  });

  const todayMs = () => Date.now();
  function daysBetween(a, b) { return (new Date(b) - new Date(a)) / 86400000; }

  /** النسبة المتوقّعة اليوم ضمن نافذة زمنية (خطّي 0..100) */
  function expectedPct(start, end) {
    if (!start || !end) return null;
    const s = new Date(start).getTime(), e = new Date(end).getTime();
    if (isNaN(s) || isNaN(e) || e <= s) return null;
    const now = todayMs();
    if (now <= s) return 0;
    if (now >= e) return 100;
    return Math.round(((now - s) / (e - s)) * 100);
  }

  /** مؤشر التأخير: يقارن الفعلي بالمتوقّع حسب الجدول ويعيد {cls, icon, label, expected} */
  function delayStatus(actual, start, end, amberTh, redTh) {
    amberTh = amberTh == null ? 10 : amberTh;
    redTh = redTh == null ? amberTh * 2 : redTh;
    const a = Number(actual) || 0;
    if (a >= 100) return { cls: 'p-ok', icon: '✓', label: t('منجز'), expected: 100 };
    const exp = expectedPct(start, end);
    if (exp == null) return { cls: 'p-none', icon: '—', label: a > 0 ? t('ضمن الجدول') : t('لم يبدأ'), expected: null };
    const overdueEnd = new Date(end).getTime() < todayMs();
    const gap = exp - a;
    if (overdueEnd && a < 100) return { cls: 'p-danger', icon: '✕', label: t('متأخر'), expected: exp };
    if (gap <= amberTh) return { cls: 'p-ok', icon: '✓', label: a > 0 ? t('ضمن الجدول') : t('لم يبدأ'), expected: exp };
    if (gap <= redTh) return { cls: 'p-warn', icon: '⚠', label: t('سيتأخر — سرّع العمل'), expected: exp };
    return { cls: 'p-danger', icon: '✕', label: t('متأخر'), expected: exp };
  }

  /** نافذة المقاول الزمنية: من عقده، وإلا من مدى مراحل الجدول الزمني للمشروع */
  function contractorWindow(ctx) {
    const c = (ctx.S.contractors || []).find(function (x) { return x.id === ctx.U.contractorId; }) || (ctx.S.contractors || [])[0];
    if (c && c.startDate && c.endDate) return { start: c.startDate, end: c.endDate };
    const tasks = ctx.S.scheduleTasks || [];
    if (tasks.length) {
      const starts = tasks.map(function (x) { return x.startPlanned; }).filter(Boolean).sort();
      const ends = tasks.map(function (x) { return x.endPlanned; }).filter(Boolean).sort();
      if (starts.length && ends.length) return { start: starts[0], end: ends[ends.length - 1] };
    }
    return { start: null, end: null };
  }

  // ============ 1) جدول كميات المقاول ============
  // يوزّع كمية إجمالية على الأدوار: method='equal' بالتساوي، 'area' حسب مساحة الدور
  // (areasMap = { floorId: م² }). يحافظ على مطابقة المجموع للإجمالي بعد التقريب.
  function distributeAcrossFloors(total, floors, method, areasMap) {
    total = Number(total) || 0;
    const fl = (floors || []).filter(Boolean);
    if (!fl.length || !total) return [];
    areasMap = areasMap || {};
    let weights;
    if (method === 'area' && fl.some(function (f) { return (Number(areasMap[f.id]) || 0) > 0; })) {
      weights = fl.map(function (f) { return Math.max(0, Number(areasMap[f.id]) || 0); });
    } else {
      weights = fl.map(function () { return 1; }); // بالتساوي
    }
    const sumW = weights.reduce(function (a, b) { return a + b; }, 0) || 1;
    const out = fl.map(function (f, i) { return { floor: f.id, qty: Math.round(total * weights[i] / sumW * 100) / 100 }; });
    // تصحيح فرق التقريب على الدور صاحب أكبر كمية ليطابق المجموع الإجمالي تماماً
    let acc = 0; out.forEach(function (r) { acc += r.qty; });
    const diff = Math.round((total - acc) * 100) / 100;
    if (diff !== 0) { let mi = 0; out.forEach(function (r, i) { if (r.qty > out[mi].qty) mi = i; }); out[mi].qty = Math.round((out[mi].qty + diff) * 100) / 100; }
    return out.filter(function (r) { return r.qty > 0; });
  }

  // نافذة التوزيع اليدوي: كمية لكل دور (mode='qty', total محدّد) أو نسبة % لكل دور
  // (mode='percent'، المجموع 100). مع مؤشر «المتبقّي» الحيّ. onApply(shares) حيث
  // shares = [{ floor, val }] (val كمية أو نسبة حسب الوضع).
  function openDistributeModal(ctx, opts, onApply) {
    opts = opts || {};
    const modal = VS.modal;
    const floors = (ctx.S.projects[0] || {}).floors || [];
    const mode = opts.mode === 'qty' ? 'qty' : 'percent';
    const total = Number(opts.total) || 0;
    const target = mode === 'percent' ? 100 : total;
    const areasMap = (ctx.S.projects[0] || {}).floorAreas || {};
    const m = modal(
      '<h3>🏢 ' + esc(opts.title || t('توزيع يدوي على الأدوار')) + '</h3>' +
      (mode === 'qty'
        ? '<div class="m-sub">' + t('الإجمالي المطلوب توزيعه:') + ' <b class="num">' + total + '</b> ' + esc(opts.unit || '') + '</div>'
        : '<div class="m-sub">' + t('أدخل نسبة كل دور — يجب أن يكون المجموع 100% (تُطبَّق على كل بنود الملف)') + '</div>') +
      '<div class="tbl-wrap" style="max-height:48vh;overflow:auto"><table class="tbl"><thead><tr><th>' + t('الدور') + '</th><th>' + (mode === 'percent' ? t('النسبة %') : t('الكمية')) + '</th></tr></thead><tbody>' +
      floors.map(function (f) { return '<tr><td class="small">' + esc(f.name) + '</td><td><input class="inp num dm-in" data-f="' + esc(f.id) + '" type="number" min="0" step="any" style="max-width:130px" dir="ltr"></td></tr>'; }).join('') +
      '</tbody></table></div>' +
      '<div class="flex mt" style="justify-content:space-between;flex-wrap:wrap;gap:8px"><b class="small" id="dm-sum"></b>' +
      '<div class="flex" style="gap:6px"><button class="btn ghost sm" id="dm-equal">' + t('بالتساوي') + '</button>' +
      (floors.some(function (f) { return (Number(areasMap[f.id]) || 0) > 0; }) ? '<button class="btn ghost sm" id="dm-area">' + t('حسب المساحة') + '</button>' : '') +
      '<button class="btn sm" id="dm-apply">' + t('تطبيق') + '</button><button class="btn mutedb sm" id="dm-cancel">' + t('إلغاء') + '</button></div></div>'
    );
    function recalc() {
      let sum = 0; m.querySelectorAll('.dm-in').forEach(function (i) { sum += Number(i.value) || 0; });
      sum = Math.round(sum * 100) / 100;
      const rem = Math.round((target - sum) * 100) / 100;
      const bal = Math.abs(rem) < 0.01;
      m.querySelector('#dm-sum').innerHTML = t('المُدخل:') + ' <b class="num">' + sum + (mode === 'percent' ? '%' : '') + '</b> · ' + t('المتبقّي:') + ' ' +
        '<b class="num" style="color:' + (bal ? 'var(--ok)' : 'var(--warn)') + '">' + rem + (mode === 'percent' ? '%' : '') + '</b>';
      return { sum: sum, rem: rem, bal: bal };
    }
    function setVals(getter) { m.querySelectorAll('.dm-in').forEach(function (i, idx) { i.value = getter(i.getAttribute('data-f'), idx); }); recalc(); }
    m.querySelectorAll('.dm-in').forEach(function (i) { i.addEventListener('input', recalc); });
    m.querySelector('#dm-equal').addEventListener('click', function () {
      const per = Math.round((target / (floors.length || 1)) * 100) / 100;
      setVals(function () { return per; });
    });
    const areaBtn = m.querySelector('#dm-area');
    if (areaBtn) areaBtn.addEventListener('click', function () {
      const parts = distributeAcrossFloors(target, floors, 'area', areasMap);
      const map = {}; parts.forEach(function (p) { map[p.floor] = p.qty; });
      setVals(function (fid) { return map[fid] || 0; });
    });
    m.querySelector('#dm-cancel').addEventListener('click', function () { m.remove(); });
    m.querySelector('#dm-apply').addEventListener('click', function () {
      const r = recalc();
      if (!r.bal) { toast(mode === 'percent' ? t('يجب أن يكون مجموع النسب 100%') : t('يجب أن يساوي مجموع الكميات الإجمالي') + ' (' + total + ')', true); return; }
      const shares = [];
      m.querySelectorAll('.dm-in').forEach(function (i) { const v = Number(i.value) || 0; if (v > 0) shares.push({ floor: i.getAttribute('data-f'), val: v }); });
      if (!shares.length) { toast(t('أدخل التوزيع أولاً'), true); return; }
      m.remove();
      onApply(shares);
    });
    recalc();
  }

  function renderContractorBoq(el, ctx) {
    const items = (ctx.S.boqItems || []).slice();
    const th = VS.thresholds(ctx.S.projects[0]);
    const win = contractorWindow(ctx);

    let totVal = 0, totEarned = 0, nLate = 0, nSlip = 0;
    const rows = items.map(function (b) {
      const d = discOf(ctx, b.discipline);
      // منجز = approvedQty (معتمَد من الاستشاري بدليل موثَّق)، جارٍ = executedQty-approvedQty (منفَّذ
      // فعلياً بانتظار اعتماد الاستشاري)، متبقٍ = qty-executedQty — بدل الاعتماد على نِسَب مستخلصات
      // معلَّقة لم تُعتمَد بعد كما كان سابقاً، فالتنفيذ والاعتماد الآن مرحلتان منفصلتان حقاً
      const executedQty = Number(b.executedQty) || 0, approvedQty = Number(b.approvedQty) || 0;
      const claimedQty = Number(b.claimedQty) || 0, availableToClaim = Number(b.availableToClaim) || 0;
      const approved = Number(b.progress) || 0;
      const qty = Number(b.qty) || 0;
      const pendingVerifyQty = Math.max(0, executedQty - approvedQty);
      const remQty = Math.max(0, qty - executedQty);
      const line = qty * b.unitPrice;
      totVal += line; totEarned += line * approved / 100;
      const ds = delayStatus(approved, win.start, win.end, th.progressAmberPct, th.progressAmberPct * 2);
      if (ds.cls === 'p-danger' && approved < 100) nLate++;
      if (ds.cls === 'p-warn') nSlip++;
      const fmt = function (n) { return Math.round(n).toLocaleString('en-US'); };
      const pendPct = qty ? Math.round(pendingVerifyQty / qty * 1000) / 10 : 0;
      return '<tr>' +
        '<td class="num small">' + esc(b.code) + '</td>' +
        '<td>' + d.icon + ' ' + esc(b.description) + '<div class="small muted">' + esc(b.floor === 'ALL' ? t('كامل المشروع') : floorName(ctx, b.floor)) + '</div></td>' +
        '<td class="num small">' + b.unitPrice.toLocaleString('en-US') + '<div class="muted">' + esc(b.unit) + '</div></td>' +
        '<td class="num small">' + qty + '</td>' +
        '<td class="num small" style="color:var(--status-ok)">' + fmt(approvedQty) + '<div class="muted">' + approved + '%</div></td>' +
        '<td class="num small" style="color:var(--status-info)">' + fmt(pendingVerifyQty) + (pendPct ? '<div class="muted">' + t('بانتظار اعتماد الاستشاري') + ' +' + pendPct + '%</div>' : '') + '</td>' +
        '<td class="num small" style="color:var(--status-warning)">' + fmt(remQty) + '</td>' +
        '<td class="num small">' + fmt(claimedQty) + '<div class="muted">' + t('المتاح للمطالبة:') + ' ' + fmt(availableToClaim) + '</div></td>' +
        '<td>' + VS.statusPill(ds.cls, ds.label, ds.icon) +
          (ds.expected != null && ds.cls !== 'p-ok' ? '<div class="small muted num">' + t('المتوقع حسب الجدول') + ' ' + ds.expected + '%</div>' : '') + '</td>' +
        '<td><button class="btn ghost sm" data-report-exec="' + esc(b.id) + '">➕ ' + t('تسجيل تنفيذ') + '</button></td>' +
        '</tr>';
    }).join('');

    // ===== رفع جدول الكميات (خط أساس / تعديل) وحالة الاعتماد =====
    const subs = (ctx.S.boqSubmittals || []).slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    const pendingSub = subs.find(function (s) { return s.status === 'pending'; });
    const hasBaseline = items.length > 0 || subs.some(function (s) { return s.status === 'approved'; });
    const uploadCard =
      '<div class="card mb"><div class="flex" style="justify-content:space-between;flex-wrap:wrap;gap:10px">' +
      '<h3 style="margin:0">📤 ' + (hasBaseline ? t('طلب تعديل جدول الكميات') : t('رفع جدول الكميات للاعتماد')) + ' <span class="hint">CSV / Excel — ' + t('الأعمدة: الوصف/الوحدة/الكمية/السعر/الدور') + '</span></h3></div>' +
      (hasBaseline ? '<div class="small" style="margin:8px 0"><span class="pill p-ok">🔒 ' + t('جدول الكميات معتمد ومقفل') + '</span> ' + t('أي تعديل يتطلب موافقة الاستشاري وممثل المالك معاً.') + '</div>' : '<div class="small muted" style="margin:8px 0">' + t('ارفع جدول كمياتك ليُراجعه الاستشاري ويعتمده، وبعد الاعتماد يُقفل ولا يُعدَّل إلا بموافقة الاستشاري وممثل المالك.') + '</div>') +
      (pendingSub
        ? '<div class="pill p-warn">⏳ ' + t('لديك جدول كميات قيد المراجعة') + ' (' + esc(pendingSub.docCode || pendingSub.ref || '') + ') — ' + t('بانتظار قرار الاستشاري') + '</div>'
        : '<div class="small muted" style="margin:2px 0 6px">' + t('يمكنك إضافة البنود يدوياً بنداً بنداً، أو رفع ملف — رفع الملف اختياري.') + '</div>' +
          '<div class="flex" style="align-items:flex-end;gap:6px;flex-wrap:wrap">' +
          '<div><label class="fl">' + t('وصف البند') + '</label><input class="inp" id="mb-desc" placeholder="' + t('خرسانة مسلحة للأعمدة...') + '" style="min-width:220px"></div>' +
          '<div><label class="fl">' + t('الوحدة') + '</label><input class="inp" id="mb-unit" placeholder="م³ / م² / عدد" style="max-width:90px"></div>' +
          '<div><label class="fl">' + t('الكمية') + '</label><input class="inp num" id="mb-qty" type="number" min="0" step="any" style="max-width:90px"></div>' +
          '<div><label class="fl">' + t('سعر الوحدة') + '</label><input class="inp num" id="mb-price" type="number" min="0" step="any" style="max-width:110px"></div>' +
          '<div><label class="fl">' + t('الدور (اختياري)') + '</label><select class="inp" id="mb-floor">' +
          '<option value="ALL">' + t('كل المبنى / المشروع بالكامل') + '</option>' +
          ((ctx.S.projects[0] || {}).floors || []).map(function (f) { return '<option value="' + f.id + '">' + esc(f.name) + '</option>'; }).join('') + '</select></div>' +
          '<div><label class="fl">' + t('المنطقة') + '</label><select class="inp" id="mb-zone">' +
          ((VS.ZONE_NAMES || []).map(function (zn, zi) { return '<option value="' + zi + '">' + esc(t(zn)) + '</option>'; }).join('')) + '</select></div>' +
          '<div><label class="fl">' + t('التوزيع') + '</label><select class="inp" id="mb-dist">' +
          '<option value="single">' + t('دور واحد (المحدد)') + '</option>' +
          '<option value="equal">' + t('وزّع بالتساوي على الأدوار') + '</option>' +
          '<option value="area">' + t('وزّع حسب مساحة الأدوار') + '</option>' +
          '<option value="manual">' + t('وزّع يدوياً (كمية لكل دور)') + '</option>' +
          '<option value="whole">' + t('كامل المشروع (دون دور)') + '</option>' +
          '</select></div>' +
          '<button class="btn sm" id="mb-add">➕ ' + t('أضف بند') + '</button>' +
          '</div>' +
          '<div id="cboq-draft"></div>' +
          '<div class="flex" style="margin:10px 0;gap:8px;align-items:center;flex-wrap:wrap"><span class="small muted">— ' + t('أو') + ' —</span>' +
          '<input class="inp" id="cboq-file" type="file" accept=".csv,.tsv,.txt,.xlsx,.xlsm" style="max-width:240px"><button class="btn ghost sm" id="cboq-read">📖 ' + t('رفع ملف (اختياري)') + '</button><button class="btn ghost sm" id="cboq-template">' + t('📥 تنزيل نموذج فارغ') + '</button></div>' +
          '<div id="cboq-prev" class="small muted">' + t('جدولك الحالي غير مطابق؟ نزّل النموذج الفارغ، انسخ بنودك فيه، ثم ارفعه — يضمن ذلك قراءته بشكل صحيح.') + '</div>') +
      (subs.length ? '<div class="tbl-wrap mt"><table class="tbl"><thead><tr><th>' + t('المرجع') + '</th><th>' + t('النوع') + '</th><th>' + t('البنود') + '</th><th>' + t('التاريخ') + '</th><th>' + t('الحالة') + '</th></tr></thead><tbody>' +
        subs.map(function (s) { return '<tr><td class="num small">' + esc(s.docCode || s.ref || '—') + '</td><td>' + (s.kind === 'revision' ? '<span class="pill p-warn">' + t('تعديل') + '</span>' : '<span class="pill p-info">' + t('خط أساس') + '</span>') + '</td><td class="num small">' + ((s.parsedItems || []).length || '—') + '</td><td class="small muted num">' + esc(s.date || '') + '</td><td>' + VS.pill(s.status) + '</td></tr>'; }).join('') +
        '</tbody></table></div>' : '') +
      '</div>';

    el.innerHTML = uploadCard +
      '<div class="grid g4 mb">' +
      '<div class="card kpi"><div class="lbl">' + t('إجمالي بنودي') + '</div><div class="val num">' + items.length + '</div><div class="sub">' + t('بند في عقدي') + '</div></div>' +
      '<div class="card kpi k-info"><div class="lbl">' + t('قيمة عقدي') + '</div><div class="val num">' + Math.round(totVal / 1e6 * 10) / 10 + 'M</div><div class="sub">' + t('ر.س') + '</div></div>' +
      '<div class="card kpi ' + (nSlip ? 'k-warn' : 'k-ok') + '"><div class="lbl">' + t('بنود ستتأخر') + '</div><div class="val num ' + (nSlip ? '' : 'zero') + '">' + nSlip + '</div><div class="sub">' + t('سرّع العمل بها') + '</div></div>' +
      '<div class="card kpi ' + (nLate ? 'k-danger' : 'k-ok') + '"><div class="lbl">' + t('بنود متأخرة') + '</div><div class="val num ' + (nLate ? '' : 'zero') + '">' + nLate + '</div><div class="sub">' + t('خلف الجدول الزمني') + '</div></div>' +
      '</div>' +
      '<div class="card"><div class="flex" style="justify-content:space-between;flex-wrap:wrap">' +
      '<h3 style="margin:0">📐 ' + t('جدول كمياتي') + ' <span class="hint">' + t('المنجز والجاري والمتبقي لكل بند، ومؤشر التأخير حسب الجدول الزمني') + '</span></h3>' +
      '<span class="pill p-ok">' + t('المنفذ: ') + money(Math.round(totEarned)) + ' (' + (totVal ? Math.round(totEarned / totVal * 100) : 0) + '%)</span></div>' +
      (items.length ?
        '<div class="tbl-wrap" style="max-height:64vh;overflow-y:auto"><table class="tbl"><thead><tr>' +
        '<th>' + t('الكود') + '</th><th>' + t('البند') + '</th><th>' + t('سعر الوحدة') + '</th><th>' + t('الكمية') + '</th><th>' + t('الكمية المنجزة') + '</th><th>' + t('الكمية الجاري العمل فيها') + '</th><th>' + t('الكمية المتبقية') + '</th><th>' + t('المُطالَب به') + '</th><th>' + t('التأخير') + '</th><th></th>' +
        '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
        '<div class="legend" style="margin-top:12px">' +
        '<span>' + VS.statusPill('p-ok', t('ضمن الجدول'), '✓') + '</span>' +
        '<span>' + VS.statusPill('p-warn', t('سيتأخر — سرّع العمل'), '⚠') + '</span>' +
        '<span>' + VS.statusPill('p-danger', t('متأخر'), '✕') + '</span></div>'
        : '<div class="empty"><div class="e-ico">📐</div>' + t('لا بنود في عقدك بعد') + '</div>') +
      '</div>';

    // المرحلة ١ من خط أنابيب اعتماد الكميات: تسجيل كمية مُنفَّذة فعلياً في الموقع — إنجاز خام غير
    // موثَّق بعد، لا يُحرِّك progress ولا يُتيح مطالبة مالية حتى يعتمده الاستشاري بدليل (المرحلة ٢)
    el.querySelectorAll('[data-report-exec]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const id = btn.getAttribute('data-report-exec');
        const b = items.find(function (x) { return x.id === id; });
        if (!b) return;
        const totalQty = Number(b.qty) || 0;
        const unitPrice = Number(b.unitPrice) || 0;
        const remaining = Math.max(0, totalQty - (Number(b.executedQty) || 0));
        const remainingPct = totalQty ? Math.round(remaining / totalQty * 1000) / 10 : 0;
        const remainingAmount = Math.round(remaining * unitPrice * 100) / 100;
        const m = VS.modal(
          '<h3>➕ ' + t('تسجيل تنفيذ') + ' — ' + esc(b.description) + '</h3>' +
          '<div class="m-sub">' + t('المتبقي من إجمالي كمية البند:') + ' <b class="num">' + remaining + '</b> ' + esc(b.unit) +
            (totalQty ? ' (' + remainingPct + '%)' : '') + (unitPrice ? ' · ' + money(remainingAmount) : '') + '</div>' +
          '<label class="fl">' + t('أدخل الكمية المُنفَّذة بأي من الطرق الثلاث التالية — القيم الثلاث مرتبطة تلقائياً وتتحدّث معاً') + '</label>' +
          '<div class="grid g3" style="gap:8px">' +
            '<div><label class="fl small">' + t('الكمية') + ' (' + esc(b.unit || '') + ')</label>' +
              '<input class="inp num" id="rx-qty" type="number" min="0" max="' + remaining + '" step="any" dir="ltr"></div>' +
            '<div><label class="fl small">' + t('النسبة %') + '</label>' +
              '<input class="inp num" id="rx-pct" type="number" min="0" max="' + remainingPct + '" step="any" dir="ltr"' + (totalQty ? '' : ' disabled') + '></div>' +
            '<div><label class="fl small">' + t('المبلغ (ر.س)') + '</label>' +
              '<input class="inp num" id="rx-amount" type="number" min="0" max="' + remainingAmount + '" step="any" dir="ltr"' + (unitPrice ? '' : ' disabled') + '></div>' +
          '</div>' +
          (!unitPrice ? '<div class="small muted mt">' + t('سعر الوحدة غير محدَّد لهذا البند — استخدم الكمية أو النسبة') + '</div>'
            : !totalQty ? '<div class="small muted mt">' + t('لا كمية إجمالية محدَّدة لهذا البند — استخدم الكمية أو المبلغ') + '</div>' : '') +
          '<label class="fl">' + t('ملاحظة (اختياري)') + '</label><textarea class="inp" id="rx-note" rows="2"></textarea>' +
          '<label class="fl">' + t('صور الموقع (اختياري)') + '</label><input class="inp" id="rx-photos" type="file" multiple accept="image/*">' +
          '<div class="small muted mt">' + t('هذا تسجيل أولي فقط — لا يظهر في نسبة الإنجاز ولا يُتيح أي مطالبة مالية حتى يعتمده الاستشاري بدليل موثَّق.') + '</div>' +
          '<div class="m-actions"><button class="btn" id="rx-ok">' + t('حفظ') + '</button><button class="btn mutedb" id="rx-cancel">' + t('إلغاء') + '</button></div>'
        );

        // ثلاثة حقول مترابطة لنفس القيمة الفعلية الواحدة (الكمية) — أياً كان الحقل الذي يكتب فيه
        // المقاول، تُشتق الكمية الفعلية منه فوراً وتُعاد كتابة الحقلين الآخرين منها، فتبقى متوافقة
        // دائماً دون أي حلقة تحديث ذاتي (كل مستمع يتجنّب الكتابة في حقله هو نفسه)
        const qtyInp = m.querySelector('#rx-qty'), pctInp = m.querySelector('#rx-pct'), amtInp = m.querySelector('#rx-amount');
        function round(n, d) { const f = Math.pow(10, d); return Math.round((n + Number.EPSILON) * f) / f; }
        function syncFromQty(qty, skip) {
          if (skip !== 'qty') qtyInp.value = qty > 0 ? round(qty, 3) : '';
          if (skip !== 'pct') pctInp.value = (totalQty && qty > 0) ? round(qty / totalQty * 100, 1) : '';
          if (skip !== 'amount') amtInp.value = (unitPrice && qty > 0) ? round(qty * unitPrice, 2) : '';
        }
        qtyInp.addEventListener('input', function () { syncFromQty(Number(qtyInp.value) || 0, 'qty'); });
        pctInp.addEventListener('input', function () {
          const qty = totalQty ? (Number(pctInp.value) || 0) / 100 * totalQty : 0;
          syncFromQty(qty, 'pct');
        });
        amtInp.addEventListener('input', function () {
          const qty = unitPrice ? (Number(amtInp.value) || 0) / unitPrice : 0;
          syncFromQty(qty, 'amount');
        });

        m.querySelector('#rx-cancel').addEventListener('click', function () { m.remove(); });
        m.querySelector('#rx-ok').addEventListener('click', async function () {
          const okBtn = m.querySelector('#rx-ok');
          const qty = Number(m.querySelector('#rx-qty').value);
          if (!(qty > 0)) { toast(t('أدخل كمية صحيحة أكبر من صفر'), true); return; }
          okBtn.disabled = true;
          try {
            const files = m.querySelector('#rx-photos').files;
            const photos = [];
            for (let i = 0; i < files.length; i++) photos.push(await Api.upload(files[i]));
            await Api.reportExecutedQty({ boqItemId: b.id, qty: qty, note: m.querySelector('#rx-note').value, photos: photos });
            m.remove();
            toast('✅ ' + t('سُجِّل التنفيذ — بانتظار اعتماد الاستشاري'));
            ctx.refresh();
          } catch (e) { toast(e.message, true); okBtn.disabled = false; }
        });
      });
    });

    const cTemplate = el.querySelector('#cboq-template');
    if (cTemplate) cTemplate.addEventListener('click', function () {
      const floors = (ctx.S.projects[0] || {}).floors || [];
      const dFloor = (floors[0] && floors[0].id) || 'GF';
      const csv = 'الوصف,الوحدة,الكمية,السعر,الدور\r\n' +
        'مثال: أعمال خرسانة الأساسات,م3,120,450,' + dFloor + '\r\n' +
        'مثال: أعمال لياسة الجدران,م2,300,28,' + dFloor + '\r\n';
      // BOM يضمن فتح إكسل للملف بترميز UTF-8 الصحيح مباشرة، بلا حروف عربية مشوَّهة
      const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'نموذج-جدول-الكميات.csv'; document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    });

    const cRead = el.querySelector('#cboq-read');
    if (cRead) cRead.addEventListener('click', async function () {
      const f = el.querySelector('#cboq-file').files[0];
      const prev = el.querySelector('#cboq-prev');
      if (!f) { toast(t('اختر ملف جدول الكميات أولاً'), true); return; }
      prev.innerHTML = '⏳ ' + t('جارٍ قراءة الملف…');
      try {
        const floors = (ctx.S.projects[0] || {}).floors || [];
        const areasMap = (ctx.S.projects[0] || {}).floorAreas || {};
        const parsed = await parseBoqFile(f, floors);
        if (!parsed.length) { prev.innerHTML = '⚠️ ' + t('لم تُستخرج بنود. استخدم CSV/Excel بعناوين: الوصف/الوحدة/الكمية/السعر.'); return; }
        // فحص سلامة: إن كانت كل الكميات والأسعار صفراً فهذا يعني غالباً أن أعمدة الملف لم تُطابَق
        // (تنسيق مختلف تماماً، أو ملف غير جدول كميات أصلاً) — لا نعرضه كنجاح فيُرسَل خطأً فارغاً
        const allZero = parsed.every(function (p) { return !p.qty && !p.unitPrice; });
        if (allZero) {
          prev.innerHTML = '⚠️ ' + t('تعذّر التعرف على أعمدة الكمية أو السعر في هذا الملف (كل القيم ظهرت صفراً) — على الأغلب تنسيق الملف مختلف عمّا يتوقعه النظام. نزّل النموذج الفارغ أعلاه وانسخ بياناتك فيه بدل رفع ملفك كما هو.');
          return;
        }
        let working = parsed.slice();
        const hasAreas = floors.some(function (fl) { return (Number(areasMap[fl.id]) || 0) > 0; });

        function expand(method) {
          if (method === 'keep') return parsed.slice();
          if (method === 'whole') return parsed.map(function (p) { return Object.assign({}, p, { floor: 'ALL' }); });
          const out = [];
          parsed.forEach(function (p) {
            const dist = distributeAcrossFloors(p.qty, floors, method, areasMap);
            if (!dist.length) { out.push(p); return; }
            dist.forEach(function (d) { out.push(Object.assign({}, p, { floor: d.floor, qty: d.qty })); });
          });
          return out;
        }
        function fname(fid) { return fid === 'ALL' ? t('كامل المشروع') : floorName(ctx, fid); }

        function renderPrev() {
          const totalVal = working.reduce(function (a, b) { return a + b.qty * b.unitPrice; }, 0);
          prev.innerHTML =
            '<div class="card" style="padding:10px 12px;margin:8px 0;background:var(--bg2)">' +
            '<b class="small">🏢 ' + t('توزيع كميات الملف على الأدوار:') + '</b> ' +
            '<select class="inp" id="cboq-dist" style="max-width:220px;display:inline-block">' +
            '<option value="keep">' + t('كما في الملف (دون توزيع)') + '</option>' +
            '<option value="equal">' + t('بالتساوي على كل الأدوار') + '</option>' +
            '<option value="area"' + (hasAreas ? '' : ' disabled') + '>' + t('حسب مساحة كل دور') + (hasAreas ? '' : ' ' + t('(أدخل المساحات في إعدادات المشروع)')) + '</option>' +
            '<option value="manual">' + t('يدوياً (نسبة لكل دور تُطبَّق على الكل)') + '</option>' +
            '<option value="whole">' + t('اترك كل بند كاملاً للمشروع') + '</option>' +
            '</select> <button class="btn ghost sm" id="cboq-apply-dist">' + t('تطبيق التوزيع') + '</button>' +
            '<div class="small muted mt">' + t('مثال: بند «دهان داخلي 10,000 م²» يُقسَّم على الأدوار حسب الطريقة المختارة.') + '</div></div>' +
            '<div class="flex" style="justify-content:space-between;flex-wrap:wrap"><b class="small">✅ ' + working.length + ' ' + t('بند') + ' (' + t('قيمة') + ' ' + money(Math.round(totalVal)) + ')</b>' +
            '<button class="btn sm" id="cboq-send">📤 ' + (hasBaseline ? t('إرسال طلب التعديل للاعتماد') : t('إرسال للاستشاري للاعتماد')) + '</button></div>' +
            '<div class="tbl-wrap mt" style="max-height:32vh;overflow:auto"><table class="tbl"><thead><tr><th>' + t('الوصف') + '</th><th>' + t('الدور') + '</th><th>' + t('الوحدة') + '</th><th>' + t('الكمية') + '</th><th>' + t('السعر') + '</th></tr></thead><tbody>' +
            working.slice(0, 300).map(function (p) { return '<tr><td class="small">' + esc(p.description) + '</td><td class="small">' + esc(fname(p.floor)) + '</td><td class="small">' + esc(p.unit) + '</td><td class="num small">' + p.qty + '</td><td class="num small">' + p.unitPrice.toLocaleString('en-US') + '</td></tr>'; }).join('') +
            '</tbody></table></div>';
          el.querySelector('#cboq-apply-dist').addEventListener('click', function () {
            const method = el.querySelector('#cboq-dist').value;
            if (method === 'manual') {
              openDistributeModal(ctx, { mode: 'percent', title: t('نسبة توزيع كل بند على الأدوار') }, function (shares) {
                const out = [];
                parsed.forEach(function (p) {
                  shares.forEach(function (s) {
                    out.push(Object.assign({}, p, { floor: s.floor, qty: Math.round(p.qty * s.val / 100 * 100) / 100 }));
                  });
                });
                working = out;
                renderPrev();
                toast('✅ ' + t('وُزّعت الكميات بالنِّسب — راجع الجدول ثم أرسل للاعتماد'));
              });
              return;
            }
            working = expand(method);
            renderPrev();
            toast('✅ ' + t('وُزّعت الكميات — راجع الجدول ثم أرسل للاعتماد'));
          });
          el.querySelector('#cboq-send').addEventListener('click', async function () {
            const sendBtn = el.querySelector('#cboq-send');
            sendBtn.disabled = true;
            try {
              const fileObj = await Api.upload(f, { category: 'جداول الكميات BOQ' });
              await Api.create('boqSubmittals', { title: (hasBaseline ? t('تعديل جدول الكميات —') : t('جدول الكميات —')) + ' ' + f.name, file: fileObj, parsedItems: working, kind: hasBaseline ? 'revision' : 'baseline' });
              toast(hasBaseline ? '📤 ' + t('أُرسل طلب التعديل — يتطلب موافقة الاستشاري وممثل المالك') : '📤 ' + t('أُرسل جدول الكميات للاستشاري للاعتماد'));
              ctx.refresh();
            } catch (e) { toast(e.message, true); sendBtn.disabled = false; }
          });
        }
        renderPrev();
      } catch (e) { prev.innerHTML = '❌ ' + t('تعذّرت قراءة الملف:') + ' ' + esc(e.message); }
    });

    // ===== الإدخال اليدوي للبنود (رفع الملف اختياري) =====
    const draftBox = el.querySelector('#cboq-draft');
    function renderDraft() {
      if (!draftBox) return;
      if (!boqDraft.length) { draftBox.innerHTML = '<div class="small muted mt">' + t('لم تُضف بنوداً بعد — أضف بنداً أو ارفع ملفاً.') + '</div>'; return; }
      const total = boqDraft.reduce(function (a, b) { return a + b.qty * b.unitPrice; }, 0);
      draftBox.innerHTML =
        '<div class="tbl-wrap mt" style="max-height:32vh;overflow:auto"><table class="tbl"><thead><tr>' +
        '<th>' + t('الوصف') + '</th><th>' + t('الوحدة') + '</th><th>' + t('الكمية') + '</th><th>' + t('السعر') + '</th><th>' + t('الدور') + '</th><th>' + t('المنطقة') + '</th><th></th></tr></thead><tbody>' +
        boqDraft.map(function (it, i) {
          return '<tr><td class="small">' + esc(it.description) + '</td><td class="small">' + esc(it.unit) + '</td>' +
            '<td class="num small">' + it.qty + '</td><td class="num small">' + it.unitPrice.toLocaleString('en-US') + '</td>' +
            '<td class="small">' + esc(it.floor === 'ALL' ? t('كامل المشروع') : floorName(ctx, it.floor)) + '</td>' +
            '<td class="small">' + esc(t((VS.ZONE_NAMES || [])[Number(it.zone)] || '')) + '</td>' +
            '<td><button class="btn danger sm" data-mbdel="' + i + '">✕</button></td></tr>';
        }).join('') + '</tbody></table></div>' +
        '<div class="flex mt" style="justify-content:space-between;flex-wrap:wrap;gap:8px"><b class="small">' + boqDraft.length + ' ' + t('بند') + ' · ' + t('القيمة') + ' ' + money(Math.round(total)) + '</b>' +
        '<button class="btn sm" id="mb-send">📤 ' + (hasBaseline ? t('إرسال طلب التعديل للاعتماد') : t('إرسال للاستشاري للاعتماد')) + '</button></div>';
      draftBox.querySelectorAll('[data-mbdel]').forEach(function (b) {
        b.addEventListener('click', function () { boqDraft.splice(Number(b.getAttribute('data-mbdel')), 1); renderDraft(); });
      });
      const mbSend = draftBox.querySelector('#mb-send');
      if (mbSend) mbSend.addEventListener('click', async function () {
        if (!boqDraft.length) return;
        mbSend.disabled = true;
        try {
          await Api.create('boqSubmittals', {
            title: (hasBaseline ? t('تعديل جدول الكميات (إدخال يدوي) —') : t('جدول الكميات (إدخال يدوي) —')) + ' ' + boqDraft.length + ' ' + t('بند'),
            parsedItems: boqDraft.slice(), kind: hasBaseline ? 'revision' : 'baseline'
          });
          boqDraft = [];
          toast(hasBaseline ? '📤 ' + t('أُرسل طلب التعديل — يتطلب موافقة الاستشاري وممثل المالك') : '📤 ' + t('أُرسل جدول الكميات للاستشاري للاعتماد'));
          ctx.refresh();
        } catch (e) { toast(e.message, true); mbSend.disabled = false; }
      });
    }
    renderDraft();

    const mbAdd = el.querySelector('#mb-add');
    if (mbAdd) mbAdd.addEventListener('click', function () {
      const desc = (el.querySelector('#mb-desc').value || '').trim();
      const qty = Number(el.querySelector('#mb-qty').value);
      const price = Number(el.querySelector('#mb-price').value);
      if (!desc) { toast(t('أدخل وصف البند'), true); return; }
      if (!(qty > 0)) { toast(t('أدخل كمية صحيحة'), true); return; }
      const unit = (el.querySelector('#mb-unit').value || 'وحدة').trim();
      const zone = Number(el.querySelector('#mb-zone').value) || 0;
      const dist = el.querySelector('#mb-dist').value;
      const floors = (ctx.S.projects[0] || {}).floors || [];
      const areasMap = (ctx.S.projects[0] || {}).floorAreas || {};
      if (dist === 'equal' || dist === 'area') {
        const parts = distributeAcrossFloors(qty, floors, dist, areasMap);
        if (!parts.length) { toast(t('تعذّر التوزيع — تحقق من الأدوار'), true); return; }
        parts.forEach(function (d) { boqDraft.push({ description: desc, unit: unit, qty: d.qty, unitPrice: price > 0 ? price : 0, floor: d.floor, zone: zone }); });
        toast('✅ ' + t('وُزّع') + ' «' + desc + '» ' + t('على') + ' ' + parts.length + ' ' + t('دور'));
        clearInputs();
      } else if (dist === 'manual') {
        openDistributeModal(ctx, { mode: 'qty', total: qty, unit: unit, title: t('توزيع') + ' «' + desc + '» ' + t('على الأدوار') }, function (shares) {
          shares.forEach(function (s) { boqDraft.push({ description: desc, unit: unit, qty: s.val, unitPrice: price > 0 ? price : 0, floor: s.floor, zone: zone }); });
          toast('✅ ' + t('وُزّع') + ' «' + desc + '» ' + t('يدوياً على') + ' ' + shares.length + ' ' + t('دور'));
          clearInputs(); renderDraft();
        });
        return;
      } else if (dist === 'whole') {
        boqDraft.push({ description: desc, unit: unit, qty: qty, unitPrice: price > 0 ? price : 0, floor: 'ALL', zone: zone });
        clearInputs();
      } else {
        boqDraft.push({ description: desc, unit: unit, qty: qty, unitPrice: price > 0 ? price : 0, floor: el.querySelector('#mb-floor').value, zone: zone });
        clearInputs();
      }
      renderDraft();
    });
    function clearInputs() {
      el.querySelector('#mb-desc').value = '';
      el.querySelector('#mb-qty').value = '';
      el.querySelector('#mb-price').value = '';
      el.querySelector('#mb-unit').value = '';
      el.querySelector('#mb-desc').focus();
    }
  }

  // ============ 2) قرّاء ملفات الجدول الزمني ============
  // كلها تُعيد مصفوفة: [{ name, start, end, progress }]

  function normDate(s) {
    if (!s) return '';
    s = String(s).trim();
    // Primavera: 2026-01-31 00:00  |  01-Jan-26  |  1/31/2026
    let m = s.match(/(\d{4})-(\d{2})-(\d{2})/); if (m) return m[1] + '-' + m[2] + '-' + m[3];
    m = s.match(/(\d{1,2})[\/](\d{1,2})[\/](\d{4})/); if (m) return m[3] + '-' + String(m[1]).padStart(2, '0') + '-' + String(m[2]).padStart(2, '0');
    const MON = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
    m = s.match(/(\d{1,2})[- ]([A-Za-z]{3})[- ](\d{2,4})/);
    if (m) { let y = m[3].length === 2 ? '20' + m[3] : m[3]; return y + '-' + (MON[m[2].toLowerCase()] || '01') + '-' + String(m[1]).padStart(2, '0'); }
    return '';
  }
  function pct(v) { const n = parseFloat(String(v).replace('%', '')); return isNaN(n) ? 0 : Math.max(0, Math.min(100, Math.round(n))); }

  function parseDelimited(text) {
    const lines = text.split(/\r\n|\r|\n/).filter(function (l) { return l.trim(); });
    if (!lines.length) return [];
    const sep = lines[0].indexOf('\t') !== -1 ? '\t' : (lines[0].split(';').length > lines[0].split(',').length ? ';' : ',');
    const rows = lines.map(function (l) { return l.split(sep).map(function (c) { return c.replace(/^"|"$/g, '').trim(); }); });
    const head = rows[0].map(function (h) { return h.toLowerCase(); });
    const find = function (keys) { for (let i = 0; i < head.length; i++) { if (keys.some(function (k) { return head[i].indexOf(k) !== -1; })) return i; } return -1; };
    const ci = { name: find(['task', 'activity', 'name', 'المهمة', 'المرحلة', 'البند', 'النشاط']), start: find(['start', 'بداية', 'من']), end: find(['finish', 'end', 'نهاية', 'الى', 'إلى']), prog: find(['%', 'complete', 'progress', 'الإنجاز', 'نسبة']) };
    const hasHeader = ci.name !== -1 || ci.start !== -1;
    const body = hasHeader ? rows.slice(1) : rows;
    return body.map(function (r) {
      return {
        name: (ci.name !== -1 ? r[ci.name] : r[0]) || '',
        start: normDate(ci.start !== -1 ? r[ci.start] : r[1]),
        end: normDate(ci.end !== -1 ? r[ci.end] : r[2]),
        progress: pct(ci.prog !== -1 ? r[ci.prog] : r[3])
      };
    }).filter(function (x) { return x.name; });
  }

  function parseXer(text) {
    const lines = text.split(/\r\n|\r|\n/);
    let fields = null, out = [];
    let inTask = false;
    for (const line of lines) {
      if (line.startsWith('%T')) { inTask = line.trim().split('\t')[1] === 'TASK'; fields = null; continue; }
      if (!inTask) continue;
      const parts = line.split('\t');
      if (line.startsWith('%F')) { fields = parts.slice(1); continue; }
      if (line.startsWith('%R') && fields) {
        const vals = parts.slice(1);
        const g = function (k) { const i = fields.indexOf(k); return i !== -1 ? vals[i] : ''; };
        const name = g('task_name') || g('task_code');
        if (name) out.push({ name: name, start: normDate(g('target_start_date') || g('act_start_date') || g('early_start_date')), end: normDate(g('target_end_date') || g('act_end_date') || g('early_end_date')), progress: pct(g('phys_complete_pct') || g('complete_pct')) });
      }
    }
    return out;
  }

  function parseP6Xml(text) {
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    let nodes = doc.getElementsByTagName('Activity');
    if (!nodes.length) nodes = doc.getElementsByTagName('Task');
    const out = [];
    const childText = function (el, names) { for (const n of names) { const c = el.getElementsByTagName(n)[0]; if (c && c.textContent) return c.textContent; } return ''; };
    for (const el of nodes) {
      const name = childText(el, ['Name', 'name', 'task_name']);
      if (!name) continue;
      out.push({
        name: name,
        start: normDate(childText(el, ['StartDate', 'PlannedStartDate', 'ActualStartDate', 'EarlyStartDate'])),
        end: normDate(childText(el, ['FinishDate', 'PlannedFinishDate', 'ActualFinishDate', 'EarlyFinishDate'])),
        progress: pct(childText(el, ['PercentComplete', 'PhysicalPercentComplete', 'PercentCompleteType']))
      });
    }
    return out;
  }

  // XLSX: فكّ ضغط ZIP عبر DecompressionStream المدمج في المتصفح (بلا مكتبات)
  async function inflateRaw(bytes) {
    const ds = new DecompressionStream('deflate-raw');
    const stream = new Response(new Blob([bytes]).stream().pipeThrough(ds));
    return new Uint8Array(await stream.arrayBuffer());
  }
  async function readZipEntry(buf, nameMatch) {
    const dv = new DataView(buf); const u8 = new Uint8Array(buf);
    // اعثر على نهاية الفهرس المركزي EOCD
    let eocd = -1;
    for (let i = u8.length - 22; i >= 0 && i > u8.length - 65558; i--) { if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; } }
    if (eocd === -1) throw new Error('ملف XLSX غير صالح');
    let off = dv.getUint32(eocd + 16, true); const count = dv.getUint16(eocd + 10, true);
    const dec = new TextDecoder();
    for (let e = 0; e < count; e++) {
      if (dv.getUint32(off, true) !== 0x02014b50) break;
      const method = dv.getUint16(off + 10, true);
      const compSize = dv.getUint32(off + 20, true);
      const fnLen = dv.getUint16(off + 28, true), exLen = dv.getUint16(off + 30, true), cmLen = dv.getUint16(off + 32, true);
      const lho = dv.getUint32(off + 42, true);
      const fname = dec.decode(u8.subarray(off + 46, off + 46 + fnLen));
      off += 46 + fnLen + exLen + cmLen;
      if (!nameMatch(fname)) continue;
      // اقرأ الترويسة المحلية لتحديد بداية البيانات
      const lfnLen = dv.getUint16(lho + 26, true), lexLen = dv.getUint16(lho + 28, true);
      const dataStart = lho + 30 + lfnLen + lexLen;
      const raw = u8.subarray(dataStart, dataStart + compSize);
      return method === 0 ? raw : await inflateRaw(raw);
    }
    return null;
  }
  // يعيد شبكة الخلايا (مصفوفة صفوف من نصوص) من ملف XLSX
  async function xlsxGrid(buf) {
    const dec = new TextDecoder();
    const ssBytes = await readZipEntry(buf, function (n) { return /sharedStrings\.xml$/i.test(n); });
    const shared = [];
    if (ssBytes) { const xml = dec.decode(ssBytes); const doc = new DOMParser().parseFromString(xml, 'application/xml'); const sis = doc.getElementsByTagName('si'); for (const si of sis) { shared.push((si.textContent || '').trim()); } }
    const sheetBytes = await readZipEntry(buf, function (n) { return /worksheets\/sheet1\.xml$/i.test(n); }) || await readZipEntry(buf, function (n) { return /worksheets\/.*\.xml$/i.test(n); });
    if (!sheetBytes) throw new Error('لا توجد ورقة بيانات في الملف');
    const doc = new DOMParser().parseFromString(dec.decode(sheetBytes), 'application/xml');
    const rowsEl = doc.getElementsByTagName('row'); const grid = [];
    for (const row of rowsEl) {
      const cells = row.getElementsByTagName('c'); const arr = [];
      for (const c of cells) {
        const ref = (c.getAttribute('r') || '').replace(/\d+/g, '');
        const col = ref.split('').reduce(function (a, ch) { return a * 26 + (ch.charCodeAt(0) - 64); }, 0) - 1;
        const type = c.getAttribute('t'); const v = c.getElementsByTagName('v')[0];
        let val = v ? v.textContent : (c.getElementsByTagName('t')[0] ? c.getElementsByTagName('t')[0].textContent : '');
        if (type === 's') val = shared[parseInt(val, 10)] || '';
        arr[col >= 0 ? col : arr.length] = normDigits(val == null ? '' : val);
      }
      grid.push(arr);
    }
    return grid;
  }
  async function parseXlsx(buf) {
    const grid = await xlsxGrid(buf);
    return parseDelimited(grid.map(function (r) { return r.map(function (c) { return (c == null ? '' : c); }).join('\t'); }).join('\n'));
  }

  // يحوّل الأرقام العربية-الهندية (١٢٣...) والفارسية (۱۲۳...) إلى أرقام لاتينية عادية —
  // شائعة في ملفات إكسل/PDF المُصدَّرة أو المُنسَّقة بإعدادات لغة عربية على ويندوز، ولولا هذا
  // التحويل فإن Number('١٢٠') = NaN فتضيع كل كمية/سعر مكتوب بها إلى صفر بصمت.
  function normDigits(s) {
    return String(s == null ? '' : s)
      .replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 0x0660); })
      .replace(/[۰-۹]/g, function (d) { return String(d.charCodeAt(0) - 0x06f0); })
      // الفاصلة العشرية العربية (٫ U+066B) والألوف (٬ U+066C) — وإلا يُشطَب الفاصل العشري لاحقاً
      // ضمن تنظيف [^\d.] فيتحول "٢٨٫٥" (28.5) إلى 285 بصمت
      .replace(/٫/g, '.').replace(/٬/g, ',');
  }

  // يقرأ نص ملف بترميز موثوق: UTF-8 أولاً بصرامة (fatal)، وإن فشل (شائع جداً مع ملفات CSV عربية
  // محفوظة من إكسل بترميز صفحة الرموز المحلي Windows-1256 بدل UTF-8 على ويندوز عربي) يُعاد الترميز
  // بـ Windows-1256 بدل ظهور رموز غير مفهومة (███/?) مكان النص العربي وضياع كل الأرقام معه
  // (لأن فشل اكتشاف عناوين الأعمدة العربية يُسقط الكمية والسعر لصفر تلقائياً). كما يُطبَّق تطبيع
  // الأرقام العربية-الهندية هنا فيغطّي كل قارئ نصي (CSV/TSV/XER/P6 XML).
  async function decodeFileText(file) {
    const buf = await file.arrayBuffer();
    let text;
    try { text = new TextDecoder('utf-8', { fatal: true }).decode(buf); }
    catch (e) { text = new TextDecoder('windows-1256').decode(buf); }
    return normDigits(text);
  }

  // قارئ جداول عام (CSV/TSV/XLSX) يعيد صفوفاً خامة (مصفوفة مصفوفات) — لجداول الكميات وغيرها
  function csvRows(text) {
    const rows = []; let row = [], field = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i], n = text[i + 1];
      if (q) { if (c === '"' && n === '"') { field += '"'; i++; } else if (c === '"') q = false; else field += c; }
      else if (c === '"') q = true;
      else if (c === ',' || c === '\t' || c === ';') { row.push(field); field = ''; }
      else if (c === '\r') { /* skip */ }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else field += c;
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (c) { return String(c).trim(); }); });
  }
  async function parseRows(file) {
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (ext === 'xlsx' || ext === 'xlsm') return xlsxGrid(await file.arrayBuffer());
    return csvRows(await decodeFileText(file));
  }

  /**
   * ينظّف اسم مهمة مستخرَج من PDF من فضلات أعمدة الجدول المجاورة (رمز النشاط/WBS، المدة الصريحة،
   * معامل التعويم، رمز حالة بحرف واحد) التي تلتصق بالاسم لأن استخراج نص PDF يجمع كل نص السطر الواحد
   * في فقرة واحدة دون تمييز أعمدة الجدول فعلياً — فكان الاسم المستخرَج يصبح مثلاً
   * "Mobilization Mobilization   4    A    A" أو "A1000   بداية اﻻعمال   0    A" بدل الاسم الصافي
   * بعد أن يُزال منه التاريخ/النسبة فقط. مُعايَر مباشرة على هذه الأمثلة الحقيقية من جدول مستورَد فعلياً.
   */
  function cleanTaskName(raw) {
    let s = String(raw || '').trim();
    s = s.replace(/^[A-Za-z]{1,3}\d{3,6}[A-Za-z]?\s+(?=\S)/, ''); // رمز نشاط/WBS بادئ مثل A1000/A3260/A3920R
    const beforeDur = s;
    s = s.replace(/\b\d+\s*(days?|أيام?|يوم)\b/gi, ' ').trim(); // مدة صريحة "4 Days"
    // إن طابقت "مدة صريحة" (مثل "8 Days") فذلك دليل كافٍ على عمود المدة — لا نكمل بتجريد أرقام
    // لاحقة أخرى، فقد تكون جزءاً حقيقياً من الاسم (مثال واقعي: "VO No. 12, 13 & 14   8 Days" كان
    // يفقد الرقم "14" الحقيقي من الاسم لو استمر التجريد العام بعد إزالة "8 Days" بنجاح)
    if (s === beforeDur) {
      let prev;
      do { // أرقام/رموز قصيرة معزولة بنهاية الاسم (مدة خام، تعويم، رمز حالة حرف واحد) — بالتكرار
        prev = s;
        s = s.replace(/\s+(-?\d+\.?\d*|[A-Za-z])\s*$/, '');
      } while (s !== prev && s.trim());
    }
    s = s.trim();
    const words = s.split(/\s+/).filter(Boolean);
    if (words.length >= 2 && words.length % 2 === 0) { // عمودان متجاوران يكرران نفس الاسم (نفس النص مرتين)
      const half = words.length / 2;
      const a = words.slice(0, half).join(' '), b = words.slice(half).join(' ');
      if (a && a === b) s = a;
    }
    s = s.replace(/\s+/g, ' ').trim();
    return /[A-Za-z؀-ۿ]/.test(s) ? s : ''; // لا حروف متبقية = لا اسم فعلي قابل للاسترجاع من هذا السطر
  }

  async function parsePdf(url) {
    const lib = await import('/vendor/pdfjs/pdf.min.mjs');
    lib.GlobalWorkerOptions.workerSrc = '/vendor/pdfjs/pdf.worker.min.mjs';
    const pdf = await lib.getDocument({ url: url }).promise;
    let text = '';
    for (let p = 1; p <= pdf.numPages; p++) { const page = await pdf.getPage(p); const c = await page.getTextContent(); let lastY = null, line = ''; c.items.forEach(function (it) { const y = Math.round(it.transform[5]); if (lastY !== null && Math.abs(y - lastY) > 3) { text += line.trim() + '\n'; line = ''; } line += it.str + ' '; lastY = y; }); text += line.trim() + '\n'; }
    text = normDigits(text);
    // أبقِ الأسطر التي تحوي تاريخاً (على الأرجح صفوف مهام)
    const lines = text.split('\n').filter(function (l) { return /\d{4}-\d{2}-\d{2}|\d{1,2}[\/-][A-Za-z]{3}|\d{1,2}\/\d{1,2}\/\d{4}/.test(l); });
    return lines.map(function (l) {
      const dates = l.match(/(\d{4}-\d{2}-\d{2}|\d{1,2}[- ][A-Za-z]{3}[- ]\d{2,4}|\d{1,2}\/\d{1,2}\/\d{4})/g) || [];
      const prog = (l.match(/(\d{1,3})\s*%/) || [])[1];
      const rawName = l.replace(/(\d{4}-\d{2}-\d{2}|\d{1,2}[- ][A-Za-z]{3}[- ]\d{2,4}|\d{1,2}\/\d{1,2}\/\d{4})/g, '').replace(/\d{1,3}\s*%/, '').trim();
      return { name: cleanTaskName(rawName), start: normDate(dates[0]), end: normDate(dates[1] || dates[0]), progress: pct(prog) };
    }).filter(function (x) { return x.start && x.name; }); // أسقِط صفوفاً لم يتبقَّ منها اسم حقيقي (فضلات أعمدة فقط) بدل اسم عام مضلِّل "مهمة"
  }

  /** يقرأ ملف جدول زمني بأي صيغة مدعومة ويعيد قائمة المهام */
  async function parseScheduleFile(file) {
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (ext === 'xlsx' || ext === 'xlsm') { return parseXlsx(await file.arrayBuffer()); }
    if (ext === 'pdf') { return parsePdf(URL.createObjectURL(file)); }
    const text = await decodeFileText(file);
    if (ext === 'xer') return parseXer(text);
    if (ext === 'xml') return parseP6Xml(text);
    if (text.trim()[0] === '<') return parseP6Xml(text);
    if (text.indexOf('%T') !== -1 && text.indexOf('TASK') !== -1) return parseXer(text);
    return parseDelimited(text); // csv / tsv / txt
  }

  // ============ عرض صفحة الجدول الزمني ============
  function renderSchedule(el, ctx) {
    const role = ctx.U.role;
    const isContractor = role === 'contractor';
    const isReviewer = role === 'consultant' || role === 'project_manager' || role === 'admin';
    const canUpload = isContractor || isReviewer;
    const tasks = (ctx.S.scheduleTasks || []).slice();
    // برامج زمنية مقدّمة (دورة الاعتماد): المقاول يرى برامجه، الاستشاري يرى ما ينتظر قراره
    const subs = (ctx.S.scheduleSubmittals || []).slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    const hasSchedBaseline = tasks.length > 0 || subs.some(function (s) { return s.status === 'approved'; });
    const schedPending = subs.find(function (s) { return s.status === 'pending'; });
    const th = VS.thresholds(ctx.S.projects[0]);
    let nLate = 0, nSlip = 0;
    const rows = tasks.map(function (tk) {
      const ds = delayStatus(tk.progress, tk.startPlanned, tk.endPlanned, th.progressAmberPct, th.progressAmberPct * 2);
      if (ds.cls === 'p-danger' && (tk.progress || 0) < 100) nLate++;
      if (ds.cls === 'p-warn') nSlip++;
      const barCls = VS.barClass(tk.progress, ds.expected, th.progressAmberPct);
      return '<tr>' +
        '<td><b>' + esc(tk.name) + '</b></td>' +
        '<td class="small muted num">' + esc(tk.startPlanned || '—') + ' ← ' + esc(tk.endPlanned || '—') + '</td>' +
        '<td class="small muted num">' + esc(tk.startActual || '—') + ' ← ' + esc(tk.endActual || '—') + '</td>' +
        '<td style="min-width:150px"><div class="flex" style="gap:8px"><div class="bar ' + barCls + '" style="flex:1"><i style="width:' + (tk.progress || 0) + '%"></i></div><b class="num small">' + (tk.progress || 0) + '%</b></div></td>' +
        '<td>' + VS.statusPill(ds.cls, ds.label, ds.icon) + (ds.expected != null && ds.cls !== 'p-ok' ? '<div class="small muted num">' + t('المتوقع حسب الجدول') + ' ' + ds.expected + '%</div>' : '') + '</td>' +
        '</tr>';
    }).join('');

    el.innerHTML =
      '<div class="grid g4 mb">' +
      '<div class="card kpi"><div class="lbl">' + t('مراحل الجدول') + '</div><div class="val num">' + tasks.length + '</div><div class="sub">' + t('مرحلة/نشاط') + '</div></div>' +
      '<div class="card kpi ' + (nSlip ? 'k-warn' : 'k-ok') + '"><div class="lbl">' + t('ستتأخر') + '</div><div class="val num ' + (nSlip ? '' : 'zero') + '">' + nSlip + '</div><div class="sub">' + t('تحتاج تسريعاً') + '</div></div>' +
      '<div class="card kpi ' + (nLate ? 'k-danger' : 'k-ok') + '"><div class="lbl">' + t('متأخرة') + '</div><div class="val num ' + (nLate ? '' : 'zero') + '">' + nLate + '</div><div class="sub">' + t('خلف الجدول') + '</div></div>' +
      '<div class="card kpi k-info"><div class="lbl">' + t('اليوم') + '</div><div class="val num" style="font-size:18px">' + new Date().toISOString().slice(0, 10) + '</div><div class="sub">' + t('تاريخ المقارنة') + '</div></div>' +
      '</div>' +
      (canUpload ?
        '<div class="card mb"><div class="flex" style="justify-content:space-between;flex-wrap:wrap;gap:10px">' +
        '<h3 style="margin:0">📅 ' + (isContractor ? (hasSchedBaseline ? t('طلب تعديل الجدول الزمني') : t('رفع برنامجك الزمني للاعتماد')) : t('رفع ملف الجدول الزمني')) + ' <span class="hint">' + t('يقرأ CSV / Primavera XER / P6 XML / Excel / PDF') + '</span></h3>' +
        '<div class="flex"><input class="inp" id="sch-file" type="file" accept=".csv,.txt,.tsv,.xer,.xml,.xlsx,.xlsm,.pdf" style="max-width:260px">' +
        '<button class="btn sm" id="sch-read">📖 ' + t('قراءة الملف') + '</button></div></div>' +
        '<div class="small mb">' + (isContractor
          ? (hasSchedBaseline
            ? '<span class="pill p-ok">🔒 ' + t('الجدول الزمني معتمد ومقفل') + '</span> ' + t('أي تعديل يتطلب موافقة الاستشاري وممثل المالك معاً.')
            : '<span class="muted">' + t('ارفع برنامجك الزمني — يُقرأ آلياً ويُرسَل للاستشاري للاعتماد، وبعد الاعتماد يُقفل ولا يُعدَّل إلا بموافقة الاستشاري وممثل المالك.') + '</span>')
          : '<span class="muted">' + t('ارفع الجدول الزمني وتعتمده مباشرةً كخط أساس، أو اعتمد برامج المقاولين المقدَّمة أدناه.') + '</span>') + '</div>' +
        (isContractor && schedPending ? '<div class="pill p-warn">⏳ ' + t('لديك جدول زمني قيد المراجعة — بانتظار القرار') + '</div>' : '') +
        '<div id="sch-preview" class="small muted">' + t('اختر الملف ثم «قراءة الملف» — سيُستخرج منه المهام والتواريخ ونِسَب الإنجاز.') + '</div></div>'
        : '') +
      // لوحة اعتماد خط الأساس (للاستشاري وممثل المالك)
      baselineReviewHtml(ctx, 'scheduleSubmittals') +
      // حالة البرامج الزمنية المقدَّمة (عرض للمقاول)
      (isContractor && subs.length ?
        '<div class="card mb"><h3 style="margin:0 0 10px">📤 ' + t('برامجي الزمنية المقدَّمة') + '</h3>' +
        '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>' + t('المرجع') + '</th><th>' + t('النوع') + '</th><th>' + t('مهام') + '</th><th>' + t('التاريخ') + '</th><th>' + t('الحالة') + '</th></tr></thead><tbody>' +
        subs.map(function (s) {
          return '<tr><td class="num small">' + esc(s.docCode || s.ref || '—') + '</td>' +
            '<td>' + (s.kind === 'revision' ? '<span class="pill p-warn">' + t('تعديل') + '</span>' : '<span class="pill p-info">' + t('خط أساس') + '</span>') + '</td>' +
            '<td class="num small">' + ((s.parsedTasks || []).length || '—') + '</td>' +
            '<td class="small muted num">' + esc(s.date || '') + '</td>' +
            '<td>' + VS.pill(s.status) + '</td></tr>';
        }).join('') + '</tbody></table></div></div>'
        : '') +
      '<div class="card"><div class="flex" style="justify-content:space-between;flex-wrap:wrap">' +
      '<h3 style="margin:0">📅 ' + t('الجدول الزمني') + ' <span class="hint">' + t('المخطط مقابل الفعلي ومؤشر التأخير حسب تاريخ اليوم') + '</span></h3></div>' +
      (tasks.length ?
        '<div class="tbl-wrap" style="max-height:60vh;overflow-y:auto"><table class="tbl"><thead><tr>' +
        '<th>' + t('المرحلة / النشاط') + '</th><th>' + t('المخطط (من ← إلى)') + '</th><th>' + t('الفعلي') + '</th><th>' + t('الإنجاز') + '</th><th>' + t('التأخير') + '</th>' +
        '</tr></thead><tbody>' + rows + '</tbody></table></div>'
        : '<div class="empty"><div class="e-ico">📅</div>' + t('لا جدول زمني بعد') + (canUpload ? ' — ' + t('ارفع ملفاً أعلاه') : ' — ' + t('يرفعه الاستشاري')) + '</div>') +
      '</div>';

    const readBtn = el.querySelector('#sch-read');
    if (readBtn) readBtn.addEventListener('click', async function () {
      const f = el.querySelector('#sch-file').files[0];
      const prev = el.querySelector('#sch-preview');
      if (!f) { toast(t('اختر ملف الجدول الزمني أولاً'), true); return; }
      prev.innerHTML = '⏳ ' + t('جارٍ قراءة الملف…');
      try {
        const parsed = await parseScheduleFile(f);
        if (!parsed.length) { prev.innerHTML = '⚠️ ' + t('لم يتم استخراج مهام من الملف. تأكد من الصيغة (يُفضّل CSV/XER/XML/XLSX).'); return; }
        const applyLabel = isContractor ? '📤 ' + t('إرسال للاستشاري للاعتماد') : '💾 ' + t('اعتماد كجدول زمني للمشروع');
        prev.innerHTML =
          '<div class="flex" style="justify-content:space-between;flex-wrap:wrap"><b class="small">✅ ' + t('استُخرجت') + ' ' + parsed.length + ' ' + t('مهمة من') + ' ' + esc(f.name) + '</b>' +
          '<button class="btn sm" id="sch-apply">' + applyLabel + '</button></div>' +
          '<div class="tbl-wrap" style="max-height:34vh;overflow-y:auto;margin-top:10px"><table class="tbl"><thead><tr><th>' + t('المهمة') + '</th><th>' + t('من') + '</th><th>' + t('إلى') + '</th><th>' + t('الإنجاز') + '</th><th>' + t('التأخير') + '</th></tr></thead><tbody>' +
          parsed.slice(0, 200).map(function (p) { const ds = delayStatus(p.progress, p.start, p.end, th.progressAmberPct, th.progressAmberPct * 2); return '<tr><td>' + esc(p.name) + '</td><td class="small muted num">' + esc(p.start || '—') + '</td><td class="small muted num">' + esc(p.end || '—') + '</td><td class="num small">' + p.progress + '%</td><td>' + VS.statusPill(ds.cls, ds.label, ds.icon) + '</td></tr>'; }).join('') +
          '</tbody></table></div>';
        const applyBtn = el.querySelector('#sch-apply');
        if (applyBtn) applyBtn.addEventListener('click', async function () {
          applyBtn.disabled = true;
          try {
            const fileObj = await Api.upload(f, { category: 'الجدول الزمني' });
            const kind = hasSchedBaseline ? 'revision' : 'baseline';
            const title = (kind === 'revision' ? t('تعديل الجدول الزمني —') : t('برنامج زمني —')) + ' ' + f.name;
            // دورة الاعتماد الموحّدة: يُنشأ تقديم جدول زمني يحمل المهام المستخرَجة والملف
            const created = await Api.create('scheduleSubmittals', { title: title, file: fileObj, parsedTasks: parsed, kind: kind });
            if (isContractor) {
              toast(kind === 'revision' ? '📤 ' + t('أُرسل طلب التعديل — يتطلب موافقة الاستشاري وممثل المالك') : '📤 ' + t('أُرسل برنامجك الزمني للاستشاري للاعتماد') + ' (' + parsed.length + ' ' + t('مهمة') + ')');
            } else {
              // الاستشاري/الأدمن: توقيع مباشر — خط الأساس الأول يُعتمد فوراً، والتعديل ينتظر توقيع ممثل المالك
              const res = await Api.review({ collection: 'scheduleSubmittals', id: created.id, status: 'approved', notes: 'اعتماد مباشر' });
              if (res && res.status === 'approved') toast('✅ ' + t('اعتُمد الجدول الزمني الرسمي للمشروع') + ' (' + parsed.length + ' ' + t('مرحلة') + ')');
              else toast('🖊 ' + t('وقّعت كاستشاري — تعديل خط الأساس بانتظار توقيع ممثل المالك'));
            }
            ctx.refresh();
          } catch (e) { toast(e.message, true); applyBtn.disabled = false; }
        });
      } catch (e) { prev.innerHTML = '❌ ' + t('تعذّرت قراءة الملف:') + ' ' + esc(e.message); }
    });

    el.querySelectorAll('[data-nav]').forEach(function (b) {
      b.addEventListener('click', function () { ctx.nav(b.getAttribute('data-nav')); });
    });
    wireBaselineReview(el, ctx);
  }

  // يحوّل ملف جدول كميات (CSV/Excel) إلى بنود [{description,unit,qty,unitPrice,floor}]
  async function parseBoqFile(file, floors) {
    floors = floors || [];
    const rows = await parseRows(file);
    if (!rows.length) return [];
    const head = rows[0].map(function (h) { return String(h).toLowerCase().trim(); });
    const find = function (keys) { for (let i = 0; i < head.length; i++) { if (keys.some(function (k) { return head[i].indexOf(k) !== -1; })) return i; } return -1; };
    const ci = { desc: find(['description', 'item', 'وصف', 'البند', 'الوصف']), unit: find(['unit', 'وحدة', 'الوحدة']), qty: find(['qty', 'quantity', 'كمية', 'الكمية']), price: find(['price', 'unitprice', 'سعر']), floor: find(['floor', 'دور', 'الدور', 'level']) };
    const hasHeader = ci.desc !== -1;
    const body = hasHeader ? rows.slice(1) : rows;
    const dFloor = (floors[0] && floors[0].id) || 'GF';
    const matchFloor = function (v) { if (!v) return dFloor; v = String(v).trim(); const a = floors.find(function (f) { return f.id === v; }); if (a) return a.id; const b = floors.find(function (f) { return f.name === v; }); return b ? b.id : dFloor; };
    return body.map(function (r) {
      return { description: String((ci.desc !== -1 ? r[ci.desc] : r[0]) || '').trim(), unit: (ci.unit !== -1 ? r[ci.unit] : '') || 'وحدة', qty: Number(ci.qty !== -1 ? r[ci.qty] : 0) || 0, unitPrice: Number(ci.price !== -1 ? String(r[ci.price]).replace(/[^\d.]/g, '') : 0) || 0, floor: matchFloor(ci.floor !== -1 ? r[ci.floor] : '') };
    }).filter(function (x) { return x.description; });
  }

  // لوحة اعتماد خط الأساس (جداول الكميات/الجداول الزمنية) — اعتماد فردي لخط الأساس، وتوقيع مزدوج للتعديلات
  // كلمات مفتاحية (عربي/إنجليزي) لاكتشاف أنشطة تمهيدية/تعبئة موقع داخل جدول زمني مرفوع —
  // لا يوجد حقل "نوع نشاط" في البيانات، فهذا أقرب تخمين عملي بلا تغيير تنسيق الرفع
  const PRELIM_KEYWORDS = ['mobiliz', 'preliminary', 'تعبئة', 'تمهيد', 'تجهيز الموقع'];
  function hasPreliminaryTask(tasks) {
    return (tasks || []).some(function (t) {
      const n = String((t && t.name) || '').toLowerCase();
      return PRELIM_KEYWORDS.some(function (k) { return n.indexOf(k) !== -1; });
    });
  }

  function baselineReviewHtml(ctx, collection) {
    const role = ctx.U.role;
    const canConsult = role === 'consultant' || role === 'project_manager' || role === 'admin';
    const canRep = role === 'owner_rep';
    if (!canConsult && !canRep) return '';
    let subs = (ctx.S[collection] || []).filter(function (s) { return s.status === 'pending'; });
    if (!subs.length) return '';
    const isSchedule = collection === 'scheduleSubmittals';
    if (isSchedule) {
      // البنود التمهيدية/Mobilization تُرفَع لأعلى القائمة وتُبرَز — تحتاج مراجعة عاجلة لأنها
      // عادة تُعطِّل بدء بقية الأعمال إن تأخر اعتمادها
      subs = subs.slice().sort(function (a, b) {
        return (hasPreliminaryTask(b.parsedTasks) ? 1 : 0) - (hasPreliminaryTask(a.parsedTasks) ? 1 : 0);
      });
    }
    const title = collection === 'boqSubmittals' ? t('جداول الكميات المقدَّمة') : t('الجداول الزمنية المقدَّمة');
    return '<div class="card mb"><h3 style="margin:0 0 10px">🖊 ' + t('اعتماد') + ' ' + title + ' <span class="hint">' + t('اعتماد خط الأساس من الاستشاري؛ تعديله لاحقاً يتطلب توقيع الاستشاري وممثل المالك معاً') + '</span></h3>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>' + t('المرجع') + '</th><th>' + t('العنوان') + '</th><th>' + t('النوع') + '</th><th>' + t('البنود') + '</th><th>' + t('التوقيعات') + '</th><th>' + t('الإجراء') + '</th></tr></thead><tbody>' +
      subs.map(function (s) {
        const rev = s.kind === 'revision'; const sig = s.sig || {};
        const n = ((s.parsedItems || s.parsedTasks || []).length) || '—';
        const prelim = isSchedule && hasPreliminaryTask(s.parsedTasks);
        const sigCell = rev ? (t('استشاري') + ' ' + (sig.consultant ? '✓' : '—') + ' · ' + t('ممثل المالك') + ' ' + (sig.ownerRep ? '✓' : '—')) : '—';
        let act = '';
        if (rev) {
          if (canConsult && !sig.consultant) act += '<button class="btn sm" data-sign="' + s.id + '" data-col="' + collection + '">🖊 ' + t('توقيع الاستشاري') + '</button> ';
          if (canRep && !sig.ownerRep) act += '<button class="btn sm" data-sign="' + s.id + '" data-col="' + collection + '">🖊 ' + t('توقيع ممثل المالك') + '</button> ';
          act += '<button class="btn danger sm" data-rej="' + s.id + '" data-col="' + collection + '">↩ ' + t('رفض') + '</button>';
        } else if (canConsult) {
          act += '<button class="btn sm" data-sign="' + s.id + '" data-col="' + collection + '">✅ ' + t('اعتماد') + '</button> <button class="btn danger sm" data-rej="' + s.id + '" data-col="' + collection + '">↩ ' + t('إرجاع') + '</button>';
        }
        return '<tr' + (prelim ? ' style="background:rgba(245,165,36,.08);border-right:3px solid var(--warn,#f5a524)"' : '') + '>' +
          '<td class="num small">' + esc(s.docCode || s.ref || '—') + '</td><td class="small">' + esc(s.title || '—') +
          (prelim ? '<div class="small mt" style="color:var(--warn,#f5a524)">⚡ ' + I18n.t('يشمل أعمالاً تمهيدية/تعبئة موقع — يُنصح بمراجعة عاجلة') + '</div>' : '') + '</td>' +
          '<td>' + (rev ? '<span class="pill p-warn">' + t('تعديل') + '</span>' : '<span class="pill p-info">' + t('خط أساس') + '</span>') + '</td><td class="num small">' + n + '</td><td class="small">' + sigCell + '</td><td>' + (act || '<span class="muted small">' + t('بانتظار الطرف الآخر') + '</span>') + '</td></tr>';
      }).join('') + '</tbody></table></div></div>';
  }
  function wireBaselineReview(el, ctx) {
    el.querySelectorAll('[data-sign]').forEach(function (b) {
      b.addEventListener('click', async function () {
        try { await Api.review({ collection: b.getAttribute('data-col'), id: b.getAttribute('data-sign'), status: 'approved' }); toast('✅ ' + t('سُجّل قرارك')); ctx.refresh(); } catch (e) { toast(e.message, true); }
      });
    });
    el.querySelectorAll('[data-rej]').forEach(function (b) {
      b.addEventListener('click', async function () {
        const notes = (window.prompt && window.prompt(t('سبب الإرجاع (اختياري):'))) || '';
        try { await Api.review({ collection: b.getAttribute('data-col'), id: b.getAttribute('data-rej'), status: 'rejected', notes: notes }); toast('↩ ' + t('أُرجع للمقاول')); ctx.refresh(); } catch (e) { toast(e.message, true); }
      });
    });
  }

  window.ViewsExtra = {
    renderContractorBoq: renderContractorBoq,
    renderSchedule: renderSchedule,
    parseScheduleFile: parseScheduleFile,
    parseRows: parseRows,
    parseBoqFile: parseBoqFile,
    baselineReviewHtml: baselineReviewHtml,
    wireBaselineReview: wireBaselineReview,
    delayStatus: delayStatus, expectedPct: expectedPct
  };
})();
