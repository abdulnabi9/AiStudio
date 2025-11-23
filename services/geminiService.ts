import { GoogleGenAI } from "@google/genai";
import { Member, AttendanceRecord } from '../types';

// NOTE: In a real app, API keys should be handled via backend proxies.
// For this demo, we assume process.env.API_KEY is available.
const apiKey = process.env.API_KEY || ''; 

let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateGymInsights = async (
  members: Member[],
  attendance: AttendanceRecord[]
): Promise<string> => {
  if (!ai) {
    return "API Key not configured. Please set process.env.API_KEY to use AI features.";
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
