export interface PromptConfig {
  systemInstruction: string;
  userPrompt: string;
  temperature: number;
  topP: number;
  topK: number;
  thinkingBudget: number;
  safetyThreshold: 'BLOCK_NONE' | 'BLOCK_FEW' | 'BLOCK_MOST';
  selectedModels: string[];
}

export interface ModelResponseResult {
  modelName: string;
  text: string;
  latencyMs: number;
  tokensUsed: number;
  error?: string;
}

export interface FunctionToolDefinition {
  name: string;
  description: string;
  parametersJson: string;
}

export interface SdkExportFormat {
  language: 'python' | 'typescript' | 'curl' | 'go' | 'swift' | 'kotlin';
  code: string;
}
