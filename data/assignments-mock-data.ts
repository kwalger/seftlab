import {
  ApprovalRequestItem,
  AssignmentDifficulty,
  AssignmentSubmission,
  AssignmentTemplate,
  AuditLogEntry,
  ClassSection,
  LabAssignment,
  PlatformAnnouncement,
  UserRole,
} from '@/types';
import { UNIT1_LEGO_TASKS } from '@/lib/labs/accounting/unit1-lego-tasks';
import {
  STAGE2_AVAILABLE_ACCOUNTS,
  STAGE2_JOURNAL_OPERATIONS,
  STAGE2_MODEL_ENTRIES,
  UNIT1_CASE_STUDY,
} from '@/lib/labs/accounting/unit1-spreadsheet-data';
import { UNIT2_CASE_STUDY } from '@/lib/labs/accounting/unit2-spreadsheet-data';
import { OnboardingStep, DashboardNotification } from './dashboard-mock-data';

/* =========================================================
   1. TEACHER ONBOARDING & NOTIFICATIONS
   ========================================================= */
export const INITIAL_TEACHER_CHECKLIST: OnboardingStep[] = [
  {
    id: 't-step-class',
    title: 'أنشئ شعبتك الجامعية الأولى',
    description: 'حدد اسم المساق والفصل الدراسي لتوليد كود انضمام فريد لطلابك.',
    href: '/teacher/classes',
    actionLabel: 'إدارة الشعب',
    completed: true,
  },
  {
    id: 't-step-students',
    title: 'أضف طلاباً أو شارك كود الانضمام',
    description: 'انسخ كود الشعبة أو رابط الدعوة المباشر لانضمام الطلاب.',
    href: '/teacher/classes',
    actionLabel: 'عرض كود الشعبة',
    completed: true,
  },
  {
    id: 't-step-assign',
    title: 'أنشئ واجباً عملياً في مختبر المحاسبة المالية',
    description: 'اختر من مكتبة القوالب أو التطبيقات العملية الجاهزة مع تصحيح آلي.',
    href: '/teacher/assignments/new',
    actionLabel: 'إنشاء واجب جديد',
    completed: false,
  },
  {
    id: 't-step-review',
    title: 'راجع تسليمات الطلاب واعتمد العلامات',
    description: 'افحص خطوات الحل والتصحيح التلقائي وأضف ملاحظاتك الأكاديمية.',
    href: '/teacher/assignments/asg-u1-comprehensive',
    actionLabel: 'مراجعة التسليمات',
    completed: false,
  },
];

export const INITIAL_TEACHER_NOTIFICATIONS: DashboardNotification[] = [
  {
    id: 't-notif-1',
    title: 'تسليم جديد: رزان العبداللات',
    description: 'أكملت الواجب العملي الشامل للوحدة 1 وحصلت على 100/100 آلياً.',
    timeAgo: 'منذ 15 دقيقة',
    read: false,
    href: '/teacher/assignments/asg-u1-comprehensive',
  },
  {
    id: 't-notif-2',
    title: 'تنبيه تعثر مبكر في شعبة المحاسبة',
    description: 'طالب واجه خطأ قيد دائن مقلوب في قيد شراء المعدات بالتكلفة التاريخية.',
    timeAgo: 'منذ ساعتين',
    read: false,
    href: '/teacher/analytics',
  },
  {
    id: 't-notif-3',
    title: 'إطلاق مشروع الجداول العملية للوحدة الأولى (3 مراحل)',
    description: 'تم تفعيل ملف «الوحدة 1 تطبيق عملي» بـ 3 مراحل جداول عملية لشعبة ACC-101.',
    timeAgo: 'أمس',
    read: true,
    href: '/teacher/assignments',
  },
];

/* =========================================================
   2. CLASSES (الشعب الجامعية لمختبر المحاسبة المالية)
   ========================================================= */
