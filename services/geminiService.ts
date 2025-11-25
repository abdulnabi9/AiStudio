import { GoogleGenAI } from "@google/genai";
import { Member, AttendanceRecord } from '../types';

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
// We safely check if process is defined to prevent browser crashes.
const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;

let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateGymInsights = async (
  members: Member[],
  attendance: AttendanceRecord[]
): Promise<string> => {
  if (!ai) {
    return "API Key not configured. Please set API_KEY to use AI features.";
  }

  const activeCount = members.filter(m => m.status === 'ACTIVE').length;
  const overdueCount = members.filter(m => m.status === 'OVERDUE').length;
  
  const prompt = `
    Analyze the following gym data and provide 3 brief, actionable bullet points for the gym manager to improve revenue and retention.
    
    Data:
    - Total Members: ${members.length}
    - Active: ${activeCount}
    - Overdue Payments: ${overdueCount}
    - Recent Daily Attendance Trend: ${JSON.stringify(attendance)}
    
    Keep the tone professional and motivating. Focus on retention strategies and peak hour management.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate insights at this time.";
  }
};