export interface FileCandidate {
  path: string;
  lines: number;
  size: number;
  priority: 'high' | 'medium' | 'normal';
}

export interface RefactorValidation {
  isValid: boolean;
  errors: { line: number; message: string }[];
  warnings: string[];
}

export interface RefactorChange {
  fileName: string;
  originalCode: string;
  refactoredCode: string;
  reason: string;
  action?: 'modify' | 'create';
  validation?: RefactorValidation;
}

export interface RefactorProposal {
  id: string;
  repoFullName: string;
  targetFile?: string;
  commitContext?: string;
  title: string;
  summary: string;
  appliedMemories: string[];
  changes: RefactorChange[];
  dependencyUpdates: { name: string; currentVersion: string; proposedVersion: string }[];
  status: 'proposed' | 'applying' | 'applied';
  lineCountBefore?: number;
  lineCountAfter?: number;
  appliedCommitHash?: string;
}
