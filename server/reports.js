/** بصير | بناء محتوى تقارير PDF (تسليم موحّد، تقارير دورية) فوق أدوات server/pdf.js */
'use strict';

const { createReport } = require('./pdf.js');

function contractorName(db, id) {
  const c = (db.contractors || []).find(function (x) { return x.id === id; });
  return c ? c.name : (id || '—');
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

module.exports = { buildProgressReport: buildProgressReport, buildIncidentReport: buildIncidentReport };
