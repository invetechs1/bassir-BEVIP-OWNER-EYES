/**
 * بصير - عيون المالك | النواة المشتركة لمنطق النظام
 * تعمل نفس هذه الوحدة في الخادم (Node.js) وفي الديمو التفاعلي (المتصفح)،
 * فيضمن ذلك تطابق سلوك الصلاحيات والاعتمادات في النسختين.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.BassirCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const APPROVAL_COLLECTIONS = [
    'shopDrawings', 'materials', 'scheduleSubmittals', 'wirs', 'changeOrders', 'payments',
    // موديول المكتب الفني - دورات الاعتماد
    'methodStatements', 'claims', 'valueEngineering', 'handoverDocs'
  ];
  // مجموعات المكتب الفني المرتبطة بمقاول محدد (يرى المقاول ما يخصه فقط)
  const TECH_FILTERED = ['rfis', 'ncrs', 'siteInstructions', 'snags', 'hseReports', 'materialTests'];
  // مجموعات مكتب فني عامة لا تُعرض للمقاول
  const TECH_INTERNAL = ['meetings', 'correspondence'];
  // الردود/المناقشة على أي طلب — تخص المقاول صاحب الطلب فقط (تُرشَّح مثل بقية مجموعاته)
  const CONTRACTOR_OWNED = APPROVAL_COLLECTIONS.concat(TECH_FILTERED, ['comments']);

  // بادئة الترقيم التلقائي لكل مجموعة تحمل رقم مرجع — يُولَّد دائماً من الخادم
  // لضمان عدم التكرار، ولا يُعتمد على أي قيمة يرسلها العميل لهذا الحقل مطلقاً.
  const REF_PREFIX = {
    shopDrawings: 'SD', materials: 'MT', scheduleSubmittals: 'SCH', wirs: 'WIR',
    changeOrders: 'CO', payments: 'PAY', methodStatements: 'MS', claims: 'CLM',
    valueEngineering: 'VE', handoverDocs: 'HND', planDrawings: 'DWG',
    rfis: 'RFI', ncrs: 'NCR', siteInstructions: 'SI', snags: 'SNG',
    hseReports: 'HSE', materialTests: 'MTT', meetings: 'MOM', correspondence: 'COR'
  };

  // الحالة الابتدائية الافتراضية لكل مجموعة
  const DEFAULT_STATUS = {
    rfis: 'open', ncrs: 'open', siteInstructions: 'issued',
    snags: 'open', hseReports: 'open'
  };

  // أسماء المجموعات بالعربية (لسجل النظام والواجهة)
  const COLLECTION_LABELS = {
    shopDrawings: 'مخطط تنفيذي', materials: 'اعتماد مواد', scheduleSubmittals: 'جدول زمني',
    wirs: 'طلب استلام', changeOrders: 'أمر تغيير', payments: 'مستخلص',
    methodStatements: 'أسلوب تنفيذ/ITP', claims: 'مطالبة/EOT', valueEngineering: 'هندسة قيمية',
    handoverDocs: 'مستند تسليم', rfis: 'استفسار RFI', ncrs: 'عدم مطابقة NCR',
    siteInstructions: 'تعليمات موقعية', snags: 'ملاحظة تسليم', hseReports: 'تقرير سلامة',
    materialTests: 'اختبار مواد', meetings: 'محضر اجتماع', correspondence: 'خطاب',
    dailyReports: 'تقرير يومي', weeklyReports: 'تقرير أسبوعي', monthlyReports: 'تقرير شهري',
    boqItems: 'بند كميات', planDrawings: 'مخطط مشروع', cameras: 'كاميرا',
    users: 'مستخدم', contractors: 'مقاول', projects: 'مشروع', photos: 'صورة', comments: 'رد'
  };

  function labelOf(collection, item) {
    return (COLLECTION_LABELS[collection] || collection) + ': ' +
      (item && (item.title || item.name || item.description || item.ref || item.username || item.id) || '');
  }

  // رموز أنواع المستندات في نظام التكويد: BSR-المشروع-النوع-السنة-التسلسل
  const DOC_TYPE_CODES = {
    shopDrawings: 'SD', materials: 'MAT', scheduleSubmittals: 'SCH', wirs: 'WIR',
    changeOrders: 'CO', payments: 'IPC', methodStatements: 'MS', claims: 'CLM',
    valueEngineering: 'VE', handoverDocs: 'HOD', rfis: 'RFI', ncrs: 'NCR',
    siteInstructions: 'SI', snags: 'SNG', hseReports: 'HSE', materialTests: 'TST',
    meetings: 'MOM', correspondence: 'COR', dailyReports: 'DDR', weeklyReports: 'WKR',
    monthlyReports: 'MOR', planDrawings: 'DRW', photos: 'PHT', files: 'FIL'
  };

  // من يستطيع إنشاء عناصر في كل مجموعة
  const CREATE_RULES = {
    shopDrawings: ['contractor', 'consultant', 'admin'],
    materials: ['contractor', 'consultant', 'admin'],
    scheduleSubmittals: ['contractor', 'consultant', 'admin'],
    wirs: ['contractor', 'consultant', 'admin'],
    changeOrders: ['contractor', 'consultant', 'admin'],
    payments: ['contractor', 'consultant', 'admin'],
    dailyReports: ['consultant', 'admin'],
    monthlyReports: ['consultant', 'admin'],
    boqItems: ['consultant', 'admin'],
    aiInsights: ['admin'],
    photos: ['consultant', 'contractor', 'admin'],
    users: ['admin', 'owner_rep'],
    contractors: ['consultant', 'admin'],
    projects: ['owner_rep', 'admin'],
    // موديول المكتب الفني
    rfis: ['contractor', 'consultant', 'admin'],
    methodStatements: ['contractor', 'consultant', 'admin'],
    claims: ['contractor', 'consultant', 'admin'],
    valueEngineering: ['contractor', 'consultant', 'admin'],
    handoverDocs: ['contractor', 'consultant', 'admin'],
    weeklyReports: ['consultant', 'admin'],
    cameras: ['consultant', 'admin'],
    planDrawings: ['consultant', 'admin'],
    ncrs: ['consultant', 'admin'],
    siteInstructions: ['consultant', 'admin'],
    snags: ['consultant', 'admin'],
    hseReports: ['consultant', 'admin'],
    materialTests: ['consultant', 'admin'],
    meetings: ['consultant', 'admin'],
    correspondence: ['consultant', 'admin'],
    comments: ['contractor', 'consultant', 'admin']
  };

  function createCore(db, persist, opts) {
    persist = persist || function () {};
    opts = opts || {};
    // طبقة كلمات المرور: الخادم يمرر تشفير scrypt، ووضع الديمو بالمتصفح يقارن نصاً
    const pwd = opts.password || {
      hash: null,
      verify: function (plain, u) { return u.password === plain; }
    };

    function nextId(prefix) {
      db.meta.seq = (db.meta.seq || 1000) + 1;
      return prefix + db.meta.seq;
    }

    /** رقم مرجع فريد يولّده الخادم دائماً (SD-0001, RFI-0002...) — لا يُعتمد أبداً على مُدخل العميل */
    function nextRef(collection) {
      const prefix = REF_PREFIX[collection];
      if (!prefix) return null;
      db.meta.refSeq = db.meta.refSeq || {};
      db.meta.refSeq[collection] = (db.meta.refSeq[collection] || 0) + 1;
      return prefix + '-' + String(db.meta.refSeq[collection]).padStart(4, '0');
    }

    function err(message, code) {
      const e = new Error(message);
      e.status = code || 400;
      return e;
    }

    /**
     * تكويد المستندات: كود فريد متسلسل لكل مستند/اعتماد/ملف
     * الصيغة: BSR-<المشروع>-<النوع>-<السنة>-<تسلسل 4 خانات>
     */
    function docCode(collection, projectId, year) {
      const t = DOC_TYPE_CODES[collection];
      if (!t) return null;
      const y = year || String(new Date().getFullYear());
      const key = (projectId || 'P1') + '-' + t + '-' + y;
      if (!db.meta.docSeq) db.meta.docSeq = {};
      db.meta.docSeq[key] = (db.meta.docSeq[key] || 0) + 1;
      return 'BSR-' + key + '-' + String(db.meta.docSeq[key]).padStart(4, '0');
    }

    /** سجل النظام: توثيق كل عملية (من، متى، ماذا) — يحتفظ بآخر 800 حدث */
    function audit(user, action, target) {
      if (!db.auditLog) db.auditLog = [];
      db.auditLog.unshift({
        id: nextId('AL'), time: nowStr(),
        userName: user ? user.name : 'النظام', role: user ? user.role : 'system',
        action: action, target: target
      });
      if (db.auditLog.length > 800) db.auditLog.length = 800;
    }

    function login(username, password) {
      const u = db.users.find(function (x) { return x.username === username; });
      if (!u || !password || !pwd.verify(password, u)) throw err('اسم المستخدم أو كلمة المرور غير صحيحة', 401);
      const sessionUser = {
        id: u.id, username: u.username, name: u.name, role: u.role,
        contractorId: u.contractorId || null,
        projectIds: u.projectIds && u.projectIds.length ? u.projectIds : null
      };
      audit(sessionUser, 'login', 'دخول إلى النظام');
      persist();
      return sessionUser;
    }

    function stripPassword(u) {
      const c = Object.assign({}, u);
      delete c.password;
      delete c.passwordHash;
      delete c.salt;
      return c;
    }

    /** يخزن حساباً بكلمة مرور مشفرة ويعيد نسخة عرض تحمل كلمة المرور مرة واحدة فقط */
    function storeAccount(fields, plainPw) {
      const stored = Object.assign({}, fields);
      if (pwd.hash) Object.assign(stored, pwd.hash(plainPw));
      else stored.password = plainPw;
      db.users.push(stored);
      return Object.assign(stripPassword(stored), { password: plainPw });
    }

    /** لقطة الحالة الكاملة مُرشّحة حسب دور المستخدم */
    function getState(user) {
      const s = {};
      const role = user.role;
      s.projects = db.projects;
      s.scheduleCurve = db.scheduleCurve;
      s.scheduleTasks = db.scheduleTasks;
      s.costCurve = db.costCurve;
      s.aiInsights = db.aiInsights;
      s.photos = db.photos;
      s.dailyReports = db.dailyReports;
      s.weeklyReports = db.weeklyReports || [];
      s.monthlyReports = db.monthlyReports;
      s.cameras = db.cameras || [];
      s.planDrawings = db.planDrawings || [];
      s.files = (role === 'admin' || role === 'owner_rep' || role === 'consultant') ? (db.files || []) : [];
      s.messages = db.messages;
      s.contractors = db.contractors;
      s.boqItems = db.boqItems;
      APPROVAL_COLLECTIONS.concat(TECH_FILTERED, TECH_INTERNAL, ['comments']).forEach(function (c) { s[c] = db[c] || []; });

      if (role === 'contractor') {
        const cid = user.contractorId;
        CONTRACTOR_OWNED.forEach(function (c) {
          s[c] = (db[c] || []).filter(function (x) { return x.contractorId === cid; });
        });
        TECH_INTERNAL.forEach(function (c) { s[c] = []; });
        s.cameras = [];
        s.boqItems = db.boqItems.filter(function (x) { return x.contractorId === cid; });
        s.contractors = db.contractors.filter(function (x) { return x.id === cid; });
        s.messages = [];
        s.users = [];
      } else {
        // لا تُرسل كلمات المرور أو تجزئاتها لأي دور، بما فيهم الأدمن
        s.users = db.users.map(stripPassword);
      }

      // سجل النظام: للأدمن وممثل المالك فقط
      if (role === 'admin' || role === 'owner_rep') s.auditLog = db.auditLog || [];

      // تقييد النطاق بالمشاريع المسندة: المالك يرى مشروعه فقط
      // (وينطبق كذلك على استشاري أُسندت له مشاريع محددة)
      if (user.projectIds && (role === 'owner' || role === 'consultant')) {
        const pids = user.projectIds;
        const inScope = function (x) { return !x.projectId || pids.indexOf(x.projectId) !== -1; };
        s.projects = s.projects.filter(function (p) { return pids.indexOf(p.id) !== -1; });
        Object.keys(s).forEach(function (k) {
          if (k === 'projects' || k === 'users' || k === 'auditLog') return;
          if (Array.isArray(s[k])) s[k] = s[k].filter(inScope);
        });
      }
      return s;
    }

    function assertCanCreate(user, collection) {
      const allowed = CREATE_RULES[collection];
      if (!allowed) throw err('مجموعة غير معروفة: ' + collection, 404);
      if (allowed.indexOf(user.role) === -1) throw err('لا تملك صلاحية الإضافة هنا', 403);
    }

    /** يجد العنصر الأصل الذي يخص هذا التعليق، ويتحقق من صلاحية المستخدم للتعليق عليه */
    function resolveCommentParent(user, data) {
      const col = data.collection;
      const list = col && db[col];
      if (!list) throw err('مجموعة غير معروفة للتعليق: ' + col, 400);
      const parent = list.find(function (x) { return x.id === data.itemId; });
      if (!parent) throw err('العنصر المطلوب التعليق عليه غير موجود', 404);
      if (user.role === 'contractor' && parent.contractorId !== user.contractorId) {
        throw err('لا تملك صلاحية التعليق على هذا الطلب', 403);
      }
      return parent;
    }

    function createItem(user, collection, data) {
      assertCanCreate(user, collection);
      const item = Object.assign({}, data);
      item.id = nextId(collection.substring(0, 2).toUpperCase());

      if (collection === 'comments') {
        const parent = resolveCommentParent(user, item);
        item.contractorId = parent.contractorId || null;
        item.projectId = parent.projectId || 'P1';
        item.byUserId = user.id;
        item.byName = user.name;
        item.byRole = user.role;
        item.date = nowStr();
        db.comments = db.comments || [];
        db.comments.push(item);
        audit(user, 'create', 'رد على ' + labelOf(data.collection, parent));
        persist();
        return item;
      }

      if (user.role === 'contractor') {
        item.contractorId = user.contractorId; // المقاول لا يُنشئ باسم غيره
        // مشروع المقاول الفعلي دائماً — لا يُعتمد على ما يرسله العميل (مهم عند تعدد المشاريع)
        const myContractor = db.contractors.find(function (c) { return c.id === user.contractorId; });
        item.projectId = (myContractor && myContractor.projectId) || item.projectId || 'P1';
        if (APPROVAL_COLLECTIONS.indexOf(collection) !== -1) item.status = 'pending';
      } else {
        item.projectId = item.projectId || 'P1';
      }
      if (REF_PREFIX[collection]) item.ref = nextRef(collection); // يتجاهل أي ref مُرسَل من العميل عمداً
      if (!item.date) item.date = todayStr();
      if (!item.status) {
        if (DEFAULT_STATUS[collection]) item.status = DEFAULT_STATUS[collection];
        else if (APPROVAL_COLLECTIONS.indexOf(collection) !== -1) item.status = 'pending';
      }
      if (!item.docCode) item.docCode = docCode(collection, item.projectId);
      if (collection === 'users' && item.password && pwd.hash) {
        const plain = item.password;
        delete item.password;
        Object.assign(item, pwd.hash(plain));
        db.users.push(item);
        audit(user, 'create', labelOf('users', item));
        persist();
        return Object.assign(stripPassword(item), { password: plain }); // تُعرض مرة واحدة فقط
      }
      db[collection].push(item);
      audit(user, 'create', labelOf(collection, item));
      persist();
      return item;
    }

    function updateItem(user, collection, id, patch) {
      const list = db[collection];
      if (!list) throw err('مجموعة غير معروفة', 404);
      const item = list.find(function (x) { return x.id === id; });
      if (!item) throw err('العنصر غير موجود', 404);
      if (user.role === 'contractor') {
        if (item.contractorId !== user.contractorId) throw err('لا تملك صلاحية التعديل', 403);
        if (item.status && item.status !== 'pending') throw err('لا يمكن تعديل طلب تم البت فيه', 403);
      }
      Object.assign(item, patch);
      audit(user, 'update', labelOf(collection, item));
      persist();
      return item;
    }

    function deleteItem(user, collection, id) {
      if (user.role !== 'admin' && !(user.role === 'owner_rep' && collection === 'users')) {
        throw err('الحذف متاح للأدمن فقط', 403);
      }
      const list = db[collection];
      if (!list) throw err('مجموعة غير معروفة', 404);
      const i = list.findIndex(function (x) { return x.id === id; });
      if (i === -1) throw err('العنصر غير موجود', 404);
      audit(user, 'delete', labelOf(collection, list[i]));
      list.splice(i, 1);
      persist();
      return { ok: true };
    }

    /**
     * قرار الاستشاري على أي طلب اعتماد.
     * status: approved | approved_notes | rejected
     * اعتماد المستخلص يحدّث نسب إنجاز بنود جدول الكميات المرتبطة به
     * (فتتحول مناطق المخططات من داكنة إلى ساطعة) ويحدّث المبالغ المستلمة للمقاول.
     */
    function review(user, opts) {
      if (user.role !== 'consultant' && user.role !== 'admin') throw err('قرار الاعتماد صلاحية الاستشاري', 403);
      const collection = opts.collection, id = opts.id, status = opts.status;
      if (APPROVAL_COLLECTIONS.indexOf(collection) === -1) throw err('هذه المجموعة ليست ضمن دورة الاعتماد', 400);
      if (['approved', 'approved_notes', 'rejected'].indexOf(status) === -1) throw err('حالة غير صالحة', 400);
      const item = db[collection].find(function (x) { return x.id === id; });
      if (!item) throw err('الطلب غير موجود', 404);

      item.status = status;
      item.notes = opts.notes || '';
      item.signature = user.name;
      item.signDate = todayStr();

      if (collection === 'payments' && (status === 'approved' || status === 'approved_notes')) {
        applyPaymentEffects(item);
      }
      const decision = status === 'rejected' ? 'رفض' : 'اعتماد';
      audit(user, 'review', decision + ' — ' + labelOf(collection, item));
      persist();
      return item;
    }

    /** أثر اعتماد المستخلص: تحديث نسب البنود + المبالغ المستلمة */
    function applyPaymentEffects(pc) {
      const contractor = db.contractors.find(function (c) { return c.id === pc.contractorId; });
      if (contractor) contractor.amountReceived = (contractor.amountReceived || 0) + (pc.amount || 0);
      (pc.lines || []).forEach(function (line) {
        const bq = db.boqItems.find(function (b) { return b.id === line.boqItemId; });
        if (bq && typeof line.progress === 'number') {
          bq.progress = Math.max(bq.progress, Math.min(100, line.progress));
          bq.status = bq.progress >= 100 ? 'منجز' : bq.progress > 0 ? 'جاري' : 'لم يبدأ';
        }
      });
    }

    /** إضافة مقاول جديد مع حسابه وبنود كمياته (صلاحية الاستشاري) */
    function addContractor(user, payload) {
      if (['consultant', 'admin'].indexOf(user.role) === -1) throw err('إضافة المقاولين صلاحية الاستشاري', 403);
      const c = {
        id: nextId('C'), projectId: payload.projectId || 'P1',
        name: payload.name, type: payload.type,
        contractValue: Number(payload.contractValue) || 0,
        startDate: payload.startDate, endDate: payload.endDate,
        amountReceived: 0, plannedProgress: 0, phone: payload.phone || ''
      };
      db.contractors.push(c);
      let account = null;
      if (payload.username) {
        account = storeAccount(
          { id: nextId('U'), username: payload.username, name: c.name, role: 'contractor', contractorId: c.id, email: payload.email || undefined },
          payload.password || genPassword()
        );
      }
      (payload.boqItems || []).forEach(function (b, i) {
        db.boqItems.push({
          id: nextId('BQ'), projectId: c.projectId, contractorId: c.id,
          discipline: c.type, floor: b.floor || 'GF', zone: i % 6,
          code: (c.type || 'GN').substring(0, 2).toUpperCase() + '-' + String(i + 1).padStart(2, '0'),
          description: b.description, unit: b.unit, qty: Number(b.qty) || 0,
          unitPrice: Number(b.unitPrice) || 0, progress: 0, status: 'لم يبدأ'
        });
      });
      audit(user, 'create', labelOf('contractors', c) + (account ? ' + حساب دخول (' + account.username + ')' : ''));
      persist();
      return { contractor: c, account: account };
    }

    /** إضافة مشروع وتعيين استشاري بحسابه (صلاحية ممثل المالك) */
    function addProject(user, payload) {
      if (['owner_rep', 'admin'].indexOf(user.role) === -1) throw err('إضافة المشاريع صلاحية ممثل المالك', 403);
      const p = {
        id: nextId('P'), name: payload.name, location: payload.location || '',
        description: payload.description || '', ownerName: payload.ownerName || '',
        consultantName: payload.consultantName || '',
        startPlanned: payload.startPlanned, endPlanned: payload.endPlanned,
        startActual: null, endForecast: payload.endPlanned,
        budgetPlanned: Number(payload.budgetPlanned) || 0, costActual: 0, costPlannedToDate: 0,
        progressPlanned: 0, progressActual: 0,
        floors: db.projects[0] ? db.projects[0].floors : [], disciplines: db.projects[0] ? db.projects[0].disciplines : []
      };
      db.projects.push(p);
      let account = null;
      if (payload.consultantUsername) {
        account = storeAccount(
          { id: nextId('U'), username: payload.consultantUsername,
            name: payload.consultantName || 'استشاري ' + p.name, role: 'consultant', email: payload.consultantEmail || undefined },
          payload.consultantPassword || genPassword()
        );
      }
      audit(user, 'create', labelOf('projects', p) + (account ? ' + حساب استشاري (' + account.username + ')' : ''));
      persist();
      return { project: p, account: account };
    }

    /** إرسال تقرير للمالك (واتساب / إيميل) — محاكاة قناة الإرسال مع سجل موثق */
    function sendReport(user, payload) {
      if (['consultant', 'admin', 'owner_rep', 'owner'].indexOf(user.role) === -1) throw err('غير مصرح', 403);
      const msg = {
        id: nextId('MSG'), channel: payload.channel === 'whatsapp' ? 'whatsapp' : 'email',
        to: payload.to, title: payload.title || 'تقرير المشروع',
        date: nowStr(), status: payload.status === 'sent_demo' ? 'sent_demo' : 'sent', by: user.name
      };
      db.messages.push(msg);
      audit(user, 'send', 'إرسال تقرير عبر ' + (msg.channel === 'whatsapp' ? 'واتساب' : 'البريد') + ': ' + msg.title);
      persist();
      return msg;
    }

    // ===== حسابات مشتقة =====

    /** ملخص أداء مقاول: إنجاز، مبالغ، تأخر، تجاوز صرف */
    function contractorSummary(c) {
      const items = db.boqItems.filter(function (b) { return b.contractorId === c.id; });
      let earned = 0, total = 0;
      items.forEach(function (b) {
        const v = b.qty * b.unitPrice;
        total += v; earned += v * (b.progress / 100);
      });
      const progress = total ? Math.round((earned / total) * 1000) / 10 : 0;
      const earnedValue = c.contractValue * progress / 100;
      return {
        id: c.id, name: c.name, type: c.type,
        contractValue: c.contractValue, amountReceived: c.amountReceived,
        startDate: c.startDate, endDate: c.endDate,
        progress: progress, plannedProgress: c.plannedProgress || 0,
        delayed: progress < (c.plannedProgress || 0) - 3,
        overpaid: c.amountReceived > earnedValue * 1.05,
        earnedValue: Math.round(earnedValue)
      };
    }

    /** نسبة إنجاز دور/تخصص لتلوين المخططات (داكن ← ساطع) */
    function floorDisciplineProgress(floorId, discipline) {
      const items = db.boqItems.filter(function (b) {
        return b.floor === floorId && (!discipline || b.discipline === discipline);
      });
      if (!items.length) return null;
      let earned = 0, total = 0;
      items.forEach(function (b) {
        const v = b.qty * b.unitPrice;
        total += v; earned += v * (b.progress / 100);
      });
      return total ? Math.round((earned / total) * 100) : 0;
    }

    function genPassword() {
      const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
      let p = '';
      for (let i = 0; i < 8; i++) p += chars[Math.floor(Math.random() * chars.length)];
      return p;
    }
    function todayStr() { return new Date().toISOString().slice(0, 10); }
    function nowStr() { return new Date().toISOString().slice(0, 16).replace('T', ' '); }

    return {
      db: db,
      audit: audit,
      docCode: docCode,
      login: login,
      getState: getState,
      createItem: createItem,
      updateItem: updateItem,
      deleteItem: deleteItem,
      review: review,
      addContractor: addContractor,
      addProject: addProject,
      sendReport: sendReport,
      contractorSummary: contractorSummary,
      floorDisciplineProgress: floorDisciplineProgress,
      labelOf: labelOf,
      APPROVAL_COLLECTIONS: APPROVAL_COLLECTIONS
    };
  }

  return { createCore: createCore };
});
