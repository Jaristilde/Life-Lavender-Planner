/**
 * Knowledge Base Seed Data for the RAG Chatbot
 *
 * Contains 25+ knowledge entries covering:
 * - Financial wellness tips
 * - Lavender Life Planner features
 * - Wellness and self-care advice
 * - Goal setting best practices
 * - Affirmation guidance
 *
 * These entries are stored in the knowledge_base table and used
 * for similarity search when the user asks questions in the chatbot.
 */

export interface KnowledgeEntry {
  content: string;
  metadata: {
    category: string;
    tags: string[];
  };
}

export const KNOWLEDGE_BASE_SEED: KnowledgeEntry[] = [
  // === FINANCIAL WELLNESS ===
  {
    content: "The 50/30/20 budgeting rule is a great starting point for managing your money. Allocate 50% of your after-tax income to needs (rent, utilities, groceries, insurance), 30% to wants (dining out, entertainment, subscriptions), and 20% to savings and debt repayment. If you're working on paying off debt, you might temporarily shift to 50/20/30 where the extra goes to debt payoff.",
    metadata: { category: "financial", tags: ["budgeting", "50-30-20", "basics"] }
  },
  {
    content: "Building an emergency fund is one of the most important financial steps you can take. Aim for 3-6 months of essential expenses saved in a high-yield savings account. Start small — even $500 can cover many unexpected expenses like a car repair or medical copay. Automate a weekly transfer, even if it's just $25, to build the habit.",
    metadata: { category: "financial", tags: ["emergency-fund", "savings", "security"] }
  },
  {
    content: "The debt avalanche method saves you the most money on interest. List all your debts from highest interest rate to lowest. Make minimum payments on all debts, then put every extra dollar toward the highest-interest debt. Once that's paid off, roll that payment into the next highest. This method is mathematically optimal for reducing total interest paid.",
    metadata: { category: "financial", tags: ["debt", "avalanche", "payoff-strategy"] }
  },
  {
    content: "The debt snowball method is great for motivation. List your debts from smallest balance to largest. Pay minimums on everything, then attack the smallest debt first. The quick wins of paying off small debts create momentum and motivation to keep going. Dave Ramsey popularized this approach, and it works well for people who need psychological wins.",
    metadata: { category: "financial", tags: ["debt", "snowball", "motivation"] }
  },
  {
    content: "Subscription auditing can save hundreds per year. Review every recurring charge on your bank and credit card statements. Cancel anything you haven't used in the past 30 days. Common culprits include streaming services, gym memberships, app subscriptions, and forgotten free trial conversions. Set a calendar reminder to audit subscriptions quarterly.",
    metadata: { category: "financial", tags: ["subscriptions", "saving-money", "audit"] }
  },
  {
    content: "Meal planning is one of the most effective ways to reduce food spending. Plan your meals for the week, make a shopping list, and stick to it. Average households waste 30-40% of food purchased. Batch cooking on Sundays can save both time and money throughout the week. Aim to reduce dining out to once or twice a week.",
    metadata: { category: "financial", tags: ["meal-planning", "groceries", "saving-money"] }
  },
  {
    content: "To improve your credit score, focus on these key factors: payment history (35% of score) — always pay on time; credit utilization (30%) — keep balances below 30% of limits; credit age (15%) — keep old accounts open; credit mix (10%) — have a mix of credit types; new inquiries (10%) — limit hard pulls. Check your credit report annually for free at annualcreditreport.com.",
    metadata: { category: "financial", tags: ["credit-score", "credit", "improvement"] }
  },
  {
    content: "Investing basics: Start with your employer's 401(k) match — it's free money. Then max out a Roth IRA ($7,000/year for under 50). Index funds are recommended for beginners because they're diversified and low-cost. The S&P 500 has historically returned about 10% annually. Time in the market beats timing the market — start early and stay consistent.",
    metadata: { category: "financial", tags: ["investing", "retirement", "401k", "roth-ira"] }
  },

  // === LAVENDER LIFE PLANNER FEATURES ===
  {
    content: "The Morning Reset is your daily ritual to set intentions, check your mood, plan financial micro-actions, and set top priorities. It has 5 sections: Core Intention (set your daily focus and read your affirmation), Emotional Check (rate your mood 1-10), Financial Micro Action (log yesterday's spending and set a money intention), Top 3 Priorities (your must-do tasks), and Ritual Completion (mark your ritual done, track water intake and movement).",
    metadata: { category: "app-features", tags: ["morning-reset", "daily-ritual", "how-to"] }
  },
  {
    content: "The Financial Hub lets you track your complete financial picture. Enter your monthly income, fixed expenses (rent, utilities, insurance), variable expenses with budgets, debts with interest rates and minimum payments, and savings goals. The hub calculates your net cash flow and shows spending breakdowns. Premium users get AI-powered spending analysis and debt payoff strategies.",
    metadata: { category: "app-features", tags: ["financial-hub", "tracking", "budget"] }
  },
  {
    content: "The Daily Planner has three views: Monthly (set themes and targets), Weekly (7-day task grids with a to-do list), and Daily (full paper-planner experience with gratitude, goals, self-care, mood, energy, kanban board, and exercise tracking). Navigate between days to review past entries or plan ahead.",
    metadata: { category: "app-features", tags: ["planner", "daily", "weekly", "monthly"] }
  },
  {
    content: "The Vision Board lets you visualize your goals with images. Upload your own photos or use AI-generated images (Premium feature). Add your Word of the Year and up to 10 goals. The vision board serves as a daily reminder of what you're working toward. You can view it anytime from the sidebar or bottom navigation.",
    metadata: { category: "app-features", tags: ["vision-board", "goals", "visualization"] }
  },
  {
    content: "The Monthly Reset is a structured end-of-month reflection. It guides you through reviewing highlights, reflecting on what you're grateful for, doing a financial check-in (money in, money out, saved, debt paid), and setting intentions for next month. Premium users get AI-generated insights based on their financial data.",
    metadata: { category: "app-features", tags: ["monthly-reset", "reflection", "financial-review"] }
  },
  {
    content: "The Tracking Center shows your daily metrics at a glance: morning ritual status, energy level over 7 days, meditation minutes, movement log, and financial actions completed. It also shows your ritual streak count — how many days in a row you've completed your morning ritual.",
    metadata: { category: "app-features", tags: ["tracking", "metrics", "streak"] }
  },
  {
    content: "The 30-Day Simplify Challenge gives you one small task per day to declutter your life and finances. Tasks include decluttering a drawer, cleaning your email inbox, canceling unused subscriptions, reviewing your budget, and celebrating progress. Mark each day complete and add reflections.",
    metadata: { category: "app-features", tags: ["simplify-challenge", "30-day", "habits"] }
  },

  // === WELLNESS & SELF-CARE ===
  {
    content: "Hydration significantly impacts mental clarity and energy. Aim for 8 cups (64 oz) of water daily. Start your morning with a full glass before coffee. Keep a water bottle visible at your desk. If plain water is boring, add lemon, cucumber, or mint. Track your intake in the Morning Reset or Daily Planner to build the habit.",
    metadata: { category: "wellness", tags: ["hydration", "water", "energy", "health"] }
  },
  {
    content: "Morning routines set the tone for your entire day. Research shows that people with consistent morning routines report lower stress and higher productivity. Start with just 3 elements: hydration, movement (even 5 minutes of stretching), and intention-setting. Build from there. The Lavender Life Planner's Morning Reset is designed to guide you through this process.",
    metadata: { category: "wellness", tags: ["morning-routine", "habits", "productivity"] }
  },
  {
    content: "Journaling has proven mental health benefits including reduced anxiety, improved mood, and better sleep. The Daily Planner includes gratitude prompts (3 things you're grateful for), self-love statements, and tomorrow's focus sections. Even spending 5 minutes writing can make a difference. Consistency matters more than length.",
    metadata: { category: "wellness", tags: ["journaling", "mental-health", "gratitude"] }
  },
  {
    content: "Movement doesn't have to mean intense exercise. Walking for 15-30 minutes daily has been shown to reduce anxiety, improve cardiovascular health, and boost creativity. Other gentle options include yoga, stretching, dancing to a favorite song, or taking the stairs. Track your movement minutes in the Morning Reset to stay accountable.",
    metadata: { category: "wellness", tags: ["movement", "exercise", "walking", "gentle-fitness"] }
  },
  {
    content: "Sleep hygiene is crucial for financial decision-making. Poor sleep leads to impulsive spending and worse financial choices. Aim for 7-9 hours nightly. Create a wind-down routine: no screens 30 minutes before bed, keep your room cool and dark, and avoid caffeine after 2 PM. Your energy level tracker in the app can help you correlate sleep quality with daily performance.",
    metadata: { category: "wellness", tags: ["sleep", "rest", "decision-making"] }
  },

  // === GOAL SETTING ===
  {
    content: "SMART goals are Specific, Measurable, Achievable, Relevant, and Time-bound. Instead of 'save more money,' try 'save $5,000 for an emergency fund by December 31st by setting aside $420/month.' Break big goals into monthly and weekly milestones. The Financial Hub's savings goals feature is designed around this framework.",
    metadata: { category: "goal-setting", tags: ["SMART-goals", "planning", "milestones"] }
  },
  {
    content: "The power of writing goals down: A Harvard study found that people who write down their goals are 42% more likely to achieve them. Use the Vision Board for big-picture goals, the Monthly Reset for monthly targets, and the Daily Planner for daily execution. Review your goals weekly to stay aligned.",
    metadata: { category: "goal-setting", tags: ["writing-goals", "accountability", "review"] }
  },
  {
    content: "When setting financial goals, prioritize in this order: 1) Build a $1,000 starter emergency fund, 2) Pay off high-interest debt (above 7%), 3) Build full emergency fund (3-6 months expenses), 4) Invest 15% of income for retirement, 5) Save for other goals (house, education, vacation). This order protects you from financial emergencies while building long-term wealth.",
    metadata: { category: "goal-setting", tags: ["financial-goals", "priority-order", "wealth-building"] }
  },

  // === AFFIRMATIONS ===
  {
    content: "Financial affirmations work by rewiring negative money beliefs. Research in neuroplasticity shows that repeated positive statements can actually change neural pathways. Effective affirmations are: present tense ('I am' not 'I will be'), specific ('I am a smart saver' not 'I am rich'), believable (stretch but don't break belief), and personal. Examples: 'I am in control of my spending,' 'Every dollar I save strengthens my future,' 'I make financial decisions with confidence.'",
    metadata: { category: "affirmations", tags: ["money-mindset", "neuroplasticity", "beliefs"] }
  },
  {
    content: "To get the most from your daily affirmation, read it aloud each morning during your Morning Reset. Visualize the affirmation being true as you say it. Write it in your planner. Place it where you'll see it throughout the day. The Lavender Life Planner rotates through your saved affirmations and can generate personalized ones using AI (Premium feature).",
    metadata: { category: "affirmations", tags: ["daily-practice", "how-to", "morning-ritual"] }
  },
  {
    content: "Overcoming money shame is essential for financial growth. Many people carry guilt or embarrassment about debt, spending habits, or financial knowledge gaps. Remember: your past financial decisions don't define you. Start where you are, use what you have. The Workbook section includes exercises to identify and rewrite limiting money beliefs.",
    metadata: { category: "affirmations", tags: ["money-shame", "mindset", "self-compassion"] }
  },
];
