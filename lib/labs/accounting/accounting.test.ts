import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FILS_PER_JOD,
  filsToJod,
  formatFils,
  getAccountById,
  jodToFils,
  parseJodInputToFils,
  searchAccounts,
} from './accounts';
import {
  analyzeTrialBalanceError,
  computeEquationTotalsFromLedger,
  generateTrialBalance,
  postEntriesToLedger,
  validateJournalEntry,
  type JournalEntry,
} from './engine';
import { generateAllFinancialStatements } from './statements';
import {
  calculateExerciseXp,
  gradeEquationImpactSubmission,
  gradeJournalEntrySubmission,
} from './grading';
import {
  ALL_UNIT2_TEMPLATES,
  SeededRandom,
  buildExerciseSeed,
  generateUnit2Transaction,
} from './generators';

test('وحدة الفلس: تجنب أخطاء الفاصلة العشرية وتنسيق الأرقام اللاتينية', () => {
  assert.equal(FILS_PER_JOD, 1000);
  const a = jodToFils(0.1);
  const b = jodToFils(0.2);
  assert.equal(a + b, jodToFils(0.3));
  assert.equal(a + b, 300);
  assert.equal(filsToJod(1250), 1.25);

  assert.equal(parseJodInputToFils('1,250.350'), 1250350);
  assert.equal(formatFils(1500000), '1,500');
  assert.equal(formatFils(1500250, { withCurrency: true }), '1,500.250 دينار');
  assert.equal(formatFils(2000, { forceDecimals: true }), '2.000');

  assert.ok(getAccountById('cash'));
  assert.ok(searchAccounts('النقدية').some((acc) => acc.id === 'cash'));
});

test('محرك القيد اليومي: التحقق من التوازن ورفض القيم السالبة وتكرار الحساب في الجانبين', () => {
  const emptyResult = validateJournalEntry({
    id: 'e0',
    date: '2026-11-01',
    description: 'قيد فارغ',
    lines: [],
  });
  assert.equal(emptyResult.isValid, false);

  const unbalanced = validateJournalEntry({
    id: 'e1',
    date: '2026-11-01',
    description: 'قيد غير متوازن',
    lines: [
      { accountId: 'cash', side: 'debit', amountFils: jodToFils(500) },
      { accountId: 'capital', side: 'credit', amountFils: jodToFils(400) },
    ],
  });
  assert.equal(unbalanced.isValid, false);
  assert.equal(unbalanced.differenceFils, jodToFils(100));

  const negativeLine = validateJournalEntry({
    id: 'e2',
    date: '2026-11-01',
    description: 'مبلغ سالب',
    lines: [
      { accountId: 'cash', side: 'debit', amountFils: -1000 },
      { accountId: 'capital', side: 'credit', amountFils: -1000 },
    ],
  });
  assert.equal(negativeLine.isValid, false);

  const sameAccountBothSides = validateJournalEntry({
    id: 'e3',
    date: '2026-11-01',
    description: 'حساب مكرر في الطرفين',
    lines: [
      { accountId: 'cash', side: 'debit', amountFils: jodToFils(100) },
      { accountId: 'cash', side: 'credit', amountFils: jodToFils(100) },
    ],
  });
  assert.equal(sameAccountBothSides.isValid, false);

  const valid = validateJournalEntry({
    id: 'e4',
    date: '2026-11-01',
    description: 'قيد تأسيس صحيح',
    lines: [
      { accountId: 'cash', side: 'debit', amountFils: jodToFils(10000) },
      { accountId: 'capital', side: 'credit', amountFils: jodToFils(10000) },
    ],
  });
  assert.equal(valid.isValid, true);
  assert.equal(valid.totalDebitFils, valid.totalCreditFils);
});

test('الترحيل وميزان المراجعة وتحليل الفروق وترابط القوائم المالية', () => {
  const entries: JournalEntry[] = [
    {
      id: 'j1',
      date: '2026-11-01',
      description: 'استثمار نقدي من المالك',
      lines: [
        { accountId: 'cash', side: 'debit', amountFils: jodToFils(20000) },
        { accountId: 'capital', side: 'credit', amountFils: jodToFils(20000) },
      ],
    },
    {
      id: 'j2',
      date: '2026-11-03',
      description: 'شراء أجهزة بالآجل',
      lines: [
        { accountId: 'equipment', side: 'debit', amountFils: jodToFils(4000) },
        { accountId: 'accounts_payable', side: 'credit', amountFils: jodToFils(4000) },
      ],
    },
    {
      id: 'j3',
      date: '2026-11-06',
      description: 'تحصيل إيراد خدمات نقداً',
      lines: [
        { accountId: 'cash', side: 'debit', amountFils: jodToFils(3500) },
        { accountId: 'service_revenue', side: 'credit', amountFils: jodToFils(3500) },
      ],
    },
    {
      id: 'j4',
      date: '2026-11-10',
      description: 'دفع مصروف إيجار نقداً',
      lines: [
        { accountId: 'rent_expense', side: 'debit', amountFils: jodToFils(1200) },
        { accountId: 'cash', side: 'credit', amountFils: jodToFils(1200) },
      ],
    },
  ];

  const ledger = postEntriesToLedger(entries);
  assert.equal(ledger.cash.balanceSide, 'debit');
  assert.equal(ledger.cash.balanceFils, jodToFils(22300));

  const tb = generateTrialBalance(ledger);
  assert.equal(tb.isBalanced, true);
  assert.equal(tb.differenceFils, 0);

  const eq = computeEquationTotalsFromLedger(ledger);
  assert.equal(eq.isBalanced, true);
  assert.equal(eq.assetsFils, jodToFils(26300));
  assert.equal(eq.liabilitiesFils, jodToFils(4000));
  assert.equal(eq.equityTotalFils, jodToFils(22300));

  const bundle = generateAllFinancialStatements(tb, entries);
  assert.equal(bundle.incomeStatement.netIncomeFils, jodToFils(2300));
  assert.equal(bundle.ownersEquityStatement.endingEquityFils, jodToFils(22300));
  assert.equal(bundle.balanceSheet.isBalanced, true);
  assert.equal(bundle.cashFlowStatement.endingCashFils, jodToFils(22300));
  assert.ok(bundle.articulationChecks.every((c) => c.passed));

  const diffHintDiv2 = analyzeTrialBalanceError(jodToFils(1000));
  assert.ok(diffHintDiv2.possibleCauses.some((c) => c.includes('القسمة على 2')));

  const diffHintDiv9 = analyzeTrialBalanceError(jodToFils(90));
  assert.ok(diffHintDiv9.possibleCauses.some((c) => c.includes('القسمة على 9')));
});

