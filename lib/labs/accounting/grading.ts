import {
  Fils,
  formatFilsShort,
  getAccountById,
  getAccountName,
} from './accounts';
import { JournalEntry, JournalLine, validateJournalEntry } from './engine';

export interface EntryGradeDetail {
  modelEntryId: string;
  matchedStudentIndex: number | null;
  score: number;
  maxScore: number;
  isFullyCorrect: boolean;
  reasonsAr: string[];
  errorTags: string[];
}

export interface JournalGradingResult {
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  entryDetails: EntryGradeDetail[];
  summaryFeedbackAr: string;
  whyWrongListAr: string[];
}

export type EquationDirection = 'increase' | 'decrease' | 'none';

export interface EquationElementImpact {
  direction: EquationDirection;
  amountFils: Fils;
}

export interface EquationImpactAnswer {
  assets: EquationElementImpact;
  liabilities: EquationElementImpact;
  equity: EquationElementImpact;
  netIncomeEffect?: EquationDirection;
}

export interface EquationImpactGradeResult {
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  elementResults: {
    element: 'assets' | 'liabilities' | 'equity';
    labelAr: string;
    directionCorrect: boolean;
    amountCorrect: boolean;
    feedbackAr: string;
  }[];
  summaryFeedbackAr: string;
}

function aggregateLinesByAccount(
  lines: JournalLine[]
): Map<string, Fils> {
  const map = new Map<string, Fils>();
  for (const l of lines) {
    const prev = map.get(l.accountId) || 0;
    map.set(l.accountId, prev + Math.round(l.amountFils || 0));
  }
  return map;
}

