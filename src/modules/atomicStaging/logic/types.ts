export interface StagedFileChange {
  filePath: string;
  originalContent?: string;
  stagedContent: string;
  linesDelta: number;
}

export interface StagingTransaction {
  id: string;
  description: string;
  createdAt: string;
  status: 'pending' | 'tested' | 'committed' | 'rolled_back';
  files: StagedFileChange[];
  testPassed: boolean;
  typeCheckPassed: boolean;
  errors?: string[];
}

export interface ModuleTestResult {
  moduleName: string;
  testFilePath: string;
  status: 'passed' | 'failed' | 'skipped';
  durationMs: number;
  assertionsPassed: number;
  message: string;
}

export interface IsolatedSuiteResult {
  targetModules: string[];
  totalExecuted: number;
  passedCount: number;
  failedCount: number;
  durationTotalMs: number;
  results: ModuleTestResult[];
}
