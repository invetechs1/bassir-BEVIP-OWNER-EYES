/**
 * بصير | توليد تقارير PDF ثنائية اللغة (عربي RTL / إنجليزي LTR) — PDFKit بلا متصفح.
 *
 * ملاحظة فنية مهمة (اكتُشفت بعد تجربة مباشرة، تُنقض الافتراض الذي اعتُمد سابقاً في هذا الملف):
 * PDFKit (عبر محرك fontkit الذي يرسم النص فعلياً) **يُشكِّل الحروف العربية تلقائياً بشكل صحيح**
 * (يصل كل حرف بجاره حسب موقعه في الكلمة) عند تمرير نص عربي خام غير معدَّل إطلاقاً — تأكَّد هذا
 * عملياً بمقارنة نص خام عبر doc.text() مباشرة (يظهر متصلاً وصحيحاً تماماً) مقابل نفس النص بعد
 * تمريره على مكتبة arabic-reshaper ثم عكس ترتيب حروفه (كانت هذه هي الطريقة المُتَّبعة سابقاً هنا) —
 * فالثاني يُنتج حروفاً منفصلة/مكسورة بصرياً، لأن أشكال العرض الجاهزة (Presentation Forms) التي
 * تُنتجها arabic-reshaper لا تتصل مع بعضها بنفس جودة التشكيل الموضعي (Contextual Shaping) الذي
 * يؤديه fontkit تلقائياً من حروف Unicode الأساسية عبر جداول OpenType الخاصة بالخط نفسه.
 *
 * ما لا يزال PDFKit لا يفعله تلقائياً هو ترتيب BiDi على مستوى الكلمات/الأسطر (عكس اتجاه القراءة)،
 * وله أخطاء حقيقية خاصة به عند خلط عربي/إنجليزي في نفس السطر (مسافات تُفقَد عند حدود الاتجاه،
 * وأسطر أساسها إنجليزي يُعاد ترتيبها بالكامل خطأً بدل عزل العبارة العربية المُضمَّنة فقط). لذلك:
 * - كل "كلمة" (مفصولة بمسافة) تُرسَم بنصها الخام دون أي تعديل لحروفها — fontkit يتولى التشكيل.
 * - ترتيب **الكلمات** هو ما نتحكم فيه يدوياً حسب اتجاه السطر (عكس كامل لسطر عربي، أو عزل العبارات
 *   العربية المتجاورة فقط ضمن سطر أساسه إنجليزي) — تفصيل كافٍ وبسيط يتفادى خلل PDFKit الخاص بذلك.
 * - الالتفاف لأكثر من سطر يتم يدوياً على مستوى الكلمات (بالعرض الفعلي المقيس لكل كلمة) قبل الرسم،
 *   ثم يُرسَم كل سطر مكتمل في مكانه بترتيب كلماته الصحيح — بخلاف ترك PDFKit يلف نصاً مُعاد ترتيبه
 *   مسبقاً بالكامل، وهو ما كان يُنتج نصاً مبعثراً عند تجاوز الفقرة سطراً واحداً.
 */
'use strict';

const PDFDocument = require('pdfkit');
const path = require('path');

const FONT_AR = path.join(__dirname, 'fonts', 'NotoNaskhArabic-Regular.ttf');
const FONT_EN = path.join(__dirname, 'fonts', 'NotoSans-Regular.ttf');

// نطاقات يونيكود للحروف العربية (عربي أساسي + ملحقات + أشكال عرض) — أي شيء خارجها (أرقام،
// إنجليزي، علامات ترقيم، %، أقواس، مسافات) يُعامَل كجزء "غير عربي"
const AR_RANGE = '\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF';
const RUN_RE = new RegExp('([' + AR_RANGE + ']+)|([^' + AR_RANGE + ']+)', 'g');

