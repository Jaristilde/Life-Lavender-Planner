
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

export interface MonthlyResetData {
  snapshot: string[];                    // bullet list of events
  reflection: {
    grateful: string;
    heavy: string;
    proud: string;
    wantLess: string;
  };
  summary: string;                       // one sentence
  intentions: {
    feelings: string[];                  // selected feeling checkboxes
    goals: string;
    reminder: string;
  };
  financialCheckIn: {
    moneyIn: number;
    moneyOut: number;
    saved: number;
    debtPaid: number;
    unexpectedExpense: string;
    unexpectedAmount: number;
    bestDecision: string;
    doDifferently: string;
    aiInsight: string;
  };
  completedAt: string | null;
}

export interface WorkbookSelfAssessment {
  ratings: {
    incomeKnowledge: number;
    subscriptionAwareness: number;
    writtenBudget: number;
    emergencySavings: number;
    debtPayoff: number;
    consistentSaving: number;
    moneyCalmness: number;
    openConversations: number;
    goalSpecificity: number;
    spendingAlignment: number;
  };
  reflection: string;
}

export interface WorkbookFinancialGoal {
  text: string;
  amount: number;
  targetDate: string;
  strategy: string;
}

export interface WorkbookSnapshot {
  income: number;
  expenses: number;
  debt: number;
  savings: number;
  emergencyFund: number;
  subscriptionCount: number;
  creditScore: number;
  confidence: number;
  consistency: string;
}

export interface WorkbookData {
  started_at: string | null;
  completed_at: string | null;
  current_page: number;
  motivation: string;
  selfAssessment: WorkbookSelfAssessment;
  childhoodMessages: string;
  currentImpact: string;
  limitingBelief: string;
  empoweringRewrite: string;
  idealFinancialLife: string;
  primaryGoal: { text: string; amount: number; targetDate: string; why: string };
  supportingGoals: WorkbookFinancialGoal[];
  financeRelationship: string;
  pastTools: string;
  currentMorning: string;
  morningFeelings: string;
  ritualEntries: { time: string; activity: string }[];
  durationMinutes: number;
  wakeTime: string;
  bedTime: string;
  obstacles: string;
  setupChecklist: {
    accountCreated: boolean;
    yearSet: boolean;
    incomeEntered: boolean;
    fixedExpensesAdded: boolean;
    variableBudgetSet: boolean;
    debtsAdded: boolean;
    savingsGoalSet: boolean;
    affirmationAdded: boolean;
    visionBoardImage: boolean;
    resetStarted: boolean;
  };
  intention1: { text: string; why: string };
  intention2: { text: string; why: string };
  workContext: string;
  spendingHabits: string;
  day1Snapshot: WorkbookSnapshot;
  day30Snapshot: WorkbookSnapshot | null;
}

export interface YearData {
  year: number;
  isArchived: boolean;
  financial: FinancialData;
  wellness: WellnessData;
  plannerFocus: PlannerFocus;
  dailyMetrics: Record<string, UserDailyMetrics>;
  blueprint: BlueprintData;
  workbook: WorkbookData;
  monthlyResets: Record<string, MonthlyResetData>;
  simplifyChallenge: { day: number; completed: boolean; reflection: string }[];
  visionBoard: { images: string[]; wordOfTheYear: string; goals: string[] };
  affirmations: string[];
  reflections: { prompts: string[]; lessons: string; gratitude: string };
  dailyMorningResets: Record<string, {
    affirmationShown: string;
    spending: number;
    financialIntention: string;
    financialGratitude: string;
    priorities: Array<{ id: string; text: string; completed: boolean; priority: 'high' | 'medium' | 'low' }>;
    mood: string;
    waterIntake: number;
    movement: boolean;
    movementMinutes: number;
    dailyIntention: string;
  }>;
  library: Array<{
    id: string;
    title: string;
    fileName: string;
    uploadedAt: string;
    fileData: string;
  }>;
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
  userName: string;
  userMood: string;
  userFeeling: string;
  trialStartDate: string | null;
}
