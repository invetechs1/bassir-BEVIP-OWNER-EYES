/* بصير | تنقّل عرض المبيعات: الأسهم/النقر/النقاط، ووضع الطباعة (?print) لتصدير PDF. */
(function () {
  'use strict';
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var total = slides.length;
  var i = 0;
  var dotsWrap = document.getElementById('dots');
  var pageno = document.getElementById('pageno');

  // وضع الطباعة: أظهر كل الشرائح فوق بعضها (لتصدير PDF — شريحة لكل صفحة)
  if (/[?&]print\b/.test(location.search)) {
    document.body.classList.add('print');
    return;
  }

  var dots = slides.map(function (_, idx) {
    var d = document.createElement('i');
    d.addEventListener('click', function () { go(idx); });
    dotsWrap.appendChild(d);
    return d;
  });

  function go(n) {
    i = Math.max(0, Math.min(total - 1, n));
    slides.forEach(function (s, idx) { s.classList.toggle('on', idx === i); });
    dots.forEach(function (d, idx) { d.classList.toggle('on', idx === i); });
    pageno.textContent = (i + 1) + ' / ' + total;
  }
  function next() { go(i + 1); }
  function prev() { go(i - 1); }

  document.getElementById('next').addEventListener('click', next);
  document.getElementById('prev').addEventListener('click', prev);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowRight' || e.key === 'PageUp') { e.preventDefault(); prev(); }
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(total - 1);
    else if (e.key === 'f' || e.key === 'F') { if (!document.fullscreenElement) document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); else document.exitFullscreen && document.exitFullscreen(); }
  });
  // النقر على الشريحة نفسها يتقدّم (عدا الأزرار والنقاط)
  document.getElementById('deck').addEventListener('click', function (e) {
    if (e.target.closest('.nav') || e.target.closest('.dots')) return;
    next();
  });
  // سحب باللمس
  var sx = null;
  document.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (sx == null) return;
    var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) < 40) return;
    if (dx > 0) prev(); else next(); // RTL: سحب لليمين = السابق
  }, { passive: true });

  go(0);
})();
