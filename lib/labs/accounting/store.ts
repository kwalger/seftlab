'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ssrSafeLocalStorage } from '@/lib/ssr-safe-storage';
import { ACCOUNTING_CURRICULUM, UNLOCK_THRESHOLD_PERCENT } from './curriculum';
import { JournalEntry } from './engine';

export interface ErrorNotebookItem {
  id: string;
  unitNumber: number;
  topicId: string;
  exerciseId: string;
  title: string;
  prompt: string;
  wrongSummary: string;
  whyExplanation: string;
  createdAt: string;
  resolved: boolean;
}

export interface UnitExamRecord {
  scorePct: number;
  passed: boolean;
  completedAt: string;
}

interface AccountingLabState {
  completedExerciseIds: string[];
  exerciseScores: Record<string, number>;
  exerciseAttempts: Record<string, number>;
  revealedHints: Record<string, number>;
  topicMastery: Record<string, { attempts: number; correct: number }>;
  unitExamResults: Record<number, UnitExamRecord>;
  bypassedUnits: number[];
  lastActiveUnit: number;
  lastActiveExerciseId: string | null;
  earnedBadges: string[];
  ledgerEntries: JournalEntry[];
  errorNotebook: ErrorNotebookItem[];
  speedChallengeBestScore: number;
  certificateIssued: boolean;
  unit1CompletedLessons: number[];
  unit1CurrentLesson: number;
  unit1CurrentStepByLesson: Record<number, number>;
  unit1CompletedQuizzes: string[];
  unit1CompletedLegoTasks: string[];
  unit2CompletedLessons: number[];
  unit2CurrentLesson: number;
  unit2CompletedQuizzes: string[];
  unit3CompletedLessons: number[];
  unit3CurrentLesson: number;
  unit3CompletedQuizzes: string[];

  recordExerciseAttempt: (params: {
    unitNumber: number;
    exerciseId: string;
    topicId: string;
    title: string;
    prompt: string;
    scorePct: number;
    passed: boolean;
    wrongSummary?: string;
    whyExplanation: string;
  }) => void;
  incrementExerciseAttemptSeed: (exerciseId: string) => void;
  revealNextHint: (exerciseId: string) => number;
  recordUnitExamResult: (unitNumber: number, scorePct: number, passed: boolean) => void;
  passBypassExamForUnit: (unitNumber: number) => void;
  setLastActivePosition: (unitNumber: number, exerciseId?: string | null) => void;
  addLedgerEntry: (entry: JournalEntry) => void;
  clearLedgerEntries: () => void;
  resolveErrorNotebookItem: (id: string) => void;
  updateSpeedChallengeBest: (score: number) => void;
  completeUnit1Lesson: (lessonNumber: number) => void;
  setUnit1Position: (lessonNumber: number, stepIndex: number) => void;
  completeUnit1QuickQuiz: (quizId: string) => void;
  completeUnit1LegoTask: (taskId: string) => void;
  completeUnit2Lesson: (lessonNumber: number) => void;
  completeUnit2QuickQuiz: (quizId: string) => void;
  completeUnit3Lesson: (lessonNumber: number) => void;
  completeUnit3QuickQuiz: (quizId: string) => void;
  resetLabProgress: () => void;
}

const INITIAL_LEDGER_ENTRIES: JournalEntry[] = [
  {
    id: 'init-opening-capital',
    date: '2026-11-01',
    description: 'رأس المال الافتتاحي للشركة الافتراضية',
    lines: [
      { accountId: 'cash', side: 'debit', amountFils: 15000000 },
      { accountId: 'bank', side: 'debit', amountFils: 35000000 },
      { accountId: 'capital', side: 'credit', amountFils: 50000000 },
    ],
  },
];

