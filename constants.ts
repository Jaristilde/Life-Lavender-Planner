
import { YearData, UserDailyMetrics, BlueprintData } from './types';

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
  }
});
