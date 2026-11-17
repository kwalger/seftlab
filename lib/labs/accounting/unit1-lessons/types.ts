export type LessonSvgKey =
  | 'notebook'
  | 'wallet_budget'
  | 'sweets_shop'
  | 'scale_profit'
  | 'cash_box'
  | 'inside_team'
  | 'outside_partners'
  | 'clay_tablet'
  | 'balance_book'
  | 'modern_screen';

export interface LessonMeta {
  lessonNumber: number;
  id: string;
  title: string;
  shortGoal: string;
  estimatedMinutes: number;
  isAvailable: boolean;
  quickQuizAfterId?: string;
}

export interface LessonExplanationCard {
  id: string;
  title: string;
  body: string;
  analogy: string;
  illustrationKey: LessonSvgKey;
}

export interface LessonStoryExample {
  storyTitle: string;
  scenario: string;
  numbersSummary: { label: string; value: string }[];
  takeaway: string;
  illustrationKey: LessonSvgKey;
}

export interface LessonTryItOption {
  id: string;
  label: string;
  why: string;
}

export interface LessonTryItQuestion {
  prompt: string;
  options: LessonTryItOption[];
  correctOptionId: string;
}

export interface UnitLessonData {
  id: string;
  lessonNumber: number;
  title: string;
  estimatedMinutes: number;
  xpReward: number;
  openingQuestion: {
    question: string;
    context: string;
    illustrationKey: LessonSvgKey;
  };
  explanationCards: LessonExplanationCard[];
  storyExample: LessonStoryExample;
  tryItQuestion: LessonTryItQuestion;
  summary: string;
}

export interface QuickQuizQuestion {
  id: string;
  prompt: string;
  options: { id: string; label: string; why: string }[];
  correctOptionId: string;
}

export interface QuickQuizConfig {
  id: string;
  title: string;
  subtitle: string;
  afterLessonNumber: number;
  questions: QuickQuizQuestion[];
}

export interface GlossaryTerm {
  arabicTerm: string;
  simpleMeaning: string;
  englishTerm: string;
}