export const INITIAL_CLASSES: ClassSection[] = [
  {
    id: 'cls-zu-acc-101',
    courseName: 'محاسبة 1',
    courseCode: 'ACC-101',
    semester: 'الفصل الأول 2026/2027',
    university: 'جامعة الزرقاء',
    roomNumber: '201ق',
    joinCode: 'ZU-ACC-201',
    teacherId: 'usr-teacher-1',
    teacherName: 'د. محمد المعاقبه',
    studentUsernames: [
      'yazan-nabulsi',
      'razan-abdallat',
      'tariq-majali',
      'hamza-zoubi',
      'khaled-momani',
    ],
    createdAt: '2026-09-15',
  },
];

/* =========================================================
   3. ACTIVE LAB ASSIGNMENTS (مشروع الجداول العملية الموحد للوحدة 1 - 3 مراحل)
   ========================================================= */
const UNIT1_LEGO_DIFFICULTIES: AssignmentDifficulty[] = [
  'مبتدئ',
  'مبتدئ',
  'مبتدئ',
  'مبتدئ',
  'متوسط',
  'متوسط',
  'متوسط',
  'متوسط',
  'متقدم',
  'متقدم',
  'متقدم',
  'خبير',
];

export const INITIAL_ASSIGNMENTS: LabAssignment[] = [
  {
    id: 'asg-u1-comprehensive',
    title: UNIT1_CASE_STUDY.projectTitle,
    labId: 'accounting',
    instructions:
      'مشروع عملي متكامل من الكتاب المقرر (الفصل الأول ص 14–36) داخل ملف «الوحدة 1 تطبيق عملي» على 3 مراحل جداول مترابطة: (1) جدول ترميز دليل الحسابات والمستندات والقوائم، (2) جدول احتساب التكلفة التاريخية للآلة (14,500 د.أ) ودفتر اليومية العام، (3) جدول قائمة الدخل ومعادلة الميزانية الختامية (35,000 د.أ).',
    difficulty: 'متقدم',
    maxScore: 100,
    dueDate: '2026-11-30',
    allowedAttempts: 3,
    showModelAnswerAfterSubmit: true,
    targetClassId: 'cls-zu-acc-101',
    targetStudentUsernames: [],
    status: 'منشور',
    createdByTeacherId: 'usr-teacher-1',
    createdByTeacherName: 'د. محمد المعاقبه',
    createdAt: '2026-11-12',
    accountingConfig: {
      operationsPrompt: STAGE2_JOURNAL_OPERATIONS.map(
        (op) => `${op.label} — ${op.bookRef}: ${op.description}`
      ),
      availableAccounts: STAGE2_AVAILABLE_ACCOUNTS,
      modelEntries: STAGE2_MODEL_ENTRIES,
    },
  },
  {
    id: 'asg-u2-comprehensive',
    title: UNIT2_CASE_STUDY.projectTitle,
    labId: 'accounting',
    instructions:
      'مشروع عملي تطبيقي شامل من الكتاب المقرر (الفصل الثاني ص 47–70) داخل ملف «الوحدة 2 تطبيق عملي» على 4 مراحل تفاعلية: (1) مخطط شجرة القرار وفحص الشروط الثلاثة للعملية المالية (شكل 2)، (2) الحالات الأربعة لأثر العمليات على معادلة الميزانية (شكل 3)، (3) جدول معادلة الميزانية لمحلات الأمين لشهر آذار 2024 بـ 10 عمليات متسلسلة بتوازن تام (16,700 د.أ)، (4) إعداد القوائم المالية الأربعة المترابطة ومخطط شبكة العلاقات (شكل 9 ص 70).',
    difficulty: 'متقدم',
    maxScore: 100,
    dueDate: '2026-12-15',
    allowedAttempts: 3,
    showModelAnswerAfterSubmit: true,
    targetClassId: 'cls-zu-acc-101',
    targetStudentUsernames: [],
    status: 'منشور',
    createdByTeacherId: 'usr-teacher-1',
    createdByTeacherName: 'د. محمد المعاقبه',
    createdAt: '2026-11-17',
    accountingConfig: {
      operationsPrompt: [
        '1/ 3: استثمار صاحب المشروع 10,000 دينار نقداً بالصندوق (ص 59)',
        '2/ 3: شراء آلات بمبلغ 5,000 دينار نقداً (ص 60)',
        '3/ 3: شراء أثاث بمبلغ 500 دينار من مفروشات أمل على الحساب (ص 61)',
        '4/ 3: دفع إيجار المحل 400 دينار نقداً (ص 61)',
        '7/ 3: تقديم خدمات واستلام 5,100 دينار نقداً (ص 61)',
        '10/ 3: مسحوبات شخصية لصاحب المشروع 1,000 دينار نقداً (ص 62)',
        '20/ 3: تقديم خدمات للعميل سامر على الحساب 1,000 دينار (ص 62)',
        '21/ 3: شراء قرطاسية بقيمة 2,000 دينار مقابل كمبيالة (ص 63)',
        '27/ 3: تحصيل 500 دينار نقداً من العميل سامر (ص 63)',
        '30/ 3: سداد 500 دينار نقداً لمفروشات أمل من الذمم الدائنة (ص 64)',
      ],
      availableAccounts: STAGE2_AVAILABLE_ACCOUNTS,
      modelEntries: STAGE2_MODEL_ENTRIES,
    },
  },
];

