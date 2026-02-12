
export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  category?: string;
  timeEstimate?: string;
}

export interface Debt {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  targetDate: string;
  payments: { date: string; amount: number }[];
}

export interface FinancialData {
  income: number;
  fixedExpenses: { id: string; name: string; amount: number }[];
  variableExpenses: { id: string; name: string; amount: number; budget: number }[];
  debts: Debt[];
  savingsGoals: { id: string; name: string; target: number; current: number; date: string }[];
  weeklyPriorities: { id: string; text: string; completed: boolean }[];
}

export interface WellnessData {
  vacations: { id: string; destination: string; date: string; budget: number; checklist: { text: string; done: boolean }[] }[];
  workouts: { id: string; date: string; type: string; duration: number; completed: boolean }[];
  meTime: { id: string; date: string; type: string; hours: number }[];
  dailyToDos: Task[];
}

export interface PlannerFocus {
  monthlyThemes: Record<string, {
    theme: string;
    financialTarget: string;
    wellnessTarget: string;
    wordOfMonth: string;
    reflectionPreview: string;
  }>;
  weeklyFocus: Record<string, {
    outcomes: string[];
    financialMove: string;
    energyFocus: string;
    eliminate: string;
    affirmation: string;
  }>;
  dailyExecution: Record<string, {
    morning: { priorities: string[]; financialAction: string; wellnessAction: string };
    midday: { focusBlock1: string; focusBlock2: string };
    evening: { wins: string; reflection: string; adjustments: string };
  }>;
}

export interface BlueprintData {
  completed: boolean;
  motivation: string;
  overarchingGoal: string;
  mindsetIssue: string;
  smallGoals: string[];
  pastGrowthExperience: string;
  currentMorningRoutine: string;
  wakeupFeeling: string;
  desiredWakeupFeeling: string;
  morningRitual: { time: string; activity: string }[];
  topIntentions: string[];
}

export interface UserDailyMetrics {
  date: string;
  morning_alignment_completed: boolean;
  intention_text: string;
  focus_commitment: string;
  financial_action_text: string;
  self_trust_statement: string;
  energy_level: number;
  meditation_minutes: number;
  meditation_type: 'guided' | 'silent' | 'breathwork';
  movement_minutes: number;
  financial_actions: {
    loggedExpenses: boolean;
    reviewedBudget: boolean;
    savingsMove: boolean;
    paidDebt: boolean;
  };
}

export interface YearData {
  year: number;
  isArchived: boolean;
  financial: FinancialData;
  wellness: WellnessData;
  plannerFocus: PlannerFocus;
  dailyMetrics: Record<string, UserDailyMetrics>;
  blueprint: BlueprintData;
  simplifyChallenge: { day: number; completed: boolean; reflection: string }[];
  visionBoard: { images: string[]; wordOfTheYear: string; goals: string[] };
  affirmations: string[];
  reflections: { prompts: string[]; lessons: string; gratitude: string };
}

export interface GoogleSyncSettings {
  enabled: boolean;
  syncFrequency: 'manual' | 'automatic';
  showEvents: boolean;
  lastSynced?: string;
  isConnected: boolean;
}

export interface AppState {
  years: Record<number, YearData>;
  currentYear: number;
  isPremium: boolean;
  googleSync: GoogleSyncSettings;
}
