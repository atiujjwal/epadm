import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";

export const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface GeneratedExam {
  title: string;
  questions: Array<{
    id: number;
    type: "mcq" | "subjective";
    questionText: string;
    options?: string[];
    correctAnswer?: string;
    points: number;
  }>;
}

export async function generateExamAI(
  subject: string,
  gradeLevel: string,
  difficulty: string,
  format: string,
): Promise<{ text: string; promptTokens: number; completionTokens: number }> {
  const prompt = `You are an expert school teacher. Generate an exam paper based on the following parameters:
Subject: ${subject}
Grade Level: ${gradeLevel}
Difficulty: ${difficulty}
Format: ${format}

Output MUST be a valid JSON matching this schema:
{
  "title": "String (e.g. Science Class 10 Midterm)",
  "questions": [
    {
      "id": 1,
      "type": "mcq" or "subjective",
      "questionText": "String",
      "options": ["A", "B", "C", "D"], // ONLY if type is mcq, must list exactly 4 options
      "correctAnswer": "String", // ONLY if type is mcq, matching one of the options
      "points": number
    }
  ]
}

Ensure the questions are highly relevant, academically accurate, and appropriate for ${gradeLevel}. Return only the JSON structure.`;

  // SDK implementation
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "";
      const usage = response.usageMetadata;
      const promptTokens = usage?.promptTokenCount ?? 200;
      const completionTokens = usage?.candidatesTokenCount ?? 400;

      return { text, promptTokens, completionTokens };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.warn("GenAI SDK failed, trying fetch fallback:", message);
    }
  }

  // Fetch API fallback to guarantee operation even if SDK has loading or version issues
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorBody}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const usage = result.usageMetadata;
  const promptTokens = usage?.promptTokenCount ?? 200;
  const completionTokens = usage?.candidatesTokenCount ?? 400;

  return { text, promptTokens, completionTokens };
}
