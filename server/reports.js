/** بصير | بناء محتوى تقارير PDF (تسليم موحّد، تقارير دورية) فوق أدوات server/pdf.js */
'use strict';

const { createReport } = require('./pdf.js');

const HND_KINDS_AR = {
  prelim: 'شهادة تسليم ابتدائية', final: 'شهادة تسليم نهائية',
  tc: 'شهادات فحص وتشغيل الأنظمة', inspection: 'تقرير المعاينة النهائية للاستشاري',
  asbuilt: 'مخططات كما نُفذ', om: 'كتيبات تشغيل وصيانة', warranty: 'شهادات ضمان', dlp: 'ملاحظة فترة الضمان DLP'
};
const HND_KINDS_EN = {
  prelim: 'Preliminary Handover Certificate', final: 'Final Handover Certificate',
  tc: 'Testing & Commissioning Certificates', inspection: 'Consultant Final Inspection Report',
  asbuilt: 'As-Built Drawings', om: 'O&M Manuals', warranty: 'Warranty Certificates', dlp: 'DLP Note'
};
const REG_TYPES_AR = {
  municipality: 'شهادة إتمام البناء (البلدية)', civildefense: 'اعتماد الدفاع المدني',
  sec: 'اعتماد الشركة السعودية للكهرباء', occupancy: 'شهادة إشغال', keys: 'سجل تسليم المفاتيح'
};
const REG_TYPES_EN = {
  municipality: 'Building Completion Certificate (Municipality)', civildefense: 'Civil Defense Approval',
  sec: 'Saudi Electricity Company (SEC) Approval', occupancy: 'Occupancy Certificate', keys: 'Keys Handover Log'
};

function contractorName(db, id) {
  const c = (db.contractors || []).find(function (x) { return x.id === id; });
  return c ? c.name : (id || '—');
}

