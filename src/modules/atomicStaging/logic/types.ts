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
