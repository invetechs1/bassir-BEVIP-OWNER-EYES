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
  const TECH_FILTERED = ['rfis', 'rfps', 'ncrs', 'siteInstructions', 'snags', 'hseReports', 'materialTests'];
  // مجموعات مكتب فني عامة لا تُعرض للمقاول
  const TECH_INTERNAL = ['meetings', 'correspondence'];
  const CONTRACTOR_OWNED = APPROVAL_COLLECTIONS.concat(TECH_FILTERED); // المقاول يرى ضمنها ما يخصه فقط

  // الحالة الابتدائية الافتراضية لكل مجموعة
  const DEFAULT_STATUS = {
    rfis: 'open', rfps: 'open', ncrs: 'open', siteInstructions: 'issued',
    snags: 'open', hseReports: 'open'
  };

  // أسماء المجموعات بالعربية (لسجل النظام والواجهة)
  const COLLECTION_LABELS = {
    shopDrawings: 'مخطط تنفيذي', materials: 'اعتماد مواد', scheduleSubmittals: 'جدول زمني',
    wirs: 'طلب استلام', changeOrders: 'أمر تغيير', payments: 'مستخلص',
    methodStatements: 'أسلوب تنفيذ/ITP', claims: 'مطالبة/EOT', valueEngineering: 'هندسة قيمية',
    handoverDocs: 'مستند تسليم', rfis: 'استفسار RFI', rfps: 'طلب عرض RFP', ncrs: 'عدم مطابقة NCR',
    siteInstructions: 'تعليمات موقعية', snags: 'ملاحظة تسليم', hseReports: 'تقرير سلامة',
    materialTests: 'اختبار مواد', meetings: 'محضر اجتماع', correspondence: 'خطاب',
    dailyReports: 'تقرير يومي', weeklyReports: 'تقرير أسبوعي', monthlyReports: 'تقرير شهري',
    boqItems: 'بند كميات', planDrawings: 'مخطط مشروع', cameras: 'كاميرا',
    users: 'مستخدم', contractors: 'مقاول', projects: 'مشروع', photos: 'صورة',
    bimModels: 'نموذج BIM', bimDocs: 'وثيقة BIM'
  };

  function labelOf(collection, item) {
    return (COLLECTION_LABELS[collection] || collection) + ': ' +
      (item && (item.title || item.name || item.description || item.ref || item.username || item.id) || '');
  }

  // رموز أنواع المستندات في نظام التكويد: BSR-المشروع-النوع-السنة-التسلسل
  const DOC_TYPE_CODES = {
    shopDrawings: 'SD', materials: 'MAT', scheduleSubmittals: 'SCH', wirs: 'WIR',
    changeOrders: 'CO', payments: 'IPC', methodStatements: 'MS', claims: 'CLM',
    valueEngineering: 'VE', handoverDocs: 'HOD', rfis: 'RFI', rfps: 'RFP', ncrs: 'NCR',
    siteInstructions: 'SI', snags: 'SNG', hseReports: 'HSE', materialTests: 'TST',
    meetings: 'MOM', correspondence: 'COR', dailyReports: 'DDR', weeklyReports: 'WKR',
    monthlyReports: 'MOR', planDrawings: 'DRW', photos: 'PHT', files: 'FIL',
    bimModels: 'BIM', bimDocs: 'BDC'
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
    rfps: ['contractor', 'consultant', 'admin'],
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
    bimModels: ['consultant', 'admin'],
    bimDocs: ['consultant', 'admin']
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
      s.bimModels = db.bimModels || [];
      s.bimDocs = db.bimDocs || [];
      // المالك يطلع على وثائق مشروعه (قراءة) — يقيدها نطاق المشروع أدناه
      s.files = (role === 'admin' || role === 'owner_rep' || role === 'consultant' || role === 'owner') ? (db.files || []) : [];
      s.messages = db.messages;
      s.contractors = db.contractors;
      s.boqItems = db.boqItems;
      APPROVAL_COLLECTIONS.concat(TECH_FILTERED, TECH_INTERNAL).forEach(function (c) { s[c] = db[c] || []; });

      if (role === 'contractor') {
        const cid = user.contractorId;
        CONTRACTOR_OWNED.forEach(function (c) {
          s[c] = (db[c] || []).filter(function (x) { return x.contractorId === cid; });
        });
        TECH_INTERNAL.forEach(function (c) { s[c] = []; });
        s.cameras = [];
        s.bimDocs = [];
        s.boqItems = db.boqItems.filter(function (x) { return x.contractorId === cid; });
        s.contractors = db.contractors.filter(function (x) { return x.id === cid; });
        s.messages = [];
        s.users = [];
      } else {
        // لا تُرسل كلمات المرور أو تجزئاتها لأي دور، بما فيهم الأدمن
        s.users = db.users.map(stripPassword);
      }

      // إشعارات المستخدم الحالي فقط (بحسب دوره أو مقاوله)
      s.notifications = myNotifications(user).slice(0, 60);

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

    /**
     * إشعار داخلي فوري. target: { role: 'consultant' } يصل للاستشاري والأدمن،
     * أو { contractorId: 'C1' } يصل لحسابات هذا المقاول.
     * تُقرأ لكل مستخدم على حدة عبر readBy.
     */
    function pushNotification(target, kind, text, refCollection, refId) {
      if (!db.notifications) db.notifications = [];
      db.notifications.unshift({
        id: nextId('NT'), time: nowStr(), kind: kind, text: text,
        role: target.role || null, contractorId: target.contractorId || null,
        collection: refCollection || null, refId: refId || null, readBy: []
      });
      if (db.notifications.length > 200) db.notifications.length = 200;
    }

    function myNotifications(user) {
      return (db.notifications || []).filter(function (n) {
        if (n.contractorId) return user.role === 'contractor' && user.contractorId === n.contractorId;
        if (n.role) return user.role === n.role || user.role === 'admin';
        return false;
      });
    }

    function markNotificationsRead(user) {
      myNotifications(user).forEach(function (n) {
        if (n.readBy.indexOf(user.id) === -1) n.readBy.push(user.id);
      });
      persist();
      return { ok: true };
    }

    function createItem(user, collection, data) {
      assertCanCreate(user, collection);
      const item = Object.assign({}, data);
      item.id = nextId(collection.substring(0, 2).toUpperCase());
      item.projectId = item.projectId || 'P1';
      if (user.role === 'contractor') {
        item.contractorId = user.contractorId; // المقاول لا يُنشئ باسم غيره
        if (APPROVAL_COLLECTIONS.indexOf(collection) !== -1) item.status = 'pending';
      }
      if (!item.date) item.date = todayStr();
      if (!item.status) {
        if (DEFAULT_STATUS[collection]) item.status = DEFAULT_STATUS[collection];
        else if (APPROVAL_COLLECTIONS.indexOf(collection) !== -1) item.status = 'pending';
      }
      if (!item.docCode) item.docCode = docCode(collection, item.projectId);
      // سجل التتبع: كل معاملة تبدأ بحدث "تقديم"
      if (APPROVAL_COLLECTIONS.indexOf(collection) !== -1 || collection === 'rfis' || collection === 'rfps') {
        item.history = [{ status: item.status || 'pending', by: user.name, role: user.role, date: item.date }];
      }
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
      // إشعار المكتب الفني بكل تقديم جديد من مقاول
      if (user.role === 'contractor' &&
          (APPROVAL_COLLECTIONS.indexOf(collection) !== -1 || collection === 'rfis' || collection === 'rfps')) {
        pushNotification({ role: 'consultant' }, 'submit',
          '📥 تقديم جديد: ' + labelOf(collection, item) + ' — من ' + user.name, collection, item.id);
        if (collection === 'rfps' && item.to === 'owner') {
          pushNotification({ role: 'owner' }, 'submit', '📮 طلب عرض موجه إليك: ' + (item.title || item.ref), collection, item.id);
        }
      }
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
        if (item.status && item.status !== 'pending' && item.status !== 'open') {
          // بعد البت: يسمح فقط بالرد على الترميز/الملاحظات على نفس النسخة
          const keys = Object.keys(patch);
          const allowed = keys.every(function (k) { return ['annotations', 'markupBy', 'markupDate'].indexOf(k) !== -1; });
          if (!allowed) throw err('لا يمكن تعديل طلب تم البت فيه — يمكنك الرد على الملاحظات أو رفع نسخة معدلة', 403);
        }
      }
      const wasOpen = item.status === 'open';
      Object.assign(item, patch);
      // إشعار المقاول عند الرد على استفساره أو عرضه
      if (wasOpen && patch.status === 'answered' && (collection === 'rfis' || collection === 'rfps') && item.contractorId) {
        pushNotification({ contractorId: item.contractorId }, 'answer',
          '↩️ تم الرد على ' + labelOf(collection, item) + (patch.answer ? ' — ' + patch.answer : ''), collection, item.id);
      }
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
      if (!item.reviewStartDate) item.reviewStartDate = item.date;
      item.reviewEndDate = todayStr();
      item.reviewDays = Math.max(0, Math.round((new Date(item.reviewEndDate) - new Date(item.date)) / 86400000));
      if (!item.history) item.history = [];
      item.history.push({ status: status, by: user.name, role: user.role, date: todayStr(), notes: opts.notes || '' });

      if (collection === 'payments' && (status === 'approved' || status === 'approved_notes')) {
        applyPaymentEffects(item);
      }
      const decision = status === 'rejected' ? 'رفض' : 'اعتماد';
      if (item.contractorId) {
        pushNotification({ contractorId: item.contractorId }, 'decision',
          (status === 'rejected' ? '↩ أُرجع إليك للتعديل: ' : status === 'approved_notes' ? '📝 اعتُمد مع ملاحظات: ' : '✅ اعتُمد: ') +
          labelOf(collection, item) + (opts.notes ? ' — ' + opts.notes : ''), collection, item.id);
      }
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

    /**
     * إعادة تقديم نسخة معدلة على نفس المستند: تؤرشف النسخة الحالية
     * (الملف + الترميز + القرار) في revisions ويعود المستند لقيد المراجعة
     * — دورة مراجعة متصلة بلا ملفات مكررة وبسجل تدقيق كامل.
     */
    function resubmit(user, opts) {
      const collection = opts.collection, id = opts.id;
      const list = db[collection];
      if (!list) throw err('مجموعة غير معروفة', 404);
      const item = list.find(function (x) { return x.id === id; });
      if (!item) throw err('المستند غير موجود', 404);
      if (user.role === 'contractor' && item.contractorId !== user.contractorId) throw err('غير مصرح', 403);
      if (['contractor', 'consultant', 'admin'].indexOf(user.role) === -1) throw err('غير مصرح', 403);
      if (item.status === 'pending') throw err('المستند قيد المراجعة بالفعل', 400);

      if (!item.revisions) item.revisions = [];
      item.revisions.push({
        rev: item.revisions.length + 1,
        file: item.file || null,
        annotations: item.annotations || [],
        status: item.status, notes: item.notes || '',
        signature: item.signature || '', signDate: item.signDate || '',
        date: item.date, archivedAt: todayStr()
      });
      if (opts.file) item.file = opts.file;
      item.annotations = [];
      item.status = 'pending';
      item.notes = ''; item.signature = ''; item.signDate = '';
      item.date = todayStr();
      item.reviewStartDate = null; item.reviewEndDate = null; item.reviewDays = null;
      if (!item.history) item.history = [];
      item.history.push({ status: 'resubmitted', by: user.name, role: user.role, date: todayStr(), notes: 'نسخة معدلة رقم ' + (item.revisions.length + 1) });
      pushNotification({ role: 'consultant' }, 'resubmit',
        '🔄 أُعيد التقديم بنسخة معدلة: ' + labelOf(collection, item) + ' — من ' + user.name, collection, item.id);
      audit(user, 'update', 'إعادة تقديم نسخة معدلة — ' + labelOf(collection, item));
      persist();
      return item;
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
          { id: nextId('U'), username: payload.username, name: c.name, role: 'contractor', contractorId: c.id },
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
            name: payload.consultantName || 'استشاري ' + p.name, role: 'consultant' },
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
      resubmit: resubmit,
      markNotificationsRead: markNotificationsRead,
      addContractor: addContractor,
      addProject: addProject,
      sendReport: sendReport,
      contractorSummary: contractorSummary,
      floorDisciplineProgress: floorDisciplineProgress,
      APPROVAL_COLLECTIONS: APPROVAL_COLLECTIONS
    };
  }

  return { createCore: createCore };
});
