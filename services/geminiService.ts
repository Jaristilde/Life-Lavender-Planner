
import { GoogleGenAI, Type } from "@google/genai";
import { FinancialData, WellnessData } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateWeeklyPriorities = async (data: FinancialData, name: string) => {
  const prompt = `Analyze the following financial data for ${name}:
- Monthly Income: $${data.income}
- Fixed Expenses: ${data.fixedExpenses.map(e => `${e.name}: $${e.amount}`).join(', ')}
- Variable Expenses: ${data.variableExpenses.map(e => `${e.name}: $${e.amount}`).join(', ')}
- Current Debt: ${data.debts.map(d => `${d.name}: $${d.balance}`).join(', ')}
- Savings Goals: ${data.savingsGoals.map(s => `${s.name}: $${s.current}/$${s.target}`).join(', ')}

Generate 3-5 specific, actionable financial priorities for this week that:
1. Move toward debt payoff
2. Increase savings
3. Reduce unnecessary spending
4. Align with long-term goals

Format as a simple JSON array of strings.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Error:", error);
    return [];
  }
};

export const generatePersonalizedAbundanceMessage = async (name: string, mood: string, feeling: string) => {
  const prompt = `Generate a warm, 2-3 sentence personalized financial empowerment message for ${name} who is feeling "${mood}" and resonates with "${feeling}". 
  Focus on practical financial confidence and taking ownership of their money story. 
  Do NOT use words like "universe", "manifest", "attract", or "energies". 
  Use grounded, empowering language about building wealth through action and intention.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Abundance Message Error:", error);
    return `${name}, your choice to focus on ${feeling} today is a powerful foundation for your financial journey. Small, intentional steps lead to lasting stability and freedom.`;
  }
};

export const generatePersonalizedAffirmations = async (name: string, mood: string, feeling: string) => {
  const prompt = `Generate 3 personalized financial wellness affirmations for ${name} who values "${feeling}" and is working on their money mindset. 
  Each affirmation should be 1 sentence, first-person present tense, and focused on practical financial confidence. 
  Avoid manifestation clichés. 
  Examples of good tone: "I make financial decisions that align with my values." "Every dollar I save is a vote for my future self." "I am capable of building the wealth I deserve."
  Format as a simple JSON array of strings.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Personalized Affirmations Error:", error);
    return [
      "I make financial decisions that align with my values.",
      "Every dollar I save is a vote for my future self.",
      "I am capable of building the wealth I deserve."
    ];
  }
};

export const generateWorkbookAffirmation = async (limitingBelief: string, idealLife: string) => {
  const prompt = `Based on this limiting money belief: "${limitingBelief}"
And this financial life vision: "${idealLife}"

Generate 3 personalized financial affirmations that:
1. Directly counter the limiting belief
2. Are in first person present tense
3. Feel believable and empowering
4. Connect financial health to overall wellbeing
5. Are 1-2 sentences each

Return as JSON array of 3 strings.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Affirmation Error:", error);
    return [];
  }
};

export const generateRitualSuggestion = async (
  currentMorning: string, morningFeelings: string, primaryGoal: string
) => {
  const prompt = `Create a morning money ritual for someone whose current morning looks like: "${currentMorning}"
They currently feel: "${morningFeelings}"
Their top financial goal: "${primaryGoal}"

Generate a realistic 6-8 step morning ritual. Each step has a time and activity.
Include: one financial check-in step, one affirmation/mindset step, one planning step, one movement step.
Start times from their usual wake-up or 30 min earlier.

Return as JSON array of objects with "time" (string like "6:30 AM") and "activity" (string) properties.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING },
              activity: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Ritual Error:", error);
    return [];
  }
};

export const generateGoalOptimization = async (
  primaryGoal: string, supportingGoals: string[], income: number, debt: number, savings: number
) => {
  const prompt = `Analyze these financial goals:
Primary: ${primaryGoal}
Supporting: ${supportingGoals.join(', ')}
Monthly income: $${income}, Total debt: $${debt}, Current savings: $${savings}

Provide:
1. Recommended priority order with brief reasoning
2. Whether each timeline is realistic
3. Suggested monthly allocation for each goal
4. One quick win achievable this week

Return as JSON with: priorityOrder (array of strings), timelineAnalysis (string), monthlyAllocations (string), quickWin (string).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Goal Error:", error);
    return {};
  }
};

export const generateMonthlyInsight = async (
  monthName: string, income: number, expenses: number, saved: number, debtPaid: number, bestDecision: string
) => {
  const prompt = `Provide a brief, encouraging 2-3 sentence financial insight for ${monthName}:
Income: $${income}, Expenses: $${expenses}, Saved: $${saved}, Debt paid: $${debtPaid}
Best decision: "${bestDecision}"
Be specific about their numbers. Celebrate progress. Give one actionable suggestion for next month.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Monthly Insight Error:", error);
    return `Great work staying intentional this month! Your focus on savings is paying off. Keep it up.`;
  }
};