function scoreSingleEntryPair(
  student: JournalEntry,
  model: JournalEntry,
  maxPoints: number
): Omit<EntryGradeDetail, 'modelEntryId' | 'matchedStudentIndex'> {
  const validation = validateJournalEntry(student);
  const reasonsAr: string[] = [];
  const errorTags: string[] = [];

  if (!validation.isValid) {
    reasonsAr.push(...validation.errors);
    errorTags.push('قيد غير متوازن أو غير صالح');
  }

  const sDebits = aggregateLinesByAccount(
    student.lines.filter((l) => l.side === 'debit')
  );
  const sCredits = aggregateLinesByAccount(
    student.lines.filter((l) => l.side === 'credit')
  );
  const mDebits = aggregateLinesByAccount(
    model.lines.filter((l) => l.side === 'debit')
  );
  const mCredits = aggregateLinesByAccount(
    model.lines.filter((l) => l.side === 'credit')
  );

  const sDebitKeys = Array.from(sDebits.keys()).sort();
  const sCreditKeys = Array.from(sCredits.keys()).sort();
  const mDebitKeys = Array.from(mDebits.keys()).sort();
  const mCreditKeys = Array.from(mCredits.keys()).sort();

  const debitAccountsExact =
    sDebitKeys.length === mDebitKeys.length &&
    sDebitKeys.every((k, i) => k === mDebitKeys[i]);
  const creditAccountsExact =
    sCreditKeys.length === mCreditKeys.length &&
    sCreditKeys.every((k, i) => k === mCreditKeys[i]);

  const isReversed =
    !debitAccountsExact &&
    !creditAccountsExact &&
    sDebitKeys.length === mCreditKeys.length &&
    sCreditKeys.length === mDebitKeys.length &&
    sDebitKeys.every((k, i) => k === mCreditKeys[i]) &&
    sCreditKeys.every((k, i) => k === mDebitKeys[i]);

  let earnedRatio = 0;

  // 15% لتوازن القيد وصلاحيته البنيوية
  if (validation.isValid) {
    earnedRatio += 0.15;
  }

  // 30% للطرف المدين
  if (debitAccountsExact) {
    earnedRatio += 0.3;
  } else {
    const matchedCount = mDebitKeys.filter((k) => sDebits.has(k)).length;
    if (matchedCount > 0) {
      earnedRatio += (0.3 * matchedCount) / Math.max(mDebitKeys.length, sDebitKeys.length);
    }
  }

  // 30% للطرف الدائن
  if (creditAccountsExact) {
    earnedRatio += 0.3;
  } else {
    const matchedCount = mCreditKeys.filter((k) => sCredits.has(k)).length;
    if (matchedCount > 0) {
      earnedRatio += (0.3 * matchedCount) / Math.max(mCreditKeys.length, sCreditKeys.length);
    }
  }

  // 25% لدقة المبالغ بالفلس
  let allAmountsExact = true;
  let amountMatches = 0;
  const totalModelLines = mDebitKeys.length + mCreditKeys.length;

  for (const [accId, mAmt] of mDebits.entries()) {
    if (sDebits.get(accId) === mAmt) {
      amountMatches += 1;
    } else {
      allAmountsExact = false;
    }
  }
  for (const [accId, mAmt] of mCredits.entries()) {
    if (sCredits.get(accId) === mAmt) {
      amountMatches += 1;
    } else {
      allAmountsExact = false;
    }
  }

  if (allAmountsExact && sDebitKeys.length === mDebitKeys.length && sCreditKeys.length === mCreditKeys.length) {
    earnedRatio += 0.25;
  } else {
    const totalStudentDebit = Array.from(sDebits.values()).reduce((a, b) => a + b, 0);
    const totalModelDebit = Array.from(mDebits.values()).reduce((a, b) => a + b, 0);
    if (totalModelLines > 0 && amountMatches > 0) {
      earnedRatio += (0.25 * amountMatches) / totalModelLines;
    } else if (totalStudentDebit === totalModelDebit && totalModelDebit > 0) {
      earnedRatio += 0.12;
    }
  }

  // صياغة رسائل "لماذا هذا خطأ؟" بالعربية
  if (isReversed) {
    errorTags.push('عكس طرفي القيد');
    reasonsAr.push(
      'تم عكس القيد المحاسبي: جعلت الحساب الذي يجب أن يكون مديناً في الطرف الدائن والعكس. تذكر أن الأصول والمصروفات تزيد بالمدين، بينما الالتزامات ورأس المال والإيرادات تزيد بالدائن.'
    );
  } else {
    if (!debitAccountsExact) {
      errorTags.push('خطأ في الطرف المدين');
      const expectedNames = mDebitKeys.map(getAccountName).join('، ');
      const studentNames = sDebitKeys.map(getAccountName).join('، ') || 'لا يوجد';
      const hintExtra = buildAccountConfusionReason(sDebitKeys, mDebitKeys, 'debit');
      reasonsAr.push(
        `الطرف المدين غير دقيق: اخترت (${studentNames}) بينما الصحيح هو (${expectedNames}).${hintExtra ? ` ${hintExtra}` : ''}`
      );
    }

    if (!creditAccountsExact) {
      errorTags.push('خطأ في الطرف الدائن');
      const expectedNames = mCreditKeys.map(getAccountName).join('، ');
      const studentNames = sCreditKeys.map(getAccountName).join('، ') || 'لا يوجد';
      const hintExtra = buildAccountConfusionReason(sCreditKeys, mCreditKeys, 'credit');
      reasonsAr.push(
        `الطرف الدائن غير دقيق: اخترت (${studentNames}) بينما الصحيح هو (${expectedNames}).${hintExtra ? ` ${hintExtra}` : ''}`
      );
    }
  }

  if (!allAmountsExact && debitAccountsExact && creditAccountsExact) {
    errorTags.push('خطأ في المبلغ');
    const expectedTotal = Array.from(mDebits.values()).reduce((a, b) => a + b, 0);
    reasonsAr.push(
      `توجيه الحسابات صحيح، لكن المبالغ غير مطابقة لقيمة العملية (${formatFilsShort(expectedTotal)}).`
    );
  }

  const isFullyCorrect =
    validation.isValid && debitAccountsExact && creditAccountsExact && allAmountsExact;

  const score = isFullyCorrect
    ? maxPoints
    : Math.round(Math.min(maxPoints * 0.95, maxPoints * earnedRatio) * 10) / 10;

  return {
    score,
    maxScore: maxPoints,
    isFullyCorrect,
    reasonsAr: isFullyCorrect ? ['القيد صحيح ومتوازن بالكامل.'] : reasonsAr,
    errorTags,
  };
}