/* =========================================================
   4. STUDENT SUBMISSIONS (تسليمات الطلاب في المحاسبة)
   ========================================================= */
export const INITIAL_SUBMISSIONS: AssignmentSubmission[] = [
  {
    id: 'sub-u1-razan-comp',
    assignmentId: 'asg-u1-comprehensive',
    assignmentTitle:
      'الواجب العملي الشامل للوحدة 1: قيود التأسيس والتكلفة التاريخية ومعادلة الميزانية',
    labId: 'accounting',
    classId: 'cls-zu-acc-101',
    studentUsername: 'razan-abdallat',
    studentName: 'رزان العبداللات',
    university: 'جامعة الأميرة سمية للتكنولوجيا',
    status: 'تمت المراجعة',
    attemptsUsed: 1,
    timeSpentMinutes: 16,
    submittedAt: '2026-11-12',
    reviewedAt: '2026-11-13',
    manualScoreOverride: 100,
    teacherFeedback:
      'تطبيق متقن لمبدأ التكلفة التاريخية 14,500 د.أ وتوازن تام بين الطرفين.',
    autoGrade: {
      autoScore: 100,
      maxScore: 100,
      percentage: 100,
      passed: true,
      summaryFeedback: 'جميع قيود اليومية مطابقة ومتوازنة.',
      detectedErrorTags: [],
      criteriaBreakdown: [
        {
          criterion: 'توازن المعادلة المحاسبية ومجموع القيود',
          passed: true,
          earnedPoints: 20,
          maxPoints: 20,
          explanation: 'إجمالي المدين (28,500 JOD) يطابق إجمالي الدائن (28,500 JOD).',
        },
        {
          criterion: 'القيد #1: إيداع رأس مال نقدي في البنك',
          passed: true,
          earnedPoints: 26.7,
          maxPoints: 26.7,
          explanation: 'مطابق للنموذج.',
        },
        {
          criterion: 'القيد #2: التكلفة التاريخية للآلة (14,500 د.أ)',
          passed: true,
          earnedPoints: 26.7,
          maxPoints: 26.7,
          explanation: 'تجميع صحيح لثمن الشراء والشحن والتركيب.',
        },
        {
          criterion: 'القيد #3: إثبات الإيراد المكتسب والمتحقق',
          passed: true,
          earnedPoints: 26.6,
          maxPoints: 26.6,
          explanation: 'مطابق للنموذج.',
        },
      ],
    },
    payload: {
      accountingEntries: [
        {
          id: 'u1-comp-m1',
          description: 'إيداع رأس مال نقدي في البنك',
          debitAccount: 'النقدية والبنك',
          creditAccount: 'رأس المال المساهم',
          debitAmount: 10000,
          creditAmount: 10000,
        },
        {
          id: 'u1-comp-m2',
          description: 'شراء آلة بالتكلفة التاريخية شاملة الشحن والتركيب',
          debitAccount: 'المعدات والآلات',
          creditAccount: 'النقدية والبنك',
          debitAmount: 14500,
          creditAmount: 14500,
        },
        {
          id: 'u1-comp-m3',
          description: 'تحصيل إيراد خدمة مكتسبة ومحققة',
          debitAccount: 'النقدية والبنك',
          creditAccount: 'إيرادات الخدمات والمبيعات',
          debitAmount: 4000,
          creditAmount: 4000,
        },
      ],
    },
  },
  {
    id: 'sub-u1-khaled-comp',
    assignmentId: 'asg-u1-comprehensive',
    assignmentTitle:
      'الواجب العملي الشامل للوحدة 1: قيود التأسيس والتكلفة التاريخية ومعادلة الميزانية',
    labId: 'accounting',
    classId: 'cls-zu-acc-101',
    studentUsername: 'khaled-momani',
    studentName: 'خالد المومني',
    university: 'الجامعة الهاشمية',
    status: 'مُصحَّح آلياً',
    attemptsUsed: 1,
    timeSpentMinutes: 22,
    submittedAt: '2026-11-12',
    autoGrade: {
      autoScore: 58,
      maxScore: 100,
      percentage: 58,
      passed: false,
      summaryFeedback:
        'تأكد من شمول مصاريف الشحن والتركيب ضمن التكلفة التاريخية للأصل في القيد الثاني.',
      detectedErrorTags: ['فرق في المبلغ المسجل'],
      criteriaBreakdown: [
        {
          criterion: 'توازن المعادلة المحاسبية ومجموع القيود',
          passed: true,
          earnedPoints: 20,
          maxPoints: 20,
          explanation: 'الأرصدة متوازنة رقمياً ولكن تحتاج مراجعة المبلغ في القيد 2.',
        },
        {
          criterion: 'القيد #2: شراء آلة بالتكلفة التاريخية',
          passed: false,
          earnedPoints: 18.6,
          maxPoints: 26.67,
          explanation: 'المبلغ النموذجي هو 14,500 JOD شاملاً الشحن والتركيب.',
          errorTag: 'فرق في المبلغ المسجل',
        },
      ],
    },
    payload: {
      accountingEntries: [
        {
          id: 'k1',
          description: 'رأس مال',
          debitAccount: 'النقدية والبنك',
          creditAccount: 'رأس المال المساهم',
          debitAmount: 10000,
          creditAmount: 10000,
        },
        {
          id: 'k2',
          description: 'شراء آلة بسعر الفاتورة فقط',
          debitAccount: 'المعدات والآلات',
          creditAccount: 'النقدية والبنك',
          debitAmount: 12000,
          creditAmount: 12000,
        },
      ],
    },
  },
];

