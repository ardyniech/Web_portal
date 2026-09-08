export interface ArchitectureDecision {
  id: string;
  title: string;
  status: 'accepted' | 'proposed' | 'deprecated';
  decisionDate: string;
  context: string;
  decision: string;
  consequences: string[];
}

export interface ProjectContextIndex {
  totalRules: number;
  estimatedTokensSaved: number;
  adrs: ArchitectureDecision[];
}

export interface HybridSearchResult {
  id: string;
  title: string;
  category: 'feature' | 'symbol' | 'adr' | 'sop' | 'endpoint';
  snippet: string;
  filePath?: string;
  score: number;
}

export interface SubTaskItem {
  id: string;
  title: string;
  assignedRole: 'Architect' | 'Coder' | 'QAReviewer' | 'SecurityAuditor';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  estimatedTokens: number;
}

export interface EpicTask {
  id: string;
  epicTitle: string;
  goal: string;
  createdAt: string;
  subTasks: SubTaskItem[];
  progressPercent: number;
}