function buildHandoverReport(db, lang) {
  const isAr = lang !== 'en';
  const HND = isAr ? HND_KINDS_AR : HND_KINDS_EN;
  const REG = isAr ? REG_TYPES_AR : REG_TYPES_EN;
  const P = db.projects[0] || {};
  const hnd = db.handoverDocs || [];
  const reg = db.regulatoryApprovals || [];
  const snags = db.snags || [];
  const openSnags = snags.filter(function (s) { return s.status === 'open'; });

  const r = createReport({ lang: lang });
  r.title(isAr ? 'بصير - عيون المالك' : 'Bassir - Owner Eyes');
  r.subtitle((isAr ? 'تقرير التسليم الموحّد — ' : 'Unified Handover Report — ') + (P.name || ''));
  r.row(isAr ? 'المشروع' : 'Project', P.name || '—');
  r.row(isAr ? 'الموقع' : 'Location', P.location || '—');
  r.row(isAr ? 'تاريخ التقرير' : 'Report Date', new Date().toISOString().slice(0, 10));
  r.spacer();

  r.section(isAr ? 'قائمة تجهيز التسليم' : 'Handover Readiness Checklist');
  const hasApproved = function (kind) { return hnd.some(function (x) { return x.kind === kind && (x.status === 'approved' || x.status === 'approved_notes'); }); };
  const regApproved = function (type) { return reg.some(function (x) { return x.type === type && x.status === 'approved'; }); };
  Object.keys(HND).filter(function (k) { return k !== 'dlp'; }).forEach(function (k) {
    r.checklistRow(HND[k], hasApproved(k));
  });
  Object.keys(REG).forEach(function (t) { r.checklistRow(REG[t], regApproved(t)); });
  r.checklistRow(isAr ? 'إغلاق قائمة الملاحظات (Punch List)' : 'Punch List Closure', openSnags.length === 0, String(openSnags.length) + (isAr ? ' مفتوحة' : ' open'));

  r.section(isAr ? 'مستندات التسليم' : 'Handover Documents');
  if (hnd.length) {
    r.table(
      [
        { header: isAr ? 'النوع' : 'Type', width: 160 },
        { header: isAr ? 'العنوان' : 'Title', width: 190 },
        { header: isAr ? 'الحالة' : 'Status', width: 100, raw: true }
      ],
      hnd.map(function (it) { return [HND[it.kind] || it.kind, it.title || '', it.status || '']; })
    );
  } else {
    r.paragraph(isAr ? 'لا مستندات مسجّلة بعد' : 'No documents recorded yet');
  }

  r.section(isAr ? 'الاعتمادات الرسمية' : 'Regulatory Approvals');
  if (reg.length) {
    r.table(
      [
        { header: isAr ? 'النوع' : 'Type', width: 220 },
        { header: isAr ? 'الجهة' : 'Authority', width: 130, raw: true },
        { header: isAr ? 'الحالة' : 'Status', width: 100, raw: true }
      ],
      reg.map(function (it) { return [REG[it.type] || it.title, it.authority || '—', it.status || '']; })
    );
  } else {
    r.paragraph(isAr ? 'لا اعتمادات مسجّلة بعد' : 'No approvals recorded yet');
  }

  r.section(isAr ? 'قائمة الملاحظات (Punch List) حسب المقاول' : 'Punch List by Contractor');
  const byC = {};
  snags.forEach(function (s) {
    const cid = s.contractorId || '—';
    byC[cid] = byC[cid] || { open: 0, closed: 0 };
    if (s.status === 'open') byC[cid].open++; else byC[cid].closed++;
  });
  const punchRows = Object.keys(byC).map(function (cid) {
    const total = byC[cid].open + byC[cid].closed;
    return [contractorName(db, cid), (total ? Math.round(byC[cid].closed / total * 100) : 0) + '%', String(byC[cid].open)];
  });
  if (punchRows.length) {
    r.table(
      [
        { header: isAr ? 'المقاول' : 'Contractor', width: 220 },
        { header: isAr ? 'نسبة الإغلاق' : 'Closed %', width: 110, raw: true },
        { header: isAr ? 'مفتوحة' : 'Open', width: 90, raw: true }
      ],
      punchRows
    );
  } else {
    r.paragraph(isAr ? 'لا توجد ملاحظات مسجّلة' : 'No punch list items recorded');
  }

  r.section(isAr ? 'متابعة انتهاء الضمانات' : 'Warranty Expiry Tracker');
  const now = Date.now();
  const warranties = hnd.filter(function (x) { return x.kind === 'warranty' && x.expiryDate; })
    .map(function (x) { return { title: x.title, expiryDate: x.expiryDate, days: Math.round((new Date(x.expiryDate).getTime() - now) / 86400000) }; })
    .sort(function (a, b) { return a.days - b.days; });
  if (warranties.length) {
    r.table(
      [
        { header: isAr ? 'الضمان' : 'Warranty', width: 260 },
        { header: isAr ? 'تاريخ الانتهاء' : 'Expiry', width: 130, raw: true },
        { header: isAr ? 'الحالة' : 'State', width: 90, raw: true }
      ],
      warranties.map(function (w) {
        const state = w.days < 0 ? (isAr ? 'منتهٍ' : 'Expired') : w.days <= 60 ? (w.days + (isAr ? ' يوم' : ' days')) : (isAr ? 'ساري' : 'Active');
        return [w.title, w.expiryDate, state];
      })
    );
  } else {
    r.paragraph(isAr ? 'لا توجد ضمانات مسجّلة بتاريخ انتهاء' : 'No warranties recorded with an expiry date');
  }

  r.section(isAr ? 'فترة الضمان (DLP)' : 'Defects Liability Period (DLP)');
  const finalCert = hnd.find(function (x) { return x.kind === 'final' && (x.status === 'approved' || x.status === 'approved_notes'); });
  const start = finalCert ? (finalCert.signDate || finalCert.date) : (P.endActual || P.endForecast);
  if (start && !isNaN(new Date(start).getTime())) {
    const startD = new Date(start);
    const endD = new Date(startD); endD.setFullYear(endD.getFullYear() + 1);
    r.row(isAr ? 'بداية DLP' : 'DLP Start', start);
    r.row(isAr ? 'نهاية DLP' : 'DLP End', endD.toISOString().slice(0, 10));
    r.row(isAr ? 'ملاحظات مفتوحة خلال الفترة' : 'Open items during period', String(openSnags.length));
  } else {
    r.paragraph(isAr ? 'تُحسب تلقائياً بعد اعتماد شهادة التسليم النهائية' : 'Calculated automatically once the final handover certificate is approved');
  }

  r.footer(isAr ? 'بصير - عيون المالك — تقرير سري خاص بالمشروع' : 'Bassir - Owner Eyes — Confidential Project Report');
  return r.doc;
}