test('المصحح التلقائي للقيود ومعادلة الميزانية: قبول الترتيب البديل والعلامة الجزئية', () => {
  const modelEntries: JournalEntry[] = [
    {
      id: 'm1',
      date: '2026-11-01',
      description: 'تأسيس المنشأة',
      lines: [
        { accountId: 'cash', side: 'debit', amountFils: jodToFils(5000) },
        { accountId: 'capital', side: 'credit', amountFils: jodToFils(5000) },
      ],
    },
    {
      id: 'm2',
      date: '2026-11-02',
      description: 'دفع إيجار',
      lines: [
        { accountId: 'rent_expense', side: 'debit', amountFils: jodToFils(600) },
        { accountId: 'cash', side: 'credit', amountFils: jodToFils(600) },
      ],
    },
  ];

  // عكس ترتيب القيود يجب أن يحصل على 100%
  const reorderedStudent: JournalEntry[] = [modelEntries[1], modelEntries[0]];
  const exactReordered = gradeJournalEntrySubmission(reorderedStudent, modelEntries);
  assert.equal(exactReordered.percentage, 100);
  assert.equal(exactReordered.passed, true);

  // قيد معكوس الأطراف يعطي علامة جزئية مع رسالة توضيحية بالعربية
  const reversedEntry: JournalEntry[] = [
    {
      id: 's1',
      date: '2026-11-01',
      description: 'تأسيس معكوس',
      lines: [
        { accountId: 'capital', side: 'debit', amountFils: jodToFils(5000) },
        { accountId: 'cash', side: 'credit', amountFils: jodToFils(5000) },
      ],
    },
    modelEntries[1],
  ];
  const reversedGrade = gradeJournalEntrySubmission(reversedEntry, modelEntries);
  assert.ok(reversedGrade.percentage < 100);
  assert.ok(
    reversedGrade.whyWrongListAr.some((msg) => msg.includes('تم عكس القيد المحاسبي'))
  );
  assert.ok(
    reversedGrade.entryDetails.some((d) => d.errorTags.includes('عكس طرفي القيد'))
  );

  const eqGrade = gradeEquationImpactSubmission(
    {
      assets: { direction: 'increase', amountFils: jodToFils(1000) },
      liabilities: { direction: 'none', amountFils: 0 },
      equity: { direction: 'increase', amountFils: jodToFils(500) },
    },
    {
      assets: { direction: 'increase', amountFils: jodToFils(1000) },
      liabilities: { direction: 'none', amountFils: 0 },
      equity: { direction: 'increase', amountFils: jodToFils(1000) },
    }
  );
  assert.ok(eqGrade.percentage > 60 && eqGrade.percentage < 100);
  assert.ok(calculateExerciseXp({ baseXp: 50, difficulty: 'hard', hintsUsed: 1, timeSpentSec: 30 }) >= 5);
});

test('المولّد العشوائي ببذرة ثابتة: إعادة إنتاج نفس التمرين بالضبط لنفس الطالب والمحاولة', () => {
  const seed = buildExerciseSeed('yazan.nabulsi', 'u2-ex-1', 1);
  const s1 = generateUnit2Transaction('buy_vehicle_mixed', seed);
  const s2 = generateUnit2Transaction('buy_vehicle_mixed', seed);

  assert.deepEqual(s1, s2);
  assert.equal(validateJournalEntry(s1.expectedEntry).isValid, true);

  const otherSeed = buildExerciseSeed('yazan.nabulsi', 'u2-ex-1', 2);
  const r1 = new SeededRandom(seed).int(1, 1000000);
  const r2 = new SeededRandom(otherSeed).int(1, 1000000);
  assert.notEqual(r1, r2);

  for (const tpl of ALL_UNIT2_TEMPLATES) {
    const generated = generateUnit2Transaction(tpl, `check:${tpl}`);
    assert.equal(validateJournalEntry(generated.expectedEntry).isValid, true);
  }
});
