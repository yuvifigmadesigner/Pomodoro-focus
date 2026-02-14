import { GoogleGenAI, Type } from "@google/genai";
import { AIRecommendation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getRecommendations = async (task: string): Promise<AIRecommendation> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `I have a task: "${task}". Recommend optimal Pomodoro timer settings (in hours, e.g. 0.5 for 30 minutes) and a visual theme description for a background that aids focus for this specific task.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pomodoro: { type: Type.NUMBER, description: "Focus duration in hours (e.g. 0.75)" },
            shortBreak: { type: Type.NUMBER, description: "Short break duration in hours (e.g. 0.1)" },
            longBreak: { type: Type.NUMBER, description: "Long break duration in hours (e.g. 0.25)" },
            reasoning: { type: Type.STRING, description: "Brief explanation of why these settings fit the task" },
            themeDescription: { type: Type.STRING, description: "A descriptive prompt for an abstract background image suitable for this task" },
          },
          required: ["pomodoro", "shortBreak", "longBreak", "reasoning", "themeDescription"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AIRecommendation;
  } catch (error) {
    console.error("Error getting recommendations:", error);
    throw error;
  }
};

export const generateAIBackground = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          { text: `Create a high-quality, abstract, aesthetic wallpaper. Style: ${prompt}. No text. 4k resolution.` }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9", 
        }
      }
    });

    // Check parts for the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image generated");
  } catch (error) {
    console.error("Error generating background:", error);
    throw error;
  }
};