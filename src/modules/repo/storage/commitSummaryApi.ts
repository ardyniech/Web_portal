import { CommitItem } from './commitApi';
import { CommitRangeSummary } from '../logic/commitSummaryTypes';

export const commitSummaryApi = {
  async summarizeRange(params: {
    repoFullName: string;
    baseSha: string;
    headSha: string;
    commits: CommitItem[];
  }): Promise<CommitRangeSummary> {
    try {
      const res = await fetch('/api/commits/range-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Gagal menghasilkan ringkasan: ${res.statusText}`);
      }

      return await res.json();
    } catch (err: any) {
      console.error('[Module:repo] Error in summarizeRange:', err?.message || err);
      throw err;
    }
  },
};
