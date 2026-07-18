/** بصير | التطبيق الرئيسي: الدخول، التوجيه، الهيكل */
(function () {
  'use strict';

  const VS = window.ViewsShared, VR = window.ViewsRoles;
  const esc = VS.esc;

  const PAGES = [
    { id: 'dashboard', title: 'لوحة القيادة', icon: '📊', sec: 'المتابعة', roles: ['admin', 'owner', 'owner_rep', 'consultant'], render: VS.renderDashboard },
    { id: 'vision', title: 'رؤية المشروع', icon: '👁', sec: 'المتابعة', roles: ['admin', 'owner', 'owner_rep', 'consultant'], render: VS.renderVision },
    { id: 'contractors', title: 'المقاولون والأداء', icon: '👷', sec: 'المتابعة', roles: ['admin', 'owner', 'owner_rep', 'consultant'], render: VS.renderContractors },
    { id: 'ai', title: 'ذكاء بصير الاصطناعي', icon: '🤖', sec: 'المتابعة', roles: ['admin', 'owner', 'owner_rep', 'consultant'], render: VS.renderAi },
    { id: 'reports', title: 'التقارير والإرسال', icon: '📨', sec: 'المتابعة', roles: ['admin', 'owner', 'owner_rep', 'consultant'], render: VS.renderReports },

    { id: 'home', title: 'لوحة المقاول', icon: '🏗️', sec: 'أعمالي', roles: ['contractor'], render: VR.renderContractorHome },

    { id: 'approvals', title: 'الاعتمادات', icon: '✍️', sec: 'المكتب الفني', roles: ['admin', 'consultant'], render: VR.renderApprovals, badge: badgePending },
    { id: 'tech-office', title: 'خدمات المكتب الفني', icon: '🏛️', sec: 'المكتب الفني', roles: ['admin', 'consultant'], render: VR.renderTechOffice, badge: badgeTech },
    { id: 'boq', title: 'جداول الكميات', icon: '📊', sec: 'المكتب الفني', roles: ['admin', 'consultant'], render: VR.renderBoq },
    { id: 'manage-contractors', title: 'إدارة المقاولين', icon: '🧰', sec: 'المكتب الفني', roles: ['admin', 'consultant'], render: VR.renderManageContractors },
    { id: 'daily', title: 'التقارير اليومية', icon: '📝', sec: 'المكتب الفني', roles: ['admin', 'consultant'], render: VR.renderDailyReport },
    { id: 'bim-upload', title: 'رفع نموذج BIM', icon: '🏢', sec: 'المكتب الفني', roles: ['admin', 'consultant'], render: VR.renderBimUpload },

    { id: 'rep-projects', title: 'المشاريع والاستشاريون', icon: '🗂️', sec: 'الإدارة', roles: ['admin', 'owner_rep'], render: VR.renderRepProjects },
    { id: 'users', title: 'المستخدمون', icon: '👥', sec: 'الإدارة', roles: ['admin', 'owner_rep'], render: VR.renderUsers }
  ];

  const ROLE_NAMES = {
    admin: 'مدير النظام', owner: 'المالك', owner_rep: 'ممثل المالك',
    consultant: 'استشاري المشروع', contractor: 'مقاول'
  };

  function badgePending(S) {
    return ['shopDrawings', 'materials', 'scheduleSubmittals', 'wirs', 'changeOrders', 'payments']
      .reduce(function (a, c) { return a + (S[c] || []).filter(function (x) { return x.status === 'pending'; }).length; }, 0);
  }

  function badgeTech(S) {
    const pending = ['methodStatements', 'claims', 'valueEngineering', 'handoverDocs']
      .reduce(function (a, c) { return a + (S[c] || []).filter(function (x) { return x.status === 'pending'; }).length; }, 0);
    const open = ['rfis', 'ncrs', 'snags', 'hseReports']
      .reduce(function (a, c) { return a + (S[c] || []).filter(function (x) { return x.status === 'open'; }).length; }, 0);
    return pending + open;
  }

  const app = document.getElementById('app');
  let ctx = null;

  // ============ شاشة الدخول ============
  function renderLogin(msg) {
    app.innerHTML =
      '<div class="login-wrap"><div class="login-card">' +
      '<div class="login-logo">👁</div>' +
      '<div class="login-title">بصير <small>BASSIR · OWNER EYES</small></div>' +
      '<div class="login-sub">عينك على مشروعك — منصة الرؤية البصرية التي تربط المالك بالاستشاري والمقاول<br>وترى بها تقدم مشروعك كما لو كنت في الموقع</div>' +
      (msg ? '<div class="pill p-danger" style="display:block;text-align:center;margin-bottom:12px;padding:10px">' + esc(msg) + '</div>' : '') +
      '<label class="fl">اسم المستخدم</label><input class="inp num" id="lg-user" autocomplete="username">' +
      '<label class="fl">كلمة المرور</label><input class="inp num" id="lg-pass" type="password" autocomplete="current-password">' +
      '<div class="m-actions"><button class="btn block" id="lg-go">دخول</button></div>' +
      '<div class="demo-accounts"><h4>حسابات تجريبية — اضغط للتعبئة:</h4>' +
      [['owner', 'owner123', '👁 المالك'], ['rep', 'rep123', '🧑‍💼 ممثل المالك'], ['consultant', 'consult123', '📐 الاستشاري'],
       ['cont-arch', 'cont123', '👷 مقاول معماري'], ['cont-str', 'cont123', '🏗️ مقاول إنشائي'], ['admin', 'admin123', '⚙️ الأدمن']]
        .map(function (a) { return '<span class="demo-chip" data-u="' + a[0] + '" data-p="' + a[1] + '">' + a[2] + '</span>'; }).join('') +
      '</div></div></div>';

    app.querySelectorAll('.demo-chip').forEach(function (c) {
      c.addEventListener('click', function () {
        document.getElementById('lg-user').value = c.getAttribute('data-u');
        document.getElementById('lg-pass').value = c.getAttribute('data-p');
        doLogin();
      });
    });
    document.getElementById('lg-go').addEventListener('click', doLogin);
    document.getElementById('lg-pass').addEventListener('keydown', function (e) { if (e.key === 'Enter') doLogin(); });
  }

  async function doLogin() {
    const u = document.getElementById('lg-user').value.trim();
    const p = document.getElementById('lg-pass').value;
    try {
      await Api.login(u, p);
      await boot();
    } catch (e) { renderLogin(e.message); }
  }

  // ============ الهيكل الرئيسي ============
  async function boot() {
    const user = Api.currentUser();
    if (!user) { renderLogin(); return; }
    let S;
    try { S = await Api.state(); }
    catch (e) { await Api.logout(); renderLogin(e.status === 401 ? null : e.message); return; }

    const myPages = PAGES.filter(function (p) { return p.roles.indexOf(user.role) !== -1; });
    let current = location.hash.replace('#', '') || myPages[0].id;
    if (!myPages.some(function (p) { return p.id === current; })) current = myPages[0].id;

    ctx = {
      U: user, S: S,
      nav: function (id) { current = id; location.hash = id; draw(); },
      refresh: async function () { ctx.S = await Api.state(); S = ctx.S; draw(); },
      refreshSilent: async function () { ctx.S = await Api.state(); S = ctx.S; drawSidebar(); }
    };

    function sidebarHtml() {
      let html = '<div class="brand"><span class="eye">👁</span><div><b>بصير</b><small>OWNER EYES</small></div></div>';
      let lastSec = '';
      myPages.forEach(function (p) {
        if (p.sec !== lastSec) { html += '<div class="nav-sec">' + esc(p.sec) + '</div>'; lastSec = p.sec; }
        const badge = p.badge ? p.badge(S) : 0;
        html += '<div class="nav-item ' + (current === p.id ? 'active' : '') + '" data-page="' + p.id + '">' +
          '<span class="ico">' + p.icon + '</span>' + esc(p.title) +
          (badge ? '<span class="badge">' + badge + '</span>' : '') + '</div>';
      });
      html += '<div class="side-user"><div class="who">' + esc(user.name) + '</div>' +
        '<div class="role">' + esc(ROLE_NAMES[user.role] || user.role) + (Api.demo ? ' · وضع الديمو' : '') + '</div>' +
        '<button class="btn mutedb sm block" id="btn-logout">تسجيل الخروج</button>' +
        (Api.demo ? '<button class="btn ghost sm block" id="btn-reset" style="margin-top:8px">↺ إعادة ضبط بيانات الديمو</button>' : '') +
        '</div>';
      return html;
    }

    function drawSidebar() {
      const sb = app.querySelector('.sidebar');
      if (!sb) return;
      sb.innerHTML = sidebarHtml();
      wireSidebar(sb);
    }

    function wireSidebar(sb) {
      sb.querySelectorAll('[data-page]').forEach(function (n) {
        n.addEventListener('click', function () { ctx.nav(n.getAttribute('data-page')); });
      });
      sb.querySelector('#btn-logout').addEventListener('click', async function () {
        await Api.logout(); location.hash = ''; renderLogin();
      });
      const rs = sb.querySelector('#btn-reset');
      if (rs) rs.addEventListener('click', function () {
        Api.resetDemo(); location.reload();
      });
    }

    function draw() {
      const page = myPages.find(function (p) { return p.id === current; }) || myPages[0];
      app.innerHTML =
        '<div class="app"><aside class="sidebar">' + sidebarHtml() + '</aside>' +
        '<div class="main"><div class="topbar"><h1>' + page.icon + ' ' + esc(page.title) + '</h1>' +
        '<span class="proj">🏗️ ' + esc(S.projects[0] ? S.projects[0].name : '') + ' · ' + esc(S.projects[0] ? S.projects[0].location : '') + '</span>' +
        '<span class="spacer"></span>' +
        '<span class="small muted num">' + new Date().toLocaleDateString('ar-SA-u-ca-gregory', { year: 'numeric', month: 'long', day: 'numeric' }) + '</span>' +
        '</div><div class="content" id="page"></div></div></div>';
      wireSidebar(app.querySelector('.sidebar'));
      page.render(document.getElementById('page'), ctx);
    }

    draw();
  }

  window.addEventListener('hashchange', function () {
    if (!ctx) return;
    const id = location.hash.replace('#', '');
    if (id) ctx.nav(id);
  });

  boot();
})();
