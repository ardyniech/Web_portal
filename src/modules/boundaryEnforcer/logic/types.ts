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
