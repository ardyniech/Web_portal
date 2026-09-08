import { Router } from 'express';
import { generateAiContentWithFallback } from './geminiService';

export const playgroundRouter = Router();

playgroundRouter.post('/multi-run', async (req, res) => {
  try {
    const { systemInstruction, userPrompt, selectedModels } = req.body;
    const models = Array.isArray(selectedModels) && selectedModels.length > 0 ? selectedModels : ['gemini-2.5-flash', 'gemini-3.1-flash-lite'];

    const results = await Promise.all(
      models.map(async (modelName) => {
        const start = Date.now();
        try {
          const resObj = await generateAiContentWithFallback(userPrompt, systemInstruction || 'You are an expert AI assistant');
          const duration = Date.now() - start;
          return {
            modelName,
            text: resObj.text,
            latencyMs: duration,
            tokensUsed: Math.round((userPrompt.length + resObj.text.length) / 4),
          };
        } catch (err: any) {
          return {
            modelName,
            text: '',
            latencyMs: Date.now() - start,
            tokensUsed: 0,
            error: err?.message || 'Execution error',
          };
        }
      })
    );

    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Server playground error' });
  }
});
