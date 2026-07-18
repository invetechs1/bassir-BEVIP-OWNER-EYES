/**
 * بصير - عيون المالك | Bassir Owner Eyes
 * بيانات الديمو الأساسية (تعمل في Node.js وفي المتصفح)
 * تُولَّد البيانات بشكل حتمي (deterministic) حتى تتطابق نسخة الخادم مع نسخة الديمو التفاعلي.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.BassirSeed = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // مولد أرقام شبه عشوائي حتمي (mulberry32)
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const FLOORS = [
    { id: 'B1', name: 'القبو' },
    { id: 'GF', name: 'الدور الأرضي' },
    { id: 'MZ', name: 'الميزانين' },
    { id: 'F1', name: 'الدور الأول' },
    { id: 'F2', name: 'الدور الثاني' },
    { id: 'F3', name: 'الدور الثالث' },
    { id: 'F4', name: 'الدور الرابع' },
    { id: 'RF', name: 'السطح' }
  ];

  const DISCIPLINES = [
    { id: 'structural',    name: 'الأعمال الإنشائية', color: '#8d99ae', icon: '🏗️' },
    { id: 'architectural', name: 'الأعمال المعمارية', color: '#e0a458', icon: '🏛️' },
    { id: 'electrical',    name: 'الأعمال الكهربائية', color: '#ffd166', icon: '⚡' },
    { id: 'hvac',          name: 'أعمال التكييف HVAC', color: '#4cc9f0', icon: '❄️' },
    { id: 'plumbing',      name: 'الأعمال الصحية', color: '#06d6a0', icon: '🚿' },
    { id: 'fire',          name: 'أعمال الحريق', color: '#ef476f', icon: '🧯' },
    { id: 'furniture',     name: 'الفرش والأثاث', color: '#b5838d', icon: '🛋️' }
  ];

  // نسب الإنجاز المستهدفة لكل تخصص في كل دور (تتناقص كلما ارتفعنا)
  const DISC_BASE_PROGRESS = {
    structural:    { B1: 100, GF: 100, MZ: 100, F1: 100, F2: 98, F3: 92, F4: 78, RF: 55 },
    architectural: { B1: 95,  GF: 88,  MZ: 80,  F1: 72,  F2: 55, F3: 35, F4: 15, RF: 5  },
    electrical:    { B1: 85,  GF: 70,  MZ: 62,  F1: 55,  F2: 40, F3: 22, F4: 8,  RF: 0  },
    hvac:          { B1: 80,  GF: 62,  MZ: 55,  F1: 45,  F2: 30, F3: 15, F4: 5,  RF: 10 },
    plumbing:      { B1: 90,  GF: 75,  MZ: 68,  F1: 60,  F2: 45, F3: 28, F4: 12, RF: 20 },
    fire:          { B1: 70,  GF: 50,  MZ: 40,  F1: 30,  F2: 18, F3: 8,  F4: 0,  RF: 0  },
    furniture:     { B1: 0,   GF: 25,  MZ: 15,  F1: 10,  F2: 0,  F3: 0,  F4: 0,  RF: 0  }
  };

  const BOQ_TEMPLATES = {
    structural: [
      ['خرسانة مسلحة للأعمدة', 'م3', 180, 950], ['خرسانة مسلحة للأسقف', 'م3', 420, 880],
      ['حديد تسليح', 'طن', 95, 3200], ['أعمال العزل المائي', 'م2', 600, 45]
    ],
    architectural: [
      ['مباني بلوك أسمنتي', 'م2', 850, 65], ['لياسة داخلية وخارجية', 'م2', 1700, 38],
      ['أعمال الدهانات', 'م2', 1600, 32], ['تركيب رخام وسيراميك', 'م2', 700, 145],
      ['أسقف مستعارة جبسية', 'م2', 550, 85], ['أبواب ونوافذ ألمنيوم', 'عدد', 24, 1850]
    ],
    electrical: [
      ['تمديدات كهربائية رئيسية', 'نقطة', 320, 95], ['لوحات توزيع فرعية', 'عدد', 6, 4500],
      ['إنارة داخلية LED', 'عدد', 180, 120], ['نظام تيار خفيف وشبكات', 'نقطة', 90, 210]
    ],
    hvac: [
      ['وحدات تكييف مركزي', 'عدد', 4, 28000], ['دكتات هواء معزولة', 'م2', 480, 165],
      ['مخارج هواء وجريلات', 'عدد', 85, 240], ['ترموستات وتحكم', 'عدد', 30, 380]
    ],
    plumbing: [
      ['تمديدات تغذية مياه', 'م.ط', 650, 42], ['تمديدات صرف صحي', 'م.ط', 520, 58],
      ['أطقم صحية كاملة', 'عدد', 26, 2400], ['سخانات مركزية', 'عدد', 8, 1900]
    ],
    fire: [
      ['شبكة رشاشات آلية', 'رأس', 260, 185], ['خزائن حريق ومطافئ', 'عدد', 18, 1450],
      ['نظام إنذار حريق', 'نقطة', 140, 260], ['مضخات حريق', 'عدد', 2, 42000]
    ],
    furniture: [
      ['فرش مكاتب إدارية', 'عدد', 40, 3200], ['كنب ومجالس استقبال', 'طقم', 8, 9500],
      ['ستائر ومعلقات', 'م2', 300, 140], ['تجهيزات مطابخ', 'عدد', 6, 14500]
    ]
  };

  function buildSeed() {
    const rand = rng(20260718);
    const db = {};

    // ============ المشروع ============
    db.projects = [{
      id: 'P1',
      name: 'برج بصير التجاري',
      location: 'الرياض - حي الملقا',
      description: 'برج تجاري إداري مكوّن من قبو وأرضي وميزانين وأربعة أدوار متكررة وسطح، بمساحة بناء إجمالية 12,400 م².',
      ownerName: 'م. عبدالله الراشد',
      consultantName: 'دار العمران للاستشارات الهندسية',
      startPlanned: '2025-03-01', endPlanned: '2026-12-31',
      startActual: '2025-03-15', endForecast: '2027-02-15',
      budgetPlanned: 52000000, costActual: 29800000, costPlannedToDate: 27200000,
      progressPlanned: 62, progressActual: 54.5,
      floors: FLOORS, disciplines: DISCIPLINES
    }];

    // ============ المقاولون ============
    db.contractors = [
      { id: 'C1', projectId: 'P1', name: 'شركة الإعمار الحديثة', type: 'structural',
        contractValue: 18000000, startDate: '2025-03-15', endDate: '2026-04-30',
        amountReceived: 15300000, plannedProgress: 95, phone: '0501112233' },
      { id: 'C2', projectId: 'P1', name: 'مؤسسة البناء المعماري', type: 'architectural',
        contractValue: 12000000, startDate: '2025-09-01', endDate: '2026-10-31',
        amountReceived: 8900000, plannedProgress: 60, phone: '0502223344' },
      { id: 'C3', projectId: 'P1', name: 'شركة الطاقة المتحدة', type: 'electrical',
        contractValue: 6500000, startDate: '2025-10-01', endDate: '2026-11-30',
        amountReceived: 2600000, plannedProgress: 50, phone: '0503334455' },
      { id: 'C4', projectId: 'P1', name: 'تكييف الخليج المتقدم', type: 'hvac',
        contractValue: 5000000, startDate: '2025-11-01', endDate: '2026-11-30',
        amountReceived: 2400000, plannedProgress: 55, phone: '0504445566' },
      { id: 'C5', projectId: 'P1', name: 'شركة المياه للأعمال الصحية', type: 'plumbing',
        contractValue: 3200000, startDate: '2025-10-15', endDate: '2026-10-31',
        amountReceived: 1550000, plannedProgress: 58, phone: '0505556677' },
      { id: 'C6', projectId: 'P1', name: 'أنظمة الأمان للحريق', type: 'fire',
        contractValue: 2800000, startDate: '2025-12-01', endDate: '2026-12-15',
        amountReceived: 1300000, plannedProgress: 45, phone: '0506667788' },
      { id: 'C7', projectId: 'P1', name: 'دار الفرش الراقي', type: 'furniture',
        contractValue: 4000000, startDate: '2026-05-01', endDate: '2026-12-20',
        amountReceived: 350000, plannedProgress: 12, phone: '0507778899' }
    ];

    // ============ جدول الكميات BOQ (مرتبط بالأدوار والتخصصات) ============
    db.boqItems = [];
    let boqSeq = 1;
    db.contractors.forEach(function (c) {
      const templates = BOQ_TEMPLATES[c.type];
      const baseByFloor = DISC_BASE_PROGRESS[c.type];
      FLOORS.forEach(function (fl, fi) {
        templates.forEach(function (t, ti) {
          // ليس كل بند موجوداً في كل دور
          if (c.type === 'furniture' && (fl.id === 'B1' || fl.id === 'RF')) return;
          if (c.type === 'hvac' && fl.id === 'RF' && ti > 1) return;
          const base = baseByFloor[fl.id];
          const jitter = Math.round((rand() - 0.5) * 12);
          const progress = Math.max(0, Math.min(100, base + jitter));
          const qty = Math.max(1, Math.round(t[2] / FLOORS.length + (rand() - 0.5) * 6));
          db.boqItems.push({
            id: 'BQ' + (boqSeq++),
            projectId: 'P1', contractorId: c.id, discipline: c.type,
            floor: fl.id, zone: ti % 6,
            code: c.type.substring(0, 2).toUpperCase() + '-' + fl.id + '-' + String(ti + 1).padStart(2, '0'),
            description: t[0], unit: t[1], qty: qty, unitPrice: t[3],
            progress: progress,
            status: progress >= 100 ? 'منجز' : progress > 0 ? 'جاري' : 'لم يبدأ'
          });
        });
      });
    });

    // ============ الجدول الزمني (منحنى S: مخطط vs فعلي) ============
    db.scheduleCurve = [
      { month: '2025-03', planned: 2,  actual: 1 },  { month: '2025-05', planned: 8,  actual: 6 },
      { month: '2025-07', planned: 15, actual: 12 }, { month: '2025-09', planned: 24, actual: 20 },
      { month: '2025-11', planned: 33, actual: 28 }, { month: '2026-01', planned: 42, actual: 36 },
      { month: '2026-03', planned: 50, actual: 44 }, { month: '2026-05', planned: 57, actual: 50 },
      { month: '2026-07', planned: 62, actual: 54.5 }, { month: '2026-09', planned: 74, actual: null },
      { month: '2026-11', planned: 88, actual: null }, { month: '2026-12', planned: 100, actual: null }
    ];

    db.scheduleTasks = [
      { id: 'T1', name: 'أعمال الحفر والأساسات', startPlanned: '2025-03-01', endPlanned: '2025-06-15', startActual: '2025-03-15', endActual: '2025-07-01', progress: 100 },
      { id: 'T2', name: 'الهيكل الخرساني', startPlanned: '2025-06-01', endPlanned: '2026-01-31', startActual: '2025-06-20', endActual: '2026-02-28', progress: 100 },
      { id: 'T3', name: 'أعمال المباني واللياسة', startPlanned: '2025-10-01', endPlanned: '2026-06-30', startActual: '2025-10-15', endActual: null, progress: 72 },
      { id: 'T4', name: 'الأعمال الكهروميكانيكية MEP', startPlanned: '2025-11-01', endPlanned: '2026-09-30', startActual: '2025-11-20', endActual: null, progress: 46 },
      { id: 'T5', name: 'التشطيبات الداخلية', startPlanned: '2026-02-01', endPlanned: '2026-10-31', startActual: '2026-03-01', endActual: null, progress: 30 },
      { id: 'T6', name: 'الواجهات الخارجية', startPlanned: '2026-04-01', endPlanned: '2026-09-30', startActual: '2026-05-01', endActual: null, progress: 18 },
      { id: 'T7', name: 'الفرش والتأثيث', startPlanned: '2026-08-01', endPlanned: '2026-12-15', startActual: null, endActual: null, progress: 4 },
      { id: 'T8', name: 'التشغيل والتسليم', startPlanned: '2026-11-01', endPlanned: '2026-12-31', startActual: null, endActual: null, progress: 0 }
    ];

    // ============ منحنى التكلفة ============
    db.costCurve = [
      { month: '2025-05', planned: 2.5,  actual: 2.1 },  { month: '2025-08', planned: 7.0,  actual: 6.2 },
      { month: '2025-11', planned: 13.5, actual: 12.8 }, { month: '2026-02', planned: 19.0, actual: 19.6 },
      { month: '2026-05', planned: 24.0, actual: 26.3 }, { month: '2026-07', planned: 27.2, actual: 29.8 },
      { month: '2026-10', planned: 38.0, actual: null }, { month: '2026-12', planned: 52.0, actual: null }
    ];

    // ============ المستخدمون ============
    db.users = [
      { id: 'U1', username: 'admin',      password: 'admin123',   name: 'مدير النظام',                    role: 'admin' },
      { id: 'U2', username: 'owner',      password: 'owner123',   name: 'م. عبدالله الراشد',              role: 'owner' },
      { id: 'U3', username: 'rep',        password: 'rep123',     name: 'م. سالم الحربي (ممثل المالك)',   role: 'owner_rep' },
      { id: 'U4', username: 'consultant', password: 'consult123', name: 'م. خالد العمران (الاستشاري)',    role: 'consultant' },
      { id: 'U5', username: 'cont-str',   password: 'cont123',    name: 'شركة الإعمار الحديثة',           role: 'contractor', contractorId: 'C1' },
      { id: 'U6', username: 'cont-arch',  password: 'cont123',    name: 'مؤسسة البناء المعماري',          role: 'contractor', contractorId: 'C2' },
      { id: 'U7', username: 'cont-elec',  password: 'cont123',    name: 'شركة الطاقة المتحدة',            role: 'contractor', contractorId: 'C3' }
    ];

    // ============ اعتمادات المخططات (Shop Drawings) ============
    db.shopDrawings = [
      { id: 'SD1', projectId: 'P1', contractorId: 'C2', ref: 'SD-ARC-014', title: 'مخطط تفاصيل الواجهة الشمالية', date: '2026-07-02', status: 'pending', notes: '', file: 'SD-ARC-014.pdf' },
      { id: 'SD2', projectId: 'P1', contractorId: 'C3', ref: 'SD-ELE-009', title: 'مخطط لوحات التوزيع - الدور الثاني', date: '2026-07-05', status: 'pending', notes: '', file: 'SD-ELE-009.pdf' },
      { id: 'SD3', projectId: 'P1', contractorId: 'C2', ref: 'SD-ARC-012', title: 'تفاصيل الأسقف المستعارة - الأرضي', date: '2026-06-20', status: 'approved', notes: 'اعتمد مع الالتزام بمناسيب التكييف', signature: 'م. خالد العمران', signDate: '2026-06-24', file: 'SD-ARC-012.pdf' },
      { id: 'SD4', projectId: 'P1', contractorId: 'C4', ref: 'SD-HVC-006', title: 'مسارات الدكتات - الميزانين', date: '2026-06-15', status: 'rejected', notes: 'تعارض مع كمرة ساقطة محور 5-C، يعاد التنسيق', signature: 'م. خالد العمران', signDate: '2026-06-18', file: 'SD-HVC-006.pdf' },
      { id: 'SD5', projectId: 'P1', contractorId: 'C1', ref: 'SD-STR-021', title: 'تفاصيل خزان المياه العلوي', date: '2026-06-28', status: 'approved_notes', notes: 'اعتمد مع ملاحظات: زيادة سماكة العزل', signature: 'م. خالد العمران', signDate: '2026-07-01', file: 'SD-STR-021.pdf' }
    ];

    // ============ اعتمادات المواد (Material Submittals) ============
    db.materials = [
      { id: 'MT1', projectId: 'P1', contractorId: 'C2', ref: 'MS-ARC-031', title: 'رخام أرضيات البهو الرئيسي', brand: 'Carrara - إيطالي', date: '2026-07-08', status: 'pending', notes: '', file: 'datasheet-marble.pdf' },
      { id: 'MT2', projectId: 'P1', contractorId: 'C3', ref: 'MS-ELE-018', title: 'كابلات نحاس مقاومة للحريق', brand: 'الرياض للكابلات', date: '2026-07-06', status: 'pending', notes: '', file: 'datasheet-cables.pdf' },
      { id: 'MT3', projectId: 'P1', contractorId: 'C4', ref: 'MS-HVC-011', title: 'وحدات تكييف VRF', brand: 'Daikin', date: '2026-06-22', status: 'approved', notes: 'مطابق للمواصفات', signature: 'م. خالد العمران', signDate: '2026-06-25', file: 'datasheet-vrf.pdf' },
      { id: 'MT4', projectId: 'P1', contractorId: 'C6', ref: 'MS-FIR-004', title: 'رؤوس رشاشات آلية', brand: 'Tyco', date: '2026-06-18', status: 'rejected', notes: 'الشهادة UL منتهية، يرفق إصدار محدث', signature: 'م. خالد العمران', signDate: '2026-06-21', file: 'datasheet-sprinkler.pdf' }
    ];

    // ============ اعتماد الجداول الزمنية ============
    db.scheduleSubmittals = [
      { id: 'SC1', projectId: 'P1', contractorId: 'C2', ref: 'SCH-ARC-R3', title: 'الجدول الزمني المحدّث - أعمال التشطيبات (مراجعة 3)', date: '2026-07-01', status: 'pending', notes: '', file: 'schedule-arc-r3.xml' },
      { id: 'SC2', projectId: 'P1', contractorId: 'C7', ref: 'SCH-FUR-R1', title: 'الجدول الزمني المبدئي - أعمال الفرش', date: '2026-06-25', status: 'approved', notes: 'اعتمد مع ربط البدء بجاهزية التشطيبات', signature: 'م. خالد العمران', signDate: '2026-06-28', file: 'schedule-fur-r1.xml' }
    ];

    // ============ طلبات استلام الأعمال (WIR) ============
    db.wirs = [
      { id: 'WIR1', projectId: 'P1', contractorId: 'C2', ref: 'WIR-ARC-087', title: 'استلام لياسة الدور الأول - الجناح الشرقي', date: '2026-07-10', status: 'pending', notes: '', location: 'F1' },
      { id: 'WIR2', projectId: 'P1', contractorId: 'C5', ref: 'WIR-PLB-042', title: 'استلام تمديدات الصرف - الدور الثاني', date: '2026-07-09', status: 'pending', notes: '', location: 'F2' },
      { id: 'WIR3', projectId: 'P1', contractorId: 'C1', ref: 'WIR-STR-134', title: 'استلام خرسانة سقف الدور الرابع', date: '2026-06-30', status: 'approved', notes: 'استلمت الأعمال - نتائج الكسر مطابقة', signature: 'م. خالد العمران', signDate: '2026-07-02', location: 'F4' },
      { id: 'WIR4', projectId: 'P1', contractorId: 'C3', ref: 'WIR-ELE-055', title: 'استلام تمديدات الدور الثالث', date: '2026-06-26', status: 'approved_notes', notes: 'قبول مع ملاحظات: استكمال تثبيت العلب في المحور B', signature: 'م. خالد العمران', signDate: '2026-06-29', location: 'F3' },
      { id: 'WIR5', projectId: 'P1', contractorId: 'C4', ref: 'WIR-HVC-019', title: 'استلام دكتات الميزانين', date: '2026-06-20', status: 'rejected', notes: 'مرفوض: العزل غير مكتمل والتعليق غير مطابق', signature: 'م. خالد العمران', signDate: '2026-06-23', location: 'MZ' }
    ];

    // ============ أوامر التغيير ============
    db.changeOrders = [
      { id: 'CO1', projectId: 'P1', contractorId: 'C2', ref: 'CO-ARC-05', title: 'تغيير رخام الواجهة إلى حجر طبيعي', amount: 380000, days: 15, date: '2026-07-04', status: 'pending', notes: '' },
      { id: 'CO2', projectId: 'P1', contractorId: 'C3', ref: 'CO-ELE-03', title: 'إضافة نقاط شواحن سيارات كهربائية بالقبو', amount: 145000, days: 10, date: '2026-06-27', status: 'approved', notes: 'معتمد ضمن ميزانية الاحتياطي', signature: 'م. خالد العمران', signDate: '2026-07-01' },
      { id: 'CO3', projectId: 'P1', contractorId: 'C4', ref: 'CO-HVC-02', title: 'رفع سعة تكييف قاعة الاجتماعات', amount: 95000, days: 7, date: '2026-06-15', status: 'rejected', notes: 'الحمل الحراري الحالي كافٍ وفق الدراسة', signature: 'م. خالد العمران', signDate: '2026-06-19' }
    ];

    // ============ المستخلصات ============
    db.payments = [
      { id: 'PC1', projectId: 'P1', contractorId: 'C1', ref: 'IPC-STR-11', title: 'المستخلص رقم 11 - أعمال الهيكل (سقف السطح)', amount: 1250000, date: '2026-07-06', status: 'pending', notes: '',
        lines: [
          { boqItemId: 'BQ29', progress: 100 }, { boqItemId: 'BQ30', progress: 95 },
          { boqItemId: 'BQ31', progress: 100 }, { boqItemId: 'BQ32', progress: 90 }
        ] },
      { id: 'PC2', projectId: 'P1', contractorId: 'C2', ref: 'IPC-ARC-07', title: 'المستخلص رقم 7 - تشطيبات الدور الثاني', amount: 980000, date: '2026-07-08', status: 'pending', notes: '',
        lines: [
          { boqItemId: 'BQ57', progress: 100 }, { boqItemId: 'BQ58', progress: 90 },
          { boqItemId: 'BQ59', progress: 85 }, { boqItemId: 'BQ60', progress: 95 }
        ] },
      { id: 'PC3', projectId: 'P1', contractorId: 'C3', ref: 'IPC-ELE-04', title: 'المستخلص رقم 4 - الأعمال الكهربائية', amount: 620000, date: '2026-06-20', status: 'approved', notes: 'صرف بعد خصم الدفعة المقدمة', signature: 'م. خالد العمران', signDate: '2026-06-24', lines: [] }
    ];

    // ============ التقارير اليومية والشهرية ============
    db.dailyReports = [
      { id: 'DR1', projectId: 'P1', date: '2026-07-16', weather: 'مشمس 41°', manpower: 186, equipment: 'رافعة برجية 2، بوبكات 3، خلاطة 1',
        works: ['صب خرسانة سقف السطح - المرحلة الثانية', 'لياسة الدور الثاني - الجناح الغربي', 'تمديدات كهرباء الدور الثالث', 'تركيب دكتات الدور الأول'],
        photos: ['ph-f4-slab.jpg', 'ph-f2-plaster.jpg', 'ph-f3-elec.jpg'], by: 'م. خالد العمران' },
      { id: 'DR2', projectId: 'P1', date: '2026-07-15', weather: 'مشمس 40°', manpower: 172, equipment: 'رافعة برجية 2، بوبكات 2',
        works: ['تجهيز حديد سقف السطح', 'تركيب رخام البهو الرئيسي', 'اختبار ضغط شبكة الحريق - القبو'],
        photos: ['ph-rf-steel.jpg', 'ph-gf-marble.jpg'], by: 'م. خالد العمران' },
      { id: 'DR3', projectId: 'P1', date: '2026-07-14', weather: 'غائم جزئياً 38°', manpower: 165, equipment: 'رافعة برجية 2',
        works: ['أعمال عزل السطح', 'دهانات الوجه الأول - الدور الأول', 'تركيب أطقم صحية - الأرضي'],
        photos: ['ph-rf-insul.jpg', 'ph-f1-paint.jpg'], by: 'م. خالد العمران' }
    ];

    db.monthlyReports = [
      { id: 'MR1', projectId: 'P1', month: '2026-06', title: 'التقرير الشهري - يونيو 2026',
        summary: 'بلغت نسبة الإنجاز الفعلية 52.8% مقابل 60% مخطط. أبرز المعوقات: تأخر توريد وحدات التكييف وإعادة تقديم مخططات الدكتات. تمت معالجة 14 طلب اعتماد مواد و22 طلب استلام أعمال.',
        progressPlanned: 60, progressActual: 52.8, by: 'م. خالد العمران' },
      { id: 'MR2', projectId: 'P1', month: '2026-05', title: 'التقرير الشهري - مايو 2026',
        summary: 'نسبة الإنجاز 50% فعلي مقابل 57% مخطط. اكتمال الهيكل حتى الدور الرابع وبدء التشطيبات في الأدوار السفلية.',
        progressPlanned: 57, progressActual: 50, by: 'م. خالد العمران' }
    ];

    // ============ رؤى الذكاء الاصطناعي ============
    db.aiInsights = [
      { id: 'AI1', date: '2026-07-16', source: 'camera', area: 'الدور الرابع - سقف', detected: 78, reported: 78,
        note: 'تحليل بث الكاميرا رقم 3: صب السقف مكتمل بنسبة 78% ويطابق تقرير الموقع.', severity: 'ok' },
      { id: 'AI2', date: '2026-07-15', source: 'photos', area: 'الدور الثاني - لياسة', detected: 49, reported: 55,
        note: 'رصد النظام فرقاً 6% بين نسبة اللياسة المرصودة بصرياً (49%) والنسبة المرفوعة في التقرير (55%). يُنصح بالتحقق ميدانياً قبل اعتماد المستخلص القادم.', severity: 'warn' },
      { id: 'AI3', date: '2026-07-14', source: 'camera', area: 'الميزانين - دكتات التكييف', detected: 38, reported: 40,
        note: 'وتيرة تقدم أعمال الدكتات أبطأ من المخطط بـ 12 يوماً. عند استمرار الوتيرة الحالية سيتأخر تسليم الميزانين إلى نوفمبر.', severity: 'warn' },
      { id: 'AI4', date: '2026-07-12', source: 'photos', area: 'القبو - غرفة المضخات', detected: 70, reported: 70,
        note: 'تركيب مضخات الحريق يسير وفق الجدول. يُنصح بجدولة اختبار التشغيل خلال أسبوعين.', severity: 'ok' },
      { id: 'AI5', date: '2026-07-10', source: 'camera', area: 'الموقع العام', detected: null, reported: null,
        note: 'تنبيه سلامة: رصدت الكاميرا 2 عمالة دون أحزمة أمان على حافة الدور الثالث يوم 10 يوليو الساعة 10:42 صباحاً. تم إشعار مدير السلامة.', severity: 'alert' },
      { id: 'AI6', date: '2026-07-08', source: 'analysis', area: 'مالي', detected: null, reported: null,
        note: 'تنبيه مالي: مقاول الحريق (أنظمة الأمان) استلم 46% من قيمة العقد مقابل إنجاز فعلي 31%. يُنصح بمراجعة الدفعات القادمة وربطها بمستخلصات موثقة بصرياً.', severity: 'alert' }
    ];

    // ============ صور الموقع (مع تحليل AI محاكى) ============
    db.photos = [
      { id: 'PH1', date: '2026-07-16', area: 'F4', title: 'صب سقف الدور الرابع', ai: 'خرسانة حديثة الصب - اكتشاف 4 عمال، معدات صب مكتملة', detected: 78 },
      { id: 'PH2', date: '2026-07-15', area: 'GF', title: 'رخام البهو الرئيسي', ai: 'تقدم التبليط 62% من مساحة البهو', detected: 62 },
      { id: 'PH3', date: '2026-07-14', area: 'F2', title: 'لياسة الجناح الغربي', ai: 'اللياسة المنجزة 49% من مساحة الجدران المرصودة', detected: 49 },
      { id: 'PH4', date: '2026-07-12', area: 'B1', title: 'غرفة مضخات الحريق', ai: 'مضختان مركبتان - التوصيلات 70%', detected: 70 }
    ];

    // ============ سجل الرسائل (واتساب / إيميل) ============
    db.messages = [
      { id: 'MSG1', channel: 'whatsapp', to: '0501234567', date: '2026-07-15 09:00', title: 'التقرير الأسبوعي', status: 'sent' },
      { id: 'MSG2', channel: 'email', to: 'owner@example.com', date: '2026-07-01 08:30', title: 'التقرير الشهري - يونيو', status: 'sent' }
    ];

    db.notifications = [];
    db.meta = { seq: 1000, seededAt: '2026-07-18' };

    return db;
  }

  return { buildSeed: buildSeed, FLOORS: FLOORS, DISCIPLINES: DISCIPLINES };
});
