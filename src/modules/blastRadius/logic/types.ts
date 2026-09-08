export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface AffectedModule {
  moduleId: string;
  moduleName: string;
  impactReason: string;
  riskLevel: RiskLevel;
  directDependent: boolean;
}

export interface BlastRadiusResult {
  targetFile: string;
  linesChanged: number;
  totalAffectedModules: number;
  overallRisk: RiskLevel;
  blastScore: number;
  suggestStagedMigration: boolean;
  stagedSteps?: string[];
  affectedModules: AffectedModule[];
  potentialBreakingChanges: string[];
  analyzedAt: string;
}
