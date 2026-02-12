
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
    // response.text is a getter property, not a method.
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Error:", error);
    return [];
  }
};

export const generateCustomAffirmations = async (financialGoals: string[], wellnessGoals: string[]) => {
  const prompt = `Based on these goals:
Financial: ${financialGoals.join(', ')}
Wellness: ${wellnessGoals.join(', ')}

Generate 5 personalized affirmations that are specific, empowering, and connect financial health to overall wellness. Return as a JSON array of strings.`;

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
    // response.text is a getter property, not a method.
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Error:", error);
    return [];
  }
};
