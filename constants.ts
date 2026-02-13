
import { YearData, UserDailyMetrics, BlueprintData, WorkbookData, MonthlyResetData } from './types';

export const SIMPLIFY_CHALLENGES = [
  "Declutter one drawer",
  "Clean email inbox",
  "Write top 3 priorities",
  "Delete unused apps",
  "Cancel one unused subscription",
  "Create weekly meal plan",
  "Plan one financial goal",
  "Organize desktop files",
  "Digital detox for 2 hours",
  "Go for a 15-min walk",
  "Unsubscribe from 5 marketing emails",
  "Wipe down your kitchen counters",
  "List 3 things you're grateful for",
  "Meditate for 5 minutes",
  "Review your monthly budget",
  "Clear out your fridge",
  "Organize your shoes",
  "Standardize your morning routine",
  "Write a thank-you note",
  "Plan your next vacation",
  "Organize your medicine cabinet",
  "Check your credit score",
  "Set up an auto-savings transfer",
  "Go to bed 30 mins early",
  "Drink 8 glasses of water",
  "Donate 5 items of clothing",
  "Clean your makeup brushes",
  "Reflect on your monthly goals",
  "Budget for the next month",
  "Celebrate your progress!"
];

export const DEFAULT_BLUEPRINT = (): BlueprintData => ({
  completed: false,
  motivation: '',
  overarchingGoal: '',
  mindsetIssue: '',
  smallGoals: ['', '', ''],
  pastGrowthExperience: '',
  currentMorningRoutine: '',
  wakeupFeeling: '',
  desiredWakeupFeeling: '',
  morningRitual: [
    { time: '6:30am', activity: '' },
    { time: '7:00am', activity: '' },
    { time: '7:30am', activity: '' }
  ],
  topIntentions: ['', '']
});

export const DEFAULT_WORKBOOK = (): WorkbookData => ({
  started_at: null,
  completed_at: null,
  current_page: 0,
  motivation: '',
  selfAssessment: {
    ratings: {
      incomeKnowledge: 0, subscriptionAwareness: 0, writtenBudget: 0,
      emergencySavings: 0, debtPayoff: 0, consistentSaving: 0,
      moneyCalmness: 0, openConversations: 0, goalSpecificity: 0,
      spendingAlignment: 0
    },
    reflection: ''
  },
  childhoodMessages: '', currentImpact: '', limitingBelief: '',
  empoweringRewrite: '', idealFinancialLife: '',
  primaryGoal: { text: '', amount: 0, targetDate: '', why: '' },
  supportingGoals: [
    { text: '', amount: 0, targetDate: '', strategy: '' },
    { text: '', amount: 0, targetDate: '', strategy: '' },
    { text: '', amount: 0, targetDate: '', strategy: '' },
    { text: '', amount: 0, targetDate: '', strategy: '' }
  ],
  financeRelationship: '', pastTools: '', currentMorning: '', morningFeelings: '',
  ritualEntries: [
    { time: '6:30 AM', activity: '' },
    { time: '7:00 AM', activity: '' },
    { time: '7:30 AM', activity: '' }
  ],
  durationMinutes: 0, wakeTime: '', bedTime: '', obstacles: '',
  setupChecklist: {
    accountCreated: false, yearSet: false, incomeEntered: false,
    fixedExpensesAdded: false, variableBudgetSet: false, debtsAdded: false,
    savingsGoalSet: false, affirmationAdded: false, visionBoardImage: false,
    resetStarted: false
  },
  intention1: { text: '', why: '' },
  intention2: { text: '', why: '' },
  workContext: '', spendingHabits: '',
  day1Snapshot: {
    income: 0, expenses: 0, debt: 0, savings: 0, emergencyFund: 0,
    subscriptionCount: 0, creditScore: 0, confidence: 0, consistency: ''
  },
  day30Snapshot: null
});

export const DEFAULT_MONTHLY_RESET = (): MonthlyResetData => ({
  snapshot: ['', '', ''],
  reflection: { grateful: '', heavy: '', proud: '', wantLess: '' },
  summary: '',
  intentions: { feelings: [], goals: '', reminder: '' },
  financialCheckIn: {
    moneyIn: 0, moneyOut: 0, saved: 0, debtPaid: 0,
    unexpectedExpense: '', unexpectedAmount: 0,
    bestDecision: '', doDifferently: '', aiInsight: ''
  },
  completedAt: null
});

export const DEFAULT_DAILY_METRICS = (date: string): UserDailyMetrics => ({
  date,
  morning_alignment_completed: false,
  intention_text: '',
  focus_commitment: '',
  financial_action_text: '',
  self_trust_statement: '',
  energy_level: 5,
  meditation_minutes: 0,
  meditation_type: 'guided',
  movement_minutes: 0,
  financial_actions: {
    loggedExpenses: false,
    reviewedBudget: false,
    savingsMove: false,
    paidDebt: false
  },
  gratitude: ['', '', ''],
  daily_goals: [
    { text: '', completed: false },
    { text: '', completed: false },
    { text: '', completed: false }
  ],
  self_care: [
    { text: '', completed: false },
    { text: '', completed: false },
    { text: '', completed: false },
    { text: '', completed: false }
  ],
  mood: null,
  daily_self_care_act: '',
  self_love_statement: '',
  physical_activity: '',
  hydration_count: 0,
  tomorrow_focus: ['', ''],
  kanban: {
    todo: [],
    inProgress: [],
    done: [],
    notes: []
  }
});

export const INITIAL_YEAR_DATA = (year: number): YearData => ({
  year,
  isArchived: false,
  financial: {
    income: 0,
    fixedExpenses: [],
    variableExpenses: [
      { id: '1', name: 'Groceries', amount: 0, budget: 500 },
      { id: '2', name: 'Dining Out', amount: 0, budget: 200 },
      { id: '3', name: 'Entertainment', amount: 0, budget: 100 },
    ],
    debts: [],
    savingsGoals: [],
    weeklyPriorities: []
  },
  wellness: {
    vacations: [],
    workouts: [],
    meTime: [],
    dailyToDos: []
  },
  plannerFocus: {
    monthlyThemes: {},
    weeklyFocus: {},
    dailyExecution: {}
  },
  dailyMetrics: {},
  blueprint: DEFAULT_BLUEPRINT(),
  workbook: DEFAULT_WORKBOOK(),
  monthlyResets: {},
  simplifyChallenge: Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    completed: false,
    reflection: ''
  })),
  visionBoard: {
    images: [],
    wordOfTheYear: '',
    goals: []
  },
  affirmations: [
    "I am worthy of financial freedom.",
    "My peace is my priority.",
    "Every day I am becoming a better version of myself."
  ],
  reflections: {
    prompts: [],
    lessons: '',
    gratitude: ''
  },
  dailyMorningResets: {},
  library: []
});