/** يقسّم نصاً مختلطاً إلى أجزاء متتالية: عربي بحت أو غير عربي بحت، كلٌّ بعلم ar — تُستخدم فقط
 *  لاختيار الخط الصحيح لكل جزء (لا لأي تعديل على الحروف نفسها، تبقى كما هي دوماً) */
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

  function t(text) { return String(text == null ? '' : text); }

  function ensureSpace(h) {
    // هامش أمان إضافي (10) لأن heightOfString تقديرية وقد تختلف قليلاً عن الارتفاع الفعلي عند الرسم
    if (doc.y + h > doc.page.height - PAGE_MARGIN - 10) doc.addPage();
  }

  /** عرض كلمة واحدة (قد تحوي أجزاءً مختلطة، مثل "6%" ملتصقة بنص عربي) بجمع عرض كل أجزائها بخطها الصحيح */
  function wordWidth(word, size) {
    return splitRuns(word).reduce(function (w, run) {
      doc.font(run.ar ? FONT_AR : FONT_EN).fontSize(size);
      return w + doc.widthOfString(run.text);
    }, 0);
  }

  /** يلف نصاً (بترتيبه المنطقي الأصلي) إلى أسطر لا تتجاوز maxWidth، بالعرض الفعلي المقيس لكل
   *  كلمة بخطها الصحيح — كل عنصر في الناتج مصفوفة كلمات سطر واحد */
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

  /** هل غالب حروف هذه الكلمة عربية؟ يُستخدم لتحديد اتجاهها ضمن سطر أساسه إنجليزي */
  function isArabicWord(w) {
    const ar = (w.match(/[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/g) || []).length;
    return ar > w.length / 2;
  }
  /** هل تحوي هذه الكلمة حرفاً لاتينياً حقيقياً؟ (لا رقماً/رمزاً فقط) */
  function hasLatinLetter(w) { return /[A-Za-z]/.test(w); }
  /** رابط محايد (شرطة/فاصلة) لا يحمل اتجاهاً خاصاً به — إن وقع بين كلمتين عربيتين (مثل
   *  "الرياض - حي الياسمين") يُعامَل كجزء من نفس العبارة العربية المتجاورة لا كفاصل يقطعها */
  function isNeutralConnector(w) { return /^[-–—,،]+$/.test(w); }

  /** يرسم سطراً واحداً مكتملاً (مصفوفة كلمات بترتيبها المنطقي) بالاتجاه الصحيح. الاتجاه الفعلي
   *  للسطر يُقرَّر من محتواه لا من لغة التقرير فقط: lineAlign='right' دائماً RTL كاملاً (تُعكس كل
   *  الكلمات)؛ وعند lineAlign='left' فإن لم يحوِ السطر ولو كلمة إنجليزية حقيقية (ملاحظة/نص لم
   *  يُترجَم ظهر كاملاً داخل تقرير إنجليزي) يُعامَل أيضاً كسطر RTL كامل رغم محاذاته اليسرى، وإلا
   *  (نص إنجليزي أساساً مع اسم عربي قصير مُضمَّن) تُعكَس فقط كل عبارة عربية متجاورة مع إبقائها في
   *  موضعها — بديل بسيط وكافٍ هنا عن خوارزمية BiDi الكاملة. كل كلمة تُرسَم بنصها الخام دون أي
   *  تعديل لحروفها — fontkit يتولى تشكيل الاتصال بين الحروف تلقائياً وبشكل صحيح */
  function drawLine(words, x, y, maxWidth, size, color, lineAlign) {
    doc.font(FONT_EN).fontSize(size);
    const spaceW = doc.widthOfString(' ');
    let total = 0;
    words.forEach(function (w, i) { total += wordWidth(w, size); if (i) total += spaceW; });
    let curX = lineAlign === 'right' ? (x + maxWidth - total)
      : lineAlign === 'center' ? (x + (maxWidth - total) / 2)
        : x;
    const lineIsRtl = lineAlign === 'right' || !words.some(hasLatinLetter);
    let ordered;
    if (lineIsRtl) {
      ordered = words.slice().reverse();
    } else {
      ordered = [];
      let i = 0;
      while (i < words.length) {
        if (isArabicWord(words[i])) {
          let j = i;
          while (j < words.length) {
            if (isArabicWord(words[j])) { j++; continue; }
            if (isNeutralConnector(words[j]) && j + 1 < words.length && isArabicWord(words[j + 1])) { j++; continue; }
            break;
          }
          ordered = ordered.concat(words.slice(i, j).reverse());
          i = j;
        } else {
          ordered.push(words[i]);
          i++;
        }
      }
    }
    ordered.forEach(function (word, wi) {
      splitRuns(word).forEach(function (run) {
        doc.font(run.ar ? FONT_AR : FONT_EN).fontSize(size).fillColor(color || '#000');
        doc.text(run.text, curX, y, { lineBreak: false });
        curX += doc.widthOfString(run.text);
      });
      if (wi < ordered.length - 1) curX += spaceW;
    });
    doc.fillColor('#000');
  }

  /** يرسم نصاً مع التفاف صحيح للأسطر الطويلة واتجاه سليم للكلمات العربية/الأرقام المُضمَّنة داخله —
   *  البديل الآمن عن doc.text(text, ...) المباشر عند الحاجة لالتفاف صحيح لأكثر من سطر عربي.
   *  يُعيد الـ y بعد آخر سطر مرسوم. يعمل بنفس الآلية في التقريرين العربي والإنجليزي معاً — فبيانات
   *  حقيقية (اسم مشروع، مقاول، ملاحظات) قد تبقى عربية بحتة حتى داخل تقرير "إنجليزي" إن لم تُترجَم */
  function drawParagraph(text, x, startY, maxWidth, size, color, lineAlign) {
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
  /** سطر "تسمية: قيمة" — التسمية بلغة التقرير، والقيمة (رقم/تاريخ/كود) دون تعديل بعمود منفصل.
   *  بعض القيم الفعلية (اسم المشروع، الموقع، اسم المقاول...) نص عربي بحت لا رمز/رقم خام — في تقرير
   *  عربي أو إنجليزي على حدٍّ سواء (بيانات غير مُترجَمة) — فتُكتشف تلقائياً وتُرسم كسطر واحد
   *  "تسمية: قيمة" بدل عمود FONT_EN الخام المخصَّص لقيم غير عربية فقط */
  function row(label, value) {
    ensureSpace(20);
    const v = value == null || value === '' ? '—' : String(value);
    if (splitRuns(v).some(function (r) { return r.ar; })) {
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
  /** جدول بسيط بأعمدة ثابتة العرض؛ كل خلية إما نص عربي بحت/مختلط يُلتف بشكل صحيح، أو رقم/رمز
   *  خام حسب raw (العناوين تُرسم دوماً بآلية الالتفاف نفسها) */
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

module.exports = { createReport: createReport };