/* =========================================================
   5. ACCOUNTING LAB ASSIGNMENT TEMPLATES (قوالب المحاسبة + مهام الليغو)
   ========================================================= */
function buildTemplates(): AssignmentTemplate[] {
  const accountingTitles: [string, AssignmentDifficulty, string][] = [
    [
      'قالب 1: إيداع رأس المال التأسيسي وشراء الأصول الثابتة بالتكلفة التاريخية',
      'مبتدئ',
      'تسجيل قيدي التأسيس النقدي وشراء أجهزة ومعدات مع مصاريف التركيب ومطابقة طرفي الميزانية.',
    ],
    [
      'قالب 2: معالجة المبيعات الآجلة وتحصيل الذمم المدينة',
      'مبتدئ',
      'إثبات إيراد مبيعات مكتسب بالآجل ثم تحصيل الدفعة نقداً في البنك.',
    ],
    [
      'قالب 3: سداد الرواتب والأجور والمستحقات الشهرية',
      'متوسط',
      'تسجيل مصروف الرواتب الشهرية وفق مبدأ مقابلة الإيرادات بالمصروفات.',
    ],
    [
      'قالب 4: شراء بضاعة على الحساب مع تقييم المخزون بالحيطة والحذر',
      'متوسط',
      'إثبات مشتريات المخزون بالآجل وتسجيل سداد الموردين.',
    ],
    [
      'قالب 5: تسوية المصروفات المدفوعة مقدماً (الإيجار والتأمين)',
      'متوسط',
      'قيود التسوية الجردية لنهاية الفترة المحاسبية لمصروف الإيجار المقدم.',
    ],
    [
      'قالب 6: تسوية الإيرادات المقبوضة مقدماً عند تقديم الخدمة',
      'متقدم',
      'تحويل الدفعات المقدمة من العملاء إلى إيرادات محققة عند اكتمال الخدمة.',
    ],
    [
      'قالب 7: احتساب قسط الإهلاك السنوي وفق مبدأ المقابلة',
      'متقدم',
      'توزيع تكلفة الأصل غير المتداول على عمره الإنتاجي وفق الاستمرارية والمقابلة.',
    ],
    [
      'قالب 8: معالجة القروض البنكية وفوائد التمويل المستحقة',
      'متقدم',
      'إثبات استلام القرض البنكي وتسجيل قسط السداد والفائدة التمويلية.',
    ],
    [
      'قالب 9: تكوين مخصص الديون المشكوك في تحصيلها (الحيطة والحذر)',
      'خبير',
      'تقييم الذمم المدينة وتكوين مخصص لمواجهة احتمال عدم التحصيل.',
    ],
    [
      'قالب 10: قيود الإقفال الختامية وترحيل صافي الربح لحقوق الملكية',
      'خبير',
      'إقفال حسابات الإيرادات والمصروفات نهاية الفترة المحاسبية الدورية.',
    ],
  ];

  const templates: AssignmentTemplate[] = [];

  accountingTitles.forEach(([title, difficulty, summary], idx) => {
    const baseAmt = (idx + 2) * 1500;
    templates.push({
      id: `tpl-acc-${idx + 1}`,
      title,
      labId: 'accounting',
      difficulty,
      summary,
      instructions: `${summary} سجل القيود اللازمة في دفتر اليومية وتأكد من توازن الطرفين المدين والدائن.`,
      maxScore: 100,
      allowedAttempts: 3,
      accountingConfig: {
        operationsPrompt: [
          `تنفيذ العملية المالية الأساسية رقم (${idx + 1}) بقيمة ${baseAmt.toLocaleString('en-US')} دينار أردني.`,
        ],
        availableAccounts: [
          'النقدية والبنك',
          'رأس المال المساهم',
          'المعدات والآلات',
          'الذمم الدائنة (الموردون)',
          'إيرادات الخدمات والمبيعات',
          'مصروف الرواتب والأجور',
        ],
        modelEntries: [
          {
            id: `tpl-acc-e-${idx + 1}`,
            description: title,
            debitAccount: 'النقدية والبنك',
            creditAccount: 'إيرادات الخدمات والمبيعات',
            debitAmount: baseAmt,
            creditAmount: baseAmt,
          },
        ],
      },
    });
  });

  UNIT1_LEGO_TASKS.forEach((task, idx) => {
    templates.push({
      id: `tpl-lego-${task.lessonNumber}`,
      title: `تطبيق الدرس ${task.lessonNumber}: ${task.title.replace(/^تطبيق عملي \d+:\s*/, '')}`,
      labId: 'accounting',
      difficulty: UNIT1_LEGO_DIFFICULTIES[idx] || 'متوسط',
      summary: `${task.subtitle} (${task.bookReference})`,
      instructions: task.scenario,
      maxScore: 100,
      allowedAttempts: 3,
      legoConfig: {
        taskId: task.id,
        lessonNumber: task.lessonNumber,
      },
    });
  });

  return templates;
}

