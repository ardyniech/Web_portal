import { GoogleGenAI } from '@google/genai';
import { recordModelSuccess, recordModelFailure } from './modelSwitcherService';

let aiClient: GoogleGenAI | null = null;
const modelCooldownMap = new Map<string, number>();

export function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
  }
  return aiClient;
}

export const CANDIDATE_MODELS = ['gemini-2.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];

export async function generateAiContentWithFallback(
  contents: string,
  systemInstruction: string
): Promise<{ text: string; model: string }> {
  const ai = getAiClient();
  const now = Date.now();
  let lastError: any = null;

  const activeModels = CANDIDATE_MODELS.filter((m) => (modelCooldownMap.get(m) || 0) <= now);
  const modelsToTry = activeModels.length > 0 ? activeModels : CANDIDATE_MODELS;

  for (const modelName of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await ai.models.generateContent({
          model: modelName,
          contents,
          config: { systemInstruction, temperature: 0.7, maxOutputTokens: 32768 },
        });

        if (result && result.text) {
          modelCooldownMap.delete(modelName);
          recordModelSuccess(modelName);
          return { text: result.text, model: modelName };
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = String(err?.message || err);
        modelCooldownMap.set(modelName, Date.now() + 45_000);
        recordModelFailure(modelName, errMsg);

        if (attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 600));
          continue;
        }
        break;
      }
    }
  }

  throw lastError || new Error('Semua model AI sedang sibuk. Silakan coba sesaat lagi.');
}
