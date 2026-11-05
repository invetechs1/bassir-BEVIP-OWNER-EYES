/*
 * اختبار السلسلة الأساسية: ربط المخطط بجدول الكميات (مظلم ← ساطع)، عبر خط أنابيب اعتماد
 * الكميات الثلاثي الكامل: المقاول يسجّل تنفيذاً فعلياً لأدنى دور معماري (المرحلة ١) →
 * الاستشاري يعتمده بدليل موثَّق (المرحلة ٢) → المقاول يطالب بمستخلص ضمن السقف المعتمَد
 * (المرحلة ٣) → الاستشاري يعتمد المستخلص → تتحدّث نسب البنود → تُضيء مناطق خريطة الإنجاز
 * التي يراها المالك. يقيس سطوع مناطق المخطط قبل/بعد كإثبات موضوعي.
 */
const H = require('./_harness');

(async () => {
  const browser = await H.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('C:' + m.text()); });
  page.on('dialog', d => d.accept());
  await H.serve(page);

  async function readMap(floorId) {
    await H.nav(page, 'progress-map');
    const dc = page.locator('[data-disc="architectural"]'); if (await dc.count()) await dc.first().click(); await page.waitForTimeout(150);
    const fl = page.locator('[data-floor="' + floorId + '"]'); if (await fl.count()) await fl.first().click(); await page.waitForTimeout(250);
    return page.evaluate(() => {
      const rects = [...document.querySelectorAll('.zone-shape rect')];
      const bright = rects.map(r => { const m = (r.getAttribute('fill') || '').match(/rgb\((\d+),(\d+),(\d+)\)/); return m ? (+m[1] + +m[2] + +m[3]) : 0; });
      return { brightSum: bright.reduce((a, c) => a + c, 0), floorPct: (document.querySelector('.floor-tabs .tab.active .num') || {}).textContent || '?' };
    });
  }
  const R = {};
  await H.login(page, 'owner_rep');
  const target = await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('bassir-demo-db')); const by = {}; d.boqItems.filter(x => x.discipline === 'architectural').forEach(x => { (by[x.floor] = by[x.floor] || []).push(x.progress); }); let best = null; Object.keys(by).forEach(f => { const a = by[f].reduce((s, c) => s + c, 0) / by[f].length; if (best === null || a < best.avg) best = { floor: f, avg: Math.round(a) }; }); return best; });
  const before = await readMap(target.floor);
  await page.screenshot({ path: H.OUT + '/map-before.png' });

  // اختر حتى 6 بنود معمارية من الدور المستهدف لرفعها إلى 100%
  const targetItems = await page.evaluate((floor) => {
    const d = JSON.parse(localStorage.getItem('bassir-demo-db'));
    return d.boqItems.filter(x => x.discipline === 'architectural' && x.floor === floor).slice(0, 6)
      .map(x => ({ id: x.id, qty: x.qty, description: x.description }));
  }, target.floor);

  // ===== المرحلة ١: المقاول يسجّل تنفيذ كامل الكمية فعلياً على كل بند مستهدَف =====
  await H.login(page, 'contractor');
  for (const item of targetItems) {
    await H.nav(page, 'boq-c');
    const btn = page.locator('[data-report-exec="' + item.id + '"]');
    if (!(await btn.count())) continue;
    await btn.first().click();
    await page.waitForSelector('#rx-qty', { timeout: 4000 });
    await page.fill('#rx-qty', String(item.qty));
    await page.click('#rx-ok');
    await page.waitForTimeout(300);
  }

  // ===== المرحلة ٢: الاستشاري يعتمد كل تنفيذ بدليل موثَّق (مرفق إلزامي) =====
  await H.login(page, 'consultant');
  let stage2Count = 0;
  for (const item of targetItems) {
    await H.nav(page, 'boq');
    const btn = page.locator('[data-approve-exec="' + item.id + '"]');
    if (!(await btn.count())) continue;
    await btn.first().click();
    await page.waitForSelector('#av-ok', { timeout: 4000 });
    await page.setInputFiles('#av-file', H.file('receipt-' + item.id + '.pdf'));
    await page.click('#av-ok');
    await page.waitForTimeout(400);
    stage2Count++;
  }
  R.stage1Items = targetItems.length; R.stage2Approved = stage2Count;

  // ===== المرحلة ٣: المقاول يطالب بمستخلص — الآن ضمن السقف المعتمَد فعلياً (100%) =====
  await H.login(page, 'contractor');
  await H.nav(page, 'home');
  const ptab = page.locator('[data-ctab="payments"]'); if (await ptab.count()) await ptab.first().click(); await page.waitForTimeout(200);
  await page.click('#ct-new'); await page.waitForSelector('#sb-title', { timeout: 4000 });
  await page.fill('#sb-title', 'مستخلص إنجاز معماري 100% — ' + target.floor);
  if (await page.locator('#sb-amount').count()) await page.fill('#sb-amount', '950000');
  // القائمة الكاملة الجديدة لاختيار بنود المستخلص: اضغط "+ إضافة" على كل بند مستهدَف، ثم أدخل 100% في حقله
  for (const item of targetItems) {
    const addBtn = page.locator('[data-boq-add="' + item.id + '"]');
    if (await addBtn.count()) await addBtn.first().click();
    const pctInp = page.locator('[data-boq-pct="' + item.id + '"]');
    if (await pctInp.count()) await pctInp.fill('100');
  }
  if (await page.locator('#sb-file').count()) await page.setInputFiles('#sb-file', H.file('IPC-' + target.floor + '.pdf'));
  await page.click('#sb-ok'); await page.waitForTimeout(500);
  const payId = await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('bassir-demo-db')); return d.payments[d.payments.length - 1].id; });

  // الاستشاري يعتمد هذا المستخلص تحديداً
  await H.login(page, 'consultant');
  await H.nav(page, 'submittals');
  await page.locator('.tabbar .tab', { hasText: 'بانتظار قراري' }).first().click(); await page.waitForTimeout(300);
  const payTab = page.locator('[data-atab="payments"]'); if (await payTab.count()) { await payTab.first().click(); await page.waitForTimeout(250); }
  let approved = false;
  const btn = page.locator('[data-review="' + payId + '"]');
  if (await btn.count()) { await btn.first().click(); await page.waitForSelector('#rv-ok', { timeout: 4000 }).catch(() => {}); if (await page.locator('#rv-ok').count()) { await page.selectOption('#rv-status', 'approved').catch(() => {}); await page.click('#rv-ok'); await page.waitForTimeout(700); approved = true; } }

  // owner_rep re-reads the map
  await H.login(page, 'owner_rep');
  const after = await readMap(target.floor);
  await page.screenshot({ path: H.OUT + '/map-after.png' });

  R.targetFloor = target.floor; R.before = before; R.after = after; R.approved = approved; R.jsErrors = errors.length;
  R.brightnessIncreased = after.brightSum > before.brightSum;
  console.log(JSON.stringify(R, null, 2));
  await browser.close();
  const ok = approved && R.brightnessIncreased && R.stage2Approved === R.stage1Items && errors.length === 0;
  console.log(ok ? 'RESULT: PASS (dark→bright works through the full three-stage pipeline)' : 'RESULT: FAIL');
  process.exit(ok ? 0 : 1);
})().catch(e => { console.error('HARNESS FAIL', e); process.exit(1); });
