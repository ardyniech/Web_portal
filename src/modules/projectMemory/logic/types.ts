export interface ArchitectureDecision {
  id: string;
  title: string;
  status: 'accepted' | 'proposed' | 'deprecated';
  decisionDate: string;
  context: string;
  decision: string;
  consequences: string[];
}

export interface ContextChunk {
  id: string;
  title: string;
  category: 'adr' | 'sop' | 'convention' | 'api_contract';
  content: string;
  tokenCount: number;
  tags: string[];
}

export interface ProjectContextIndex {
  totalRules: number;
  estimatedTokensSaved: number;
  adrs: ArchitectureDecision[];
  conventions: ContextChunk[];
}
