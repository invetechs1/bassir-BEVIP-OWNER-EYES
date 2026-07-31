/**
 * بصير | توليد تقارير PDF ثنائية اللغة (عربي RTL / إنجليزي LTR) — PDFKit بلا متصفح.
 *
 * ملاحظة فنية مهمة: PDFKit يرسم كل نص من اليسار لليمين حرفاً حرفاً بغض النظر عن اتجاه اللغة،
 * ولا يدعم تشكيل الحروف العربية (Shaping) أو ترتيب BiDi تلقائياً. لتفادي تعقيد وهشاشة
 * خوارزميات BiDi الكاملة مع نصوص قصيرة/جداول (تسميات + أرقام/تواريخ/رموز)، نتّبع هنا استراتيجية
 * أبسط وأوثق تم اختبارها بصرياً: كل نص عربي بحت يُشكَّل بمكتبة arabic-reshaper ثم تُعكس حروفه
 * (لأن ما يُرسم أولاً من اليسار يجب أن يكون آخر ما يُقرأ من اليمين)، بينما تبقى الأرقام/الرموز/
 * الإنجليزية دون أي تعديل في عمود أو موضع منفصل تماماً — لا نمزج الاتجاهين داخل نص واحد متصل.
 */
'use strict';

const PDFDocument = require('pdfkit');
const reshaper = require('arabic-reshaper');
const path = require('path');

const FONT_AR = path.join(__dirname, 'fonts', 'NotoNaskhArabic-Regular.ttf');
const FONT_EN = path.join(__dirname, 'fonts', 'NotoSans-Regular.ttf');

/** يُشكِّل نصاً عربياً بحتاً ويعكس ترتيب حروفه لعرض صحيح بمحرك رسم LTR */
function ar(text) {
  const s = String(text == null ? '' : text);
  if (!s) return s;
  return reshaper.convertArabic(s).split('').reverse().join('');
}

const PAGE_MARGIN = 50;

