import { CommitItem } from '../storage/commitApi';

export interface KeyChangeItem {
  category: string;
  description: string;
}

export interface CommitRangeSummary {
  title: string;
  overview: string;
  keyChanges: KeyChangeItem[];
  impactLevel: 'Rendah' | 'Sedang' | 'Tinggi';
  impactAnalysis: string;
  releaseNotes: string;
  rawMarkdown: string;
  model: string;
}

export interface CommitRangeSelection {
  baseSha: string;
  headSha: string;
  selectedCommits: CommitItem[];
}
