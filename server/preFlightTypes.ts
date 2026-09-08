export type PreFlightSeverity = 'critical' | 'architectural' | 'warning';
export type PreFlightCategory = 'security' | 'architecture' | 'reliability';

export interface PreFlightFileReview {
  filePath: string;
  linesChanged: number;
  status: 'passed' | 'failed' | 'warning';
  issuesCount: number;
}

export interface PreFlightIssue {
  id: string;
  filePath: string;
  lineNumber?: number;
  ruleId: string;
  ruleName: string;
  category: PreFlightCategory;
  severity: PreFlightSeverity;
  message: string;
  codeSnippet?: string;
  proposedFix: string;
  fixable: boolean;
}

export interface PreFlightAuditResult {
  commitHash: string;
  commitMessage: string;
  score: number; // 0 to 100
  status: 'passed' | 'failed' | 'warning';
  summary: string;
  filesReviewed: PreFlightFileReview[];
  issues: PreFlightIssue[];
  auditedAt: string;
  model: string;
}

export interface PreFlightFixResult {
  success: boolean;
  issueId: string;
  filePath: string;
  commitHash: string;
  message: string;
  originalCode?: string;
  fixedCode?: string;
}