export const useAccountingLabStore = create<AccountingLabState>()(
  persist(
    (set, get) => ({
      completedExerciseIds: [],
      exerciseScores: {},
      exerciseAttempts: {},
      revealedHints: {},
      topicMastery: {},
      unitExamResults: {},
      bypassedUnits: [],
      lastActiveUnit: 1,
      lastActiveExerciseId: 'u1-ex-1',
      earnedBadges: [],
      ledgerEntries: INITIAL_LEDGER_ENTRIES,
      errorNotebook: [],
      speedChallengeBestScore: 0,
      certificateIssued: false,
      unit1CompletedLessons: [],
      unit1CurrentLesson: 1,
      unit1CurrentStepByLesson: {},
      unit1CompletedQuizzes: [],
      unit1CompletedLegoTasks: [],
      unit2CompletedLessons: [],
      unit2CurrentLesson: 1,
      unit2CompletedQuizzes: [],
      unit3CompletedLessons: [],
      unit3CurrentLesson: 1,
      unit3CompletedQuizzes: [],

      recordExerciseAttempt: ({
        unitNumber,
        exerciseId,
        topicId,
        title,
        prompt,
        scorePct,
        passed,
        wrongSummary,
        whyExplanation,
      }) => {
        set((state) => {
          const prevBest = state.exerciseScores[exerciseId] ?? 0;
          const nextScores = {
            ...state.exerciseScores,
            [exerciseId]: Math.max(prevBest, scorePct),
          };
          const nextCompleted = passed
            ? Array.from(new Set([...state.completedExerciseIds, exerciseId]))
            : state.completedExerciseIds;

          const prevTopic = state.topicMastery[topicId] || {
            attempts: 0,
            correct: 0,
          };
          const nextTopicMastery = {
            ...state.topicMastery,
            [topicId]: {
              attempts: prevTopic.attempts + 1,
              correct: prevTopic.correct + (passed ? 1 : 0),
            },
          };

          let nextNotebook = [...state.errorNotebook];
          if (!passed) {
            const existingIdx = nextNotebook.findIndex(
              (item) => item.exerciseId === exerciseId
            );
            const entryItem: ErrorNotebookItem = {
              id: `err-${exerciseId}`,
              unitNumber,
              topicId,
              exerciseId,
              title,
              prompt,
              wrongSummary: wrongSummary || 'محاولة غير مكتملة الدقة',
              whyExplanation,
              createdAt: new Date().toISOString().split('T')[0],
              resolved: false,
            };
            if (existingIdx >= 0) {
              nextNotebook[existingIdx] = entryItem;
            } else {
              nextNotebook = [entryItem, ...nextNotebook];
            }
          } else {
            nextNotebook = nextNotebook.map((item) =>
              item.exerciseId === exerciseId ? { ...item, resolved: true } : item
            );
          }

          // Check badge completion for this unit
          const unitPrefix = `u${unitNumber}-ex-`;
          const unitMeta = ACCOUNTING_CURRICULUM.find(
            (u) => u.unitNumber === unitNumber
          );
          const completedInUnit = nextCompleted.filter((id) =>
            id.startsWith(unitPrefix)
          ).length;
          const unitPct = unitMeta
            ? Math.round((completedInUnit / unitMeta.exerciseCount) * 100)
            : 0;

          const nextBadges = [...state.earnedBadges];
          if (
            unitMeta &&
            unitPct >= 100 &&
            !nextBadges.includes(unitMeta.badgeCode)
          ) {
            nextBadges.push(unitMeta.badgeCode);
          }

          return {
            completedExerciseIds: nextCompleted,
            exerciseScores: nextScores,
            topicMastery: nextTopicMastery,
            errorNotebook: nextNotebook,
            earnedBadges: nextBadges,
            lastActiveUnit: unitNumber,
            lastActiveExerciseId: exerciseId,
          };
        });
      },

      incrementExerciseAttemptSeed: (exerciseId) => {
        set((state) => ({
          exerciseAttempts: {
            ...state.exerciseAttempts,
            [exerciseId]: (state.exerciseAttempts[exerciseId] || 1) + 1,
          },
        }));
      },

      revealNextHint: (exerciseId) => {
        const current = get().revealedHints[exerciseId] || 0;
        const next = Math.min(3, current + 1);
        set((state) => ({
          revealedHints: {
            ...state.revealedHints,
            [exerciseId]: next,
          },
        }));
        return next;
      },

      recordUnitExamResult: (unitNumber, scorePct, passed) => {
        set((state) => {
          const prev = state.unitExamResults[unitNumber];
          const bestScore = Math.max(prev?.scorePct || 0, scorePct);
          const bestPassed = Boolean(prev?.passed || passed);

          const nextBadges = [...state.earnedBadges];
          const unitMeta = ACCOUNTING_CURRICULUM.find(
            (u) => u.unitNumber === unitNumber
          );
          if (bestPassed && unitMeta && !nextBadges.includes(unitMeta.badgeCode)) {
            nextBadges.push(unitMeta.badgeCode);
          }

          const unit1Passed =
            unitNumber === 1 ? bestPassed : Boolean(state.unitExamResults[1]?.passed);
          const unit2Passed =
            unitNumber === 2 ? bestPassed : Boolean(state.unitExamResults[2]?.passed);

          return {
            unitExamResults: {
              ...state.unitExamResults,
              [unitNumber]: {
                scorePct: bestScore,
                passed: bestPassed,
                completedAt: new Date().toISOString().split('T')[0],
              },
            },
            earnedBadges: nextBadges,
            certificateIssued:
              state.certificateIssued || (unit1Passed && unit2Passed),
          };
        });
      },

      passBypassExamForUnit: (unitNumber) => {
        set((state) => ({
          bypassedUnits: Array.from(new Set([...state.bypassedUnits, unitNumber])),
        }));
      },

      setLastActivePosition: (unitNumber, exerciseId) => {
        set((state) => ({
          lastActiveUnit: unitNumber,
          lastActiveExerciseId:
            exerciseId !== undefined ? exerciseId : state.lastActiveExerciseId,
        }));
      },

      addLedgerEntry: (entry) => {
        set((state) => ({
          ledgerEntries: [...state.ledgerEntries, entry],
        }));
      },

      clearLedgerEntries: () => {
        set({ ledgerEntries: INITIAL_LEDGER_ENTRIES });
      },

      resolveErrorNotebookItem: (id) => {
        set((state) => ({
          errorNotebook: state.errorNotebook.map((item) =>
            item.id === id ? { ...item, resolved: true } : item
          ),
        }));
      },

      updateSpeedChallengeBest: (score) => {
        set((state) => ({
          speedChallengeBestScore: Math.max(state.speedChallengeBestScore, score),
        }));
      },

      completeUnit1Lesson: (lessonNumber) => {
        set((state) => {
          const nextCompletedLessons = Array.from(
            new Set([...state.unit1CompletedLessons, lessonNumber])
          ).sort((a, b) => a - b);

          const isGradedLesson = lessonNumber >= 1;
          const exerciseId = `u1-ex-${lessonNumber}`;
          const nextCompletedExercises = isGradedLesson
            ? Array.from(new Set([...state.completedExerciseIds, exerciseId]))
            : state.completedExerciseIds;
          const nextExerciseScores = isGradedLesson
            ? {
                ...state.exerciseScores,
                [exerciseId]: 100,
              }
            : state.exerciseScores;
          const nextLesson = Math.min(
            12,
            Math.max(1, state.unit1CurrentLesson, lessonNumber + 1)
          );

          return {
            unit1CompletedLessons: nextCompletedLessons,
            unit1CurrentLesson: nextLesson,
            unit1CurrentStepByLesson: {
              ...state.unit1CurrentStepByLesson,
              [lessonNumber]: 0,
            },
            completedExerciseIds: nextCompletedExercises,
            exerciseScores: nextExerciseScores,
            lastActiveUnit: 1,
            lastActiveExerciseId: `u1-ex-${nextLesson}`,
          };
        });
      },

      setUnit1Position: (lessonNumber, stepIndex) => {
        set((state) => ({
          unit1CurrentLesson: lessonNumber,
          unit1CurrentStepByLesson: {
            ...state.unit1CurrentStepByLesson,
            [lessonNumber]: stepIndex,
          },
          lastActiveUnit: 1,
          lastActiveExerciseId: `u1-ex-${lessonNumber}`,
        }));
      },

      completeUnit1QuickQuiz: (quizId) => {
        set((state) => ({
          unit1CompletedQuizzes: Array.from(
            new Set([...state.unit1CompletedQuizzes, quizId])
          ),
        }));
      },

      completeUnit1LegoTask: (taskId) => {
        set((state) => ({
          unit1CompletedLegoTasks: Array.from(
            new Set([...(state.unit1CompletedLegoTasks || []), taskId])
          ),
        }));
      },

      completeUnit2Lesson: (lessonNumber) => {
        set((state) => {
          const nextCompleted = Array.from(
            new Set([...(state.unit2CompletedLessons || []), lessonNumber])
          ).sort((a, b) => a - b);
          const isGraded = lessonNumber >= 1;
          const exId = `u2-ex-${lessonNumber}`;
          const nextEx = isGraded
            ? Array.from(new Set([...state.completedExerciseIds, exId]))
            : state.completedExerciseIds;
          const nextScores = isGraded
            ? { ...state.exerciseScores, [exId]: 100 }
            : state.exerciseScores;
          const nextLesson = Math.min(
            7,
            Math.max(1, state.unit2CurrentLesson || 1, lessonNumber + 1)
          );
          return {
            unit2CompletedLessons: nextCompleted,
            unit2CurrentLesson: nextLesson,
            completedExerciseIds: nextEx,
            exerciseScores: nextScores,
            lastActiveUnit: 2,
            lastActiveExerciseId: `u2-ex-${nextLesson}`,
          };
        });
      },

      completeUnit2QuickQuiz: (quizId) => {
        set((state) => ({
          unit2CompletedQuizzes: Array.from(
            new Set([...(state.unit2CompletedQuizzes || []), quizId])
          ),
        }));
      },

      completeUnit3Lesson: (lessonNumber) => {
        set((state) => {
          const nextCompleted = Array.from(
            new Set([...(state.unit3CompletedLessons || []), lessonNumber])
          ).sort((a, b) => a - b);
          const isGraded = lessonNumber >= 1;
          const exId = `u3-ex-${lessonNumber}`;
          const nextEx = isGraded
            ? Array.from(new Set([...state.completedExerciseIds, exId]))
            : state.completedExerciseIds;
          const nextScores = isGraded
            ? { ...state.exerciseScores, [exId]: 100 }
            : state.exerciseScores;
          const nextLesson = Math.min(
            7,
            Math.max(1, state.unit3CurrentLesson || 1, lessonNumber + 1)
          );
          return {
            unit3CompletedLessons: nextCompleted,
            unit3CurrentLesson: nextLesson,
            completedExerciseIds: nextEx,
            exerciseScores: nextScores,
            lastActiveUnit: 3,
            lastActiveExerciseId: `u3-ex-${nextLesson}`,
          };
        });
      },

      completeUnit3QuickQuiz: (quizId) => {
        set((state) => ({
          unit3CompletedQuizzes: Array.from(
            new Set([...(state.unit3CompletedQuizzes || []), quizId])
          ),
        }));
      },

      resetLabProgress: () => {
        set({
          completedExerciseIds: [],
          exerciseScores: {},
          exerciseAttempts: {},
          revealedHints: {},
          topicMastery: {},
          unitExamResults: {},
          bypassedUnits: [],
          lastActiveUnit: 1,
          lastActiveExerciseId: 'u1-ex-1',
          earnedBadges: [],
          ledgerEntries: INITIAL_LEDGER_ENTRIES,
          errorNotebook: [],
          speedChallengeBestScore: 0,
          certificateIssued: false,
          unit1CompletedLessons: [],
          unit1CurrentLesson: 1,
          unit1CurrentStepByLesson: {},
          unit1CompletedQuizzes: [],
          unit1CompletedLegoTasks: [],
        });
      },
    }),
    {
      name: 'tadreebak-accounting-lab-v1',
      storage: ssrSafeLocalStorage,
    }
  )
);

