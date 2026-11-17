import { Fils, formatFilsShort, jodToFils } from './accounts';
import { JournalEntry } from './engine';
import { EquationImpactAnswer } from './grading';

/**
 * مولّد أرقام عشوائية ببذرة ثابتة (Seeded PRNG - Mulberry32)
 * يضمن إنتاج نفس الأرقام والسيناريو للمعلم عند إدخال نفس البذرة (اسم الطالب + رقم التمرين + رقم المحاولة).
 */
export function hashSeed(seed: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export class SeededRandom {
  private state: number;

  constructor(seed: string | number) {
    this.state = typeof seed === 'number' ? seed >>> 0 : hashSeed(seed);
    if (this.state === 0) this.state = 0x6d2b79f5;
  }

  /** يعيد رقماً عشرياً في النطاق [0, 1) */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** عدد صحيح في النطاق [min, max] شاملاً الطرفين */
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** مبلغ صحيح بالدينار من مضاعفات step ثم يُحول إلى فلس */
  amountFils(minJod: number, maxJod: number, stepJod = 50): Fils {
    const minSteps = Math.ceil(minJod / stepJod);
    const maxSteps = Math.floor(maxJod / stepJod);
    const chosenJod = this.int(minSteps, Math.max(minSteps, maxSteps)) * stepJod;
    return jodToFils(chosenJod);
  }

  pick<T>(items: readonly T[]): T {
    return items[this.int(0, items.length - 1)];
  }

  shuffle<T>(items: readonly T[]): T[] {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}

export function buildExerciseSeed(
  studentUsername: string,
  exerciseId: string,
  attempt: number
): string {
  return `${studentUsername || 'guest'}:${exerciseId}:${attempt}`;
}

export interface GeneratedTransactionScenario {
  id: string;
  seed: string;
  categoryLabel: string;
  title: string;
  promptAr: string;
  amountFils: Fils;
  secondaryAmountFils?: Fils;
  expectedImpact: EquationImpactAnswer;
  expectedEntry: JournalEntry;
  explanationAr: string;
  affectsIncomeStatement: boolean;
  incomeStatementEffectAr: string;
}

const COMPANY_NAMES = [
  'مؤسسة البتراء للتجارة',
  'شركة عمّان للتوريدات التقنية',
  'مكتب اليرموك للاستشارات',
  'مؤسسة جرش للتجهيزات المكتبية',
  'شركة العقبة للخدمات اللوجستية',
];

export type TransactionTemplateId =
  | 'owner_cash_investment'
  | 'buy_equipment_cash'
  | 'buy_furniture_credit'
  | 'buy_vehicle_mixed'
  | 'service_revenue_cash'
  | 'service_revenue_credit'
  | 'collect_receivable_bank'
  | 'pay_rent_cash'
  | 'pay_salaries_bank'
  | 'pay_payable_cash'
  | 'owner_drawings_cash'
  | 'obtain_bank_loan';

export function generateUnit2Transaction(
  templateId: TransactionTemplateId,
  seed: string
): GeneratedTransactionScenario {
  const rng = new SeededRandom(seed);
  const company = rng.pick(COMPANY_NAMES);

  switch (templateId) {
    case 'owner_cash_investment': {
      const amt = rng.amountFils(8000, 25000, 500);
      return {
        id: `${templateId}-${hashSeed(seed)}`,
        seed,
        categoryLabel: 'تكوين رأس المال',
        title: 'استثمار نقدي من المالك',
        promptAr: `أودع مالك "${company}" مبلغ ${formatFilsShort(amt)} نقداً في صندوق المنشأة كرأس مال لبدء النشاط.`,
        amountFils: amt,
        expectedImpact: {
          assets: { direction: 'increase', amountFils: amt },
          liabilities: { direction: 'none', amountFils: 0 },
          equity: { direction: 'increase', amountFils: amt },
          netIncomeEffect: 'none',
        },
        expectedEntry: {
          id: `gen-${templateId}`,
          date: '2026-11-01',
          description: 'إيداع رأس مال نقدي في الصندوق',
          lines: [
            { accountId: 'cash', side: 'debit', amountFils: amt },
            { accountId: 'capital', side: 'credit', amountFils: amt },
          ],
        },
        explanationAr:
          'إيداع رأس المال يزيد النقدية في الصندوق (أصل: زيادة) ويزيد رأس المال في حقوق الملكية (حقوق ملكية: زيادة) بنفس المبلغ، ولا يؤثر على قائمة الدخل لأنه عملية تمويلية لا إيراداً تشغيلياً.',
        affectsIncomeStatement: false,
        incomeStatementEffectAr: 'لا أثر على قائمة الدخل (تؤثر على قائمة حقوق الملكية والمركز المالي فقط).',
      };
    }

    case 'buy_equipment_cash': {
      const amt = rng.amountFils(1200, 4800, 200);
      return {
        id: `${templateId}-${hashSeed(seed)}`,
        seed,
        categoryLabel: 'تبادل أصول',
        title: 'شراء أجهزة ومعدات نقداً',
        promptAr: `اشترت "${company}" أجهزة حاسوب ومعدات مكتبية بمبلغ ${formatFilsShort(amt)} وسددت القيمة نقداً من الصندوق.`,
        amountFils: amt,
        expectedImpact: {
          assets: { direction: 'none', amountFils: 0 },
          liabilities: { direction: 'none', amountFils: 0 },
          equity: { direction: 'none', amountFils: 0 },
          netIncomeEffect: 'none',
        },
        expectedEntry: {
          id: `gen-${templateId}`,
          date: '2026-11-03',
          description: 'شراء أجهزة ومعدات نقداً',
          lines: [
            { accountId: 'equipment', side: 'debit', amountFils: amt },
            { accountId: 'cash', side: 'credit', amountFils: amt },
          ],
        },
        explanationAr:
          'زاد أصل (الأجهزة والمعدات) ونقص أصل آخر (النقدية في الصندوق) بنفس القيمة، لذلك يبقى صافي إجمالي الأصول ثابتاً دون أي تغيير في الالتزامات أو حقوق الملكية.',
        affectsIncomeStatement: false,
        incomeStatementEffectAr: 'لا أثر على قائمة الدخل؛ لأن شراء الأصل الثابت تبادل داخل بنود المركز المالي.',
      };
    }

    case 'buy_furniture_credit': {
      const amt = rng.amountFils(1500, 6000, 250);
      return {
        id: `${templateId}-${hashSeed(seed)}`,
        seed,
        categoryLabel: 'زيادة أصل والتزام',
        title: 'شراء أثاث على الحساب (بالأجل)',
        promptAr: `اشترت "${company}" أثاثاً مكتبياً بمبلغ ${formatFilsShort(amt)} من معرض الأثاث الحديث على الحساب (يسدد بعد شهر).`,
        amountFils: amt,
        expectedImpact: {
          assets: { direction: 'increase', amountFils: amt },
          liabilities: { direction: 'increase', amountFils: amt },
          equity: { direction: 'none', amountFils: 0 },
          netIncomeEffect: 'none',
        },
        expectedEntry: {
          id: `gen-${templateId}`,
          date: '2026-11-05',
          description: 'شراء أثاث بالأجل',
          lines: [
            { accountId: 'furniture', side: 'debit', amountFils: amt },
            { accountId: 'accounts_payable', side: 'credit', amountFils: amt },
          ],
        },
        explanationAr:
          'الشراء بالأجل يزيد الأصول (الأثاث) ويزيد الالتزامات (الدائنون) بنفس المقدار في طرفي معادلة الميزانية دون مساس بحقوق الملكية.',
        affectsIncomeStatement: false,
        incomeStatementEffectAr: 'لا أثر على قائمة الدخل؛ التغير يظهر في المركز المالي (أصل ثابت مقابل التزام متداول).',
      };
    }

    case 'buy_vehicle_mixed': {
      const total = rng.amountFils(8000, 16000, 1000);
      const paidRatio = rng.pick([0.25, 0.5]);
      const cashPart = Math.round(total * paidRatio);
      const creditPart = total - cashPart;
      return {
        id: `${templateId}-${hashSeed(seed)}`,
        seed,
        categoryLabel: 'عملية مركبة',
        title: 'شراء سيارة بدفع جزء بشيك والباقي بالأجل',
        promptAr: `اقتنت "${company}" سيارة توزيع بقيمة ${formatFilsShort(total)}، دفعت ${formatFilsShort(cashPart)} بشيك بنكي والباقي (${formatFilsShort(creditPart)}) على الحساب.`,
        amountFils: total,
        secondaryAmountFils: cashPart,
        expectedImpact: {
          assets: { direction: 'increase', amountFils: creditPart },
          liabilities: { direction: 'increase', amountFils: creditPart },
          equity: { direction: 'none', amountFils: 0 },
          netIncomeEffect: 'none',
        },
        expectedEntry: {
          id: `gen-${templateId}`,
          date: '2026-11-06',
          description: 'شراء سيارة بشيك والباقي على الحساب',
          lines: [
            { accountId: 'vehicles', side: 'debit', amountFils: total },
            { accountId: 'bank', side: 'credit', amountFils: cashPart },
            { accountId: 'accounts_payable', side: 'credit', amountFils: creditPart },
          ],
        },
        explanationAr:
          `زادت الأصول بقيمة السيارة (+${formatFilsShort(total)}) ونقصت بقيمة الشيك (-${formatFilsShort(cashPart)}) فصافي الزيادة في الأصول هو ${formatFilsShort(creditPart)}، وهو نفس مقدار الزيادة في الالتزامات (الدائنين).`,
        affectsIncomeStatement: false,
        incomeStatementEffectAr: 'لا أثر على قائمة الدخل؛ يظهر الأثر بالكامل في قائمة المركز المالي.',
      };
    }

    case 'service_revenue_cash': {
      const amt = rng.amountFils(900, 4500, 100);
      return {
        id: `${templateId}-${hashSeed(seed)}`,
        seed,
        categoryLabel: 'إيرادات تشغيلية',
        title: 'تقديم خدمات وتحصيل قيمتها نقداً',
        promptAr: `قدمت "${company}" خدمات استشارية لعميل وقبضت أتعابها البالغة ${formatFilsShort(amt)} نقداً في الصندوق.`,
        amountFils: amt,
        expectedImpact: {
          assets: { direction: 'increase', amountFils: amt },
          liabilities: { direction: 'none', amountFils: 0 },
          equity: { direction: 'increase', amountFils: amt },
          netIncomeEffect: 'increase',
        },
        expectedEntry: {
          id: `gen-${templateId}`,
          date: '2026-11-08',
          description: 'تحصيل إيراد خدمات نقداً',
          lines: [
            { accountId: 'cash', side: 'debit', amountFils: amt },
            { accountId: 'service_revenue', side: 'credit', amountFils: amt },
          ],
        },
        explanationAr:
          'تحصيل الإيراد يزيد النقدية في الأصول، ويرفع الإيرادات في قائمة الدخل مما يزيد صافي الربح الذي ينتقل بدوره لزيادة حقوق الملكية.',
        affectsIncomeStatement: true,
        incomeStatementEffectAr: `ترفع إيرادات الخدمات وصافي الدخل بمقدار +${formatFilsShort(amt)}، ثم ينتقل الصافي إلى قائمة حقوق الملكية.`,
      };
    }

    case 'service_revenue_credit': {
      const amt = rng.amountFils(1100, 4200, 100);
      return {
        id: `${templateId}-${hashSeed(seed)}`,
        seed,
        categoryLabel: 'تحقق الإيراد بالآجل',
        title: 'تقديم خدمات على الحساب',
        promptAr: `أنجزت "${company}" مشروعاً للعميل "شركة الأمل" بقيمة ${formatFilsShort(amt)} على أن يُحصل المبلغ بعد أسبوعين.`,
        amountFils: amt,
        expectedImpact: {
          assets: { direction: 'increase', amountFils: amt },
          liabilities: { direction: 'none', amountFils: 0 },
          equity: { direction: 'increase', amountFils: amt },
          netIncomeEffect: 'increase',
        },
        expectedEntry: {
          id: `gen-${templateId}`,
          date: '2026-11-10',
          description: 'إثبات إيراد خدمات على الحساب',
          lines: [
            { accountId: 'accounts_receivable', side: 'debit', amountFils: amt },
            { accountId: 'service_revenue', side: 'credit', amountFils: amt },
          ],
        },
        explanationAr:
          'وفق مبدأ تحقق الإيراد والاستحقاق، يُعترف بالإيراد عند تقديم الخدمة حتى لو لم يُقبض النقد بعد؛ فتزيد الذمم المدينة (أصل) وتزيد حقوق الملكية عبر صافي الربح.',
        affectsIncomeStatement: true,
        incomeStatementEffectAr: `يزيد إيراد الخدمات وصافي الربح بمقدار +${formatFilsShort(amt)} رغم عدم استلام النقد بعد.`,
      };
    }

    case 'collect_receivable_bank': {
      const amt = rng.amountFils(600, 3000, 100);
      return {
        id: `${templateId}-${hashSeed(seed)}`,
        seed,
        categoryLabel: 'تحصيل ذمم مدينة',
        title: 'تحصيل دين من عميل بشيك أودع في البنك',
        promptAr: `استلمت "${company}" شيكاً بقيمة ${formatFilsShort(amt)} من أحد العملاء سداداً لرصيد مستحق عليه وأودعته في الحساب البنكي.`,
        amountFils: amt,
        expectedImpact: {
          assets: { direction: 'none', amountFils: 0 },
          liabilities: { direction: 'none', amountFils: 0 },
          equity: { direction: 'none', amountFils: 0 },
          netIncomeEffect: 'none',
        },
        expectedEntry: {
          id: `gen-${templateId}`,
          date: '2026-11-12',
          description: 'تحصيل ذمم مدينة بشيك في البنك',
          lines: [
            { accountId: 'bank', side: 'debit', amountFils: amt },
            { accountId: 'accounts_receivable', side: 'credit', amountFils: amt },
          ],
        },
        explanationAr:
          'تحصيل الذمة المدينة هو استبدال أصل (المدينون) بأصل آخر (النقدية لدى البنك). الإيراد تم الاعتراف به مسبقاً عند البيع، لذا لا يتأثر الإيراد ولا حقوق الملكية الآن.',
        affectsIncomeStatement: false,
        incomeStatementEffectAr: 'لا أثر على قائمة الدخل؛ لأن الإيراد سُجل سابقاً وقت تقديم الخدمة.',
      };
    }

    case 'pay_rent_cash': {
      const amt = rng.amountFils(450, 1800, 50);
      return {
        id: `${templateId}-${hashSeed(seed)}`,
        seed,
        categoryLabel: 'مصروفات تشغيلية',
        title: 'دفع إيجار المقر نقداً',
        promptAr: `سددت "${company}" إيجار مقرها الشهري البالغ ${formatFilsShort(amt)} نقداً من الصندوق.`,
        amountFils: amt,
        expectedImpact: {
          assets: { direction: 'decrease', amountFils: amt },
          liabilities: { direction: 'none', amountFils: 0 },
          equity: { direction: 'decrease', amountFils: amt },
          netIncomeEffect: 'decrease',
        },
        expectedEntry: {
          id: `gen-${templateId}`,
          date: '2026-11-14',
          description: 'سداد مصروف الإيجار الشهري نقداً',
          lines: [
            { accountId: 'rent_expense', side: 'debit', amountFils: amt },
            { accountId: 'cash', side: 'credit', amountFils: amt },
          ],
        },
        explanationAr:
          'دفع المصروف يخفض النقدية في الأصول، ويزيد المصروفات في قائمة الدخل مما يخفض صافي الربح وبالتالي يخفض حقوق الملكية بنفس المقدار.',
        affectsIncomeStatement: true,
        incomeStatementEffectAr: `يزيد مصروف الإيجار ويخفض صافي الدخل بمقدار -${formatFilsShort(amt)}.`,
      };
    }

    case 'pay_salaries_bank': {
      const amt = rng.amountFils(1400, 5000, 100);
      return {
        id: `${templateId}-${hashSeed(seed)}`,
        seed,
        categoryLabel: 'مصروفات تشغيلية',
        title: 'صرف رواتب الموظفين بتحويل بنكي',
        promptAr: `حولت "${company}" رواتب الموظفين لشهر تشرين الثاني البالغة ${formatFilsShort(amt)} من حسابها البنكي.`,
        amountFils: amt,
        expectedImpact: {
          assets: { direction: 'decrease', amountFils: amt },
          liabilities: { direction: 'none', amountFils: 0 },
          equity: { direction: 'decrease', amountFils: amt },
          netIncomeEffect: 'decrease',
        },
        expectedEntry: {
          id: `gen-${templateId}`,
          date: '2026-11-16',
          description: 'دفع رواتب الموظفين عبر البنك',
          lines: [
            { accountId: 'salaries_expense', side: 'debit', amountFils: amt },
            { accountId: 'bank', side: 'credit', amountFils: amt },
          ],
        },
        explanationAr:
          'تحويل الرواتب يخفض الرصيد البنكي (أصل) ويثبت مصروف الرواتب الذي يخفض صافي الربح وحقوق الملكية.',
        affectsIncomeStatement: true,
        incomeStatementEffectAr: `يخفض صافي الدخل بمقدار -${formatFilsShort(amt)} لارتفاع المصروفات التشغيلية.`,
      };
    }

    case 'pay_payable_cash': {
      const amt = rng.amountFils(700, 3200, 100);
      return {
        id: `${templateId}-${hashSeed(seed)}`,
        seed,
        categoryLabel: 'سداد التزامات',
        title: 'سداد جزء من المستحق للموردين',
        promptAr: `سددت "${company}" مبلغ ${formatFilsShort(amt)} نقداً لأحد الموردين تسديداً لرصيد مستحق من مشتريات سابقة.`,
        amountFils: amt,
        expectedImpact: {
          assets: { direction: 'decrease', amountFils: amt },
          liabilities: { direction: 'decrease', amountFils: amt },
          equity: { direction: 'none', amountFils: 0 },
          netIncomeEffect: 'none',
        },
        expectedEntry: {
          id: `gen-${templateId}`,
          date: '2026-11-18',
          description: 'سداد دفعة للدائنين نقداً',
          lines: [
            { accountId: 'accounts_payable', side: 'debit', amountFils: amt },
            { accountId: 'cash', side: 'credit', amountFils: amt },
          ],
        },
        explanationAr:
          'ينقص الأصل (النقدية) وينقص الالتزام (الدائنون) بنفس المقدار، ولا يتأثر صافي الربح لأن سداد الدين ليس مصروفاً.',
        affectsIncomeStatement: false,
        incomeStatementEffectAr: 'لا أثر على قائمة الدخل؛ سداد الدائنين يخفض الأصول والالتزامات في المركز المالي.',
      };
    }

    case 'owner_drawings_cash': {
      const amt = rng.amountFils(350, 1500, 50);
      return {
        id: `${templateId}-${hashSeed(seed)}`,
        seed,
        categoryLabel: 'المسحوبات الشخصية',
        title: 'سحب نقدي شخصي من المالك',
        promptAr: `سحب مالك "${company}" مبلغ ${formatFilsShort(amt)} من صندوق المنشأة لتغطية نفقاته الأسرية الخاصة.`,
        amountFils: amt,
        expectedImpact: {
          assets: { direction: 'decrease', amountFils: amt },
          liabilities: { direction: 'none', amountFils: 0 },
          equity: { direction: 'decrease', amountFils: amt },
          netIncomeEffect: 'none',
        },
        expectedEntry: {
          id: `gen-${templateId}`,
          date: '2026-11-20',
          description: 'مسحوبات شخصية نقدية للمالك',
          lines: [
            { accountId: 'drawings', side: 'debit', amountFils: amt },
            { accountId: 'cash', side: 'credit', amountFils: amt },
          ],
        },
        explanationAr:
          'تطبيقاً لفرض الشخصية المعنوية، تُسجل مسحوبات المالك في حساب المسحوبات الشخصية (تخفض حقوق الملكية والأصول) ولا تُدرج كمصروف في قائمة الدخل.',
        affectsIncomeStatement: false,
        incomeStatementEffectAr: 'لا أثر على قائمة الدخل؛ المسحوبات تخفض حقوق الملكية مباشرة في قائمة حقوق الملكية.',
      };
    }

    case 'obtain_bank_loan': {
      const amt = rng.amountFils(5000, 20000, 1000);
      return {
        id: `${templateId}-${hashSeed(seed)}`,
        seed,
        categoryLabel: 'التمويل بالاقتراض',
        title: 'الحصول على قرض بنكي وإيداعه في الحساب الجاري',
        promptAr: `حصلت "${company}" على قرض تمويلي من البنك بقيمة ${formatFilsShort(amt)} أودع مباشرة في حسابها البنكي.`,
        amountFils: amt,
        expectedImpact: {
          assets: { direction: 'increase', amountFils: amt },
          liabilities: { direction: 'increase', amountFils: amt },
          equity: { direction: 'none', amountFils: 0 },
          netIncomeEffect: 'none',
        },
        expectedEntry: {
          id: `gen-${templateId}`,
          date: '2026-11-22',
          description: 'الحصول على قرض بنكي وإيداعه في البنك',
          lines: [
            { accountId: 'bank', side: 'debit', amountFils: amt },
            { accountId: 'loans', side: 'credit', amountFils: amt },
          ],
        },
        explanationAr:
          'إيداع القرض يرفع النقدية لدى البنك (أصل) وينشئ التزاماً طويل الأجل (القروض البنكية)، ولا يمثل إيراداً.',
        affectsIncomeStatement: false,
        incomeStatementEffectAr: 'لا أثر على قائمة الدخل؛ القرض التزام تمويلي يظهر في المركز المالي.',
      };
    }
  }
}

export const ALL_UNIT2_TEMPLATES: TransactionTemplateId[] = [
  'owner_cash_investment',
  'buy_equipment_cash',
  'buy_furniture_credit',
  'buy_vehicle_mixed',
  'service_revenue_cash',
  'service_revenue_credit',
  'collect_receivable_bank',
  'pay_rent_cash',
  'pay_salaries_bank',
  'pay_payable_cash',
  'owner_drawings_cash',
  'obtain_bank_loan',
];

export function generateSpeedChallengeSequence(
  seed: string,
  count = 6
): GeneratedTransactionScenario[] {
  const rng = new SeededRandom(seed);
  const picked = rng.shuffle(ALL_UNIT2_TEMPLATES).slice(0, count);
  return picked.map((tpl, idx) =>
    generateUnit2Transaction(tpl, `${seed}:seq:${idx}`)
  );
}
