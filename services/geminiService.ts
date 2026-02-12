
import { GoogleGenAI, Type } from "@google/genai";
import { FinancialData } from "../types";

/**
 * Safely initializes the AI client.
 * Returns null if the API key is missing or invalid.
 */
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    return null;
  }
  try {
    return new GoogleGenAI({ apiKey });
  } catch (error) {
    console.warn("Failed to initialize GoogleGenAI:", error);
    return null;
  }
};

export const isAiEnabled = () => {
  const apiKey = process.env.API_KEY;
  return !!(apiKey && apiKey !== 'undefined' && apiKey !== '');
};

export const generateWeeklyPriorities = async (data: FinancialData, name: string) => {
  const ai = getAiClient();
  if (!ai) {
    console.warn('AI not available - returning default financial priorities');
    return [
      "Review your fixed expenses for possible savings",
      "Check your progress toward your primary savings goal",
      "Log all variable spending for the next 48 hours"
    ];
  }

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
    console.error("AI Error (Weekly Priorities):", error);
    return ["Review your budget", "Check your savings goals", "Monitor daily spending"];
  }
};

export const generatePersonalizedAbundanceMessage = async (name: string, mood: string, feeling: string) => {
  const ai = getAiClient();
  if (!ai) {
    return `${name}, your choice to focus on ${feeling} today is a powerful foundation for your financial journey. Small, intentional steps lead to lasting stability and freedom.`;
  }

  const prompt = `Generate a warm, 2-3 sentence personalized financial empowerment message for ${name} who is feeling "${mood}" and resonates with "${feeling}". 
  Focus on practical financial confidence and taking ownership of their money story. 
  Do NOT use words like "universe", "manifest", "attract", or "energies". 
  Use grounded, empowering language about building wealth through action and intention.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || `${name}, focusing on ${feeling} is a great step toward your goals.`;
  } catch (error) {
    console.error("AI Abundance Message Error:", error);
    return `${name}, your choice to focus on ${feeling} today is a powerful foundation for your financial journey.`;
  }
};

export const generatePersonalizedAffirmations = async (name: string, mood: string, feeling: string) => {
  const ai = getAiClient();
  const defaultAffirmations = [
    "I am worthy of financial freedom and peace.",
    "My peace is my priority, and my budget reflects my values.",
    "Every dollar I save is a vote for my future self."
  ];

  if (!ai) {
    return defaultAffirmations;
  }

  const prompt = `Generate 3 personalized financial wellness affirmations for ${name} who values "${feeling}" and is working on their money mindset. 
  Each affirmation should be 1 sentence, first-person present tense, and focused on practical financial confidence. 
  Avoid manifestation clichés. 
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
    return defaultAffirmations;
  }
};

export const generateWorkbookAffirmation = async (limitingBelief: string, idealLife: string) => {
  const ai = getAiClient();
  if (!ai) return ["I choose to believe in my financial potential.", "I am capable of creating the life I desire."];

  const prompt = `Based on this limiting money belief: "${limitingBelief}"
And this financial life vision: "${idealLife}"

Generate 3 personalized financial affirmations that counter the limiting belief.
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
    return ["I am redefining my money story.", "My future is full of abundance."];
  }
};

export const generateRitualSuggestion = async (
  currentMorning: string, morningFeelings: string, primaryGoal: string
) => {
  const ai = getAiClient();
  const defaultRitual = [
    { time: "7:00 AM", activity: "Wake up and hydrate" },
    { time: "7:15 AM", activity: "5-minute mindfulness breathing" },
    { time: "7:20 AM", activity: "Review today's top 3 priorities" }
  ];

  if (!ai) return defaultRitual;

  const prompt = `Create a morning money ritual for someone whose current morning looks like: "${currentMorning}"
They currently feel: "${morningFeelings}"
Their top financial goal: "${primaryGoal}"

Generate a realistic 6-8 step morning ritual. Each step has a time and activity.
Return as JSON array of objects with "time" and "activity" properties.`;

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
    return defaultRitual;
  }
};

export const generateGoalOptimization = async (
  primaryGoal: string, supportingGoals: string[], income: number, debt: number, savings: number
) => {
  const ai = getAiClient();
  const fallback = {
    priorityOrder: ["Build emergency fund", "Pay down high-interest debt", "Save for long-term goal"],
    timelineAnalysis: "Based on your current numbers, focus on small consistent steps.",
    monthlyAllocations: "Aim to save 10-20% of your net income.",
    quickWin: "Cancel one unused subscription today."
  };

  if (!ai) return fallback;

  const prompt = `Analyze these financial goals:
Primary: ${primaryGoal}
Supporting: ${supportingGoals.join(', ')}
Monthly income: $${income}, Total debt: $${debt}, Current savings: $${savings}

Return as JSON with: priorityOrder (array), timelineAnalysis, monthlyAllocations, quickWin.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Goal Error:", error);
    return fallback;
  }
};

export const generateMonthlyInsight = async (
  monthName: string, income: number, expenses: number, saved: number, debtPaid: number, bestDecision: string
) => {
  const ai = getAiClient();
  if (!ai) {
    return `Great work staying intentional in ${monthName}! Your best decision to focus on "${bestDecision}" is paying off. Keep it up.`;
  }

  const prompt = `Provide a brief, encouraging 2-3 sentence financial insight for ${monthName}:
Income: $${income}, Expenses: $${expenses}, Saved: $${saved}, Debt paid: $${debtPaid}
Best decision: "${bestDecision}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || `You're making great progress toward your financial freedom.`;
  } catch (error) {
    console.error("AI Monthly Insight Error:", error);
    return `Great work staying intentional this month.`;
  }
};

export const generateVisionImage = async (prompt: string): Promise<string | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A beautiful, aesthetic image of: ${prompt}. Cinematic lighting, soft focus, high resolution.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4"
        }
      }
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
};
