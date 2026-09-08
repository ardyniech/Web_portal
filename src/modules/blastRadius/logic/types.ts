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
  blastScore: number; // 0 (safest) to 100 (catastrophic)
  suggestStagedMigration: boolean;
  affectedModules: AffectedModule[];
  potentialBreakingChanges: string[];
  analyzedAt: string;
}
