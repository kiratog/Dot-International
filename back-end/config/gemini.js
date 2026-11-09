
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL;

if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in .env");
}

if (!MODEL) {
    throw new Error("GEMINI_MODEL is missing in .env");
}

export const ai = new GoogleGenAI({
    apiKey: API_KEY
});

export { MODEL };