function createReport(opts) {
  opts = opts || {};
  const lang = opts.lang === 'en' ? 'en' : 'ar';
  const isAr = lang === 'ar';
  const doc = new PDFDocument({ size: 'A4', margin: PAGE_MARGIN, bufferPages: true });
  const bodyFont = isAr ? FONT_AR : FONT_EN;
  const W = doc.page.width - PAGE_MARGIN * 2;
  const align = isAr ? 'right' : 'left';
  const valueAlign = isAr ? 'left' : 'right';

  doc.font(bodyFont);

  function t(text) { return isAr ? ar(text) : String(text == null ? '' : text); }

  function ensureSpace(h) {
    // هامش أمان إضافي (10) لأن heightOfString تقديرية وقد تختلف قليلاً عن الارتفاع الفعلي عند الرسم
    if (doc.y + h > doc.page.height - PAGE_MARGIN - 10) doc.addPage();
  }

  function title(text) {
    ensureSpace(40);
    doc.font(bodyFont).fontSize(20).fillColor('#111');
    doc.text(t(text), PAGE_MARGIN, doc.y, { width: W, align: align });
    doc.moveDown(0.4);
  }
  function subtitle(text) {
    ensureSpace(24);
    doc.font(bodyFont).fontSize(12).fillColor('#555');
    doc.text(t(text), PAGE_MARGIN, doc.y, { width: W, align: align });
    doc.fillColor('#000');
    doc.moveDown(0.8);
  }
  function section(text) {
    ensureSpace(30);
    doc.moveDown(0.4);
    doc.font(bodyFont).fontSize(14).fillColor('#8a5a1c');
    doc.text(t(text), PAGE_MARGIN, doc.y, { width: W, align: align });
    doc.fillColor('#000');
    const ly = doc.y + 2;
    doc.moveTo(PAGE_MARGIN, ly).lineTo(PAGE_MARGIN + W, ly).strokeColor('#ccc').stroke();
    doc.moveDown(0.5);
  }
  /** سطر "تسمية: قيمة" — التسمية بلغة التقرير (مُشكَّلة إن عربية)، والقيمة (رقم/تاريخ/كود) دون تعديل بعمود منفصل */
  function row(label, value) {
    ensureSpace(20);
    const y = doc.y;
    doc.font(bodyFont).fontSize(10.5).fillColor('#444');
    doc.text(t(label), PAGE_MARGIN, y, { width: W, align: align });
    doc.font(FONT_EN).fontSize(10.5).fillColor('#000');
    doc.text(String(value == null || value === '' ? '—' : value), PAGE_MARGIN, y, { width: W, align: valueAlign });
    doc.moveDown(0.55);
  }
  function paragraph(text) {
    ensureSpace(20);
    doc.font(bodyFont).fontSize(10).fillColor('#222');
    doc.text(t(text), PAGE_MARGIN, doc.y, { width: W, align: align });
    doc.fillColor('#000');
    doc.moveDown(0.5);
  }
  function checklistRow(label, done, hint) {
    ensureSpace(18);
    const y = doc.y;
    // العلامة (ASCII بحت — لا رموز يونيكود قد تكون مفقودة في خط عربي) + التلميح، على الجانب المقابل للتسمية دوماً
    doc.font(bodyFont).fontSize(10.5).fillColor(done ? '#1a8a5c' : '#333');
    doc.text(t(label), PAGE_MARGIN, y, { width: W - 90, align: align });
    doc.font(FONT_EN).fontSize(9.5).fillColor(done ? '#1a8a5c' : '#888');
    doc.text((done ? '[x] ' : '[ ] ') + (hint || ''), PAGE_MARGIN, y, { width: W, align: valueAlign });
    doc.fillColor('#000');
    doc.moveDown(0.5);
  }
  /** جدول بسيط بأعمدة ثابتة العرض؛ كل خلية إما نص عربي بحت مُشكَّل أو رقم/رمز خام حسب raw (العناوين تُشكَّل دوماً بلغة التقرير) */
  function table(cols, rows) {
    ensureSpace(30);
    const colW = cols.map(function (c) { return c.width || (W / cols.length); });
    function drawRowLine(cells, isHeader) {
      const startY = doc.y;
      let x = PAGE_MARGIN;
      const heights = [];
      cols.forEach(function (c, i) {
        const raw = !isHeader && c.raw;
        doc.font(raw ? FONT_EN : bodyFont).fontSize(9.5).fillColor(isHeader ? '#8a5a1c' : '#222');
        const text = raw ? String(cells[i] == null ? '' : cells[i]) : t(cells[i]);
        const h = doc.heightOfString(text, { width: colW[i] - 8, align: raw ? valueAlign : align });
        heights.push(h);
      });
      const rowH = Math.max.apply(null, heights.concat([14]));
      ensureSpace(rowH + 6);
      const y = doc.y;
      x = PAGE_MARGIN;
      cols.forEach(function (c, i) {
        const raw = !isHeader && c.raw;
        doc.font(raw ? FONT_EN : bodyFont).fontSize(9.5).fillColor(isHeader ? '#8a5a1c' : '#222');
        const text = raw ? String(cells[i] == null ? '' : cells[i]) : t(cells[i]);
        doc.text(text, x, y, { width: colW[i] - 8, align: raw ? valueAlign : align });
        x += colW[i];
      });
      doc.y = y + rowH + 6;
      doc.moveTo(PAGE_MARGIN, doc.y - 3).lineTo(PAGE_MARGIN + W, doc.y - 3).strokeColor('#e5e5e5').stroke();
    }
    drawRowLine(cols.map(function (c) { return c.header; }), true);
    rows.forEach(function (r) { drawRowLine(r, false); });
    doc.moveDown(0.6);
  }
  function spacer(h) { doc.moveDown(h || 0.5); }
  function footer(text) {
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.font(FONT_EN).fontSize(8).fillColor('#999');
      doc.text(t(text) + '  ·  ' + (i + 1) + '/' + range.count, PAGE_MARGIN, doc.page.height - 35, { width: W, align: 'center' });
    }
  }

  return {
    doc: doc, W: W, isAr: isAr, t: t,
    title: title, subtitle: subtitle, section: section, row: row,
    paragraph: paragraph, checklistRow: checklistRow, table: table,
    spacer: spacer, footer: footer, ensureSpace: ensureSpace
  };
}

module.exports = { createReport: createReport, ar: ar };