export function getUnitCompletionStats(
  unitNumber: number,
  completedExerciseIds: string[]
): { completedCount: number; totalCount: number; percent: number } {
  const unitMeta = ACCOUNTING_CURRICULUM.find((u) => u.unitNumber === unitNumber);
  if (!unitMeta) return { completedCount: 0, totalCount: 0, percent: 0 };
  const prefix = `u${unitNumber}-ex-`;
  const completedCount = completedExerciseIds.filter((id) =>
    id.startsWith(prefix)
  ).length;
  const totalCount = unitMeta.exerciseCount;
  const percent = Math.min(
    100,
    Math.round((completedCount / Math.max(1, totalCount)) * 100)
  );
  return { completedCount, totalCount, percent };
}

export function isUnitUnlocked(params: {
  unitNumber: number;
  completedExerciseIds: string[];
  bypassedUnits: number[];
}): boolean {
  const unitMeta = ACCOUNTING_CURRICULUM.find(
    (u) => u.unitNumber === params.unitNumber
  );
  if (!unitMeta || !unitMeta.isImplementedInPhase1) return false;
  if (params.unitNumber === 1) return true;
  if (params.bypassedUnits.includes(params.unitNumber)) return true;

  const prevStats = getUnitCompletionStats(
    params.unitNumber - 1,
    params.completedExerciseIds
  );
  return prevStats.percent >= UNLOCK_THRESHOLD_PERCENT;
}