export const INITIAL_ASSIGNMENT_TEMPLATES: AssignmentTemplate[] =
  buildTemplates();

/* =========================================================
   6. ANNOUNCEMENTS, APPROVALS, USERS & AUDIT LOG (للأدمن والمعلم)
   ========================================================= */
export const INITIAL_ANNOUNCEMENTS: PlatformAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'إطلاق مشروع الجداول العملية للوحدة الأولى (3 مراحل)',
    body: 'يرجى من طلاب شعبة ACC-101 إنجاز مراحل مشروع «الوحدة 1 تطبيق عملي» الثلاث (دليل الحسابات، التكلفة التاريخية واليومية، وقائمة الدخل والميزانية) عبر صفحة الواجبات.',
    targetAudience: 'cls-zu-acc-101',
    authorName: 'د. محمد المعاقبه',
    authorRole: 'teacher',
    scheduledAt: '2026-11-15',
    active: true,
  },
  {
    id: 'ann-2',
    title: 'تحديث المصحح الآلي الفوري لمختبر المحاسبة المالية',
    body: 'يدعم المختبر الآن تصحيح جداول العمل المحاسبية المترابطة ودفتر اليومية ومعادلة الميزانية فورياً.',
    targetAudience: 'all',
    authorName: 'مدير النظام العام',
    authorRole: 'admin',
    scheduledAt: '2026-11-12',
    active: true,
  },
];