function buildAccountConfusionReason(
  studentAccountIds: string[],
  modelAccountIds: string[],
  side: 'debit' | 'credit'
): string {
  if (studentAccountIds.includes('cash') && modelAccountIds.includes('bank')) {
    return 'عند الدفع أو التحصيل بشيك أو تحويل مصرفي يُستخدم حساب النقدية لدى البنك وليس الصندوق.';
  }
  if (studentAccountIds.includes('bank') && modelAccountIds.includes('cash')) {
    return 'العملية تمت نقداً عبر الصندوق وليس عبر الحساب البنكي.';
  }
  if (
    studentAccountIds.includes('accounts_payable') &&
    modelAccountIds.includes('accounts_receivable')
  ) {
    return 'المبالغ المستحقة على العملاء هي ذمم مدينة (مدينون)، أما الدائنون فهي للموردين.';
  }
  if (
    studentAccountIds.includes('accounts_receivable') &&
    modelAccountIds.includes('accounts_payable')
  ) {
    return 'المبالغ المستحقة للموردين عند الشراء على الحساب هي التزام (دائنون) وليست ذمماً مدينة.';
  }
  const hasExpenseInStudent = studentAccountIds.some(
    (id) => getAccountById(id)?.category === 'expense'
  );
  const hasAssetInModel = modelAccountIds.some(
    (id) => getAccountById(id)?.category === 'asset'
  );
  if (hasExpenseInStudent && hasAssetInModel && side === 'debit') {
    return 'شراء أصل طويل الأجل (مثل الأجهزة أو الأثاث أو السيارات) يُرسمل كأصل ولا يُسجل كمصروف.';
  }
  return '';
}

export function gradeJournalEntrySubmission(
  studentEntries: JournalEntry[],
  modelEntries: JournalEntry[],
  maxScore = 100
): JournalGradingResult {
  if (modelEntries.length === 0) {
    return {
      score: maxScore,
      maxScore,
      percentage: 100,
      passed: true,
      entryDetails: [],
      summaryFeedbackAr: 'لا توجد قيود مطلوبة في هذا التمرين.',
      whyWrongListAr: [],
    };
  }

  const pointsPerEntry = maxScore / modelEntries.length;
  const usedStudentIndices = new Set<number>();
  const entryDetails: EntryGradeDetail[] = [];

  // مطابقة مرنة تقبل أي ترتيب للقيود عبر اختيار أفضل قيد طالب غير مستخدم لكل قيد نموذجي
  for (const modelEntry of modelEntries) {
    let bestIndex: number | null = null;
    let bestEval: Omit<EntryGradeDetail, 'modelEntryId' | 'matchedStudentIndex'> | null =
      null;

    studentEntries.forEach((studentEntry, idx) => {
      if (usedStudentIndices.has(idx)) return;
      const evaluation = scoreSingleEntryPair(
        studentEntry,
        modelEntry,
        pointsPerEntry
      );
      if (!bestEval || evaluation.score > bestEval.score) {
        bestEval = evaluation;
        bestIndex = idx;
      }
    });

    if (bestIndex !== null && bestEval !== null) {
      usedStudentIndices.add(bestIndex);
      const chosenEval: Omit<EntryGradeDetail, 'modelEntryId' | 'matchedStudentIndex'> = bestEval;
      entryDetails.push({
        modelEntryId: modelEntry.id,
        matchedStudentIndex: bestIndex,
        score: chosenEval.score,
        maxScore: chosenEval.maxScore,
        isFullyCorrect: chosenEval.isFullyCorrect,
        reasonsAr: chosenEval.reasonsAr,
        errorTags: chosenEval.errorTags,
      });
    } else {
      entryDetails.push({
        modelEntryId: modelEntry.id,
        matchedStudentIndex: null,
        score: 0,
        maxScore: pointsPerEntry,
        isFullyCorrect: false,
        reasonsAr: [`لم يتم تسجيل القيد المطلوب: "${modelEntry.description}".`],
        errorTags: ['قيد مفقود'],
      });
    }
  }

  const extraEntriesCount = Math.max(0, studentEntries.length - usedStudentIndices.size);
  const rawScore = entryDetails.reduce((s, d) => s + d.score, 0);
  const penalty = extraEntriesCount * (pointsPerEntry * 0.25);
  const score = Math.max(0, Math.min(maxScore, Math.round(rawScore - penalty)));
  const percentage = Math.round((score / maxScore) * 100);
  const passed = percentage >= 60;

  const whyWrongListAr: string[] = [];
  entryDetails.forEach((d, i) => {
    if (!d.isFullyCorrect) {
      whyWrongListAr.push(`القيد ${i + 1}: ${d.reasonsAr.join(' ')}`);
    }
  });
  if (extraEntriesCount > 0) {
    whyWrongListAr.push(
      `تم إدخال ${extraEntriesCount} قيد إضافي غير مطلوب للعملية.`
    );
  }

  return {
    score,
    maxScore,
    percentage,
    passed,
    entryDetails,
    summaryFeedbackAr:
      percentage === 100
        ? 'عمل ممتاز! جميع القيود متوازنة وصحيحة في الحسابات والمبالغ.'
        : passed
        ? 'أداء جيد، تم تسجيل معظم القيود بدقة مع وجود ملاحظات جزئية يمكنك مراجعتها.'
        : 'تحتاج بعض القيود إلى إعادة مراجعة في تحديد الطرف المدين والدائن أو المبالغ.',
    whyWrongListAr,
  };
}

