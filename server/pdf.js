/**
 * بصير | توليد تقارير PDF ثنائية اللغة (عربي RTL / إنجليزي LTR) — PDFKit بلا متصفح.
 *
 * ملاحظة فنية مهمة: PDFKit يرسم كل نص من اليسار لليمين حرفاً حرفاً بغض النظر عن اتجاه اللغة،
 * ولا يدعم تشكيل الحروف العربية (Shaping) أو ترتيب BiDi تلقائياً. الحل المتَّبع هنا:
 * - كل "جزء" عربي بحت (run) يُشكَّل بمكتبة arabic-reshaper ثم تُعكس حروفه فقط هو (لأن ما يُرسم
 *   أولاً من اليسار يجب أن يكون آخر ما يُقرأ من اليمين).
 * - أي جزء غير عربي (أرقام، %، أقواس، إنجليزي) يبقى بترتيبه الطبيعي دون أي عكس — فلا تنقلب
 *   "94%" إلى "%49" حين تكون مُضمَّنة داخل جملة عربية.
 * - الالتفاف لأكثر من سطر يتم يدوياً على مستوى الكلمات (بالعرض الفعلي المقيس لكل كلمة) قبل
 *   التشكيل والعكس، ثم يُشكَّل/يُعكس كل سطر مكتمل على حدة ويُرسم في مكانه — بخلاف الاعتماد على
 *   التفاف PDFKit التلقائي لنص مُشكَّل ومعكوس سلفاً بالكامل، وهو ما كان يُنتج نصاً مبعثراً تماماً
 *   حال تجاوز الفقرة سطراً واحداً (لأن نقاط فصل الأسطر التلقائية تقع في مواضع خاطئة من نص معكوس).
 */
'use strict';

const PDFDocument = require('pdfkit');
const reshaper = require('arabic-reshaper');
const path = require('path');

const FONT_AR = path.join(__dirname, 'fonts', 'NotoNaskhArabic-Regular.ttf');
const FONT_EN = path.join(__dirname, 'fonts', 'NotoSans-Regular.ttf');

// نطاقات يونيكود للحروف العربية (عربي أساسي + ملحقات + أشكال عرض) — أي شيء خارجها (أرقام،
// إنجليزي، علامات ترقيم، %، أقواس، مسافات) يُعامَل كجزء "غير عربي" فلا يُعكس اتجاهه أبداً
const AR_RANGE = '\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF';
const RUN_RE = new RegExp('([' + AR_RANGE + ']+)|([^' + AR_RANGE + ']+)', 'g');

/** يقسّم نصاً مختلطاً إلى أجزاء متتالية: عربي بحت أو غير عربي بحت، كلٌّ بعلم ar */
function splitRuns(s) {
  const runs = [];
  let m;
  RUN_RE.lastIndex = 0;
  while ((m = RUN_RE.exec(s))) {
    if (m[1]) runs.push({ text: m[1], ar: true });
    else if (m[2]) runs.push({ text: m[2], ar: false });
  }
  return runs;
}

/** يُشكِّل جزءاً عربياً بحتاً ويعكس ترتيب حروفه؛ الأجزاء غير العربية تمر دون أي تعديل */
function shapeRun(run) {
  return run.ar ? reshaper.convertArabic(run.text).split('').reverse().join('') : run.text;
}

