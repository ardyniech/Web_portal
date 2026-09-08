export interface BoundaryViolation {
  id: string;
  sourceFile: string;
  importedTarget: string;
  ruleType: 'cross_module_internal' | 'file_size_exceeded' | 'missing_dispatcher' | 'leaked_dependency';
  severity: 'error' | 'warning';
  message: string;
  line: number;
}

export interface BoundaryReport {
  totalFilesAudited: number;
  violationsCount: number;
  cleanModulesCount: number;
  violations: BoundaryViolation[];
  auditedAt: string;
}

export interface FileComplexityItem {
  filePath: string;
  lineCount: number;
  cyclomaticComplexity: number;
  densityStatus: 'safe' | 'warning' | 'critical';
  cognitiveLoadScore: number;
  suggestedDecomposition: string | null;
}

export interface ComplexityAuditReport {
  totalFiles: number;
  filesApproachingLimit: number;
  criticalMonoliths: number;
  averageComplexity: number;
  files: FileComplexityItem[];
}