export function gradeEquationImpactSubmission(
  student: EquationImpactAnswer,
  expected: EquationImpactAnswer,
  maxScore = 100
): EquationImpactGradeResult {
  const elements: {
    key: 'assets' | 'liabilities' | 'equity';
    labelAr: string;
  }[] = [
    { key: 'assets', labelAr: 'الأصول' },
    { key: 'liabilities', labelAr: 'الالتزامات' },
    { key: 'equity', labelAr: 'حقوق الملكية' },
  ];

  const weightPerElement = maxScore / 3;
  let totalScore = 0;

  const elementResults = elements.map(({ key, labelAr }) => {
    const s = student[key];
    const e = expected[key];
    const dirOk = s.direction === e.direction;
    const expectedAmt = e.direction === 'none' ? 0 : e.amountFils;
    const studentAmt = s.direction === 'none' ? 0 : s.amountFils;
    const amtOk = studentAmt === expectedAmt;

    let earned = 0;
    if (dirOk) earned += weightPerElement * 0.5;
    if (amtOk && dirOk) earned += weightPerElement * 0.5;
    totalScore += earned;

    const dirLabel = (d: EquationDirection) =>
      d === 'increase' ? 'زيادة' : d === 'decrease' ? 'نقص' : 'لا أثر';

    let feedbackAr = '';
    if (dirOk && amtOk) {
      feedbackAr =
        e.direction === 'none'
          ? `${labelAr}: صحيح، لا يتأثر هذا الجانب بالعملية.`
          : `${labelAr}: صحيح (${dirLabel(e.direction)} بمقدار ${formatFilsShort(expectedAmt)}).`;
    } else if (!dirOk) {
      feedbackAr = `${labelAr}: اخترت "${dirLabel(s.direction)}" بينما الصحيح هو "${dirLabel(e.direction)}"${
        e.direction !== 'none' ? ` بمبلغ ${formatFilsShort(expectedAmt)}` : ''
      }.`;
    } else {
      feedbackAr = `${labelAr}: الاتجاه (${dirLabel(e.direction)}) صحيح، لكن المبلغ الصحيح هو ${formatFilsShort(expectedAmt)}.`;
    }

    return {
      element: key,
      labelAr,
      directionCorrect: dirOk,
      amountCorrect: amtOk,
      feedbackAr,
    };
  });

  const score = Math.min(maxScore, Math.round(totalScore));
  const percentage = Math.round((score / maxScore) * 100);
  const passed = percentage >= 70;

  return {
    score,
    maxScore,
    percentage,
    passed,
    elementResults,
    summaryFeedbackAr:
      percentage === 100
        ? 'تحليل دقيق! حافظت على توازن المعادلة المحاسبية بالكامل.'
        : passed
        ? 'تحليل قريب من الدقة، راجع العنصر الذي اختلف في المبلغ أو الاتجاه.'
        : 'هناك خلل في تحليل أثر العملية على طرفي المعادلة (الأصول = الالتزامات + حقوق الملكية).',
  };
}

export function calculateExerciseXp(params: {
  baseXp: number;
  difficulty: 'easy' | 'medium' | 'hard';
  hintsUsed: number;
  timeSpentSec?: number;
  isRetry?: boolean;
}): number {
  const difficultyMultiplier =
    params.difficulty === 'hard'
      ? 1.4
      : params.difficulty === 'medium'
      ? 1.15
      : 1;
  const speedBonus =
    typeof params.timeSpentSec === 'number' && params.timeSpentSec <= 45
      ? 10
      : 0;
  const hintPenalty = Math.min(params.baseXp * 0.6, params.hintsUsed * 8);
  const raw = Math.round(params.baseXp * difficultyMultiplier + speedBonus - hintPenalty);
  const finalXp = params.isRetry ? Math.round(raw * 0.5) : raw;
  return Math.max(5, finalXp);
}
