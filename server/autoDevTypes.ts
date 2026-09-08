export interface AutoDevStageResult {
  stageId: number;
  stageName: string;
  toolName: string;
  status: 'pending' | 'running' | 'success' | 'warning' | 'failed';
  durationMs: number;
  summary: string;
  details: Record<string, any>;
}

export interface CodeProposalTarget {
  filePath: string;
  action: 'create' | 'edit' | 'refactor';
  description: string;
  codeSnippet: string;
}

export interface AutoDevPipelineRun {
  runId: string;
  taskGoal: string;
  startedAt: string;
  completedAt?: string;
  overallStatus: 'running' | 'completed' | 'failed';
  stages: AutoDevStageResult[];
  commitHash?: string;
  tokensSavedEstimate: number;
  aiCodeProposal?: {
    summary: string;
    commitMessage: string;
    targets: CodeProposalTarget[];
  };
}
