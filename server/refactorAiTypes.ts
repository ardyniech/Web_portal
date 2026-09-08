export interface RefactorFileChange {
  filePath: string;
  refactoredCode: string;
  originalCode?: string;
  reason: string;
  action: 'modify' | 'create';
  validation?: {
    isValid: boolean;
    errors: { line: number; message: string }[];
    warnings: string[];
  };
}

export interface RefactorAiResult {
  title: string;
  summary: string;
  appliedRules: string[];
  refactoredCode: string;
  reason: string;
  dependencyUpdates: { name: string; currentVersion: string; proposedVersion: string }[];
  fileChanges?: RefactorFileChange[];
}
