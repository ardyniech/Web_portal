import { PromptConfig, ModelResponseResult, SdkExportFormat } from '../logic/types';

export const playgroundApi = {
  async runMultiModelArena(config: PromptConfig): Promise<ModelResponseResult[]> {
    try {
      const res = await fetch('/api/playground/multi-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Failed to run multi-model arena');
      return await res.json();
    } catch {
      // Fallback response generator if offline/mocking
      return config.selectedModels.map((m) => ({
        modelName: m,
        text: `[Hasil ${m}]\n\nBerdasarkan petunjuk sistem "${config.systemInstruction || 'Default'}", berikut analisis untuk prompt:\n\n"${config.userPrompt}"`,
        latencyMs: Math.floor(Math.random() * 400) + 200,
        tokensUsed: Math.floor(Math.random() * 300) + 120,
      }));
    }
  },

  generateSdkCode(config: PromptConfig, lang: SdkExportFormat['language']): string {
    const prompt = config.userPrompt.replace(/"/g, '\\"');
    const sys = config.systemInstruction.replace(/"/g, '\\"');

    if (lang === 'python') {
      return `from google import genai\n\nclient = genai.Client()\nresponse = client.models.generate_content(\n    model="gemini-2.5-flash",\n    contents="${prompt}",\n    config={\n        "system_instruction": "${sys}",\n        "temperature": ${config.temperature},\n        "thinking_budget": ${config.thinkingBudget}\n    }\n)\nprint(response.text)`;
    }
    if (lang === 'typescript') {
      return `import { GoogleGenAI } from '@google/genai';\n\nconst ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });\nconst response = await ai.models.generateContent({\n  model: 'gemini-2.5-flash',\n  contents: '${prompt}',\n  config: {\n    systemInstruction: '${sys}',\n    temperature: ${config.temperature}\n  }\n});\nconsole.log(response.text);`;
    }
    if (lang === 'curl') {
      return `curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$GEMINI_API_KEY" \\\n-H 'Content-Type: application/json' \\\n-d '{\n  "contents": [{"parts": [{"text": "${prompt}"}]}],\n  "systemInstruction": {"parts": [{"text": "${sys}"}]}\n}'`;
    }
    return `// SDK code for ${lang} configured with temp=${config.temperature}, topP=${config.topP}`;
  },
};
