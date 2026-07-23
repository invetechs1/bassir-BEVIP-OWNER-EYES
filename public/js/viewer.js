/**
 * بصير | عارض المخططات مع الترميز (Markup)
 * فتح المخطط المرفوع، الكتابة عليه (قلم، مستطيل، سهم، نص، دبابيس ملاحظات مرقمة)،
 * حفظ الملاحظات، ثم الاعتماد أو الإرجاع للمقاول من داخل العارض.
 * الإحداثيات تُخزن منسوبة (0..1) فتبقى صحيحة مع أي مقاس عرض.
 */
(function () {
  'use strict';

  const esc = Charts.esc;
  const APPROVAL_COLS = ['shopDrawings', 'materials', 'scheduleSubmittals', 'wirs', 'changeOrders', 'payments',
    'methodStatements', 'claims', 'valueEngineering', 'handoverDocs'];
  const COLORS = ['#ff3b30', '#ffcc00', '#2dd4a0', '#4cc9f0', '#ffffff'];
  const IMG_EXT = /\.(png|jpe?g|webp|gif|bmp)$/i;

  function fileOf(item) {
    const f = item.file;
    if (!f) return { name: '', url: '', isImage: false };
    if (typeof f === 'string') return { name: f, url: '', isImage: false };
    return { name: f.name || '', url: f.url || '', isImage: !!f.url && IMG_EXT.test(f.name || f.url) };
  }

  /**
   * فتح العارض.
   * opts: { canEdit (يرسم ويحفظ), canReview (أزرار الاعتماد/الإرجاع), onDone }
   */
  function openDrawingViewer(ctx, collection, item, opts) {
    opts = opts || {};
    const VS = window.ViewsShared;
    const f = fileOf(item);
    const canEdit = !!opts.canEdit;
    const canReview = !!opts.canReview && APPROVAL_COLS.indexOf(collection) !== -1 && item.status === 'pending';
    let anns = JSON.parse(JSON.stringify(item.annotations || []));
    let tool = 'pen', color = COLORS[0], current = null, dirty = false;

    const back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML =
      '<div class="dv-wrap">' +
      '<div class="dv-head">' +
      '<div><b>🖊 ' + esc(item.title || f.name) + '</b>' +
      '<div class="small muted">' + esc(item.ref || '') + (f.name ? ' · 📎 ' + esc(f.name) : '') +
      (item.markupBy ? ' · آخر ترميز: ' + esc(item.markupBy) + ' (' + esc(item.markupDate || '') + ')' : '') + '</div></div>' +
      '<span class="spacer"></span>' + VS.pill(item.status || '') +
      (f.url ? '<a class="btn ghost sm" href="' + esc(f.url) + '" target="_blank">⬇ الملف الأصلي</a>' : '') +
      '<button class="btn mutedb sm" id="dv-close">✕ إغلاق</button></div>' +

      (canEdit ?
        '<div class="dv-tools">' +
        '<span class="small muted">الأداة:</span>' +
        [['pen', '✏️ قلم'], ['rect', '⬜ مستطيل'], ['arrow', '↗ سهم'], ['text', '🅰 نص'], ['pin', '📍 ملاحظة مرقمة']].map(function (t) {
          return '<button class="dv-tool' + (t[0] === 'pen' ? ' active' : '') + '" data-tool="' + t[0] + '">' + t[1] + '</button>';
        }).join('') +
        '<span class="small muted" style="margin-inline-start:10px">اللون:</span>' +
        COLORS.map(function (c, i) {
          return '<button class="dv-color' + (i === 0 ? ' active' : '') + '" data-color="' + c + '" style="background:' + c + '"></button>';
        }).join('') +
        '<span class="spacer"></span>' +
        '<button class="btn mutedb sm" id="dv-undo">↩ تراجع</button>' +
        '<button class="btn mutedb sm" id="dv-clearall">🗑 مسح الكل</button>' +
        '<button class="btn sm" id="dv-save">💾 حفظ الترميز</button>' +
        '</div>' : '') +

      '<div class="dv-stage-wrap"><div class="dv-stage" id="dv-stage">' +
      (f.isImage
        ? '<img id="dv-img" src="' + esc(f.url) + '" alt="" draggable="false">'
        : '<div class="dv-sheet" id="dv-sheet"><div class="dv-sheet-title">📐 ' + esc(item.title || 'المخطط') + '</div>' +
          '<div class="dv-sheet-sub">' + esc(item.ref || '') + (f.name ? ' · ' + esc(f.name) : '') + '</div>' +
          '<div class="dv-sheet-note">ورقة ترميز — الملف الأصلي بصيغة غير قابلة للمعاينة داخل المتصفح' + (f.url ? ' (حمّله من الزر أعلاه)' : '') + '</div></div>') +
      '<canvas id="dv-canvas"></canvas>' +
      '</div></div>' +

      '<div class="dv-side">' +
      '<div class="dv-pins" id="dv-pins"></div>' +
      (canReview ?
        '<div class="dv-review"><label class="fl">ملاحظات القرار (تصل للمقاول مع الترميز)</label>' +
        '<textarea class="inp" id="dv-notes" rows="2" placeholder="اكتب ملاحظاتك..."></textarea>' +
        '<div class="m-actions">' +
        '<button class="btn ok" id="dv-approve">✅ اعتماد</button>' +
        '<button class="btn" id="dv-approve-notes">📝 اعتماد مع ملاحظات</button>' +
        '<button class="btn danger" id="dv-reject">↩ إرجاع للمقاول لعمل اللازم</button>' +
        '</div></div>'
        : (item.notes || item.signature ?
          '<div class="dv-review"><b class="small">قرار الاستشاري:</b><div class="small" style="margin-top:6px">' + esc(item.notes || '—') + '</div>' +
          (item.signature ? '<div class="sig">✍️ ' + esc(item.signature) + ' · ' + esc(item.signDate || '') + '</div>' : '') + '</div>' : '')) +
      '</div></div>';

    document.body.appendChild(back);

    const stage = back.querySelector('#dv-stage');
    const canvas = back.querySelector('#dv-canvas');
    const cx2 = canvas.getContext('2d');
    const img = back.querySelector('#dv-img');

    function fit() {
      const base = img || back.querySelector('#dv-sheet');
      const w = base.clientWidth, h = base.clientHeight;
      if (!w || !h) return;
      canvas.width = w * devicePixelRatio; canvas.height = h * devicePixelRatio;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      cx2.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      redraw();
    }

    function W() { return canvas.clientWidth; }
    function H() { return canvas.clientHeight; }

    function drawArrow(a) {
      const x1 = a.from[0] * W(), y1 = a.from[1] * H(), x2 = a.to[0] * W(), y2 = a.to[1] * H();
      cx2.beginPath(); cx2.moveTo(x1, y1); cx2.lineTo(x2, y2); cx2.stroke();
      const ang = Math.atan2(y2 - y1, x2 - x1);
      cx2.beginPath();
      cx2.moveTo(x2, y2);
      cx2.lineTo(x2 - 14 * Math.cos(ang - 0.45), y2 - 14 * Math.sin(ang - 0.45));
      cx2.lineTo(x2 - 14 * Math.cos(ang + 0.45), y2 - 14 * Math.sin(ang + 0.45));
      cx2.closePath(); cx2.fillStyle = cx2.strokeStyle; cx2.fill();
    }

    function drawAnn(a) {
      cx2.strokeStyle = a.color; cx2.fillStyle = a.color; cx2.lineWidth = 2.5; cx2.lineJoin = 'round'; cx2.lineCap = 'round';
      if (a.type === 'pen') {
        cx2.beginPath();
        a.points.forEach(function (pt, i) { i ? cx2.lineTo(pt[0] * W(), pt[1] * H()) : cx2.moveTo(pt[0] * W(), pt[1] * H()); });
        cx2.stroke();
      } else if (a.type === 'rect') {
        cx2.strokeRect(a.from[0] * W(), a.from[1] * H(), (a.to[0] - a.from[0]) * W(), (a.to[1] - a.from[1]) * H());
      } else if (a.type === 'arrow') {
        drawArrow(a);
      } else if (a.type === 'text') {
        cx2.font = '700 15px Tahoma'; cx2.direction = 'rtl';
        cx2.fillText(a.text, a.at[0] * W(), a.at[1] * H());
      } else if (a.type === 'pin') {
        const x = a.at[0] * W(), y = a.at[1] * H();
        cx2.beginPath(); cx2.arc(x, y, 12, 0, 7); cx2.fill();
        cx2.fillStyle = '#10151f'; cx2.font = '800 12px Tahoma'; cx2.textAlign = 'center'; cx2.textBaseline = 'middle';
        cx2.fillText(String(a.n), x, y + 1);
        cx2.textAlign = 'start'; cx2.textBaseline = 'alphabetic';
      }
    }

    function redraw() {
      cx2.clearRect(0, 0, W(), H());
      anns.forEach(drawAnn);
      if (current) drawAnn(current);
      drawPinsList();
    }

    function drawPinsList() {
      const pins = anns.filter(function (a) { return a.type === 'pin'; });
      const texts = anns.filter(function (a) { return a.type === 'text'; });
      back.querySelector('#dv-pins').innerHTML =
        (pins.length || texts.length ?
          '<b class="small">📍 الملاحظات على المخطط:</b>' +
          pins.map(function (p) {
            return '<div class="dv-pin-row"><span class="dv-pin-n" style="background:' + p.color + '">' + p.n + '</span><span class="small">' + esc(p.text) + '</span></div>';
          }).join('') +
          texts.map(function (t) {
            return '<div class="dv-pin-row"><span class="dv-pin-n" style="background:' + t.color + '">🅰</span><span class="small">' + esc(t.text) + '</span></div>';
          }).join('')
          : '<div class="small muted">' + (canEdit ? 'ارسم على المخطط أو أضف ملاحظات مرقمة 📍 بالنقر على الموضع' : 'لا توجد ملاحظات مرسومة على هذا المخطط') + '</div>');
    }

    function pos(ev) {
      const r = canvas.getBoundingClientRect();
      return [(ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.height];
    }

    if (canEdit) {
      canvas.style.cursor = 'crosshair';
      canvas.addEventListener('pointerdown', function (ev) {
        const p = pos(ev);
        if (tool === 'text' || tool === 'pin') {
          const txt = prompt(tool === 'pin' ? 'نص الملاحظة المرقمة:' : 'النص الذي سيكتب على المخطط:');
          if (txt) {
            if (tool === 'pin') {
              const n = anns.filter(function (a) { return a.type === 'pin'; }).length + 1;
              anns.push({ type: 'pin', at: p, text: txt, color: color, n: n });
            } else {
              anns.push({ type: 'text', at: p, text: txt, color: color });
            }
            dirty = true; redraw();
          }
          return;
        }
        canvas.setPointerCapture(ev.pointerId);
        current = tool === 'pen'
          ? { type: 'pen', points: [p], color: color }
          : { type: tool, from: p, to: p, color: color };
      });
      canvas.addEventListener('pointermove', function (ev) {
        if (!current) return;
        const p = pos(ev);
        if (current.type === 'pen') current.points.push(p); else current.to = p;
        redraw();
      });
      canvas.addEventListener('pointerup', function () {
        if (!current) return;
        anns.push(current); current = null; dirty = true; redraw();
      });

      back.querySelectorAll('.dv-tool').forEach(function (b) {
        b.addEventListener('click', function () {
          tool = b.getAttribute('data-tool');
          back.querySelectorAll('.dv-tool').forEach(function (x) { x.classList.toggle('active', x === b); });
        });
      });
      back.querySelectorAll('.dv-color').forEach(function (b) {
        b.addEventListener('click', function () {
          color = b.getAttribute('data-color');
          back.querySelectorAll('.dv-color').forEach(function (x) { x.classList.toggle('active', x === b); });
        });
      });
      back.querySelector('#dv-undo').addEventListener('click', function () { anns.pop(); dirty = true; redraw(); });
      back.querySelector('#dv-clearall').addEventListener('click', function () {
        if (anns.length && confirm('مسح كل الترميز عن المخطط؟')) { anns = []; dirty = true; redraw(); }
      });
      back.querySelector('#dv-save').addEventListener('click', function () { saveAnns(true); });
    }

    async function saveAnns(showToast) {
      try {
        await Api.update(collection, item.id, {
          annotations: anns,
          markupBy: ctx.U.name,
          markupDate: new Date().toISOString().slice(0, 10)
        });
        item.annotations = anns; dirty = false;
        if (showToast) VS.toast('💾 حُفظ الترميز على المخطط');
      } catch (e) { VS.toast(e.message, true); }
    }

    async function decide(status) {
      try {
        if (dirty || anns.length !== (item.annotations || []).length) await saveAnns(false);
        await Api.review({
          collection: collection, id: item.id, status: status,
          notes: back.querySelector('#dv-notes').value ||
            (status === 'rejected' ? 'مرجع للمقاول لعمل اللازم — راجع الترميز على المخطط' : '')
        });
        back.remove();
        VS.toast(status === 'rejected' ? '↩ أُرجع المخطط للمقاول مع الترميز والملاحظات' : '✅ اعتُمد المخطط بتوقيعك');
        if (opts.onDone) opts.onDone(); else ctx.refresh();
      } catch (e) { VS.toast(e.message, true); }
    }

    if (canReview) {
      back.querySelector('#dv-approve').addEventListener('click', function () { decide('approved'); });
      back.querySelector('#dv-approve-notes').addEventListener('click', function () { decide('approved_notes'); });
      back.querySelector('#dv-reject').addEventListener('click', function () { decide('rejected'); });
    }

    back.querySelector('#dv-close').addEventListener('click', function () {
      if (dirty && canEdit && confirm('لديك ترميز غير محفوظ — حفظه قبل الإغلاق؟')) { saveAnns(true).then(function () { back.remove(); }); return; }
      back.remove();
    });
    back.addEventListener('click', function (e) { if (e.target === back && !dirty) back.remove(); });

    if (img) { img.addEventListener('load', fit); if (img.complete) fit(); }
    else setTimeout(fit, 30);
    window.addEventListener('resize', fit);
  }

  /** زر فتح العارض لعنصر فيه ملف أو ترميز */
  function viewerBtn(item, extra) {
    if (!item.file && !(item.annotations || []).length) return '';
    const n = (item.annotations || []).length;
    return '<button class="btn ghost sm" data-dview="' + item.id + '"' + (extra || '') + '>🖊 المخطط' +
      (n ? ' <span class="pill p-warn" style="font-size:10px;padding:1px 7px">' + n + '</span>' : '') + '</button>';
  }

  window.DrawingViewer = { open: openDrawingViewer, btn: viewerBtn };
})();