export const INITIAL_APPROVAL_REQUESTS: ApprovalRequestItem[] = [
  {
    id: 'req-1',
    applicantName: 'د. ريم عبد الرحمن المجالي',
    applicantEmail: 'r.majali@psut.edu.jo',
    role: 'teacher',
    organizationOrUniversity: 'جامعة الأميرة سمية للتكنولوجيا',
    departmentOrCommercialReg:
      'كلية الملك طلال لتكنولوجيا الأعمال — قسم المحاسبة',
    submittedAt: '2026-11-11',
    status: 'قيد المراجعة',
    notes: 'ترغب في فتح 3 شعب لمساق مبادئ المحاسبة المالية.',
  },
  {
    id: 'req-2',
    applicantName: 'د. سامر النمري',
    applicantEmail: 's.nimri@just.edu.jo',
    role: 'teacher',
    organizationOrUniversity: 'جامعة العلوم والتكنولوجيا الأردنية',
    departmentOrCommercialReg: 'كلية الأعمال والعلوم الإدارية',
    submittedAt: '2026-11-12',
    status: 'قيد المراجعة',
    notes: 'تدريس مساق المحاسبة المالية لطلاب السنة الأولى.',
  },
  {
    id: 'req-3',
    applicantName: 'شركة دار الابتكار للحلول المالية',
    applicantEmail: 'hr@dar-cloud.jo',
    role: 'company',
    organizationOrUniversity: 'شركة دار الابتكار للحلول المالية',
    departmentOrCommercialReg: 'سجل تجاري رقم: 200194821 — عمّان',
    submittedAt: '2026-11-10',
    status: 'قيد المراجعة',
    notes: 'طلب توثيق حساب شركة لاستقطاب خريجي مختبر المحاسبة المالية.',
  },
];

export interface PlatformUserRecord {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: UserRole;
  universityOrOrg: string;
  status: 'نشط' | 'معلّق' | 'بانتظار الموافقة';
  joinedAt: string;
  xpOrMetric: string;
}

