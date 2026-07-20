/** بصير | رسوم بيانية SVG خفيفة (بدون مكتبات خارجية) */
(function () {
  'use strict';

  const t = window.I18n.t;
  I18n.registerDict({ 'المخطط': 'Planned', 'الفعلي': 'Actual', 'مخطط': 'planned' });

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /** منحنى S: مخطط مقابل فعلي */
  function sCurve(points, opts) {
    opts = opts || {};
    const W = 640, H = 280, PL = 46, PR = 16, PT = 18, PB = 40;
    const iw = W - PL - PR, ih = H - PT - PB;
    const maxY = opts.maxY || 100;
    const n = points.length;
    const x = function (i) { return PL + (iw * i) / (n - 1); };
    const y = function (v) { return PT + ih - (ih * v) / maxY; };

    function pathFor(key) {
      let d = '', started = false;
      points.forEach(function (p, i) {
        if (p[key] == null) return;
        d += (started ? ' L ' : 'M ') + x(i).toFixed(1) + ' ' + y(p[key]).toFixed(1);
        started = true;
      });
      return d;
    }

    let grid = '';
    for (let g = 0; g <= 4; g++) {
      const gy = PT + (ih * g) / 4;
      grid += '<line x1="' + PL + '" y1="' + gy + '" x2="' + (W - PR) + '" y2="' + gy + '" stroke="#1c2536" stroke-width="1"/>' +
        '<text x="' + (PL - 8) + '" y="' + (gy + 4) + '" fill="#67718a" font-size="10" text-anchor="end">' + Math.round(maxY - (maxY * g) / 4) + (opts.unit || '%') + '</text>';
    }
    let labels = '';
    points.forEach(function (p, i) {
      if (i % Math.ceil(n / 8) !== 0 && i !== n - 1) return;
      labels += '<text x="' + x(i) + '" y="' + (H - 12) + '" fill="#67718a" font-size="9.5" text-anchor="middle">' + esc(p.month || p.label) + '</text>';
    });

    let dots = '';
    points.forEach(function (p, i) {
      if (p.actual != null) dots += '<circle cx="' + x(i) + '" cy="' + y(p.actual) + '" r="3.4" fill="#e0a458"/>';
    });

    // منطقة تظليل تحت المنحنى الفعلي
    let lastActual = -1;
    points.forEach(function (p, i) { if (p.actual != null) lastActual = i; });
    let area = '';
    if (lastActual > 0) {
      area = pathFor('actual') + ' L ' + x(lastActual) + ' ' + y(0) + ' L ' + x(0) + ' ' + y(0) + ' Z';
    }

    return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img">' +
      grid + labels +
      (area ? '<path d="' + area + '" fill="rgba(224,164,88,.09)"/>' : '') +
      '<path d="' + pathFor('planned') + '" fill="none" stroke="#4cc9f0" stroke-width="2.2" stroke-dasharray="7 5"/>' +
      '<path d="' + pathFor('actual') + '" fill="none" stroke="#e0a458" stroke-width="3"/>' +
      dots +
      '<g font-size="11">' +
      '<rect x="' + (PL + 4) + '" y="' + (PT + 2) + '" width="12" height="4" rx="2" fill="#4cc9f0"/><text x="' + (PL + 22) + '" y="' + (PT + 8) + '" fill="#aab3c5">' + esc(opts.plannedLabel || t('المخطط')) + '</text>' +
      '<rect x="' + (PL + 84) + '" y="' + (PT + 2) + '" width="12" height="4" rx="2" fill="#e0a458"/><text x="' + (PL + 102) + '" y="' + (PT + 8) + '" fill="#aab3c5">' + esc(opts.actualLabel || t('الفعلي')) + '</text>' +
      '</g></svg>';
  }

  /** حلقة نسبة إنجاز */
  function donut(value, opts) {
    opts = opts || {};
    const R = 52, C = 2 * Math.PI * R;
    const v = Math.max(0, Math.min(100, value || 0));
    const color = opts.color || (v >= 70 ? '#2dd4a0' : v >= 40 ? '#e0a458' : '#ef5d75');
    return '<svg viewBox="0 0 140 140" style="max-width:' + (opts.size || 140) + 'px">' +
      '<circle cx="70" cy="70" r="' + R + '" fill="none" stroke="#1a2234" stroke-width="14"/>' +
      '<circle cx="70" cy="70" r="' + R + '" fill="none" stroke="' + color + '" stroke-width="14" stroke-linecap="round" ' +
      'stroke-dasharray="' + (C * v / 100).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 70 70)"/>' +
      '<text x="70" y="66" text-anchor="middle" fill="#e9ecf3" font-size="24" font-weight="800">' + v + '%</text>' +
      '<text x="70" y="88" text-anchor="middle" fill="#8b95a8" font-size="10.5">' + esc(opts.label || '') + '</text></svg>';
  }

  /** أعمدة أفقية مقارنة (مخطط/فعلي لكل عنصر) */
  function compareBars(rows) {
    let html = '<div>';
    rows.forEach(function (r) {
      const a = Math.max(0, Math.min(100, r.actual));
      const p = Math.max(0, Math.min(100, r.planned));
      const behind = a < p - 3;
      html += '<div style="margin-bottom:14px">' +
        '<div class="flex" style="justify-content:space-between;font-size:12.5px;margin-bottom:5px">' +
        '<span>' + esc(r.label) + '</span>' +
        '<span class="num ' + (behind ? '' : '') + '" style="color:' + (behind ? '#ef5d75' : '#2dd4a0') + '">' + a + '% <span class="muted">/ ' + p + '% ' + t('مخطط') + '</span></span></div>' +
        '<div style="position:relative;height:10px;background:#1a2234;border-radius:99px">' +
        '<i style="position:absolute;inset-inline-start:0;top:0;bottom:0;width:' + a + '%;border-radius:99px;background:linear-gradient(90deg,' + (behind ? '#d4405c,#ef5d75' : '#1fae85,#2dd4a0') + ')"></i>' +
        '<i style="position:absolute;inset-inline-start:' + p + '%;top:-3px;bottom:-3px;width:2.5px;background:#4cc9f0;border-radius:2px" title="' + t('المخطط') + '"></i>' +
        '</div></div>';
    });
    return html + '</div>';
  }

  window.Charts = { sCurve: sCurve, donut: donut, compareBars: compareBars, esc: esc };
})();
