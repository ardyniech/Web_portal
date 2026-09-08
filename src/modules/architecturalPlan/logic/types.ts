export interface PlanFileTarget {
  filePath: string;
  action: 'create' | 'edit' | 'refactor' | 'decouple';
  description: string;
}

export interface PlanPhase {
  phaseId: number;
  title: string;
  objective: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  prerequisites: string[];
  targetFiles: PlanFileTarget[];
  validationCriteria: string[];
  estimatedTimeMinutes: number;
  estimatedTokens: number;
}

export interface ArchitecturalPlanBlueprint {
  planId: string;
  goalTitle: string;
  createdAt: string;
  strategicSummary: string;
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  phases: PlanPhase[];
  safetyGuardrails: {
    maxLinesLimit: number;
    cellularIsolations: string[];
    rollbackCheckpoint: string;
  };
  totalEstimatedTokens: number;
  estimatedTotalMinutes: number;
}