export const INITIAL_PLATFORM_USERS: PlatformUserRecord[] = [
  {
    id: 'usr-student-1',
    fullName: 'يزن النابلسي',
    username: 'yazan-nabulsi',
    email: 'yazan@students.ju.edu.jo',
    role: 'student',
    universityOrOrg: 'الجامعة الأردنية',
    status: 'نشط',
    joinedAt: '2026-09-01',
    xpOrMetric: '1,680 XP',
  },
  {
    id: 'usr-student-2',
    fullName: 'رزان العبداللات',
    username: 'razan-abdallat',
    email: 'razan@psut.edu.jo',
    role: 'student',
    universityOrOrg: 'جامعة الأميرة سمية للتكنولوجيا',
    status: 'نشط',
    joinedAt: '2026-09-04',
    xpOrMetric: '1,650 XP',
  },
  {
    id: 'usr-student-3',
    fullName: 'خالد المومني',
    username: 'khaled-momani',
    email: 'khaled@hu.edu.jo',
    role: 'student',
    universityOrOrg: 'الجامعة الهاشمية',
    status: 'نشط',
    joinedAt: '2026-09-10',
    xpOrMetric: '1,340 XP',
  },
  {
    id: 'usr-teacher-1',
    fullName: 'د. محمد المعاقبه',
    username: 'dr-mohammad-al-maaqbeh',
    email: 'm.al-maaqbeh@zu.edu.jo',
    role: 'teacher',
    universityOrOrg: 'جامعة الزرقاء',
    status: 'نشط',
    joinedAt: '2026-08-25',
    xpOrMetric: '1 شعبة · 13 واجباً وتطبيقاً',
  },
  {
    id: 'usr-teacher-2',
    fullName: 'د. ريم عبد الرحمن المجالي',
    username: 'dr-reem-majali',
    email: 'r.majali@psut.edu.jo',
    role: 'teacher',
    universityOrOrg: 'جامعة الأميرة سمية للتكنولوجيا',
    status: 'بانتظار الموافقة',
    joinedAt: '2026-11-11',
    xpOrMetric: 'طلب جديد',
  },
  {
    id: 'usr-company-1',
    fullName: 'سارة الخطيب (شركة تقنية المستقبل)',
    username: 'futuretech-hr',
    email: 'talent@futuretech.jo',
    role: 'company',
    universityOrOrg: 'شركة تقنية المستقبل',
    status: 'نشط',
    joinedAt: '2026-09-12',
    xpOrMetric: 'باقة الأعمال (Pro)',
  },
  {
    id: 'usr-admin-root',
    fullName: 'مدير النظام العام',
    username: 'admin',
    email: 'admin@seftlab.com',
    role: 'admin',
    universityOrOrg: 'إدارة منصة SEFT Lab',
    status: 'نشط',
    joinedAt: '2026-01-01',
    xpOrMetric: 'صلاحيات كاملة',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-1',
    actorName: 'مدير النظام العام',
    actorRole: 'admin',
    actionType: 'موافقة طلب',
    targetLabel: 'تفعيل حساب المعلم: د. محمد المعاقبه (جامعة الزرقاء)',
    timestamp: '2026-11-12 09:40',
    ipAddress: '10.24.0.12',
  },
  {
    id: 'aud-2',
    actorName: 'د. محمد المعاقبه',
    actorRole: 'teacher',
    actionType: 'إنشاء واجب',
    targetLabel:
      'نشر مشروع «الوحدة 1 تطبيق عملي» على 3 مراحل جداول عملية (شعبة ACC-101)',
    timestamp: '2026-11-15 14:15',
    ipAddress: '176.29.44.101',
  },
  {
    id: 'aud-3',
    actorName: 'مدير النظام العام',
    actorRole: 'admin',
    actionType: 'تحديث إعدادات',
    targetLabel: 'تفعيل المصحح الآلي لجداول العمل المحاسبية في مختبر المحاسبة',
    timestamp: '2026-11-15 18:05',
    ipAddress: '10.24.0.12',
  },
  {
    id: 'aud-4',
    actorName: 'سارة الخطيب',
    actorRole: 'company',
    actionType: 'تسجيل دخول',
    targetLabel: 'دخول ناجح إلى بوابة التوظيف (شركة تقنية المستقبل)',
    timestamp: '2026-11-10 11:22',
    ipAddress: '94.142.38.19',
  },
];
