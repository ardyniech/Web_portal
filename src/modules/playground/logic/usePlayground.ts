import { useState } from 'react';
import { PromptConfig, ModelResponseResult } from './types';
import { playgroundApi } from '../storage/playgroundApi';

export function usePlayground() {
  const [config, setConfig] = useState<PromptConfig>({
    systemInstruction: 'You are an elite Senior Staff Polyglot Engineer.',
    userPrompt: '',
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    thinkingBudget: 2048,
    safetyThreshold: 'BLOCK_NONE',
    selectedModels: ['gemini-2.5-flash', 'gemini-3.1-flash-lite'],
  });

  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<ModelResponseResult[]>([]);

  const runArena = async () => {
    if (!config.userPrompt.trim()) return;
    setRunning(true);
    try {
      const res = await playgroundApi.runMultiModelArena(config);
      setResults(res);
    } catch (err) {
      console.error('[Module:Playground] Arena execution error:', err);
    } finally {
      setRunning(false);
    }
  };

  return { config, setConfig, running, results, runArena };
}
