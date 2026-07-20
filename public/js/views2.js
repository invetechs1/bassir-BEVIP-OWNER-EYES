/** بصير | صفحات الاستشاري والمقاول والإدارة */
(function () {
  'use strict';

  const VS = window.ViewsShared;
  const esc = VS.esc, pill = VS.pill, money = VS.money, toast = VS.toast, modal = VS.modal, discOf = VS.discOf;

  I18n.registerDict({
    'المخططات التنفيذية': 'Shop Drawings',
    'الجداول الزمنية': 'Schedules',
    'المواد والداتا شيت': 'Materials & Data Sheets',
    'طلبات الاستلام': 'Work Inspection Requests',
    'أوامر التغيير': 'Change Orders',
    'المستخلصات': 'Payment Certificates',
    'القرار يُوقَّع إلكترونياً باسم الاستشاري ويُشعَر به المقاول': 'The decision is signed electronically on behalf of the consultant and the contractor is notified',
    'المرجع': 'Reference',
    'العنوان': 'Title',
    'المقاول': 'Contractor',
    'القيمة / الأيام': 'Value / Days',
    'القيمة': 'Value',
    'التاريخ': 'Date',
    'الحالة': 'Status',
    'الملاحظات / التوقيع': 'Notes / Signature',
    'الموقع: ': 'Location: ',
    ' يوم': ' days',
    'مراجعة وقرار': 'Review & Decide',
    'لا توجد طلبات في هذا القسم': 'No requests in this section',
    'مراجعة: ': 'Review: ',
    ' · القيمة ': ' · Value ',
    'بنود جدول الكميات في هذا المستخلص:': 'BOQ items in this payment certificate:',
    ' ← إنجاز ': ' ← progress ',
    '💡 عند الاعتماد ستتحدث نسب هذه البنود تلقائياً وتتحول مناطقها في المخططات من داكنة إلى ساطعة.': '💡 Once approved, these item percentages will update automatically and their zones in the drawings will turn from dim to bright.',
    'القرار': 'Decision',
    '✅ اعتماد': '✅ Approve',
    '📝 اعتماد مع ملاحظات': '📝 Approve with notes',
    '❌ رفض وإرجاع للمقاول': '❌ Reject and return to contractor',
    'الملاحظات': 'Notes',
    'اكتب ملاحظاتك للمقاول...': "Write your notes for the contractor...",
    'توقيع إلكتروني باسم: ': 'Electronic signature on behalf of: ',
    'تأكيد القرار': 'Confirm Decision',
    'إلغاء': 'Cancel',
    'يلزم التوقيع الإلكتروني لتأكيد القرار': 'Electronic signature is required to confirm the decision',
    '✅ تم تسجيل القرار وتوقيعه وإشعار المقاول': '✅ Decision recorded, signed, and contractor notified',
    '👷 مقاولو المشروع': '👷 Project Contractors',
    'التخصص': 'Discipline',
    'قيمة العقد': 'Contract Value',
    'المدة': 'Duration',
    'الإنجاز': 'Progress',
    'حساب الدخول': 'Login Account',
    'بلا حساب': 'No account',
    '➕ إضافة مقاول جديد': '➕ Add New Contractor',
    'اسم المقاول': 'Contractor Name',
    'شركة ...': 'Company ...',
    'قيمة العقد (ر.س)': 'Contract Value (SAR)',
    'الجوال': 'Mobile',
    'تاريخ البدء': 'Start Date',
    'تاريخ الانتهاء': 'End Date',
    'بنود جدول الكميات': 'BOQ Items',
    '+ إضافة بند': '+ Add Item',
    'اسم مستخدم للمقاول (لإنشاء حساب دخول)': 'Contractor username (to create a login account)',
    'كلمة المرور (اتركها فارغة للتوليد التلقائي)': 'Password (leave empty to auto-generate)',
    'حفظ المقاول وإنشاء الحساب': 'Save Contractor & Create Account',
    'وصف البند': 'Item description',
    'الوحدة': 'Unit',
    'الكمية': 'Quantity',
    'كمية': 'Quantity',
    'سعر': 'Price',
    'أدخل اسم المقاول': 'Enter the contractor name',
    '✅ تم إنشاء المقاول وحسابه': '✅ Contractor and account created',
    'سلّم هذه البيانات للمقاول للدخول على صفحة المشروع:': 'Hand these details to the contractor to log in to the project page:',
    '👤 اسم المستخدم: ': '👤 Username: ',
    '🔑 كلمة المرور: ': '🔑 Password: ',
    'تم': 'Done',
    '✅ تمت إضافة المقاول': '✅ Contractor added',
    '📊 جدول الكميات BOQ ': '📊 Bill of Quantities (BOQ) ',
    'تحديث نسب الإنجاز هنا يغيّر سطوع المخططات مباشرة': 'Updating progress percentages here directly changes the brightness of the drawings',
    'كل المقاولين': 'All Contractors',
    'القيمة: ': 'Value: ',
    'المنفذ: ': 'Executed: ',
    'الكود': 'Code',
    'البند': 'Item',
    'الدور': 'Floor',
    'سعر الوحدة': 'Unit Price',
    'الإجمالي': 'Total',
    'نسبة الإنجاز': 'Progress %',
    '✅ حُدّث البند — انعكس ذلك على سطوع المخططات': '✅ Item updated — reflected on the brightness of the drawings',
    'منجز': 'Completed',
    'جاري': 'In progress',
    'لم يبدأ': 'Not started',
    '📝 تقرير يومي جديد': '📝 New Daily Report',
    'مشمس 40°': 'Sunny 40°',
    'الطقس': 'Weather',
    'العمالة': 'Manpower',
    'المعدات': 'Equipment',
    'رافعة برجية 2...': 'Tower crane x2...',
    'الأعمال المنفذة (سطر لكل عمل)': 'Works Executed (one line per work)',
    'صب خرسانة...\nلياسة...': 'Concrete pour...\nPlastering...',
    'الصور من الموقع': 'Site Photos',
    'الملفات الداعمة (PDF / Excel)': 'Supporting Files (PDF / Excel)',
    'حفظ التقرير اليومي': 'Save Daily Report',
    '🗄️ أرشيف التقارير اليومية': '🗄️ Daily Reports Archive',
    'عمالة: ': 'Manpower: ',
    '🗓️ تقرير أسبوعي جديد': '🗓️ New Weekly Report',
    'أسبوع يبدأ من': 'Week starting',
    'التقرير الأسبوعي - الأسبوع ...': 'Weekly Report - Week ...',
    'الإنجاز الفعلي %': 'Actual Progress %',
    'الإنجاز المخطط %': 'Planned Progress %',
    'ملخص الأسبوع': 'Week Summary',
    'أبرز الإنجازات (سطر لكل بند)': 'Key Achievements (one line per item)',
    'المعوقات (سطر لكل بند)': 'Obstacles (one line per item)',
    'الصور': 'Photos',
    'المرفقات': 'Attachments',
    'حفظ التقرير الأسبوعي': 'Save Weekly Report',
    '🗄️ أرشيف التقارير الأسبوعية': '🗄️ Weekly Reports Archive',
    ' مرفقات': ' attachments',
    '📊 تقرير شهري جديد': '📊 New Monthly Report',
    'الشهر': 'Month',
    'التقرير الشهري - ...': 'Monthly Report - ...',
    'الملخص التنفيذي': 'Executive Summary',
    'الصور والمرفقات': 'Photos & Attachments',
    'حفظ التقرير الشهري': 'Save Monthly Report',
    '🗄️ أرشيف التقارير الشهرية': '🗄️ Monthly Reports Archive',
    '📝 يومي': '📝 Daily',
    '🗓️ أسبوعي': '🗓️ Weekly',
    '📊 شهري': '📊 Monthly',
    'أدخل عنوان التقرير': 'Enter the report title',
    '✅ حُفظ التقرير اليومي': '✅ Daily report saved',
    '✅ حُفظ التقرير الأسبوعي': '✅ Weekly report saved',
    '✅ حُفظ التقرير الشهري': '✅ Monthly report saved',
    '🏗️ مشاريع المالك': "🏗️ Owner's Projects",
    ' · الميزانية ': ' · Budget ',
    '👨‍💼 الاستشاري: ': '👨‍💼 Consultant: ',
    'لم يعيّن': 'Not assigned',
    '➕ إضافة مشروع وتعيين استشاري': '➕ Add Project & Assign Consultant',
    'اسم المشروع': 'Project Name',
    'برج / فيلا / مجمع...': 'Tower / Villa / Complex...',
    'الموقع': 'Location',
    'المدينة - الحي': 'City - District',
    'الميزانية التقديرية (ر.س)': 'Estimated Budget (SAR)',
    'المكتب الاستشاري': 'Consulting Office',
    'اسم المكتب الهندسي': 'Engineering office name',
    'اسم مستخدم الاستشاري': 'Consultant Username',
    'كلمة المرور': 'Password',
    'تلقائية إن تُركت': 'Auto-generated if left empty',
    'إنشاء المشروع وحساب الاستشاري': 'Create Project & Consultant Account',
    'أدخل اسم المشروع': 'Enter the project name',
    '✅ أُنشئ المشروع وحساب الاستشاري': '✅ Project and consultant account created',
    'بيانات دخول الاستشاري:': "Consultant login details:",
    '✅ أُنشئ المشروع': '✅ Project created',
    'مدير النظام': 'System Admin',
    'المالك': 'Owner',
    'ممثل المالك': "Owner's Representative",
    'الاستشاري': 'Consultant',
    'مقاول': 'Contractor',
    'مالك المشروع: اطلاع فقط على مشروعه المسند إليه — عين المالك، رؤية المشروع، الكاميرات، المقاولون، ذكاء بصير، التقارير. لا يضيف ولا يعدل شيئاً.':
      'Project owner: view-only access to their assigned project — Owner\'s Eye, Project Vision, Cameras, Contractors, Bassir AI, Reports. Cannot add or edit anything.',
    'ممثل المالك: يطلع على كامل ملفات ومعلومات جميع المشاريع + سجل النظام، ويضيف المشاريع ويعين الاستشاريين وينشئ المستخدمين ويرسل التقارير.':
      "Owner's representative: views the full files and information of all projects + system log, adds projects, assigns consultants, creates users, and sends reports.",
    'الاستشاري (المكتب الفني): الاعتمادات والتوقيع، خدمات المكتب الفني الـ12، جداول الكميات، إدارة المقاولين وحساباتهم، المخططات والنماذج، التقارير، الكاميرات والتكامل. يمكن قصره على مشاريع محددة.':
      'Consultant (technical office): approvals & signing, the 12 technical office services, BOQ, contractor management and accounts, drawings & models, reports, cameras and integrations. Can be restricted to specific projects.',
    'المقاول: يرى عقده وبنوده ومبالغه فقط، يرفع طلباته (مخططات، مواد، استلامات، مستخلصات، RFI...) ويتابع قراراتها، ويستقبل ما يوجهه له المكتب الفني.':
      'Contractor: sees only their contract, items, and amounts, submits requests (drawings, materials, inspections, payment certificates, RFIs...) and tracks their decisions, and receives what the technical office directs to them.',
    'أدمن النظام: كل الصفحات والصلاحيات + إدارة المستخدمين والحذف + سجل النظام + التكامل والإعدادات.':
      'System admin: all pages and permissions + user management and deletion + system log + integrations and settings.',
    'غير مربوط بمقاول!': 'Not linked to a contractor!',
    'لم يُسند لمشروع!': 'Not assigned to a project!',
    'جميع المشاريع': 'All Projects',
    '🛡️ مستويات النظام وصلاحياتها': '🛡️ System Roles & Permissions',
    '👥 مستخدمو النظام ': '👥 System Users ',
    'كلمات المرور مشفرة ولا تظهر لأحد': 'Passwords are encrypted and shown to no one',
    'الاسم': 'Name',
    'اسم المستخدم': 'Username',
    'النطاق': 'Scope',
    'حذف': 'Delete',
    '➕ إضافة مستخدم': '➕ Add User',
    'م. فلان الفلاني': 'Eng. Jane Doe',
    'الاسم الكامل': 'Full Name',
    'إنشاء المستخدم وتسليم بياناته': 'Create User & Hand Over Credentials',
    'ربط بالمقاول': 'Link to Contractor',
    'مشروع المالك (يرى صفحة مشروعه فقط)': "Owner's project (sees only their project page)",
    'المشاريع المسندة (اتركها كلها فارغة = جميع المشاريع)': 'Assigned projects (leave all empty = all projects)',
    'أدخل الاسم واسم المستخدم': 'Enter the name and username',
    'حدد مشروع المالك — المالك يرى صفحة مشروعه': "Select the owner's project — the owner sees their project page",
    '✅ أُنشئ الحساب — سلّم هذه البيانات لصاحبها': '✅ Account created — hand these details to its owner',
    'كلمة المرور تظهر الآن مرة واحدة فقط ولا يمكن استرجاعها لاحقاً (مشفرة في النظام)': 'The password is shown now only once and cannot be retrieved later (encrypted in the system)',
    'تم التسليم': 'Handed Over',
    'حذف هذا المستخدم؟': 'Delete this user?',
    'حُذف المستخدم': 'User deleted',
    'دخول': 'Login',
    'إضافة': 'Create',
    'تعديل': 'Update',
    'قرار اعتماد': 'Approval decision',
    'إرسال تقرير': 'Send report',
    'رفع ملف': 'Upload file',
    'لقطة كاميرا': 'Camera snapshot',
    '📜 سجل النظام ': '📜 System Log ',
    'توثيق كامل: من فعل ماذا ومتى — ': 'Full audit trail: who did what, when — ',
    ' حدث': ' events',
    '🔍 بحث بالاسم أو العملية...': '🔍 Search by name or action...',
    'الكل': 'All',
    'الوقت': 'Time',
    'المستخدم': 'User',
    'العملية': 'Action',
    'التفاصيل': 'Details',
    'لا أحداث مطابقة': 'No matching events',
    '🏢 رفع نموذج BIM': '🏢 Upload BIM Model',
    'ارفع نموذج المشروع (IFC / RVT / NWD) ليُعرض للمالك في صفحة "رؤية المشروع" مربوطاً بجدول الكميات.':
      'Upload the project model (IFC / RVT / NWD) to be displayed to the owner on the "Project Vision" page, linked to the BOQ.',
    'ملف النموذج': 'Model File',
    'إصدار النموذج': 'Model Version',
    'رفع النموذج وربطه بجدول الكميات': 'Upload Model & Link to BOQ',
    'النموذج الحالي: BassirTower_Rev03.ifc · رُفع 2026-06-12 · مرتبط بـ ': 'Current model: BassirTower_Rev03.ifc · uploaded 2026-06-12 · linked to ',
    ' بند': ' items',
    '🔗 حالة ربط جدول الكميات بالنموذج': '🔗 BOQ-to-Model Linking Status',
    ' بند مربوط ': ' items linked ',
    '💡 كل بند كميات مربوط بعناصر النموذج، فيتلوّن العنصر ساطعاً في عرض المالك عند اكتمال البند واعتماد مستخلصه.':
      "💡 Every BOQ item is linked to model elements, so the element lights up bright in the owner's view once the item is complete and its payment certificate is approved.",
    '📐 سجل مخططات المشروع ': '📐 Project Drawings Log ',
    'كل مخطط يرتبط بدور وتخصص وجدول كمياته — فيظهر داكناً/ساطعاً للمالك حسب التنفيذ':
      "Each drawing is linked to a floor, a discipline, and its BOQ — so it appears dim/bright to the owner according to execution",
    'اسم المخطط': 'Drawing Name',
    'المسقط المعماري - ...': 'Architectural plan - ...',
    'الواجهات': 'Elevations',
    'الملف': 'File',
    '➕ رفع المخطط وربطه بجدول الكميات': '➕ Upload Drawing & Link to BOQ',
    'المخطط': 'Drawing',
    'الربط': 'Linking',
    'مربوط بجدول الكميات ✓': 'Linked to BOQ ✓',
    'اختر ملف النموذج أولاً': 'Select the model file first',
    '✅ رُفع النموذج "': '✅ Model "',
    '" وربط بجدول الكميات — أصبح مرئياً للمالك في صفحة رؤية المشروع': '" uploaded and linked to the BOQ — now visible to the owner on the Project Vision page',
    'أدخل اسم المخطط': 'Enter the drawing name',
    '✅ رُفع المخطط وربط بجدول كميات الدور — سيظهر للمالك في رؤية المشروع': "✅ Drawing uploaded and linked to the floor's BOQ — will appear to the owner in Project Vision",
    'استفسارات RFI': 'RFI Inquiries',
    'أساليب التنفيذ وITP': 'Method Statements & ITP',
    'المطالبات وEOT': 'Claims & EOT',
    'لا يوجد عقد مرتبط بحسابك': 'No contract is linked to your account',
    'عقد ': 'Contract ',
    'المخطط ': 'Planned ',
    'متأخر': 'Delayed',
    'ضمن الجدول': 'On schedule',
    'المبالغ المستلمة': 'Amounts Received',
    '% من قيمة العقد': '% of contract value',
    'طلبات قيد المراجعة': 'Requests Under Review',
    'لدى الاستشاري': 'With the consultant',
    '➕ رفع طلب جديد': '➕ Submit New Request',
    'لا طلبات بعد — ارفع أول طلب': 'No requests yet — submit your first request',
    'رد الاستشاري': "Consultant's Reply",
    'تمديد +': 'Extension +',
    'خطة فحص ITP': 'ITP Inspection Plan',
    '🚫 تقارير عدم المطابقة الموجهة لك': '🚫 NCRs Directed to You',
    '📢 تعليمات موقعية': '📢 Site Instructions',
    '📌 ملاحظات التسليم المطلوب إغلاقها': '📌 Handover Snags to Close',
    '🦺 ملاحظات السلامة': '🦺 Safety Notes',
    '🧪 نتائج اختبارات موادك': '🧪 Your Material Test Results',
    '📥 موجه إليك من المكتب الفني': '📥 Directed to You from the Technical Office',
    '➕ رفع ': '➕ Submit ',
    'سيصل الطلب للاستشاري للمراجعة والاعتماد أو الرفض': 'The request will reach the consultant for review, approval, or rejection',
    'رقم المرجع': 'Reference Number',
    'العنوان / الوصف': 'Title / Description',
    'نص الاستفسار الفني': 'Technical Inquiry Text',
    'اشرح التعارض أو المعلومة المطلوبة مع ذكر رقم المخطط...': 'Explain the conflict or information needed, citing the drawing number...',
    'النوع': 'Type',
    'أسلوب تنفيذ MS': 'Method Statement (MS)',
    'نوع المطالبة': 'Claim Type',
    'تمديد مدة EOT': 'Extension of Time (EOT)',
    'مطالبة مالية': 'Financial Claim',
    'القيمة (ر.س)': 'Value (SAR)',
    'الأيام الإضافية المطلوبة': 'Additional Days Requested',
    'الموقع / الدور': 'Location / Floor',
    'بنود المستخلص (اختر البند والنسبة المنجزة الجديدة)': 'Payment certificate items (select the item and the new completed percentage)',
    'المرفقات (المخطط / الداتا شيت / المستندات)': 'Attachments (drawing / data sheet / documents)',
    'إرسال للاستشاري': 'Send to Consultant',
    ' — ': ' — ',
    ' (حالياً ': ' (currently ',
    '% الجديدة': 'new %',
    'أدخل عنوان الطلب': 'Enter the request title',
    '✅ أُرسل الطلب للاستشاري': '✅ Request sent to the consultant',
    'مخالفة سلامة': 'Safety Violation',
    'حادث': 'Incident',
    'ملاحظة وقائية': 'Preventive Observation',
    'منخفضة': 'Low',
    'متوسطة': 'Medium',
    'عالية': 'High',
    'ثانوية': 'Minor',
    'جوهرية': 'Major',
    'حرجة': 'Critical',
    'مخططات كما نُفذ': 'As-Built Drawings',
    'كتيبات تشغيل وصيانة': 'O&M Manuals',
    'شهادات ضمان': 'Warranty Certificates',
    'فترة الضمان DLP': 'Defects Liability Period (DLP)',
    'الاستفسارات الفنية RFI': 'Technical Inquiries (RFI)',
    'الرد على استفسارات المقاولين وحسم تعارضات المخططات والمواصفات': "Responding to contractors' inquiries and resolving conflicts in drawings and specifications",
    'الاستفسار': 'Inquiry',
    'الرد الفني': 'Technical Reply',
    'بانتظار الرد': 'Awaiting reply',
    'الموضوع': 'Subject',
    'نص الاستفسار': 'Inquiry Text',
    '↩️ رد فني': '↩️ Technical Reply',
    'الرد الفني على الاستفسار': 'Technical reply to the inquiry',
    'عدم المطابقة NCR': 'Non-Conformance (NCR)',
    'رصد الأعمال المخالفة للمواصفات ومتابعة الإجراءات التصحيحية حتى الإغلاق': 'Recording work that violates specifications and tracking corrective actions until closure',
    'المخالفة': 'Violation',
    'الخطورة': 'Severity',
    'الإجراء التصحيحي': 'Corrective Action',
    'عنوان المخالفة': 'Violation Title',
    'وصف عدم المطابقة': 'Non-Conformance Description',
    '✅ إغلاق': '✅ Close',
    'الإجراء التصحيحي المنفذ': 'Corrective action taken',
    'التعليمات الموقعية': 'Site Instructions',
    'إصدار تعليمات ملزمة للمقاولين ومتابعة تنفيذها': "Issuing binding instructions to contractors and tracking their execution",
    'التعليمات': 'Instructions',
    'عنوان التعليمات': 'Instruction Title',
    'التفاصيل': 'Details',
    '✔ تم التنفيذ': '✔ Executed',
    'اعتماد بيانات طرق التنفيذ وخطط الفحص والاختبار المقدمة من المقاولين': "Approving method statements and inspection/testing plans submitted by contractors",
    'العنوان': 'Title',
    'اختبارات المواد': 'Material Tests',
    'توثيق نتائج الاختبارات المعملية والحقلية (خرسانة، تربة، ضغط، شد...)': 'Documenting laboratory and field test results (concrete, soil, compression, tension...)',
    'الاختبار': 'Test',
    'المطلوب / النتيجة': 'Required / Result',
    'المطلوب: ': 'Required: ',
    'النتيجة: ': 'Result: ',
    'الحكم': 'Verdict',
    'المختبر': 'Laboratory',
    'القيمة المطلوبة': 'Required Value',
    'ناجح': 'Pass',
    'راسب': 'Fail',
    'محاضر الاجتماعات': 'Minutes of Meeting',
    'محاضر اجتماعات التنسيق الأسبوعية وقراراتها': 'Weekly coordination meeting minutes and their decisions',
    'الاجتماع': 'Meeting',
    'الحضور: ': 'Attendance: ',
    'أبرز البنود والقرارات': 'Key Items & Decisions',
    'عنوان الاجتماع': 'Meeting Title',
    'الحضور': 'Attendance',
    'البنود (سطر لكل بند)': 'Items (one line per item)',
    'قوائم الملاحظات': 'Snag Lists',
    'ملاحظات الاستلام الابتدائي (Snag List) ومتابعة إغلاقها قبل التسليم': 'Initial handover snags and tracking their closure before handover',
    'الملاحظة': 'Note',
    'وصف الملاحظة': 'Note Description',
    'السلامة HSE': 'Safety (HSE)',
    'مخالفات وحوادث وملاحظات السلامة والصحة المهنية بالموقع': 'Site health & safety violations, incidents, and observations',
    'التقرير': 'Report',
    'مخالفة': 'Violation',
    'اعتماد وتوقيع': 'Approve & Sign',
    'دراسة مطالبات المقاولين المالية وطلبات تمديد المدة والتوصية بشأنها': "Reviewing contractors' financial claims and time extension requests and making recommendations",
    'المطالبة': 'Claim',
    'القيمة / المدة': 'Value / Duration',
    'الأيام المطلوبة': 'Days Requested',
    'الهندسة القيمية': 'Value Engineering',
    'دراسة مقترحات خفض التكلفة مع الحفاظ على الجودة والوظيفة': 'Reviewing cost-reduction proposals while maintaining quality and function',
    'المقترح': 'Proposal',
    'الوفر المتوقع': 'Expected Savings',
    'الوفر المتوقع (ر.س)': 'Expected Savings (SAR)',
    'التسليم والإغلاق': 'Handover & Closeout',
    'مخططات كما نُفذ، كتيبات التشغيل والصيانة، الضمانات، ومتابعة فترة الضمان': 'As-built drawings, O&M manuals, warranties, and tracking the defects liability period',
    'المستند': 'Document',
    'كتيبات O&M': 'O&M Manuals',
    'ملاحظة فترة ضمان DLP': 'DLP Note',
    'المراسلات': 'Correspondence Log',
    'سجل الخطابات الصادرة والواردة الرسمية للمشروع': 'Log of official outgoing and incoming correspondence for the project',
    'الاتجاه': 'Direction',
    'صادر ↗': 'Outgoing ↗',
    'وارد ↙': 'Incoming ↙',
    'الخطاب': 'Letter',
    'الجهة': 'Party',
    'من: ': 'From: ',
    'إلى: ': 'To: ',
    'صادر': 'Outgoing',
    'وارد': 'Incoming',
    'اكتب النص أولاً': 'Write the text first',
    '✅ تم الاعتماد والتوقيع': '✅ Approved and signed',
    '➕ إضافة: ': '➕ Add: ',
    'حفظ': 'Save',
    'أدخل العنوان': 'Enter the title',
    '✅ تمت الإضافة': '✅ Added',
    '✅ تم تحديث الحالة وتوقيعها': '✅ Status updated and signed',
    '❓ استفسارات مفتوحة': '❓ Open Inquiries',
    '🚫 NCR مفتوحة': '🚫 Open NCRs',
    '✍️ قرارات معلقة': '✍️ Pending Decisions',
    '📌 ملاحظات مفتوحة': '📌 Open Snags',
    '🧪 اختبارات راسبة': '🧪 Failed Tests',
    '🦺 سلامة مفتوحة': '🦺 Open Safety Items',
    '➕ إضافة': '➕ Add',
    'لا سجلات بعد': 'No records yet',
    'قاعدة البيانات': 'Database',
    'ملف JSON': 'JSON file',
    'كتابة معاملاتية WAL · للترقية إلى PostgreSQL انظر server/storage.js': 'WAL transactional writes · to upgrade to PostgreSQL see server/storage.js',
    'تخزين الملفات': 'File Storage',
    ' ملف مرفوع': ' files uploaded',
    'رفع فعلي إلى data/uploads — الصور والمخططات والمستندات': 'Real uploads to data/uploads — photos, drawings, and documents',
    'الذكاء الاصطناعي': 'AI',
    'ثبّت @anthropic-ai/sdk': 'Install @anthropic-ai/sdk',
    'أضف ANTHROPIC_API_KEY': 'Add ANTHROPIC_API_KEY',
    'تحليل حقيقي لصور الموقع ولقطات الكاميرات': 'Real analysis of site photos and camera snapshots',
    'البريد الإلكتروني': 'Email',
    'متصل (': 'Connected (',
    'محاكاة': 'Simulated',
    'واتساب': 'WhatsApp',
    'WHATSAPP_TOKEN + WHATSAPP_PHONE_ID من Meta Business': 'WHATSAPP_TOKEN + WHATSAPP_PHONE_ID from Meta Business',
    'مدخل الكاميرات': 'Camera Ingest',
    'يستقبل اللقطات': 'Receiving snapshots',
    'أضف CAMERA_KEY': 'Add CAMERA_KEY',
    'الكاميرا/NVR تدفع لقطة JPEG كل فترة ويحللها الذكاء الاصطناعي': 'The camera/NVR pushes a JPEG snapshot periodically and the AI analyzes it',
    'البث المباشر RTSP': 'Live RTSP Stream',
    'خادم الوسائط متصل': 'Media server connected',
    'أضف MEDIA_SERVER_URL': 'Add MEDIA_SERVER_URL',
    'MediaMTX يحول RTSP إلى بث حي داخل صفحة الكاميرات': 'MediaMTX converts RTSP into a live stream inside the cameras page',
    'جارٍ فحص حالة الخدمات...': 'Checking service status...',
    '⚙️ التكامل والإعدادات': '⚙️ Integrations & Settings',
    'أنت في وضع الديمو داخل المتصفح.': 'You are in browser demo mode.',
    'حالة التكامل الفعلية (قاعدة البيانات، البريد، واتساب، الذكاء الاصطناعي، الكاميرات)': 'The actual integration status (database, email, WhatsApp, AI, cameras)',
    'تظهر عند تشغيل نسخة الخادم: ': 'appears when running the server version: ',
    '🔧 التهيئة (ملف .env بجذر المشروع)': '🔧 Configuration (.env file at the project root)',
    'بعد التعديل أعد تشغيل الخادم. أي خدمة غير مهيأة تعمل تلقائياً بوضع المحاكاة.': 'After editing, restart the server. Any unconfigured service automatically runs in simulation mode.',
    '🎥 ربط كاميرات الموقع فعلياً': '🎥 Actually Connecting Site Cameras',
    'أي كاميرا أو جهاز تسجيل NVR يدعم الدفع عبر HTTP يرسل لقطاته للنظام، ويحللها ذكاء بصير تلقائياً:': 'Any camera or NVR device that supports HTTP push sends its snapshots to the system, and Bassir AI analyzes them automatically:',
    'تُحفظ اللقطة في سجل الصور، وإن كان الذكاء الاصطناعي مهيأً تُحلل فوراً وتضاف نتيجتها إلى رؤى بصير مع مقارنتها بنسب الاستشاري.':
      "The snapshot is saved to the photo log, and if AI is configured it is analyzed immediately and its result is added to Bassir's insights and compared against the consultant's percentages.",
    '📡 البث المباشر RTSP': '📡 Live RTSP Stream',
    'مقاولو المشروع': 'Project Contractors',
    'إضافة مقاول جديد': 'Add New Contractor',
    'تم إنشاء المقاول وحسابه': 'Contractor and account created',
    'إضافة مشروع وتعيين استشاري': 'Add Project & Assign Consultant',
    'أُنشئ المشروع وحساب الاستشاري': 'Project and consultant account created',
    'مستويات النظام وصلاحياتها': 'System Roles & Permissions',
    'مستخدمو النظام ': 'System Users ',
    'إضافة مستخدم': 'Add User',
    'أُنشئ الحساب — سلّم هذه البيانات لصاحبها': 'Account created — hand these details to its owner',
    '✍️ قرار': '✍️ Decision',
    '# الذكاء الاصطناعي (تحليل الصور)\nANTHROPIC_API_KEY=sk-ant-...\n\n# البريد\nRESEND_API_KEY=re_...\nEMAIL_FROM=Bassir &lt;reports@yourdomain.com&gt;\n\n# واتساب (Meta Cloud API)\nWHATSAPP_TOKEN=EAAG...\nWHATSAPP_PHONE_ID=1234567890\n\n# مدخل لقطات الكاميرات\nCAMERA_KEY=مفتاح-سري-طويل\n\n# التخزين\nSTORAGE=sqlite\nJWT_SECRET=سر-الإنتاج':
      '# AI (image analysis)\nANTHROPIC_API_KEY=sk-ant-...\n\n# Email\nRESEND_API_KEY=re_...\nEMAIL_FROM=Bassir &lt;reports@yourdomain.com&gt;\n\n# WhatsApp (Meta Cloud API)\nWHATSAPP_TOKEN=EAAG...\nWHATSAPP_PHONE_ID=1234567890\n\n# Camera snapshot ingest\nCAMERA_KEY=long-secret-key\n\n# Storage\nSTORAGE=sqlite\nJWT_SECRET=production-secret',
    '1) ثبّت ': '1) Install ',
    ' على السيرفر (ملف تنفيذي واحد).<br>2) أضف كل كاميرا في mediamtx.yml بمسار يطابق حقل "مسار البث":': ' on the server (a single executable file).<br>2) Add each camera in mediamtx.yml with a path matching the "stream path" field:',
    '3) ضع MEDIA_SERVER_URL=http://السيرفر:8888 في .env — فيظهر البث الحي مباشرة داخل بطاقات صفحة الكاميرات للمالك.':
      "3) Set MEDIA_SERVER_URL=http://server:8888 in .env — the live stream then appears directly in the camera cards on the owner's page."
  });

  const APPROVAL_TABS = [
    { col: 'shopDrawings', name: 'المخططات التنفيذية', icon: '📐' },
    { col: 'scheduleSubmittals', name: 'الجداول الزمنية', icon: '🗓️' },
    { col: 'materials', name: 'المواد والداتا شيت', icon: '🧱' },
    { col: 'wirs', name: 'طلبات الاستلام', icon: '✅' },
    { col: 'changeOrders', name: 'أوامر التغيير', icon: '🔁' },
    { col: 'payments', name: 'المستخلصات', icon: '💰' }
  ];

  function contractorName(ctx, id) {
    const c = ctx.S.contractors.find(function (x) { return x.id === id; });
    return c ? c.name : id || '—';
  }

  // ============ صفحة اعتمادات الاستشاري ============
  const apprState = { tab: 'shopDrawings' };

  function renderApprovals(el, ctx) {
    const tab = apprState.tab;
    const items = (ctx.S[tab] || []).slice().sort(function (a, b) {
      return (a.status === 'pending' ? 0 : 1) - (b.status === 'pending' ? 0 : 1);
    });

    el.innerHTML =
      '<div class="tabs">' + APPROVAL_TABS.map(function (t) {
        const pending = (ctx.S[t.col] || []).filter(function (x) { return x.status === 'pending'; }).length;
        return '<div class="tab ' + (tab === t.col ? 'active' : '') + '" data-atab="' + t.col + '">' + t.icon + ' ' + I18n.t(t.name) +
          (pending ? '<span class="n">' + pending + '</span>' : '') + '</div>';
      }).join('') + '</div>' +

      '<div class="card"><h3>' + (APPROVAL_TABS.find(function (t) { return t.col === tab; }) || {}).icon + ' ' +
      esc(I18n.t((APPROVAL_TABS.find(function (t) { return t.col === tab; }) || {}).name)) +
      ' <span class="hint">' + I18n.t('القرار يُوقَّع إلكترونياً باسم الاستشاري ويُشعَر به المقاول') + '</span></h3>' +
      (items.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
        '<th>' + I18n.t('المرجع') + '</th><th>' + I18n.t('العنوان') + '</th><th>' + I18n.t('المقاول') + '</th>' +
        (tab === 'changeOrders' ? '<th>' + I18n.t('القيمة / الأيام') + '</th>' : '') +
        (tab === 'payments' ? '<th>' + I18n.t('القيمة') + '</th>' : '') +
        '<th>' + I18n.t('التاريخ') + '</th><th>' + I18n.t('الحالة') + '</th><th>' + I18n.t('الملاحظات / التوقيع') + '</th><th></th></tr></thead><tbody>' +
        items.map(function (it) {
          return '<tr>' +
            '<td class="num small"><b>' + esc(it.ref) + '</b>' + (it.file ? '<br><span class="muted">📎 ' + VS.att(it.file) + '</span>' : '') + '</td>' +
            '<td>' + esc(it.title) + (it.location ? '<div class="small muted">' + I18n.t('الموقع: ') + esc(VS.floorName(ctx, it.location)) + '</div>' : '') + '</td>' +
            '<td class="small">' + esc(contractorName(ctx, it.contractorId)) + '</td>' +
            (tab === 'changeOrders' ? '<td>' + money(it.amount) + '<div class="small muted num">+' + (it.days || 0) + I18n.t(' يوم') + '</div></td>' : '') +
            (tab === 'payments' ? '<td>' + money(it.amount) + '</td>' : '') +
            '<td class="small muted num">' + esc(it.date) + '</td>' +
            '<td>' + pill(it.status) + '</td>' +
            '<td class="small" style="max-width:220px">' + (it.notes ? esc(it.notes) : '<span class="muted">—</span>') +
            (it.signature ? '<div class="sig">✍️ ' + esc(it.signature) + ' · ' + esc(it.signDate) + '</div>' : '') + '</td>' +
            '<td>' + (it.status === 'pending' ? '<button class="btn sm" data-review="' + it.id + '">' + I18n.t('مراجعة وقرار') + '</button>' : '') + '</td>' +
            '</tr>';
        }).join('') + '</tbody></table></div>'
        : '<div class="empty"><div class="e-ico">📭</div>' + I18n.t('لا توجد طلبات في هذا القسم') + '</div>') +
      '</div>';

    el.querySelectorAll('[data-atab]').forEach(function (t) {
      t.addEventListener('click', function () { apprState.tab = t.getAttribute('data-atab'); renderApprovals(el, ctx); });
    });
    el.querySelectorAll('[data-review]').forEach(function (b) {
      b.addEventListener('click', function () {
        const it = items.find(function (x) { return x.id === b.getAttribute('data-review'); });
        openReviewModal(ctx, tab, it);
      });
    });
  }

  function openReviewModal(ctx, collection, it) {
    const isPayment = collection === 'payments';
    const m = modal(
      '<h3>' + I18n.t('مراجعة: ') + esc(it.title) + '</h3>' +
      '<div class="m-sub">' + esc(it.ref) + ' · ' + esc(contractorName(ctx, it.contractorId)) +
      (it.amount ? I18n.t(' · القيمة ') + money(it.amount) : '') + '</div>' +
      (isPayment && (it.lines || []).length ?
        '<div class="card" style="padding:12px;margin-bottom:10px"><b class="small">' + I18n.t('بنود جدول الكميات في هذا المستخلص:') + '</b>' +
        it.lines.map(function (l) {
          const bq = ctx.S.boqItems.find(function (b) { return b.id === l.boqItemId; });
          return '<div class="small muted" style="margin-top:6px">• ' + (bq ? esc(bq.description) + ' (' + esc(bq.floor) + ')' : l.boqItemId) + I18n.t(' ← إنجاز ') + '<b class="num" style="color:var(--ok)">' + l.progress + '%</b></div>';
        }).join('') +
        '<div class="small mt" style="color:var(--accent2)">' + I18n.t('💡 عند الاعتماد ستتحدث نسب هذه البنود تلقائياً وتتحول مناطقها في المخططات من داكنة إلى ساطعة.') + '</div></div>' : '') +
      '<label class="fl">' + I18n.t('القرار') + '</label>' +
      '<select class="inp" id="rv-status">' +
      '<option value="approved">' + I18n.t('✅ اعتماد') + '</option>' +
      '<option value="approved_notes">' + I18n.t('📝 اعتماد مع ملاحظات') + '</option>' +
      '<option value="rejected">' + I18n.t('❌ رفض وإرجاع للمقاول') + '</option></select>' +
      '<label class="fl">' + I18n.t('الملاحظات') + '</label><textarea class="inp" id="rv-notes" placeholder="' + I18n.t('اكتب ملاحظاتك للمقاول...') + '"></textarea>' +
      '<label class="fl flex" style="cursor:pointer"><input type="checkbox" id="rv-sign" checked> ' + I18n.t('توقيع إلكتروني باسم: ') + '<b style="color:var(--accent2)">' + esc(ctx.U.name) + '</b></label>' +
      '<div class="m-actions"><button class="btn" id="rv-ok">' + I18n.t('تأكيد القرار') + '</button><button class="btn mutedb" id="rv-cancel">' + I18n.t('إلغاء') + '</button></div>'
    );
    m.querySelector('#rv-cancel').addEventListener('click', function () { m.remove(); });
    m.querySelector('#rv-ok').addEventListener('click', async function () {
      if (!m.querySelector('#rv-sign').checked) { toast(I18n.t('يلزم التوقيع الإلكتروني لتأكيد القرار'), true); return; }
      try {
        await Api.review({
          collection: collection, id: it.id,
          status: m.querySelector('#rv-status').value,
          notes: m.querySelector('#rv-notes').value
        });
        m.remove();
        toast(I18n.t('✅ تم تسجيل القرار وتوقيعه وإشعار المقاول'));
        ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });
  }

  // ============ إدارة المقاولين (الاستشاري) ============
  function renderManageContractors(el, ctx) {
    const sums = VS.summarize(ctx);
    el.innerHTML =
      '<div class="grid" style="grid-template-columns:1.4fr 1fr">' +
      '<div class="card"><h3>👷 ' + I18n.t('مقاولو المشروع') + '</h3><div class="tbl-wrap"><table class="tbl"><thead><tr>' +
      '<th>' + I18n.t('المقاول') + '</th><th>' + I18n.t('التخصص') + '</th><th>' + I18n.t('قيمة العقد') + '</th><th>' + I18n.t('المدة') + '</th><th>' + I18n.t('الإنجاز') + '</th><th>' + I18n.t('حساب الدخول') + '</th></tr></thead><tbody>' +
      sums.map(function (s) {
        const d = discOf(ctx, s.type);
        const acc = (ctx.S.users || []).find(function (u) { return u.contractorId === s.id; });
        return '<tr><td><b>' + esc(s.name) + '</b></td>' +
          '<td>' + d.icon + ' ' + esc(d.name) + '</td>' +
          '<td>' + money(s.contractValue) + '</td>' +
          '<td class="small muted num">' + esc(s.startDate) + '<br>' + esc(s.endDate) + '</td>' +
          '<td><b class="num">' + s.progress + '%</b></td>' +
          '<td class="small">' + (acc ? '👤 <b class="num">' + esc(acc.username) + '</b>' : '<span class="muted">' + I18n.t('بلا حساب') + '</span>') + '</td></tr>';
      }).join('') + '</tbody></table></div></div>' +

      '<div class="card"><h3>➕ ' + I18n.t('إضافة مقاول جديد') + '</h3>' +
      '<label class="fl">' + I18n.t('اسم المقاول') + '</label><input class="inp" id="nc-name" placeholder="' + I18n.t('شركة ...') + '">' +
      '<label class="fl">' + I18n.t('التخصص') + '</label><select class="inp" id="nc-type">' +
      ctx.S.projects[0].disciplines.map(function (d) { return '<option value="' + d.id + '">' + d.icon + ' ' + esc(d.name) + '</option>'; }).join('') + '</select>' +
      '<div class="grid g2"><div><label class="fl">' + I18n.t('قيمة العقد (ر.س)') + '</label><input class="inp num" id="nc-value" type="number" placeholder="1000000"></div>' +
      '<div><label class="fl">' + I18n.t('الجوال') + '</label><input class="inp num" id="nc-phone" placeholder="05xxxxxxxx"></div></div>' +
      '<div class="grid g2"><div><label class="fl">' + I18n.t('تاريخ البدء') + '</label><input class="inp" id="nc-start" type="date"></div>' +
      '<div><label class="fl">' + I18n.t('تاريخ الانتهاء') + '</label><input class="inp" id="nc-end" type="date"></div></div>' +
      '<label class="fl">' + I18n.t('بنود جدول الكميات') + '</label><div id="nc-boq"></div>' +
      '<button class="btn ghost sm" id="nc-addrow">' + I18n.t('+ إضافة بند') + '</button>' +
      '<label class="fl">' + I18n.t('اسم مستخدم للمقاول (لإنشاء حساب دخول)') + '</label><input class="inp" id="nc-user" placeholder="cont-name">' +
      '<label class="fl">' + I18n.t('كلمة المرور (اتركها فارغة للتوليد التلقائي)') + '</label><input class="inp" id="nc-pass" placeholder="••••••••">' +
      '<div class="m-actions"><button class="btn block" id="nc-save">' + I18n.t('حفظ المقاول وإنشاء الحساب') + '</button></div>' +
      '</div></div>';

    const boqWrap = el.querySelector('#nc-boq');
    function addRow() {
      const r = document.createElement('div');
      r.className = 'grid'; r.style.cssText = 'grid-template-columns:2fr 1fr 1fr 1fr 1fr;gap:6px;margin-bottom:6px';
      r.innerHTML = '<input class="inp" placeholder="' + I18n.t('وصف البند') + '" data-f="description">' +
        '<input class="inp" placeholder="' + I18n.t('الوحدة') + '" data-f="unit">' +
        '<input class="inp num" type="number" placeholder="' + I18n.t('كمية') + '" data-f="qty">' +
        '<input class="inp num" type="number" placeholder="' + I18n.t('سعر') + '" data-f="unitPrice">' +
        '<select class="inp" data-f="floor">' + ctx.S.projects[0].floors.map(function (f) { return '<option value="' + f.id + '">' + esc(f.name) + '</option>'; }).join('') + '</select>';
      boqWrap.appendChild(r);
    }
    addRow();
    el.querySelector('#nc-addrow').addEventListener('click', addRow);

    el.querySelector('#nc-save').addEventListener('click', async function () {
      const name = el.querySelector('#nc-name').value.trim();
      if (!name) { toast(I18n.t('أدخل اسم المقاول'), true); return; }
      const boqItems = Array.prototype.map.call(boqWrap.children, function (r) {
        const o = {};
        r.querySelectorAll('[data-f]').forEach(function (i) { o[i.getAttribute('data-f')] = i.value; });
        return o;
      }).filter(function (o) { return o.description; });
      try {
        const res = await Api.addContractor({
          name: name, type: el.querySelector('#nc-type').value,
          contractValue: el.querySelector('#nc-value').value,
          phone: el.querySelector('#nc-phone').value,
          startDate: el.querySelector('#nc-start').value, endDate: el.querySelector('#nc-end').value,
          boqItems: boqItems,
          username: el.querySelector('#nc-user').value.trim() || null,
          password: el.querySelector('#nc-pass').value || null
        });
        if (res.account) {
          modal('<h3>✅ ' + I18n.t('تم إنشاء المقاول وحسابه') + '</h3><div class="m-sub">' + I18n.t('سلّم هذه البيانات للمقاول للدخول على صفحة المشروع:') + '</div>' +
            '<div class="card" style="padding:16px"><div>' + I18n.t('👤 اسم المستخدم: ') + '<b class="num">' + esc(res.account.username) + '</b></div>' +
            '<div class="mt">' + I18n.t('🔑 كلمة المرور: ') + '<b class="num">' + esc(res.account.password) + '</b></div></div>' +
            '<div class="m-actions"><button class="btn" onclick="this.closest(\'.modal-back\').remove()">' + I18n.t('تم') + '</button></div>');
        } else toast(I18n.t('✅ تمت إضافة المقاول'));
        ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });
  }

  // ============ جدول الكميات (الاستشاري) ============
  const boqState = { contractor: 'all' };

  function renderBoq(el, ctx) {
    const canEdit = ['consultant', 'admin'].indexOf(ctx.U.role) !== -1;
    const items = ctx.S.boqItems.filter(function (b) {
      return boqState.contractor === 'all' || b.contractorId === boqState.contractor;
    });
    const total = items.reduce(function (a, b) { return a + b.qty * b.unitPrice; }, 0);
    const earned = items.reduce(function (a, b) { return a + b.qty * b.unitPrice * b.progress / 100; }, 0);

    el.innerHTML =
      '<div class="card"><h3>' + I18n.t('📊 جدول الكميات BOQ ') + '<span class="hint">' + I18n.t('تحديث نسب الإنجاز هنا يغيّر سطوع المخططات مباشرة') + '</span></h3>' +
      '<div class="flex mb"><select class="inp" id="bq-filter" style="max-width:320px"><option value="all">' + I18n.t('كل المقاولين') + '</option>' +
      ctx.S.contractors.map(function (c) { return '<option value="' + c.id + '"' + (boqState.contractor === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('') +
      '</select>' +
      '<span class="pill p-info">' + I18n.t('القيمة: ') + money(Math.round(total)) + '</span>' +
      '<span class="pill p-ok">' + I18n.t('المنفذ: ') + money(Math.round(earned)) + ' (' + (total ? Math.round(earned / total * 100) : 0) + '%)</span></div>' +
      '<div class="tbl-wrap" style="max-height:60vh;overflow-y:auto"><table class="tbl"><thead><tr>' +
      '<th>' + I18n.t('الكود') + '</th><th>' + I18n.t('البند') + '</th><th>' + I18n.t('الدور') + '</th><th>' + I18n.t('الوحدة') + '</th><th>' + I18n.t('الكمية') + '</th><th>' + I18n.t('سعر الوحدة') + '</th><th>' + I18n.t('الإجمالي') + '</th><th style="min-width:160px">' + I18n.t('نسبة الإنجاز') + '</th></tr></thead><tbody>' +
      items.map(function (b) {
        const d = discOf(ctx, b.discipline);
        return '<tr><td class="num small">' + esc(b.code) + '</td>' +
          '<td>' + d.icon + ' ' + esc(b.description) + '</td>' +
          '<td class="small">' + esc(VS.floorName(ctx, b.floor)) + '</td>' +
          '<td class="small">' + esc(b.unit) + '</td><td class="num">' + b.qty + '</td>' +
          '<td class="num">' + b.unitPrice.toLocaleString('en-US') + '</td>' +
          '<td class="num">' + (b.qty * b.unitPrice).toLocaleString('en-US') + '</td>' +
          '<td><div class="flex">' +
          (canEdit ? '<input type="range" min="0" max="100" value="' + b.progress + '" data-bq="' + b.id + '" style="flex:1;accent-color:' + d.color + '">' :
            '<div class="bar" style="flex:1"><i style="width:' + b.progress + '%"></i></div>') +
          '<b class="num small" id="bqv-' + b.id + '">' + b.progress + '%</b></div></td></tr>';
      }).join('') + '</tbody></table></div></div>';

    el.querySelector('#bq-filter').addEventListener('change', function (e) {
      boqState.contractor = e.target.value; renderBoq(el, ctx);
    });
    el.querySelectorAll('[data-bq]').forEach(function (r) {
      r.addEventListener('input', function () {
        el.querySelector('#bqv-' + r.getAttribute('data-bq')).textContent = r.value + '%';
      });
      r.addEventListener('change', async function () {
        try {
          const v = Number(r.value);
          await Api.update('boqItems', r.getAttribute('data-bq'), {
            progress: v, status: v >= 100 ? 'منجز' : v > 0 ? 'جاري' : 'لم يبدأ'
          });
          toast(I18n.t('✅ حُدّث البند — انعكس ذلك على سطوع المخططات'));
          ctx.refreshSilent();
        } catch (e) { toast(e.message, true); }
      });
    });
  }

  // ============ إعداد التقارير (الاستشاري): يومي / أسبوعي / شهري ============
  const rptState = { tab: 'daily' };

  /** رفع الملفات المختارة فعلياً إلى الخادم وإرجاع سجلاتها {name, url} */
  async function filesOf(el, sel) {
    const files = el.querySelector(sel).files;
    const out = [];
    for (let i = 0; i < files.length; i++) out.push(await Api.upload(files[i]));
    return out;
  }

  function renderDailyReport(el, ctx) {
    const tab = rptState.tab;
    const today = new Date().toISOString().slice(0, 10);

    let form = '', archive = '';
    if (tab === 'daily') {
      form =
        '<h3>' + I18n.t('📝 تقرير يومي جديد') + '</h3>' +
        '<label class="fl">' + I18n.t('التاريخ') + '</label><input class="inp" id="dr-date" type="date" value="' + today + '">' +
        '<div class="grid g2"><div><label class="fl">' + I18n.t('الطقس') + '</label><input class="inp" id="dr-weather" placeholder="' + I18n.t('مشمس 40°') + '"></div>' +
        '<div><label class="fl">' + I18n.t('العمالة') + '</label><input class="inp num" id="dr-manpower" type="number" placeholder="150"></div></div>' +
        '<label class="fl">' + I18n.t('المعدات') + '</label><input class="inp" id="dr-equipment" placeholder="' + I18n.t('رافعة برجية 2...') + '">' +
        '<label class="fl">' + I18n.t('الأعمال المنفذة (سطر لكل عمل)') + '</label><textarea class="inp" id="dr-works" rows="5" placeholder="' + I18n.t('صب خرسانة...\nلياسة...') + '"></textarea>' +
        '<label class="fl">' + I18n.t('الصور من الموقع') + '</label><input class="inp" id="dr-photos" type="file" multiple accept="image/*">' +
        '<label class="fl">' + I18n.t('الملفات الداعمة (PDF / Excel)') + '</label><input class="inp" id="dr-files" type="file" multiple accept=".pdf,.xlsx,.xls,.doc,.docx">' +
        '<div class="m-actions"><button class="btn block" id="dr-save">' + I18n.t('حفظ التقرير اليومي') + '</button></div>';
      archive =
        '<h3>' + I18n.t('🗄️ أرشيف التقارير اليومية') + '</h3>' +
        ctx.S.dailyReports.map(function (r) {
          return '<div style="border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px;background:var(--bg2)">' +
            '<div class="flex" style="justify-content:space-between"><b class="num">' + esc(r.date) + '</b><span class="small muted">' + I18n.t('عمالة: ') + r.manpower + ' · 📎 ' + ((r.photos || []).length + (r.attachments || []).length) + '</span></div>' +
            '<div class="small" style="margin-top:6px;color:#c6cdda">' + (r.works || []).map(esc).join(' • ') + '</div></div>';
        }).join('');
    } else if (tab === 'weekly') {
      form =
        '<h3>' + I18n.t('🗓️ تقرير أسبوعي جديد') + '</h3>' +
        '<label class="fl">' + I18n.t('أسبوع يبدأ من') + '</label><input class="inp" id="wr-week" type="date" value="' + today + '">' +
        '<label class="fl">' + I18n.t('العنوان') + '</label><input class="inp" id="wr-title" placeholder="' + I18n.t('التقرير الأسبوعي - الأسبوع ...') + '">' +
        '<div class="grid g2"><div><label class="fl">' + I18n.t('الإنجاز الفعلي %') + '</label><input class="inp num" id="wr-actual" type="number" min="0" max="100"></div>' +
        '<div><label class="fl">' + I18n.t('الإنجاز المخطط %') + '</label><input class="inp num" id="wr-planned" type="number" min="0" max="100"></div></div>' +
        '<label class="fl">' + I18n.t('ملخص الأسبوع') + '</label><textarea class="inp" id="wr-summary" rows="3"></textarea>' +
        '<label class="fl">' + I18n.t('أبرز الإنجازات (سطر لكل بند)') + '</label><textarea class="inp" id="wr-ach" rows="3"></textarea>' +
        '<label class="fl">' + I18n.t('المعوقات (سطر لكل بند)') + '</label><textarea class="inp" id="wr-iss" rows="2"></textarea>' +
        '<label class="fl">' + I18n.t('الصور') + '</label><input class="inp" id="wr-photos" type="file" multiple accept="image/*">' +
        '<label class="fl">' + I18n.t('المرفقات') + '</label><input class="inp" id="wr-files" type="file" multiple>' +
        '<div class="m-actions"><button class="btn block" id="wr-save">' + I18n.t('حفظ التقرير الأسبوعي') + '</button></div>';
      archive =
        '<h3>' + I18n.t('🗄️ أرشيف التقارير الأسبوعية') + '</h3>' +
        (ctx.S.weeklyReports || []).map(function (r) {
          return '<div style="border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px;background:var(--bg2)">' +
            '<div class="flex" style="justify-content:space-between"><b>' + esc(r.title) + '</b>' +
            '<span class="pill ' + (r.progressActual < r.progressPlanned - 3 ? 'p-danger' : 'p-ok') + ' num">' + r.progressActual + '% / ' + r.progressPlanned + '%</span></div>' +
            '<div class="small" style="margin-top:6px;color:#c6cdda">' + esc(r.summary || '') + '</div>' +
            '<div class="small muted" style="margin-top:6px">📎 ' + ((r.photos || []).length + (r.attachments || []).length) + I18n.t(' مرفقات') + '</div></div>';
        }).join('');
    } else {
      form =
        '<h3>' + I18n.t('📊 تقرير شهري جديد') + '</h3>' +
        '<label class="fl">' + I18n.t('الشهر') + '</label><input class="inp num" id="mr-month" type="month" value="' + today.slice(0, 7) + '">' +
        '<label class="fl">' + I18n.t('العنوان') + '</label><input class="inp" id="mr-title" placeholder="' + I18n.t('التقرير الشهري - ...') + '">' +
        '<div class="grid g2"><div><label class="fl">' + I18n.t('الإنجاز الفعلي %') + '</label><input class="inp num" id="mr-actual" type="number" min="0" max="100"></div>' +
        '<div><label class="fl">' + I18n.t('الإنجاز المخطط %') + '</label><input class="inp num" id="mr-planned" type="number" min="0" max="100"></div></div>' +
        '<label class="fl">' + I18n.t('الملخص التنفيذي') + '</label><textarea class="inp" id="mr-summary" rows="5"></textarea>' +
        '<label class="fl">' + I18n.t('الصور والمرفقات') + '</label><input class="inp" id="mr-files" type="file" multiple>' +
        '<div class="m-actions"><button class="btn block" id="mr-save">' + I18n.t('حفظ التقرير الشهري') + '</button></div>';
      archive =
        '<h3>' + I18n.t('🗄️ أرشيف التقارير الشهرية') + '</h3>' +
        ctx.S.monthlyReports.map(function (r) {
          return '<div style="border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px;background:var(--bg2)">' +
            '<div class="flex" style="justify-content:space-between"><b>' + esc(r.title) + '</b>' +
            '<span class="pill ' + (r.progressActual < r.progressPlanned - 3 ? 'p-danger' : 'p-ok') + ' num">' + r.progressActual + '% / ' + r.progressPlanned + '%</span></div>' +
            '<div class="small" style="margin-top:6px;color:#c6cdda">' + esc(r.summary || '') + '</div></div>';
        }).join('');
    }

    el.innerHTML =
      '<div class="tabs">' +
      '<div class="tab ' + (tab === 'daily' ? 'active' : '') + '" data-rtab="daily">' + I18n.t('📝 يومي') + '</div>' +
      '<div class="tab ' + (tab === 'weekly' ? 'active' : '') + '" data-rtab="weekly">' + I18n.t('🗓️ أسبوعي') + '</div>' +
      '<div class="tab ' + (tab === 'monthly' ? 'active' : '') + '" data-rtab="monthly">' + I18n.t('📊 شهري') + '</div>' +
      '</div>' +
      '<div class="grid" style="grid-template-columns:1fr 1.2fr">' +
      '<div class="card">' + form + '</div>' +
      '<div class="card">' + archive + '</div></div>';

    el.querySelectorAll('[data-rtab]').forEach(function (t) {
      t.addEventListener('click', function () { rptState.tab = t.getAttribute('data-rtab'); renderDailyReport(el, ctx); });
    });

    const dSave = el.querySelector('#dr-save');
    if (dSave) dSave.addEventListener('click', async function () {
      try {
        await Api.create('dailyReports', {
          date: el.querySelector('#dr-date').value,
          weather: el.querySelector('#dr-weather').value || '—',
          manpower: Number(el.querySelector('#dr-manpower').value) || 0,
          equipment: el.querySelector('#dr-equipment').value || '—',
          works: el.querySelector('#dr-works').value.split('\n').filter(Boolean),
          photos: await filesOf(el, '#dr-photos'), attachments: await filesOf(el, '#dr-files'),
          by: ctx.U.name
        });
        toast(I18n.t('✅ حُفظ التقرير اليومي')); ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });

    const wSave = el.querySelector('#wr-save');
    if (wSave) wSave.addEventListener('click', async function () {
      const title = el.querySelector('#wr-title').value.trim();
      if (!title) { toast(I18n.t('أدخل عنوان التقرير'), true); return; }
      try {
        await Api.create('weeklyReports', {
          weekOf: el.querySelector('#wr-week').value, title: title,
          progressActual: Number(el.querySelector('#wr-actual').value) || 0,
          progressPlanned: Number(el.querySelector('#wr-planned').value) || 0,
          summary: el.querySelector('#wr-summary').value,
          achievements: el.querySelector('#wr-ach').value.split('\n').filter(Boolean),
          issues: el.querySelector('#wr-iss').value.split('\n').filter(Boolean),
          photos: await filesOf(el, '#wr-photos'), attachments: await filesOf(el, '#wr-files'),
          by: ctx.U.name
        });
        toast(I18n.t('✅ حُفظ التقرير الأسبوعي')); ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });

    const mSave = el.querySelector('#mr-save');
    if (mSave) mSave.addEventListener('click', async function () {
      const title = el.querySelector('#mr-title').value.trim();
      if (!title) { toast(I18n.t('أدخل عنوان التقرير'), true); return; }
      try {
        await Api.create('monthlyReports', {
          month: el.querySelector('#mr-month').value, title: title,
          progressActual: Number(el.querySelector('#mr-actual').value) || 0,
          progressPlanned: Number(el.querySelector('#mr-planned').value) || 0,
          summary: el.querySelector('#mr-summary').value,
          attachments: await filesOf(el, '#mr-files'),
          by: ctx.U.name
        });
        toast(I18n.t('✅ حُفظ التقرير الشهري')); ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });
  }

  // ============ ممثل المالك: المشاريع والاستشاريين ============
  function renderRepProjects(el, ctx) {
    el.innerHTML =
      '<div class="grid" style="grid-template-columns:1.2fr 1fr">' +
      '<div class="card"><h3>' + I18n.t('🏗️ مشاريع المالك') + '</h3>' +
      ctx.S.projects.map(function (p) {
        return '<div style="border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:10px;background:var(--bg2)">' +
          '<div class="flex" style="justify-content:space-between"><b style="font-size:16px">' + esc(p.name) + '</b>' +
          '<span class="pill p-info num">' + (p.progressActual || 0) + '%</span></div>' +
          '<div class="small muted" style="margin:6px 0">' + esc(p.location) + I18n.t(' · الميزانية ') + VS.millions(p.budgetPlanned) + '</div>' +
          '<div class="small">' + I18n.t('👨‍💼 الاستشاري: ') + '<b>' + esc(p.consultantName || I18n.t('لم يعيّن')) + '</b></div></div>';
      }).join('') + '</div>' +

      '<div class="card"><h3>➕ ' + I18n.t('إضافة مشروع وتعيين استشاري') + '</h3>' +
      '<label class="fl">' + I18n.t('اسم المشروع') + '</label><input class="inp" id="np-name" placeholder="' + I18n.t('برج / فيلا / مجمع...') + '">' +
      '<label class="fl">' + I18n.t('الموقع') + '</label><input class="inp" id="np-loc" placeholder="' + I18n.t('المدينة - الحي') + '">' +
      '<div class="grid g2"><div><label class="fl">' + I18n.t('تاريخ البدء') + '</label><input class="inp" id="np-start" type="date"></div>' +
      '<div><label class="fl">' + I18n.t('تاريخ الانتهاء') + '</label><input class="inp" id="np-end" type="date"></div></div>' +
      '<label class="fl">' + I18n.t('الميزانية التقديرية (ر.س)') + '</label><input class="inp num" id="np-budget" type="number" placeholder="10000000">' +
      '<label class="fl">' + I18n.t('المكتب الاستشاري') + '</label><input class="inp" id="np-cons" placeholder="' + I18n.t('اسم المكتب الهندسي') + '">' +
      '<div class="grid g2"><div><label class="fl">' + I18n.t('اسم مستخدم الاستشاري') + '</label><input class="inp" id="np-user" placeholder="consult-x"></div>' +
      '<div><label class="fl">' + I18n.t('كلمة المرور') + '</label><input class="inp" id="np-pass" placeholder="' + I18n.t('تلقائية إن تُركت') + '"></div></div>' +
      '<div class="m-actions"><button class="btn block" id="np-save">' + I18n.t('إنشاء المشروع وحساب الاستشاري') + '</button></div></div></div>';

    el.querySelector('#np-save').addEventListener('click', async function () {
      const name = el.querySelector('#np-name').value.trim();
      if (!name) { toast(I18n.t('أدخل اسم المشروع'), true); return; }
      try {
        const res = await Api.addProject({
          name: name, location: el.querySelector('#np-loc').value,
          startPlanned: el.querySelector('#np-start').value, endPlanned: el.querySelector('#np-end').value,
          budgetPlanned: el.querySelector('#np-budget').value,
          consultantName: el.querySelector('#np-cons').value,
          consultantUsername: el.querySelector('#np-user').value.trim() || null,
          consultantPassword: el.querySelector('#np-pass').value || null,
          ownerName: ctx.S.projects[0].ownerName
        });
        if (res.account) {
          modal('<h3>✅ ' + I18n.t('أُنشئ المشروع وحساب الاستشاري') + '</h3><div class="m-sub">' + I18n.t('بيانات دخول الاستشاري:') + '</div>' +
            '<div class="card" style="padding:16px"><div>👤 <b class="num">' + esc(res.account.username) + '</b></div>' +
            '<div class="mt">🔑 <b class="num">' + esc(res.account.password) + '</b></div></div>' +
            '<div class="m-actions"><button class="btn" onclick="this.closest(\'.modal-back\').remove()">' + I18n.t('تم') + '</button></div>');
        } else toast(I18n.t('✅ أُنشئ المشروع'));
        ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });
  }

  // ============ إدارة المستخدمين ============
  const ROLE_NAMES = {
    admin: 'مدير النظام', owner: 'المالك', owner_rep: 'ممثل المالك',
    consultant: 'الاستشاري', contractor: 'مقاول'
  };

  // وصف صلاحيات كل دور (يظهر عند اختيار الدور وفي مصفوفة الصلاحيات)
  const ROLE_META = {
    owner: {
      icon: '👁', color: 'p-info',
      desc: 'مالك المشروع: اطلاع فقط على مشروعه المسند إليه — عين المالك، رؤية المشروع، الكاميرات، المقاولون، ذكاء بصير، التقارير. لا يضيف ولا يعدل شيئاً.',
      scope: 'project'
    },
    owner_rep: {
      icon: '🧑‍💼', color: 'p-info',
      desc: 'ممثل المالك: يطلع على كامل ملفات ومعلومات جميع المشاريع + سجل النظام، ويضيف المشاريع ويعين الاستشاريين وينشئ المستخدمين ويرسل التقارير.',
      scope: 'all'
    },
    consultant: {
      icon: '📐', color: 'p-warn',
      desc: 'الاستشاري (المكتب الفني): الاعتمادات والتوقيع، خدمات المكتب الفني الـ12، جداول الكميات، إدارة المقاولين وحساباتهم، المخططات والنماذج، التقارير، الكاميرات والتكامل. يمكن قصره على مشاريع محددة.',
      scope: 'project-optional'
    },
    contractor: {
      icon: '👷', color: 'p-muted',
      desc: 'المقاول: يرى عقده وبنوده ومبالغه فقط، يرفع طلباته (مخططات، مواد، استلامات، مستخلصات، RFI...) ويتابع قراراتها، ويستقبل ما يوجهه له المكتب الفني.',
      scope: 'contractor'
    },
    admin: {
      icon: '⚙️', color: 'p-danger',
      desc: 'أدمن النظام: كل الصفحات والصلاحيات + إدارة المستخدمين والحذف + سجل النظام + التكامل والإعدادات.',
      scope: 'all'
    }
  };

  function userScopeLabel(ctx, u) {
    if (u.role === 'contractor') {
      const c = ctx.S.contractors.find(function (x) { return x.id === u.contractorId; });
      return c ? '🔗 ' + esc(c.name) : '<span class="muted">' + I18n.t('غير مربوط بمقاول!') + '</span>';
    }
    if (u.projectIds && u.projectIds.length) {
      return '🏗️ ' + u.projectIds.map(function (pid) {
        const p = ctx.S.projects.find(function (x) { return x.id === pid; });
        return esc(p ? p.name : pid);
      }).join('، ');
    }
    if (u.role === 'owner') return '<span class="pill p-warn">' + I18n.t('لم يُسند لمشروع!') + '</span>';
    return '<span class="muted">' + I18n.t('جميع المشاريع') + '</span>';
  }

  function renderUsers(el, ctx) {
    el.innerHTML =
      // مصفوفة الصلاحيات
      '<div class="card mb"><h3>🛡️ ' + I18n.t('مستويات النظام وصلاحياتها') + '</h3><div class="grid" style="grid-template-columns:repeat(5,1fr);gap:10px">' +
      ['owner', 'owner_rep', 'consultant', 'contractor', 'admin'].map(function (r) {
        const m = ROLE_META[r];
        return '<div style="border:1px solid var(--border);border-radius:12px;padding:12px;background:var(--bg2)">' +
          '<div style="font-size:20px">' + m.icon + '</div><b class="small">' + esc(I18n.t(ROLE_NAMES[r])) + '</b>' +
          '<div class="small muted" style="margin-top:6px;line-height:1.8;font-size:11px">' + esc(I18n.t(m.desc)) + '</div></div>';
      }).join('') + '</div></div>' +

      '<div class="grid" style="grid-template-columns:1.4fr 1fr">' +
      '<div class="card"><h3>👥 ' + I18n.t('مستخدمو النظام ') + '<span class="hint">' + I18n.t('كلمات المرور مشفرة ولا تظهر لأحد') + '</span></h3>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
      '<th>' + I18n.t('الاسم') + '</th><th>' + I18n.t('اسم المستخدم') + '</th><th>' + I18n.t('الدور') + '</th><th>' + I18n.t('النطاق') + '</th><th></th></tr></thead><tbody>' +
      (ctx.S.users || []).map(function (u) {
        const m = ROLE_META[u.role] || { icon: '👤', color: 'p-muted' };
        return '<tr><td><b>' + esc(u.name) + '</b></td><td class="num">' + esc(u.username) + '</td>' +
          '<td><span class="pill ' + m.color + '">' + m.icon + ' ' + esc(I18n.t(ROLE_NAMES[u.role] || u.role)) + '</span></td>' +
          '<td class="small">' + userScopeLabel(ctx, u) + '</td>' +
          '<td>' + (u.username !== 'admin' && u.id !== ctx.U.id ? '<button class="btn danger sm" data-del="' + u.id + '">' + I18n.t('حذف') + '</button>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></div></div>' +

      '<div class="card"><h3>➕ ' + I18n.t('إضافة مستخدم') + '</h3>' +
      '<label class="fl">' + I18n.t('الدور') + '</label><select class="inp" id="nu-role">' +
      ['owner', 'owner_rep', 'consultant', 'contractor', 'admin'].map(function (r) {
        return '<option value="' + r + '">' + ROLE_META[r].icon + ' ' + I18n.t(ROLE_NAMES[r]) + '</option>';
      }).join('') + '</select>' +
      '<div class="small muted" id="nu-desc" style="margin-top:8px;line-height:1.8"></div>' +
      '<label class="fl">' + I18n.t('الاسم الكامل') + '</label><input class="inp" id="nu-name" placeholder="' + I18n.t('م. فلان الفلاني') + '">' +
      '<label class="fl">' + I18n.t('اسم المستخدم') + '</label><input class="inp num" id="nu-user" placeholder="username" dir="ltr">' +
      '<label class="fl">' + I18n.t('كلمة المرور (اتركها فارغة للتوليد التلقائي)') + '</label><input class="inp num" id="nu-pass" placeholder="••••••••" dir="ltr">' +
      '<div id="nu-scope"></div>' +
      '<div class="m-actions"><button class="btn block" id="nu-save">' + I18n.t('إنشاء المستخدم وتسليم بياناته') + '</button></div></div></div>';

    const roleSel = el.querySelector('#nu-role');
    const scopeBox = el.querySelector('#nu-scope');
    const descBox = el.querySelector('#nu-desc');

    function drawScope() {
      const r = roleSel.value;
      descBox.textContent = I18n.t(ROLE_META[r].desc);
      if (r === 'contractor') {
        scopeBox.innerHTML = '<label class="fl">' + I18n.t('ربط بالمقاول') + '</label><select class="inp" id="nu-cont">' +
          ctx.S.contractors.map(function (c) { return '<option value="' + c.id + '">' + esc(c.name) + '</option>'; }).join('') + '</select>';
      } else if (r === 'owner' || r === 'consultant') {
        scopeBox.innerHTML = '<label class="fl">' + I18n.t(r === 'owner' ? 'مشروع المالك (يرى صفحة مشروعه فقط)' : 'المشاريع المسندة (اتركها كلها فارغة = جميع المشاريع)') + '</label>' +
          ctx.S.projects.map(function (p) {
            return '<label class="fl flex" style="cursor:pointer;margin:4px 0"><input type="checkbox" class="nu-proj" value="' + p.id + '"' +
              (r === 'owner' && ctx.S.projects.length === 1 ? ' checked' : '') + '> 🏗️ ' + esc(p.name) + '</label>';
          }).join('');
      } else {
        scopeBox.innerHTML = '';
      }
    }
    drawScope();
    roleSel.addEventListener('change', drawScope);

    el.querySelector('#nu-save').addEventListener('click', async function () {
      const role = roleSel.value;
      const name = el.querySelector('#nu-name').value.trim();
      const username = el.querySelector('#nu-user').value.trim();
      if (!name || !username) { toast(I18n.t('أدخل الاسم واسم المستخدم'), true); return; }
      const data = {
        name: name, username: username,
        password: el.querySelector('#nu-pass').value || Math.random().toString(36).slice(2, 10),
        role: role
      };
      const contSel = el.querySelector('#nu-cont');
      if (contSel) data.contractorId = contSel.value;
      const projChecks = el.querySelectorAll('.nu-proj:checked');
      if (projChecks.length) data.projectIds = Array.prototype.map.call(projChecks, function (c) { return c.value; });
      if (role === 'owner' && !data.projectIds) { toast(I18n.t('حدد مشروع المالك — المالك يرى صفحة مشروعه'), true); return; }
      try {
        const created = await Api.create('users', data);
        modal('<h3>✅ ' + I18n.t('أُنشئ الحساب — سلّم هذه البيانات لصاحبها') + '</h3>' +
          '<div class="m-sub">' + I18n.t('كلمة المرور تظهر الآن مرة واحدة فقط ولا يمكن استرجاعها لاحقاً (مشفرة في النظام)') + '</div>' +
          '<div class="card" style="padding:16px">' +
          '<div>' + ROLE_META[role].icon + ' <b>' + esc(name) + '</b> — ' + esc(I18n.t(ROLE_NAMES[role])) + '</div>' +
          '<div class="mt">' + I18n.t('👤 اسم المستخدم: ') + '<b class="num">' + esc(username) + '</b></div>' +
          '<div class="mt">' + I18n.t('🔑 كلمة المرور: ') + '<b class="num">' + esc(created.password || data.password) + '</b></div></div>' +
          '<div class="m-actions"><button class="btn" onclick="this.closest(\'.modal-back\').remove()">' + I18n.t('تم التسليم') + '</button></div>');
        ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });

    el.querySelectorAll('[data-del]').forEach(function (b) {
      b.addEventListener('click', async function () {
        if (!confirm(I18n.t('حذف هذا المستخدم؟'))) return;
        try { await Api.remove('users', b.getAttribute('data-del')); toast(I18n.t('حُذف المستخدم')); ctx.refresh(); }
        catch (e) { toast(e.message, true); }
      });
    });
  }

  // ============ سجل النظام (Audit Log) ============
  const AUDIT_ACTIONS = {
    login: ['🔑', 'دخول', 'p-info'], create: ['➕', 'إضافة', 'p-ok'],
    update: ['✏️', 'تعديل', 'p-warn'], delete: ['🗑️', 'حذف', 'p-danger'],
    review: ['✍️', 'قرار اعتماد', 'p-info'], send: ['📨', 'إرسال تقرير', 'p-ok'],
    upload: ['📎', 'رفع ملف', 'p-muted'], snapshot: ['📸', 'لقطة كاميرا', 'p-muted']
  };
  const auditState = { filter: 'all', q: '' };

  function renderAudit(el, ctx) {
    const log = ctx.S.auditLog || [];
    const filtered = log.filter(function (a) {
      if (auditState.filter !== 'all' && a.action !== auditState.filter) return false;
      if (auditState.q && (a.userName + ' ' + a.target).indexOf(auditState.q) === -1) return false;
      return true;
    });

    el.innerHTML =
      '<div class="card"><div class="flex" style="justify-content:space-between;flex-wrap:wrap;margin-bottom:12px">' +
      '<h3 style="margin:0">' + I18n.t('📜 سجل النظام ') + '<span class="hint">' + I18n.t('توثيق كامل: من فعل ماذا ومتى — ') + log.length + I18n.t(' حدث') + '</span></h3>' +
      '<input class="inp" id="au-q" placeholder="' + I18n.t('🔍 بحث بالاسم أو العملية...') + '" style="max-width:260px" value="' + esc(auditState.q) + '"></div>' +
      '<div class="tabs">' +
      '<div class="tab ' + (auditState.filter === 'all' ? 'active' : '') + '" data-af="all">' + I18n.t('الكل') + '</div>' +
      Object.keys(AUDIT_ACTIONS).map(function (k) {
        const n = log.filter(function (a) { return a.action === k; }).length;
        if (!n) return '';
        return '<div class="tab ' + (auditState.filter === k ? 'active' : '') + '" data-af="' + k + '">' +
          AUDIT_ACTIONS[k][0] + ' ' + I18n.t(AUDIT_ACTIONS[k][1]) + ' <span class="muted num">' + n + '</span></div>';
      }).join('') + '</div>' +
      (filtered.length ?
        '<div class="tbl-wrap" style="max-height:65vh;overflow-y:auto"><table class="tbl"><thead><tr>' +
        '<th>' + I18n.t('الوقت') + '</th><th>' + I18n.t('المستخدم') + '</th><th>' + I18n.t('الدور') + '</th><th>' + I18n.t('العملية') + '</th><th>' + I18n.t('التفاصيل') + '</th></tr></thead><tbody>' +
        filtered.map(function (a) {
          const m = AUDIT_ACTIONS[a.action] || ['•', a.action, 'p-muted'];
          return '<tr><td class="small muted num" style="white-space:nowrap">' + esc(a.time) + '</td>' +
            '<td class="small"><b>' + esc(a.userName) + '</b></td>' +
            '<td class="small">' + esc(I18n.t(ROLE_NAMES[a.role] || a.role)) + '</td>' +
            '<td><span class="pill ' + m[2] + '">' + m[0] + ' ' + I18n.t(m[1]) + '</span></td>' +
            '<td class="small">' + esc(a.target) + '</td></tr>';
        }).join('') + '</tbody></table></div>'
        : '<div class="empty"><div class="e-ico">📜</div>' + I18n.t('لا أحداث مطابقة') + '</div>') +
      '</div>';

    el.querySelectorAll('[data-af]').forEach(function (t) {
      t.addEventListener('click', function () { auditState.filter = t.getAttribute('data-af'); renderAudit(el, ctx); });
    });
    const q = el.querySelector('#au-q');
    q.addEventListener('input', function () {
      auditState.q = q.value.trim();
      renderAudit(el, ctx);
      const q2 = el.querySelector('#au-q'); q2.focus(); q2.setSelectionRange(q2.value.length, q2.value.length);
    });
  }

  // ============ رفع BIM وربط الكميات (الاستشاري) ============
  function renderBimUpload(el, ctx) {
    const P = ctx.S.projects[0];
    el.innerHTML =
      '<div class="grid g2">' +
      '<div class="card"><h3>' + I18n.t('🏢 رفع نموذج BIM') + '</h3>' +
      '<div class="m-sub">' + I18n.t('ارفع نموذج المشروع (IFC / RVT / NWD) ليُعرض للمالك في صفحة "رؤية المشروع" مربوطاً بجدول الكميات.') + '</div>' +
      '<label class="fl">' + I18n.t('ملف النموذج') + '</label><input class="inp" id="bim-file" type="file" accept=".ifc,.rvt,.nwd,.nwc">' +
      '<label class="fl">' + I18n.t('إصدار النموذج') + '</label><input class="inp" id="bim-rev" placeholder="Rev-04 - يوليو 2026" value="Rev-04 - يوليو 2026">' +
      '<div class="m-actions"><button class="btn block" id="bim-up">' + I18n.t('رفع النموذج وربطه بجدول الكميات') + '</button></div>' +
      '<div class="sig">' + I18n.t('النموذج الحالي: BassirTower_Rev03.ifc · رُفع 2026-06-12 · مرتبط بـ ') + '<b class="num">' + ctx.S.boqItems.length + '</b>' + I18n.t(' بند') + '</div></div>' +

      '<div class="card"><h3>' + I18n.t('🔗 حالة ربط جدول الكميات بالنموذج') + '</h3>' +
      P.disciplines.map(function (d) {
        const n = ctx.S.boqItems.filter(function (b) { return b.discipline === d.id; }).length;
        return '<div class="flex" style="justify-content:space-between;border-bottom:1px solid rgba(34,44,64,.5);padding:10px 2px">' +
          '<span>' + d.icon + ' ' + esc(d.name) + '</span>' +
          '<span class="small"><b class="num">' + n + '</b>' + I18n.t(' بند مربوط ') + '<span class="pill p-ok">✓</span></span></div>';
      }).join('') +
      '<div class="small muted mt">' + I18n.t('💡 كل بند كميات مربوط بعناصر النموذج، فيتلوّن العنصر ساطعاً في عرض المالك عند اكتمال البند واعتماد مستخلصه.') + '</div></div></div>' +

      '<div class="card mt"><h3>' + I18n.t('📐 سجل مخططات المشروع ') + '<span class="hint">' + I18n.t('كل مخطط يرتبط بدور وتخصص وجدول كمياته — فيظهر داكناً/ساطعاً للمالك حسب التنفيذ') + '</span></h3>' +
      '<div class="grid" style="grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:14px">' +
      '<div><label class="fl">' + I18n.t('المرجع') + '</label><input class="inp num" id="pd-ref" placeholder="A-103"></div>' +
      '<div style="grid-column:span 2"><label class="fl">' + I18n.t('اسم المخطط') + '</label><input class="inp" id="pd-title" placeholder="' + I18n.t('المسقط المعماري - ...') + '"></div>' +
      '<div><label class="fl">' + I18n.t('الدور') + '</label><select class="inp" id="pd-floor">' +
      P.floors.map(function (f) { return '<option value="' + f.id + '">' + esc(f.name) + '</option>'; }).join('') +
      '<option value="ELEV">' + I18n.t('الواجهات') + '</option></select></div>' +
      '<div><label class="fl">' + I18n.t('التخصص') + '</label><select class="inp" id="pd-disc">' +
      P.disciplines.map(function (d) { return '<option value="' + d.id + '">' + d.icon + ' ' + esc(d.name) + '</option>'; }).join('') + '</select></div>' +
      '<div><label class="fl">' + I18n.t('الملف') + '</label><input class="inp" id="pd-file" type="file" accept=".dwg,.dxf,.pdf"></div>' +
      '</div>' +
      '<button class="btn sm mb" id="pd-add">' + I18n.t('➕ رفع المخطط وربطه بجدول الكميات') + '</button>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>' + I18n.t('المرجع') + '</th><th>' + I18n.t('المخطط') + '</th><th>' + I18n.t('الدور') + '</th><th>' + I18n.t('التخصص') + '</th><th>' + I18n.t('التاريخ') + '</th><th>' + I18n.t('الربط') + '</th></tr></thead><tbody>' +
      (ctx.S.planDrawings || []).map(function (dr) {
        const d = discOf(ctx, dr.discipline);
        return '<tr><td class="num small"><b>' + esc(dr.ref) + '</b></td><td>' + esc(dr.title) + '<div class="small muted">📎 ' + esc(dr.file || '') + '</div></td>' +
          '<td class="small">' + (dr.floor === 'ELEV' ? I18n.t('الواجهات') : esc(VS.floorName(ctx, dr.floor))) + '</td>' +
          '<td class="small">' + d.icon + ' ' + esc(d.name) + '</td>' +
          '<td class="small muted num">' + esc(dr.date || '') + '</td>' +
          '<td><span class="pill p-ok">' + I18n.t('مربوط بجدول الكميات ✓') + '</span></td></tr>';
      }).join('') + '</tbody></table></div></div>';

    el.querySelector('#bim-up').addEventListener('click', function () {
      const f = el.querySelector('#bim-file').files[0];
      if (!f) { toast(I18n.t('اختر ملف النموذج أولاً'), true); return; }
      toast(I18n.t('✅ رُفع النموذج "') + f.name + I18n.t('" وربط بجدول الكميات — أصبح مرئياً للمالك في صفحة رؤية المشروع'));
    });

    el.querySelector('#pd-add').addEventListener('click', async function () {
      const title = el.querySelector('#pd-title').value.trim();
      if (!title) { toast(I18n.t('أدخل اسم المخطط'), true); return; }
      const f = el.querySelector('#pd-file').files[0];
      try {
        await Api.create('planDrawings', {
          ref: el.querySelector('#pd-ref').value || 'DWG-' + Math.floor(Math.random() * 900 + 100),
          title: title,
          floor: el.querySelector('#pd-floor').value,
          discipline: el.querySelector('#pd-disc').value,
          file: f ? f.name : '', by: ctx.U.name
        });
        toast(I18n.t('✅ رُفع المخطط وربط بجدول كميات الدور — سيظهر للمالك في رؤية المشروع'));
        ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });
  }

  // ============ صفحات المقاول ============
  const CONT_TABS = APPROVAL_TABS.concat([
    { col: 'rfis', name: 'استفسارات RFI', icon: '❓' },
    { col: 'methodStatements', name: 'أساليب التنفيذ وITP', icon: '🧾' },
    { col: 'claims', name: 'المطالبات وEOT', icon: '⚖️' }
  ]);
  const contState = { tab: 'shopDrawings' };

  function renderContractorHome(el, ctx) {
    const c = ctx.S.contractors[0];
    if (!c) { el.innerHTML = '<div class="empty">' + I18n.t('لا يوجد عقد مرتبط بحسابك') + '</div>'; return; }
    const sums = VS.summarize(ctx)[0];
    const d = discOf(ctx, c.type);
    const pendingAll = CONT_TABS.reduce(function (a, t) {
      return a + (ctx.S[t.col] || []).filter(function (x) { return x.status === 'pending' || x.status === 'open'; }).length;
    }, 0);

    el.innerHTML =
      '<div class="grid g4 mb">' +
      '<div class="card kpi"><div class="lbl">' + I18n.t('عقد ') + d.icon + ' ' + esc(d.name) + '</div><div class="val">' + VS.millions(c.contractValue) + '</div>' +
      '<div class="sub num">' + esc(c.startDate) + ' ← ' + esc(c.endDate) + '</div></div>' +
      '<div class="card kpi ' + (sums.delayed ? 'k-danger' : 'k-ok') + '"><div class="lbl">' + I18n.t('نسبة الإنجاز') + '</div><div class="val num">' + sums.progress + '%</div>' +
      '<div class="sub">' + I18n.t('المخطط ') + '<b class="num">' + sums.plannedProgress + '%</b>' + (sums.delayed ? ' · <span class="trend-down">' + I18n.t('متأخر') + '</span>' : ' · <span class="trend-up">' + I18n.t('ضمن الجدول') + '</span>') + '</div></div>' +
      '<div class="card kpi k-info"><div class="lbl">' + I18n.t('المبالغ المستلمة') + '</div><div class="val">' + VS.millions(c.amountReceived) + '</div>' +
      '<div class="sub num">' + Math.round(c.amountReceived / c.contractValue * 100) + I18n.t('% من قيمة العقد') + '</div></div>' +
      '<div class="card kpi k-warn"><div class="lbl">' + I18n.t('طلبات قيد المراجعة') + '</div><div class="val num">' + pendingAll + '</div><div class="sub">' + I18n.t('لدى الاستشاري') + '</div></div>' +
      '</div>' +

      '<div class="tabs">' + CONT_TABS.map(function (t) {
        const pending = (ctx.S[t.col] || []).filter(function (x) { return x.status === 'pending' || x.status === 'open'; }).length;
        return '<div class="tab ' + (contState.tab === t.col ? 'active' : '') + '" data-ctab="' + t.col + '">' + t.icon + ' ' + I18n.t(t.name) +
          (pending ? '<span class="n">' + pending + '</span>' : '') + '</div>';
      }).join('') + '</div>' +

      '<div class="card mb"><div class="flex" style="justify-content:space-between;margin-bottom:12px">' +
      '<h3 style="margin:0">' + I18n.t((CONT_TABS.find(function (t) { return t.col === contState.tab; }) || {}).name) + '</h3>' +
      '<button class="btn sm" id="ct-new">' + I18n.t('➕ رفع طلب جديد') + '</button></div>' +
      renderContractorList(ctx) + '</div>' +

      renderTechInbox(ctx);

    el.querySelectorAll('[data-ctab]').forEach(function (t) {
      t.addEventListener('click', function () { contState.tab = t.getAttribute('data-ctab'); renderContractorHome(el, ctx); });
    });
    el.querySelector('#ct-new').addEventListener('click', function () { openSubmitModal(ctx); });
  }

  function renderContractorList(ctx) {
    const tab = contState.tab;
    const items = (ctx.S[tab] || []).slice().reverse();
    if (!items.length) return '<div class="empty"><div class="e-ico">📭</div>' + I18n.t('لا طلبات بعد — ارفع أول طلب') + '</div>';
    const hasAmount = tab === 'changeOrders' || tab === 'payments' || tab === 'claims';
    return '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>' + I18n.t('المرجع') + '</th><th>' + I18n.t('العنوان') + '</th>' +
      (hasAmount ? '<th>' + I18n.t('القيمة') + '</th>' : '') +
      '<th>' + I18n.t('التاريخ') + '</th><th>' + I18n.t('الحالة') + '</th><th>' + I18n.t('رد الاستشاري') + '</th></tr></thead><tbody>' +
      items.map(function (it) {
        const reply = tab === 'rfis' ? it.answer : it.notes;
        return '<tr><td class="num small"><b>' + esc(it.ref) + '</b></td>' +
          '<td>' + esc(it.title) +
          (it.question ? '<div class="small muted" style="max-width:300px">' + esc(it.question) + '</div>' : '') +
          (it.kind === 'eot' ? '<div class="small muted num">' + I18n.t('تمديد +') + (it.days || 0) + I18n.t(' يوم') + '</div>' : '') +
          (it.kind === 'itp' ? '<div class="small muted">' + I18n.t('خطة فحص ITP') + '</div>' : '') + '</td>' +
          (hasAmount ? '<td>' + money(it.amount) + '</td>' : '') +
          '<td class="small muted num">' + esc(it.date) + '</td><td>' + pill(it.status) + '</td>' +
          '<td class="small" style="max-width:240px">' + (reply ? esc(reply) : '<span class="muted">—</span>') +
          (it.signature ? '<div class="sig">✍️ ' + esc(it.signature) + ' · ' + esc(it.signDate) + '</div>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  /** ما يوجهه المكتب الفني للمقاول: NCR، تعليمات، ملاحظات، سلامة، اختبارات */
  function renderTechInbox(ctx) {
    const sections = [
      { col: 'ncrs', name: '🚫 تقارير عدم المطابقة الموجهة لك', line: function (it) { return esc(it.title) + (it.correctiveAction ? ' — <span style="color:var(--ok)">' + esc(it.correctiveAction) + '</span>' : ''); } },
      { col: 'siteInstructions', name: '📢 تعليمات موقعية', line: function (it) { return esc(it.title) + '<div class="small muted">' + esc(it.details || '') + '</div>'; } },
      { col: 'snags', name: '📌 ملاحظات التسليم المطلوب إغلاقها', line: function (it) { return esc(it.title) + ' <span class="small muted">(' + esc(VS.floorName(ctx, it.location)) + ')</span>'; } },
      { col: 'hseReports', name: '🦺 ملاحظات السلامة', line: function (it) { return esc(it.title); } },
      { col: 'materialTests', name: '🧪 نتائج اختبارات موادك', line: function (it) { return esc(it.title) + ' — <b class="num">' + esc(it.value || '') + '</b>'; }, statusKey: 'result' }
    ];
    const cards = sections.map(function (s) {
      const items = (ctx.S[s.col] || []);
      if (!items.length) return '';
      return '<div class="card"><h3>' + I18n.t(s.name) + '</h3>' +
        items.map(function (it) {
          return '<div class="flex" style="justify-content:space-between;border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:8px;background:var(--bg2)">' +
            '<div class="small" style="flex:1">' + s.line(it) + '</div>' +
            '<div>' + pill(it[s.statusKey || 'status']) + '</div></div>';
        }).join('') + '</div>';
    }).filter(Boolean).join('');
    return cards ? '<h3 class="mb" style="margin-top:24px">' + I18n.t('📥 موجه إليك من المكتب الفني') + '</h3><div class="grid g2">' + cards + '</div>' : '';
  }

  function openSubmitModal(ctx) {
    const tab = contState.tab;
    const meta = CONT_TABS.find(function (t) { return t.col === tab; });
    const needAmount = tab === 'changeOrders' || tab === 'payments' || tab === 'claims';
    const isPayment = tab === 'payments';
    const isWir = tab === 'wirs';
    const myBoq = ctx.S.boqItems;

    const m = modal(
      '<h3>' + I18n.t('➕ رفع ') + I18n.t(meta.name) + '</h3>' +
      '<div class="m-sub">' + I18n.t('سيصل الطلب للاستشاري للمراجعة والاعتماد أو الرفض') + '</div>' +
      '<label class="fl">' + I18n.t('رقم المرجع') + '</label><input class="inp num" id="sb-ref" placeholder="REF-001">' +
      '<label class="fl">' + I18n.t('العنوان / الوصف') + '</label><input class="inp" id="sb-title">' +
      (tab === 'rfis' ? '<label class="fl">' + I18n.t('نص الاستفسار الفني') + '</label><textarea class="inp" id="sb-question" rows="3" placeholder="' + I18n.t('اشرح التعارض أو المعلومة المطلوبة مع ذكر رقم المخطط...') + '"></textarea>' : '') +
      (tab === 'methodStatements' ? '<label class="fl">' + I18n.t('النوع') + '</label><select class="inp" id="sb-kind"><option value="ms">' + I18n.t('أسلوب تنفيذ MS') + '</option><option value="itp">' + I18n.t('خطة فحص ITP') + '</option></select>' : '') +
      (tab === 'claims' ? '<label class="fl">' + I18n.t('نوع المطالبة') + '</label><select class="inp" id="sb-kind"><option value="eot">' + I18n.t('تمديد مدة EOT') + '</option><option value="cost">' + I18n.t('مطالبة مالية') + '</option></select>' : '') +
      (needAmount ? '<label class="fl">' + I18n.t('القيمة (ر.س)') + '</label><input class="inp num" id="sb-amount" type="number">' : '') +
      (tab === 'changeOrders' || tab === 'claims' ? '<label class="fl">' + I18n.t('الأيام الإضافية المطلوبة') + '</label><input class="inp num" id="sb-days" type="number" value="0">' : '') +
      (isWir ? '<label class="fl">' + I18n.t('الموقع / الدور') + '</label><select class="inp" id="sb-loc">' +
        ctx.S.projects[0].floors.map(function (f) { return '<option value="' + f.id + '">' + esc(f.name) + '</option>'; }).join('') + '</select>' : '') +
      (isPayment ?
        '<label class="fl">' + I18n.t('بنود المستخلص (اختر البند والنسبة المنجزة الجديدة)') + '</label><div id="sb-lines"></div>' +
        '<button class="btn ghost sm" id="sb-addline">' + I18n.t('+ إضافة بند') + '</button>' : '') +
      '<label class="fl">' + I18n.t('المرفقات (المخطط / الداتا شيت / المستندات)') + '</label><input class="inp" id="sb-file" type="file" multiple>' +
      '<div class="m-actions"><button class="btn" id="sb-ok">' + I18n.t('إرسال للاستشاري') + '</button><button class="btn mutedb" id="sb-cancel">' + I18n.t('إلغاء') + '</button></div>'
    );

    if (isPayment) {
      const wrap = m.querySelector('#sb-lines');
      function addLine() {
        const r = document.createElement('div');
        r.className = 'grid'; r.style.cssText = 'grid-template-columns:2.2fr 1fr;gap:6px;margin-bottom:6px';
        r.innerHTML = '<select class="inp" data-lf="boqItemId">' +
          myBoq.map(function (b) { return '<option value="' + b.id + '">' + esc(b.description) + ' — ' + esc(b.floor) + I18n.t(' (حالياً ') + b.progress + '%)</option>'; }).join('') +
          '</select><input class="inp num" data-lf="progress" type="number" min="0" max="100" placeholder="' + I18n.t('% الجديدة') + '">';
        wrap.appendChild(r);
      }
      addLine();
      m.querySelector('#sb-addline').addEventListener('click', addLine);
    }

    m.querySelector('#sb-cancel').addEventListener('click', function () { m.remove(); });
    m.querySelector('#sb-ok').addEventListener('click', async function () {
      const data = {
        ref: m.querySelector('#sb-ref').value || 'REF-' + Math.floor(Math.random() * 900 + 100),
        title: m.querySelector('#sb-title').value
      };
      if (!data.title) { toast(I18n.t('أدخل عنوان الطلب'), true); return; }
      if (needAmount) data.amount = Number(m.querySelector('#sb-amount').value) || 0;
      if (tab === 'changeOrders' || tab === 'claims') data.days = Number(m.querySelector('#sb-days').value) || 0;
      if (tab === 'rfis') data.question = m.querySelector('#sb-question').value;
      if (tab === 'methodStatements' || tab === 'claims') data.kind = m.querySelector('#sb-kind').value;
      if (isWir) data.location = m.querySelector('#sb-loc').value;
      const files = m.querySelector('#sb-file').files;
      if (files.length) data.file = await Api.upload(files[0]);
      if (isPayment) {
        data.lines = Array.prototype.map.call(m.querySelector('#sb-lines').children, function (r) {
          return {
            boqItemId: r.querySelector('[data-lf="boqItemId"]').value,
            progress: Number(r.querySelector('[data-lf="progress"]').value) || 0
          };
        }).filter(function (l) { return l.progress > 0; });
      }
      try {
        await Api.create(tab, data);
        m.remove();
        toast(I18n.t('✅ أُرسل الطلب للاستشاري'));
        ctx.refresh();
      } catch (e) { toast(e.message, true); }
    });
  }

  // ============ موديول المكتب الفني (خدمات استشاري المشروع) ============
  const HSE_KINDS = { violation: 'مخالفة سلامة', incident: 'حادث', observation: 'ملاحظة وقائية' };
  const SEVERITIES = { low: ['منخفضة', 'p-muted'], medium: ['متوسطة', 'p-warn'], high: ['عالية', 'p-danger'], minor: ['ثانوية', 'p-warn'], major: ['جوهرية', 'p-danger'], critical: ['حرجة', 'p-danger'] };
  const HND_KINDS = { asbuilt: 'مخططات كما نُفذ', om: 'كتيبات تشغيل وصيانة', warranty: 'شهادات ضمان', dlp: 'فترة الضمان DLP' };

  function sev(s) { const v = SEVERITIES[s] || [s, 'p-muted']; return '<span class="pill ' + v[1] + '">' + esc(I18n.t(v[0])) + '</span>'; }
  function sigCell(it) { return it.signature ? '<div class="sig">✍️ ' + esc(it.signature) + ' · ' + esc(it.signDate) + '</div>' : ''; }

  const TECH_TABS = [
    { col: 'rfis', name: 'الاستفسارات الفنية RFI', icon: '❓', desc: 'الرد على استفسارات المقاولين وحسم تعارضات المخططات والمواصفات',
      pendingOf: function (x) { return x.status === 'open'; },
      cols: [
        { h: 'الاستفسار', r: function (it) { return '<b>' + esc(it.title) + '</b><div class="small muted" style="max-width:340px">' + esc(it.question || '') + '</div>'; } },
        { h: 'الرد الفني', r: function (it) { return it.answer ? '<div class="small" style="max-width:300px;color:var(--ok)">' + esc(it.answer) + '</div>' + sigCell(it) : '<span class="muted small">' + I18n.t('بانتظار الرد') + '</span>'; } }
      ],
      fields: [
        { k: 'contractorId', label: 'المقاول', type: 'contractor' }, { k: 'ref', label: 'المرجع', type: 'text' },
        { k: 'title', label: 'الموضوع', type: 'text' }, { k: 'question', label: 'نص الاستفسار', type: 'textarea' }
      ],
      action: function (ctx, it) {
        if (it.status !== 'open') return null;
        return { label: I18n.t('↩️ رد فني'), run: function () { answerModal(ctx, 'rfis', it, I18n.t('الرد الفني على الاستفسار'), 'answer', { status: 'answered' }); } };
      } },

    { col: 'ncrs', name: 'عدم المطابقة NCR', icon: '🚫', desc: 'رصد الأعمال المخالفة للمواصفات ومتابعة الإجراءات التصحيحية حتى الإغلاق',
      pendingOf: function (x) { return x.status === 'open'; },
      cols: [
        { h: 'المخالفة', r: function (it) { return '<b>' + esc(it.title) + '</b><div class="small muted" style="max-width:320px">' + esc(it.description || '') + '</div>'; } },
        { h: 'الخطورة', r: function (it) { return sev(it.severity); } },
        { h: 'الإجراء التصحيحي', r: function (it) { return it.correctiveAction ? '<div class="small" style="max-width:280px">' + esc(it.correctiveAction) + '</div>' + sigCell(it) : '<span class="muted small">—</span>'; } }
      ],
      fields: [
        { k: 'contractorId', label: 'المقاول', type: 'contractor' }, { k: 'ref', label: 'المرجع', type: 'text' },
        { k: 'title', label: 'عنوان المخالفة', type: 'text' }, { k: 'description', label: 'وصف عدم المطابقة', type: 'textarea' },
        { k: 'severity', label: 'الخطورة', type: 'select', options: [['minor', 'ثانوية'], ['major', 'جوهرية'], ['critical', 'حرجة']] }
      ],
      action: function (ctx, it) {
        if (it.status !== 'open') return null;
        return { label: I18n.t('✅ إغلاق'), run: function () { answerModal(ctx, 'ncrs', it, I18n.t('الإجراء التصحيحي المنفذ'), 'correctiveAction', { status: 'closed' }); } };
      } },

    { col: 'siteInstructions', name: 'التعليمات الموقعية', icon: '📢', desc: 'إصدار تعليمات ملزمة للمقاولين ومتابعة تنفيذها',
      pendingOf: function (x) { return x.status === 'issued'; },
      cols: [
        { h: 'التعليمات', r: function (it) { return '<b>' + esc(it.title) + '</b><div class="small muted" style="max-width:360px">' + esc(it.details || '') + '</div>' + sigCell(it); } }
      ],
      fields: [
        { k: 'contractorId', label: 'المقاول', type: 'contractor' }, { k: 'ref', label: 'المرجع', type: 'text' },
        { k: 'title', label: 'عنوان التعليمات', type: 'text' }, { k: 'details', label: 'التفاصيل', type: 'textarea' }
      ],
      action: function (ctx, it) {
        if (it.status !== 'issued') return null;
        return { label: I18n.t('✔ تم التنفيذ'), run: function () { quickUpdate(ctx, 'siteInstructions', it, { status: 'done' }); } };
      } },

    { col: 'methodStatements', name: 'أساليب التنفيذ وITP', icon: '🧾', desc: 'اعتماد بيانات طرق التنفيذ وخطط الفحص والاختبار المقدمة من المقاولين',
      pendingOf: function (x) { return x.status === 'pending'; },
      cols: [
        { h: 'النوع', r: function (it) { return '<span class="pill p-muted">' + I18n.t(it.kind === 'itp' ? 'خطة فحص ITP' : 'أسلوب تنفيذ MS') + '</span>'; } },
        { h: 'العنوان', r: function (it) { return '<b>' + esc(it.title) + '</b>' + (it.file ? '<div class="small muted">📎 ' + VS.att(it.file) + '</div>' : ''); } },
        { h: 'الملاحظات', r: function (it) { return (it.notes ? '<div class="small">' + esc(it.notes) + '</div>' : '<span class="muted small">—</span>') + sigCell(it); } }
      ],
      fields: [
        { k: 'contractorId', label: 'المقاول', type: 'contractor' },
        { k: 'kind', label: 'النوع', type: 'select', options: [['ms', 'أسلوب تنفيذ MS'], ['itp', 'خطة فحص ITP']] },
        { k: 'ref', label: 'المرجع', type: 'text' }, { k: 'title', label: 'العنوان', type: 'text' }
      ],
      action: function (ctx, it) {
        if (it.status !== 'pending') return null;
        return { label: I18n.t('✍️ قرار'), run: function () { openReviewModal(ctx, 'methodStatements', it); } };
      } },

    { col: 'materialTests', name: 'اختبارات المواد', icon: '🧪', desc: 'توثيق نتائج الاختبارات المعملية والحقلية (خرسانة، تربة، ضغط، شد...)',
      pendingOf: function (x) { return x.result === 'fail'; },
      cols: [
        { h: 'الاختبار', r: function (it) { return '<b>' + esc(it.title) + '</b><div class="small muted">🏛️ ' + esc(it.lab || '') + '</div>'; } },
        { h: 'المطلوب / النتيجة', r: function (it) { return '<div class="small num">' + I18n.t('المطلوب: ') + esc(it.target || '—') + '</div><div class="small num"><b>' + I18n.t('النتيجة: ') + esc(it.value || '—') + '</b></div>' + (it.notes ? '<div class="small muted">' + esc(it.notes) + '</div>' : ''); } },
        { h: 'الحكم', r: function (it) { return pill(it.result); } }
      ],
      fields: [
        { k: 'contractorId', label: 'المقاول', type: 'contractor' }, { k: 'ref', label: 'المرجع', type: 'text' },
        { k: 'title', label: 'الاختبار', type: 'text' }, { k: 'lab', label: 'المختبر', type: 'text' },
        { k: 'target', label: 'القيمة المطلوبة', type: 'text' }, { k: 'value', label: 'النتيجة', type: 'text' },
        { k: 'result', label: 'الحكم', type: 'select', options: [['pass', 'ناجح'], ['fail', 'راسب']] },
        { k: 'notes', label: 'ملاحظات', type: 'textarea' }
      ],
      statusKey: 'result' },

    { col: 'meetings', name: 'محاضر الاجتماعات', icon: '🤝', desc: 'محاضر اجتماعات التنسيق الأسبوعية وقراراتها',
      pendingOf: function () { return false; }, noContractor: true, noStatus: true,
      cols: [
        { h: 'الاجتماع', r: function (it) { return '<b>' + esc(it.title) + '</b><div class="small muted">' + I18n.t('الحضور: ') + esc(it.attendees || '') + '</div>'; } },
        { h: 'أبرز البنود والقرارات', r: function (it) { return '<ul style="margin-right:16px;font-size:12.5px;line-height:1.9;max-width:380px">' + (it.items || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'; } }
      ],
      fields: [
        { k: 'ref', label: 'المرجع', type: 'text' }, { k: 'title', label: 'عنوان الاجتماع', type: 'text' },
        { k: 'date', label: 'التاريخ', type: 'date' }, { k: 'attendees', label: 'الحضور', type: 'text' },
        { k: 'items', label: 'البنود (سطر لكل بند)', type: 'lines' }
      ] },

    { col: 'snags', name: 'قوائم الملاحظات', icon: '📌', desc: 'ملاحظات الاستلام الابتدائي (Snag List) ومتابعة إغلاقها قبل التسليم',
      pendingOf: function (x) { return x.status === 'open'; },
      cols: [
        { h: 'الملاحظة', r: function (it) { return '<b>' + esc(it.title) + '</b>' + sigCell(it); } },
        { h: 'الموقع', r: function (it, ctx) { return '<span class="pill p-muted">' + esc(VS.floorName(ctx, it.location)) + '</span>'; } }
      ],
      fields: [
        { k: 'contractorId', label: 'المقاول', type: 'contractor' }, { k: 'ref', label: 'المرجع', type: 'text' },
        { k: 'title', label: 'وصف الملاحظة', type: 'text' }, { k: 'location', label: 'الموقع', type: 'floor' }
      ],
      action: function (ctx, it) {
        if (it.status !== 'open') return null;
        return { label: I18n.t('✅ إغلاق'), run: function () { quickUpdate(ctx, 'snags', it, { status: 'closed' }); } };
      } },

    { col: 'hseReports', name: 'السلامة HSE', icon: '🦺', desc: 'مخالفات وحوادث وملاحظات السلامة والصحة المهنية بالموقع',
      pendingOf: function (x) { return x.status === 'open'; },
      cols: [
        { h: 'النوع', r: function (it) { return '<span class="pill ' + (it.kind === 'incident' ? 'p-danger' : it.kind === 'violation' ? 'p-warn' : 'p-info') + '">' + esc(I18n.t(HSE_KINDS[it.kind] || it.kind)) + '</span>'; } },
        { h: 'التقرير', r: function (it) { return '<b>' + esc(it.title) + '</b><div class="small muted" style="max-width:330px">' + esc(it.details || '') + '</div>' + sigCell(it); } },
        { h: 'الخطورة', r: function (it) { return sev(it.severity); } }
      ],
      fields: [
        { k: 'contractorId', label: 'المقاول', type: 'contractor' }, { k: 'ref', label: 'المرجع', type: 'text' },
        { k: 'kind', label: 'النوع', type: 'select', options: [['violation', 'مخالفة'], ['incident', 'حادث'], ['observation', 'ملاحظة وقائية']] },
        { k: 'title', label: 'العنوان', type: 'text' }, { k: 'details', label: 'التفاصيل', type: 'textarea' },
        { k: 'severity', label: 'الخطورة', type: 'select', options: [['low', 'منخفضة'], ['medium', 'متوسطة'], ['high', 'عالية']] }
      ],
      action: function (ctx, it) {
        if (it.status !== 'open') return null;
        return { label: I18n.t('✅ إغلاق'), run: function () { quickUpdate(ctx, 'hseReports', it, { status: 'closed' }); } };
      } },

    { col: 'claims', name: 'المطالبات وEOT', icon: '⚖️', desc: 'دراسة مطالبات المقاولين المالية وطلبات تمديد المدة والتوصية بشأنها',
      pendingOf: function (x) { return x.status === 'pending'; },
      cols: [
        { h: 'النوع', r: function (it) { return '<span class="pill p-muted">' + I18n.t(it.kind === 'eot' ? 'تمديد مدة EOT' : 'مطالبة مالية') + '</span>'; } },
        { h: 'المطالبة', r: function (it) { return '<b>' + esc(it.title) + '</b>'; } },
        { h: 'القيمة / المدة', r: function (it) { return (it.amount ? '<div class="num small">' + money(it.amount) + '</div>' : '') + (it.days ? '<div class="num small">+' + it.days + I18n.t(' يوم') + '</div>' : ''); } },
        { h: 'القرار', r: function (it) { return (it.notes ? '<div class="small" style="max-width:240px">' + esc(it.notes) + '</div>' : '<span class="muted small">—</span>') + sigCell(it); } }
      ],
      fields: [
        { k: 'contractorId', label: 'المقاول', type: 'contractor' },
        { k: 'kind', label: 'النوع', type: 'select', options: [['eot', 'تمديد مدة EOT'], ['cost', 'مطالبة مالية']] },
        { k: 'ref', label: 'المرجع', type: 'text' }, { k: 'title', label: 'العنوان', type: 'text' },
        { k: 'days', label: 'الأيام المطلوبة', type: 'number' }, { k: 'amount', label: 'القيمة (ر.س)', type: 'number' }
      ],
      action: function (ctx, it) {
        if (it.status !== 'pending') return null;
        return { label: I18n.t('✍️ قرار'), run: function () { openReviewModal(ctx, 'claims', it); } };
      } },

    { col: 'valueEngineering', name: 'الهندسة القيمية', icon: '💡', desc: 'دراسة مقترحات خفض التكلفة مع الحفاظ على الجودة والوظيفة',
      pendingOf: function (x) { return x.status === 'pending'; },
      cols: [
        { h: 'المقترح', r: function (it) { return '<b>' + esc(it.title) + '</b><div class="small muted" style="max-width:320px">' + esc(it.details || '') + '</div>'; } },
        { h: 'الوفر المتوقع', r: function (it) { return '<b class="num" style="color:var(--ok)">' + money(it.saving) + '</b>'; } },
        { h: 'القرار', r: function (it) { return (it.notes ? '<div class="small">' + esc(it.notes) + '</div>' : '<span class="muted small">—</span>') + sigCell(it); } }
      ],
      fields: [
        { k: 'contractorId', label: 'المقاول', type: 'contractor' }, { k: 'ref', label: 'المرجع', type: 'text' },
        { k: 'title', label: 'المقترح', type: 'text' }, { k: 'saving', label: 'الوفر المتوقع (ر.س)', type: 'number' },
        { k: 'details', label: 'التفاصيل', type: 'textarea' }
      ],
      action: function (ctx, it) {
        if (it.status !== 'pending') return null;
        return { label: I18n.t('✍️ قرار'), run: function () { openReviewModal(ctx, 'valueEngineering', it); } };
      } },

    { col: 'handoverDocs', name: 'التسليم والإغلاق', icon: '📦', desc: 'مخططات كما نُفذ، كتيبات التشغيل والصيانة، الضمانات، ومتابعة فترة الضمان',
      pendingOf: function (x) { return x.status === 'pending'; },
      cols: [
        { h: 'النوع', r: function (it) { return '<span class="pill p-muted">' + esc(I18n.t(HND_KINDS[it.kind] || it.kind)) + '</span>'; } },
        { h: 'المستند', r: function (it) { return '<b>' + esc(it.title) + '</b>' + (it.file ? '<div class="small muted">📎 ' + VS.att(it.file) + '</div>' : ''); } },
        { h: 'الملاحظات', r: function (it) { return (it.notes ? '<div class="small">' + esc(it.notes) + '</div>' : '<span class="muted small">—</span>') + sigCell(it); } }
      ],
      fields: [
        { k: 'contractorId', label: 'المقاول', type: 'contractor' },
        { k: 'kind', label: 'النوع', type: 'select', options: [['asbuilt', 'مخططات كما نُفذ'], ['om', 'كتيبات O&M'], ['warranty', 'شهادات ضمان'], ['dlp', 'ملاحظة فترة ضمان DLP']] },
        { k: 'ref', label: 'المرجع', type: 'text' }, { k: 'title', label: 'العنوان', type: 'text' }
      ],
      action: function (ctx, it) {
        if (it.status !== 'pending') return null;
        return { label: I18n.t('✍️ قرار'), run: function () { openReviewModal(ctx, 'handoverDocs', it); } };
      } },

    { col: 'correspondence', name: 'المراسلات', icon: '📮', desc: 'سجل الخطابات الصادرة والواردة الرسمية للمشروع',
      pendingOf: function () { return false; }, noContractor: true, noStatus: true,
      cols: [
        { h: 'الاتجاه', r: function (it) { return it.direction === 'out' ? '<span class="pill p-info">' + I18n.t('صادر ↗') + '</span>' : '<span class="pill p-warn">' + I18n.t('وارد ↙') + '</span>'; } },
        { h: 'الخطاب', r: function (it) { return '<b>' + esc(it.title) + '</b>'; } },
        { h: 'الجهة', r: function (it) { return '<div class="small">' + (it.from ? I18n.t('من: ') + esc(it.from) + '<br>' : '') + I18n.t('إلى: ') + esc(it.to || '—') + '</div>'; } }
      ],
      fields: [
        { k: 'ref', label: 'المرجع', type: 'text' },
        { k: 'direction', label: 'الاتجاه', type: 'select', options: [['out', 'صادر'], ['in', 'وارد']] },
        { k: 'to', label: 'الجهة', type: 'text' }, { k: 'title', label: 'الموضوع', type: 'text' }
      ] }
  ];

  const techState = { tab: 'rfis' };

  function quickUpdate(ctx, col, it, patch) {
    patch.signature = ctx.U.name;
    patch.signDate = new Date().toISOString().slice(0, 10);
    Api.update(col, it.id, patch)
      .then(function () { toast(I18n.t('✅ تم تحديث الحالة وتوقيعها')); ctx.refresh(); })
      .catch(function (e) { toast(e.message, true); });
  }

  function answerModal(ctx, col, it, label, key, extraPatch) {
    const m = modal(
      '<h3>' + esc(it.title) + '</h3>' +
      '<div class="m-sub">' + esc(it.ref) + ' · ' + esc(contractorName(ctx, it.contractorId)) + '</div>' +
      (it.question ? '<div class="card" style="padding:12px;margin-bottom:6px"><div class="small">' + esc(it.question) + '</div></div>' : '') +
      (it.description ? '<div class="card" style="padding:12px;margin-bottom:6px"><div class="small">' + esc(it.description) + '</div></div>' : '') +
      '<label class="fl">' + esc(label) + '</label><textarea class="inp" id="am-text" rows="4"></textarea>' +
      '<div class="m-actions"><button class="btn" id="am-ok">' + I18n.t('اعتماد وتوقيع') + '</button><button class="btn mutedb" id="am-cancel">' + I18n.t('إلغاء') + '</button></div>'
    );
    m.querySelector('#am-cancel').addEventListener('click', function () { m.remove(); });
    m.querySelector('#am-ok').addEventListener('click', function () {
      const txt = m.querySelector('#am-text').value.trim();
      if (!txt) { toast(I18n.t('اكتب النص أولاً'), true); return; }
      const patch = Object.assign({}, extraPatch);
      patch[key] = txt;
      patch.signature = ctx.U.name;
      patch.signDate = new Date().toISOString().slice(0, 10);
      Api.update(col, it.id, patch)
        .then(function () { m.remove(); toast(I18n.t('✅ تم الاعتماد والتوقيع')); ctx.refresh(); })
        .catch(function (e) { toast(e.message, true); });
    });
  }

  function techAddModal(ctx, tabDef) {
    const m = modal(
      '<h3>' + I18n.t('➕ إضافة: ') + esc(I18n.t(tabDef.name)) + '</h3>' +
      tabDef.fields.map(function (f) {
        const id = 'tf-' + f.k;
        if (f.type === 'contractor') return '<label class="fl">' + esc(I18n.t(f.label)) + '</label><select class="inp" id="' + id + '">' +
          ctx.S.contractors.map(function (c) { return '<option value="' + c.id + '">' + esc(c.name) + '</option>'; }).join('') + '</select>';
        if (f.type === 'floor') return '<label class="fl">' + esc(I18n.t(f.label)) + '</label><select class="inp" id="' + id + '">' +
          ctx.S.projects[0].floors.map(function (fl) { return '<option value="' + fl.id + '">' + esc(fl.name) + '</option>'; }).join('') + '</select>';
        if (f.type === 'select') return '<label class="fl">' + esc(I18n.t(f.label)) + '</label><select class="inp" id="' + id + '">' +
          f.options.map(function (o) { return '<option value="' + o[0] + '">' + esc(I18n.t(o[1])) + '</option>'; }).join('') + '</select>';
        if (f.type === 'textarea' || f.type === 'lines') return '<label class="fl">' + esc(I18n.t(f.label)) + '</label><textarea class="inp" id="' + id + '" rows="3"></textarea>';
        if (f.type === 'number') return '<label class="fl">' + esc(I18n.t(f.label)) + '</label><input class="inp num" id="' + id + '" type="number">';
        if (f.type === 'date') return '<label class="fl">' + esc(I18n.t(f.label)) + '</label><input class="inp" id="' + id + '" type="date" value="' + new Date().toISOString().slice(0, 10) + '">';
        return '<label class="fl">' + esc(I18n.t(f.label)) + '</label><input class="inp" id="' + id + '">';
      }).join('') +
      '<div class="m-actions"><button class="btn" id="tf-ok">' + I18n.t('حفظ') + '</button><button class="btn mutedb" id="tf-cancel">' + I18n.t('إلغاء') + '</button></div>'
    );
    m.querySelector('#tf-cancel').addEventListener('click', function () { m.remove(); });
    m.querySelector('#tf-ok').addEventListener('click', function () {
      const data = {};
      tabDef.fields.forEach(function (f) {
        const v = m.querySelector('#tf-' + f.k).value;
        if (f.type === 'lines') data[f.k] = v.split('\n').filter(Boolean);
        else if (f.type === 'number') data[f.k] = Number(v) || 0;
        else data[f.k] = v;
      });
      if (!data.title) { toast(I18n.t('أدخل العنوان'), true); return; }
      if (tabDef.col === 'meetings') data.by = ctx.U.name;
      if (tabDef.col === 'correspondence' && data.direction === 'out') data.by = ctx.U.name;
      Api.create(tabDef.col, data)
        .then(function () { m.remove(); toast(I18n.t('✅ تمت الإضافة')); ctx.refresh(); })
        .catch(function (e) { toast(e.message, true); });
    });
  }

  function renderTechOffice(el, ctx) {
    const t = TECH_TABS.find(function (x) { return x.col === techState.tab; }) || TECH_TABS[0];
    const items = (ctx.S[t.col] || []).slice().sort(function (a, b) {
      return (t.pendingOf(a) ? 0 : 1) - (t.pendingOf(b) ? 0 : 1);
    });

    // مؤشرات علوية سريعة
    const openRfis = (ctx.S.rfis || []).filter(function (x) { return x.status === 'open'; }).length;
    const openNcrs = (ctx.S.ncrs || []).filter(function (x) { return x.status === 'open'; }).length;
    const pendingDecisions = ['methodStatements', 'claims', 'valueEngineering', 'handoverDocs']
      .reduce(function (a, c) { return a + (ctx.S[c] || []).filter(function (x) { return x.status === 'pending'; }).length; }, 0);
    const openSnags = (ctx.S.snags || []).filter(function (x) { return x.status === 'open'; }).length;
    const failedTests = (ctx.S.materialTests || []).filter(function (x) { return x.result === 'fail'; }).length;
    const openHse = (ctx.S.hseReports || []).filter(function (x) { return x.status === 'open'; }).length;

    el.innerHTML =
      '<div class="grid g4 mb" style="grid-template-columns:repeat(6,1fr)">' +
      kpiMini(I18n.t('❓ استفسارات مفتوحة'), openRfis, openRfis ? 'k-warn' : 'k-ok') +
      kpiMini(I18n.t('🚫 NCR مفتوحة'), openNcrs, openNcrs ? 'k-danger' : 'k-ok') +
      kpiMini(I18n.t('✍️ قرارات معلقة'), pendingDecisions, pendingDecisions ? 'k-warn' : 'k-ok') +
      kpiMini(I18n.t('📌 ملاحظات مفتوحة'), openSnags, openSnags ? 'k-warn' : 'k-ok') +
      kpiMini(I18n.t('🧪 اختبارات راسبة'), failedTests, failedTests ? 'k-danger' : 'k-ok') +
      kpiMini(I18n.t('🦺 سلامة مفتوحة'), openHse, openHse ? 'k-danger' : 'k-ok') +
      '</div>' +

      '<div class="tabs">' + TECH_TABS.map(function (x) {
        const n = (ctx.S[x.col] || []).filter(x.pendingOf).length;
        return '<div class="tab ' + (techState.tab === x.col ? 'active' : '') + '" data-ttab="' + x.col + '">' + x.icon + ' ' + I18n.t(x.name) +
          (n ? '<span class="n">' + n + '</span>' : '') + '</div>';
      }).join('') + '</div>' +

      '<div class="card"><div class="flex" style="justify-content:space-between;margin-bottom:4px">' +
      '<h3 style="margin:0">' + t.icon + ' ' + esc(I18n.t(t.name)) + '</h3>' +
      '<button class="btn sm" id="tt-add">' + I18n.t('➕ إضافة') + '</button></div>' +
      '<div class="small muted mb">' + esc(I18n.t(t.desc)) + '</div>' +
      (items.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
        '<th>' + I18n.t('المرجع') + '</th>' +
        (t.noContractor ? '' : '<th>' + I18n.t('المقاول') + '</th>') +
        t.cols.map(function (c) { return '<th>' + esc(I18n.t(c.h)) + '</th>'; }).join('') +
        '<th>' + I18n.t('التاريخ') + '</th>' + (t.noStatus ? '' : '<th>' + I18n.t('الحالة') + '</th>') + '<th></th></tr></thead><tbody>' +
        items.map(function (it, idx) {
          const act = t.action ? t.action(ctx, it) : null;
          return '<tr>' +
            '<td class="num small"><b>' + esc(it.ref || '') + '</b></td>' +
            (t.noContractor ? '' : '<td class="small">' + esc(contractorName(ctx, it.contractorId)) + '</td>') +
            t.cols.map(function (c) { return '<td>' + c.r(it, ctx) + '</td>'; }).join('') +
            '<td class="small muted num">' + esc(it.date || '') + '</td>' +
            (t.noStatus ? '' : '<td>' + pill(it[t.statusKey || 'status']) + '</td>') +
            '<td>' + (act ? '<button class="btn sm" data-tact="' + idx + '">' + act.label + '</button>' : '') + '</td>' +
            '</tr>';
        }).join('') + '</tbody></table></div>'
        : '<div class="empty"><div class="e-ico">📭</div>' + I18n.t('لا سجلات بعد') + '</div>') +
      '</div>';

    el.querySelectorAll('[data-ttab]').forEach(function (x) {
      x.addEventListener('click', function () { techState.tab = x.getAttribute('data-ttab'); renderTechOffice(el, ctx); });
    });
    el.querySelector('#tt-add').addEventListener('click', function () { techAddModal(ctx, t); });
    el.querySelectorAll('[data-tact]').forEach(function (b) {
      b.addEventListener('click', function () {
        const it = items[Number(b.getAttribute('data-tact'))];
        const act = t.action(ctx, it);
        if (act) act.run();
      });
    });
  }

  function kpiMini(lbl, val, cls) {
    return '<div class="card kpi ' + cls + '" style="padding:14px"><div class="lbl" style="font-size:11.5px">' + lbl + '</div>' +
      '<div class="val num" style="font-size:22px;margin:4px 0 0">' + val + '</div></div>';
  }

  // ============ التكامل والإعدادات (حالة الخدمات الحقيقية) ============
  function svcCard(title, ico, ok, okText, offText, hint) {
    return '<div class="card kpi ' + (ok ? 'k-ok' : 'k-warn') + '"><div class="lbl">' + ico + ' ' + esc(I18n.t(title)) + '</div>' +
      '<div class="val" style="font-size:17px">' + (ok ? '<span style="color:var(--ok)">✅ ' + esc(I18n.t(okText)) + '</span>' : '<span style="color:var(--warn)">◽ ' + esc(I18n.t(offText)) + '</span>') + '</div>' +
      '<div class="sub">' + I18n.t(hint) + '</div></div>';
  }

  function renderSystem(el, ctx) {
    el.innerHTML = '<div class="empty"><div class="e-ico">⏳</div>' + I18n.t('جارٍ فحص حالة الخدمات...') + '</div>';
    Api.integrationsStatus().then(function (s) {
      if (s.demo) {
        el.innerHTML = '<div class="card"><h3>' + I18n.t('⚙️ التكامل والإعدادات') + '</h3>' +
          '<div class="empty"><div class="e-ico">🧪</div>' + I18n.t('أنت في وضع الديمو داخل المتصفح.') + '<br>' +
          I18n.t('حالة التكامل الفعلية (قاعدة البيانات، البريد، واتساب، الذكاء الاصطناعي، الكاميرات)') + '<br>' + I18n.t('تظهر عند تشغيل نسخة الخادم: ') + '<b class="num">node server/server.js</b></div></div>';
        return;
      }
      el.innerHTML =
        '<div class="grid g3 mb">' +
        svcCard('قاعدة البيانات', '🗄️', s.storage.kind === 'sqlite', 'SQLite (' + s.storage.file + ')', 'ملف JSON', 'كتابة معاملاتية WAL · للترقية إلى PostgreSQL انظر server/storage.js') +
        svcCard('تخزين الملفات', '📁', true, s.uploads + ' ملف مرفوع', '', 'رفع فعلي إلى data/uploads — الصور والمخططات والمستندات') +
        svcCard('الذكاء الاصطناعي', '🤖', s.ai.configured, 'Claude Vision (' + s.ai.model + ')', s.ai.keyPresent && !s.ai.sdkInstalled ? 'ثبّت @anthropic-ai/sdk' : 'أضف ANTHROPIC_API_KEY',
          'تحليل حقيقي لصور الموقع ولقطات الكاميرات') +
        svcCard('البريد الإلكتروني', '📧', s.email.configured, 'متصل (' + (s.email.provider || '') + ')', 'محاكاة', 'RESEND_API_KEY أو SENDGRID_API_KEY + EMAIL_FROM') +
        svcCard('واتساب', '💬', s.whatsapp.configured, 'WhatsApp Cloud API', 'محاكاة', 'WHATSAPP_TOKEN + WHATSAPP_PHONE_ID من Meta Business') +
        svcCard('مدخل الكاميرات', '🎥', s.cameraIngest.configured, 'يستقبل اللقطات', 'أضف CAMERA_KEY', 'الكاميرا/NVR تدفع لقطة JPEG كل فترة ويحللها الذكاء الاصطناعي') +
        svcCard('البث المباشر RTSP', '📡', s.media && s.media.configured, 'خادم الوسائط متصل', 'أضف MEDIA_SERVER_URL', 'MediaMTX يحول RTSP إلى بث حي داخل صفحة الكاميرات') +
        '</div>' +

        '<div class="grid g2">' +
        '<div class="card"><h3>' + I18n.t('🔧 التهيئة (ملف .env بجذر المشروع)') + '</h3>' +
        '<pre class="small" style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:14px;overflow-x:auto;direction:ltr;text-align:left;line-height:2">' +
        I18n.t('# الذكاء الاصطناعي (تحليل الصور)\nANTHROPIC_API_KEY=sk-ant-...\n\n# البريد\nRESEND_API_KEY=re_...\nEMAIL_FROM=Bassir &lt;reports@yourdomain.com&gt;\n\n# واتساب (Meta Cloud API)\nWHATSAPP_TOKEN=EAAG...\nWHATSAPP_PHONE_ID=1234567890\n\n# مدخل لقطات الكاميرات\nCAMERA_KEY=مفتاح-سري-طويل\n\n# التخزين\nSTORAGE=sqlite\nJWT_SECRET=سر-الإنتاج') + '</pre>' +
        '<div class="small muted">' + I18n.t('بعد التعديل أعد تشغيل الخادم. أي خدمة غير مهيأة تعمل تلقائياً بوضع المحاكاة.') + '</div></div>' +

        '<div class="card"><h3>' + I18n.t('🎥 ربط كاميرات الموقع فعلياً') + '</h3>' +
        '<div class="small" style="line-height:2">' + I18n.t('أي كاميرا أو جهاز تسجيل NVR يدعم الدفع عبر HTTP يرسل لقطاته للنظام، ويحللها ذكاء بصير تلقائياً:') + '</div>' +
        '<pre class="small" style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:14px;overflow-x:auto;direction:ltr;text-align:left;line-height:2">' +
        'curl -X POST https://your-domain/api/cameras/CAM1/snapshot \\\n  -H "x-camera-key: $CAMERA_KEY" \\\n  -H "Content-Type: image/jpeg" \\\n  --data-binary @snapshot.jpg</pre>' +
        '<div class="small muted" style="line-height:2">' + I18n.t('تُحفظ اللقطة في سجل الصور، وإن كان الذكاء الاصطناعي مهيأً تُحلل فوراً وتضاف نتيجتها إلى رؤى بصير مع مقارنتها بنسب الاستشاري.') + '</div>' +
        '<h3 class="mt">' + I18n.t('📡 البث المباشر RTSP') + '</h3>' +
        '<div class="small" style="line-height:2">' + I18n.t('1) ثبّت ') + '<b class="num">MediaMTX</b>' + I18n.t(' على السيرفر (ملف تنفيذي واحد).<br>2) أضف كل كاميرا في mediamtx.yml بمسار يطابق حقل "مسار البث":') + '</div>' +
        '<pre class="small" style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:14px;overflow-x:auto;direction:ltr;text-align:left;line-height:2">paths:\n  cam1:\n    source: rtsp://user:pass@192.168.1.10:554/stream1</pre>' +
        '<div class="small muted" style="line-height:2">' + I18n.t('3) ضع MEDIA_SERVER_URL=http://السيرفر:8888 في .env — فيظهر البث الحي مباشرة داخل بطاقات صفحة الكاميرات للمالك.') + '</div></div>' +
        '</div>';
    }).catch(function (e) {
      el.innerHTML = '<div class="empty"><div class="e-ico">⚠️</div>' + esc(e.message) + '</div>';
    });
  }

  window.ViewsRoles = {
    renderApprovals: renderApprovals,
    renderTechOffice: renderTechOffice,
    renderSystem: renderSystem,
    renderManageContractors: renderManageContractors,
    renderBoq: renderBoq,
    renderDailyReport: renderDailyReport,
    renderRepProjects: renderRepProjects,
    renderUsers: renderUsers,
    renderAudit: renderAudit,
    renderBimUpload: renderBimUpload,
    renderContractorHome: renderContractorHome
  };
})();