/** يُشكِّل نصاً عربياً بحتاً بالكامل ويعكس ترتيب حروفه — صالح فقط كأداة عامة لسطر واحد قصير بلا
 *  أرقام مُضمَّنة ولا التفاف؛ الرسم الفعلي لكل نصوص التقرير يمر عبر drawParagraph/drawLine أدناه */
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

  /** عرض كلمة واحدة (قد تحوي أجزاءً مختلطة، مثل "6%" ملتصقة بنص عربي) بجمع عرض كل أجزائها */
  function wordWidth(word, size) {
    return splitRuns(word).reduce(function (w, run) {
      doc.font(run.ar ? bodyFont : FONT_EN).fontSize(size);
      return w + doc.widthOfString(shapeRun(run));
    }, 0);
  }

  /** يلف نصاً (بترتيبه المنطقي الأصلي، قبل أي تشكيل أو عكس) إلى أسطر لا تتجاوز maxWidth،
   *  بالقياس الفعلي لعرض كل كلمة بخطها الصحيح — كل عنصر في الناتج مصفوفة كلمات سطر واحد */
  function wrapWords(text, maxWidth, size) {
    const words = String(text == null ? '' : text).split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    doc.font(FONT_EN).fontSize(size);
    const spaceW = doc.widthOfString(' ');
    const lines = [];
    let cur = [], curW = 0;
    words.forEach(function (w) {
      const ww = wordWidth(w, size);
      const add = cur.length ? spaceW + ww : ww;
      if (cur.length && curW + add > maxWidth) { lines.push(cur); cur = [w]; curW = ww; }
      else { cur.push(w); curW += add; }
    });
    if (cur.length) lines.push(cur);
    return lines;
  }

  /** يرسم سطراً واحداً مكتملاً (مصفوفة كلمات بترتيبها المنطقي) بالاتجاه الصحيح: عند lineAlign='right'
   *  تُعكس الكلمات، وكل كلمة تُشكَّل/تُعكس جزئياً حسب أجزائها (عربي يُعكس، أرقام/رموز تبقى كما هي) */
  function drawLine(words, x, y, maxWidth, size, color, lineAlign) {
    doc.font(FONT_EN).fontSize(size);
    const spaceW = doc.widthOfString(' ');
    let total = 0;
    words.forEach(function (w, i) { total += wordWidth(w, size); if (i) total += spaceW; });
    let curX = lineAlign === 'right' ? (x + maxWidth - total)
      : lineAlign === 'center' ? (x + (maxWidth - total) / 2)
        : x;
    const ordered = lineAlign === 'right' ? words.slice().reverse() : words;
    ordered.forEach(function (word, wi) {
      splitRuns(word).forEach(function (run) {
        const shaped = shapeRun(run);
        doc.font(run.ar ? bodyFont : FONT_EN).fontSize(size).fillColor(color || '#000');
        doc.text(shaped, curX, y, { lineBreak: false });
        curX += doc.widthOfString(shaped);
      });
      if (wi < ordered.length - 1) curX += spaceW;
    });
    doc.fillColor('#000');
  }

  /** يرسم نصاً مع التفاف صحيح للأسطر الطويلة واتجاه سليم للأرقام/الرموز المُضمَّنة داخله —
   *  البديل الآمن عن doc.text(t(text), ...) المباشر. يُعيد الـ y بعد آخر سطر مرسوم */
  function drawParagraph(text, x, startY, maxWidth, size, color, lineAlign) {
    if (!isAr) {
      doc.font(FONT_EN).fontSize(size).fillColor(color || '#000');
      doc.text(String(text == null ? '' : text), x, startY, { width: maxWidth, align: lineAlign === 'right' ? 'right' : (lineAlign === 'center' ? 'center' : 'left') });
      doc.fillColor('#000');
      return doc.y;
    }
    const lines = wrapWords(text, maxWidth, size);
    const lineH = size * 1.3;
    let y = startY;
    if (!lines.length) return y + lineH;
    lines.forEach(function (lineWords, i) {
      if (i > 0) { ensureSpace(lineH); y = doc.y; }
      drawLine(lineWords, x, y, maxWidth, size, color, lineAlign);
      y += lineH;
      doc.y = y;
    });
    return y;
  }

  function title(text) {
    ensureSpace(40);
    doc.y = drawParagraph(text, PAGE_MARGIN, doc.y, W, 20, '#111', align);
    doc.moveDown(0.4);
  }
  function subtitle(text) {
    ensureSpace(24);
    doc.y = drawParagraph(text, PAGE_MARGIN, doc.y, W, 12, '#555', align);
    doc.moveDown(0.8);
  }
  function section(text) {
    ensureSpace(30);
    doc.moveDown(0.4);
    doc.y = drawParagraph(text, PAGE_MARGIN, doc.y, W, 14, '#8a5a1c', align);
    const ly = doc.y + 2;
    doc.moveTo(PAGE_MARGIN, ly).lineTo(PAGE_MARGIN + W, ly).strokeColor('#ccc').stroke();
    doc.moveDown(0.5);
  }
  /** سطر "تسمية: قيمة" — التسمية بلغة التقرير (مُشكَّلة إن عربية)، والقيمة (رقم/تاريخ/كود) دون تعديل
   *  بعمود منفصل. بعض القيم الفعلية (اسم المشروع، الموقع، اسم المقاول...) نص عربي بحت لا رمز/رقم
   *  خام — فتُكتشف تلقائياً وتُرسم كسطر عربي واحد "تسمية: قيمة" بدل عمود FONT_EN الخام الذي كان
   *  يعرضها حروفاً مفقودة/غير مُشكَّلة لأنه صُمِّم لقيم غير عربية فقط */
  function row(label, value) {
    ensureSpace(20);
    const v = value == null || value === '' ? '—' : String(value);
    if (isAr && splitRuns(v).some(function (r) { return r.ar; })) {
      drawParagraph(label + ': ' + v, PAGE_MARGIN, doc.y, W, 10.5, '#444', align);
      doc.moveDown(0.55);
      return;
    }
    const y = doc.y;
    drawParagraph(label, PAGE_MARGIN, y, W, 10.5, '#444', align);
    doc.font(FONT_EN).fontSize(10.5).fillColor('#000');
    doc.text(v, PAGE_MARGIN, y, { width: W, align: valueAlign });
    doc.moveDown(0.55);
  }
  function paragraph(text) {
    ensureSpace(20);
    doc.y = drawParagraph(text, PAGE_MARGIN, doc.y, W, 10, '#222', align);
    doc.moveDown(0.5);
  }
  function checklistRow(label, done, hint) {
    ensureSpace(18);
    const y = doc.y;
    // العلامة (ASCII بحت — لا رموز يونيكود قد تكون مفقودة في خط عربي) + التلميح، على الجانب المقابل للتسمية دوماً
    drawParagraph(label, PAGE_MARGIN, y, W - 90, 10.5, done ? '#1a8a5c' : '#333', align);
    doc.font(FONT_EN).fontSize(9.5).fillColor(done ? '#1a8a5c' : '#888');
    doc.text((done ? '[x] ' : '[ ] ') + (hint || ''), PAGE_MARGIN, y, { width: W, align: valueAlign });
    doc.moveDown(0.5);
  }
  /** جدول بسيط بأعمدة ثابتة العرض؛ كل خلية إما نص عربي بحت/مختلط يُشكَّل بالتفاف صحيح، أو رقم/رمز
   *  خام حسب raw (العناوين تُشكَّل دوماً بلغة التقرير) */
  function table(cols, rows) {
    ensureSpace(30);
    const colW = cols.map(function (c) { return c.width || (W / cols.length); });
    function drawRowLine(cells, isHeader) {
      const texts = isHeader ? cols.map(function (c) { return c.header; }) : cells;
      const lineCounts = cols.map(function (c, i) {
        const raw = !isHeader && c.raw;
        return raw ? 1 : Math.max(1, wrapWords(texts[i], colW[i] - 8, 9.5).length);
      });
      const rowH = Math.max.apply(null, lineCounts.map(function (n) { return n * 9.5 * 1.3; }).concat([14]));
      ensureSpace(rowH + 6);
      const y = doc.y;
      let x = PAGE_MARGIN;
      cols.forEach(function (c, i) {
        const raw = !isHeader && c.raw;
        const color = isHeader ? '#8a5a1c' : '#222';
        if (isHeader) {
          drawParagraph(c.header, x, y, colW[i] - 8, 9.5, color, align);
        } else if (raw) {
          doc.font(FONT_EN).fontSize(9.5).fillColor(color);
          doc.text(String(cells[i] == null ? '' : cells[i]), x, y, { width: colW[i] - 8, align: valueAlign });
          doc.fillColor('#000');
        } else {
          drawParagraph(cells[i], x, y, colW[i] - 8, 9.5, color, align);
        }
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
      const full = String(text == null ? '' : text) + '  ·  ' + (i + 1) + '/' + range.count;
      drawParagraph(full, PAGE_MARGIN, doc.page.height - 35, W, 8, '#999', 'center');
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