/** تقرير تقدّم دوري (أسبوعي/شهري) — جاهز للإرسال بضغطة واحدة */
function buildProgressReport(db, lang, period) {
  const isAr = lang !== 'en';
  const P = db.projects[0] || {};
  const r = createReport({ lang: lang });
  const periodLabel = period === 'monthly' ? (isAr ? 'التقرير الشهري' : 'Monthly Report') : (isAr ? 'التقرير الأسبوعي' : 'Weekly Report');

  r.title(isAr ? 'بصير - عيون المالك' : 'Bassir - Owner Eyes');
  r.subtitle(periodLabel + ' — ' + (P.name || ''));
  r.row(isAr ? 'المشروع' : 'Project', P.name || '—');
  r.row(isAr ? 'الموقع' : 'Location', P.location || '—');
  r.row(isAr ? 'تاريخ التقرير' : 'Report Date', new Date().toISOString().slice(0, 10));
  r.spacer();

  r.section(isAr ? 'مؤشرات الأداء الرئيسية' : 'Key Performance Indicators');
  r.row(isAr ? 'نسبة الإنجاز الفعلية' : 'Actual Progress', (P.progressActual || 0) + '%');
  r.row(isAr ? 'نسبة الإنجاز المخططة' : 'Planned Progress', (P.progressPlanned || 0) + '%');
  r.row(isAr ? 'التكلفة الفعلية حتى تاريخه' : 'Actual Cost to Date', Number(P.costActual || 0).toLocaleString('en-US') + ' SAR');
  r.row(isAr ? 'التكلفة المخططة حتى تاريخه' : 'Planned Cost to Date', Number(P.costPlannedToDate || 0).toLocaleString('en-US') + ' SAR');
  r.row(isAr ? 'التسليم المتوقع' : 'Forecast Completion', P.endForecast || '—');

  r.section(isAr ? 'أداء المقاولين' : 'Contractor Performance');
  const boq = db.boqItems || [];
  const rows = (db.contractors || []).map(function (c) {
    const items = boq.filter(function (b) { return b.contractorId === c.id; });
    let earned = 0, total = 0;
    items.forEach(function (b) { const v = b.qty * b.unitPrice; total += v; earned += v * (b.progress / 100); });
    const progress = total ? Math.round(earned / total * 1000) / 10 : 0;
    return [c.name, progress + '%', (c.plannedProgress || 0) + '%'];
  });
  if (rows.length) {
    r.table(
      [
        { header: isAr ? 'المقاول' : 'Contractor', width: 240 },
        { header: isAr ? 'الفعلي' : 'Actual', width: 120, raw: true },
        { header: isAr ? 'المخطط' : 'Planned', width: 120, raw: true }
      ],
      rows
    );
  } else {
    r.paragraph(isAr ? 'لا يوجد مقاولون مسجّلون بعد' : 'No contractors registered yet');
  }

  r.section(isAr ? 'ملاحظات وتنبيهات' : 'Notes & Alerts');
  const alerts = (db.aiInsights || []).filter(function (a) { return a.severity !== 'ok'; }).slice(0, 8);
  if (alerts.length) {
    alerts.forEach(function (a) { r.paragraph('• ' + (a.note || a.area || '')); });
  } else {
    r.paragraph(isAr ? 'لا توجد تنبيهات حرجة حالياً' : 'No critical alerts at this time');
  }

  r.footer(isAr ? 'بصير - عيون المالك — تقرير سري خاص بالمشروع' : 'Bassir - Owner Eyes — Confidential Project Report');
  return r.doc;
}

/** تقرير حادث/تنبيه واحد قابل للأرشفة والطباعة — من رؤى بصير الذكية (كاميرات/صور) */
function buildIncidentReport(db, insight, lang) {
  const isAr = lang !== 'en';
  const P = db.projects[0] || {};
  const assignee = insight.assignedTo ? contractorName(db, insight.assignedTo) : (isAr ? 'غير مُسندة' : 'Unassigned');
  const severityLabel = { alert: isAr ? 'حرج 🚨' : 'Critical 🚨', warn: isAr ? 'تنبيه ⚠️' : 'Warning ⚠️', ok: isAr ? 'سليم ✅' : 'OK ✅' }[insight.severity] || (insight.severity || '—');
  const sourceLabel = { camera: isAr ? 'كاميرات الموقع' : 'Site Cameras', photos: isAr ? 'تحليل الصور' : 'Photo Analysis' }[insight.source] || (insight.source || '—');

  const r = createReport({ lang: lang });
  r.title(isAr ? 'بصير - عيون المالك' : 'Bassir - Owner Eyes');
  r.subtitle((isAr ? 'تقرير حادث / تنبيه — ' : 'Incident / Alert Report — ') + (P.name || ''));
  r.row(isAr ? 'المرجع' : 'Reference', insight.id || '—');
  r.row(isAr ? 'التاريخ' : 'Date', insight.date || '—');
  r.row(isAr ? 'المصدر' : 'Source', sourceLabel);
  r.row(isAr ? 'الموقع/البند' : 'Area/Item', insight.area || '—');
  r.row(isAr ? 'الخطورة' : 'Severity', severityLabel);
  if (insight.detected != null) r.row(isAr ? 'الرصد البصري' : 'Visual Detection', insight.detected + '%');
  if (insight.reported != null) r.row(isAr ? 'نسبة الاستشاري' : 'Consultant Reported', insight.reported + '%');
  r.row(isAr ? 'الجهة المسؤولة' : 'Responsible Party', assignee);
  r.spacer();

  r.section(isAr ? 'الوصف' : 'Description');
  r.paragraph(insight.note || (isAr ? 'لا وصف' : 'No description'));

  r.footer(isAr ? 'بصير - عيون المالك — تقرير حادث سري خاص بالمشروع' : 'Bassir - Owner Eyes — Confidential Incident Report');
  return r.doc;
}

module.exports = { buildHandoverReport: buildHandoverReport, buildProgressReport: buildProgressReport, buildIncidentReport: buildIncidentReport };
